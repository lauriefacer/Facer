/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Component from '@zippytech/react-class';

import { Flex, Item } from '../../../Flex';
import DateFormatInput from '../DateFormatInput';

import assign from '../../../common/assign';
import joinFunctions from '../joinFunctions';
import assignDefined from '../assignDefined';
import join from '../../../common/join';

export default class DateFormatSpinnerInput extends Component {
  constructor(props) {
    super(props);
    this.state = { focused: false };
  }

  componentWillUnmount() {
    this.started = false;
  }

  render() {
    const props = this.props;
    const { rootClassName } = props;
    const children = React.Children.toArray(props.children);

    const input = (this.inputChild = children.filter(
      c => c && c.type == 'input'
    )[0]);
    const inputProps = input ? assign({}, input.props) : {};

    const onKeyDown = joinFunctions(props.onKeyDown, inputProps.onKeyDown);
    const onChange = joinFunctions(props.onChange, inputProps.onChange);
    const disabled = props.disabled || inputProps.disabled;

    assignDefined(inputProps, {
      size: props.size || inputProps.size,
      minDate: props.minDate || inputProps.minDate,
      maxDate: props.maxDate || inputProps.maxDate,

      changeDelay:
        props.changeDelay === undefined
          ? inputProps.changeDelay
          : props.changeDelay,

      tabIndex: props.tabIndex,

      onKeyDown,
      onChange,
      disabled,

      dateFormat:
        props.dateFormat === undefined
          ? inputProps.dateFormat
          : props.dateFormat,
      stopPropagation: props.stopPropagation,
      updateOnWheel: props.updateOnWheel,

      onBlur: this.onBlur,
      onFocus: this.onFocus
    });

    this.inputProps = inputProps;

    const arrowSize = this.props.arrowSize;

    this.arrows = {
      1: (
        <svg height={arrowSize} viewBox="2 2 20 20" width={arrowSize}>
          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
        </svg>
      ),

      '-1': (
        <svg height={arrowSize} viewBox="2 2 20 20" width={arrowSize}>
          <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" />
        </svg>
      )
    };

    const className = join(
      props.className,
      rootClassName,
      this.state.focused
        ? `${rootClassName}-spinner--focused`
        : `${rootClassName}-spinner`,
      disabled && `${rootClassName}--disabled`,
      this.isFocused() && `${rootClassName}--focused`,
      `${rootClassName}--theme-${props.theme}`
    );

    return (
      <Flex inline row className={className} disabled={props.disabled}>
        <DateFormatInput
          ref={inputDOM => {
            this.input = inputDOM;
          }}
          value={props.value}
          {...inputProps}
        />
        {this.renderArrows()}
      </Flex>
    );
  }

  renderArrows() {
    if (this.props.renderArrows) {
      return this.props.renderArrows(this.props);
    }

    return (
      <Flex
        column
        inline
        style={{
          paddingRight: 6,
          minHeight: 30,
          height: 30,
          cursor: 'pointer',
          display: 'inline-block'
        }}
      >
        {this.renderArrow(1)}
        {this.renderArrow(-1)}
      </Flex>
    );
  }

  renderArrow(dir) {
    return (
      <Item
        flexShrink={1}
        className={`${this.props.rootClassName}-spinner-arrow`}
        style={{
          height: this.props.arrowSize,
          width: this.props.arrowSize
        }}
        onMouseDown={this.onMouseDown.bind(this, dir)}
        onMouseUp={this.stop}
        onMouseLeave={this.stop}
      >
        {this.arrows[dir]}
      </Item>
    );
  }

  onMouseDown(dir, event) {
    if (this.props.disabled) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    if (this.isFocused()) {
      this.start(dir);
    } else {
      this.focus();

      setTimeout(() => {
        this.increment(dir);
      }, 1);
    }
  }

  start(dir) {
    this.started = true;
    this.startTime = Date.now();

    this.step(dir);

    this.timeoutId = setTimeout(() => {
      this.step(dir);

      this.timeoutId = setTimeout(() => {
        const lazyStep = () => {
          const delay =
            this.props.stepDelay - (Date.now() - this.startTime) / 500;
          this.step(dir, lazyStep, delay);
        };

        lazyStep();
      }, this.props.secondStepDelay);
    }, this.props.firstStepDelay);
  }

  isStarted() {
    return !!(this.started && this.input);
  }

  increment(dir) {
    this.input.onDirection(dir);
  }

  step(dir, callback, delay) {
    if (this.isStarted()) {
      this.increment(dir);

      if (typeof callback == 'function') {
        this.timeoutId = setTimeout(() => {
          if (this.isStarted()) {
            callback();
          }
        }, delay === undefined ? this.props.stepDelay : delay);
      }
    }
  }

  stop() {
    this.started = false;
    if (this.timeoutId) {
      global.clearTimeout(this.timeoutId);
    }
  }

  focus() {
    if (this.input) {
      this.input.focus();
    }
  }

  isFocused() {
    return this.state.focused;
  }

  onBlur(event) {
    const { props } = this;
    const onBlur = joinFunctions(
      props.onBlur,
      this.inputChild && this.inputChild.props && this.inputChild.props.onBlur
    );

    if (onBlur) {
      onBlur(event);
    }

    this.setState({
      focused: false
    });
  }

  onFocus(event) {
    const { props } = this;
    const onFocus = joinFunctions(
      props.onFocus,
      this.inputChild && this.inputChild.props && this.inputChild.props.onFocus
    );

    if (onFocus) {
      onFocus(event);
    }

    this.setState({
      focused: true
    });
  }
}

DateFormatSpinnerInput.defaultProps = {
  rootClassName: 'zippy-react-toolkit-calendar__date-format-spinner',
  firstStepDelay: 150,
  secondStepDelay: 100,
  stepDelay: 50,
  changeDelay: undefined,
  theme: 'default',
  disabled: false,
  arrowSize: 15,
  isDateInput: true,
  stopPropagation: true,
  updateOnWheel: true
};

DateFormatSpinnerInput.propTypes = {
  rootClassName: PropTypes.string,
  firstStepDelay: PropTypes.number,
  secondStepDelay: PropTypes.number,
  stepDelay: PropTypes.number,
  changeDelay: PropTypes.number,
  theme: PropTypes.string,
  disabled: PropTypes.bool,
  arrowSize: PropTypes.number,
  isDateInput: PropTypes.bool,
  stopPropagation: PropTypes.bool,
  updateOnWheel: PropTypes.bool
};
