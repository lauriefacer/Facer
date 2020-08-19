/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { findDOMNode } from 'react-dom';
import Region from '@zippytech/region';
import DragHelper from '@zippytech/drag-helper';
import toColorValue from './toColorValue';

const emptyFn = () => {};

export default {
  toColorValue,

  getDOMRegion() {
    return Region.fromDOM(findDOMNode(this));
  },

  onMouseDown(event) {
    event.preventDefault();

    const region = this.getDOMRegion();
    const info = this.getEventInfo(event, region);

    DragHelper(event, {
      scope: this,
      constrainTo: region,
      onDragStart(event, config) {
        config.initialPoint = info;

        config.minLeft = 0;
        config.maxLeft = region.width;

        this.handleDragStart(event);
      },
      onDrag(event, config) {
        const info = this.getEventInfo(event, region);
        this.updateColor(info);
        this.handleDrag(event, config);
      },
      onDrop(event, config) {
        const info = this.getEventInfo(event, region);
        this.updateColor(info);
        this.handleDrop(event, config);
      }
    });

    this.updateColor(info);
    this.handleMouseDown(event, { initialPoint: info });
  },

  handleMouseDown(event, config) {
    (this.props.onMouseDown || emptyFn).apply(this, this.getColors());
    this.handleDrag(event, config);
  },

  handleUpdate(event, config) {
    const diff = config.diff || { top: 0, left: 0 };
    const initialPoint = config.initialPoint;

    if (initialPoint) {
      let top;
      let left;

      left = initialPoint.x + diff.left;
      top = initialPoint.y + diff.top;

      left = Math.max(left, config.minLeft);
      left = Math.min(left, config.maxLeft);

      this.state.top = top;
      this.state.left = left;

      this.state.mouseDown = {
        x: left,
        y: top,
        width: initialPoint.width,
        height: initialPoint.height
      };
    }

    if (this.props.inPicker) {
      // the picker handles the values
      return;
    }

    if (!this.props.value) {
      this.setState({
        value: this.hsv
      });
    }
  },

  handleDragStart() {},

  handleDrag(event, config) {
    this.handleUpdate(event, config);
    (this.props.onDrag || emptyFn).apply(this, this.getColors());
  },

  handleDrop(event, config) {
    this.handleUpdate(event, config);
    this.state.mouseDown = false;
    (this.props.onChange || emptyFn).apply(this, this.getColors());
  },

  getColors() {
    const first = this.props.inPicker ? this.hsv : this.toStringValue(this.hsv);

    const args = [first];

    if (!this.props.inPicker) {
      args.push({ ...this.hsv });
    }

    return args;
  },

  getEventInfo(event, region) {
    region = region || this.getDOMRegion();

    const x = event.clientX - region.left;
    const y = event.clientY - region.top;

    return {
      x,
      y,
      width: region.getWidth(),
      height: region.getHeight()
    };
  }
};
