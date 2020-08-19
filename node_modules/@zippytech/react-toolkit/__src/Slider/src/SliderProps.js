/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import renderHandle, {
  renderHandleContent,
  renderTooltipContent,
  renderTooltip,
  shouldShowTooltip
} from './utils/sub-components/handlers';

import {
  renderIncrementButton,
  renderDecrementButton
} from './utils/sub-components/control-buttons';

import { renderTrack } from './utils/sub-components/slide-track';

import { valueToStep } from './utils/value-utils';

import {
  renderTickContent,
  renderTickLabel
} from './utils/sub-components/ticks';

import { getValueModifier } from './utils/keyboard-interaction-helper';

var stringOrNumber = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);

const defaultProps = {
  rootClassName: 'zippy-react-toolkit-slider',
  orientation: 'horizontal',

  startValue: 0,
  endValue: 100,

  step: 1,
  largeStep: 10,

  statefulDrag: true,

  enableTrackClick: true,

  handleSize: {
    width: 14,
    height: 14
  },

  toStep: valueToStep,
  theme: 'default',
  tickLabels: true,

  renderTickLabel,
  renderHandleContent,
  tabIndex: 0,

  trackStyle: {},
  trackLineStyle: {},
  trackFillStyle: {},

  trackFillPosition: 'start',
  tickBarPosition: 'end',

  renderIncrementButton,
  renderDecrementButton,

  incrementButton: (
    <svg width="16" height="16" viewBox="0 0 20 21">
      <path
        fillRule="evenodd"
        d="M11,6 L9,6 L9,10 L5,10 L5,12 L9,12 L9,16 L11,16 L11,12 L15,12 L15,10 L11,10 L11,6 L11,6 Z M10,1 C4.48,1 0,5.48 0,11 C0,16.52 4.48,21 10,21 C15.52,21 20,16.52 20,11 C20,5.48 15.52,1 10,1 L10,1 Z M10,19 C5.59,19 2,15.41 2,11 C2,6.59 5.59,3 10,3 C14.41,3 18,6.59 18,11 C18,15.41 14.41,19 10,19 L10,19 Z"
      />
    </svg>
  ),

  decrementButton: (
    <svg width="16" height="16" viewBox="0 0 20 21">
      <path
        fillRule="evenodd"
        d="M5,10 L5,12 L15,12 L15,10 L5,10 Z M10,1 C4.48,1 0,5.48 0,11 C0,16.52 4.48,21 10,21 C15.52,21 20,16.52 20,11 C20,5.48 15.52,1 10,1 L10,1 Z M2,11 C2,6.59 5.59,3 10,3 C14.41,3 18,6.59 18,11 C18,15.41 14.41,19 10,19 C5.59,19 2,15.41 2,11 Z"
      />
    </svg>
  ),

  shiftDelay: 45,

  tickStep: 50,
  tickStyle: {},

  smallTickStep: 10,

  tooltipPosition: 'before',
  tooltipVisibility: 'onInteraction',

  updateValueOnTrackDrag: false,

  renderTrack,
  renderHandle,
  renderTickContent,
  renderTooltipContent,
  getValueModifier,
  renderTooltip,
  shouldShowTooltip
};

const propTypes = {
  rootClassName: PropTypes.string,
  startValue: PropTypes.number.isRequired,
  endValue: PropTypes.number.isRequired,

  value: PropTypes.number,
  defaultValue: PropTypes.number,

  step: PropTypes.number,
  largeStep: PropTypes.number,

  toStep: PropTypes.func,

  minRange: PropTypes.number,
  maxRange: PropTypes.number,

  onDrag: PropTypes.func,
  onChange: PropTypes.func,
  onDragEnd: PropTypes.func,
  onDragStart: PropTypes.func,

  statefulDrag: PropTypes.bool,

  tickStep: PropTypes.number,
  smallTickStep: PropTypes.number,
  ticks: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.number])
  ),

  tickStyle: PropTypes.object,

  trackFillStyle: PropTypes.object,
  trackStyle: PropTypes.object,
  trackLineStyle: PropTypes.object,

  renderTickContent: PropTypes.func,
  renderTickLabel: PropTypes.func,

  handleSize: PropTypes.object,
  handleStyle: PropTypes.object,
  renderHandleContent: PropTypes.func,
  renderTooltipContent: PropTypes.func,

  orientation: PropTypes.oneOf(['horizontal', 'vertical']),

  theme: PropTypes.string,
  tickLabels: PropTypes.bool,

  tabIndex: PropTypes.number,
  noFill: PropTypes.bool,

  trackFillPosition: PropTypes.oneOf(['start', 'end']),
  tickBarPosition: PropTypes.oneOf(['start', 'end', 'both', 'none']),

  rtl: PropTypes.bool,
  skipEdgeTicks: PropTypes.bool,

  showButtons: PropTypes.bool,
  renderIncrementButton: PropTypes.func,
  renderDecrementButton: PropTypes.func,
  incrementButton: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  decrementButton: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

  shiftDelay: PropTypes.number,
  enableTrackClick: PropTypes.bool,

  tooltipPosition: PropTypes.oneOf(['before', 'after']),
  tooltipVisibility: PropTypes.oneOf(['always', 'never', 'onInteraction']),

  renderTrack: PropTypes.func,
  getValueModifier: PropTypes.func,
  renderTooltip: PropTypes.func,
  renderHandle: PropTypes.func,
  shouldShowTooltip: PropTypes.func,

  updateValueOnTrackDrag: PropTypes.bool
};

export { defaultProps, propTypes };
