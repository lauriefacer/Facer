/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Constrains a position to it's constrain.
 * @param  {region} region    region of the window/titlebar
 * @param  {region} constrain region to which the region is constrained
 * @param  {{ top?: number, ...}} position
 * @return {{ top?: number, ...}}           constrained posiiton
 */
function constrainPositionToRegion({ region, constrain, position }) {
  const newPosition = { ...position };

  // constrain top
  if (position.top !== undefined && position.top < constrain.top) {
    newPosition.top = constrain.top;
  }

  if (
    position.top !== undefined &&
    position.top + region.height > constrain.bottom
  ) {
    newPosition.top = constrain.bottom - region.height;
  }

  // constrain left
  if (position.left !== undefined && position.left < constrain.left) {
    newPosition.left = constrain.left;
  }

  if (
    position.left !== undefined &&
    position.left + region.width > constrain.right
  ) {
    newPosition.left = constrain.right - region.width;
  }

  // constrain bottom
  if (
    position.bottom !== undefined &&
    position.bottom > constrain.bottom - region.height
  ) {
    newPosition.bottom = constrain.bottom - region.height;
  }

  if (position.bottom !== undefined && position.bottom < 0) {
    newPosition.bottom = 0; // to be ajusted when relative
  }

  // constrian right
  if (position.right !== undefined && position.right < 0) {
    newPosition.right = 0;
  }

  if (
    position.right !== undefined &&
    position.right > constrain.right - region.width
  ) {
    newPosition.right = constrain.right - region.width;
  }

  return newPosition;
}

export default constrainPositionToRegion;
