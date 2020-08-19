/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import cleanProps from '../../common/cleanProps';
import autoBind from '@zippytech/react-class/autoBind';
import Region from '@zippytech/region';
import shouldComponentUpdate from '../../common/shouldComponentUpdate';

import hasTouch from '@zippytech/has-touch';
import raf from '../../common/raf';

import { getHandleStyle } from './utils/sub-components/handlers';

import {
  getPossitionOfValueBasedOnLimits,
  getValueForPercentage,
  toValue,
  getValue,
  shiftRangeByValue,
  shiftLowerEdgeOfRange,
  shiftUpperEdgeOfRange
} from './utils/value-utils';

import {
  renderControlButtonsWrapper,
  renderIncrementButton,
  renderDecrementButton
} from './utils/sub-components/control-buttons';

import { renderTicks } from './utils/sub-components/ticks';

import handleDragInteraction from './utils/drag-interaction-handler';

import getDeltaValueBasedOnKeyDownEvent from './utils/keyboard-interaction-helper';

import { defaultProps, propTypes } from './SliderProps';

import getClassNames from './utils/get-class-names';

const getCurrentValue = (props, state, isReversed) => {
  const { value, startValue, endValue, statefulDrag, rtl } = props;
  const { value: stateValue, dragging } = state;

  let currentValue = null;

  if (statefulDrag && dragging) {
    if (typeof stateValue !== 'undefined') {
      currentValue = stateValue;
    } else {
      currentValue = value;
    }
  }

  if (currentValue === null) {
    currentValue = toValue(
      typeof value !== 'undefined' ? value : stateValue,
      props
    );
  }

  if (startValue > endValue && currentValue[0] < currentValue[1]) {
    currentValue = [currentValue[1], currentValue[0]];
  }

  return shiftRangeByValue(0, { ...props, isReversed, currentValue });
};

const getProps = (props, state) => {
  const {
    orientation,
    rtl,
    startValue,
    endValue,
    shouldShowTooltip,
    rootClassName
  } = props;

  const horizontal = orientation === 'horizontal';

  let parsedStartValue = startValue;
  let parsedEndValue = endValue;

  if (rtl && horizontal) {
    parsedStartValue = endValue;
    parsedEndValue = startValue;
  }

  const isReversed = parsedStartValue > parsedEndValue;

  const newPropsBasedOnRtl = {
    ...props,
    startValue: parsedStartValue,
    endValue: parsedEndValue
  };

  const currentValue = getCurrentValue(newPropsBasedOnRtl, state, isReversed);

  const handleStyle = getHandleStyle(
    props.handleSize,
    newPropsBasedOnRtl,
    state
  );
  const isControlled = newPropsBasedOnRtl.value;

  const className = getClassNames(props, state, rootClassName);

  const onDrag = null;

  const visibleTooltip = shouldShowTooltip(props, state);

  const {
    dragging,
    dragTarget,
    focused,
    focusTarget,
    trackFillFocused,
    startHandleFocused,
    endHandleFocused,
    mouseOver
  } = state;

  return {
    ...newPropsBasedOnRtl,
    style: { ...props.style },
    handleStyle,
    currentValue: [...currentValue],
    className,
    onDrag,
    horizontal,
    trackFillPosition: 'start',

    isControlled,
    isReversed,

    dragging,
    dragTarget,
    mouseOver,
    focused,
    focusTarget,
    trackFillFocused,
    startHandleFocused,
    endHandleFocused,
    visibleTooltip
  };
};

