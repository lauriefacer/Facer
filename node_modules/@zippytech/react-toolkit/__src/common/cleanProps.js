/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Remove props that are present in proptypes
 * @param Object props
 * @param Object defaultProps
 */
function cleanProps(props, propTypes) {
  if (!props) {
    return props;
  }
  const newProps = Object.keys(props).reduce((acc, propName) => {
    if (!propTypes[propName]) {
      acc[propName] = props[propName];
    }
    return acc;
  }, {});

  return newProps;
}

export default cleanProps;
