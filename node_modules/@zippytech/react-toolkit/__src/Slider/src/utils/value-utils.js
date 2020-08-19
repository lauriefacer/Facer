/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import clamp from '../../../common/clamp';

function getValue(props, state) {
  var value =
    props.value == null
      ? state.value == null ? props.startValue : state.value
      : props.value;
  if (state.dragging) {
    value = state.value;
  }
  return value;
}

function toValue(value, props) {
  if (Array.isArray(value)) {
    return [toValue(value[0], props), toValue(value[1], props)];
  }
  return props.toStep(
    clamp(value, props.startValue, props.endValue),
    props.step
  );
}

function getPercentageForValue(value, props) {
  value = value || 0;

  var range = Math.abs(props.endValue - props.startValue);
  var diff = value - props.startValue;

  return diff * 100 / range;
}

function getValueForPercentage(percentage, props, config) {
  const intervalRange = Math.abs(props.endValue - props.startValue);
  let value = percentage * intervalRange / 100;
  if (props.isReversed) {
    value = 1 - value;
  }
  var noStartValue = config && config.noStartValue;
  var v = noStartValue ? value : props.startValue + value;

  return v;
}

function valueToStep(value, step) {
  if (!step) {
    return value;
  }

  if (step < 1) {
    console.warn('must implement support for decimal steps');
  }

  return value - Math.abs(value) % step;
}

const getPossitionOfValueBasedOnLimits = (value, config) => {
  const { startValue, endValue } = config;

  value = clamp(value, startValue, endValue);

  const intervalRange = Math.abs(startValue - endValue);
  const leftEdgeToValue = Math.abs(startValue - value);

  return Math.round(leftEdgeToValue / intervalRange * 1000) / 1000;
};

const isValueContainedBySelection = (value, config) => {
  const { currentValue, trackFillPosition, startValue, endValue } = config;

  let start = currentValue;
  let end = endValue;

  if (trackFillPosition === 'start') {
    start = startValue;
    end = currentValue;
  }

  return isContainedInRange(value, [start, end]);
};

const isContainedInRange = (value, range) => {
  let [start, end] = range;
  if (start > end) {
    const aux = start;
    start = end;
    end = aux;
  }
  return value >= start && value <= end;
};

/**
 * Logic for handling change of lower value of the range interval, taking into
 * account the start and end edges of the space and the min/max range distance.
 *
 * If the new start of the range interval would be outside range space
 * [startValue, endValue] it will be set to start value.
 *
 * If the new start of the edge would break the maxRange constraint,
 * it will drag the endValue with it
 *
 * If the new start of the edge would break the minRange constraing,
 * it will either shift the end of the edge, or stay in place if end of the edge is already
 * at the end of the range space.
 */
const shiftLowerEdgeOfRange = (
  delta,
  {
    currentValue,
    startValue,
    endValue,
    minRange,
    maxRange,
    step = 1,
    isReversed
  }
) => {
  delta = convertToStepDelta(delta, step);

  if (isReversed) {
    const [upperShiftStart, upperShiftEnd] = shiftUpperEdgeOfRange(delta, {
      currentValue: [currentValue[1], currentValue[0]],
      startValue: endValue,
      endValue: startValue,
      minRange,
      maxRange,
      step
    });

    return [upperShiftEnd, upperShiftStart];
  }

  const [initialStartValue, initialEndValue] = currentValue;

  let newStartRangeValue = initialStartValue + delta;
  let newEndRangeValue = initialEndValue;

  if (newStartRangeValue < startValue) {
    newStartRangeValue = startValue;
  }

  if (newStartRangeValue > endValue) {
    newStartRangeValue = endValue;
    newEndRangeValue = endValue;
  }

  if (newStartRangeValue > newEndRangeValue) {
    newEndRangeValue = newStartRangeValue;
  }

  let intervalRange = Math.abs(newEndRangeValue - newStartRangeValue);

  if (intervalRange > maxRange) {
    newEndRangeValue = newStartRangeValue + maxRange;
  }

  if (intervalRange < minRange) {
    newEndRangeValue = newStartRangeValue + minRange;
    if (newEndRangeValue > endValue) {
      const endEdgeDelta = newEndRangeValue - endValue;
      newEndRangeValue = endValue;
      newStartRangeValue -= endEdgeDelta;
    }
  }

  return [newStartRangeValue, newEndRangeValue];
};

/**
 * Logic for handling shifting the edge of the range. Uses the power of math to
 * transform end edge interaction into start edge interaction so we reuse the
 * logic from shiftLowerEdgeOfRange completely.
 */
const shiftUpperEdgeOfRange = (
  delta,
  { currentValue, startValue, endValue, minRange, maxRange, step, isReversed }
) => {
  if (isReversed) {
    const [lowerShiftStart, lowerShiftEnd] = shiftLowerEdgeOfRange(delta, {
      currentValue: [currentValue[1], currentValue[0]],
      startValue: endValue,
      endValue: startValue,
      minRange,
      maxRange,
      step
    });

    return [lowerShiftEnd, lowerShiftStart];
  }

  const inversedValue = [-currentValue[1], -currentValue[0]];
  let [inversedEnd, inversedStart] = shiftLowerEdgeOfRange(-delta, {
    currentValue: inversedValue,
    startValue: -endValue,
    endValue: -startValue,
    minRange,
    maxRange,
    step,
    isReversed
  });

  return [-inversedStart, -inversedEnd];
};

const shiftRangeByValue = (
  delta,
  { currentValue, startValue, endValue, minRange, maxRange, step, isReversed }
) => {
  const [leftShiftStart, leftShiftEnd] = shiftLowerEdgeOfRange(delta, {
    currentValue,
    startValue,
    endValue,
    minRange,
    maxRange,
    step,
    isReversed
  });

  const intervalRange = Math.abs(leftShiftStart - leftShiftEnd);
  let result = null;
  if (intervalRange === minRange) {
    result = [leftShiftStart, leftShiftEnd];
  } else {
    result = shiftUpperEdgeOfRange(delta, {
      currentValue: [leftShiftStart, leftShiftEnd],
      startValue,
      endValue,
      minRange,
      maxRange,
      step,
      isReversed
    });
  }

  return result;
};

const convertToStepDelta = (delta, step) => {
  if (delta === 0) {
    return delta;
  }
  delta = Math.round(delta * 100) / 100;
  let comparisionDiff = Math.abs(delta);
  const sign = delta / comparisionDiff;

  if (comparisionDiff < step) {
    delta = 0;
  } else {
    delta = sign * step * Math.round(comparisionDiff / step);
  }

  return delta;
};

export {
  valueToStep,
  getValueForPercentage,
  getPercentageForValue,
  toValue,
  getValue,
  isValueContainedBySelection,
  shiftLowerEdgeOfRange,
  shiftUpperEdgeOfRange,
  shiftRangeByValue,
  getPossitionOfValueBasedOnLimits,
  isContainedInRange
};
