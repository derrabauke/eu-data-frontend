import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { tracked as trackedBuiltIn } from 'tracked-built-ins';
import { action } from '@ember/object';
import { cypherToGraph } from 'graphology-neo4j';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { restartableTask, timeout } from 'ember-concurrency';

import {
  buildQuery,
  getRegisteredQueryFromId,
  QUERIES,
} from '../queries/queries';

export default class GraphService extends Service {
  @service session;
  @service router;

  @tracked _queryId;
  _overrides = trackedBuiltIn({});

  queries = QUERIES;

  latestGraph = trackedTask(this, this.fetchGraph, () => [
    this._queryId,
    this._overrides,
    this.queryString,
  ]);

  set queryId(queryId) {
    this._queryId = queryId?.id ?? queryId;
    this._overrides = trackedBuiltIn({});
  }

  get queryId() {
    return this._queryId;
  }

  get query() {
    return getRegisteredQueryFromId(this.queryId);
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
    // debounce as it is a restartable task
    yield timeout(50);

    // measure performance for fetching the query results
    performance.clearMarks();
    performance.mark('query-start');

    const driver = this.session.driver;
    const graph = yield cypherToGraph({ driver }, this.queryString);

    // performance
    performance.mark('query-end');
    const duration =
      performance.measure('Query fetching results', 'query-start', 'query-end')
        .duration / 1000;
    console.log(`Fetching query results took: ${duration.toFixed(5)} seconds.`);
    performance.clearMarks();

    return graph;
  }
}
