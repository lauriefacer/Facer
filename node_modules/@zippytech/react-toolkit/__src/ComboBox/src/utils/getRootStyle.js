/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function getRootStyle({ props, state }) {
  const style = {};

  return {
    ...style,
    ...props.style
  };
}

export default getRootStyle;
