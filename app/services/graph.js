import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { cypherToGraph } from 'graphology-neo4j';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { restartableTask } from 'ember-concurrency';

import { buildQuery, QUERIES } from '../queries/queries';

export default class GraphService extends Service {
  @service session;
  @service router;

  @tracked _queryId = 1;
  @tracked _overrides = {};

  queries = QUERIES;

  latestGraph = trackedTask(this, this.fetchGraph, () => [this.query]);

  set queryId(queryId) {
    this._queryId = queryId?.id ?? queryId;
    this._overrides = {};
    this.fetchGraph.perform();
  }

  get queryId() {
    return this._queryId;
  }

  get queryOverrides() {
    return this._overrides;
  }

  @action
  overrideQueryVariable(key, value) {
    this._overrides[key] = value;
  }

  @restartableTask
  *fetchGraph() {
    const queryString = buildQuery(this.queryId, this.overrides);

    const driver = this.session.driver;
    const graph = yield cypherToGraph({ driver }, queryString);

    return graph;
  }
}
