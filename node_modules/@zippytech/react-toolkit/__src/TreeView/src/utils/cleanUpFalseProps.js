/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Remove false keys from an object.
 * It mutates the object!.
 * @param  {Object} props
 * @return {Void}
 */
function cleanUpFalseProps(props) {
  Object.keys(props).forEach(path => {
    if (props[path] === false) {
      delete props[path];
    }
  });
}

export default cleanUpFalseProps;
