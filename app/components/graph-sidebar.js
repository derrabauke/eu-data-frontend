import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class GraphSidebarComponent extends Component {
  @service('render-settings') renderService;

  @tracked show = false;

  @action
  updateSetting(property, event) {
    this.renderService[property] = parseFloat(event.target.value);
  }

  @action
  updateCheckbox(property, event) {
    this.renderService[property] = Boolean(event.target.checked);
  }
}
