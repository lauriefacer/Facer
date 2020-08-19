/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Adjusts the sizes of the boxes taking into account their offset.
 * @param {[type]} boxes [description]
 */

/**
 * Translates:
 * top-center => bottom-right
 * left-center => right-bottom
 * right-center => left-bottom
 * bottom-center => top-right
 */
function translateCenterPosition(stacking) {
  const [firstDirection] = stacking;
  let newStacking;

  switch (firstDirection) {
    case 'top':
      newStacking = ['bottom', 'right'];
      break;
    case 'left':
      newStacking = ['right', 'top'];
      break;
    case 'right':
      newStacking = ['left', 'bottom'];
      break;
    case 'bottom':
      newStacking = ['top', 'right'];
      break;
  }

  return newStacking;
}

export default translateCenterPosition;