const getInitialValue = props => {
  const { defaultValue, value, startValue, endValue } = props;

  if (typeof value !== 'undefined') {
    return null;
  }

  if (typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  if (typeof startValue !== 'undefined' && typeof endValue !== 'undefined') {
    return [startValue, endValue];
  }

  throw new Error(
    'Improper initialisation. Provide either a value, default value or start&end value'
  );
};

const getNewValueBasedOnKeyDownOnTrackFill = (event, config) => {
  const diff = getDeltaValueBasedOnKeyDownEvent(event, config);

  if (diff !== null) {
    return shiftRangeByValue((config.isReversed ? -1 : 1) * diff, config);
  }

  return null;
};

const getNewValueBasedOnKeyDownOnStartHandle = (event, config) => {
  const diff = getDeltaValueBasedOnKeyDownEvent(event, config);

  if (diff !== null) {
    return shiftLowerEdgeOfRange((config.isReversed ? -1 : 1) * diff, config);
  }

  return null;
};

const getNewValueBasedOnKeyDownOnEndHandle = (event, config) => {
  const diff = getDeltaValueBasedOnKeyDownEvent(event, config);

  if (diff !== null) {
    return shiftUpperEdgeOfRange((config.isReversed ? -1 : 1) * diff, config);
  }

  return null;
};

const getDragRegions = ({ handleNode, rootNode, handleSize }) => {
  const targetRegion = Region.from(handleNode);
  const constrainRegion = Region.from(rootNode);

  const halfHandleSize = handleSize / 2;
  constrainRegion.left -= halfHandleSize;
  constrainRegion.right += halfHandleSize;
  constrainRegion.top += halfHandleSize;
  constrainRegion.bottom += halfHandleSize;

  return { constrainRegion, targetRegion };
};

const getTupleWithReplacedClosestNumber = (value, config) => {
  const { currentValue, endValue, startValue, isReversed } = config;

  let newTuple = [...currentValue];
  let [start, end] = currentValue;

  if (isReversed) {
    let [reversedStart, reversedEnd] = getTupleWithReplacedClosestNumber(
      value,
      {
        ...config,
        currentValue: [end, start],
        isReversed: false,
        startValue: endValue,
        endValue: startValue
      }
    );

    return [reversedEnd, reversedStart];
  }

  if (value <= start) {
    newTuple = shiftLowerEdgeOfRange(-1 * (start - value), config);
  } else if (value >= currentValue[1]) {
    newTuple = shiftUpperEdgeOfRange(value - end, config);
  } else {
    const middleOfInterval = start + Math.abs(end - start) / 2;

    if (value <= middleOfInterval) {
      newTuple = shiftLowerEdgeOfRange(value - start, config);
    } else if (value <= end) {
      newTuple = shiftUpperEdgeOfRange(-1 * (end - value), config);
    }
  }

  return newTuple;
};

const getNewValueBasedOnWheelOnTrackFill = (event, config) => {
  const { deltaY } = event;
  const { step, largeStep, isReversed, getValueModifier } = config;

  const diff =
    (isReversed ? -1 : 1) *
    (getValueModifier(event, config) * (deltaY > 0 ? -1 : 1));

  return shiftRangeByValue(diff, config);
};

const getNewValueBasedOnWheelOnStartHandle = (event, config) => {
  const { deltaY } = event;
  const { step, largeStep, isReversed, getValueModifier } = config;

  const diff =
    (isReversed ? -1 : 1) *
    (getValueModifier(event, config) * (deltaY > 0 ? -1 : 1));

  return shiftLowerEdgeOfRange(diff, config);
};

const getNewValueBasedOnWheelOnEndHandle = (event, config) => {
  const { deltaY } = event;
  const { step, largeStep, isReversed, getValueModifier } = config;

  const diff =
    (isReversed ? -1 : 1) *
    (getValueModifier(event, config) * (deltaY > 0 ? -1 : 1));

  return shiftUpperEdgeOfRange(diff, config);
};

class ReactRangeSlider extends Component {
  constructor(props) {
    super(props);
    autoBind(this);

    this.state = {
      value: getInitialValue(props)
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState);
  }

  setStartHandleRef(el) {
    this._startHandle = el;
  }

  setEndHandleRef(el) {
    this._endHandle = el;
  }

  setTrackLineRef(el) {
    this._trackLine = el;
  }

  setTrackFillRef(el) {
    this._trackFill = el;
  }

  handleMouseEnter() {
    this.setState({
      mouseOver: true
    });
  }

  handleMouseLeave() {
    this.setState({
      mouseOver: false
    });
  }

  handleTrackClick(event) {
    const {
      enableTrackClick,
      currentValue,
      startValue,
      endValue,
      minRange,
      maxRange
    } = this.p;

    if (!enableTrackClick || this._handledDragOnTrackBar) {
      this._handledDragOnTrackBar = false;
      return;
    }

    const { horizontal, handleStyle } = this.p;

    var region = Region.from(this.getTrackDOMNode());
    var dragSize = this.getAvailableDragSize();
    var handleSize = handleStyle[horizontal ? 'width' : 'height'];

    var offset = horizontal
      ? event.clientX - region.left
      : event.clientY - region.top;

    var percentage = offset * 100 / dragSize;

    const valueAsMouseEvent = getValueForPercentage(percentage, this.p);
    const newValue = getTupleWithReplacedClosestNumber(
      valueAsMouseEvent,
      this.p
    );
    this.setValue(newValue);
  }

  handleTrackMouseDown(event) {
    const {
      currentValue,
      isControlled,
      onChange,
      handleSize,
      statefulDrag,
      onDrag,
      startValue,
      endValue,
      minRange,
      maxRange,
      step,
      isReversed
    } = this.p;

    const { targetRegion, constrainRegion } = getDragRegions({
      handleNode: this._trackFill,
      rootNode: findDOMNode(this),
      handleSize
    });

    handleDragInteraction(event, this.p, {
      currentValue: currentValue[0],
      targetRegion,
      constrainRegion,
      dragSize: this.getAvailableDragSize(),

      onHandleDragStart: () => {
        const stateProps = { dragging: true, dragTarget: 'trackHandler' };
        if (!isControlled || statefulDrag) {
          stateProps.value = currentValue;
        }
        this.setState(stateProps);
      },

      onHandleDrag: (newValue, diffValue) => {
        if (!diffValue) {
          return;
        }

        const relativeDiff =
          diffValue - (this.p.currentValue[0] - currentValue[0]);

        const newTuple = shiftRangeByValue(relativeDiff, {
          currentValue: this.p.currentValue,
          startValue,
          endValue,
          minRange,
          maxRange,
          step,
          isReversed
        });

        this._handledDragOnTrackBar = true;

        this.setValue(newTuple);
        this.props.onDrag && this.props.onDrag(newTuple);
      },

      onHandleDragEnd: () => {
        const { currentValue } = this.p;
        this.setState({
          dragging: false,
          dragTarget: false
        });
        this.notify(currentValue);
      }
    });
  }

  handleMouseDownOnStartHandle(event) {
    event.stopPropagation();

    const {
      currentValue,
      isControlled,
      onChange,
      handleSize,
      statefulDrag,
      onDrag,
      startValue,
      endValue,
      maxRange,
      minRange,
      step,
      isReversed
    } = this.p;

    const { targetRegion, constrainRegion } = getDragRegions({
      handleNode: this._startHandle,
      rootNode: findDOMNode(this),
      handleSize
    });

    handleDragInteraction(event, this.p, {
      currentValue: currentValue[0],
      targetRegion,
      constrainRegion,
      dragSize: this.getAvailableDragSize(),

      onHandleDragStart: () => {
        const stateProps = { dragging: true, dragTarget: 'startHandler' };
        if (!isControlled || statefulDrag) {
          stateProps.value = currentValue;
        }
        this.setState(stateProps);
        this.props.onDragStart && this.props.onDragStart(this.p.currentValue);
      },

      onHandleDrag: (newValue, diffValue) => {
        if (!diffValue) {
          return;
        }

        const relativeDiff =
          diffValue - (this.p.currentValue[0] - currentValue[0]);
        const newTuple = shiftLowerEdgeOfRange(relativeDiff, {
          currentValue: this.p.currentValue,
          startValue,
          endValue,
          minRange,
          maxRange,
          step,
          isReversed
        });

        this.setValue(newTuple);
        onDrag && onDrag(newTuple);
      },

      onHandleDragEnd: () => {
        const { currentValue } = this.p;
        this.setState({
          dragging: false,
          dragTarget: false
        });
        this.notify(currentValue);
        this.props.onDragEnd && this.props.onDragEnd(this.p.currentValue);
      }
    });
  }

  handleMouseDownOnEndHandle(event) {
    event.stopPropagation();
    const {
      currentValue,
      isControlled,
      onChange,
      handleSize,
      statefulDrag,
      onDrag,
      startValue,
      endValue,
      maxRange,
      minRange,
      step,
      isReversed
    } = this.p;

    const { targetRegion, constrainRegion } = getDragRegions({
      handleNode: this._endHandle,
      rootNode: findDOMNode(this),
      handleSize
    });

    handleDragInteraction(event, this.p, {
      currentValue: currentValue[1],
      targetRegion,
      constrainRegion,
      dragSize: this.getAvailableDragSize(),

      onHandleDragStart: () => {
        const stateProps = { dragging: true, dragTarget: 'endHandler' };
        if (!isControlled || statefulDrag) {
          stateProps.value = currentValue;
        }
        this.setState(stateProps);
        this.props.onDragStart && this.props.onDragStart(this.p.currentValue);
      },

      onHandleDrag: (newValue, diffValue) => {
        if (!diffValue) {
          return;
        }
        const relativeDiff =
          diffValue - (this.p.currentValue[1] - currentValue[1]);

        const newTuple = shiftUpperEdgeOfRange(relativeDiff, {
          currentValue: this.p.currentValue,
          startValue,
          endValue,
          minRange,
          maxRange,
          step,
          isReversed
        });
        this.setValue(newTuple);
        onDrag && onDrag(newTuple);
      },

      onHandleDragEnd: () => {
        const { currentValue } = this.p;
        this.setState({
          dragging: false,
          dragTarget: false
        });
        this.notify(currentValue);
        this.props.onDragEnd && this.props.onDragEnd(this.p.currentValue);
      }
    });
  }

  handleFocus(event) {
    const { target: focusTarget } = event;

    clearTimeout(this._blurOperation);

    const stateProps = {
      focused: true,
      focusTarget
    };

    if (focusTarget === this._trackFill) {
      stateProps.trackFillFocused = true;
    } else if (focusTarget === this._startHandle) {
      stateProps.startHandleFocused = true;
    } else if (focusTarget === this._endHandle) {
      stateProps.endHandleFocused = true;
    }

    this.setState(stateProps);
  }

  handleClickOnTick(event) {
    let currentTarget = event.target;

    while (typeof currentTarget.dataset.value === 'undefined') {
      currentTarget = currentTarget.parentNode;
    }

    const { currentValue, startValue, endValue, minRange, maxRange } = this.p;

    if (currentTarget) {
      const currentTargetValue = new Number(currentTarget.dataset.value);
      const newValue = getTupleWithReplacedClosestNumber(
        currentTargetValue,
        this.p
      );
      this.setValue(newValue);
    }
  }

  handleBlur(event) {
    this.setState({
      focusTarget: null,
      trackFillFocused: false,
      startHandleFocused: false,
      endHandleFocused: false
    });

    this._blurOperation = setTimeout(() => {
      this.setState({
        focused: false
      });
    });
  }

  handleKeyDown(event) {
    const {
      focusTarget,
      currentValue,

      trackFillFocused,
      startHandleFocused,
      endHandleFocused
    } = this.p;

    let newValue = null;

    if (trackFillFocused) {
      newValue = getNewValueBasedOnKeyDownOnTrackFill(event, this.p);
    } else if (startHandleFocused) {
      newValue = getNewValueBasedOnKeyDownOnStartHandle(event, this.p);
    } else if (endHandleFocused) {
      newValue = getNewValueBasedOnKeyDownOnEndHandle(event, this.p);
    }

    if (newValue !== null) {
      event.preventDefault();
      event.stopPropagation();
      this.setValue(newValue);
    }
  }

  handleWheel(event) {
    const {
      focusTarget,
      currentValue,

      trackFillFocused,
      startHandleFocused,
      endHandleFocused
    } = this.p;

    let newValue;

    if (trackFillFocused) {
      newValue = getNewValueBasedOnWheelOnTrackFill(event, this.p);
    } else if (startHandleFocused) {
      newValue = getNewValueBasedOnWheelOnStartHandle(event, this.p);
    } else if (endHandleFocused) {
      newValue = getNewValueBasedOnWheelOnEndHandle(event, this.p);
    }

    event.preventDefault();
    event.stopPropagation();

    this.setValue(newValue);
  }

  getHandle() {
    return this._startHandle;
  }

  getTrackDOMNode() {
    return this._trackLine;
  }

  getAvailableDragSize(props) {
    const { horizontal } = this.p;
    var region = Region.from(this.getTrackDOMNode());

    return horizontal ? region.width : region.height;
  }

  getRegion() {
    return Region.from(findDOMNode(this));
  }

  notify(value) {
    const { onChange } = this.p;
    onChange && onChange(value);
  }

  setValue(value) {
    const newValue = toValue(value, this.p);
    const { isControlled, onDrag, statefulDrag } = this.p;
    const { dragging } = this.state;

    if (!isControlled || (statefulDrag && dragging)) {
      raf(() => {
        this.setState({
          value: newValue
        });
      });
    }

    this.notify(newValue);
  }

  renderStartHandle() {
    const {
      visibleTooltip,
      tabIndex,
      startHandleFocused,
      currentValue,
      focused,
      mouseOver,
      renderHandle,
      rootClassName
    } = this.p;

    return renderHandle(
      this.p,
      {
        key: 'startHandler',
        tabIndex,
        handleValue: currentValue[0],
        focused: startHandleFocused,
        offset: getPossitionOfValueBasedOnLimits(currentValue[0], this.p) * 100,
        onMouseDown: this.handleMouseDownOnStartHandle,
        setHandleRef: this.setStartHandleRef,
        visibleTooltip
      },
      rootClassName
    );
  }

  renderEndHandle() {
    const {
      visibleTooltip,
      tabIndex,
      endHandleFocused,
      currentValue,
      focused,
      mouseOver,
      renderHandle,
      rootClassName
    } = this.p;

    return renderHandle(
      this.p,
      {
        key: 'endHandler',
        focused: endHandleFocused,
        tabIndex,
        handleValue: currentValue[1],
        offset: getPossitionOfValueBasedOnLimits(currentValue[1], this.p) * 100,
        onMouseDown: this.handleMouseDownOnEndHandle,
        setHandleRef: this.setEndHandleRef,
        visibleTooltip
      },
      rootClassName
    );
  }

  render() {
    const { props, state } = this;

    const {
      tabIndex,
      className,
      focused,
      wrapStyle,
      currentValue,
      trackFillFocused,
      startHandleFocused,
      endHandleFocused,
      renderTrack,
      tickBarPosition,
      rootClassName
    } = (this.p = getProps(props, state));

    const startHandle = this.renderStartHandle();
    const endhandle = this.renderEndHandle();
    const handlerComponents = [startHandle, endhandle];

    var track = renderTrack(
      this.p,
      {
        handlerComponents,
        handleTrackMouseDown: this.handleTrackMouseDown,
        setTrackLineRef: this.setTrackLineRef,
        setTrackFillRef: this.setTrackFillRef,
        focused: trackFillFocused,
        tabIndex
      },
      rootClassName
    );

    let ticks = null;
    if (tickBarPosition !== 'none') {
      ticks = renderTicks(
        this.p,
        {
          handleClickOnTick: this.handleClickOnTick
        },
        rootClassName
      );
    }

    let sliderInput = [ticks, track];

    return (
      <div
        {...cleanProps(props, ReactRangeSlider.propTypes)}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onKeyDown={this.handleKeyDown}
        onWheel={focused ? this.handleWheel : null}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        className={className}
        onClick={this.handleTrackClick}
      >
        <div className={`${rootClassName}__wrap`} style={wrapStyle}>
          {sliderInput}
        </div>
      </div>
    );
  }
}

ReactRangeSlider.defaultProps = {
  ...defaultProps,
  minRange: 1,
  maxRange: Infinity,
  rootClassName: 'zippy-react-toolkit-slider'
};

ReactRangeSlider.propTypes = {
  ...propTypes,
  rootClassName: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.number),
  defaultValue: PropTypes.arrayOf(PropTypes.number),
  minRange: PropTypes.number,
  maxRange: PropTypes.number
};

export default ReactRangeSlider;
