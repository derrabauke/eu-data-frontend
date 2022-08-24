import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class SearchBarComponent extends Component {
  @service session;
  @service('render-settings') renderService;

  @action
  async logout() {
    await this.session.logout();
  }
}
