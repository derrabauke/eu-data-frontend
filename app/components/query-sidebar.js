import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';
import { timeout } from 'ember-concurrency';

export default class QuerySidebarComponent extends Component {
  @service graph;

  get queries() {
    return this.graph.queries;
  }

  get selectedQueryId() {
    return this.graph.queryId;
  }

  get queryVariables() {
    return this.graph.query?.variables;
  }

  @restartableTask
  *overrideQueryVariable(key, event) {
    // debounce user input
    yield timeout(500);
    this.graph.overrideQueryVariable(key, event.target.value);
  }

  @action
  selectQuery(event) {
    event.preventDefault();
    this.graph.queryId = event.target.value;
  }
}
