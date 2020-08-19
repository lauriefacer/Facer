/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import cleanProps from '../../common/cleanProps';
import raf from '../../common/raf';
import throttle from '../../common/throttle';

import join from './utils/join';
import shouldComponentUpdate from './utils/shouldComponentUpdate';

import {
  getMaskedString,
  getPositionInMaskedStringBasedOnValue,
  getValueSelectionRangeFromMaskedSelectionRange,
  getNextRealValuePosition,
  getPreviousRealValuePosition,
  getValueCharCountInMask
} from './utils/mask/masked-string';

import setCaretPosition from './utils/set-caret-position';
import getSelectionStart from './utils/get-selection-start';
import getSelectionEnd from './utils/get-selection-end';

const CLASS_NAME = 'zippy-react-toolkit-masked-input';

const preventDefault = event => event.preventDefault();

/**
 *  0 - Digit. Accepts any digit between 0 and 9.
 *  9 - Digit or space. Accepts any digit between 0 and 9, plus space.
 *  # - Digit or space. Like 9 rule, but allows also (+) and (-) signs.
 *  L - Letter. Restricts input to letters a-z and A-Z. This rule is equivalent to [a-zA-Z] in regular expressions.
 *  ? - Letter or space. Restricts input to letters a-z and A-Z. This rule is equivalent to [a-zA-Z] in regular expressions.
 *  & - Character. Accepts any character. The rule is equivalent to \S in regular expressions.
 *  C - Character or space. Accepts any character. The rule is equivalent to . in regular expressions.
 *  A - Alphanumeric. Accepts letters and digits only.
 *  a - Alphanumeric or space. Accepts letters, digits and space only.
 */

const defaultMaskDefinitions = {
  '0': /[0-9]/,
  '9': /[0-9\ ]/,
  '#': /[0-9\ \+\-]/,
  L: /[A-Za-z]/,
  '?': /[A-Za-z\ ]/,
  '&': /[\S]/,
  C: /./,
  A: /[A-Za-z0-9]/,
  a: /[A-Za-z0-9\ ]/,
  h: /[A-Fa-f0-9]/
};

const getValue = (props, state) => {
  const { value } = props;
  const { value: stateValue } = state;

  return value === undefined ? stateValue || '' : value;
};

const isControlledComponent = props => {
  return props.value !== undefined;
};

const hasMask = props => {
  return !!props.mask;
};

const getClassNames = (props = {}, state = {}) => {
  const { focused, readOnly } = state;
  const {
    className,
    rootClassName,
    mask = '',
    maskDefinitions,
    theme,
    disabled
  } = props;

  const currentValue = props.currentValue || getValue(props, state);

  const isEmpty = currentValue.length === 0;
  const isUnMaksed = !mask || mask.length === 0;

  const valueCharCountInMask = getValueCharCountInMask(
    mask,
    maskDefinitions || {}
  );
  const isFull = valueCharCountInMask - 1 === currentValue.length;

  return join(
    rootClassName,
    className,
    `${rootClassName}__wrapper`,
    isEmpty && `${rootClassName}--empty`,
    isFull && `${rootClassName}--full`,
    !isUnMaksed && `${rootClassName}--masked`,
    isUnMaksed && `${rootClassName}--unmasked`,
    readOnly && `${rootClassName}--readOnly`,
    disabled && `${rootClassName}--disabled`,
    focused && `${rootClassName}--focused`,
    `${rootClassName}--theme-${theme}`
  );
};

const getInputClassNames = (props, state) => {
  const { inputClassName, rootClassName } = props;
  const inputBaseClass = `${rootClassName}--input`;
  const focusedClassName = `${rootClassName}--focused`;

  return join(inputBaseClass, inputClassName, focusedClassName);
};

const getMaskedDefinitions = ({ maskDefinitions }) => {
  return {
    ...defaultMaskDefinitions,
    ...maskDefinitions
  };
};

const getComposedValueOnKeyDown = (
  currentValue,
  selection,
  pressedValue,
  valueCharCountInMask
) => {
  let [start, end] = selection;
  let result = currentValue + pressedValue;

  if (end === start) {
    end++;
  }

  if (start < currentValue.length) {
    result = `${currentValue.slice(
      0,
      start
    )}${pressedValue}${currentValue.slice(end)}`;
  }

  if (result.length > valueCharCountInMask) {
    result = result.substring(0, valueCharCountInMask);
  }

  return result;
};

