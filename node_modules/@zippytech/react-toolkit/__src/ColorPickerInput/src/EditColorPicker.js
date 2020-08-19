/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * A ColorPicker with two buttons, on and cancel.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ColorPicker from '../../ColorPicker';
import Button from '../../Button';
import cleanProps from '../../common/cleanProps';
import join from '../../common/join';

class ZippyEditColorPicker extends Component {
  constructor(props) {
    super(props);

    const value =
      props.value || props.defaultValue || props.colorPickerDefaultValue;

    this.state = {
      value
    };

    this.handleOkClick = this.handleOkClick.bind(this);
    this.handleCancelClick = this.handleCancelClick.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
  }

  render() {
    const { props, state } = this;
    const className = join(
      props.rootClassName,
      props.className,
      `${props.rootClassName}--theme-${props.theme}`
    );
    const buttonsClassName = `${props.rootClassName}__buttons__wrapper`;

    return (
      <div
        {...cleanProps(props, ZippyEditColorPicker.propTypes)}
        className={className}
      >
        {this.renderColorPicker()}
        <div className={buttonsClassName}>
          {this.renderOkButton()}
          {this.renderCancelButton()}
        </div>
      </div>
    );
  }

  renderColorPicker() {
    const { props } = this;
    const colorPickerProps = {
      ...props.colorPickerProps,
      value: this.state.value,
      defaultValue: props.defaultValue,
      onChange: this.handleColorChange
    };

    let result;
    if (typeof props.renderColorPicker === 'function') {
      result = props.renderColorPicker({
        ...colorPickerProps,
        value: this.state.objectValue,
        onChange: this.handleColorChange
      });
    }

    if (result === undefined) {
      result = <ColorPicker {...colorPickerProps} />;
    }

    return result;
  }

  renderOkButton() {
    const { props } = this;
    const buttonProps = {
      onClick: this.handleOkClick,
      children: 'Ok'
    };

    let result;
    if (typeof props.renderOkButton === 'function') {
      result = props.renderOkButton({
        buttonProps,
        onClick: this.handleOkClick
      });
    }

    if (result === undefined) {
      result = <Button {...buttonProps} />;
    }

    return result;
  }

  renderCancelButton() {
    const { props } = this;
    const buttonProps = {
      theme: 'light',
      onClick: this.handleCancelClick,
      children: 'Cancel'
    };

    let result;
    if (typeof props.renderCancelButton === 'function') {
      result = props.renderCancelButton({
        buttonProps,
        onClick: this.handleCancelClick
      });
    }

    if (result === undefined) {
      result = <Button {...buttonProps} />;
    }

    return result;
  }

  handleOkClick() {
    this.props.onChange(this.state.value);
  }

  handleCancelClick() {
    this.props.onChange(this.props.value);
  }

  handleColorChange(stringColor, color) {
    this.setState({
      value: stringColor,
      objectValue: color
    });
  }
}

function emptyFn() {}

ZippyEditColorPicker.defaultProps = {
  rootClassName: 'zippy-react-toolkit-edit-color-picker',
  onChange: emptyFn,
  onDismiss: emptyFn,
  colorPickerDefaultValue: '#495e85'
};

ZippyEditColorPicker.propTypes = {
  rootClassName: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  colorPickerDefaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onDismiss: PropTypes.func,
  renderOkButton: PropTypes.func,
  renderCancelButton: PropTypes.func,
  colorPickerProps: PropTypes.object
};

export default ZippyEditColorPicker;
