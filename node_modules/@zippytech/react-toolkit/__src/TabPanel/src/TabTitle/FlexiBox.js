/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import Component from '@zippytech/react-class';
import { NotifyResize } from '../../../NotifyResize';
import join from '../../../common/join';
import assign from '../../../common/assign';
import cleanProps from '../../../common/cleanProps';

const emptyFn = () => null;

export default class FlexiBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: null,
      height: null
    };

    this.mounted = false;
  }

  render() {
    const { props } = this;
    const style = { ...props.style };

    if (!style.position || style.position === 'static') {
      style.position = 'relative';
    }

    const Factory = props.factory || 'div';
    const render = props.children;

    return (
      <Factory {...cleanProps(props, FlexiBox.propTypes)}>
        {render(this.state)}
        <NotifyResize key="resizer" onResize={this.onResize} notifyOnMount />
      </Factory>
    );
  }

  onResize({ width, height }) {
    if (!this.mounted) {
      this.mounted = true;
    }

    this.setState({
      width,
      height
    });
  }
}

FlexiBox.propTypes = {
  factory: PropTypes.func,
  children: PropTypes.func
};
