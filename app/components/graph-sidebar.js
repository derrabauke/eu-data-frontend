import Component from '@glimmer/component';
// import { inject as service } from '@ember/service';
// import { action } from '@ember/object';
// import { restartableTask } from 'ember-concurrency';
// import { timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class GraphSidebarComponent extends Component {
  // @service graph;

  @tracked show = false;
}
