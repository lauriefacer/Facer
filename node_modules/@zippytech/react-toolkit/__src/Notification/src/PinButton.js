/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Icon from '../../common/Icon';

function PinButton({ size = 14, className, pinned, ...rest }) {
  return (
    <div {...rest} className={className}>
      <Icon type={pinned ? 'pin-down' : 'pin-up'} size={size} />
    </div>
  );
}

export default PinButton;
