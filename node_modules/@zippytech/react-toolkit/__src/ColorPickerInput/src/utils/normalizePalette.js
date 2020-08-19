/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function rangeFill(length, fill = '#f4f4f4') {
  return Array.apply(null, Array(length)).map(() => fill);
}

/**
 * Returns a palette with empty spaces filled with lightgray
 * @param  {Number} length
 * @param  {String[]} palette
 * @return {String[]}
 */
function getPalette({ length, palette }) {
  // check to see if palette is falsey
  // or it has length 0
  if (!palette || (palette && palette.length === 0)) {
    return rangeFill(length);
  }

  if (length >= palette && palette.length) {
    return palette;
  }

  const emptyColorLength = length - palette.length;
  return [...palette, ...rangeFill(emptyColorLength)];
}

export default getPalette;
