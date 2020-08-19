/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const notEmpty = x => !!x;

export default function() {
  return [].slice
    .call(arguments)
    .filter(notEmpty)
    .join(' ');
}
