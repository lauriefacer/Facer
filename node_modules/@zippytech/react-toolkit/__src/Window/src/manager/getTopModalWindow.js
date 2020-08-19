/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Returns the top most modal
 * window id
 * @param {Array} list
 * @param {Object} instances
 * @return {Number} top most window id
 */
function getTopModalWindow(list, instances) {
  let topMostModalId = null;
  let instance;
  for (let i = list.length - 1; i >= 0; i--) {
    instance = instances[list[i]];
    if (
      instance.props &&
      instance.props.modal &&
      (typeof instance.isVisible == 'function' ? instance.isVisible() : true)
    ) {
      topMostModalId = list[i];
      break;
    }
  }

  return topMostModalId;
}

export default getTopModalWindow;
