/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import computeXYDiff from './computeXYDiff';
import positionResizableProxy from './positionResizableProxy';

const abs = Math.abs;
const signum = function(v) {
  return v === 0 ? 1 : v < 0 ? -1 : 1;
};

function onResizeDrag(config) {
  let xDiff = config.diff.left;
  let yDiff = config.diff.top;

  if (config.horizontalResizeOnly) {
    yDiff = 0;
  }

  if (config.verticalResizeOnly) {
    xDiff = 0;
  }

  const activeHandle = config.activeHandle;
  const region = config.initialResizeRegion;
  const handleName = activeHandle.name;

  let handleX = activeHandle.x;
  let handleY = activeHandle.y;

  const sizeContraints = config.sizeContraints;
  const constrainRegion = config.constrainRegion;

  const originalHandleX = handleX;
  const originalHandleY = handleY;

  const absX = abs(xDiff);
  const absY = abs(yDiff);

  let signX = xDiff ? xDiff / absX : 1;
  let signY = yDiff ? yDiff / absY : 1;

  let result;

  let clonedRegion = region.clone();
  const keepAspectRatio = config.keepAspectRatio;
  const aspectRatio = config.aspectRatio;
  const regionWidth = clonedRegion.width;
  const regionHeight = clonedRegion.height;

  // protect against very quick resize and make sure the resize still happens, to the min size
  xDiff =
    handleX > 0 ? Math.max(xDiff, -regionWidth) : Math.min(xDiff, regionWidth);

  yDiff =
    handleY > 0
      ? Math.max(yDiff, -regionHeight)
      : Math.min(yDiff, regionHeight);

  // process the aspect ratio details
  if (keepAspectRatio) {
    result = computeXYDiff(
      xDiff,
      yDiff,
      handleX,
      handleY,
      handleName,
      aspectRatio
    );

    xDiff = result[0];
    yDiff = result[1];

    handleX = result[2];
    handleY = result[3];

    signX = signum(xDiff);
    signY = signum(yDiff);
  } else {
    // top/bottom/left/right handles, so make the other diff zero
    if (!handleX) {
      xDiff = 0;
    }

    if (!handleY) {
      yDiff = 0;
    }
  }

  let positionXResult;
  let positionYResult;

  if (xDiff) {
    positionXResult = positionResizableProxy(
      xDiff,
      handleX,
      clonedRegion,
      ['left', 'right'],
      'width',
      sizeContraints,
      constrainRegion
    );
  }

  if (keepAspectRatio && positionXResult && positionXResult.constrained) {
    // x was constrained, so we need to recompute the value of yDiff, taking into account the new value of xDiff
    xDiff = signX * abs(positionXResult.addValue);

    result = computeXYDiff(
      xDiff,
      yDiff,
      originalHandleX,
      originalHandleY,
      handleName,
      aspectRatio,
      true /*forceXDominate */
    );

    xDiff = result[0];
    yDiff = result[1];

    handleX = result[2];
    handleY = result[3];

    signY = signum(yDiff);
  }

  if (yDiff) {
    positionYResult = positionResizableProxy(
      yDiff,
      handleY,
      clonedRegion,
      ['top', 'bottom'],
      'height',
      sizeContraints,
      constrainRegion
    );
  }

  if (
    keepAspectRatio &&
    positionYResult &&
    positionXResult &&
    positionYResult.constrained
  ) {
    // restore to position before x transform and add the y transforms
    clonedRegion
      .set(positionXResult.restore)
      .shift(positionYResult.shiftObject)
      .add(positionYResult.addObject);

    // y was constrained, so we need to recompute the value of xDiff,
    // taking into account the new value of yDiff
    yDiff = signY * abs(positionYResult.addValue);

    result = computeXYDiff(
      xDiff,
      yDiff,
      handleX,
      handleY,
      handleName,
      aspectRatio,
      false,
      true /* forceYDominate */
    );

    xDiff = result[0];
    handleX = result[2];

    positionResizableProxy(
      xDiff,
      handleX,
      clonedRegion,
      ['left', 'right'],
      'width',
      sizeContraints,
      constrainRegion
    );
  }

  if (clonedRegion) {
    return clonedRegion;
  }

  return null;
}

export default onResizeDrag;
