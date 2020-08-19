/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import Component from '@zippytech/react-class';
import { Flex, Item } from '../../../Flex';
import TAB_POSITION_MAP from '../tabPositions';
import assign from '../../../common/assign';
import isMobile from '../../../common/isMobile';
import join from '../../../common/join';
import cleanProps from '../../../common/cleanProps';
import TabTitle from '../TabTitle';
import Scroller from '../../../ArrowScroller';
import TabPanel from '../index';

const NEW_TAB = (
  <svg
    height="20"
    viewBox="0 0 24 24"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
);

export default class TabStrip extends Component {
  constructor(props) {
    super(props);

    this.tabNodes = [];
    this.state = {
      focused: false,
      activeIndex: props.defaultActiveIndex || 0,
      focusedIndex:
        (props.defaultFocusedIndex !== undefined
          ? props.defaultFocusedIndex
          : props.defaultActiveIndex) || 0
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const oldIndex = this.prepareActiveIndex(prevProps, prevState);

    const scrollToTab = (index, getIndex) => {
      this.scrollToTab(index);

      setTimeout(() => {
        if (index === getIndex()) {
          this.scrollToTab(index);
        }
      }, 100);
    };

    if (oldIndex != this.p.activeIndex) {
      const index = this.p.activeIndex;
      scrollToTab(this.p.activeIndex, () => this.p.activeIndex);
      return;
    }

    if (!this.props.activateOnFocus) {
      const oldFocusedIndex = this.prepareFocusedIndex(prevProps, prevState);

      if (oldFocusedIndex != this.p.focusedIndex) {
        scrollToTab(this.p.focusedIndex, () => this.p.focusedIndex);
      }
    }
  }

  scrollToTab(index) {
    const domNode = this.tabNodes[index];

    domNode && this.scroller && this.scroller.scrollIntoView(domNode);
  }

  prepareClassName(props) {
    const { rootClassName } = props;
    return join(
      props.className,
      rootClassName,
      `${rootClassName}--theme-${props.theme}`,
      `${rootClassName}--tab-align-${props.tabAlign}`,
      `${rootClassName}--tab-position-${props.tabPosition}`,
      `${rootClassName}--orientation-${
        props.vertical ? 'vertical' : 'horizontal'
      }`,
      isMobile && `${rootClassName}--mobile`,
      props.focused && `${rootClassName}--focused`,
      props.vertical && `${rootClassName}--vertical`,
      props.firstActive && `${rootClassName}--first-active`,
      props.lastActive && `${rootClassName}--last-active`
    );
  }

  prepareActiveIndex(props, state) {
    return props.activeIndex == null
      ? (state || this.state).activeIndex
      : props.activeIndex;
  }

  prepareFocusedIndex(props, state) {
    return props.focusedIndex == null
      ? (state || this.state).focusedIndex
      : props.focusedIndex;
  }

  prepareProps(thisProps) {
    const props = assign({}, thisProps);

    const activeIndex = this.prepareActiveIndex(props);
    const focusedIndex = this.prepareFocusedIndex(props);

    props.activeIndex = activeIndex;
    props.focusedIndex = focusedIndex;
    props.tabs = props.defaultTabs || props.tabs;

    if (props.onAddNew) {
      props.tabs = [
        ...props.tabs,
        {
          title: NEW_TAB,
          selectable: false,
          closeable: false,
          onMouseDown() {
            props.onAddNew();
          }
        }
      ];
    }
    props.tabIndex =
      typeof props.tabIndex === 'boolean'
        ? props.tabIndex ? 0 : -1
        : props.tabIndex;

    this.tabNodes.length = props.tabs.length;

    props.firstActive = activeIndex === 0;
    props.lastActive = activeIndex === props.tabs.length - 1;
    props.allTabsProps = [];

    props.onFocus = this.onFocus;
    props.onBlur = this.onBlur;
    props.onKeyDown = this.onKeyDown;
    props.focused = this.state.focused;

    return props;
  }

  render() {
    const props = (this.p = this.prepareProps(this.props));
    const { rootClassName } = props;
    const className = this.prepareClassName(props);
    const beforeClassName = join(
      `${rootClassName}__before`,
      props.firstActive && `${rootClassName}__before-active`
    );

    const afterClassName = join(
      `${rootClassName}__after`,
      props.lastActive && `${rootClassName}__after-active`
    );

    const { tabPosition } = props;

    const row = tabPosition == 'top' || tabPosition == 'bottom';

    const renderProps = {
      ...cleanProps(props, TabStrip.propTypes),
      key: 'tab_strip',
      alignItems: 'stretch',
      row,
      column: !row,
      wrap: false,
      className,
      style: props.style
    };

    const childProps = {
      key: 'inner',
      className: `${rootClassName}__inner`,
      alignItems: 'stretch',
      row,
      column: !row,
      wrap: false,
      children: [
        <Item className={beforeClassName} />,
        props.tabs.map(this.renderTab),
        <Item className={afterClassName} />
      ]
    };

    if (props.scroller === false) {
      return (
        <Flex {...renderProps}>
          <Flex {...childProps} />
        </Flex>
      );
    }

    const verticalScroller = tabPosition == 'left' || tabPosition == 'right';

    return (
      <Flex {...renderProps}>
        <Scroller
          key="scroller"
          useTransformOnScroll
          vertical={verticalScroller}
          column={verticalScroller}
          ref={c => (this.scroller = this.scroller || c)}
          childProps={childProps}
          children={childProps.children}
        />
      </Flex>
    );
  }

  onResize() {}

  onFocus(event) {
    this.setState({
      focused: true
    });

    this.props.onFocus(event, findDOMNode(this));
  }

  onBlur(event) {
    this.setState({
      focused: false
    });

    this.props.onBlur(event);
  }

  onKeyDown(event) {
    if (typeof this.props.onKeyDown == 'function') {
      this.props.onKeyDown(event);
    }

    if (this.props.enableKeyboardNavigation === false) {
      return;
    }

    const key = event.key;

    let dir = 0;

    if (key == 'ArrowLeft' || key == 'ArrowUp') {
      dir = -1;
    } else if (key == 'ArrowRight' || key == 'ArrowDown') {
      dir = 1;
    }

    if (this.props.activateOnFocus) {
      if (dir) {
        this.onNavigate(dir);
        event.preventDefault();
      }

      if (key === 'Home') {
        this.onNavigateFirst();
        event.preventDefault();
      }

      if (key == 'End') {
        this.onNavigateLast();
        event.preventDefault();
      }

      return;
    }

    const focusedIndex = this.p.focusedIndex;

    if (key == 'Enter') {
      event.preventDefault();
      this.onActivate(focusedIndex);

      return;
    }
    if (dir) {
      event.preventDefault();
      this.onFocusedNavigate(dir);

      return;
    }

    if (key == 'Home' || key == 'End') {
      const firstIndex = this.getFirstAvailableIndex();
      const lastIndex = this.getLastAvailableIndex();

      event.preventDefault();

      const index = key == 'Home' ? firstIndex : lastIndex;
      this.setFocusedTab(index);
    }
  }

  renderTab(tab, index, array) {
    const props = this.p;
    const {
      activeIndex,
      focusedIndex,
      activateEvent,
      inTabPanel,
      tabStyle,
      tabDisabledStyle,
      tabActiveStyle,
      tabClassName,
      tabActiveClassName,
      tabFocusedClassName,
      tabDisabledClassName,
      tabEllipsis,
      vertical,
      tabAlign,
      closeable,
      closeableOnOver,
      topRootClassName,
      rootClassName
    } = props;

    if (typeof tab == 'string') {
      tab = {
        title: tab
      };
    }

    const first = index === 0;
    const last = props.tabs.length - 1 === index;

    const beforeActive = activeIndex - 1 === index;
    const afterActive = activeIndex + 1 === index;
    const active = index === activeIndex;
    const focused =
      index === focusedIndex &&
      this.state.focused &&
      !this.props.activateOnFocus;

    const tabProps = assign({ closeable, closeableOnOver }, tab, {
      ref: b => (this.tabNodes[index] = findDOMNode(b)),
      index,
      activateEvent,
      activeIndex,
      active,
      first,
      last,
      beforeActive,
      afterActive,
      tabAlign,
      rootClassName: `${topRootClassName}__tab-title`,

      focused,

      tabTitle: tab.title,
      children: tab.title,

      vertical,
      tabStyle,
      tabDisabledStyle,
      tabActiveStyle,
      tabClassName,
      tabActiveClassName,
      tabFocusedClassName,
      tabDisabledClassName,
      tabEllipsis,

      key: index
    });

    tabProps.onActivate = this.onActivate.bind(this, index);
    tabProps.onClose = this.onClose.bind(this, index, tab);
    tabProps.onKeyDown = this.onKeyDown.bind(this);

    delete tabProps.title;

    props.allTabsProps.push(tabProps);

    let tabTitle;

    if (props.tabFactory) {
      tabTitle = props.tabFactory(tabProps);
    }

    if (tabTitle === undefined) {
      tabTitle = <TabTitle {...tabProps} />;
    }

    const betweenClassName = join(
      `${rootClassName}__between`,
      beforeActive && `${rootClassName}__between--before-active`,
      active && `${rootClassName}__between--after-active`
    );

    return [tabTitle, !last && <Item className={betweenClassName} />];
  }

  onNavigate(dir) {
    const index = this.p.activeIndex;
    this.onActivate(
      this.getAvailableIndexFrom(index, dir, this.props.rotateNavigation)
    );
  }

  onFocusedNavigate(dir) {
    const index = this.p.focusedIndex;
    this.setFocusedTab(
      this.getAvailableIndexFrom(index, dir, this.props.rotateNavigation)
    );
  }

  onNavigateFirst() {
    this.onActivate(this.getFirstAvailableIndex());
  }

  onNavigateLast() {
    this.onActivate(this.getLastAvailableIndex());
  }

  onClose(index, tabProps) {
    this.props.onCloseTab(index);

    if (tabProps.onClose) {
      tabProps.onClose();
    }
  }

  onActivate(activeIndex) {
    if (!this.p.allTabsProps[activeIndex]) {
      return;
    }

    const tabProps = this.p.tabs[activeIndex];

    if (!this.isSelectableTab(tabProps)) {
      return;
    }

    if (tabProps && tabProps.onActivate) {
      if (tabProps.onActivate() === false) {
        return;
      }
    }

    if (this.props.activeIndex == null) {
      this.setState({
        activeIndex
      });
    }

    if (activeIndex != this.p.activeIndex) {
      this.props.onActivate(activeIndex);
    }

    this.setFocusedTab(activeIndex);
  }

  setFocusedTab(focusedIndex) {
    if (this.props.activateOnFocus) {
      return;
    }
    if (focusedIndex === this.p.focusedIndex) {
      return;
    }

    if (!this.p.allTabsProps[focusedIndex]) {
      return;
    }

    const { onFocusedIndexChange } = this.props;

    const tabProps = this.p.tabs[focusedIndex];

    if (!this.isSelectableTab(tabProps)) {
      return;
    }

    if (tabProps && tabProps.onFocusedIndexChange) {
      if (tabProps.onFocusedIndexChange() === false) {
        return;
      }
    }

    if (this.props.focusedIndex == null) {
      this.setState(
        {
          focusedIndex
        },
        () => {
          this.scrollToTab(focusedIndex);
        }
      );
    }

    if (onFocusedIndexChange) {
      onFocusedIndexChange(focusedIndex);
    }
  }

  getAvailableIndexFrom(index, dir, rotate) {
    const tabs = this.p.allTabsProps || [];
    const len = tabs.length;

    let firstIndex;
    let lastIndex;

    if (rotate) {
      firstIndex = this.getFirstAvailableIndex();
      lastIndex = this.getLastAvailableIndex();
    }

    let currentTab;

    const adjustIndex = index => {
      if (rotate) {
        if (index < firstIndex) {
          index = lastIndex;
        } else if (index > lastIndex) {
          index = firstIndex;
        }
      }

      return index;
    };

    let currentIndex = adjustIndex(index + dir);

    while ((currentTab = tabs[currentIndex])) {
      if (this.isSelectableTab(currentTab)) {
        return currentIndex;
      }

      currentIndex = adjustIndex(currentIndex + dir);
    }

    return -1;
  }

  isSelectableTab(tabOrIndex) {
    let tab = tabOrIndex;
    if (typeof tabOrIndex == 'number') {
      tab = this.p.allTabsProps[tabOrIndex];
    }
    return !tab.disabled && tab.selectable !== false;
  }

  getFirstAvailableIndex() {
    return this.getAvailableIndexFrom(-1, 1);
  }

  getLastAvailableIndex() {
    return this.getAvailableIndexFrom(this.getTabCount(), -1);
  }

  getTabCount() {
    const tabs = this.p.allTabsProps || [];

    return tabs.length;
  }
}

TabStrip.propTypes = {
  activateOnFocus: PropTypes.bool,
  focusedIndex: PropTypes.number,
  defaultActiveIndex: PropTypes.number,
  defaultFocusedIndex: PropTypes.number,
  theme: PropTypes.string,
  tabStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  onFocusedIndexChange: PropTypes.func,
  tabFactory: PropTypes.func,
  allTabsProps: PropTypes.any,
  focused: PropTypes.bool,
  closeableOnOver: PropTypes.bool,
  closeable: PropTypes.bool,
  firstActive: PropTypes.bool,
  lastActive: PropTypes.bool,
  onCloseTab: PropTypes.func,
  scrollOnClick: PropTypes.bool,
  topRootClassName: PropTypes.string,
  enableKeyboardNavigation: PropTypes.bool,
  defaultTabs: PropTypes.any,
  tabs: PropTypes.any,
  activateEvent: PropTypes.string,
  onActivate: PropTypes.func,
  activeIndex: PropTypes.number,
  isTabStrip: PropTypes.bool,
  inTabPanel: PropTypes.bool,
  tabDisabledStyle: PropTypes.shape({}),
  tabActiveStyle: PropTypes.shape({}),
  tabClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  tabActiveClassName: PropTypes.string,
  tabFocusedClassName: PropTypes.string,
  tabDisabledClassName: PropTypes.string,
  rotateNavigation: PropTypes.bool,
  scroller: PropTypes.oneOf([true, false, 'auto']),
  tabIndex: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  tabEllipsis: PropTypes.bool,
  tabPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  vertical: (props, propName) => {
    const value = props[propName];
    if (
      value &&
      (props.tabPosition != 'left' && props.tabPosition != 'right')
    ) {
      return new Error(
        'You can only have "vertical" tabs if "tabPosition" is one of "left", "right".'
      );
    }
  },
  tabAlign: PropTypes.oneOf([
    'start',
    'center',
    'end',
    'space-around',
    'space-between',
    'stretch'
  ]),
  tabPosition: PropTypes.oneOf(Object.keys(TAB_POSITION_MAP)),
  rootClassName: PropTypes.string
};

const emptyFn = () => {};

TabStrip.defaultProps = {
  rootClassName: 'zippy-react-toolkit-tab-panel__tab-strip',
  topRootClassName: 'zippy-react-toolkit-tab-panel',
  scroller: 'auto',
  scrollOnClick: false,
  rotateNavigation: true,
  tabIndex: true,
  tabAlign: 'start',
  tabPosition: 'top',
  theme: 'default',
  onActivate: emptyFn,
  onCloseTab: emptyFn,
  onBlur: emptyFn,
  onFocus: emptyFn,
  onFocusedIndexChange: emptyFn,
  isTabStrip: true
};
