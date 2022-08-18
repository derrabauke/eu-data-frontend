import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { lastValue } from 'ember-concurrency';
import { cypherToGraph } from 'graphology-neo4j';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import {restartableTask} from 'ember-concurrency';

const QUERIES = [
  {
    value: 'MATCH (n)-[r]->(m) RETURN n,r,m LIMIT 100',
    label: 'Query 1',
  },
  {
    value: 'MATCH (n)-[r]->(m) RETURN n,r,m LIMIT 100',
    label: 'Query 2',
  },
];

export default class GraphService extends Service {
  @service session;
  @service router;

  @tracked _query;

  queries = QUERIES;

  @lastValue('fetchGraph') latest;
  latestGraph = trackedTask(this, this.fetchGraph, () => [this.query]);

  set query(query) {
    this._query = query;
    this.fetchGraph.perform();
  }

  get query() {
    return this._query;
  }

  @restartableTask
  *fetchGraph() {
    console.log('fetching graph');
    const driver = this.session.driver;
    const graph = yield cypherToGraph(
      { driver },
      'MATCH (n)-[r]->(m) RETURN n,r,m LIMIT 100'
    );

    return graph;
  }
}
