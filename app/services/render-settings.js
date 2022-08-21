import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { loggingStatus, toggleLogging } from '../utils/graphUtils';
import { action } from '@ember/object';

export default class RenderSettingsService extends Service {
  @tracked searchTerm = '';

  @tracked gravity = 2;
  @tracked scalingRatio = 5;
  @tracked barnesHutOptimize = true;
  @tracked barnesHutTheta = 2;
  @tracked linLogMode = true;
  @tracked edgeWeightInfluence = 0;
  @tracked iterations = 50;

  @tracked filterEdgeWeight = false;
  @tracked filterEdgeWeightValue = 30;

  @tracked logging = loggingStatus();

  get configuration() {
    return {
      searchTerm: this.searchTerm,
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
  toggleLogs() {
    this.logging = toggleLogging();
  }
}
