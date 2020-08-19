/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ColorTextInput from '../../ColorTextInput';
import Button from '../../Button';
import ColorPalette from '../../ColorPalette';

import CustomColorPalette from './CustomColorPalette';

import join from '../../common/join';
import cleanProps from '../../common/cleanProps';
import registerHideOnClickOutsideEventListener from '../../common/registerHideOnClickOutsideEventListener';
import Overlay from '../../Overlay';

class ZippyColorPickerInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      focused: false,
      value: props.defaultValue,
      expanded: props.defaultExpanded,
      customPalette: props.defaultCustomPalette
    };

    this.handleExpandButtonClick = this.handleExpandButtonClick.bind(this);
    this.handleNewColorRequest = this.handleNewColorRequest.bind(this);
    this.handleNewColorRequestEnd = this.handleNewColorRequestEnd.bind(this);
    this.handleCustomPalleteChange = this.handleCustomPalleteChange.bind(this);
    this.setValue = this.setValue.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);

    this.setRootNode = ref => {
      this.rootNode = ref;
    };
  }

  componentDidMount() {
    if (this.props.collapseOnClickOutside) {
      this.unregisterOnClickOutside = registerHideOnClickOutsideEventListener({
        getRootNode: () => this.rootNode,
        onHide: () => this.collapse()
      });
    }
  }

  componentWillUnmount() {
    if (this.unregisterOnClickOutside) {
      this.unregisterOnClickOutside();
    }
  }

  render() {
    const { props, state } = this;
    const className = join(
      props.rootClassName,
      props.className,
      props.rtl && `${props.rootClassName}--rtl`,
      state.focused && `${props.rootClassName}--focused`,
      props.theme && `${props.rootClassName}--theme-${props.theme}`
    );

    return (
      <div
        {...cleanProps(props, ZippyColorPickerInput.propTypes)}
        className={className}
        ref={this.setRootNode}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
      >
        {this.renderColorTextInput()}
        {this.renderExpandButton()}
        {this.renderOverlay()}
      </div>
    );
  }

  renderOverlay() {
    const { props, state } = this;
    const showColoPicker = state.newColorRequest;

    return (
      this.isExpanded() && (
        <Overlay className={`${props.rootClassName}__overlay`}>
          {props.showColorPalette &&
            !showColoPicker &&
            this.renderColorPalette()}
          {props.showCustomPalette &&
            this.renderCustomColorPalette(showColoPicker)}
        </Overlay>
      )
    );
  }

  renderCustomColorPalette(showColoPicker) {
    const { props } = this;
    const domProps = {
      onNewColorRequest: this.handleNewColorRequest,
      onNewColorRequestEnd: this.handleNewColorRequestEnd,
      value: this.getValue(),
      onChange: this.setValue,
      onColorPick: this.setValue,
      onPaletteChange: this.handleCustomPalleteChange,
      palette: this.getCustomPalette(),
      paletteLength: props.customPaletteLength,
      showColoPicker,
      rtl: props.rtl,
      renderColorPicker: props.renderColorPicker,
      renderOkButton: props.renderOkButton,
      renderCancelButton: props.renderCancelButton,
      ...props.colorPickerProps
    };

    return <CustomColorPalette {...domProps} />;
  }

  renderExpandButton() {
    const { props } = this;

    const toggleIcon = (
      <div className={join(`${props.rootClassName}__expand-button__icon`)}>
        <svg fill="#495e85" height="24" viewBox="0 0 24 24" width="24">
          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
          <path d="M0 0h24v24H0z" fill="none" />
        </svg>
      </div>
    );

    const buttonProps = {
      className: join(
        `${props.rootClassName}__button`,
        `${props.rootClassName}__expand-button`
      ),
      theme: null,
      children: toggleIcon,
      onClick: this.handleExpandButtonClick
    };

    let result;
    if (typeof props.renderExpandButton === 'function') {
      result = props.renderExpandButton({
        ...buttonProps,
        expanded: props.expanded,
        onClick: this.handleExpandButtonClick
      });
    }

    if (result === undefined) {
      result = <Button {...buttonProps} />;
    }

    return result;
  }

  renderColorTextInput() {
    const { props } = this;
    const value = this.getValue();

    const colorTextInputProps = {
      value,
      rootClassName: `${props.rootClassName}__color-input`,
      onChange: this.setValue,
      onTextChange: props.onTextChange,
      text: props.text,
      defaultText: props.defaultText,
      onFocus: this.onFocus,
      rtl: props.rtl,
      ...props.colorTextInputProps
    };

    let result;
    if (typeof props.renderColorTextInput === 'function') {
      result = props.renderColorTextInput({
        value,
        colorTextInputProps,
        onChange: this.setValue
      });
    }

    if (result === undefined) {
      result = <ColorTextInput {...colorTextInputProps} />;
    }

    return result;
  }

  renderColorPalette() {
    const { props } = this;
    const { colorPalette, colorPaletteProps } = props;
    const value = this.getValue();
    const paletteProps = {
      value,
      className: `${props.rootClassName}__color-palette`,
      onChange: this.setValue,
      palette: colorPalette,
      ...colorPaletteProps
    };

    let result;
    if (typeof this.props.renderColorPalette === 'function') {
      result = this.props.renderColorPalette({
        ...colorPalette,
        ...paletteProps,
        onChange: this.setValue
      });
    }
    if (result === undefined) {
      result = <ColorPalette {...paletteProps} />;
    }

    return result;
  }

  focus() {
    this.rootNode.focus();
  }

  onFocus(event) {
    this.setState({
      focused: true
    });

    if (this.props.onFocus) {
      this.props.onFocus(event);
    }
  }

  onBlur(event) {
    this.setState({
      focused: false
    });

    if (this.props.onBlur) {
      this.props.onBlur(event);
    }
  }

  // value
  setValue(color) {
    if (!this.isValueControlled()) {
      this.setState({ value: color });
    }

    if (this.props.collapseOnValueChange) {
      this.collapse();
    }

    this.props.onChange(color);
  }

  getValue() {
    return this.isValueControlled() ? this.props.value : this.state.value;
  }

  isValueControlled() {
    return this.props.value != null;
  }

  // expanded
  handleExpandButtonClick() {
    const nextExpanded = !this.isExpanded();
    this.setExpanded(nextExpanded);
  }

  setExpanded(expanded) {
    if (!this.isExpandedControlled()) {
      this.setState({ expanded });
    }

    this.props.onExpandChange(expanded);
  }

  isExpanded() {
    return this.isExpandedControlled()
      ? this.props.expanded
      : this.state.expanded;
  }

  isExpandedControlled() {
    return this.props.expanded != null;
  }

  // custom palette
  isCustomPaletteControlled() {
    return this.props.customPalette !== undefined;
  }

  getCustomPalette() {
    return this.isCustomPaletteControlled()
      ? this.props.customPalette
      : this.state.customPalette;
  }

  setCustomPalette(customPalette) {
    if (!this.isCustomPaletteControlled()) {
      this.setState({ customPalette });
    }

    this.props.onCustomPaletteChange(customPalette);
  }

  handleCustomPalleteChange(palette) {
    this.setCustomPalette(palette);
  }

  collapse() {
    this.setExpanded(false);
  }

  expand() {
    this.setExpanded(true);
  }

  handleNewColorRequest() {
    this.setState({
      newColorRequest: true
    });
  }

  handleNewColorRequestEnd() {
    this.setState({
      newColorRequest: false
    });
  }
}

