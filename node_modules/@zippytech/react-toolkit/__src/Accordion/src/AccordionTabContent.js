/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autoBind from '@zippytech/react-class/autoBind';
import join from './join';
import raf from '../../common/raf';
import shouldComponentUpdate from '../../common/shouldComponentUpdate';

export const CLASS_NAME = 'zippy-react-toolkit-accordion__tab-content';

const returnFalse = () => false;

const absolutePositionerStyle = {
  position: 'absolute'
};

class AccordionTabContentComponent extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState);
  }

  render() {
    const props = { ...this.props };
    delete props.shouldComponentUpdate;
    return <div {...props} />;
  }
}

class ZippyAccordionTabContent extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      inTransition: false,

      startingWidth: null,
      finalWidth: null,

      startingHeight: null,
      finalHeight: null
    };
  }

  _transitionHeightFromTo(start, end) {
    const { raf } = this.props;
    this.willTransition = true;
    this.setState({
      startingHeight: start
    });

    raf(() => {
      this.setState(
        {
          finalHeight: end,
          inTransition: true
        },
        () => {
          raf(() => {
            this.setState({ startingHeight: null });
            this._expandInProgress = false;
          });
        }
      );
    });
  }

  _transitionWidthFromTo(start, end) {
    const { raf } = this.props;
    this.willTransition = true;
    this.setState({
      startingWidth: start
    });

    raf(() => {
      this.setState(
        {
          finalWidth: end,
          inTransition: true
        },
        () => {
          raf(() => {
            this.willTransition = false;
            this.setState({ startingWidth: null });
            this._expandInProgress = false;
          });
        }
      );
    });
  }

  _handleVerticalExpand(expanded, expandedHeight) {
    let startingHeight, finalHeight;

    if (expanded) {
      startingHeight = 0;
      finalHeight = expandedHeight || this.getContentHeight();
    } else {
      startingHeight = expandedHeight || this.getContentHeight();
      finalHeight = 0;
    }

    this._expandInProgress = true;
    this._transitionHeightFromTo(startingHeight, finalHeight);
  }

  _handleHorizontalExpand(expanded, expandedWidth) {
    let startingWidth, finalWidth;

    if (expanded) {
      startingWidth = 0;
      finalWidth = expandedWidth || this.getContentWidth();
    } else {
      startingWidth = expandedWidth || this.getContentWidth();
      finalWidth = 0;
    }

    this._expandInProgress = true;
    this._transitionWidthFromTo(startingWidth, finalWidth);
  }

  componentDidUpdate(prevProps) {
    const {
      expanded,
      orientation,
      transition,
      expandedHeight,
      expandedWidth
    } = this.props;

    const { expanded: oldExpanded } = prevProps;

    if (expanded !== oldExpanded) {
      if (transition) {
        if (orientation === 'vertical') {
          this._handleVerticalExpand(expanded, expandedHeight);
        } else {
          this._handleHorizontalExpand(expanded, expandedWidth);
        }

        this._callTransitionStartCallbacks();
      } else {
        this._callTransitionCallbacks(this.props);
      }
    }
  }

  _callTransitionStartCallbacks(props) {
    const { expanded, onExpandStart, onCollapseStart } = props || this.props;

    if (expanded) {
      onExpandStart && onExpandStart();
    } else {
      onCollapseStart && onCollapseStart();
    }
  }

  _callTransitionCallbacks(props) {
    this.willTransition = false;
    const { expanded, orientation, onExpandEnd, onCollapseEnd } =
      props || this.props;
    if (expanded) {
      onExpandEnd && onExpandEnd();
    } else {
      onCollapseEnd && onCollapseEnd();
    }
  }

  onTransitionEnd() {
    const { raf } = this.props;
    raf(() => {
      this.setState(
        {
          inTransition: false,
          finalHeight: null,
          finalWidth: null
        },
        this._callTransitionCallbacks
      );
    });
  }

  getHeight() {
    return this.refs.innerContent.offsetHeight;
  }

  getWidth() {
    return this.refs.innerContent.offsetWidth;
  }

  //height might be 0 or some fancy value given by tabStyle padding
  getContentHeight() {
    return this.refs.innerContent.children[0].offsetHeight;
  }

  getContentWidth() {
    return this.refs.innerContent.children[0].offsetWidth;
  }

  // applied to the wrapper that collapses or expands
  getComputedContainerStyles() {
    const { transition } = this.props;

    if (!transition) {
      return {};
    }

    const {
      inTransition,
      startingHeight,
      finalHeight,
      startingWidth,
      finalWidth
    } = this.state;

    const {
      orientation,
      multiExpand,
      transitionDuration,
      transitionFunction
    } = this.props;

    // animation flicker hack. Because raf might not set transition state
    // with the frist call to render, we might end up with expanded true
    // but no animation or fixed heights/widths to animate to/from.
    let { expanded } = this.props;
    if (this._expandInProgress) {
      expanded = !expanded;
    }

    let computedContainerStyle = {};
    const inTransitionContentStyle = {
      transitionDuration: `${transitionDuration}ms`,
      transitionTimingFunction: transitionFunction
    };

    if (startingHeight !== null) {
      computedContainerStyle.height = startingHeight;
    } else if (startingWidth !== null) {
      computedContainerStyle.width = startingWidth;
    } else {
      if (inTransition) {
        if (orientation === 'horizontal') {
          computedContainerStyle = {
            width: finalWidth,
            ...inTransitionContentStyle
          };
        } else {
          computedContainerStyle = {
            height: finalHeight,
            ...inTransitionContentStyle
          };
        }
      }
    }

    return computedContainerStyle;
  }

  // applied to the wrapper that keeps the dimmensions of the content while
  // the transition happens (preventing reflows)
  getComputedScrollContainerStyle() {
    const { orientation, expandedHeight, expandedWidth } = this.props;
    const { inTransition, finalHeight, finalWidth } = this.state;
    let contentScrollWrapperStyle = {};
    if (inTransition || this._expandInProgress) {
      contentScrollWrapperStyle = { ...absolutePositionerStyle };
      if (orientation === 'vertical') {
        contentScrollWrapperStyle.height = finalHeight || expandedHeight;
      } else {
        contentScrollWrapperStyle.width = finalWidth || expandedWidth;
        contentScrollWrapperStyle.bottom = 0;
      }
    }
    return contentScrollWrapperStyle;
  }

  getClassNames() {
    const {
      className,
      expanded,
      transition,
      firstTab,
      lastTab,
      rootClassName,
      wrapperClassName
    } = this.props;

    const { inTransition } = this.state;

    let lastExpandedState = expanded;
    if (this._expandInProgress) {
      lastExpandedState = !expanded;
    }

    return join(
      className,
      rootClassName,
      wrapperClassName,
      lastExpandedState
        ? `${rootClassName}--expanded`
        : `${rootClassName}--collapsed`,
      transition && inTransition && `${rootClassName}--intransition`,
      firstTab && `${rootClassName}--first`,
      lastTab && `${rootClassName}--last`
    );
  }

  render() {
    const { idx, wrapperStyle, rootClassName, scrollTabContent } = this.props;
    const { forceWrapperReflow } = this.state;

    const sCU = this.willTransition ? returnFalse : null;

    return (
      <div
        className={this.getClassNames()}
        ref="tabContent"
        style={this.getComputedContainerStyles()}
        onTransitionEnd={this.onTransitionEnd}
        onMouseDown={this.props.onWrapperMouseDown}
      >
        {/*
          we keep the position:absolute/relative wrapper because of
          offset scrollbars. If content is scrolled, adding a div
          breaks current scroll value
        */}
        <div
          className={`${rootClassName}__scroll-wrapper`}
          style={{ ...this.getComputedScrollContainerStyle() }}
          ref="innerContent"
        >
          <AccordionTabContentComponent
            shouldComponentUpdate={sCU}
            className={join(
              `${rootClassName}__content-wrapper`,
              scrollTabContent &&
                `${rootClassName}__content-wrapper--scroll-tab-content`,
              forceWrapperReflow && 'fx-force-flex-reflow'
            )}
            style={wrapperStyle}
          >
            {this.props.children}
          </AccordionTabContentComponent>
        </div>
      </div>
    );
  }
}

ZippyAccordionTabContent.defaultProps = {
  expanded: false,
  orientation: 'vertical',

  transitionFunction: 'ease',
  transitionDuration: 300,
  transition: true,

  raf,
  rootClassName: CLASS_NAME
};

ZippyAccordionTabContent.propTypes = {
  shouldComponentUpdate: PropTypes.func,
  children: PropTypes.any,

  scrollTabContent: PropTypes.bool,

  expanded: PropTypes.bool,
  nextAfterExpanded: PropTypes.bool,
  orientation: PropTypes.oneOf(['vertical', 'horizontal']),

  wrapperStyle: PropTypes.object,
  wrapperClassName: PropTypes.string,

  transition: PropTypes.bool,
  transitionDuration: PropTypes.number,
  transitionFunction: PropTypes.string,

  expandedWidth: PropTypes.number,
  expandedHeight: PropTypes.number,

  onExpandStart: PropTypes.func,
  onExpandEnd: PropTypes.func,

  onCollapseStart: PropTypes.func,
  onCollapseEnd: PropTypes.func,
  raf: PropTypes.func,
  rootClassName: PropTypes.string
};

export default ZippyAccordionTabContent;
