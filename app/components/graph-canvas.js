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
  logPerformancenEnd,
  logPerformancenStart,
  nodeSizeByDegree,
} from './../utils/graphUtils';

export default class GraphCanvasComponent extends Component {
  @service('graph') graphService;

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

    const sensibleSettings = forceAtlas2.inferSettings(this.graph);
    this.faLayout = new FA2Layout(this.graph, {
      iterations: 50,
      settings: { ...sensibleSettings, gravity: 10 },
    });

    this.faLayout.start();

    yield timeout(Math.log(this.graph.size) * 1000);

    this.faLayout.stop();

    // Measure performance for layout processing
    logPerformancenEnd('layout');

    colorizeByLabel(this.graph);
    nodeSizeByDegree(this.graph);

    if (!this.renderer) {
      this.renderer = new Sigma(this.graph, this.canvas, {
        enableEdgeClickEvents: true,
        enableEdgeHoverEvents: 'debounce',
        edgeLabelSize: 20,
        edgeReducer: (edge, data) => {
          const res = { ...data };
          res.label = data['@type'];
          res.size = data.weight?.low
            ? Math.max(1, Math.log(data.weight.low)) * 2
            : res.size;
          if (edge === this.hoveredEdge) res.color = '#cc0000';
          return res;
        },
        nodeReducer: (node, data) => {
          const res = { ...data };
          res.label = data.name;
          return res;
        },
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
