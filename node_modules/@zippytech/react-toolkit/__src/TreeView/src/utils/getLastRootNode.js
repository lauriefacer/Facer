/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Finds a previous sibling that is a root node (parent === null)
 * @param {Number} activeIndex
 * @param {Array} visibleNodes
 * @return {Object} previousRootNode
 */
function getPreviousRootNode(activeIndex, visibleNodes) {
  let result = null;
  let index = visibleNodes.length - 1;

  while (index > activeIndex) {
    if (visibleNodes[index].parent === null) {
      result = visibleNodes[index];
      break;
    }
    index -= 1;
  }

  return result;
}

export default getPreviousRootNode;
