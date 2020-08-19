/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function constrainValueToStep(value, formatedStep, direction) {
  // interested only to `to`
  // value is floored to closest step
  let limits;

  if (direction === 1) {
    limits = formatedStep.map(step => step.from);
  } else {
    limits = formatedStep.map(step => step.to);
  }

  let constrainedValue = 0;

  // iterate over each to
  // and see which one is biggest less than value
  for (let i = formatedStep.length - 1; i >= 0; i--) {
    if (value >= limits[i]) {
      constrainedValue = limits[i];

      break;
    }
  }

  // if last limit is smaller or equal than value, than limit is the last one
  if (100 <= value) {
    return 100;
  }

  return constrainedValue;
}

export default constrainValueToStep;
