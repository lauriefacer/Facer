/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from 'object-assign';

/**
 * Creates a new array with a node injected
 * at the specified indexPath
 * @param {Array} nodes
 * @param {Array} indexPath
 * @param {Array} data
 * @return {Array} newData
 */
function injectNodes(nodeToInject, indexPath, data) {
  let newData;
  let currentIndex = indexPath[0];

  // last item
  if (indexPath.length === 1) {
    return data.map((node, index) => {
      if (index === currentIndex) {
        return nodeToInject;
      }

      return node;
    });
  }

  newData = data.map((node, index) => {
    if (index === currentIndex) {
      return assign({}, node, {
        nodes: injectNodes(nodeToInject, indexPath.slice(1), node.nodes)
      });
    }

    return node;
  });

  return newData;
}

export default injectNodes;
