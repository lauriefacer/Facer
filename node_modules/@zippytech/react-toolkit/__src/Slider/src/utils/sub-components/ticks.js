/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import {
  getPossitionOfValueBasedOnLimits,
  isValueContainedBySelection,
  isContainedInRange
} from '../value-utils';

import join from '../../../../common/join';

const generateTickValuesBySteps = config => {
  const { tickStep, step, startValue, endValue, skipEdgeTicks } = config;

  let computedTickStep = tickStep || step || 5;

  if (computedTickStep < 1) {
    computedTickStep = 1;
  }

  let computedStartValue = startValue;
  let computedEndValue = endValue;

  const isReveresed = startValue > endValue;

  if (isReveresed) {
    computedStartValue = endValue;
    computedEndValue = startValue;
  }

  if (skipEdgeTicks) {
    computedEndValue -= 1;
    computedStartValue += computedTickStep;
  }

  let ticks = [];

  for (
    let i = computedStartValue;
    i <= computedEndValue;
    i += computedTickStep
  ) {
    ticks.push(i);
  }

  if (isReveresed) {
    ticks = ticks.reverse();
  }

  return ticks;
};

const generateLabeldTickSteps = config => {
  const {
    tickStep,
    step,
    smallTickStep,
    startValue,
    endValue,
    skipEdgeTicks
  } = config;

  const generateTickValuesByStepsFn =
    config.generateTickValuesBySteps || generateTickValuesBySteps;

  const largeSteps = generateTickValuesByStepsFn(config).map(value => ({
    type: 'big',
    value
  }));
  const smallSteps = generateTickValuesByStepsFn({
    tickStep: smallTickStep,
    step,
    startValue,
    endValue,
    skipEdgeTicks
  }).map(value => ({
    type: 'small',
    value
  }));

  let combinedTicksSet = largeSteps.concat(smallSteps).sort((item1, item2) => {
    return item1.value - item2.value;
  });

  combinedTicksSet = combinedTicksSet.reduce(
    (acc, tickObject, idx) => {
      if (acc.valueMap[tickObject.value]) {
        if (tickObject.type === 'big') {
          acc.values[acc.values.length - 1] = tickObject;
        }
        return acc;
      }

      acc.valueMap[tickObject.value] = true;
      acc.values.push(tickObject);
      return acc;
    },
    { values: [], valueMap: {} }
  ).values;

  return combinedTicksSet;
};

const renderTicks = (config, extraCallbacks, CLASS_NAME) => {
  const {
    tickBarPosition,
    tickWrapStyle,
    tickStep,
    smallTickStep,
    handleSize,
    renderStartTickBar,
    renderEndTickBar
  } = config;

  const { handleClickOnTick } = extraCallbacks;

  let ticks = config.ticks;

  if (!ticks && (tickStep || smallTickStep)) {
    ticks = generateLabeldTickSteps(config);
  }

  if (!ticks || !ticks.length) {
    return;
  }

  const ticksContent = ticks.map(tick =>
    renderTick(tick, config, extraCallbacks, CLASS_NAME)
  );

  const tickWrapperProps = {
    onClick: handleClickOnTick,
    style: tickWrapStyle,
    children: ticksContent
  };

  if (tickBarPosition === 'both') {
    return [
      <div
        key="first-tick-set"
        {...tickWrapperProps}
        className={getTickWrapClassNames(
          config,
          'tick-bars-position-start',
          CLASS_NAME
        )}
      />,
      <div
        key="second-tick-set"
        {...tickWrapperProps}
        className={getTickWrapClassNames(
          config,
          'tick-bars-position-end',
          CLASS_NAME
        )}
      />
    ];
  }

  return (
    <div
      key="tick-set"
      {...tickWrapperProps}
      className={getTickWrapClassNames(
        config,
        `tick-bars-position-${tickBarPosition}`,
        CLASS_NAME
      )}
    />
  );
};

const getTickClassNames = (
  tickValue,
  tickType,
  {
    noFill,
    startValue,
    rtl,
    horizontal,
    endValue,
    currentValue,
    trackFillPosition
  },
  CLASS_NAME
) => {
  let isCurrent = false,
    isContined = false;
  const isRangeValue = Array.isArray(currentValue);

  if (rtl && horizontal) {
    trackFillPosition = trackFillPosition === 'start' ? 'end' : 'start';
  }

  if (isRangeValue) {
    isCurrent = tickValue === currentValue[0] || tickValue == currentValue[1];
    isContined = isContainedInRange(tickValue, [
      currentValue[0],
      currentValue[1]
    ]);
  } else {
    isCurrent = tickValue === currentValue;
    isContined = isValueContainedBySelection(tickValue, {
      currentValue,
      trackFillPosition,
      endValue,
      startValue
    });
  }

  return join(
    `${CLASS_NAME}__tick`,
    `${CLASS_NAME}__tick--${tickType}`,
    tickValue === startValue && `${CLASS_NAME}__tick--start-value`,
    tickValue === endValue && `${CLASS_NAME}__tick--end-value`,
    isCurrent && `${CLASS_NAME}__tick--current-value`,
    !noFill && isContined && `${CLASS_NAME}__tick--contained-value`
  );
};

const renderTick = (tick, config, extraCallbacks, CLASS_NAME) => {
  let tickValue;
  let tickStyle;
  let type = 'big';

  if (typeof tick == 'object') {
    tickValue = tick.value;
    tickStyle = tick.style;
    type = tick.type || type;
  } else {
    tickValue = tick;
  }

  const {
    renderTickContent,
    renderTickLabel,
    startValue,
    endValue,
    currentValue,
    trackFillPosition,
    horizontal,
    smallTickPercentage,
    tickLabels
  } = config;

  var side = horizontal ? 'left' : 'top';
  var style = { ...config.tickStyle, ...tickStyle };

  style[side] = `${getPossitionOfValueBasedOnLimits(tickValue, config) * 100}%`;

  if (tickValue === 100) {
    style[side] = `calc(${getPossitionOfValueBasedOnLimits(tickValue, config) *
      100}% - 1px)`;
  }

  var tickProps = {
    className: getTickClassNames(tickValue, type, config, CLASS_NAME),
    key: `${tickValue}-tick`,
    children:
      type === 'big' &&
      tickLabels &&
      renderTickLabel(
        { className: `${CLASS_NAME}__tick-label` },
        { tickValue }
      ),
    'data-value': tickValue,
    style
  };

  return renderTickContent(tickProps);
};

const getTickWrapClassNames = (config, extraClassModifier, CLASS_NAME) => {
  const { tickBarPosition } = config;
  const TICK_WRAPPER_CLASS_NAME = `${CLASS_NAME}__tick-wrap`;
  return join(
    TICK_WRAPPER_CLASS_NAME,
    extraClassModifier && `${TICK_WRAPPER_CLASS_NAME}--${extraClassModifier}`
  );
};

const renderTickContent = props => <div {...props} />;
const renderTickLabel = (domProps, { tickValue }) => (
  <span {...domProps}>{tickValue}</span>
);

export {
  renderTicks,
  renderTick,
  renderTickContent,
  renderTickLabel,
  getTickWrapClassNames,
  generateTickValuesBySteps,
  generateLabeldTickSteps
};
