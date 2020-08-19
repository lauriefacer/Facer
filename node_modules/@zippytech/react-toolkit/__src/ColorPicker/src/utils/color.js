/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import tinycolor from 'tinycolor2';

function toColor(color) {
  return tinycolor(color);
}

function toPure(color) {
  const h = toColor(color).toHsl().h;
  return toColor({ h, s: 100, l: 50, a: 1 });
}

function fromRatio(color) {
  return tinycolor.fromRatio(color);
}

function toAlpha(color, alpha) {
  if (alpha > 1) {
    alpha = alpha / 100;
  }

  color = toColor(color).toRgb();
  color.a = alpha;

  return toColor(color);
}

function toRgb(color) {
  return toColor(color).toRgb();
}

function toHsv(color) {
  const c = toColor(color).toHsv();

  return {
    h: c.h,
    v: c.v,
    s: c.s,
    a: c.a
  };
}

function toColorValue(color) {
  return typeof color == 'string' ? toHsv(color) : color;
}

function rgbToHex(color) {
  color = toColor({ ...color });
  return color.toHexString();
}

function isValidColor(color) {
  const colorToValidate = tinycolor(color);
  return colorToValidate.isValid();
}

export default {
  fromRatio,
  toAlpha,
  toColor,
  toHsv,
  toPure,
  toColorValue
};

export {
  fromRatio,
  toAlpha,
  toColor,
  toHsv,
  toPure,
  toColorValue,
  toRgb,
  rgbToHex,
  isValidColor
};
