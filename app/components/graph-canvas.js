import Component from '@glimmer/component';
import { action } from '@ember/object';
import Graph from 'graphology';
import Sigma from 'sigma';
// import { Coordinates, EdgeDisplayData, NodeDisplayData } from 'sigma/types';
import { circular } from 'graphology-layout';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { restartableTask } from 'ember-concurrency';
// import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
// import {tracked} from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';

export default class GraphCanvasComponent extends Component {
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

    // set a timeout before graph algorithm blocks runloop
    // so the loading spinner will display
    yield timeout(250);

    console.log('current graph args', this.args.graph);

    let graph = new Graph();
    console.log('Importing graph data into new graphology graph');
    yield graph.import(this.args.graph);

    // add random circular coordinates for every node
    // they need to be assigned as a starting point
    circular.assign(graph);
    // ontop of the random starting coordinates the forceAtlas2
    // layout algorithm will be performed
    console.log('Starting forceAtlas2 layout process...');
    yield forceAtlas2.assign(graph, {
      iterations: 50,
      settings: {
        gravity: 10,
      },
    });

    console.log('Finished layout process');
    console.log('Resulting graph', graph);

    // THIS COULD BE USED FOR BETTER TUNING THE LAYOUT SETTIN
    // // THIS COULD BE USED FOR BETTER TUNING THE LAYOUT SETTINGS
    // const sensibleSettings = forceAtlas2.inferSettings(graph);
    // const positions = forceAtlas2(graph, {
    //   iterations: 50,
    //   settings: sensibleSettings,
    // });

    // console.log("positions", positions);
    return new Sigma(graph, this.canvas);
  }
}
