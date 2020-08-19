/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import autoBind from '@zippytech/react-class/autoBind';
import { NotifyResize } from '../../NotifyResize';

import shouldComponentUpdate from './shouldComponentUpdate';
import join from './join';

export const CLASS_NAME = 'zippy-react-toolkit-accordion__tab-title';

function defaultRenderExpandTool(params) {
  const EXPAND_TOOL_SIZE = 20;
  const className = params.rootClassName || CLASS_NAME;
  const style = {
    width: EXPAND_TOOL_SIZE,
    height: EXPAND_TOOL_SIZE,
    transition: params.transition
      ? `all ${params.transitionDuration}ms ${params.transitionFunction}`
      : '',
    transform: params.expanded ? 'rotate(180deg)' : 'rotate(0deg)'
  };

  return (
    <div
      style={style}
      className={join(
        `${className}__expand-tool`,
        params.disabled && `${className}__expand-tool--disabled`
      )}
    >
      <svg
        height={EXPAND_TOOL_SIZE}
        viewBox="0 0 24 24"
        width={EXPAND_TOOL_SIZE}
      >
        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
        <path d="M0 0h24v24H0z" fill="none" />
      </svg>
    </div>
  );
}

class ZippyAccordionTabTitle extends Component {
  constructor(props) {
    super(props);
    autoBind(this);

    this.state = {
      expanded: this.props.expanded,
      focused: this.props.expanded,
      heightOfContent: null,
      heightOfContainer: null
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState);
  }

  componentDidMount() {
    this.computeRotatedAccordionTitleDimmensions();
  }

  componentDidUpdate() {
    this.computeRotatedAccordionTitleDimmensions(this.props, this.onResize);
  }

  // if text overflow ellipsis happens, we must add a title attribute on the
  // title. This requires that the DOM be present
  // http://stackoverflow.com/questions/7738117/html-text-overflow-ellipsis-detection#answer-10017343
  applyTooltipIfNeeded() {
    if (typeof window !== 'undefined') {
      const { tabTitleText } = this.refs;
      this.setState({
        tabTitleTooltip: tabTitleText.offsetWidth < tabTitleText.scrollWidth
      });
    }
  }

  isLocked() {
    return this.props.locked;
  }

  isDisabled() {
    return this.props.disabled;
  }

  isActionable() {
    return !(this.isLocked() || this.isDisabled());
  }

  _mapAlignPropToProperValue(tabTitleAlign) {
    switch (tabTitleAlign) {
      case 'left':
      case 'top':
        return 'start';
      case 'right':
      case 'bottom':
        return 'end';
      default:
        return tabTitleAlign;
    }
  }

  onResize() {
    this.computeRotatedAccordionTitleDimmensions(this.props);
    this.applyTooltipIfNeeded();
  }

  getComputedStylesForRotatedTitle() {
    const { orientation, tabTitleRotate, rtl } = this.props;
    const { heightOfContainer, heightOfContent } = this.state;

    if (heightOfContainer != null && heightOfContent != null) {
      let computedTransform;

      if (orientation === 'horizontal') {
        if (tabTitleRotate === -90) {
          if (rtl) {
            computedTransform = `rotate(-90deg) translate(${heightOfContent}px)`;
          } else {
            computedTransform = `rotate(-90deg) translate(${heightOfContent}px, -${heightOfContainer -
              heightOfContent}px)`;
          }

          return {
            transform: computedTransform,
            transformOrigin: '100% 100%'
          };
        }

        if (rtl) {
          computedTransform = `rotate(90deg) translate(0, -${heightOfContainer}px`;
        } else {
          computedTransform = `rotate(90deg) translate(0, -${heightOfContent}px)`;
        }

        return {
          transform: computedTransform,
          transformOrigin: '0% 0%'
        };
      }
    }
  }

  renderTabTitle(tabDOMProps, tabProps) {
    return <div {...tabDOMProps} />;
  }

  renderExpandTool(params) {
    const { expandTool } = this.props;
    const typeofExpandTool = typeof expandTool;

    if (typeofExpandTool === 'function') {
      return expandTool(params);
    }

    return expandTool;
  }

