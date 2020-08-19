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

export default class ZippySvgLoader extends React.Component {
  render() {
    const props = this.props;

    const style = {
      ...props.style,
      width: props.size,
      height: props.size
    };

    if (props.animationDuration) {
      style.animationDuration = props.animationDuration;
    }

    const className = join(
      props.className,
      DEFAULT_CLASS_NAME,
      `${DEFAULT_CLASS_NAME}--svg`,
      props.theme && `${DEFAULT_CLASS_NAME}--theme-${props.theme}`
    );
    return (
      <div style={style} className={className}>
        <svg height={props.size} viewBox="0 0 24 24" width={props.size}>
          <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
        </svg>
      </div>
    );
  }
}

ZippySvgLoader.propTypes = {
  size: PropTypes.number,
  theme: PropTypes.string,
  animationDuration: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
ZippySvgLoader.defaultProps = { size: 40 };
