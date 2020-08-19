/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function updateSizeWithDirection({ position, size, direction, step = 10 }) {
  const newPosition = { ...position };
  const newSize = { ...size };
  // top means height smaller
  // position changes if position has bottom
  if (direction === 'up') {
    newSize.height -= step;
    if (position.bottom !== undefined) {
      newPosition.bottom += step;
    }
  }

  // down means height bigger
  // position changes if position has bottom
  if (direction === 'down') {
    newSize.height += step;
    if (position.bottom !== undefined) {
      newPosition.bottom -= step;
    }
  }
  // left means width smaller
  // position changes if position has right
  if (direction === 'left') {
    newSize.width -= step;
    if (position.right !== undefined) {
      newPosition.right += step;
    }
  }
  // right means width bigger
  // position changes if position has right
  if (direction === 'right') {
    newSize.width += step;
    if (position.right !== undefined) {
      newPosition.right -= step;
    }
  }

  return {
    size: newSize,
    position: newPosition
  };
}

export default updateSizeWithDirection;
