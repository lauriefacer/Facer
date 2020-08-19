/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import Button from '../../../Button';
import Ripple from '../../../Ripple';
import join from '../../../common/join';

const getClassNameForType = props => {
  if (!props.type) {
    return '';
  }

  return `${props.rootClassName}--${props.type}` || '';
};

class ZippyMaterialButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rippleSize: {
        width: null,
        height: null
      }
    };

    this.onMouseDownHandle = this.onMouseDownHandle.bind(this);
    this.onRippleStop = this.onRippleStop.bind(this);
  }

  onMouseDownHandle(event) {
    const node = event.currentTarget;
    const rect = node.getBoundingClientRect();
    const ripplePosition = {
      top: event.clientY - rect.top,
      left: event.clientX - rect.left
    };
    const rippleSize = {
      width: node.offsetWidth,
      height: node.offsetHeight
    };

    this.setState({
      ripplePosition,
      rippleSize,
      wave: true
    });

    if (this.props.onMouseDown) {
      this.props.onMouseDown(event);
    }
  }

  onRippleStop() {
    this.setState({
      wave: false
    });
  }

  renderRipple() {
    return (
      <Ripple
        key="ripple"
        position={this.state.ripplePosition}
        wave={this.state.wave}
        size={this.state.rippleSize}
        waveDuration={300}
        onStop={this.onRippleStop}
      />
    );
  }

  renderChildren() {
    if (!React.Fragment) {
      return [this.props.children, this.renderRipple()];
    }

    return (
      <React.Fragment>
        {this.props.children}
        {this.renderRipple()}
      </React.Fragment>
    );
  }

  render() {
    const { props } = this;
    const { className } = props;

    const classNameForType = getClassNameForType(props);
    const buttonClassName = join(classNameForType, className);

    const children = this.renderChildren();

    return (
      <Button
        {...props}
        className={buttonClassName}
        children={children}
        onMouseDown={this.onMouseDownHandle}
      />
    );
  }
}

ZippyMaterialButton.defaultProps = {
  type: 'flat',
  theme: 'material-light',
  rootClassName: 'zippy-react-toolkit-material-button'
};

export default ZippyMaterialButton;
