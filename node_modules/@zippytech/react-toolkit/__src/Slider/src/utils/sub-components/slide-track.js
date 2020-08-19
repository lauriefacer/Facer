/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import join from '../../../../common/join';

import { getPossitionOfValueBasedOnLimits } from '../value-utils';
import { convertProcentageRangeToPositionStyles } from '../styling-utils';

const getTrackFillPercentages = config => {
  const {
    currentValue,
    startValue,
    endValue,
    isReversed,
    trackFillPosition
  } = config;

  if (Array.isArray(currentValue)) {
    let [start, end] = [
      getPossitionOfValueBasedOnLimits(currentValue[0], {
        startValue,
        endValue
      }),
      getPossitionOfValueBasedOnLimits(currentValue[1], {
        startValue,
        endValue
      })
    ];
    return [Math.min(start, end), Math.max(start, end)];
  }
  if (trackFillPosition === 'start') {
    return [
      0,
      getPossitionOfValueBasedOnLimits(currentValue, { startValue, endValue })
    ];
  }
  return [
    getPossitionOfValueBasedOnLimits(currentValue, { startValue, endValue }),
    1
  ];
};

const getTrackFillPercentagesBasedOnRtl = config => {
  const {
    horizontal,
    trackFillPosition,
    rtl,
    currentValue,
    startValue,
    endValue,
    isReversed
  } = config;

  let computedTrackFillPosition = trackFillPosition;

  if (horizontal) {
    if (rtl) {
      if (trackFillPosition === 'end') {
        computedTrackFillPosition = 'start';
      } else {
        computedTrackFillPosition = 'end';
      }
    }
  }

  return getTrackFillPercentages({
    currentValue,
    startValue,
    endValue,
    isReversed,
    trackFillPosition: computedTrackFillPosition
  });
};

const renderTrack = (config, extraConfig, CLASS_NAME) => {
  const {
    noFill,
    trackStyle,
    horizontal,
    trackLineStyle,
    tickBarPosition,
    orientation
  } = config;

  const trackFillStyle = {
    ...config.trackFillStyle,
    ...convertProcentageRangeToPositionStyles(
      getTrackFillPercentagesBasedOnRtl(config),
      horizontal
    )
  };

  const {
    handlerComponents,
    handleTrackMouseDown,
    handleTrackClick,
    setTrackLineRef,
    setTrackFillRef,
    tabIndex,
    focused,
    endhandle,
    startHandle
  } = extraConfig;

  let trackClassName = `${CLASS_NAME}__track`;
  trackClassName = join(trackClassName, `${trackClassName}-${tickBarPosition}`);

  const classNames = join(
    trackClassName,
    focused && `${CLASS_NAME}__track--focused`
  );
  const tarckFillClassNames = join(
    `${CLASS_NAME}__track-fill`,
    focused && `${CLASS_NAME}__track-fill--focused`
  );

  return (
    <div
      key="track"
      className={classNames}
      style={trackStyle}
      onClick={handleTrackClick}
      onMouseDown={handleTrackMouseDown}
    >
      <div
        ref={setTrackLineRef}
        className={`${CLASS_NAME}__track-line`}
        style={trackLineStyle}
      >
        {!noFill && (
          <div
            ref={setTrackFillRef}
            className={tarckFillClassNames}
            tabIndex={tabIndex}
            style={trackFillStyle}
          />
        )}
        {handlerComponents}
      </div>
    </div>
  );
};

export { renderTrack, getTrackFillPercentages };
