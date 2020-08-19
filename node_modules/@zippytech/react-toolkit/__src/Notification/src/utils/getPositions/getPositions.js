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
import getPositionsRelativeToBottomRight from './getPositionsRelativeToBottomRight';
import translatePositions from './translatePositions';
import getStackingDirection from './getStackingDirection';
import getPositionsRelativeToRegion from './getPositionsRelativeToRegion';
import correctBoxesSizeWithOffset from './correctBoxesSizeWithOffset';
import adjustPositionWithOffset from './adjustPositionWithOffset';
import translateCenterPosition from './translateCenterPosition';

function getPositions({
  boxes = [],
  region,
  stacking = [],
  stackingWrap,
  relativeToViewport
}) {
  let newStacking = stacking;

  // stacking is required
  if (!stacking || stacking.length === 0) {
    return null;
  }

  let positions;

  /**
   * For center positions, a correction has to be made
   */

  if (stacking.indexOf('center') !== -1) {
    newStacking = translateCenterPosition(stacking);
    stackingWrap = false;
  }

  const stackingDirection = getStackingDirection(stacking);
  const isVertical = stackingDirection[0] === 'vertical';

  // increase size of box if it has offset
  boxes = correctBoxesSizeWithOffset(boxes);

  positions = getPositionsRelativeToBottomRight({
    boxes,
    stackingWrap,
    width: region.width,
    height: region.height,
    isVertical
  });

  positions = translatePositions({
    positions,
    stacking: newStacking.length === 2 ? newStacking.join('-') : newStacking
  });

  // correct position according to offset
  positions = adjustPositionWithOffset(positions);

  positions = getPositionsRelativeToRegion({
    region,
    positions
  });

  /**
   * If is center remove
   */
  if (stacking.indexOf('center') !== -1) {
    positions = positions.map(position => {
      const newPosition = { ...position };
      if (isVertical) {
        delete newPosition.left;
        delete newPosition.right;
      } else {
        delete newPosition.top;
        delete newPosition.bottom;
      }
      return newPosition;
    });
  }

  return positions;
}

export default getPositions;
