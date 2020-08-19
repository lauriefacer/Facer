/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function toLowerCaseFirst(s) {
  return s ? s.charAt(0).toLowerCase() + s.substring(1) : '';
}

export default toLowerCaseFirst;
