/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isNumeric from './isNumeric';
import range from '../../../common/range';
import normalizeValue from './normalizeValue';

/**
 * @return a structure easy to work with.
 * [{from, to}, {from, to}]
 * from and to are normalized value from 0 - 100
 *
 * !reverse
 * in case of:
 * - vertical reverse, nothing happens
 * - vertical simple, from and two are reversed
 *
 * - horizontal reverse - from and two are reversed
 */
function formatRange(step, min, max, direction) {
  const valueRange = max - min;
  let formatedSteps;

  // simple value
  if (isNumeric(step)) {
    formatedSteps = formatSingleNumericValue(step, valueRange);
  }

  if (Array.isArray(step)) {
    formatedSteps = formatMultipleNumericValue(step, valueRange);
  }

  // normalize values to 0 - 100
  formatedSteps = normalizeValues(formatedSteps, min, max);

  // ajust to be used as position (horizontal, right)
  formatedSteps = formatRangeRelativeToPosition(formatedSteps);

  // direction, if is is -1 then it is reversed from and to
  // reversal of rendering is dome inside component
  if (direction === -1) {
    formatedSteps = formatedSteps.map(({ from, to }) => ({
      to: from,
      from: to
    }));
  }

  return formatedSteps;
}

/**
 * Takes into acount that when rendering
 * you position elements with left and right.
 * takes a one dimensional position scheme and
 * fixes to, to be relative to 'right' if right is end.
 */
function formatRangeRelativeToPosition(formatedSteps) {
  return formatedSteps.map(({ from, to }) => ({
    from: from,
    to: 100 - to
  }));
}

function normalizeValues(formatedSteps, min, max) {
  return formatedSteps.map(({ from, to }) => {
    return {
      from: normalizeValue({ value: from, min, max }),
      to: normalizeValue({ value: to, min, max })
    };
  });
}

function formatSingleNumericValue(step, valueRange) {
  // TODO change range deps when imported inside react-toolkit
  return formateValuesRange(range(step, valueRange + step, step), valueRange);
}

function formatMultipleNumericValue(range, valueRange) {
  return formateValuesRange(range.concat(valueRange), valueRange);
}

function formateValuesRange(range, valueRange) {
  return range.reduce((acc, stepPosition, index, list) => {
    const stepConfig = {};

    // first from is 0
    if (index === 0) {
      stepConfig.from = 0;
    } else {
      // the rest are previous to
      stepConfig.from = acc[acc.length - 1].to;
    }

    stepConfig.to = stepPosition;

    acc.push(stepConfig);

    return acc;
  }, []);
}

export default formatRange;
