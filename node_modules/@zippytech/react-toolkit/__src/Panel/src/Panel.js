/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';

import { autoBind } from '@zippytech/react-class';
import { NotifyResize } from '../../NotifyResize';

import cleanProps from '../../common/cleanProps';
import assign from '../../common/assign';
import join from '../../common/join';
import shouldComponentUpdate from '../../common/shouldComponentUpdate';

const CLASS_NAME = 'zippy-react-toolkit-panel';

class ZippyPanel extends Component {
  constructor(props) {
    super(props);
    autoBind(this);

    this.state = {
      width: null,
      height: null,
      titleWidth: null,
      titleHeight: null
    };

    this.setUpTitleBarRef = node => (this.titleBarNode = node);
    this.setBodyRef = node => (this.bodyNode = node);
  }

  componentDidMount() {
    this.domNode = findDOMNode(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState);
  }

  render() {
    const props = this.props;

    const className = join(
      props.rootClassName,
      `${props.rootClassName}--title-bar-position-${props.titleBarPosition}`,
      `${props.rootClassName}--theme-${props.theme}`,
      props.rtl && `${props.rootClassName}--rtl`,
      this.getTitleRotateClassName(),
      props.className
    );

    const style = assign({}, this.props.style);

    if (this.isRotated()) {
      assign(style, this.getRootRotationStyle());
    }

    return (
      <div
        key="panel"
        {...cleanProps(props, ZippyPanel.propTypes)}
        ref={el => (this.rootNode = el)}
        className={className}
        style={style}
      >
        {this.renderTitleBar()}
        {/*
         * When titleBarPosition is bottom
         * rows are reversed with flex-direction
         * so footer is rendered in different positions
         * in dom so it will always be visualy after body
         */}
        {this.props.titleBarPosition === 'bottom' &&
          this.props.renderFooter(this.props)}
        {this.renderBody()}
        {this.props.titleBarPosition !== 'bottom' &&
          this.props.renderFooter(this.props)}
        {this.props.directChildren}
        {this.isRotated() ? (
          <NotifyResize notifyOnMount onResize={this.onResize} />
        ) : null}
      </div>
    );
  }

  renderTitle() {
    const { props } = this;
    const className = join(
      props.titleClassName,
      `${props.rootClassName}__title`,
      props.titleAlign &&
        `${props.rootClassName}__title--align-${props.titleAlign}`
    );

    let children = props.title;
    if (props.titleIcon) {
      const titleIcon = React.cloneElement(props.titleIcon, {
        key: 'titleIcon'
      });
      if (Array.isArray(children)) {
        children = [titleIcon, ...children];
      } else {
        children = [titleIcon, children];
      }
    }

    const domProps = {
      key: 'title',
      className,
      children,
      style: props.titleStyle
    };

    let result;
    if (typeof props.title === 'function') {
      result = props.title(domProps, props);
    }

    if (result == null) {
      result = <div {...domProps} />;
    }

    return result;
  }

  renderTitleBar() {
    const { titleBarPosition, titleBarStyle, rootClassName } = this.props;
    const style = { ...titleBarStyle };
    let result;

    if (this.props.renderTitleBar === false) {
      return null;
    }

    if (this.isRotated() && this.state.height !== null) {
      const computedStyle = global.getComputedStyle(this.domNode);
      const topBottomBorderWidth =
        global.parseInt(computedStyle.borderTopWidth) +
        global.parseInt(computedStyle.borderBottomWidth);
      style.width = this.state.height - topBottomBorderWidth;
    }

    const children = [
      this.props.renderBeforeTitle(this.props),
      <div
        key="title_bar_wrapper"
        className={`${rootClassName}__title-wrapper`}
      >
        {this.renderTitle()}
      </div>,
      this.props.renderAfterTitle(this.props),

      this.isRotated() ? (
        <NotifyResize
          key="notify_resize"
          notifyOnMount
          onResize={this.onTitleBarResize}
        />
      ) : null
    ];

    const titleBarBorderTopClassName = `${rootClassName}__title-bar-border-top`;
    const titleBarBorderBottomClassName = `${rootClassName}__title-bar-border-bottom`;

    const titleBarClassName = join(
      `${rootClassName}__title-bar`,
      titleBarPosition === 'top' ? titleBarBorderBottomClassName : '',
      titleBarPosition === 'bottom' ? titleBarBorderTopClassName : ''
    );

    const className = join(
      titleBarClassName,
      this.props.titleEllipsis && `${rootClassName}__title-bar--ellipsis`
    );

    const domProps = {
      children,
      style,
      className,
      ref: this.setUpTitleBarRef
    };

    if (typeof this.props.renderTitleBar === 'function') {
      result = this.props.renderTitleBar(domProps, this.props);
    }

    if (result === undefined) {
      result = <div key="title_bar" {...domProps} />;
    }

    return result;
  }

