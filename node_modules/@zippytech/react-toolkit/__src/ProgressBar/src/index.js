/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Component from '@zippytech/react-class';
import { NotifyResize } from '../../NotifyResize';
import Steps from './Steps';
import Ticks from './Ticks';

import cleanProps from '../../common/cleanProps';
import assign from '../../common/assign';
import join from '../../common/join';
import getWrappersStyles from './utils/getWrappersStyles';
import capitalizeFirstLetter from './utils/capitalizeFirstLetter';
import getLabelBasedOnValue from './utils/getLabelBasedOnValue';
import shouldComponentUpdate from '../../common/shouldComponentUpdate';
import Indeterminate from './Indeterminate';

import isNumeric from './utils/isNumeric';
import prepareProps from './utils/prepareProps';

const raf = global.requestAnimationFrame;

const FILL_LABEL_POSITIONS_THAT_OVERFLOW_WRONG = ['fillEnd', 'fillCenter'];

const REMAINING_LABEL_POSITIONS_THAT_OVERFLOW_WRONG = [
  'remainingCenter',
  'remainingStart'
];

const LABEL_POSITIONS_THAT_OVERFLOW_WRONG = [
  ...FILL_LABEL_POSITIONS_THAT_OVERFLOW_WRONG,
  ...REMAINING_LABEL_POSITIONS_THAT_OVERFLOW_WRONG
];

