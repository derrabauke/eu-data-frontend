import Service from '@ember/service';
import { inject as service } from '@ember/service';
import * as neo4j from 'neo4j-driver';
import { SESSION_EXPIRED } from 'neo4j-driver';
import { TrackedObject } from 'tracked-built-ins';

export default class SessionService extends Service {
  @service cookies;
  @service router;

  _driver;

  options = {
    path: window.location.hostname,
    SameSite: 'Strict',
  };

  get isAuthenticated() {
    return (
      this.cookies.exists('db-url', this.options) &&
      this.cookies.exists('username', this.options) &&
      this.cookies.exists('password', this.options)
    );
  }

  get driver() {
    if (!this._driver && this.isAuthenticated) {
      this.initDriver();
    }
    return this._driver;
  }

  initDriver() {
    const username = this.cookies.read('username');
    const password = this.cookies.read('password');
    const dbUrl = this.cookies.read('db-url');

    this._driver = new TrackedObject(
      neo4j.driver(dbUrl, neo4j.auth.basic(username, password))
    );
  }

  async verifySession() {
    try {
      await this.driver.verifyConnectivity();
    } catch (e) {
      if (e === SESSION_EXPIRED) {
        this.driver.session();
      } else {
        console.error(e);
      }
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
    this.cookies.clear('username', this.options);
    this.cookies.clear('db-url', this.options);
    await this.driver?.close();
    this.router.transitionTo('login');
  }

  redirectTarget(target) {
    this.cookies.write('redirect-target', target ?? 'editor', this.options);
    return this.cookies.read('redirect-target');
  }
}
