/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cleanProps from '../../common/cleanProps';
import ColorPalette from '../../ColorPalette';
import Button from '../../Button';
import EditColorPicker from './EditColorPicker';
import join from '../../common/join';

import normalizePalette from './utils/normalizePalette';
import addColor from './utils/addColor';

class ZippyCustomColorPalette extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleItemClick = this.handleItemClick.bind(this);
    this.handleColorPick = this.handleColorPick.bind(this);
    this.handleColorPickDismiss = this.handleColorPickDismiss.bind(this);
  }

  componentWillUnmount() {
    this.newColorRequestResolve = null;
  }

  render() {
    const { props } = this;
    const className = join(
      props.rootClassName,
      props.className,
      props.rtl && `${props.rootClassName}--rtl`,
      `${props.rootClassName}--theme-${props.theme}`
    );

    return (
      <div
        className={className}
        {...cleanProps(props, ZippyCustomColorPalette.propTypes)}
      >
        {!props.showColoPicker && this.renderButton()}
        {!props.showColoPicker && this.renderColorPalette()}
        {props.showColoPicker && this.renderColorPicker()}
      </div>
    );
  }

  renderColorPicker() {
    const { props } = this;

    const colorPickerProps = {
      defaultValue: props.value,
      onChange: this.handleColorPick,
      onDismiss: this.handleColorPickDismiss,
      renderOkButton: props.renderOkButton,
      renderCancelButton: props.renderCancelButton,
      colorPickerProps: props.colorPickerProps
    };

    // renderColorPicker

    let result;
    if (typeof props.renderColorPicker === 'function') {
      result = props.renderColorPicker({
        colorPickerProps,
        onDismiss: this.handleColorPickDismiss,
        onChange: this.handleColorPick
      });
    }

    if (result === undefined) {
      result = <EditColorPicker {...colorPickerProps} />;
    }

    return result;
  }

  renderButton() {
    const className = `${this.props.rootClassName}__button`;
    const domProps = {
      onClick: this.handleButtonClick,
      className: className
    };

    return <Button {...domProps}>Custom Color...</Button>;
  }

  handleButtonClick() {
    this.handleNewColorRequest();
  }

  renderColorPalette() {
    const paletteProps = {
      palette: this.getNormalizedPalette(),
      onItemClick: this.handleItemClick,
      value: this.props.value
    };

    return <ColorPalette {...paletteProps} />;
  }

  getNormalizedPalette() {
    const { props } = this;
    const customPalette = normalizePalette({
      length: props.paletteLength,
      palette: this.getPalette(),
      value: this.props.value,
      defaultValue: this.props.value
    });

    return customPalette;
  }

  handleColorPick(color) {
    // must send the color back to custom color palette
    const newPalette = addColor({
      color,
      palette: this.getPalette()
    });
    this.props.onNewColorRequestEnd(newPalette);
    this.setPalette(newPalette);
    this.props.onColorPick(color);
  }

  handleColorPickDismiss() {
    this.newColorRequestResolve = null;
    this.props.onNewColorRequestEnd();
  }

  handleItemClick({ color, index }) {
    /**
     * If a valid color is clicked (not empty space)
     * than onChange is called
     */
    const palette = this.getPalette();
    const isColorValid = palette && palette[index] !== undefined;

    if (isColorValid) {
      this.props.onChange(color);
    } else {
      /**
       * Request a new color
       * add it to the end of the palette
       * or at the first position if it is full
       */
      this.handleNewColorRequest();
    }
  }

  handleNewColorRequest() {
    this.props.onNewColorRequest();
  }

  isPaletteControlled() {
    return this.props.palette !== undefined;
  }

  getPalette() {
    return this.isPaletteControlled() ? this.props.palette : this.state.palette;
  }

  setPalette(palette) {
    if (!this.isPaletteControlled()) {
      this.setState({ palette });
    }

    this.props.onPaletteChange(palette);
  }
}

function emptyFn() {}

ZippyCustomColorPalette.defaultProps = {
  onChange: emptyFn,
  theme: 'default',
  onNewColorRequest: emptyFn,
  onPaletteChange: emptyFn,
  onColorPick: emptyFn,
  rootClassName: 'zippy-react-toolkit-custom-color-palette',
  paletteLength: 12,
  showColoPicker: false,
  rtl: false
};

ZippyCustomColorPalette.propTypes = {
  rtl: PropTypes.bool,
  rootClassName: PropTypes.string,
  theme: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  palette: PropTypes.arrayOf(PropTypes.string),
  paletteLength: PropTypes.number,
  onPaletteChange: PropTypes.func,
  onNewColorRequest: PropTypes.func,
  onNewColorRequestEnd: PropTypes.func,
  showColoPicker: PropTypes.bool,
  onColorPick: PropTypes.func,
  renderColorPicker: PropTypes.func,
  renderOkButton: PropTypes.func,
  renderCancelButton: PropTypes.func,
  colorPickerProps: PropTypes.object
};

export default ZippyCustomColorPalette;