  getClassNames() {
    const {
      className,
      locked,
      expanded,
      nextAfterExpanded,
      disabled,
      focused,
      firstTab,
      lastTab,
      expandOnToolOnly,
      tabTitleEllipsis,
      tabTitleAlign,
      tabTitleVerticalAlign,
      orientation,
      rootClassName,
      rtl,
      tabTitleRotate
    } = this.props;

    return join(
      className,
      rootClassName,
      `${rootClassName}--${orientation}`,
      `${rootClassName}--align-${this._mapAlignPropToProperValue(
        tabTitleAlign
      )}`,
      `${rootClassName}--vertical-align-${tabTitleVerticalAlign}`,
      tabTitleEllipsis && `${rootClassName}--ellipsis`,
      locked && `${rootClassName}--locked`,
      rtl ? `${rootClassName}--rtl` : `${rootClassName}--ltr`,
      expanded && `${rootClassName}--expanded`,
      !expanded && `${rootClassName}--collapsed`,
      firstTab && `${rootClassName}--first-tab-collapsed`,
      expanded && !firstTab && `${rootClassName}--multi-expand`,
      nextAfterExpanded && `${rootClassName}--next-after-expanded`,
      focused && `${rootClassName}--focused`,
      disabled && `${rootClassName}--disabled`,
      firstTab && `${rootClassName}--firstTab`,
      lastTab && `${rootClassName}--lastTab`,
      expandOnToolOnly && `${rootClassName}--expand-on-tooltip-only`,
      orientation === 'horizontal' && tabTitleRotate === 90
        ? join(
            firstTab && `${rootClassName}--rotated-first-tab`,
            lastTab &&
              expanded &&
              `${rootClassName}--expanded-rotated-last-tab`,
            lastTab &&
              !expanded &&
              `${rootClassName}--collapsed-rotated-last-tab`,
            expanded && `${rootClassName}--expanded-rotated`,
            nextAfterExpanded && `${rootClassName}--next-after-expanded-rotated`
          )
        : ''
    );
  }

  computeRotatedAccordionTitleDimmensions(props, cb) {
    const { orientation } = props || this.props;
    if (orientation === 'vertical') {
      if (
        this.state.heightOfContainer != null ||
        this.state.heightOfContent != null
      ) {
        this.setState({
          heightOfContainer: null,
          heightOfContent: null
        });
      }
    } else {
      const heightOfContainer = this.refs.tabTitleContainer.offsetHeight;
      const heightOfContent = this.refs.tabWrapper.offsetHeight;

      const setHeightOfContent = () => {
        if (this.state.heightOfContent != heightOfContent) {
          this.setState(
            {
              heightOfContent
            },
            () => {
              cb && cb();
            }
          );
        } else {
          cb && cb();
        }
      };

      if (this.state.heightOfContainer != heightOfContainer) {
        this.setState(
          {
            heightOfContainer
          },
          setHeightOfContent
        );
      } else {
        setHeightOfContent();
      }
    }
  }

  getRenderTabTitleProps() {
    const {
      expanded,
      index,
      activeTabs,
      disabled,
      multiExpand,
      collapsible,
      focused,
      rootClassName,
      transition,
      transitionDuration,
      transitionFunction
    } = this.props;

    let activeIndex = multiExpand ? activeTabs : activeTabs[0];
    let transitionProps = { transition };

    if (transition) {
      transitionProps = {
        transition,
        transitionDuration,
        transitionFunction
      };
    }
    return {
      expanded,
      index,
      activeIndex,
      disabled,
      multiExpand,
      collapsible,
      focused,
      rootClassName,
      ...transitionProps
    };
  }

  getRenderTabTitleDOMProps() {
    let { tabTitle, expandToolPosition, rtl, showTooltip } = this.props;
    const { rootClassName } = this.props;
    let { tabTitleTooltip } = this.state;
    let typeOfTabTitle = typeof tabTitle;

    if (typeOfTabTitle === 'function') {
      tabTitle = tabTitle(this.getRenderTabTitleProps());
    }

    let className;

    if (expandToolPosition === 'end') {
      if (rtl === false) {
        className = `${rootClassName}__content-end`;
      } else {
        className = `${rootClassName}__content-start`;
      }
    }
    if (expandToolPosition === 'start') {
      if (rtl === false) {
        className = `${rootClassName}__content-start`;
      } else {
        className = `${rootClassName}__content-end`;
      }
    }

    const domProps = {
      className: join(`${rootClassName}__content`, className),
      children: <div className={`${rootClassName}-label`}>{tabTitle}</div>,
      ref: 'tabTitleText'
    };

    if (typeOfTabTitle === 'string' && showTooltip) {
      domProps['data-tooltip'] = tabTitle;
    }

    return domProps;
  }

