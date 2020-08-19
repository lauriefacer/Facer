/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { toHsv } from './color';

const toColorValue = value => {
  if (typeof value == 'string') {
    return toHsv(value);
  }

  if (!value) {
    return {};
  }

  return {
    h: value.h,
    s: value.s,
    v: value.v,
    a: value.a
  };
};

export default toColorValue;
