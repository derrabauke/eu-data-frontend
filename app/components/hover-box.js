import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class HoverBoxComponent extends Component {
  @service('render-settings') renderService;

  @tracked box;

  @action
  initBox(element) {
    this.box = element;
    document
      .getElementsByTagName('body')[0]
      .addEventListener('mousemove', this.updateBox);
  }

  willDestroy(...args) {
    super.willDestroy(...args);

    document
      .getElementsByTagName('body')[0]
      .removeEventListener('mousemove', this.updateBox);
  }

  get edge() {
    return this.renderService.hoverEdge;
  }

  @action
  updateBox(e) {
    const x = e.clientX,
      y = e.clientY;

    this.box.style.top = y + 'px';
    this.box.style.left = x + 'px';
  }
}
