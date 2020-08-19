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
import { getHandleStyle } from './utils/sub-components/handlers';
import {
  getOffset,
  getValueForPercentage,
  toValue,
  getValue
} from './utils/value-utils';

import {
  renderControlButtonsWrapper,
  renderIncrementButton,
  renderDecrementButton
} from './utils/sub-components/control-buttons';

import {
  renderTicks,
  renderTick,
  renderTickContent,
  renderTickLabel
} from './utils/sub-components/ticks';

import handleDragInteraction from './utils/drag-interaction-handler';
import getDeltaValueBasedOnKeyDownEvent from './utils/keyboard-interaction-helper';

import { defaultProps, propTypes } from './SliderProps';

import getClassNames from './utils/get-class-names';

const getCurrentValue = (props, state) => {
  const { value, statefulDrag } = props;
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

  return currentValue;
};

const getProps = (props, state) => {
  const {
    orientation,
    rtl,
    startValue,
    endValue,
    shouldShowTooltip,
    onDrag
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

  const currentValue = getCurrentValue(newPropsBasedOnRtl, state);

  const handleStyle = getHandleStyle(
    props.handleSize,
    newPropsBasedOnRtl,
    state
  );
  const isControlled = newPropsBasedOnRtl.value;

  const className = getClassNames(
    newPropsBasedOnRtl,
    state,
    props.rootClassName
  );

  const { dragging, focused, mouseOver } = state;

  const visibleTooltip = shouldShowTooltip(props, state);

  return {
    ...newPropsBasedOnRtl,
    style: { ...newPropsBasedOnRtl.style },
    handleStyle,
    currentValue,
    className,
    onDrag,
    horizontal,

    mouseOver,

    isControlled,
    isReversed,

    dragging,
    focused,
    visibleTooltip
  };
};

const getInitialValue = props => {
  const { defaultValue, value, startValue } = props;

  if (typeof value !== 'undefined') {
    return null;
  }

  if (typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  if (typeof startValue !== 'undefined') {
    return startValue;
  }

  throw new Error(
    'Improper initialisation. Provide either a value, default value or start value'
  );
};

class ZippySlider extends Component {
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

  setHandleRef(el) {
    this._handle = el;
  }

  setTrackLineRef(el) {
    this._trackLine = el;
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

  handleTrackMouseDown(event) {
    const { enableTrackClick, isReversed, updateValueOnTrackDrag } = this.p;

    if (!enableTrackClick) {
      return;
    }

    const { horizontal: horiz, handleStyle } = this.p;

    const region = Region.from(this.getTrackDOMNode());
    const dragSize = this.getAvailableDragSize();
    const handleSize = handleStyle[horiz ? 'width' : 'height'];
    const offset = horiz
      ? event.clientX - region.left
      : event.clientY - region.top;
    let percentage = offset * 100 / dragSize;
    const newValue = getValueForPercentage(percentage, this.p);

    /**
     * In case of `updateValueOnTrackDrag` when draggin the track
     * it should change the value.
     *
     * For this handleMouseDown is simulated and an initial value
     * calculated by the position of the mouseDown on the track is sent.
     */
    if (updateValueOnTrackDrag) {
      this.handleMouseDown(event, newValue);
    }

    this.setValue(newValue);
  }

  handleMouseDown(event, currentValue) {
    const {
      isControlled,
      onChange,
      handleSize,
      statefulDrag,
      onDrag,
      isReversed,
      onDragStart,
      onDragEnd
    } = this.p;
    const handleNode = this.getHandle();

    var targetRegion = Region.from(handleNode);
    var constrainRegion = Region.from(findDOMNode(this));

    const halfHandleSize = handleSize / 2;
    constrainRegion.left -= halfHandleSize;
    constrainRegion.right += halfHandleSize;
    constrainRegion.top += halfHandleSize;
    constrainRegion.bottom += halfHandleSize;

    /**
     * a different initial value can be send as param,
     * for example in case of `updateValueOnTrackDrag`
     */
    currentValue =
      typeof currentValue === 'number' ? currentValue : this.p.currentValue;

    handleDragInteraction(event, this.p, {
      currentValue,
      targetRegion,
      constrainRegion,
      dragSize: this.getAvailableDragSize(),

      onHandleDragStart: () => {
        const stateProps = { dragging: true };
        if (!isControlled || statefulDrag) {
          stateProps.value = currentValue;
        }
        this.setState(stateProps);
        if (onDragStart) {
          onDragStart(stateProps.value);
        }
      },

      onHandleDrag: (newValue, diffValue) => {
        newValue = currentValue + diffValue;
        this.setValue(newValue);
        onDrag && onDrag(newValue);
      },

      onHandleDragEnd: () => {
        const { currentValue } = this.p;
        this.setState({
          dragging: false
        });
        this.notify(currentValue);
        if (onDragEnd) {
          onDragEnd(currentValue);
        }
      }
    });
  }

  handleFocus(event) {
    this.setState({
      focused: true
    });
  }

  handleClickOnTick(event) {
    let currentTarget = event.target;

    while (typeof currentTarget.dataset.value === 'undefined') {
      currentTarget = currentTarget.parentNode;
    }

    if (currentTarget) {
      this.setValue(new Number(currentTarget.dataset.value));
    }
  }

  handleBlur(event) {
    this.setState({
      focused: false
    });
  }

  handleKeyDown(event) {
    const {
      orientation,
      step,
      startValue,
      endValue,
      currentValue,
      onChange,
      isControlled,
      isReversed
    } = this.p;

    let delta = getDeltaValueBasedOnKeyDownEvent(event, this.p);

    if (delta !== null) {
      if (isReversed) {
        delta = -delta;
      }
      const nextValue = toValue(currentValue + delta, this.p);

      this.setValue(nextValue);
      event.stopPropagation();
      event.preventDefault();
    }
  }

  handleWheel(event) {
    const { deltaMode, deltaX, deltaY, shiftKey } = event;

    const { getValueModifier, orientation, isReversed, currentValue } = this.p;

    const nextValue =
      currentValue +
      getValueModifier({ shiftKey }, this.p) *
        (deltaY > 0 ? -1 : 1) *
        (isReversed ? -1 : 1);

    event.preventDefault();
    event.stopPropagation();

    this.setValue(nextValue);
  }

  getHandle() {
    return this._handle;
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
      this.setState({
        value: newValue
      });
    }

    this.notify(newValue);
  }

  // button interaction
  // ======================================================================

  shiftValue() {
    const { currentValue } = this.p;
    this.setValue(currentValue + this.shiftConfiguration.deltaValue);
  }

  stopShifting() {
    clearInterval(this.shiftIntervalId);
    this.shiftIntervalId = this.shiftConfiguration = null;
  }

  startShifting({ deltaValue }) {
    if (this.shiftIntervalId) {
      clearInterval(this.shiftIntervalId);
    }

    this.shiftConfiguration = { deltaValue };
    this.shiftIntervalId = setInterval(this.shiftValue, this.p.shiftDelay);
  }

  handleButtonDown(stepDirection, event) {
    event.preventDefault();
    event.stopPropagation();

    const { step, largeStep } = this.p;

    var target = hasTouch ? event.target : window;
    var eventName = hasTouch ? 'touchend' : 'click';

    window.addEventListener(eventName, this.handleMouseUp);
    const { getValueModifier } = this.p;
    const valueModifier = getValueModifier(event, this.p);

    setTimeout(() => {
      this.startShifting({ deltaValue: stepDirection * valueModifier });
    }, 10);
  }

  handleMouseUp() {
    this.stopShifting();

    this.setState({
      spinDirection: null
    });

    window.removeEventListener('click', this.handleMouseUp);
  }

  handleButtonIncrement(event) {
    this.handleButtonDown(1, event);
  }

  handleButtonDecrement(event) {
    this.handleButtonDown(-1, event);
  }

  render() {
    const { props, state } = this;

    const {
      tabIndex,
      className,
      focused,
      wrapStyle,
      showButtons,
      renderTrack,
      tickBarPosition,
      currentValue,
      mouseOver,
      renderHandle,
      visibleTooltip
    } = (this.p = getProps(props, state));

    var track = renderTrack(
      this.p,
      {
        handlerComponents: renderHandle(
          this.p,
          {
            focused: this.state.focused,
            handleValue: currentValue,
            onMouseEnter: this.handleMouseEnter,
            onMouseDown: this.handleMouseDown,
            onMouseLeave: this.handleMouseLeave,
            setHandleRef: this.setHandleRef,
            visibleTooltip
          },
          props.rootClassName
        ),
        setTrackLineRef: this.setTrackLineRef
      },
      props.rootClassName
    );

    let ticks = null;
    if (tickBarPosition !== 'none') {
      ticks = renderTicks(
        this.p,
        {
          handleClickOnTick: this.handleClickOnTick
        },
        props.rootClassName
      );
    }

    let sliderInput = [ticks, track];

    if (showButtons) {
      sliderInput = renderControlButtonsWrapper(
        sliderInput,
        this.p,
        this.handleButtonIncrement,
        this.handleButtonDecrement,
        props.rootClassName
      );
    }

    return (
      <div
        {...cleanProps(props, ZippySlider.propTypes)}
        tabIndex={tabIndex}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onKeyDown={this.handleKeyDown}
        onWheel={focused ? this.handleWheel : null}
        className={className}
        onMouseDown={this.handleTrackMouseDown}
      >
        <div className={`${props.rootClassName}__wrap`} style={wrapStyle}>
          {sliderInput}
        </div>
      </div>
    );
  }
}

ZippySlider.defaultProps = defaultProps;
ZippySlider.propTypes = propTypes;

export default ZippySlider;