function emptyFn() {}

ZippyColorPickerInput.defaultProps = {
  theme: 'default',
  rootClassName: 'zippy-react-toolkit-color-picker-input',
  onChange: emptyFn,
  rtl: false,

  // expand
  defaultExpanded: false,
  collapseOnValueChange: true,
  expandOnFocus: true,
  onExpandChange: emptyFn,
  collapseOnClickOutside: true,

  // show color palette
  showColorPalette: true,

  // custom color palette
  showCustomPalette: true,
  customPaletteLength: 12,
  onCustomPaletteChange: emptyFn
};

ZippyColorPickerInput.propTypes = {
  theme: PropTypes.string,
  rootClassName: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  rtl: PropTypes.bool,

  // ColorTextInput
  colorTextInputProps: PropTypes.object,
  onTextChange: PropTypes.func,
  text: PropTypes.string,
  defaultText: PropTypes.string,
  renderColorTextInput: PropTypes.func,

  // expand change
  expandOnFocus: PropTypes.bool,
  expanded: PropTypes.bool,
  defaultExpanded: PropTypes.bool,
  collapseOnValueChange: PropTypes.bool,
  onExpandChange: PropTypes.func,
  collapseOnClickOutside: PropTypes.bool,
  renderExpandButton: PropTypes.func,

  // color palette
  showColorPalette: PropTypes.bool,
  colorPaletteProps: PropTypes.object,
  colorPalette: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  renderColorPalette: PropTypes.func,

  // custom color palette
  showCustomPalette: PropTypes.bool,
  customPaletteLength: PropTypes.number,
  onCustomPaletteChange: PropTypes.func,
  customPalette: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  defaultCustomPalette: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),

  // color picker
  renderColorPicker: PropTypes.func,
  renderOkButton: PropTypes.func,
  renderCancelButton: PropTypes.func,
  colorPickerProps: PropTypes.object
};

export default ZippyColorPickerInput;
