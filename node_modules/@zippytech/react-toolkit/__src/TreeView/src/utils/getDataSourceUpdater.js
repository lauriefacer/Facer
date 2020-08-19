/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import safeParseInt from './safeParseInt';
import assign from 'object-assign';
import injectNode from './injectNode';

/**
 * Creates a function that updates datasource.
 * updateNode should return a new node, or nutate the node passed.
 * The new node, or the mutated node is then inserted into the dataSource.
 *
 * getDataSourceUpdater :: config -> (nodeConfig -> node) -> newDataSource
 */
const getDataSourceUpdater = ({
  data,
  nodeProps,
  extraProps
}) => updateNode => {
  const indexPath = nodeProps.indexPath.split('/').map(safeParseInt);
  let node = assign({}, nodeProps.node);

  // default to node (potentialy mutated) if updateNode returns null|undefined
  const newNode = updateNode(assign({ node, nodeProps }, extraProps)) || node;
  const newDataSource = injectNode(newNode, indexPath, data);

  return newDataSource;
};

export default getDataSourceUpdater;