const getNextValue = function({
  currentValue,
  newCharValue,
  start,
  end,
  mask,
  maskDefinitions,
  maskFiller
}) {
  const valueSelection = getValueSelectionRangeFromMaskedSelectionRange(
    currentValue,
    {
      start,
      end,
      mask,
      maskDefinitions,
      maskFiller
    }
  );

  let composedValue = getComposedValueOnKeyDown(
    currentValue,
    valueSelection,
    newCharValue,
    getValueCharCountInMask(mask, maskDefinitions)
  );

  const [maskedValue, invalidValueIndex, invalidMaskIndex] = getMaskedString(
    composedValue,
    {
      mask,
      maskDefinitions,
      maskFiller
    }
  );

  // prevent typing invalid values inside already typed content
  if (end !== composedValue.length && invalidValueIndex) {
    return [false, false];
  }

  if (invalidValueIndex !== -1) {
    composedValue = composedValue.substring(0, invalidValueIndex);
  }

  return [composedValue, maskedValue];
};

const getCurrentMaskFiller = (props, state) => {
  const { hideMaskFillOnBlur, maskFiller } = props;
  const { focused } = state;

  let currentMaskFiller = maskFiller;

  if (hideMaskFillOnBlur && !focused) {
    currentMaskFiller = ' ';
  }

  return currentMaskFiller;
};

