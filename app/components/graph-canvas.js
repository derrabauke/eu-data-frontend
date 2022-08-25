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
import { TrackedSet } from 'tracked-built-ins';

import {
  colorizeByLabel,
  LABEL_MAPPING,
  // logStatements,
  logPerformancenEnd,
  logPerformancenStart,
  nodeSizeByDegree,
} from './../utils/graphUtils';

export default class GraphCanvasComponent extends Component {
  @service('query') queryService;
  @service('render-settings') renderService;

  @tracked hoveredEdge = null;
  @tracked hoverNode = null;
  @tracked _highlightColor = '#2ea';
  hoveredNeighbors = new TrackedSet();

  constructor(...args) {
    super(...args);

    this.graph = new Graph({ multi: true, allowSelfLoops: true });
  }

  get highlightColor() {
    return this._highlightColor;
  }

  @action
  setupCanvas(element) {
    this.canvas = element;
  }

  @restartableTask
  *rendererForGraph(...args) {
    const skipInitialization = args[2].skipInitialization;
    // debounce any rendering request
    yield timeout(800);

    if (!this.args.graph) {
      console.error('No graph data to render!');
      return;
    }

    // track performance for this processing
    logPerformancenStart('layout');

    if (!skipInitialization) {
      //clear all existing edgese and nodes from the graph
      // !This deletes all computed properties and layouts as well!
      this.graph.clear();
      // import graph data to graphology graph object
      yield this.graph.import(this.args.graph);

      // map nodes for search operations
      this.renderService.setGraphNodes(
        this.graph.mapNodes((_, attributes) => {
          return { ...attributes, name: attributes.title ?? attributes.name };
        })
      );

      // add random circular coordinates for every node
      // they need to be assigned as a starting point
      this.graph.size > 50
        ? random.assign(this.graph)
        : circular.assign(this.graph);
    }

    // ontop of the random starting coordinates the forceAtlas2
    // layout algorithm will be performed
    if (this.faLayout && this.faLayout.isRunning()) {
      this.faLayout.kill();
    }

    // make the graph more visually comprehensible
    this._highlightColor = colorizeByLabel(this.graph);

    if (this.graph.directedSize > 0) {
      nodeSizeByDegree(this.graph);
    }

    // TODO: Implement generic filters in sidebar
    // this.graph.filterEdges((edge, atts) => {
    //   const gt15 = atts.weight?.low > 15;
    //   if (gt15) logStatements(atts.weight.low);
    //   return gt15;
    // });

    // TODO: Node Filter
    // this.graph.filterNodes(callback)

    // run layout algorithm according to graph settings
    // if (this.queryService.layoutAlgorithm === 'louvain') {
    //   louvain.assign(this.graph);
    // } else {
    const sensibleSettings = forceAtlas2.inferSettings(this.graph);
    this.faLayout = new FA2Layout(this.graph, {
      iterations: this.renderService.configuration.iterations,
      settings: {
        ...sensibleSettings,
        ...this.renderService.configuration.settings,
      },
    });

    this.faLayout.start();

    // reserve some time for layouting depeding on graph size
    yield timeout(Math.log(this.graph.size) * 1000);

    this.faLayout.stop();
    // }

    // Measure performance for layout processing
    logPerformancenEnd('layout');

    if (!this.renderer) {
      // setup Sigma renderer
      this.renderer = new Sigma(this.graph, this.canvas, {
        enableEdgeClickEvents: true,
        enableEdgeHoverEvents: 'debounce',
        edgeLabelSize: 20,
        edgeReducer: this.edgeReducerFunction.bind(this),
        nodeReducer: this.nodeReducerFunction.bind(this),
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
    renderer.on('clickNode', ({ node }) => {
      this.selectNode(node);
      renderer.refresh();
    });

    renderer.on('enterNode', ({ node }) => {
      this.setHoverNode(node);
      renderer.refresh();
    });
    renderer.on('leaveNode', () => {
      this.setHoverNode(null);
      renderer.refresh();
    });

    renderer.on('enterEdge', ({ edge }) => {
      this.setHoverEdge(edge);
      renderer.refresh();
    });
    renderer.on('leaveEdge', () => {
      this.setHoverEdge(null);
      renderer.refresh();
    });
  }

  nodeReducerFunction(node, data) {
    const res = { ...data };
    res.label =
      data[LABEL_MAPPING[data['@labels'][0]]] ?? data.title ?? data.name;

    if (
      this.hoverNode &&
      this.hoveredNeighbors &&
      !this.hoveredNeighbors.has(node) &&
      this.hoverNode !== node
    ) {
      res.label = '';
      // res.hidden = true;
      res.color = '#cecece';
    } else if (this.hoverNode === node) {
      res.highlighted = true;
      res.color = '#0E9F6E';
    }
    return res;
  }

  edgeReducerFunction(edge, data) {
    const res = { ...data };

    if (this.hoverNode) {
      if (!this.graph.hasExtremity(edge, this.hoverNode)) {
        res.hidden = true;
      } else {
        res.color = '#4d4d4d';
      }
    }

    res.label = data['@type'];
    res.size = data.weight?.low
      ? Math.max(1, Math.log(data.weight.low)) * 2
      : res.size;
    if (edge === this.hoveredEdge) res.color = '#cc0000';

    return res;
  }

  setHoverNode(node) {
    if (node) {
      this.hoverNode = node;
      this.hoveredNeighbors = new TrackedSet(this.graph.neighbors(node));
    } else {
      this.hoverNode = null;
      this.hoveredNeighbors = new TrackedSet();
    }
    this.renderer.refresh();
  }

  setHoverEdge(edge) {
    if (edge) {
      this.renderService.hoverEdge = this.renderer.getEdgeDisplayData(edge);
      this.hoveredEdge = edge;
    } else {
      this.renderService.hoverEdge = null;
      this.hoveredEdge = null;
    }
  }

  selectNode(id) {
    this.renderService.selectedNode = this.renderer.getNodeDisplayData(id);
  }

  @restartableTask
  *focusNode() {
    const nodeId = this.renderService.selectedNode?.['@id'];
    if (!nodeId) {
      return;
    }
    while (this.rendererForGraph.isRunning) {
      yield timeout(500);
    }
    this.setHoverNode(nodeId);
    const nodeData = this.renderer.getNodeDisplayData(nodeId);
    this.renderer.getCamera().animate(nodeData, {
      duration: 500,
    });
  }
}
