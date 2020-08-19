/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Icon from '../../common/Icon';

function CloseButton({ size = 10, className, ...rest }) {
  return (
    <div {...rest} className={className}>
      <svg width={size} height={size} viewBox="4 4 16 16">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </svg>
    </div>
  );
}

export default CloseButton;
