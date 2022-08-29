const taggedTemplate = (strings, ...keys) => {
  return (...values) => {
    const dict = values[values.length - 1] || {};
    const result = [strings[0]];
    keys.forEach((key, i) => {
      const value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join('');
  };
};

export const getRegisteredQueryFromId = (queryId) => {
  if (!queryId) {
    return QUERIES[0];
  }
  const query = QUERIES.find((query) => `${query.id}` === `${queryId}`);
  if (!query) {
    throw new Error('Could not find a registered query with the given ID.');
  }
  return query;
};

/**
 @param template String The taggedTemplate function
 @param def Object An object of default variable values
 @param overrides Object Overrides for default variables in form of { varName: "valueX" }
 Build the final query string from a template with filled in variables.
 **/
const _buildQuery = (template = '', defaults = {}, overrides = {}) => {
  let variables = {};
  Object.keys(defaults).forEach((variableName) => {
    variables[variableName] =
      overrides[variableName] ?? defaults[variableName].value;
  });
  return template(variables);
};

/** 
 * Build a query string from a template combined with the given variable overrides.
 * Submit the overrides in form of { variableName: valueX }
 @param queryId String The ID of the registered query
 @param overrides Object An object containing overrides for the query variables
**/
export const buildQuery = (queryId, overrides) => {
  const query = getRegisteredQueryFromId(queryId);
  return _buildQuery(query.template, query.variables, overrides);
};

export const QUERIES = [
  {
    id: '-1',
    label: 'DB Schema Visualization',
    description:
      'This shows the database schema which results from all the existing relantionships and entities in the database.',
    template: taggedTemplate`CALL db.schema.visualization()`,
  },
  {
    id: '0',
    label: 'Generic Test Query',
    description:
      'This displays all entities with a relatioship to another entity.',
    template: taggedTemplate`MATCH (n)-[r]->(m) RETURN n,r,m LIMIT ${'limit'}`,
    variables: {
      limit: {
        label: 'Limit result count for query',
        value: '100',
      },
    },
  },
  {
    id: '1',
    label: 'Cooperating Organizations',
    description:
      'Renders the given amount of cooperations between organizations.',
    template: taggedTemplate`MATCH (a:Organization)-[c:COOPERATES]-(b:Organization) RETURN a,b,c LIMIT ${'limit'}`,
    variables: {
      limit: {
        label: 'Limit result count for query',
        value: '1000',
      },
    },
  },
  {
    id: '2',
    label: 'Non solitaire Organizations',
    description: 'All organizations with more than x cooperation partners.',
    template: taggedTemplate`MATCH (a:Organization)-->(b:EuProject)<--(c:Organization)
      WITH a, b, count(b) as coops, collect(c) as coop_partners
      WHERE coops > ${'cooperationsCount'}
      RETURN a, b,coops, coop_partners LIMIT ${'limit'}`,
    variables: {
      limit: {
        label: 'Limit result count for query',
        value: '100',
      },
      cooperationsCount: {
        label: 'Minimum number of cooperations a organization needs to have',
        value: '3',
      },
    },
  },
  {
    id: '3',
    label: 'Spanning tree: Organizations participating on a project',
    description:
      'Shows a spanning tree, where Organizations cooperated together on a single project.',
    template: taggedTemplate`MATCH (p:Organization)
      CALL apoc.path.spanningTree(p, {
	    relationshipFilter: "PARTICIPATE>|<PARTICIPATE",
	    minLevel: 1,
	    maxLevel: ${'maxLevel'}
      })
      YIELD path
      RETURN path LIMIT ${'limit'};`,
    variables: {
      limit: {
        label: 'Limit number of paths displayed',
        value: '100',
      },
      maxLevel: {
        label: 'Maximum count of hops between entities',
        value: '3',
      },
    },
  },
  {
    id: '4',
    label:
      'Master-Call: Cooperations of Organizations participating on a project with certain master call.',
    description:
      'Render cooperations between organizations on projects with a master call containing the given search term.',
    template: taggedTemplate`MATCH (a:Organization)-[c:COOPERATES]-(b:Organization)
      WITH a,c,b
      MATCH (a)-[part:PARTICIPATE]-(p:EuProject) 
      WHERE p.masterCall CONTAINS ${'masterCall'};
      RETURN a,c,b,part,p
      LIMIT ${'limit'}`,
    variables: {
      limit: {
        label: 'Limit number of matched relationships.',
        value: '100',
      },
      masterCall: {
        label:
          'Search for cooperations on projects connected to a certain master call.',
        value: 'H2020',
      },
    },
  },
];

export default { buildQuery, getRegisteredQueryFromId, QUERIES };
