/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function validatePoint(info) {
  const { height, width } = info;

  if (info.x < 0) {
    info.x = 0;
  }

  if (info.x >= width) {
    info.x = width;
  }

  if (info.y < 0) {
    info.y = 0;
  }

  if (info.y >= height) {
    info.y = height;
  }

  return info;
}

export default validatePoint;
