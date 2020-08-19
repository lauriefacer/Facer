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
import colorPalettes from './colorPalettes';

class ZippyColorPalette extends Component {
  constructor(props) {
    super(props);

    this.state = {
      color: props.defaultValue
    };

    this.renderItem = this.renderItem.bind(this);
  }
  render() {
    const { props } = this;
    const className = join(
      props.rootClassName,
      props.className,
      `${props.rootClassName}--theme-${props.theme}`,
      props.rtl && `${props.rootClassName}--rtl`
    );
    const style = this.getColorPaletteStyle();

    const palette = Array.isArray(props.palette)
      ? props.palette
      : colorPalettes[props.palette];

    return (
      <div
        {...cleanProps(props, ZippyColorPalette.propTypes)}
        className={className}
        style={style}
      >
        {palette.map(this.renderItem)}
      </div>
    );
  }

  renderItem(color, index) {
    const { props } = this;
    const { itemSize } = props;
    const active = color === this.getValue();
    const className = join(
      `${props.rootClassName}__item`,
      (color === '#ffffff' || color === 'white') &&
        `${props.rootClassName}__item__white`,
      active && `${props.rootClassName}__item--active`
    );

    let sizeStyle;
    if (itemSize) {
      sizeStyle =
        typeof itemSize === 'number'
          ? { width: itemSize, height: itemSize }
          : itemSize;
    }

    const onChange = event => {
      this.handleChange(color, index);
      this.props.onItemClick({ color, event, index });
    };

    const domProps = {
      className,
      key: index,
      onClick: onChange,
      style: {
        ...sizeStyle,
        background: color
      }
    };

    let result;
    if (typeof props.renderItem === 'function') {
      result = props.renderItem({
        color,
        onChange,
        active
      });
    }

    if (result == null) {
      result = <div {...domProps} />;
    }

    return result;
  }

  handleChange(color) {
    if (!this.isValueControlled()) {
      this.setState({ value: color });
    }

    this.props.onChange(color);
  }

  getValue() {
    return this.isValueControlled() ? this.props.value : this.state.value;
  }

  isValueControlled() {
    return this.props.value != null;
  }

  getColorPaletteStyle() {
    const { props } = this;

    return {
      ...props.style,
      width: props.colorPaletteWidth
    };
  }
}

function emptyFn() {}

ZippyColorPalette.defaultProps = {
  palette: 'default',
  theme: 'default',
  rootClassName: 'zippy-react-toolkit-color-palette',
  itemSize: { width: 20, height: 20 },
  onChange: emptyFn,
  onItemClick: emptyFn,
  colorPaletteWidth: 265
};

ZippyColorPalette.propTypes = {
  palette: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  theme: PropTypes.string,
  rootClassName: PropTypes.string,
  itemSize: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number
    })
  ]),
  onChange: PropTypes.func,
  onItemClick: PropTypes.func,
  colorPaletteWidth: PropTypes.number
};

export default ZippyColorPalette;
