/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import getRegion from './getRegion';
import adjustRegionOffset from './adjustRegionOffset';
import normalizeOffset from './normalizeOffset';
import getPositions from './getPositions';
import adjustPositionsToOffsetParent from './adjustPositionsToOffsetParent';

const addPositions = ({
  region,
  notifications,
  stacking,
  regionOffset,
  rootNode,
  board,
  stackingWrap,
  relativeToViewport
}) => {
  region = getRegion(region, rootNode);

  region = adjustRegionOffset({
    region,
    offset: regionOffset
  });

  const boxes = notifications.map(({ width, height, offset, closed }) => {
    return {
      closed, // means that is must be igonred
      width,
      height,
      offset: normalizeOffset(offset)
    };
  });

  let positions = getPositions({
    stacking,
    region,
    boxes,
    stackingWrap,
    relativeToViewport
  });
  /**
   * If it uses absolute positon position must be corrected.
   * Substract top and left from offsetParent (first parent that has position).
   */
  if (!relativeToViewport && rootNode && rootNode.offsetParent) {
    positions = adjustPositionsToOffsetParent({
      rootNode,
      positions,
      offsetParent: rootNode.offsetParent
    });
  }

  const positionedNotifications = notifications.map((config, index) => {
    return {
      ...config,
      position: positions[index]
    };
  });

  return positionedNotifications;
};

export default addPositions;