  renderBody() {
    let result;
    const className = join(
      `${this.props.rootClassName}__body`,
      this.props.bodyScrollable &&
        `${this.props.rootClassName}__body--scrollable`,
      this.props.bodyClassName
    );

    const style = {};
    if (this.props.bodyStyle) {
      assign(style, this.props.bodyStyle);
    }

    let children;
    if (typeof this.props.children === 'function') {
      children = this.props.children(this.props, this.state);
    } else {
      children = this.props.children;
    }

    const domProps = {
      style,
      className,
      children,
      ref: this.setBodyRef,
      key: 'body'
    };

    if (this.props.renderBody) {
      result = this.props.renderBody(domProps, this.props);
    }

    if (result == null) {
      result = <div {...domProps} />;
    }

    return result;
  }

  onResize({ width, height }) {
    if (this.props.onResize) {
      this.props.onResize({
        width,
        height
      });
    }

    this.setState({
      width,
      height
    });
  }

  onTitleBarResize({ width, height }) {
    this.setState({
      titleWidth: width,
      titleHeight: height
    });
  }

  getRootRotationStyle() {
    const style = {};
    if (this.isRotated && this.titleHeight !== null) {
      if (this.props.titleBarPosition === 'left') {
        style.paddingLeft = this.state.titleHeight;
      } else if (this.props.titleBarPosition === 'right') {
        style.paddingRight = this.state.titleHeight;
      }
    }
    return style;
  }

  /**
   * titleRotate defaults to
   * - 90 for left
   * 90 for right
   * @instance props.titleRotate && props.titleBarPosition
   * @return {String} className
   */
  getTitleRotateClassName() {
    let className = '';

    if (!this.isRotated()) {
      return null;
    }

    if (this.props.titleRotate != null) {
      className = `${this.props.rootClassName}--title-rotate-${
        this.props.titleRotate
      }`;
    } else {
      let titleRotate;
      if (this.props.titleBarPosition === 'left') {
        titleRotate = -90;
      } else if (this.props.titleBarPosition === 'right') {
        titleRotate = 90;
      }

      className = `${this.props.rootClassName}--title-rotate-${titleRotate}`;
    }

    return className;
  }

  getDOMRootNode() {
    return this.rootNode;
  }

  getDOMTitleBarNode() {
    return this.titleBarNode;
  }

  getBodyNode() {
    return this.bodyNode;
  }

  isRotated() {
    return (
      this.props.titleBarPosition === 'left' ||
      this.props.titleBarPosition === 'right'
    );
  }
}

ZippyPanel.defaultProps = {
  rootClassName: CLASS_NAME,
  rtl: false,
  theme: 'default',

  // title
  title: '',
  titleBarPosition: 'top',
  titleEllipsis: false,
  titleAlign: null,
  titleRotate: null,
  renderBeforeTitle: () => null,
  renderAfterTitle: () => null,

  // body
  renderBody: null,
  bodyScrollable: true,

  // footer
  renderFooter: () => null
};

ZippyPanel.propTypes = {
  rootClassName: PropTypes.string,
  theme: PropTypes.string,
  shouldComponentUpdate: PropTypes.func,
  rtl: PropTypes.bool,
  bodyScrollable: PropTypes.bool,

  // title
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  titleIcon: PropTypes.node,
  titleClassName: PropTypes.string,
  titleBarPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  titleAlign: PropTypes.oneOf(['start', 'end', 'center', 'left', 'right']),
  titleRotate: PropTypes.oneOf([90, '90', -90, '-90']),
  renderBeforeTitle: PropTypes.func,
  renderAfterTitle: PropTypes.func,
  renderTitleBar: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  titleStyle: PropTypes.object,
  titleBarStyle: PropTypes.object,
  titleEllipsis: PropTypes.bool,

  // body
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.any]),
  renderBody: PropTypes.func,
  bodyClassName: PropTypes.string,
  bodyStyle: PropTypes.object,

  // undocumented props
  directChildren: PropTypes.node,

  // footer
  renderFooter: PropTypes.func
};

export { CLASS_NAME };

export default ZippyPanel;
