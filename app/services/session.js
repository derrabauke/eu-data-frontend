import Service from '@ember/service';
import { inject as service } from '@ember/service';
import * as neo4j from 'neo4j-driver';
import { SESSION_EXPIRED } from 'neo4j-driver';

export default class SessionService extends Service {
  @service cookies;
  @service router;

  options = {
    path: window.location.hostname,
  };

  get isAuthenticated() {
    return (
      this.cookies.exists('db-url', this.options) &&
      this.cookies.exists('username', this.options) &&
      this.cookies.exists('password', this.options)
    );
  }

  initDriver() {
    if (!this.driver) {
      const username = this.cookies.read('username');
      const password = this.cookies.read('password');
      const dbUrl = this.cookies.read('db-url');

      this.driver = neo4j.driver(dbUrl, neo4j.auth.basic(username, password));
    }
  }

  async verifySession() {
    this.initDriver();
    const sessionState = await this.driver.verifyConnectivity();
    if (sessionState === SESSION_EXPIRED) {
      this.driver.session();
    } else {
      throw new Error(sessionState);
    }
  }

  async validate() {
    if (!this.isAuthenticated) {
      return Promise.reject('Credentials not sufficient!');
    }
    try {
      await this.verifySession();
      return Promise.resolve('Successfully validated!');
    } catch (e) {
      console.error(e);
      return Promise.reject(
        'Some went wrong while validating the DB connectiviy.'
      );
    }
  }

  async login(username, password, dbUrl) {
    this.cookies.write('username', username, this.options);
    this.cookies.write('password', password, this.options);
    this.cookies.write('db-url', dbUrl, this.options);
    try {
      await this.validate();
      this.router.transitionTo(
        this.cookies.read('redirect-target') ?? 'editor'
      );
    } catch (e) {
      console.log('Session could not be validated!');
    }
  }

  async logout() {
    this.cookies.clear('password', this.options);
    await this.driver.close();
  }

  redirectTarget(target) {
    this.cookies.write('redirect-target', target ?? 'editor', this.options);
    return this.cookies.read('redirect-target');
  }
}
