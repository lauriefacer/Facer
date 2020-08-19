/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

import cleanProps from '../../common/cleanProps';
import join from '../../common/join';

import SvgLoader from './SvgLoader';
import SpinLoader from './SpinLoader';

const DEFAULT_CLASS_NAME = 'zippy-react-toolkit-load-mask';

export default class ZippyLoadMask extends React.Component {
  render() {
    const props = this.props;

    const visibleClassName = props.visible
      ? `${props.rootClassName}--visible`
      : '';
    const className = join(
      props.className,
      props.rootClassName,
      visibleClassName,
      props.theme && `${props.rootClassName}--theme-${props.theme}`
    );
    const layerClassName = join(
      props.backgroundLayerClassName,
      `${props.rootClassName}__background-layer`
    );
    const style = { ...this.props.style };
    const layerStyle = { ...this.props.backgroundLayerStyle };

    if (this.props.zIndex != null) {
      style.zIndex = this.props.zIndex;
    }

    if (props.background !== true) {
      layerStyle.background =
        props.background === false ? 'transparent' : props.background;
    }
    if (props.backgroundOpacity != null) {
      layerStyle.opacity = props.backgroundOpacity;
    }

    const { pointerEvents } = this.props;
    if (pointerEvents !== true) {
      style.pointerEvents = pointerEvents === false ? 'none' : pointerEvents;
    }

    const Loader = props.svgLoader ? SvgLoader : SpinLoader;

    return (
      <div
        {...cleanProps(props, ZippyLoadMask.propTypes)}
        className={className}
        style={style}
      >
        <div style={layerStyle} className={layerClassName} />
        <Loader
          size={props.size}
          theme={props.theme}
          animationDuration={props.animationDuration}
        />
        {this.props.children}
      </div>
    );
  }
}

ZippyLoadMask.defaultProps = {
  visible: true,
  svgLoader: true,
  theme: 'default',
  zIndex: 100,
  pointerEvents: true,
  backgroundOpacity: 0.6,
  background: true,
  backgroundLayerStyle: {},
  rootClassName: DEFAULT_CLASS_NAME
};

ZippyLoadMask.propTypes = {
  animationDuration: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  svgLoader: PropTypes.bool,
  zIndex: PropTypes.number,
  visible: PropTypes.bool,
  pointerEvents: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  backgroundOpacity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  background: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  theme: PropTypes.string,
  backgroundLayerClassName: PropTypes.string,
  backgroundLayerStyle: PropTypes.object,
  rootClassName: PropTypes.string
};
