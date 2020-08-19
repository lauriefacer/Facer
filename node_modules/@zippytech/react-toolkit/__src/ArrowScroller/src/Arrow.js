/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import isMobile from '../../common/isMobile';

const ARROWS = {
  right: <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />,
  left: <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" />,
  down: <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" />,
  up: <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
};

const Arrow = ({ name, className, size = isMobile ? 25 : 20 }) => {
  return (
    <svg
      className={`${className} ${className}--${name}`}
      height={size.height || size}
      width={size.width || size}
      viewBox="0 0 24 24"
    >
      {ARROWS[name]}
    </svg>
  );
};

export default Arrow;
