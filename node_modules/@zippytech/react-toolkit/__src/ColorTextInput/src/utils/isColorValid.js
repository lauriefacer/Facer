/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import tinyColor from 'tinycolor2';

function isColorValid(color) {
  return tinyColor(color).isValid();
}

export default isColorValid;
