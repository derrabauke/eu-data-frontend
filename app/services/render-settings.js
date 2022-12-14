import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { loggingStatus, toggleLogging } from '../utils/graphUtils';
import { action } from '@ember/object';

export default class RenderSettingsService extends Service {
  @tracked searchTerm = '';
  @tracked selectedNode;
  @tracked hoverEdge;
  _graphNodes = [];

  @tracked gravity = 1;
  @tracked scalingRatio = 5;
  @tracked barnesHutOptimize = false;
  @tracked barnesHutTheta = 1;
  @tracked linLogMode = false;
  @tracked edgeWeightInfluence = 1;
  @tracked iterations = 30;

  @tracked filterEdgeWeight = false;
  @tracked filterEdgeWeightValue = 30;

  @tracked logging = loggingStatus();

  get configuration() {
    return {
      iterations: this.iterations,
      settings: {
        gravity: this.gravity,
        //Pulls the network more appart
        scalingRatio: this.scalingRatio,
        // separates the hubs further apart
        barnesHutOptimize: this.barnesHutOptimize,
        // increase count of hubs for the internal quadtrees
        barnesHutTheta: this.barnesHutTheta,
        edgeWeightInfluence: this.edgeWeightInfluence,
        linLogMode: this.linLogMode,
      },
    };
  }

  @action
  setGraphNodes(nodes) {
    this._graphNodes = nodes;
  }

  @action
  searchResults(searchTerm) {
    if (!searchTerm) return this._graphNodes;
    const term = searchTerm.toLowerCase();
    return this._graphNodes.filter(
      (node) => node.name.toLowerCase().indexOf(term) !== -1
    );
  }

  @action
  toggleLogs() {
    this.logging = toggleLogging();
  }

  @action
  reset() {
    this.selectedNode = null;
    this.hoverEdge = null;
  }
}
