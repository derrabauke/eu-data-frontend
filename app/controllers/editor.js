import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class EditorController extends Controller {
  @service graph;
}
