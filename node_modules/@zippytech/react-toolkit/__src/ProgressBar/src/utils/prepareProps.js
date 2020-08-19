/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import normalizeValue from './normalizeValue';
import getRotateStyle from './getRotateStyle';
import join from '../../../common/join';
import assign from '../../../common/assign';
import formatRanges from './formatRanges';
import constrainValueToStep from './constrainValueToStep';
import getStepTickDirection from './getStepTickDirection';

const ORIENTATION_DIRECTION_MAP = {
  horizontal: {
    start: 'left',
    end: 'right'
  },
  vertical: {
    start: 'top',
    end: 'bottom'
  }
};

/**
 * creates an object with props, that can come from
 * this.props, this.state, or computed
 * it is helpful to have a single point of access
 */
function prepareProps(props, state, rootBem) {
  const {
    orientation,
    value,
    min,
    max,
    labelPosition,
    showSteps,
    rtl,
    transition,
    rootClassName
  } = props;

  const { labelOverflow } = state;

  let direction;

  if (rtl) {
    direction = -1;
  } else {
    direction = props.direction;
  }

  let normalizedValue = normalizeValue({ value, min, max });

  const stepTickDirection = getStepTickDirection(direction, orientation);

  // steps
  const step =
    typeof props.step === 'function' ? props.step(props, state) : props.step;
  // an array of procent values where each step begins and ends
  let formatedStep = step && formatRanges(step, min, max, stepTickDirection);

  // incrementInSteps defaults to showSteps
  const incrementInSteps =
    props.incrementInSteps !== undefined ? props.incrementInSteps : showSteps;

  let tick;
  let formatedTick;
  if (props.tick != undefined) {
    tick =
      typeof props.tick === 'function' ? props.tick(props, state) : props.tick;
    formatedTick = tick && formatRanges(tick, min, max, stepTickDirection);
  } else {
    tick = step;
    formatedTick = formatedStep;
  }

  /**
   * constrain value to steps
   */
  if (incrementInSteps && step) {
    normalizedValue = constrainValueToStep(
      normalizedValue,
      formatedStep,
      stepTickDirection
    );
  }

  // we consider indeterminate when
  // identerminate is true
  // or when the value is null or undefined
  const indeterminate =
    props.indeterminate !== undefined
      ? props.indeterminate
      : value == undefined; // also null

  const vertical = orientation === 'vertical';
  const horizontal = orientation === 'horizontal';

  // dimension
  const dimension = horizontal ? 'width' : 'height';

  const fillSize = normalizedValue;
  const remainingSize = 100 - fillSize;

  const reverse = direction === -1;

  const className = join(
    props.className,
    rootClassName,
    vertical && `${rootClassName}--vertical`,
    transition && `${rootClassName}--transition`,
    horizontal && `${rootClassName}--horizontal`,
    indeterminate && `${rootClassName}--indeterminate`,
    reverse && `${rootClassName}--reverse`,
    labelOverflow && `${rootClassName}--labelOverflow`,
    // label position
    `${rootClassName}--labelPosition-${labelPosition}`,
    // direction
    reverse && `${rootClassName}--direction-reverse`
  );

  const labelRotateStyle = getRotateStyle(props.rotateLabel);

  const directionMap = ORIENTATION_DIRECTION_MAP[orientation];

  return assign({}, props, {
    vertical,
    horizontal,
    className,
    fillSize,
    remainingSize,
    dimension,
    normalizedValue: normalizedValue,
    originalValue: value,
    labelRotateStyle,
    step,
    tick,
    formatedStep,
    incrementInSteps,
    formatedTick,
    directionMap,
    stepTickDirection,
    direction
  });
}

export default prepareProps;
