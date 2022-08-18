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
  const query = QUERIES.find((query) => `${query.id}` === `${queryId}`);
  if (!query) {
    throw new Error('Could not find a registered query with the given ID.');
  }
  return query;
}

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
    id: 0,
    value: 'MATCH (n)-[r]->(m) RETURN n,r,m LIMIT 100',
    label: 'Query 1',
    template: taggedTemplate`MATCH (n)-[r]->(m) RETURN n,r,m LIMIT ${'limit'}`,
    variables: {
      limit: {
        label: 'Limit result count for query',
        value: '100',
      },
    },
  },
  {
    id: 1,
    value: 'MATCH (n)-[r]->(m) RETURN n,r,m LIMIT 100',
    label: 'Query 2',
    template: taggedTemplate`MATCH (n)-[r]->(m) RETURN n,r,m LIMIT ${'limit'}`,
    variables: {
      limit: {
        label: 'Limit result count for query',
        value: '100',
      },
    },
  },
];

export default { buildQuery, getRegisteredQueryFromId, QUERIES };
