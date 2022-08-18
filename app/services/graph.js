import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { tracked as trackedBuiltIn } from 'tracked-built-ins';
import { action } from '@ember/object';
import { cypherToGraph } from 'graphology-neo4j';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { restartableTask } from 'ember-concurrency';

import { buildQuery, getRegisteredQueryFromId, QUERIES } from '../queries/queries';

export default class GraphService extends Service {
  @service session;
  @service router;

  @tracked _queryId = 0;
  _overrides = trackedBuiltIn({});

  queries = QUERIES;

  latestGraph = trackedTask(this, this.fetchGraph, () => [this.query]);

  set queryId(queryId) {
    this._queryId = queryId?.id ?? queryId;
    this._overrides = {};
    this.fetchGraph.perform();
  }

  get query() {
    return getRegisteredQueryFromId(this.queryId);
  }

  get queryId() {
    return this._queryId;
  }

  get queryOverrides() {
    return this._overrides;
  }

  get queryString() {
    return buildQuery(this.queryId, this.queryOverrides);
  }

  @action
  overrideQueryVariable(key, value) {
    this._overrides[key] = value;
  }

  @restartableTask
  *fetchGraph() {
    const driver = this.session.driver;
    const graph = yield cypherToGraph({ driver }, this.queryString);

    return graph;
  }
}
