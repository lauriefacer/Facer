/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, findDOMNode, unmountComponentAtNode } from 'react-dom';

const renderInDOM = (comp, domTarget = document.body) => {
  const target = document.createElement('div');
  domTarget.appendChild(target);

  const wrapper = render(comp, target);

  return {
    wrapper,
    wrapperNode: findDOMNode(wrapper),
    target,
    unmount: () => {
      unmountComponentAtNode(target);
      document.body.removeChild(target);
    }
  };
};

export default renderInDOM;
