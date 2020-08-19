/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { toColor } from './color';

function toStringValue(color) {
  color = toColor({ ...color });

  return color.toRgb().a == 1 ? color.toHexString() : color.toRgbString();
}

export default toStringValue;
