/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import assign from '../../common/assign';
import shouldComponentUpdate from '../../common/shouldComponentUpdate';

class Steps extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState);
  }

  render() {
    const { className, stepTickDirection, style } = this.props;

    let steps = this.renderSteps();

    return (
      <div className={className} style={style}>
        {steps}
      </div>
    );
  }

  renderSteps() {
    const {
      formatedStep,
      directionMap,
      stepClassName,
      stepStyle,
      value,
      renderStep
    } = this.props;

    return formatedStep.map(({ from, to }, index) => {
      const style = {
        ...stepStyle,
        [directionMap.start]: `${from}%`,
        [directionMap.end]: `${to}%`
      };

      let result;

      const domProps = {
        style,
        key: index,
        className: `${stepClassName} ${stepClassName}__${index + 1}`
      };

      if (renderStep) {
        result = renderStep({ domProps, from, to, index, value });
      }

      if (result === undefined) {
        result = <div {...domProps} />;
      }

      return result;
    });
  }
}

Steps.defaultProps = {};

Steps.propTypes = {
  className: PropTypes.string,
  stepStyle: PropTypes.object,
  stepTickDirection: PropTypes.number,
  formatedStep: PropTypes.arrayOf(PropTypes.object),
  renderStep: PropTypes.func,
  directionMap: PropTypes.object
};

export default Steps;
