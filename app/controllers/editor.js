import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import Graph from 'graphology';
// import Sigma from 'sigma';
// import { Coordinates, EdgeDisplayData, NodeDisplayData } from 'sigma/types';
// import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
// import { task } from 'ember-concurrency';

export default class EditorController extends Controller {
  @service graph;

  constructor(...args) {
    super(...args);

    this.canvas = document.getElementById('canvas');
    this.localGraph = new Graph();

    this.graph.fetchGraph.perform();
  }
}
