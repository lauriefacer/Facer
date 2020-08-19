/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import autoBind from '@zippytech/react-class/autoBind';

import join from '../../common/join';
import cleanProps from '../../common/cleanProps';

const preventDefault = e => e.preventDefault();

const getClearButtonClassNames = props => {
  const clearButtonClassName = join(
    `${props.rootClassName}__clear-button`,
    props.clearButtonClassName
  );

  return { clearButtonClassName };
};

const isControlled = props => props.value !== undefined;
const emptyObject = {};

class TextArea extends Component {
  constructor(props) {
    super(props);

    this.state = {
      focused: false,
      value: props.defaultValue
    };

    autoBind(this);
  }

  handleChange(event) {
    const { value } = event.target;
    this.setValue(value, event);
  }

  focus() {
    this.getDOMNode().focus();
  }

  setValue(value, event) {
    if (!isControlled(this.props)) {
      this.setState({
        value
      });
    }

    if (this.props.onChange) {
      this.props.onChange(value, event);
    }
  }

  render() {
    const { props, state } = this;

    const value = isControlled(props) ? props.value : state.value;

    const className = join(
      props.rootClassName,
      props.className,
      props.rtl ? `${props.rootClassName}--rtl` : `${props.rootClassName}--ltr`,
      props.theme && `${props.rootClassName}--theme-${props.theme}`,
      state.focused && `${props.rootClassName}--focused`,
      props.disabled && `${props.rootClassName}--disabled`,
      (value == '' || value == null) && `${props.rootClassName}--empty`
    );

    const domProps = cleanProps(this.props, TextArea.propTypes);

    return (
      <textarea
        {...domProps}
        className={className}
        value={value}
        onChange={this.handleChange}
        onBlur={this.onBlur}
        onFocus={this.onFocus}
      />
    );
  }

  onBlur(event) {
    this.setState({
      focused: false
    });

    if (this.props.onBlur) {
      this.props.onBlur(event);
    }
  }

  onFocus(event) {
    this.setState({
      focused: true
    });

    if (this.props.onFocus) {
      this.props.onFocus(event);
    }
  }
}

TextArea.defaultProps = {
  theme: 'default',
  rootClassName: 'zippy-react-toolkit-text-area',
  stopChangePropagation: true
};

TextArea.propTypes = {
  theme: PropTypes.string,
  stopChangePropagation: PropTypes.bool,
  rtl: PropTypes.bool,
  rootClassName: PropTypes.string
};

export default TextArea;
