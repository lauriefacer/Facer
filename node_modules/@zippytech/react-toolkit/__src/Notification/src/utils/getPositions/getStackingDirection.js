/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Determines the general direction of the stacking.
 *
 * @param  {array} stacking stacking
 * @return {array} general direction stacking
 */
function getStackingDirection(stacking) {
  let stackingDirection;
  if (stacking.length === 1) {
    stackingDirection =
      stacking[0] === 'top' || stacking[0] === 'bottom'
        ? ['vertical']
        : ['horizontal'];
  } else {
    stackingDirection =
      stacking[0] === 'top' || stacking[0] === 'bottom'
        ? ['vertical', 'horizontal']
        : ['horizontal', 'vertical'];
  }
  return stackingDirection;
}

export default getStackingDirection;
