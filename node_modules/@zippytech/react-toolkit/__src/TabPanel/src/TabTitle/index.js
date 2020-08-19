/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { cloneElement } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import Component from '@zippytech/react-class';
import assign from '../../../common/assign';
import { NotifyResize } from '../../../NotifyResize';
import join from '../../../common/join';
import isMobile from '../../../common/isMobile';
import cleanProps from '../../../common/cleanProps';
import assignDefined from '../assignDefined';
import bemFactory from '../bemFactory';
import FlexiBox from './FlexiBox';

const toNumber = n => parseInt(n, 10);

const stopPropagation = e => e.stopPropagation();

const getBorderPaddingSize = node => {
  const computedStyle = global.getComputedStyle(node);

  return {
    left:
      toNumber(computedStyle.borderLeftWidth) +
      toNumber(computedStyle.paddingLeft),
    right:
      toNumber(computedStyle.borderRightWidth) +
      toNumber(computedStyle.paddingRight),
    top:
      toNumber(computedStyle.borderTopWidth) +
      toNumber(computedStyle.paddingTop),
    bottom:
      toNumber(computedStyle.borderBottomWidth) +
      toNumber(computedStyle.paddingBottom)
  };
};

const invert = ({ width, height }) => {
  return {
    height: width,
    width: height
  };
};

const HIDDEN_STYLE = {
  position: 'absolute',
  visibility: 'hidden',
  width: 'auto',
  minWidth: 'auto',
  maxWidth: 'auto',
  height: 'auto',
  minHeight: 'auto',
  maxHeight: 'auto'
};

export default class TabTitle extends Component {
  constructor(props) {
    super(props);

    this.state = {
      style: {},
      size: {},
      hiddenSize: {},
      innerSize: {}
    };
  }

  prepareClassName(props) {
    const { rootClassName } = props;
    return join(
      props.className,
      rootClassName,
      props.first && `${rootClassName}--first`,
      props.last && `${rootClassName}--last`,
      props.vertical && `${rootClassName}--vertical`,
      props.active && `${rootClassName}--active`,
      props.focused && `${rootClassName}--focused`,
      props.beforeActive && `${rootClassName}--before-active`,
      props.afterActive && `${rootClassName}--after-active`,
      props.disabled && `${rootClassName}--disabled`,
      props.closeable && `${rootClassName}--closeable`,
      props.closeable &&
        props.closeableOnOver &&
        `${rootClassName}--closeable-on-over`,
      props.tabEllipsis && `${rootClassName}--ellipsis`
    );
  }

  prepareInnerClassName(props) {
    const tabClassName = props.tabClassName;
    const innerClassName =
      (typeof tabClassName == 'function'
        ? tabClassName(props)
        : tabClassName) || '';
    const { rootClassName } = props;
    return join(
      `${rootClassName}__inner`,
      innerClassName,
      props.active && `${rootClassName}__inner--active`,
      props.disabled && props.tabDisabledClassName,
      props.active && props.tabActiveClassName,
      props.tabEllipsis && `${rootClassName}__inner--ellipsis`
    );
  }

  prepareChildren(props) {
    let title =
      (props.tabTitle !== undefined ? props.tabTitle : props.children) ||
      '\u00a0';

    if (typeof title == 'string') {
      title = <span>{title}</span>;
    }

    if (props.closeable) {
      if (Array.isArray(title)) {
        return [title, this.renderCloseIcon()];
      }
      return [cloneElement(title, { key: 'title' }), this.renderCloseIcon()];
    }

    if (Array.isArray(title)) {
      return title;
    }

    return cloneElement(title, { key: 'title' });
  }

  renderCloseIcon() {
    const eventConfig = {
      [this.p.activateEvent]: stopPropagation
    };

    return (
      <div
        {...eventConfig}
        key="closeIcon"
        onClick={this.onClose}
        title="Close tab"
        className={`${this.props.rootClassName}__close-icon`}
      >
        <svg
          className={`${this.props.rootClassName}__close-icon-svg`}
          viewBox="4 4 16 16"
          height="10"
          width="10"
        >
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </div>
    );
  }

  onClose(event) {
    if (this.p.activateEvent == 'onClick') {
      event.stopPropagation();
    }

    this.props.onClose(event);
  }

  prepareInnerStyle(props) {
    const tabStyle = props.tabStyle;

    const innerStyle =
      (typeof tabStyle == 'function' ? tabStyle(props) : tabStyle) || {};

    return assign(
      {},
      innerStyle,
      props.disabled && props.tabDisabledStyle,
      props.active && props.tabActiveStyle
    );
  }

