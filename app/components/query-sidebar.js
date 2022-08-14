import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class QuerySidebarComponent extends Component {
  @service graph;

  get queries() {
    return this.graph.queries;
  }

  @action
  selectQuery(event) {
    event.preventDefault();
    this.graph.query = event.target.value;
  }
}
