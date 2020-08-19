/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Component from '@zippytech/react-class';
import assign from '../../common/assign';
import { Flex } from '../../Flex';
import join from '../../common/join';
import cleanProps from '../../common/cleanProps';
import bemFactory from './bemFactory';

export default class Body extends Component {
  render() {
    const { props } = this;
    const { rootClassName, style } = props;
    const className = join(
      props.className,
      rootClassName,
      `${rootClassName}--tab-position-${props.tabPosition}`,
      `${rootClassName}--orientation-${
        props.vertical ? 'vertical' : 'horizontal'
      }`,
      props.transition && `${rootClassName}--transition`,
      props.stretchTabContent && `${rootClassName}--stretch-tab-content`,
      props.stretchTabContent && `${rootClassName}--stretch-tab-content`,
      props.scrollTabContent && `${rootClassName}--scroll-tab-content`,
      props.transitioning &&
        props.transitioning !== true &&
        `${rootClassName}--transition-${
          props.transitioning == -1 ? 'prev' : 'next'
        }`,
      props.transitionInProgress && `${rootClassName}--transitioning`
    );
    const content = props.renderContent(props.children);

    return (
      <Flex
        {...cleanProps(props, Body.propTypes)}
        row
        wrap={false}
        alignItems="start"
        flexGrow={1}
        flexShrink={1}
        flexBasis="auto"
        className={className}
        children={content}
      />
    );
  }
}

Body.propTypes = {
  renderContent: PropTypes.func,
  rootClassName: PropTypes.string,
  transitioning: PropTypes.number,
  isTabBody: PropTypes.bool,
  stretchTabContent: PropTypes.bool,
  scrollTabContent: PropTypes.bool,
  vertical: PropTypes.bool,
  transition: PropTypes.bool,
  activeIndex: PropTypes.number,
  tabPosition: PropTypes.string,
  transitionInProgress: PropTypes.bool
};

Body.defaultProps = {
  renderContent: children => children,
  isTabBody: true
};
