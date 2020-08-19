/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default function removeFromArray(arr, el) {
  const idx = arr.indexOf(el);
  if (idx === -1) {
    return arr;
  }
  return [...arr.slice(0, idx), ...arr.slice(idx + 1)];
}
