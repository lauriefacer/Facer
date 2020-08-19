/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

function CloseIcon({ size = 10, className, svgProps, ...rest }) {
  return (
    <div {...rest} className={className}>
      <svg {...svgProps} width={size} height={size} viewBox="4 4 16 16">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </svg>
    </div>
  );
}

CloseIcon.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number
};

function ToggleIcon({ onClick, className, expanded, size = 10, ...rest }) {
  return (
    <div {...rest} className={className} onClick={onClick}>
      <svg height={size} width={size} viewBox="5 4 14 14">
        {expanded ? (
          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
        ) : (
          <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" />
        )}
      </svg>
    </div>
  );
}

function LoadingIcon({ size = 17, svgProps = {}, className, ...rest }) {
  return (
    <div {...rest} className={className}>
      <svg {...svgProps} width={size} height={size} viewBox="0 0 24 24">
        <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
      </svg>
    </div>
  );
}

LoadingIcon.propTypes = {
  size: PropTypes.number
};

export { CloseIcon, ToggleIcon, LoadingIcon };