  prepareStyle(props, innerStyle) {
    let style = assign({}, props.style);

    if (props.vertical) {
      // on vertical tabs - the name of the dimensions are inversed
      const dimensionStyles = {
        height: 'width',
        minHeight: 'minWidth',
        maxHeight: 'maxWidth'
      };

      Object.keys(dimensionStyles).forEach(name => {
        // NOTE: inner is rotated!
        const value = innerStyle[name];

        if (value !== undefined) {
          style[name] = value;
          delete innerStyle[name];
          innerStyle[dimensionStyles[name]] = value;
        }
      });
    }

    if (props.tabAlign === 'stretch') {
      // if we are in stretch mode, the size
      // dimensions should be set on the style object (if they are specified)
      // not on the innerStyle, since the main div will now give the dimension

      const dimensions = props.vertical
        ? ['height', 'minHeight', 'maxHeight']
        : ['width', 'minWidth', 'maxWidth'];

      dimensions.forEach(name => {
        const value = innerStyle[name];

        if (value !== undefined) {
          style[name] = value;
          delete innerStyle[name];
        }
      });
    }

    return style;
  }

  render() {
    const props = (this.p = assign({}, this.props));
    const { index } = props;
    const className = this.prepareClassName(props);
    const innerClassName = this.prepareInnerClassName(props);
    const children = this.prepareChildren(props);
    const { innerSize, hiddenSize } = this.state;
    const innerStyle = this.prepareInnerStyle(props);
    const style = this.prepareStyle(props, innerStyle);

    // HAIRY LOGIC - all needed for vertical tabs!
    if (props.vertical) {
      if (props.tabAlign != 'stretch') {
        style.minWidth = innerSize.height;
        style.height = innerSize.width;
      } else {
        style.minWidth = innerSize.height;
        style.height = hiddenSize.width;
      }
    }
    style.outline = '0px solid transparent';

    const renderProps = {
      ...cleanProps(this.props, TabTitle.propTypes),
      style,
      disabled: null,
      className,
      [props.activateEvent]: this.onActivate,
      onKeyDown: this.props.onKeyDown
    };

    const innerProps = {
      key: 'inner',
      style: innerStyle,
      className: innerClassName,
      children: [
        children,
        props.vertical && (
          <NotifyResize
            key="verticalresizer"
            measureSize={this.measureInnerSize}
            onResize={this.onInnerResize}
            notifyOnMount
          />
        )
      ]
    };

    if (props.vertical && props.tabAlign === 'stretch') {
      const verticalFix = (
        <div
          key="innerHidden"
          className={join(
            innerClassName,
            `${props.rootClassName}__inner--hidden`
          )}
          style={assign({}, innerStyle, HIDDEN_STYLE)}
        >
          {children}
          <NotifyResize
            key="hiddenresizer"
            onResize={this.onHiddenResize}
            notifyOnMount
          />
        </div>
      );

      return (
        <FlexiBox {...renderProps}>
          {({ width, height }) => {
            height = Math.max(height || 0, hiddenSize.width || 0);

            return [
              <div {...innerProps} style={{ ...innerStyle, width: height }} />,
              verticalFix
            ];
          }}
        </FlexiBox>
      );
    }

    return (
      <div {...renderProps} tabIndex={0}>
        <div {...innerProps} />
      </div>
    );
  }

  measureInnerSize(node) {
    let height = node.offsetHeight;
    let width = node.offsetWidth;

    if (this.props.vertical) {
      const borderPaddingSize = getBorderPaddingSize(node.parentNode);
      height += borderPaddingSize.left + borderPaddingSize.right;
    }

    return {
      width,
      height
    };
  }

  onInnerResize({ width, height }) {
    this.setState({
      innerSize: { width, height }
    });
  }

  onHiddenResize({ width, height }) {
    this.setState({
      hiddenSize: { width, height }
    });
  }

  onActivate(event) {
    const eventName = this.props.activateEvent;
    const domNode = findDOMNode(this);

    if (typeof this.props[eventName] === 'function') {
      this.props[eventName](event);
    }

    !this.props.disabled && this.props.onActivate(domNode);
  }
}

TabTitle.propTypes = {
  active: PropTypes.number,
  activeIndex: PropTypes.number,
  vertical: PropTypes.bool,
  tabTitle: PropTypes.node,
  tabClassName: PropTypes.string,
  tabActiveClassName: PropTypes.string,
  tabDisabledClassName: PropTypes.string,
  tabFocusedClassName: PropTypes.string,

  focused: PropTypes.bool,

  tabStyle: PropTypes.object,
  tabActiveStyle: PropTypes.object,
  tabDisabledStyle: PropTypes.object,
  rootClassName: PropTypes.string,

  tabAlign: PropTypes.string,
  beforeActive: PropTypes.bool,
  afterActive: PropTypes.bool,
  first: PropTypes.bool,
  last: PropTypes.bool,
  active: PropTypes.bool,

  closeable: PropTypes.bool,
  closeableOnOver: PropTypes.bool,
  disabled: PropTypes.bool,
  tabEllipsis: PropTypes.bool,
  isTabPanelTab: PropTypes.bool,
  activateEvent: PropTypes.oneOf([
    'onClick',
    'onMouseEnter',
    'onMouseDown',
    'onTouchStart',
    'onTouchEnd'
  ]),
  onActivate: PropTypes.func
};

TabTitle.defaultProps = {
  activateEvent: isMobile ? 'onTouchStart' : 'onClick',
  onActivate: () => {}
};
