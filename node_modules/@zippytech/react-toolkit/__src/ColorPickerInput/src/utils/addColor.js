/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Ads the color to the next empty position.
 * If the palette is full it adds the color at
 * the first position.
 * @param {String} color   Color to addColor
 * @param {String[]} palette
 */
function addColor({ color, palette, length }) {
  if (!color) {
    return palette;
  }
  if (!Array.isArray(palette)) {
    return [color];
  }
  if (palette && palette.length >= length) {
    return [color, ...palette.slice(1)];
  }

  return [...palette, color];
}

export default addColor;