class ZippyProgressBar extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState);
  }

  componentDidMount() {
    this.checkLabelOverflow();
    this.updateProgressBarSize();
  }

  componentDidUpdate(previousProps) {
    /**
     * need to read the updated dom
     */
    if (this.props.value !== previousProps.value) {
      this.checkLabelOverflow();
    }
  }

  render() {
    const preparedProps = (this.p = prepareProps(this.props, this.state));

    const {
      indeterminate,
      className,
      rootClassName,
      indeterminateBarStyle
    } = preparedProps;

    return (
      <div
        {...cleanProps(this.props, ZippyProgressBar.propTypes)}
        className={className}
        ref={el => (this.node = el)}
      >
        {this.renderTicks()}
        {this.renderSteps()}
        {indeterminate ? (
          <Indeterminate
            barStyle={indeterminateBarStyle}
            className={`${rootClassName}__indeterminate`}
          />
        ) : (
          this.renderProgress()
        )}
        <NotifyResize rafOnResize onResize={this.onResize} />
      </div>
    );
  }

  renderTicks() {
    const {
      tick,
      formatedTick,
      showSteps,
      renderTick,
      showTicks,
      directionMap,
      stepTickDirection,
      tickStyle,
      ticksStyle,
      rootClassName,
      value
    } = this.p;

    /**
     * show ticks:
     * - showTicks is defined use it's value
     * - is not defined, than default to showSteps
     */
    if (showTicks === false || !formatedTick) {
      return null;
    } else if (!showSteps) {
      return;
    }

    const className = `${rootClassName}__ticks`;
    const tickClassName = `${rootClassName}__tick`;

    return (
      <Ticks
        ticksStyle={ticksStyle}
        tickStyle={tickStyle}
        renderTick={renderTick}
        className={className}
        tickClassName={tickClassName}
        formatedTick={formatedTick}
        directionMap={directionMap}
        stepTickDirection={stepTickDirection}
        value={value}
      />
    );
  }

  renderSteps() {
    const {
      formatedStep,
      showSteps,
      renderStep,
      directionMap,
      stepTickDirection,
      rootClassName,
      stepsStyle,
      stepStyle,
      value
    } = this.p;

    if (!showSteps || !formatedStep) {
      return;
    }

    const className = `${rootClassName}__steps`;
    const stepClassName = `${rootClassName}__step`;

    return (
      <Steps
        className={className}
        stepClassName={stepClassName}
        formatedStep={formatedStep}
        renderStep={renderStep}
        style={stepsStyle}
        stepStyle={stepStyle}
        directionMap={directionMap}
        stepTickDirection={stepTickDirection}
        value={value}
      />
    );
  }

  // both fill and remaining bars are rendererd in the same place
  // because both of them are very similar
  renderProgress() {
    const {
      horizontal,
      value,
      direction,
      rootClassName,

      // label
      labelPosition,

      // size
      fillSize,
      remainingSize,
      dimension,

      // colors
      remainingColor,
      fillColor,

      // animation
      transition,
      transitionDuration,
      springConfig
    } = this.p;

    const {
      fillLabelWrapperStyle,
      remainingLabelWrapperStyle
    } = getWrappersStyles({
      labelPosition,
      dimension,
      fillSize,
      remainingSize,
      parentSize: this.state.parentSize
    });

    const partsRenderFunction = ({ size }) => {
      /**
       * Check on each transition step to ajust label position if
       * it overflows. This is the main reason react-motion
       * is used so this check can be made during the transition
       */
      if (raf) {
        raf(this.checkLabelOverflow);
      }

      const liveFillSize = size;
      const liveRemainingSize = 100 - liveFillSize;

      const passedFillStyle =
        typeof this.p.fillStyle === 'function'
          ? this.p.fillStyle(this.p)
          : this.p.fillStyle;

      const fillStyle = assign(
        {
          backgroundColor:
            typeof fillColor === 'function' ? fillColor(this.p) : fillColor,
          [dimension]: `${liveFillSize}%`,
          transitionDuration: transition && transitionDuration
        },
        passedFillStyle
      );

      const passedRemainingStyle =
        typeof this.p.remainingStyle === 'function'
          ? this.p.remainingStyle(this.p)
          : this.p.remainingStyle;

      const remainingStyle = assign(
        {
          transitionDuration: transition && transitionDuration,
          backgroundColor:
            typeof remainingColor === 'function'
              ? remainingColor(this.p)
              : remainingColor,
          [dimension]: `${liveRemainingSize}%`
        },
        passedRemainingStyle
      );

      const fill = (
        <div
          key="fill"
          ref={el => (this.fill = el)}
          className={`${rootClassName}__fill`}
          style={fillStyle}
        >
          <div
            style={fillLabelWrapperStyle}
            className={`${rootClassName}__fill-label-wrapper`}
          >
            {this.renderLabel('fill', liveFillSize, fillSize)}
          </div>
        </div>
      );

      const remaining = (
        <div
          key="remaining"
          ref={el => (this.remaining = el)}
          className={`${rootClassName}__remaining`}
          style={remainingStyle}
        >
          <div
            style={remainingLabelWrapperStyle}
            className={`${rootClassName}__remaining-label-wrapper`}
          >
            {this.renderLabel('remaining', liveRemainingSize, remainingSize)}
          </div>
        </div>
      );

      let parts;
      // direction -1 reverse parts
      if (direction === -1) {
        parts = [remaining, fill];
      } else {
        parts = [fill, remaining];
      }

      return <div className={`${rootClassName}__barsWrapper`}>{parts}</div>;
    };

    return partsRenderFunction({ size: fillSize });
  }

  renderLabel(type, size, finalSize) {
    const {
      labelClassName,
      labelStyle,
      labelRotateValue,
      labelRotateStyle,
      rootClassName,

      // labels colors
      labelFillColor,
      labelRemainingColor,
      remainingColor,
      fillColor,
      value,
      max
    } = this.p;

    let result;

    let label;
    if (this.p.label === false || this.p.label === null) {
      return null;
    }

    const className = join(`${rootClassName}__label`, labelClassName);
    const style = assign({}, labelRotateValue, labelRotateStyle);

    // add label colors
    if (type === 'fill' && (labelFillColor || remainingColor)) {
      if (!labelFillColor) {
        style.color =
          typeof remainingColor === 'function'
            ? remainingColor(this.p)
            : remainingColor;
      } else {
        style.color = labelFillColor;
      }
    }

    if (type === 'remaining' && (labelRemainingColor || fillColor)) {
      if (!labelRemainingColor) {
        style.color =
          typeof fillColor === 'function' ? fillColor(this.p) : fillColor;
      } else {
        style.color = labelRemainingColor;
      }
    }

    // labelStyle should overwrite color
    if (labelStyle) {
      assign(style, labelStyle);
    }

    let labelBasedOnValue = getLabelBasedOnValue({ size, finalSize, value });
    if (this.p.label != undefined) {
      label = this.p.label;
    } else {
      label = labelBasedOnValue;
    }

    // labelProps can be modified by render label render function
    let domProps = {
      className,
      style,
      ref: el => (this[`label${capitalizeFirstLetter(type)}`] = el),
      children: labelBasedOnValue
    };

    if (this.p.label) {
      if (typeof this.p.label === 'function') {
        result = this.p.label({ domProps, value });
      } else {
        result = this.p.label;
      }
    }

    if (result === undefined) {
      result = <div {...domProps} />;
    }

    return result;
  }

  getOffsetDimensionText() {
    return `offset${capitalizeFirstLetter(this.p.dimension)}`;
  }

  /**
   * Called whenever parts change size
   * - *value* changes
   * - parent changes size
   *
   * if label is smaller than it's container add a class on parent
   * .labelOverflow
   */
  checkLabelOverflow() {
    if (
      LABEL_POSITIONS_THAT_OVERFLOW_WRONG.indexOf(this.props.labelPosition) ===
      -1
    ) {
      return;
    }

    const isFillPosition =
      FILL_LABEL_POSITIONS_THAT_OVERFLOW_WRONG.indexOf(
        this.props.labelPosition
      ) !== -1;
    const isRemainingPosition =
      REMAINING_LABEL_POSITIONS_THAT_OVERFLOW_WRONG.indexOf(
        this.props.labelPosition
      ) !== -1;

    const { fill, remaining, labelFill, labelRemaining } = this;

    if (!(fill && remaining && labelFill && labelRemaining)) {
      return;
    }

    const dimension = this.getOffsetDimensionText();

    if (isFillPosition) {
      const fillSize = fill[dimension];
      const labelFillSize = labelFill[dimension];
      const fillOverflowsWrong = fillSize < labelFillSize;

      if (fillOverflowsWrong) {
        this.setState({
          labelOverflow: true
        });
        return;
      }
    }

    if (isRemainingPosition) {
      const remainingSize = remaining[dimension];
      const labelRemainingSize = labelRemaining[dimension];
      const remainingOverflowsWrong = remainingSize < labelRemainingSize;

      if (remainingOverflowsWrong) {
        this.setState({
          labelOverflow: true
        });
        return;
      }
    }

    if (this.state.labelOverflow !== false) {
      this.setState({
        labelOverflow: false
      });
    }
  }

  updateProgressBarSize() {
    const node = this.node;
    const childElement = node.firstElementChild;
    const parentSize = childElement[this.getOffsetDimensionText()];

    if (this.state.parentSize !== parentSize) {
      this.setState({
        parentSize
      });
    }
  }

  onResize() {
    this.updateProgressBarSize();
    this.checkLabelOverflow();
  }
}

