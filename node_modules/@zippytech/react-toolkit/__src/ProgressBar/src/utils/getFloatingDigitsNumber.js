/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function getFloatingDigitsNumber(number) {
  const parts = number.toString().split('.');

  if (parts.length === 1) {
    return 0;
  } else {
    return parts[1].length;
  }
}

export default getFloatingDigitsNumber;
