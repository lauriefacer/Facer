/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Calculates a new position when relativeToViewport changes.
 * So when window changes position from relative to window to a specific
 * element it should not move from it's place.
 *
 * TODO: Take into account when is fixed and inside a parent with transfor,
 * @param  {[type]} initialPosition           [description]
 * @param  {[type]} initialRegion [description]
 * @param  {[type]} finalRegion        [description]
 * @return {[type]}                           [description]
 */
function getPositionRelativeToNewRegion({
  initialPosition,
  initialRegion,
  finalRegion
}) {
  const position = {};
  const verticalCorrection = initialRegion.top - finalRegion.top;
  const horizontalCorrection = initialRegion.left - finalRegion.left;
  if (initialPosition.top !== undefined) {
    position.top = verticalCorrection + initialPosition.top;
  }
  if (initialPosition.bottom !== undefined) {
    position.bottom = initialPosition.bottom - verticalCorrection;
  }
  if (initialPosition.left !== undefined) {
    position.left = horizontalCorrection + initialPosition.left;
  }
  if (initialPosition.right !== undefined) {
    position.right = initialPosition.right - horizontalCorrection;
  }

  return position;
}

export default getPositionRelativeToNewRegion;
