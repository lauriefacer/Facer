/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Takes in account the position of the region
 * and corrects the positions to be relative to it.
    (referenceRegion.height - region.bottom) = css relative bottom
    bacuse region.bottom is the distance from top to bottom
*/
function getPositionsRelativeToRegion({ region, positions }) {
  return positions.map(position => {
    const newPosition = {};

    const viewportWidth = Math.max(0, window.innerWidth || 0);
    const viewportHeight = Math.max(0, window.innerHeight || 0);

    if (position.bottom !== undefined) {
      newPosition.bottom = position.bottom + (viewportHeight - region.bottom);
    }

    if (position.top !== undefined) {
      newPosition.top = position.top + region.top;
    }

    if (position.left !== undefined) {
      newPosition.left = position.left + region.left;
    }

    if (position.right !== undefined) {
      newPosition.right = position.right + (viewportWidth - region.right);
    }

    return newPosition;
  });
}

export default getPositionsRelativeToRegion;
