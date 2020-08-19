/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ZippyField extends Component {
  constructor(props) {
    super(props);

    this.ref = ref => {
      this.input = ref;
    };

    this.onChange = this.onChange.bind(this);
  }
  render() {
    const inputProps = { ...this.props };
    delete inputProps.stopChangePropagation;

    return <input {...inputProps} onChange={this.onChange} ref={this.ref} />;
  }

  focus() {
    if (this.input) {
      this.input.focus();
    }
  }

  onChange(event) {
    if (this.props.stopChangePropagation) {
      event.stopPropagation();
    }
    this.props.onChange(event.target.value, event);
  }

  getNode() {
    return this.input;
  }
}

ZippyField.propTypes = {
  type: PropTypes.string,
  stopChangePropagation: PropTypes.bool
};

ZippyField.defaultProps = {
  stopChangePropagation: true,
  onChange: () => {},
  type: 'text'
};

export default ZippyField;
