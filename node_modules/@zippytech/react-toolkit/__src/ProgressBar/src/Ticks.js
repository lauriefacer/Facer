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

class Ticks extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState);
  }

  render() {
    const { className, stepTickDirection, style } = this.props;

    let ticks = this.renderTicks();

    if (stepTickDirection === 1) {
      ticks.shift();
    } else {
      ticks.pop();
    }

    return (
      <div className={className} style={style}>
        {ticks}
      </div>
    );
  }

  renderTicks() {
    const {
      formatedTick,
      tickClassName,
      renderTick,
      directionMap,
      tickStyle,
      stepTickDirection,
      value
    } = this.props;

    return formatedTick.map(({ from, to }, index) => {
      const style = {
        [directionMap.start]: `${from}%`,
        ...tickStyle
      };

      let result;
      const domProps = {
        style,
        key: index,
        className: `${tickClassName} ${tickClassName}__${index + 1}`
      };

      if (renderTick) {
        result = renderTick({ domProps, index, from, value });
      }

      if (result === undefined) {
        result = <div {...domProps} />;
      }

      return result;
    });
  }
}

Ticks.defaultProps = {};

Ticks.propTypes = {
  className: PropTypes.string,
  stepTickDirection: PropTypes.number,
  formatedTick: PropTypes.arrayOf(PropTypes.object),
  renderTick: PropTypes.func,
  directionMap: PropTypes.object
};

export default Ticks;