ZippyProgressBar.defaultProps = {
  // General
  rootClassName: 'zippy-react-toolkit-progress-bar',

  // value
  min: 0,
  max: 100,

  orientation: 'horizontal',
  transitionDuration: '300ms',
  renderLabel: value => `${value} %`,
  indeterminate: false,

  // label
  labelPosition: 'end',
  labelStyle: {},
  labelClassName: '',
  rotateLabel: false,

  // direction
  direction: 1,
  rtl: false,

  // fill style/color
  fillColor: '#428bca',
  remainingColor: '#fff',

  // animation
  transition: true,
  springConfig: {},

  // Step
  showSteps: true,
  renderStep: null,
  renderTick: null,

  onChange: () => {}
};

ZippyProgressBar.propTypes = {
  // General
  rootClassName: PropTypes.string,

  // `min` and `max` are related, so they are validate both here
  minMax: (props, propName, componentName) => {
    const { min, max } = props;

    if (!isNumeric(min)) {
      return new Error(`min must be numeric, min: ${min}`);
    }

    if (!isNumeric(max)) {
      return new Error(`max must be numeric, max: ${max}`);
    }

    if (max < min) {
      return new Error(
        `min must be smaller than max. min: ${min}, max: ${max}`
      );
    }
  },

  value: PropTypes.number,

  // label
  label: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
    PropTypes.func
  ]),

  orientation: PropTypes.oneOf(['horizontal', 'vertical']),

  // label position
  labelPosition: PropTypes.oneOf([
    'start',
    'end',
    'center',
    'fillEnd',
    'fillCenter',
    'remainingCenter',
    'remainingStart'
    // we also will (not now) support equvalent values,
    // - for horizontal
    // 'left', 'right',
    // - for vertical
    // 'top', 'bottom', 'middle'
  ]),

  // direction, rtl === direction = -1
  direction: PropTypes.oneOf([1, -1]),
  rtl: PropTypes.bool,

  // states
  indeterminate: PropTypes.bool,

  // style
  completeStyle: PropTypes.object,
  incompleteStyle: PropTypes.object,
  indeterminateBarStyle: PropTypes.object,
  fillStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  remainingStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  // label style
  labelStyle: PropTypes.object,
  labelClassName: PropTypes.string,
  rotateLabel: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),

  // label
  renderLabel: PropTypes.func,
  labelFillColor: PropTypes.string,
  fillColor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  remainingColor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  labelRemainingColor: PropTypes.string,

  // animation
  transition: PropTypes.bool,
  springConfig: PropTypes.object,
  transitionDuration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  // Step
  showSteps: PropTypes.bool,
  stepStyle: PropTypes.object,
  stepsStyle: PropTypes.object,
  step: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.number,
    PropTypes.func
  ]),
  stepDuration: PropTypes.number,
  renderStep: PropTypes.func,
  incrementInSteps: PropTypes.bool,

  // ticks
  tick: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.number,
    PropTypes.func
  ]),
  tickStyle: PropTypes.object,
  ticksStyle: PropTypes.object,
  showTicks: PropTypes.bool,
  renderTick: PropTypes.func
};

export default ZippyProgressBar;
