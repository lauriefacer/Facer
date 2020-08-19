/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from 'object-assign';
import changeChildrenCheckProperty from './changeChildrenCheckProperty';

/**
 * Given the current state and a node that has been modified
 * it calculates next checkMap state
 * 1 - get previous full state tree
 * 2 - go to change
 * 3 - propagate change to it's children
 * 4 - propagate change to it's parents
 * @return {Object} new activeMap
 */
function getNewRecursiveCheckedState({ nodeProps, checked, currentState }) {
  // update previous state
  let newCheckedMap = assign({}, currentState);

  // update node children
  newCheckedMap = assign(
    newCheckedMap,
    changeChildrenCheckProperty(nodeProps, checked)
  );

  // propagate to parents
  newCheckedMap = assign(
    newCheckedMap,
    changeParentsCheck(nodeProps, newCheckedMap)
  );

  return newCheckedMap;
}

/**
 * Walks each parent and calls checkParent on it
 * @param {Object} nodeProps
 * @param {Object} checkMap
 * @return {Object} checkMap - return new checkMap with parents updated
 */
function changeParentsCheck(nodeProps, checkMap) {
  let newCheckMap = assign({}, checkMap);

  /**
   * Check self and then it's parents
   */
  if (nodeProps.children) {
    assign(newCheckMap, checkParent(nodeProps, newCheckMap));
  }

  /**
   * Walk to next parent and tell it to check whether
   * it is:
   * - checked
   * - unchecked
   * - indeterminated
   */
  walkParents(nodeProps, parent => {
    newCheckMap = assign(newCheckMap, checkParent(parent, newCheckMap));
  });

  return newCheckMap;
}

/**
 * Tests how it's children and decides whether it is checked, unchecked
 * or indeterminated
 * @param {Object} parent
 * @param {Object} newCheckMap
 * @return {Object} parentNewState - returns the check value for this parent
 */
function checkParent(parent, newCheckedMap) {
  const childrenLength = parent.children.length;
  const checkedChildren = parent.children.filter(child => {
    return newCheckedMap[child.props.path] === true;
  });
  const checkedChildrenLength = checkedChildren.length;
  const indeterminatedChildren = parent.children.filter(child => {
    return newCheckedMap[child.props.path] === null;
  });
  const indeterminatedChildrenLength = indeterminatedChildren.length;

  let newParentCheck = parent.checked;
  if (childrenLength === checkedChildrenLength) {
    newParentCheck = true;
  } else if (indeterminatedChildrenLength > 0 || checkedChildrenLength > 0) {
    newParentCheck = null;
  } else {
    newParentCheck = false;
  }

  return { [parent.path]: newParentCheck };
}

/**
 * Walks parents of given node,
 * and calls a callback with that parent
 * @param {Object} nodeProps
 * @param {Function} cb
 * @return {void}
 */
function walkParents(nodeProps, cb) {
  let root = nodeProps.parent;
  while (root) {
    cb(root);
    root = root.parent;
  }
}

export default getNewRecursiveCheckedState;
