/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

const checkedIcon = ({ style, size = 24, className }) => (
  <svg
    height={size}
    viewBox="0 0 24 24"
    className={className}
    width={size}
    style={style}
  >
    <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const uncheckedIcon = ({ style, size = 24, className }) => (
  <svg
    height={size}
    viewBox="0 0 24 24"
    className={className}
    width={size}
    style={style}
  >
    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
  </svg>
);

const indeterminateIcon = ({ style, size = 24, className }) => (
  <svg
    height={size}
    viewBox="0 0 24 24"
    className={className}
    width={size}
    style={style}
  >
    <defs>
      <path d="M0 0h24v24H0z" id="a" />
    </defs>
    <clipPath id="b">
      <use overflow="visible" />
    </clipPath>
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z" />
  </svg>
);

export { checkedIcon, uncheckedIcon, indeterminateIcon };
