import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Graph from 'graphology';
import Sigma from 'sigma';
import { circular } from 'graphology-layout';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import FA2Layout from 'graphology-layout-forceatlas2/worker';
import { restartableTask } from 'ember-concurrency';
import { timeout } from 'ember-concurrency';

export default class GraphCanvasComponent extends Component {
  @service ('graph') graphService;

  constructor(...args) {
    super(...args);

    this.graph = new Graph({ multi: true });
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
    performance.clearMarks();
    performance.mark('layout-start');

    //clear all existing edgese and nodes from the graph
    // !This deletes all computed properties and layouts as well!
    this.graph.clear();
    // import graph data to graphology graph object
    yield this.graph.import(this.args.graph);

    // add random circular coordinates for every node
    // they need to be assigned as a starting point
    circular.assign(this.graph);

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

    yield timeout(5000);

    this.faLayout.stop();

    // Measure performance for layout processing
    performance.mark('layout-end');
    let duration = performance.measure(
      'Layout Computation Duration',
      'layout-start',
      'layout-end'
    ).duration;
    duration = duration / 1000 - 5;
    console.log(
      `Layout processing took: ${duration.toFixed(
        5
      )} seconds (excluding 5 secs artificial timeout)`
    );
    performance.clearMarks();

    if (!this.renderer) {
      this.renderer = new Sigma(this.graph, this.canvas);
    } else {
      this.renderer.refresh();
    }
  }
}