  renderRotatedLayout() {
    const { orientation, rootClassName } = this.props;

    const { heightOfContent, heightOfContainer } = this.state;

    return (
      <div
        ref="tabTitleContainer"
        className={`${rootClassName}__wrapper`}
        style={{ width: heightOfContent }}
      >
        <div
          className={`${rootClassName}__content-wrapper`}
          style={{ width: heightOfContainer }}
        >
          <div style={this.getComputedStylesForRotatedTitle()}>
            {this.renderTabTitleAndTool()}
          </div>
        </div>
      </div>
    );
  }

  renderNormalLayout() {
    const { orientation, rootClassName } = this.props;

    return (
      <div ref="tabTitleContainer" className={`${rootClassName}__wrapper`}>
        <div className={`${rootClassName}__content-wrapper`}>
          {this.renderTabTitleAndTool()}
        </div>
      </div>
    );
  }

  renderTabTitleAndTool() {
    const {
      locked,
      expandOnToolOnly,
      activateEvent,
      onToggle,
      tabTitleStyle,
      rootClassName,
      renderTabTitle: customRenderTabTitle
    } = this.props;

    let containerDOMProps = {
      className: this.getClassNames(),
      ref: 'tabWrapper',
      style: tabTitleStyle
    };

    let tooltipDOMProps = {
      className: `${rootClassName}__expand-tool-wrapper`
    };

    if (!locked) {
      if (expandOnToolOnly) {
        tooltipDOMProps[activateEvent] = onToggle;
      } else {
        containerDOMProps[activateEvent] = onToggle;
      }
    }

    const subComponentProps = this.getRenderTabTitleProps();
    const expandToolContent = this.renderExpandTool(subComponentProps);
    const renderTabTitle = customRenderTabTitle
      ? customRenderTabTitle
      : this.renderTabTitle;

    return (
      <div {...containerDOMProps}>
        <NotifyResize rafOnResize onResize={this.onResize} />
        {renderTabTitle(this.getRenderTabTitleDOMProps(), subComponentProps)}
        {expandToolContent && (
          <div {...tooltipDOMProps}>{expandToolContent}</div>
        )}
      </div>
    );
  }

  render() {
    const { orientation } = this.props;

    if (orientation === 'horizontal') {
      return this.renderRotatedLayout();
    }
    return this.renderNormalLayout();
  }
}

ZippyAccordionTabTitle.defaultProps = {
  expanded: false,
  disabled: false,
  tabTitleEllipsis: true,
  activateEvent: 'onClick',
  tabTitleAlign: 'start',
  expandTool: defaultRenderExpandTool,
  expandToolPosition: 'end',
  orientation: 'vertical',
  tabTitleRotate: -90,
  rtl: false,
  rootClassName: CLASS_NAME,
  locked: null,
  activeTabs: []
};

ZippyAccordionTabTitle.propTypes = {
  shouldComponentUpdate: PropTypes.func,

  expanded: PropTypes.bool,
  nextAfterExpanded: PropTypes.bool,
  focused: PropTypes.bool,
  locked: PropTypes.bool,
  rtl: PropTypes.bool,

  activeTabs: PropTypes.array,

  tabTitle: PropTypes.any,
  tabTitleStyle: PropTypes.object,
  tabTitleAlign: PropTypes.oneOf([
    'start',
    'end',
    'center',
    'top',
    'left',
    'right',
    'bottom'
  ]),
  tabTitleVerticalAlign: PropTypes.oneOf(['middle', 'top', 'bottom']),
  tabTitleEllipsis: PropTypes.bool,
  tabTitleRotate: PropTypes.oneOf([90, -90]),

  renderTabTitle: PropTypes.func,
  rootClassName: PropTypes.string,

  activateEvent: PropTypes.oneOf(['onClick', 'onMouseDown', 'onMouseEnter']),

  expandTool: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
    PropTypes.string
  ]),
  expandOnToolOnly: PropTypes.bool,
  expandToolPosition: PropTypes.oneOf(['start', 'end']),

  orientation: PropTypes.oneOf(['vertical', 'horizontal'])
};

export default ZippyAccordionTabTitle;
