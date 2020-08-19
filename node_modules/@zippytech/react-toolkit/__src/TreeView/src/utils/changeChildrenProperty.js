/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from '../../../common/assign';

/**
 * Returns a map with all it children
 * checked or uncheded, depending on
 * check value
 * @param {Object} nodeProps - nodeProps
 * @param {Bool} checked
 * @return {Object} checkMap
 */
function changeChildrenProperty(nodeProps, newState) {
  let propertyMap = { [nodeProps.path]: newState };
  if (nodeProps.children) {
    const children = nodeProps.children.map(child =>
      changeChildrenProperty(child.props, newState)
    );

    children.forEach(child => {
      assign(propertyMap, child);
    });
  }

  return propertyMap;
}

export default changeChildrenProperty;
