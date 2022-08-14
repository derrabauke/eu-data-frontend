import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ProtectedRoute extends Route {
  @service session;
  @service router;

  async beforeModel(transition) {
    if (!this.session.isAuthenticated && (await this.session.validate())) {
      const target = transition.to.name;
      this.session.redirectTarget(target ?? 'editor');
      this.router.transitionTo('login');
    }
  }
}
