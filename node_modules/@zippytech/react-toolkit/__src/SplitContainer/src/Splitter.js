/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { Flex } from '../../Flex';
import autoBind from '@zippytech/react-class/autoBind';
import DragHelper from '@zippytech/drag-helper';
import isMobile from '../../common/isMobile';
import join from '../../common/join';
import cleanProps from '../../common/cleanProps';

const emptyFn = () => {};

export default class Splitter extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }
  prepareChildren(props) {
    const result = [];
    const horizontal = props.orientation == 'horizontal';

    const className = `${props.rootClassName}-inner`;
    const row = horizontal;
    const column = !row;

    const flexProps = {
      justifyContent: 'center',
      alignItems: 'center',
      wrap: false,
      row,
      column
    };

    const { collapsedIndex, locked, rootClassName, iconSize } = props;

    if (locked) {
      return null;
    }

    const ARROWS = horizontal
      ? {
          down: (
            <svg
              className={`${rootClassName}__icon`}
              height={iconSize}
              width={iconSize}
              viewBox="0 0 24 24"
            >
              <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" />
            </svg>
          ),
          up: (
            <svg
              className={`${rootClassName}__icon`}
              height={iconSize}
              width={iconSize}
              viewBox="0 0 24 24"
            >
              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
            </svg>
          )
        }
      : {
          right: (
            <svg
              className={`${rootClassName}__icon`}
              height={iconSize}
              width={iconSize}
              viewBox="0 0 24 24"
            >
              <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
            </svg>
          ),
          left: (
            <svg
              className={`${rootClassName}__icon`}
              height={iconSize}
              width={iconSize}
              viewBox="0 0 24 24"
            >
              <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" />
            </svg>
          )
        };

    const firstCollapsed = collapsedIndex == 0;
    const secondCollapsed = collapsedIndex == 1;

    const collapsible = props.collapsible || [];
    const firstCollapsible = collapsible[0] !== false;
    const secondCollapsible = collapsible[1] !== false;

    if ((firstCollapsible && !firstCollapsed) || secondCollapsed) {
      const firstEvents = {
        [isMobile ? 'onTouchEnd' : 'onClick']: this.toggleCollapse.bind(
          this,
          -1
        )
      };
      result.push(
        <Flex
          {...flexProps}
          key="first"
          className={join(
            className,
            `${className}--first`,
            `${className}--orientation-${props.orientation}`
          )}
          {...firstEvents}
        >
          {horizontal ? ARROWS.up : ARROWS.left}
        </Flex>
      );
    }

    if ((secondCollapsible && !secondCollapsed) || firstCollapsed) {
      const secondEvents = {
        [isMobile ? 'onTouchEnd' : 'onClick']: this.toggleCollapse.bind(this, 1)
      };

      result.push(
        <Flex
          {...flexProps}
          key="second"
          className={join(
            className,
            `${className}--second`,
            `${className}--orientation-${props.orientation}`
          )}
          {...secondEvents}
        >
          {horizontal ? ARROWS.down : ARROWS.right}
        </Flex>
      );
    }

    const size = isMobile ? props.mobileSize || props.size : props.size;

    if (isMobile) {
      const mobileSplitterDragArea = props.mobileSplitterDragArea || size * 2;

      const leftMargin = (mobileSplitterDragArea - size) / 2;
      result.push(
        <div
          key="mobileDragger"
          className={`${rootClassName}-dragger ${rootClassName}-dragger--orientation-${
            props.orientation
          }`}
          style={
            props.orientation == 'vertical'
              ? {
                  top: 0,
                  width: 2 * leftMargin,
                  bottom: 0
                }
              : {
                  left: 0,
                  height: 2 * leftMargin,
                  right: 0
                }
          }
        />
      );
    }

    return result;
  }

  prepareProps(thisProps) {
    const props = { ...this.props };

    props.className = this.prepareClassName(props);
    props.children = this.prepareChildren(props);

    const size = isMobile ? props.mobileSize || props.size : props.size;
    if (size != null) {
      props.style = {
        ...props.style,
        [props.orientation == 'horizontal' ? 'height' : 'width']: size
      };
    }

    return props;
  }

  prepareClassName(props) {
    const {
      collapsedIndex,
      locked,
      draggable,
      constrained,
      rootClassName
    } = props;

    const size = isMobile ? props.mobileSize || props.size : props.size;

    return join(
      props.className,
      rootClassName,
      `${rootClassName}--orientation-${props.orientation}`,
      locked && `${rootClassName}--locked`,
      size == 0 && `${rootClassName}--zero-size`,
      draggable && `${rootClassName}--draggable`,
      constrained && `${rootClassName}--constrained`,
      collapsedIndex != undefined &&
        join(
          `${rootClassName}--collapsed`,
          `${rootClassName}--collapsed-${collapsedIndex == 0 ? 'start' : 'end'}`
        )
    );
  }

  render() {
    const props = this.prepareProps(this.props);

    const horizontal = props.orientation == 'horizontal';

    const row = horizontal;
    const column = !row;

    const events = {
      [isMobile ? 'onDoubleTap' : 'onDoubleClick']: this.handleDoubleClick,
      [isMobile ? 'onTouchStart' : 'onMouseDown']: this.handleMouseDown
    };

    return (
      <Flex
        wrap={false}
        row={row}
        column={column}
        justifyContent="center"
        alignItems="center"
        {...cleanProps(props, Splitter.propTypes)}
        draggable={null}
        {...events}
      />
    );
  }

  handleDoubleClick(event) {
    this.props.onDoubleClick(event);

    const { collapsedIndex } = this.props;

    if (collapsedIndex == null) {
      return;
    }

    this.toggleCollapse(collapsedIndex == 0 ? 1 : -1);
  }

  handleMouseDown(event) {
    this.props.onMouseDown(event);

    if (
      this.props.locked ||
      !this.props.draggable ||
      this.props.collapsedIndex != null
    ) {
      return;
    }

    event.preventDefault();

    const node = findDOMNode(this);
    const parent = node.parentNode;
    const zeroPositionName =
      this.props.orientation == 'vertical' ? 'top' : 'left';

    DragHelper(event, {
      scope: this,
      region: node,
      constrainTo: parent,
      onDragStart(event, config) {
        config.diff[zeroPositionName] = 0;
        this.props.onDragStart(config.diff, event);
      },

      onDrag(event, config) {
        event.preventDefault();
        config.diff[zeroPositionName] = 0;
        this.props.onDrag(config.diff, event);
      },

      onDrop(event, config) {
        config.diff[zeroPositionName] = 0;
        this.props.onDrop(config.diff, event);
      }
    });
  }

  toggleCollapse(direction, event) {
    if (this.props.locked) {
      return;
    }

    const { collapsedIndex, onExpand, onCollapse } = this.props;

    const index =
      collapsedIndex != undefined
        ? // there is a collapsed item
          // so we are expanding
          collapsedIndex
        : // otherwise, we are collapsing
          direction == 1
          ? 1
          : 0;

    const fn = collapsedIndex === index ? onExpand : onCollapse;

    fn(index, event);
  }
}

Splitter.propTypes = {
  rootClassName: PropTypes.string.isRequired,
  size: PropTypes.number,
  mobileSize: PropTypes.number,
  mobileSplitterDragArea: PropTypes.number,
  orientation: PropTypes.string,
  locked: PropTypes.bool,
  onCollapse: PropTypes.func,
  onExpand: PropTypes.func,
  isSplitter: PropTypes.bool,
  constrained: PropTypes.bool,
  iconSize: PropTypes.number,
  collapsible: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),

  collapsedIndex: PropTypes.oneOf([undefined, 0, 1])
};

Splitter.defaultProps = {
  isSplitter: true,
  iconSize: isMobile ? 28 : 18,

  onDragStart: emptyFn,
  onDrag: emptyFn,
  onDrop: emptyFn,

  onCollapse: emptyFn,
  onExpand: emptyFn,

  onDoubleClick: emptyFn,
  onMouseDown: emptyFn
};
