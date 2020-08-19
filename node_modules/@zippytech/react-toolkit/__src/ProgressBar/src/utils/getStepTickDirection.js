/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function getStepTickDirection(direction, orientation) {
  /**
   *  if vertical and direction is 1
   *  flip
   *
   * if vertical and and direction -1
   * do nothing
   */
  if (orientation === 'vertical') {
    return direction === 1 ? -1 : 1;
  }

  /**
   * horizontal and direction -1
   * flip
   *
   * horizontal and direction 1
   * do nothing
   */
  if (orientation === 'horizontal') {
    return direction;
  }
}

export default getStepTickDirection;
