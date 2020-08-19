/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { getPossitionOfValueBasedOnLimits } from '../value-utils';
import join from '../../../../common/join';
import EVENT_NAMES from '../../../../common/eventNames';
import SlideTooltip from '../../SlideTooltip';

const getHandleClassNames = (config, extras, CLASS_NAME) => {
  const HANDLE_CLASS_NAME = `${CLASS_NAME}__handle`;
  const { dragging } = config;
  const { focused } = extras;

  return join(
    HANDLE_CLASS_NAME,
    dragging && `${HANDLE_CLASS_NAME}--active`,
    focused && `${HANDLE_CLASS_NAME}--focused`
  );
};

const shouldShowTooltip = (props, state) => {
  const { focused, dragging, mouseOver } = state;
  const { tooltipVisibility } = props;
  if (tooltipVisibility === 'never') {
    return false;
  }

  if (tooltipVisibility === 'always') {
    return true;
  }

  return focused || dragging || mouseOver;
};

const getPositionStyleForTooltip = config => {
  const { horizontal } = config;
  if (horizontal) {
    return { marginLeft: config.handleSize.width / 2 };
  }

  return { marginTop: config.handleSize.height / 2 };
};

const renderTooltip = (config, extraProps, CLASS_NAME) => {
  const { renderTooltipContent, orientation, tooltipPosition } = config;
  const tooltipValue = typeof extraProps.handleValue
    ? extraProps.handleValue
    : config.currentValue;

  return (
    <SlideTooltip
      style={getPositionStyleForTooltip(config)}
      visible={!!extraProps.visibleTooltip}
      position={tooltipPosition}
      orientation={orientation}
    >
      {renderTooltipContent({ children: tooltipValue }, { tooltipValue })}
    </SlideTooltip>
  );
};

const renderHandle = (config, extraProps, CLASS_NAME) => {
  const {
    currentValue: value,
    handleSize,
    horizontal,
    orientation,
    dragging,
    renderHandleContent,
    renderTooltip
  } = config;

  const {
    setHandleRef,
    onMouseDown,
    onMouseLeave,
    onMouseEnter,
    offset,
    key,
    tabIndex,
    focused,
    tooltipVisibility
  } = extraProps;

  const handleStyle = { ...config.handleStyle };
  handleSize.width = handleStyle.width;
  handleSize.height = handleStyle.height;

  var finalOffset = `${
    typeof offset !== 'undefined'
      ? offset
      : getPossitionOfValueBasedOnLimits(value, config) * 100
  }%`;

  if (horizontal) {
    handleStyle.left = finalOffset;
    handleStyle.marginLeft = -handleSize.width / 2;
    handleStyle.marginTop = handleStyle.marginBottom = 'auto';
    handleStyle.left = finalOffset;
  } else {
    handleStyle.top = finalOffset;
    handleStyle.marginTop = -handleSize.height / 2;
    handleStyle.marginLeft = handleStyle.marginRight = 'auto';
    handleStyle.top = finalOffset;
  }

  var handleProps = {
    key,
    className: getHandleClassNames(config, { focused }, CLASS_NAME),
    'data-value': value,
    orientation,
    value,
    style: handleStyle,
    ref: setHandleRef,
    onMouseLeave,
    onMouseEnter,
    tabIndex,
    children:
      tooltipVisibility !== 'never' &&
      renderTooltip(config, extraProps, CLASS_NAME)
  };

  const customProps = {
    dragging,
    value,
    focused
  };

  handleProps[EVENT_NAMES.onMouseDown] = onMouseDown;

  return renderHandleContent(handleProps, customProps);
};

const getHandleStyle = (handleSize, props, state) => {
  const { handleStyle } = props;

  if (handleStyle) {
    return {
      ...handleStyle,
      ...handleSize
    };
  }

  return { ...handleSize };
};

const renderTooltipContent = props => <div {...props} />;
const renderHandleContent = props => <div {...props} />;

export default renderHandle;

export {
  getHandleStyle,
  renderHandleContent,
  renderTooltip,
  renderTooltipContent,
  shouldShowTooltip
};
