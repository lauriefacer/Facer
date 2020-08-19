/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import Overlay from '../../Overlay';

class ZippyTooltip extends Component {
  constructor(props) {
    super(props);
    this.setRootRef = ref => (this.rootNode = ref);
  }
  render() {
    return <Overlay ref={this.setRootRef} {...this.props} />;
  }
  show() {
    if (this.rootNode) {
      this.rootNode.show();
    }
  }
  hide() {
    if (this.rootNode) {
      this.rootNode.hide();
    }
  }
}

ZippyTooltip.defaultProps = {
  rootClassName: 'zippy-react-toolkit-tooltip',
  hideOnScroll: true,

  // style
  arrowSize: 7,
  arrow: true,

  // fade
  fade: true,
  showDelay: 250,
  hideDelay: 300,
  fadeInDuration: 150,
  fadeOutDuration: 50,

  useTransform: true,

  // events
  showEvent: ['mouseenter'],
  hideEvent: ['mouseleave']
};

export default ZippyTooltip;