class ZippyMaskedInput extends Component {
  constructor(props) {
    super(props);

    this.setInputRef = el => {
      this.input = el;
    };

    const value =
      props.defaultValue != null
        ? props.defaultValue
        : props.value != null ? props.value : '';

    this.state = {
      value,
      focused: false
    };

    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleKeyPressUpdate = throttle(
      this.handleKeyPressUpdate.bind(this),
      100
    );
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClearButtonClick = this.handleClearButtonClick.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState);
  }

  handleChange(event) {
    const { isMasked, isControlled, readOnly } = this.p;
    const { value } = event.target;

    if (isMasked || readOnly) {
      return;
    }

    if (!isControlled) {
      this.setState({
        value
      });
    }

    const { onChange } = this.p;
    onChange && onChange({ currentValue: value, event });
  }

  handleBlur(event) {
    this.setState({
      focused: false
    });

    const { onBlur, currentValue, maskedValue } = this.p;

    onBlur &&
      onBlur({
        currentValue,
        maskedValue,
        event
      });
  }

  handleFocus(event) {
    this.setState({
      focused: true
    });

    const { onFocus, currentValue, maskedValue } = this.p;

    raf(() => {
      setCaretPosition(
        this.input,
        getPositionInMaskedStringBasedOnValue(currentValue, this.p)
      );
    });

    onFocus &&
      onFocus({
        currentValue,
        maskedValue,
        event
      });
  }

  handleKeyPressUpdate(valueCode, event) {
    const { input } = this;
    const {
      currentValue,
      isMasked,
      isControlled,
      onChange,
      mask,
      maskDefinitions,
      maskFiller
    } = this.p;

    if (!isMasked) {
      return;
    }

    let start = getSelectionStart(input);
    const end = getSelectionEnd(input);

    const [value, maskedValue] = getNextValue({
      currentValue,
      newCharValue: String.fromCharCode(valueCode),
      start: start,
      end: end,
      mask,
      maskDefinitions,
      maskFiller
    });
    const caretPosition = Math.min(
      getPositionInMaskedStringBasedOnValue(value, {
        mask,
        maskDefinitions,
        maskFiller
      }),
      //get next
      start !== 0
        ? getNextRealValuePosition(start, {
            mask,
            maskDefinitions,
            maskFiller
          })
        : Infinity
    );

    if (!value) {
      return;
    }

    if (!isControlled) {
      this.setState(
        {
          value
        },
        () => {
          raf(() => {
            setCaretPosition(input, caretPosition);
            onChange && onChange({ currentValue: value, maskedValue, event });
          });
        }
      );
    } else {
      this.setState({ caretPosition }, () => {
        onChange && onChange({ currentValue: value, maskedValue, event });
      });
    }
  }

  handleKeyPress(event) {
    const { readOnly, isMasked } = this.p;

    if (!isMasked || readOnly) {
      return;
    }

    this.handleKeyPressUpdate(event.which, event);

    event.stopPropagation();
    event.preventDefault();
  }

  handleKeyDown(event) {
    if (!this.p.isMasked || this.p.readOnly) {
      return;
    }
    if (event.key === 'Backspace') {
      const { input } = this;
      const {
        currentValue,
        isControlled,
        onChange,
        mask,
        maskDefinitions,
        maskFiller
      } = this.p;

      let start = getSelectionStart(input);
      const end = getSelectionEnd(input);

      if (start === end) {
        // should be closest value to the left
        start = getPreviousRealValuePosition(start, {
          mask,
          maskDefinitions,
          maskFiller
        });
      }

      const [value, maskedValue] = getNextValue({
        currentValue,
        newCharValue: '',
        start,
        end,
        mask,
        maskDefinitions,
        maskFiller
      });

      if (!isControlled) {
        this.setState(
          {
            value
          },
          () => {
            raf(() => {
              setCaretPosition(
                input,
                Math.min(
                  getPositionInMaskedStringBasedOnValue(value, {
                    mask,
                    maskDefinitions,
                    maskFiller
                  }),
                  getNextRealValuePosition(start, {
                    mask,
                    maskDefinitions,
                    maskFiller
                  })
                )
              );
              onChange && onChange({ currentValue: value, maskedValue, event });
            });
          }
        );
      } else {
        onChange && onChange({ currentValue: value, maskedValue, event });
      }

      event.stopPropagation();
      event.preventDefault();
    }
  }

  getMaskedValue() {
    const props = this.props;
    const { mask } = props;
    const maskDefinitions = getMaskedDefinitions(props);
    const currentValue = getValue(props, this.state);

    const computedMaskFiller = getCurrentMaskFiller(props, this.state);
    return getMaskedString(currentValue, {
      mask,
      maskDefinitions,
      maskFiller: computedMaskFiller
    })[0];
  }

  getValue() {
    return getValue(this.props, this.state);
  }

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  renderClearButtonWrapper() {
    const { props, state } = this;
    const { enableClearButton } = this.props;
    const {
      clearButtonColor,
      clearButtonStyle,
      clearButtonSize,
      isControlled
    } = this.p;

    const hasValue = !isControlled ? state.value != '' : props.value != '';

    const clearButtonWrapperClassName = join(
      `${props.rootClassName}__clear-button-wrapper`,
      (!hasValue || !enableClearButton) &&
        `${props.rootClassName}__clear-button-wrapper--hidden`
    );

    return (
      <div key="clearButton" className={clearButtonWrapperClassName}>
        {this.renderClearButton({
          clearButtonColor,
          clearButtonStyle,
          clearButtonSize
        })}
      </div>
    );
  }

  renderClearButton(config) {
    const { props } = this;
    const { disabled } = props;
    const { clearButtonColor, clearButtonStyle, clearButtonSize } = config;

    const clearButtonClassName = join(
      `${props.rootClassName}__clear-button`,
      props.clearButtonClassName
    );

    const svgProps = {};
    const tabIndex = this.props.acceptClearToolFocus ? 0 : -1;

    if (clearButtonColor) {
      svgProps.fill = clearButtonColor;
    }

    if (clearButtonSize) {
      if (Array.isArray(clearButtonSize)) {
        svgProps.width = clearButtonSize[0];
        svgProps.height = clearButtonSize[1];
      } else {
        svgProps.width = clearButtonSize;
        svgProps.height = clearButtonSize;
      }
    }

    return (
      <button
        key="clearButton"
        onClick={this.handleClearButtonClick}
        onMouseDown={preventDefault}
        className={clearButtonClassName}
        style={{ ...clearButtonStyle }}
        tabIndex={tabIndex}
      >
        <svg style={{ ...svgProps }} viewBox="4 4 16 16">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    );
  }

  handleClearButtonClick(event) {
    const { onChange, isControlled } = this.p;

    if (!isControlled) {
      this.setState({
        value: ''
      });
    }

    this.focus();

    onChange && onChange({ currentValue: '', event });
  }

  getProps(props, state) {
    props = props || this.props;
    state = state || this.state;

    const {
      inputStyle,
      style,
      tabIndex,

      onChange,
      onBlur,
      onFocus,

      mask,

      clearButtonColor,
      clearButtonStyle,
      clearButtonSize,

      placeholder,
      disabled,
      readOnly
    } = props;

    const { focused } = state;

    const isMasked = hasMask(props);
    const propsOrStateValue = getValue(props, state);

    const currentValue = propsOrStateValue;

    const maskDefinitions = getMaskedDefinitions(props);

    const computedMaskFiller = getCurrentMaskFiller(props, state);

    const maskedValue = getMaskedString(currentValue, {
      mask,
      maskDefinitions,
      maskFiller: computedMaskFiller
    })[0];

    return {
      focused,

      inputStyle,
      inputClassName: getInputClassNames(props, state),
      tabIndex,
      style,

      className: getClassNames(props, state),

      clearButtonSize: clearButtonSize,
      clearButtonColor: clearButtonColor,
      clearButtonStyle: clearButtonStyle,

      currentValue,
      maskedValue,

      isControlled: isControlledComponent(props),
      isMasked,

      mask,
      maskDefinitions,
      maskFiller: computedMaskFiller,

      onChange,
      onBlur,
      onFocus,

      placeholder,
      disabled,
      readOnly
    };
  }

  componentDidUpdate() {
    const { currentValue, mask, maskDefinitions, maskFiller } = this.p;
    const { focused, caretPosition } = this.state;

    if (focused) {
      raf(() => {
        setCaretPosition(
          this.input,
          Math.min(
            getPositionInMaskedStringBasedOnValue(currentValue, {
              mask,
              maskDefinitions,
              maskFiller
            }),
            //get next
            caretPosition ? caretPosition : Infinity
          )
        );
      });
    }
  }

  render() {
    const {
      className,
      maskedValue,
      placeholder,
      disabled,
      tabIndex,
      inputClassName,
      inputStyle,
      style
    } = (this.p = this.getProps(this.props, this.state));

    const cleanedProps = cleanProps(this.props, ZippyMaskedInput.propTypes);

    const input = (
      <input
        ref={this.setInputRef}
        className={inputClassName}
        style={inputStyle}
        placeholder={placeholder}
        tabIndex={tabIndex}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        onChange={this.handleChange}
        onKeyPress={this.handleKeyPress}
        onKeyDown={this.handleKeyDown}
        disabled={disabled}
        type="text"
        value={maskedValue}
      />
    );

    return (
      <div {...cleanedProps} className={className} style={style}>
        {input}
        {this.renderClearButtonWrapper()}
      </div>
    );
  }
}

