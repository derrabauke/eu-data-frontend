import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';
import { timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class QuerySidebarComponent extends Component {
  @service('query') queryService;

  @tracked show = false;

  get queries() {
    return this.queryService.queries;
  }

  get selectedQueryId() {
    return this.queryService.queryId;
  }

  get queryVariables() {
    return this.queryService.query?.variables;
  }

  @restartableTask
  *overrideQueryVariable(key, event) {
    // debounce user input
    yield timeout(500);
    this.queryService.overrideQueryVariable(key, event.target.value);
  }

  @action
  selectQuery(event) {
    event.preventDefault();
    this.queryService.queryId = event.target.value;
  }
}
