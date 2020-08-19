/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cleanProps from '../../common/cleanProps';
import join from '../../common/join';
import Slider from '../../Slider';
import { toColorValue } from './utils/color';
import toStringValue from './utils/toStringValue';

class ZippyAlphaSpectrum extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.defaultValue
    };

    this.handleOnDrag = this.handleOnDrag.bind(this);
    this.renderHandleContent = this.renderHandleContent.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
  }

  render() {
    const { props } = this;
    const { type } = props;

    const isAlpha = this.isAlpha();
    const style = isAlpha ? this.getAlphaStyle() : this.getHueStyle();

    if (props.width) {
      style.width = props.width;
    }

    if (props.height) {
      style.height = props.height;
    }

    const className = join(
      props.className,
      props.rootClassName,
      `${props.rootClassName}--${type}`,
      `${props.rootClassName}__slider`
    );

    const value = isAlpha ? this.getAlphaValue() : this.getHueValue();

    let startEndValue;
    if (isAlpha) {
      startEndValue = {
        startValue: 1000,
        endValue: 0,
        step: 1
      };
    } else {
      startEndValue = {
        startValue: 0,
        endValue: 360,
        step: 1
      };
    }

    return (
      <Slider
        {...cleanProps(props, ZippyAlphaSpectrum.propTypes)}
        {...startEndValue}
        className={className}
        updateValueOnTrackDrag
        style={style}
        handleSize={{ height: 3 }}
        tooltipVisibility="never"
        tickBarPosition="none"
        orientation="vertical"
        value={value}
        onChange={this.handleOnDrag}
        onDragEnd={this.handleOnChange}
        renderHandleContent={this.renderHandleContent}
      />
    );
  }

  renderHandleContent(domProps) {
    return (
      <div
        {...domProps}
        style={{
          ...domProps.style,
          left: 0,
          right: 0,
          width: '100%'
        }}
        children={null}
        className={`${this.props.rootClassName}__handle`}
      >
        <div className={`${this.props.rootClassName}__handle__icon__right`}>
          <svg fill="#495e85" height="10" viewBox="7 7 10 10" width="10">
            <path d="M7 14l5-5 5 5z" />
            <path d="M0 0h24v24H0z" fill="none" />
          </svg>
        </div>
        <div className={`${this.props.rootClassName}__handle__icon__left`}>
          <svg fill="#495e85" height="10" viewBox="7 7 10 10" width="10">
            <path d="M7 14l5-5 5 5z" />
            <path d="M0 0h24v24H0z" fill="none" />
          </svg>
        </div>
      </div>
    );
  }

  isAlpha() {
    return this.props.type === 'alpha';
  }

  getAlphaStyle() {
    const { props } = this;
    const colorString = toStringValue({ ...this.getValue(), a: 1 });
    return {
      ...props.style,
      background: `linear-gradient(to top, #fff, ${colorString})`
    };
  }

  getHueStyle() {
    const { props } = this;

    return {
      ...props.style
    };
  }

  handleOnDrag(value) {
    const newColor = this.isAlpha()
      ? this.changeColorAlpha(value)
      : this.changeColorHue(value);

    this.setValue(newColor);
  }

  setValue(value) {
    if (!this.isValueControlled()) {
      this.setState({ value });
    }

    const stringValue = toStringValue(value);
    this.props.onDrag(stringValue, value);
  }

  handleOnChange() {
    const value = this.getValue();
    const stringValue = toStringValue(value);

    this.props.onChange(stringValue, value);
  }

  isValueControlled() {
    return this.props.value != null;
  }

  getValue() {
    const value = this.isValueControlled()
      ? this.props.value
      : this.state.value;
    const hslValue = toColorValue(value);

    return hslValue;
  }

  changeColorAlpha(value) {
    const newA =
      typeof value === 'number' ? parseFloat((value / 1000).toFixed(2)) : null;

    return {
      ...this.getValue(),
      a: newA
    };
  }

  changeColorHue(value) {
    if (value == null) {
      return null;
    }

    value = value > 360 ? 360 : value;

    return {
      ...this.getValue(),
      h: value
    };
  }

  getAlphaValue() {
    const value = this.getValue();
    return value && value.a * 1000;
  }

  getHueValue() {
    const value = this.getValue();
    return value && value.h;
  }
}

function emptyFn() {}

ZippyAlphaSpectrum.defaultProps = {
  value: null,
  defaultValue: 1,
  onChange: emptyFn,
  onDrag: emptyFn,
  rootClassName: 'zippy-react-toolkit-color-picker__slider'
};

ZippyAlphaSpectrum.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  defaultValue: PropTypes.number,
  rootClassName: PropTypes.string,
  onChange: PropTypes.func,
  onDrag: PropTypes.func,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default ZippyAlphaSpectrum;
