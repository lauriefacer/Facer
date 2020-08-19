/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';

import autoBind from '@zippytech/react-class/autoBind';
import { NotifyResize } from '../../NotifyResize';

import join from './join';
import clamp from './utils/clamp';
import arrayRemove from './utils/array-remove';
import cleanProps from '../../common/cleanProps';
import shouldComponentUpdate from './shouldComponentUpdate';
import raf from '../../common/raf';

import AccordionTabContent from './AccordionTabContent';
import AccordionTabTitle from './AccordionTabTitle';

export const CLASS_NAME = 'zippy-react-toolkit-accordion';

const isTabDisabled = node => {
  if (!node.props) {
    return false;
  }
  return (
    node.props.disabled || (node.props.tabProps && node.props.tabProps.disabled)
  );
};
const isTabLocked = node =>
  node && node.props && node.props.tabProps && node.props.tabProps.locked;
const isTabValid = node => !isTabDisabled(node) && !isTabLocked(node);

const KEYS = {
  ENTER: 'Enter',
  LEFT_ARROW: 'ArrowLeft',
  UP_ARROW: 'ArrowUp',
  RIGHT_ARROW: 'ArrowRight',
  DOWN_ARROW: 'ArrowDown',
  END: 'End',
  HOME: 'Home'
};

const KEYS_VERTICAL = {
  TOGGLE: KEYS.ENTER,
  COLLAPSE: KEYS.LEFT_ARROW,
  EXPAND: KEYS.RIGHT_ARROW,
  FIRST_TAB: KEYS.HOME,
  LAST_TAB: KEYS.END,
  NEXT_TAB: KEYS.DOWN_ARROW,
  PREV_TAB: KEYS.UP_ARROW
};

const KEYS_HORIZONTAL = {
  TOGGLE: KEYS.ENTER,
  PREV_TAB: KEYS.LEFT_ARROW,
  NEXT_TAB: KEYS.RIGHT_ARROW,
  FIRST_TAB: KEYS.HOME,
  LAST_TAB: KEYS.END,
  EXPAND: KEYS.DOWN_ARROW,
  COLLAPSE: KEYS.UP_ARROW
};

