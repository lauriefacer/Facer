/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import toUpperFirst from '../../../common/toUpperFirst';

const abs = Math.abs;

function getResizeRegionDiff(first, second, diffSide, handleUnit) {
  const diffObject = {};
  let diffResult;

  diffObject[diffSide] = true;
  diffResult = first.diff(second, diffObject);

  return abs(Math[handleUnit < 0 ? 'max' : 'min'](0, diffResult[diffSide]));
}

function positionResizableProxy(
  diff,
  handleUnit,
  region,
  sides,
  sizeName,
  sizeConstraints,
  constrainRegion
) {
  const sideOne = sides[0];
  const sideTwo = sides[1];
  const shiftObject = {};
  const addObject = {};
  let shift = false;
  const toUpperSizeName = toUpperFirst(sizeName);
  const getSizeName = 'get' + toUpperSizeName;
  const minSizeName = 'min' + toUpperSizeName;
  const maxSizeName = 'max' + toUpperSizeName;

  if (diff < 0) {
    if (handleUnit < 0) {
      shift = true;
      shiftObject[sideOne] = diff;
      addObject[sideTwo] = abs(diff);
    } else {
      addObject[sideTwo] = diff;
    }
  } else if (diff >= 0) {
    if (handleUnit > 0) {
      addObject[sideTwo] = diff;
    } else if (handleUnit < 0) {
      shift = true;
      addObject[sideTwo] = -diff;
      shiftObject[sideOne] = diff;
    }
  }

  let addValue = addObject[sideTwo];
  const initialAddValue = addValue;
  let constrained = false;

  let newSize;

  // min and max size constraints
  const minSize = sizeConstraints[minSizeName];
  const maxSize = sizeConstraints[maxSizeName];

  // the initial size of the region
  let regionSize;

  // whether the region went through max constraints
  let maxConstrained = false;

  // check the newSize is between min and max size, if they are specified
  if (minSize || maxSize) {
    regionSize = region[getSizeName]();

    // the new size, with addValue included
    newSize = regionSize + addValue;

    if (minSize && newSize < minSize) {
      addValue = addValue + (minSize - newSize);
      constrained = true;
    }

    if (maxSize && newSize > maxSize) {
      addValue = addValue - (newSize - maxSize);
      maxConstrained = true; // constrain max
      constrained = true;
    }
  }

  // take a restore point
  const restore = region.clone();
  const diffSide = handleUnit < 0 ? sideOne : sideTwo;
  let diffResult;

  // if there were some changes made by the min and max constraints, update the add/shift objects
  if (constrained) {
    addObject[sideTwo] = addValue;

    // only update the shiftObject if needed
    if (shift) {
      shiftObject[sideOne] = -addValue;
    }
  }

  // make the region represent the changes
  region.shift(shiftObject).add(addObject);

  // now check the region fits into to the correct region
  if (constrainRegion && !constrainRegion.containsRegion(region)) {
    // it does not fit, so we have to constrain it
    constrained = true;

    diffResult = getResizeRegionDiff(
      constrainRegion,
      region,
      diffSide,
      handleUnit
    );
    // diffResult holds the amount by which the region does not fit into constrainRegion

    if (diffResult) {
      if (maxConstrained) {
        // max size was already constrained, so take a copy of
        // the addValue before the constrain happened
        addValue = initialAddValue;

        addObject[sideTwo] = addValue;
        if (shift) {
          shiftObject[sideOne] = -addValue;
        }

        // and compute the difference with the region as if it weren't max constrained
        diffResult = getResizeRegionDiff(
          constrainRegion,
          restore
            .clone()
            .shift(shiftObject)
            .add(addObject),
          diffSide,
          handleUnit
        );
      }

      // update the addValue
      addValue = addValue - diffResult;
      addObject[sideTwo] = addValue;

      // update the shift object, if needed
      if (shift) {
        shiftObject[sideOne] = -addValue;
      }

      // restore the initial region, and add the new "shift" and "add" objects
      region
        .set(restore)
        .shift(shiftObject)
        .add(addObject);
    }
  }

  return {
    addObject,
    shiftObject,
    addValue,
    constrained,
    restore,
    shifted: shift
  };
}

export default positionResizableProxy;
