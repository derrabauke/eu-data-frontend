import iwanthue from 'iwanthue';

export const LABEL_MAPPING = {
  Organization: 'name',
  EuProject: 'title',
  Topic: 'topic',
  Tagline: 'euroSciVocCode',
};

let LOGGING = true;

export const logStatements = (...messages) => {
  if (LOGGING) console.log(...messages);
};

export const toggleLogging = (onOff) => {
  LOGGING = onOff ?? !LOGGING;
};

export const logPerformancenStart = (markName) => {
  performance.clearMarks(`${markName}-start`);
  performance.clearMarks(`${markName}-end`);

  performance.mark(`${markName}-start`);
};

export const logPerformancenEnd = (markName) => {
  performance.mark(`${markName}-end`);
  let duration = performance.measure(
    `${markName} computation duration`,
    `${markName}-start`,
    `${markName}-end`
  ).duration;
  duration = duration / 1000;
  console.log(`${markName} processing took: ${duration.toFixed(5)} seconds.`);

  performance.clearMarks(`${markName}-start`);
  performance.clearMarks(`${markName}-end`);
};

/**
 * Collects the label types of all nodes and gives them an individual color.
 */
export const colorizeByLabel = (graph) => {
  const labelTypes = {};

  graph.forEachNode((node, atts) => {
    const label = atts['@labels'][0];
    if (!labelTypes[label]) labelTypes[label] = {};
  });

  const labelCount = Object.keys(labelTypes).length;
  if (labelCount < 1) {
    return;
  }

  // create and assign one color by labelType
  const palette = iwanthue(labelCount, {
    seed: 'labelTypes',
  });
  for (const type in labelTypes) {
    const color = palette.pop();
    labelTypes[type].color = color;
  }

  graph.forEachNode((node, atts) => {
    atts.color = labelTypes[atts['@labels'][0]].color;
  });

  return graph;
};

/**
 * Calculates the size of the node depending on the degree of the node in the grahp.
 */
export const nodeSizeByDegree = (graph) => {
  const graphSize = graph.directedSize;
  logStatements('===== NODE SIZE CALCULATION BY DEGREE =====');
  logStatements('Directed Graph Size: ', graphSize);
  const multiplicator = Math.max(5, Math.log(graphSize));
  logStatements('Calculated Multiplicator: ', multiplicator);
  const nodeSizes = [];
  const degrees = [];

  graph.forEachNode((node, atts) => {
    const degree = graph.degree(node);
    const size = Math.sqrt(degree) * multiplicator;
    atts.size = size;
    degrees.push(degree);
    nodeSizes.push(size);
  });

  logStatements('Minimum node size: ', Math.min(...nodeSizes));
  logStatements('Minimum node degree: ', Math.min(...degrees));
  logStatements('Maximum node size: ', Math.max(...nodeSizes));
  logStatements('Maximum node degree: ', Math.max(...degrees));
  logStatements('===========================================');

  return graph;
};

export default {
  colorizeByLabel,
  nodeSizeByDegree,
  logStatements,
  toggleLogging,
};
