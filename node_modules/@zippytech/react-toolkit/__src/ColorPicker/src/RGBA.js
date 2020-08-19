/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import join from '../../common/join';
import cleanProps from '../../common/cleanProps';
import toStringValue from './utils/toStringValue';
import toColorValue from './utils/toColorValue';
import { toHsv, toRgb, rgbToHex } from './utils/color';
import HexInput from './HexInput';
import RgbaInput from './RgbaInput';

class ZippyRGBA extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.onChange = this.onChange.bind(this);
  }

  render() {
    const { props } = this;

    const { r, g, b, a } = this.getValue();
    const hexValue = rgbToHex({ r, g, b, a });

    const className = join(props.rootClassName, props.className);

    const inputWrapperClassName = `${props.rootClassName}__input__wrapper`;
    const labelClassName = `${props.rootClassName}__label`;

    return (
      <div {...cleanProps(props, ZippyRGBA.propTypes)} className={className}>
        <div className={inputWrapperClassName}>
          <span className={labelClassName}>R</span>
          <RgbaInput
            minValue={0}
            maxValue={255}
            allowFloat={false}
            rootClassName={props.rootClassName}
            name="r"
            value={r}
            onChange={this.onRgbChange('r')}
          />
        </div>
        <div className={inputWrapperClassName}>
          <span className={labelClassName}>G</span>
          <RgbaInput
            minValue={0}
            maxValue={255}
            allowFloat={false}
            name="g"
            value={g}
            rootClassName={props.rootClassName}
            onChange={this.onRgbChange('g')}
          />
        </div>
        <div className={inputWrapperClassName}>
          <span className={labelClassName}>B</span>
          <RgbaInput
            minValue={0}
            maxValue={255}
            allowFloat={false}
            name="b"
            value={b}
            rootClassName={props.rootClassName}
            onChange={this.onRgbChange('b')}
          />
        </div>
        <div className={inputWrapperClassName}>
          <span className={labelClassName}>A</span>
          <RgbaInput
            minValue={0}
            maxValue={1}
            allowFloat={true}
            name="a"
            value={a}
            step={0.01}
            rootClassName={props.rootClassName}
            onChange={this.onRgbChange('a')}
          />
        </div>
        <HexInput
          value={hexValue}
          onChange={this.onChange}
          rootClassName={props.rootClassName}
        />
      </div>
    );
  }

  onRgbChange(name) {
    return value => {
      this.onChange({
        ...this.getValue(),
        [name]: value
      });
    };
  }

  onChange(newValue) {
    const hsvColor = toHsv(newValue);
    const stringValue = toStringValue(newValue);

    this.props.onChange(stringValue, hsvColor);
  }

  getValue() {
    const value = this.props.value;
    const color = toRgb(value);

    return color;
  }
}

function emptyFn() {}

ZippyRGBA.defaultProps = {
  rootClassName: 'zippy-react-toolkit-color-picker__rgba',
  onChange: emptyFn
};

ZippyRGBA.propTypes = {
  value: PropTypes.shape({
    r: PropTypes.number,
    g: PropTypes.number,
    b: PropTypes.number,
    a: PropTypes.number
  }),
  defaultValue: PropTypes.shape({
    r: PropTypes.number,
    g: PropTypes.number,
    b: PropTypes.number,
    a: PropTypes.number
  }),
  onChange: PropTypes.func,
  rootClassName: PropTypes.string,
  onChange: PropTypes.func
};

export default ZippyRGBA;
