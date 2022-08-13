import EmberRouter from '@ember/routing/router';
import config from 'eu-data-frontend/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('login');
  this.route('protected', { path: '/app' }, function () {
    this.route('editor', { resetNamespace: true });
  });
});
