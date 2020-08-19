/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import join from '../../common/join';

const DEFAULT_CLASS_NAME = 'zippy-react-toolkit-load-mask__loader';
const LOADBAR_CLASSNAME = `${DEFAULT_CLASS_NAME}-loadbar`;

const getMeasureName = duration => {
  if (typeof duration == 'number' || duration * 1 == duration) {
    return 's';
  }

  let measure;
  duration.match(/[a-zA-Z]*$/, match => {
    measure = match;
  });
  return measure || 's';
};

class ZippySpinLoader extends React.Component {
  render() {
    const props = this.props;

    const style = {
      ...props.style,
      width: props.size,
      height: props.size
    };

    const className = join(
      props.className,
      DEFAULT_CLASS_NAME,
      `${DEFAULT_CLASS_NAME}--spin`,
      props.theme && `${DEFAULT_CLASS_NAME}--theme-${props.theme}`
    );

    const { animationDuration } = props;

    const measureName = animationDuration
      ? getMeasureName(animationDuration)
      : '';

    const bars = [...Array(12)].map((_, i) => {
      const index = i + 1;

      return (
        <div
          key={index}
          className={`${LOADBAR_CLASSNAME} ${LOADBAR_CLASSNAME}--${index}`}
        />
      );
    });

    return (
      <div style={style} className={className}>
        {bars}
      </div>
    );
  }
}

ZippySpinLoader.propTypes = {
  size: PropTypes.number,
  theme: PropTypes.string,
  animationDuration: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
ZippySpinLoader.defaultProps = { size: 40 };

export default ZippySpinLoader;
