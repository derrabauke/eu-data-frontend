import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LoginController extends Controller {
  @service session;

  @action
  async login(e) {
    e.preventDefault();
    const username = e.target['username'].value;
    const password = e.target['password'].value;
    const dbUrl = e.target['db-url'].value;
    try {
      await this.session.login(username, password, dbUrl);
    } catch (e) {
      console.error(e);
    }
  }
}
