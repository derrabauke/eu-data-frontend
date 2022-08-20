import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Graph from 'graphology';
import Sigma from 'sigma';
import { circular, random } from 'graphology-layout';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import FA2Layout from 'graphology-layout-forceatlas2/worker';
import { restartableTask } from 'ember-concurrency';
import { timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

import {
  colorizeByLabel,
  LABEL_MAPPING,
  logPerformancenEnd,
  logPerformancenStart,
  nodeSizeByDegree,
} from './../utils/graphUtils';

export default class GraphCanvasComponent extends Component {
  @service('query') queryService;
  @service('render-settings') renderService;

  @tracked hoveredEdge = null;

  constructor(...args) {
    super(...args);

    this.graph = new Graph({ multi: true, allowSelfLoops: true });
  }

  @action
  setupCanvas(element) {
    this.canvas = element;
  }

  @restartableTask
  *rendererForGraph() {
    if (!this.args.graph) {
      console.error('No graph data to render!');
      return;
    }

    // track performance for this processing
    logPerformancenStart('layout');

    //clear all existing edgese and nodes from the graph
    // !This deletes all computed properties and layouts as well!
    this.graph.clear();
    // import graph data to graphology graph object
    yield this.graph.import(this.args.graph);

    // add random circular coordinates for every node
    // they need to be assigned as a starting point
    this.graph.size > 50
      ? random.assign(this.graph)
      : circular.assign(this.graph);

    // ontop of the random starting coordinates the forceAtlas2
    // layout algorithm will be performed
    if (this.faLayout && this.faLayout.isRunning()) {
      this.faLayout.kill();
    }

    // make the graph more visually comprehensible
    colorizeByLabel(this.graph);
    if (this.graph.directedSize > 0) {
      nodeSizeByDegree(this.graph);
    }

    // run layout algorithm according to graph settings
    // if (this.queryService.layoutAlgorithm === 'louvain') {
    //   louvain.assign(this.graph);
    // } else {
    const sensibleSettings = forceAtlas2.inferSettings(this.graph);
    this.faLayout = new FA2Layout(this.graph, {
      iterations: this.renderService.iterations,
      settings: {
        ...sensibleSettings,
        ...this.renderService.renderSettings,
      },
    });

    this.faLayout.start();

    // reserve some time for layouting depeding on graph size
    yield timeout(Math.log(this.graph.size) * 1000);

    this.faLayout.stop();
    // }

    // Measure performance for layout processing
    logPerformancenEnd('layout');

    // nodeSizeByDegree(this.graph);

    if (!this.renderer) {
      const edgeReducer = (edge, data) => {
        const res = { ...data };
        res.label = data['@type'];
        res.size = data.weight?.low
          ? Math.max(1, Math.log(data.weight.low)) * 2
          : res.size;
        if (edge === this.hoveredEdge) res.color = '#cc0000';
        return res;
      };

      const nodeReducer = (node, data) => {
        const res = { ...data };
        res.label =
          data[LABEL_MAPPING[data['@labels'][0]]] ?? data.title ?? data.name;
        return res;
      };

      // setup Sigma renderer
      this.renderer = new Sigma(this.graph, this.canvas, {
        enableEdgeClickEvents: true,
        enableEdgeHoverEvents: 'debounce',
        edgeLabelSize: 20,
        edgeReducer: edgeReducer,
        nodeReducer: nodeReducer,
        label: { attributes: 'name' },
        labelSize: 25,
        renderLabels: true,
        renderEdgeLabels: true,
      });
      this.attachEventListeners(this.renderer);
    } else {
      this.renderer.refresh();
    }
  }

  attachEventListeners(renderer) {
    const setHoverEdge = (edge) => {
      this.hoveredEdge = edge;
    };

    renderer.on('enterEdge', ({ edge }) => {
      setHoverEdge(edge);
      renderer.refresh();
    });
    renderer.on('leaveEdge', ({ edge }) => {
      setHoverEdge(null);
      renderer.refresh();
    });
  }
}
