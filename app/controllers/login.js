import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class LoginController extends Controller {
  @service session;

  @action
  async login(e) {
    e.preventDefault();
    const username = e.target['username'].value;
    const password = e.target['password'].value;
    try {
      await this.session.login(username, password);
    } catch (e) {
      console.error(e);
    }
  }
}
