import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class SessionService extends Service {
  @service cookies;
  @service router;

  options = {
    path: window.location.hostname
  }

  get isAuthenticated() {
    return (!!this.cookies.read('username') && !!this.cookies.read('password'));
  }

  async validate() {
    if (!this.cookies.exists('password', this.options)) {
      return Promise.reject('No Password provided!');
    }
    const username = this.cookies.read('username');
    const password = this.cookies.read('password');

    // TODO: login logic
    console.log('username', username);
    return Promise.resolve('Successfully validated!');
  }

  async login(username, password) {
    this.cookies.write('username', username, this.options);
    this.cookies.write('password', password, this.options);
    try {
      await this.validate();
      this.router.transitionTo(
        this.cookies.read('redirect-target') ?? 'editor'
      );
    } catch (e) {
      console.log('Session could not be validated!');
    }
  }

  logout() {
    this.cookies.clear('password', this.options);
  }

  redirectTarget(target) {
    this.cookies.write('redirect-target', target ?? 'editor', this.options);
    return this.cookies.read('redirect-target');
  }
}
