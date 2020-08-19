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

class Ripple extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ripple: false
    };

    this.onWaveStart = this.onWaveStart.bind(this);
    this.onWaveStop = this.onWaveStop.bind(this);

    this.ref = n => {
      this.node = n;
    };
  }

  componentDidMount() {
    if (this.props.wave) {
      this.start();
    }
  }

  componentDidUpdate(oldProps) {
    if (!oldProps.wave && this.props.wave) {
      this.start();
    }
  }

  start() {
    requestAnimationFrame(() => {
      this.setState({
        size: this.getSize(),
        ripple: true
      });
    });
  }

  onWaveStart() {
    if (this.props.onStart) {
      this.props.onStart();
    }
  }

  onWaveStop() {
    this.setState({
      ripple: false
    });

    if (this.props.onStop) {
      this.props.onStop();
    }
  }

  getSize() {
    if (this.props.getSize) {
      return this.props.getSize();
    }

    const { size: theSize } = this.props;
    if (theSize) {
      if (typeof theSize === 'number') {
        return {
          width: theSize,
          height: theSize
        };
      }
      const { width, height } = theSize;
      return { width, height };
    }

    const parentNode = this.node.parentNode;

    if (parentNode) {
      return {
        width: parentNode.scrollWidth,
        height: parentNode.scrollHeight
      };
    }
    return { width: 0, height: 0 };
  }

  render() {
    const { props } = this;
    const { rootClassName, waveDuration, theme, position } = props;
    const size = this.state.size || {};
    const { width, height } = size;

    let className = join(
      rootClassName,
      this.props.className,
      theme && `${rootClassName}--theme-${theme}`
    );

    if (this.state.ripple) {
      className = join(className, `${rootClassName}--wave `);
    }

    const animationDuration =
      typeof waveDuration === 'number' ? `${waveDuration}ms` : waveDuration;

    const style = { ...props.style, animationDuration, ...position };
    if (width || height) {
      const size = Math.max(width, height);

      style.width = `${size}px`;
      style.height = `${size}px`;
    }

    let result = <div style={{ display: 'none' }} ref={this.ref} />;
    if (this.state.ripple) {
      result = (
        <div
          ref={this.ref}
          {...cleanProps(props, Ripple.propTypes)}
          className={className}
          style={style}
          onAnimationStart={this.onWaveStart}
          onAnimationEnd={this.onWaveStop}
        />
      );
    }

    return result;
  }
}

const emptyFn = () => {};

Ripple.defaultProps = {
  rootClassName: 'zippy-react-toolkit-ripple',
  onStart: emptyFn,
  onStop: emptyFn,
  onAnimationEnd: emptyFn,
  onAnimationStart: emptyFn,
  theme: 'default',
  waveDuration: 750,
  wave: false
};

Ripple.propTypes = {
  rootClassName: PropTypes.string,
  theme: PropTypes.string,
  onStop: PropTypes.func,
  onStart: PropTypes.func,
  wave: PropTypes.bool,
  size: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      height: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    })
  ]),
  position: PropTypes.object,
  getSize: PropTypes.func,
  waveDuration: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default Ripple;
