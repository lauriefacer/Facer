/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Component from '@zippytech/react-class';

class Indeterminate extends Component {
  render() {
    const { className, barStyle } = this.props;

    return (
      <div className={className}>
        <div style={barStyle} className={`${className}__bar`} />
      </div>
    );
  }
}

export default Indeterminate;
