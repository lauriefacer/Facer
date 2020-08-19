/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default function getDeltaValueBasedOnKeyDownEvent(event, config) {
  let diff = null;
  const { key, shiftKey } = event;

  const {
    currentValue,
    step,
    largeStep,
    horizontal,
    isRevered,
    getValueModifier,
    endValue,
    startValue
  } = config;

  const computedStep = getValueModifier(event, config);

  switch (key) {
    case 'ArrowLeft':
    case 'ArrowUp':
      diff = -computedStep;
      break;
    case 'ArrowRight':
    case 'ArrowDown':
      diff = computedStep;
      break;
    case 'PageUp':
      diff = -largeStep;
      break;
    case 'PageDown':
      diff = largeStep;
      break;

    case 'End':
      diff = endValue;
      break;
    case 'Home':
      diff = -endValue;
      break;
  }

  if (diff !== null) {
    diff *= isRevered ? -1 : 1;
  }

  return diff;
}

const getValueModifier = (event, config) => {
  const { shiftKey } = event;
  const { largeStep, step } = config;
  return shiftKey ? largeStep : step;
};

export { getValueModifier };
