/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cleanProps from '../../common/cleanProps';

import { NotifyResize } from '../../NotifyResize';
import join from '../../common/join';

import ZippyArrowScroller from '../../ArrowScroller';
import DropdownOverflow from './DropdownOverflow';

class ZippyToolbar extends Component {
  constructor(props) {
    super(props);
    this.setRootRef = ref => {
      this.node = ref;
    };
  }

  render() {
    const { props } = this;
    const { className } = props;
    const rootProps = {
      useTransformOnScroll: props.useTransformOnScroll,
      ref: this.setRootRef,
      ...cleanProps(props, ZippyToolbar.propTypes),
      className,
      rtl: props.rtl,
      rootClassName: props.rootClassName
    };

    return props.overflowStrategy === 'scroll' ? (
      <ZippyArrowScroller {...rootProps} {...this.getScrollerProps()} />
    ) : (
      <DropdownOverflow {...rootProps} {...this.getDropdownOverflowProps()} />
    );
  }

  scrollIntoView(node) {
    return this.node && this.node.scrollIntoView(node);
  }

  getInstance() {
    return this.node;
  }

  getClassName() {
    const { props } = this;
    return join(
      this.props.className,
      props.rootClassName,
      props.theme && `${props.rootClassName}--theme-${props.theme}`,
      props.changeButtonStyles && `${props.rootClassName}--change-button-styles`
    );
  }

  getScrollerProps() {
    const { props } = this;
    return {
      vertical: props.vertical,
      scrollOnMouseEnter: props.scrollOnMouseEnter,
      arrowSize: props.arrowSize,
      className: join(
        this.getClassName(),
        `${props.rootClassName}--arrowScroller`
      )
    };
  }

  getDropdownOverflowProps() {
    const { props } = this;
    return {
      className: join(this.getClassName(), `${props.rootClassName}--dropdown`),
      constrainTo: props.constrainTo,
      dropdownButtonProps: props.dropdownButtonProps,
      renderDropdownButton: props.renderDropdownButton
    };
  }
}

ZippyToolbar.defaultProps = {
  rootClassName: 'zippy-react-toolkit-toolbar',
  vertical: false,
  useTransformOnScroll: false,
  changeButtonStyles: true,
  theme: 'default',
  overflowStrategy: 'scroll',
  rtl: false
};

ZippyToolbar.propTypes = {
  rtl: PropTypes.bool,
  rootClassName: PropTypes.string,
  changeButtonStyles: PropTypes.bool,
  scrollOnMouseEnter: PropTypes.bool,
  theme: PropTypes.string,
  constrainTo: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
    PropTypes.bool,
    PropTypes.func
  ]),
  arrowSize: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number
    })
  ]),
  overflowStrategy: PropTypes.oneOf(['scroll', 'dropdown']),
  vertical: PropTypes.bool,
  dropdownButtonProps: PropTypes.object,
  renderDropdownButton: PropTypes.func,
  useTransformOnScroll: PropTypes.bool
};

const Separator = props => {
  return (
    <div
      {...props}
      className={join(
        props.className,
        'zippy-react-toolkit-toolbar__separator'
      )}
    />
  );
};

ZippyToolbar.Separator = Separator;

export { Separator };

export default ZippyToolbar;
