import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class InfoBoxComponent extends Component {
  @service('render-settings') renderService;

  get node() {
    return this.renderService.selectedNode;
  }

  get isOrg() {
    const labels = this.node?.['@labels'];
    return this.node.label != 'Organization' && labels.includes('Organization');
  }

  get nodeAttributes() {
    const labels = this.node?.['@labels'];
    if (labels.includes('Organization')) {
      return {
        labels,
        ...this.node,
      };
    }
    return { ...this.node };
  }
}