class ZippyAccordion extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      activeTabs: this.getActiveTabs(props)
    };

    if (props.expandOnToolOnly && props.expandTool === null) {
      console.warn('expandTool not found but expandOnToolOnly provided.');
    }

    this._assignToggleHandler();
  }

  getExpandToolPosition(props) {
    let { expandToolPosition } = props || this.props;
    if (!expandToolPosition) {
      expandToolPosition = 'end';
    }
    return expandToolPosition;
  }

  isExpandOnToolOnly(props) {
    const { expandOnToolOnly, expandTool } = props || this.props;
    return expandTool !== null ? expandOnToolOnly : false;
  }

  getActiveTabs(props = this.props, state = this.state || {}) {
    const { activeIndex, defaultActiveIndex, multiExpand } = props;
    let computedActiveTabs;
    const maxActiveIndex = props.children.length - 1;

    if (activeIndex || activeIndex === 0) {
      computedActiveTabs = clamp(activeIndex, 0, maxActiveIndex);
    } else if (state.activeTabs || state.activeTabs === 0) {
      computedActiveTabs = state.activeTabs;
    } else if (defaultActiveIndex || defaultActiveIndex === 0) {
      computedActiveTabs = clamp(defaultActiveIndex, 0, maxActiveIndex);
    } else {
      computedActiveTabs = [];
    }

    if (!Array.isArray(computedActiveTabs)) {
      computedActiveTabs = [computedActiveTabs || 0];
    }

    if (computedActiveTabs.length > 1 && !multiExpand) {
      computedActiveTabs = [computedActiveTabs[0]];
    }

    return this._pickValidActiveIndex(computedActiveTabs);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState);
  }

  _getExpandableTabIndexes(props) {
    return Children.toArray((props || this.props).children).reduce(
      (indexes, child, index) => {
        if (!isTabDisabled(child)) {
          indexes.push(index);
        }
        return indexes;
      },
      []
    );
  }

  _pickValidActiveIndex(activeIndex) {
    const children = Children.toArray(this.props.children);
    return activeIndex.filter(index => !isTabDisabled(children[index]));
  }

  _isActiveTab(idx) {
    return this.getActiveTabs().indexOf(idx) >= 0;
  }

  _assignToggleHandler(newProps) {
    const { multiExpand, horizontal } = newProps || this.props;

    if (this._isControlledComponent()) {
      this.onToggleHandler = this._onControlledAction;
    } else {
      this.onToggleHandler = this._onSingleExpandToggle;
      if (multiExpand) {
        this.onToggleHandler = this._onMultiExpandToggle;
      } else if (horizontal) {
        this.onToggleHandler = this._onSingleExpandToggleHorizontal;
      }
    }
  }

  _isActionableTab(idx) {
    return !this._transitioning && this.tabTitles[idx].isActionable();
  }

  _isControlledComponent() {
    const { activeIndex } = this.props;
    return activeIndex === 0 || activeIndex;
  }

  _onControlledAction(idx) {
    if (!this._isActionableTab(idx)) {
      return;
    }

    const { multiExpand, onActivate } = this.props;
    if (multiExpand) {
      onActivate && onActivate(this._getNextExpandedTabs(idx));
    } else {
      onActivate && onActivate(idx);
    }
  }

  _getNextExpandedTabs(idx) {
    const isActive = this._isActiveTab(idx);
    const activeTabs = this.getActiveTabs();

    if (isActive) {
      return arrayRemove(activeTabs, idx);
    } else {
      return [...activeTabs, idx];
    }
  }

  _onMultiExpandToggle(idx) {
    if (!this._isActionableTab(idx)) {
      return;
    }

    const { onActivate } = this.props;
    const newActiveTabs = this._getNextExpandedTabs(idx);

    this.setStateInAnimationFrame(
      {
        activeTabs: newActiveTabs,
        focusedTabIndex: idx,
        focused: true,
        expandedHeight: null,
        expandedWidth: null
      },
      () => {
        onActivate && onActivate([...newActiveTabs]);
      }
    );
  }

  _onSingleExpandToggle(idx) {
    if (!this._isActionableTab(idx)) {
      return;
    }

    const { onActivate } = this.props;
    this.setStateInAnimationFrame(
      {
        activeTabs: this._isActiveTab(idx) ? [] : [idx],
        focusedTabIndex: idx,
        focused: true,
        expandedHeight: this.getAvailableTabHeight()
      },
      () => {
        onActivate && onActivate(idx);
      }
    );
  }

  _onSingleExpandToggleHorizontal(idx) {
    if (!this._isActionableTab(idx)) {
      return;
    }
    const { onActivate } = this.props;
    this.setStateInAnimationFrame(
      {
        activeTabs: this._isActiveTab(idx) ? [] : [idx],
        focusedTabIndex: idx,
        focused: true,
        expandedWidth: this.getAvailableTabWidth()
      },
      () => {
        onActivate && onActivate(idx);
      }
    );
  }

  getAvailableTabHeight(activeTabs) {
    activeTabs = activeTabs || this.getActiveTabs();
    let height = null;

    if (activeTabs.length) {
      height = this.tabContainers[activeTabs[0]].getHeight();
    } else {
      height = this.refs.tabContentFiller
        ? this.refs.tabContentFiller.offsetHeight
        : 0;
    }

    return height;
  }

  getAvailableTabWidth(activeTabs) {
    activeTabs = activeTabs || this.getActiveTabs();
    let width = null;

    if (activeTabs.length) {
      width = this.tabContainers[activeTabs[0]].getWidth();
    } else {
      width = this.refs.tabContentFiller.offsetWidth;
    }

    return width;
  }

  setStateInAnimationFrame(nextState, cb) {
    const { raf } = this.props;
    if (this.props.transition) {
      raf(() => {
        this.setState(nextState, cb);
      });
    } else {
      this.setState(nextState, cb);
    }
  }

  collapseAt(idx) {
    const { collapsible, multiExpand, activeIndex } = this.props;
    const activeTabs = this.getActiveTabs();

    // activeIndex can be undefined or a number.
    if (activeIndex === 0 || activeIndex) {
      return;
    }

    if (this._isActiveTab(idx)) {
      if (collapsible || activeTabs.length > 1) {
        this.onToggleHandler(idx);
      }
    }
  }

  collapseAll() {
    let nextActiveTabs;
    const { collapsible, onActivate, multiExpand, activeIndex } = this.props;
    const activeTabs = this.getActiveTabs();

    if (activeTabs.length === 0 || activeIndex === 0 || activeIndex) {
      return;
    }

    if (multiExpand) {
      if (collapsible) {
        nextActiveTabs = [];
        this.setStateInAnimationFrame({
          activeTabs: nextActiveTabs
        });
      } else {
        nextActiveTabs = [activeTabs[activeTabs.length - 1]];
        this.setStateInAnimationFrame({
          activeTabs: nextActiveTabs
        });
      }
    }

    if (nextActiveTabs && onActivate) {
      onActivate(nextActiveTabs);
    }
  }

  expandAt(idx) {
    if (!this._isActiveTab(idx)) {
      this.onToggleHandler(idx);
    }
  }

  expandAll() {
    let nextActiveTabs;
    const { onActivate, multiExpand, horizontal, activeIndex } = this.props;
    if (activeIndex === 0 || activeIndex) {
      return;
    }
    const availableTabs = this._getExpandableTabIndexes();
    if (multiExpand) {
      nextActiveTabs = availableTabs;
      this.setStateInAnimationFrame({
        activeTabs: nextActiveTabs
      });
    } else {
      if (this.state.activeTabs.length === 0) {
        const firstNonDisabledIndex = availableTabs[0];
        nextActiveTabs = firstNonDisabledIndex ? [firstNonDisabledIndex] : [];
        this.setStateInAnimationFrame({
          activeTabs: nextActiveTabs
        });
      }
    }

    if (nextActiveTabs && onActivate) {
      onActivate(nextActiveTabs);
    }
  }

  onResize(params) {
    this.tabTitles.forEach(title => {
      title.onResize();
    });
  }

  onInteractionBeforeFocus(ev) {
    //   aniamtion optimisation. Prevent focus from triggering another redner
    this._interactionBeforeFocus = true;
  }

  onFocus(ev) {
    if (this._interactionBeforeFocus) {
      this._interactionBeforeFocus = false;
      return;
    }

    let { focusedTabIndex } = this.state;
    if (!focusedTabIndex) {
      focusedTabIndex = 0;
    }

    this.setStateInAnimationFrame({ focused: true, focusedTabIndex });
  }

  onBlur(ev) {
    this.setStateInAnimationFrame({ focused: false, focusedTabIndex: null });
  }

  onKeyDown(ev) {
    if (!this.state.focused) {
      return;
    }
    const { horizontal, activateOnFocus } = this.props;
    const { focusedTabIndex, activeTabs } = this.state;
    const MAPPING = horizontal ? KEYS_HORIZONTAL : KEYS_VERTICAL;
    let targetFocusedTab = null;

    switch (ev.key) {
      case MAPPING.TOGGLE:
        if (this._isActiveTab(focusedTabIndex)) {
          this.collapseAt(focusedTabIndex);
        } else {
          this.expandAt(focusedTabIndex);
        }
        targetFocusedTab = focusedTabIndex;
        break;
      case MAPPING.EXPAND:
        this.expandAt(focusedTabIndex);
        targetFocusedTab = focusedTabIndex;
        break;
      case MAPPING.COLLAPSE:
        this.collapseAt(focusedTabIndex);
        targetFocusedTab = focusedTabIndex;
        break;
      case MAPPING.NEXT_TAB:
        targetFocusedTab = -1;
        if (
          focusedTabIndex <
          Children.toArray(this.props.children).length - 1
        ) {
          targetFocusedTab = focusedTabIndex + 1;
          this.setStateInAnimationFrame({
            focusedTabIndex: targetFocusedTab
          });
        }
        if (activateOnFocus && targetFocusedTab >= 0) {
          this.expandAt(targetFocusedTab);
        }
        break;
      case MAPPING.PREV_TAB:
        targetFocusedTab = -1;
        if (focusedTabIndex > 0) {
          targetFocusedTab = focusedTabIndex - 1;
          this.setStateInAnimationFrame({
            focusedTabIndex: targetFocusedTab
          });
        }
        if (activateOnFocus && targetFocusedTab >= 0) {
          this.expandAt(targetFocusedTab);
        }
        break;
      case MAPPING.FIRST_TAB:
        this.setStateInAnimationFrame({
          focusedTabIndex: 0
        });
        targetFocusedTab = 0;
        break;
      case MAPPING.LAST_TAB:
        targetFocusedTab = Children.toArray(this.props.children).length - 1;
        this.setStateInAnimationFrame({
          focusedTabIndex: targetFocusedTab
        });
        break;
    }

    if (targetFocusedTab !== null) {
      this.props.scrollIntoViewOnFocus &&
        targetFocusedTab >= 0 &&
        this.scrollTabTitleIntoView(targetFocusedTab);
      ev.stopPropagation && ev.stopPropagation();
      ev.preventDefault && ev.preventDefault();
    }
  }

  scrollTabTitleIntoView(idx) {
    const itemNode = this.tabTitles[idx].refs.tabTitleContainer;
    const { accordionNode } = this.refs;
    const itemHeight = itemNode.offsetHeight;
    const itemWidth = itemNode.offsetWidth;
    const itemOffsetTop = itemNode.offsetTop;
    const itemOffsetLeft = itemNode.offsetLeft;
    const scrollTop = accordionNode.scrollTop;
    const scrollLeft = accordionNode.scrollLeft;
    const containerHeight = accordionNode.offsetHeight;
    const containerWidth = accordionNode.offsetWidth;

    // at the top and have to scroll to itemOffsetTop
    if (scrollTop > itemOffsetTop || scrollLeft > itemOffsetLeft) {
      accordionNode.scrollTop = itemOffsetTop;
      accordionNode.scrollLeft = itemOffsetLeft;
    }

    // at the bottom, have to scroll more
    if (
      scrollTop + containerHeight < itemHeight + itemOffsetTop ||
      scrollLeft + containerWidth < itemWidth + itemOffsetLeft
    ) {
      accordionNode.scrollTop = itemOffsetTop + itemHeight - containerHeight;
      accordionNode.scrollLeft = itemOffsetLeft + itemWidth - containerWidth;
    }
  }

  // fix for scrollbars being added to accordion content in multiEpxand horizontal
  _transitionEndScrollCheck() {
    const { horizontal, multiExpand } = this.props;
    if (horizontal && multiExpand) {
      const {
        accordionNode: { offsetHeight, scrollHeight }
      } = this.refs;
      if (!this._scrollHeight) {
        this._scrollHeight = scrollHeight;
        this.onResize();
      }

      if (
        this._scrollHeight !== scrollHeight ||
        offsetHeight !== scrollHeight
      ) {
        this.onResize();
      }
    }
  }

  onContentCollapsed(idx, onTabCollapse) {
    const { onCollapse } = this.props;
    this._transitioning = false;
    onTabCollapse && onTabCollapse(idx);
    onCollapse && onCollapse(idx);
    this._transitionEndScrollCheck();
  }

  onContentExpanded(idx, onTabExpand) {
    const { onExpand } = this.props;
    this._transitioning = false;
    onTabExpand && onTabExpand(idx);
    onExpand && onExpand(idx);
    this._transitionEndScrollCheck();
  }

  getClassNames() {
    const {
      className,
      rootClassName,
      horizontal,
      theme,
      collapsible,
      multiExpand,
      enableKeyboardNavigation,
      rtl
    } = this.props;

    const expandToolPosition = this.getExpandToolPosition();

    const { focused } = this.state;

    const activeTabs = this.getActiveTabs();

    return join(
      className,
      rootClassName,
      `${rootClassName}--theme-${theme}`,
      `${rootClassName}--expand-tool-${expandToolPosition}`,
      horizontal
        ? `${rootClassName}--horizontal`
        : `${rootClassName}--vertical`,
      collapsible && activeTabs.length && `${rootClassName}--expanded`,
      focused && `${rootClassName}--focused`,
      rtl && `${rootClassName}--rtl`,
      multiExpand
        ? `${rootClassName}--multi-expand`
        : `${rootClassName}--single-expand`
    );
  }

  _getTitleDetailsParams(activeTabs) {
    const {
      activateEvent,
      renderTabTitle,
      tabTitleAlign,
      tabTitleVerticalAlign,
      tabTitleStyle,
      titleStyle,
      tabTitleEllipsis,
      tabTitleRotate,
      expandTool,
      enableKeyboardNavigation,
      rtl,
      raf,
      horizontal,
      locked,
      transition,
      transitionDuration,
      transitionFunction
    } = this.props;

    activeTabs = activeTabs || this.getActiveTabs();

    const computedTitleProps = {
      expandOnToolOnly: this.isExpandOnToolOnly(),
      titleStyle,
      tabTitleStyle,
      tabTitleAlign,
      tabTitleVerticalAlign,
      tabTitleEllipsis,
      renderTabTitle,
      activeTabs,
      activateEvent,
      enableKeyboardNavigation,
      rtl,
      raf,
      tabTitleRotate,
      expandTool,
      transition,
      transitionDuration,
      transitionFunction,
      orientation: horizontal ? 'horizontal' : 'vertical',
      locked
    };

    return computedTitleProps;
  }

  renderTabTitle({ idx, tabTitleProps, DOMProps }) {
    const { expandToolPosition, rtl } = this.props;
    const {
      activeTabs,
      expanded,
      locked,
      multiExpand,
      collapsible,
      tabProps,
      tabTitleAlign,
      instanceProps
    } = tabTitleProps;

    if (expanded && activeTabs.length === 1 && !collapsible) {
      tabTitleProps.locked = expanded;
    }

    return (
      <AccordionTabTitle
        expandToolPosition={expandToolPosition}
        rtl={rtl}
        onToggle={ev => {
          this.onToggleHandler(idx);
        }}
        ref={el => {
          el && this.tabTitles.push(el);
        }}
        {...tabTitleProps}
      />
    );
  }

  _getContentDetailsParams() {
    const {
      transition,
      transitionDuration,
      transitionFunction,
      enableKeyboardNavigation,
      tabStyle,
      tabClassName,
      horizontal,
      raf
    } = this.props;

    const { expandedHeight, expandedWidth } = this.state;

    const computedContentProps = {
      transition,
      transitionDuration,
      transitionFunction,
      enableKeyboardNavigation,
      expandedHeight,
      expandedWidth,
      raf,
      orientation: horizontal ? 'horizontal' : 'vertical',
      wrapperStyle: tabStyle,
      wrapperClassName: tabClassName
    };

    return computedContentProps;
  }

  renderTabContent({ idx, child, tabContentProps, DOMProps }) {
    const { onTabExpand, onTabCollapse } = tabContentProps;

    if (tabContentProps.stretchTabContent) {
      DOMProps.style = { ...DOMProps.style };
      DOMProps.style.flex = 1;
    }

    if (!tabContentProps.focused) {
      tabContentProps.onWrapperMouseDown = ev => {
        this.setState({
          focused: true,
          focusedTabIndex: tabContentProps.idx
        });
      };
    }

    return (
      <AccordionTabContent
        ref={el => {
          el && this.tabContainers.push(el);
        }}
        onCollapseEnd={() => {
          this.onContentCollapsed(idx, onTabCollapse);
        }}
        onExpandEnd={() => {
          this.onContentExpanded(idx, onTabExpand);
        }}
        onExpandStart={() => {
          this._transitioning = true;
        }}
        onCollapseStart={() => {
          this._transitioning = true;
        }}
        {...tabContentProps}
      >
        {React.createElement(child.type, DOMProps)}
      </AccordionTabContent>
    );
  }

  _attachEventHandler(key, handler, propagatedProps) {
    const oldEventHandler = propagatedProps[key];
    if (oldEventHandler) {
      propagatedProps[key] = ev => {
        handler(ev);
        oldEventHandler(ev);
      };
    } else {
      propagatedProps[key] = handler;
    }
  }

  setKeyboardNavigationProps(computedAccordionDOMProps) {
    computedAccordionDOMProps.tabIndex = this.props.tabIndex || 0;
    this._attachEventHandler(
      'onFocus',
      this.onFocus,
      computedAccordionDOMProps
    );
    this._attachEventHandler('onBlur', this.onBlur, computedAccordionDOMProps);
    this._attachEventHandler(
      'onMouseDown',
      this.onInteractionBeforeFocus,
      computedAccordionDOMProps
    );
    this._attachEventHandler(
      'onKeyDown',
      this.onKeyDown,
      computedAccordionDOMProps
    );
  }

  // when single expand and no tab open, we need an element to give us the expand
  // target dimmension
  renderTabFiller(activeTabs) {
    const { collapsible, multiExpand, rootClassName } = this.props;

    if (collapsible && !multiExpand) {
      const classnames = join(
        `${rootClassName}__tab-space-filler`,
        !this._transitioning &&
          activeTabs.length !== 0 &&
          `${rootClassName}__tab-space-filler--collapsed`
      );
      return <div ref="tabContentFiller" className={classnames} />;
    }
  }

  renderResizeNotifier() {
    return <NotifyResize rafOnResize onResize={this.onResize} />;
  }

  render() {
    const {
      children,
      horizontal,
      multiExpand,
      collapsible,
      enableKeyboardNavigation,
      style,
      scrollTabContent,
      stretchTabContent,
      showTooltip
    } = this.props;

    this._assignToggleHandler(this.props);

    const { expandedHeight, focusedTabIndex } = this.state;

    const activeTabs = this.getActiveTabs();

    this.tabContainers = [];
    this.tabTitles = [];

    const detailsParams = {
      horizontal,
      multiExpand,
      collapsible
    };

    // TODO refactor and move computation of each title/content instance in separate function
    const contentDetailsParams = {
      ...detailsParams,
      ...this._getContentDetailsParams()
    };
    const titleDetailsParams = {
      ...detailsParams,
      ...this._getTitleDetailsParams(activeTabs)
    };

    let expandedIndex;
    const accordionItems = Children.map(children, (child, idx) => {
      const {
        tabProps = {},
        disabled,
        locked,
        tabTitle,
        ...DOMProps
      } = child.props;

      const {
        disabled: instanceDisabled,
        title: instanceTitle,
        titleStyle: instanceTitleStyle,
        titleEllipsis: instanceTabTitleEllipsis,
        titleAlign: instanceTabTitleAlign,
        titleVerticalAlign: instanceTabTitleVerticalAlign,

        onExpand,
        onCollapse,

        stretchTabContent: instanceStretchTabContent,

        style: instanceTabWrapperStyle,
        className: instanceTabWrapperClassName
      } = tabProps;

      let instanceLocked = tabProps.locked != null ? tabProps.locked : locked;

      const isActive = this._isActiveTab(idx) && !DOMProps.disabled;
      const isDisabled =
        instanceDisabled !== undefined ? instanceDisabled : disabled;
      let lengthOfChildrenArray = Children.toArray(children).length;

      const tabPositionProps = {
        firstTab: idx === 0,
        lastTab: idx === lengthOfChildrenArray - 1
      };

      if (isActive) {
        expandedIndex = idx;
      }

      // TODO refactor into a function
      const contentInstanceProps = {
        ...contentDetailsParams,
        ...tabPositionProps,
        wrapperStyle: {
          ...contentDetailsParams.wrapperStyle,
          ...instanceTabWrapperStyle
        },
        wrapperClassName: join(
          contentDetailsParams.wrapperClassName,
          instanceTabWrapperClassName
        ),
        expanded: isActive,
        nextAfterExpanded: idx === expandedIndex + 1,
        onTabExpand: onExpand,
        onTabCollapse: onCollapse,
        scrollTabContent,
        stretchTabContent:
          instanceStretchTabContent !== undefined
            ? instanceStretchTabContent
            : stretchTabContent,
        idx
      };

      // TODO refactor into a function
      const titleInstanceProps = {
        ...titleDetailsParams,
        ...tabPositionProps,
        disabled: isDisabled,
        tabTitle: instanceTitle || tabTitle,
        focused: focusedTabIndex === idx && !isDisabled,
        nextAfterExpanded: idx === expandedIndex + 1,
        expanded: isActive,
        showTooltip,
        locked:
          instanceLocked != null ? instanceLocked : titleDetailsParams.locked,
        tabTitleAlign:
          instanceTabTitleAlign !== undefined
            ? instanceTabTitleAlign
            : titleDetailsParams.tabTitleAlign,
        tabTitleVerticalAlign:
          instanceTabTitleVerticalAlign !== undefined
            ? instanceTabTitleVerticalAlign
            : titleDetailsParams.tabTitleVerticalAlign,
        tabTitleEllipsis:
          instanceTabTitleEllipsis !== undefined
            ? instanceTabTitleEllipsis
            : titleDetailsParams.tabTitleEllipsis,
        tabTitleStyle: {
          ...titleDetailsParams.tabTitleStyle,
          ...instanceTitleStyle
        },
        index: idx
      };

      return [
        this.renderTabTitle({
          idx,
          tabTitleProps: titleInstanceProps,
          DOMProps
        }),
        this.renderTabContent({
          idx,
          child,
          tabContentProps: contentInstanceProps,
          DOMProps
        })
      ];
    });

    const cleanedProps = cleanProps(this.props, ZippyAccordion.propTypes);

    const computedAccordionDOMProps = {
      ...cleanedProps,
      className: this.getClassNames(),
      ref: 'accordionNode'
    };

    if (enableKeyboardNavigation) {
      this.setKeyboardNavigationProps(computedAccordionDOMProps);
    }

    return (
      <div {...computedAccordionDOMProps}>
        {accordionItems}
        {this.renderTabFiller(activeTabs)}
        {this.renderResizeNotifier()}
      </div>
    );
  }
}

