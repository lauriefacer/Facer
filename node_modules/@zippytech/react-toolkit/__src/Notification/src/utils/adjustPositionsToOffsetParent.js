/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import getRegion from './getRegion';

const adjustPositionsToOffsetParent = ({
  positions,
  offsetParent,
  rootNode
}) => {
  const offsetParentRegion = getRegion(offsetParent, rootNode);
  const viewportWidth = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  const viewportHeight = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  );

  positions = positions.map(position => {
    const newPosition = { ...position };

    if (position.bottom !== undefined) {
      newPosition.bottom -= viewportHeight - offsetParentRegion.bottom;
    }

    if (position.top !== undefined) {
      newPosition.top -= offsetParentRegion.top;
    }

    if (position.left !== undefined) {
      newPosition.left -= offsetParentRegion.left;
    }

    if (position.right !== undefined) {
      newPosition.right -= viewportWidth - offsetParentRegion.right;
    }

    return newPosition;
  });

  return positions;
};

export default adjustPositionsToOffsetParent;