ZippyMaskedInput.defaultProps = {
  maskDefinitions: {},
  maskFiller: '_',
  placeholder: null,
  enableClearButton: true,
  clearButtonSize: 10,
  hideMaskFillOnBlur: false,
  acceptClearToolFocus: false,
  theme: 'default',
  rootClassName: 'zippy-react-toolkit-masked-input'
};

ZippyMaskedInput.propTypes = {
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,

  mask: PropTypes.string,
  maskDefinitions: PropTypes.object,
  maskFiller: PropTypes.string,

  hideMaskFillOnBlur: PropTypes.bool,

  className: PropTypes.string,
  inputClassName: PropTypes.string,
  style: PropTypes.object,
  inputStyle: PropTypes.object,

  placeholder: PropTypes.string,
  rootClassName: PropTypes.string,
  disabled: PropTypes.bool,
  locked: PropTypes.bool,
  readOnly: PropTypes.bool,
  tabIndex: PropTypes.any,

  acceptClearToolFocus: PropTypes.bool,

  enableClearButton: PropTypes.bool,
  clearButtonColor: PropTypes.string,
  clearButtonStyle: PropTypes.object,
  clearButtonClassName: PropTypes.string,
  clearButtonSize: PropTypes.number,

  value: PropTypes.any,
  defaultValue: PropTypes.any,

  theme: PropTypes.string
};

export default ZippyMaskedInput;

export { getClassNames, CLASS_NAME };