ZippyAccordion.defaultProps = {
  activateOnFocus: false,
  collapsible: false,
  horizontal: false,
  activateEvent: 'onClick',

  scrollTabContent: false,

  showTooltip: false,

  transition: true,
  transitionDuration: 300,
  transitionFunction: 'ease',

  tabTitleEllipsis: true,
  tabTitleAlign: 'start',
  tabTitleVerticalAlign: 'middle',

  tabStyle: {},

  rtl: false,
  expandOnToolOnly: false,
  enableKeyboardNavigation: true,

  theme: 'default',

  NotifyResize,

  defaultActiveIndex: 0,
  scrollIntoViewOnFocus: true,
  raf,

  rootClassName: CLASS_NAME
};

ZippyAccordion.propTypes = {
  shouldComponentUpdate: PropTypes.func,
  children: PropTypes.any,
  stretch: PropTypes.bool,
  theme: PropTypes.string,
  horizontal: PropTypes.bool,

  activateOnFocus: PropTypes.bool,

  transition: PropTypes.bool,
  transitionDuration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  transitionFunction: PropTypes.string,

  activeIndex: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ]),
  defaultActiveIndex: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ]),
  multiExpand: PropTypes.bool,
  collapsible: PropTypes.bool,

  activateEvent: PropTypes.oneOf(['onClick', 'onMouseDown', 'onMouseEnter']),

  onExpand: PropTypes.func,
  onActivate: PropTypes.func,
  onCollapse: PropTypes.func,

  NotifyResize: PropTypes.func,

  renderTabTitle: PropTypes.func,
  rootClassName: PropTypes.string,
  expandTool: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
    PropTypes.string
  ]),
  expandOnToolOnly: PropTypes.bool,
  expandToolPosition: PropTypes.oneOf(['start', 'end']),

  scrollTabContent: PropTypes.bool,
  stretchTabContent: PropTypes.bool,

  tabTitle: PropTypes.node,
  tabTitleStyle: PropTypes.object,
  tabTitleEllipsis: PropTypes.bool,
  tabTitleAlign: PropTypes.oneOf([
    'start',
    'center',
    'end',
    'left',
    'right',
    'top',
    'bottom'
  ]),
  tabTitleVerticalAlign: PropTypes.oneOf(['middle', 'top', 'bottom']),
  tabTitleRotate: PropTypes.oneOf([-90, 90]),

  tabStyle: PropTypes.object,
  tabClassName: PropTypes.string,

  rtl: PropTypes.bool,
  locked: PropTypes.bool,

  showTooltip: PropTypes.bool,

  enableKeyboardNavigation: PropTypes.bool,
  scrollIntoViewOnFocus: PropTypes.bool,

  raf: PropTypes.func
};

export default ZippyAccordion;
