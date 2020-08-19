/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Tests whether one if it's ancestor is collapsed
 * @param {Object} parent
 * @return {Booleon} collapsed
 */
function isParentCollapsed(parent) {
  if (!parent) {
    return false;
  }

  parent = parent;
  let collapsed = false;

  while (parent) {
    if (parent.collapsed) {
      collapsed = true;
      break;
    }
    parent = parent.parent;
  }

  return collapsed;
}

export default isParentCollapsed;
