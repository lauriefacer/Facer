/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default function absoluteCenter(style) {
  style = style || {};

  style.margin = 'auto';
  style.position = 'absolute';
  style.top = style.bottom = style.left = style.right = 0;

  return style;
}
