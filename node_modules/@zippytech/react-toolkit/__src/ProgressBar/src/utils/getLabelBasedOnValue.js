/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isInt from './isInt';
import getFloatingDigitsNumber from './getFloatingDigitsNumber';

function getLabelBasedOnValue({ size, finalSize, value }) {
  let label;

  if (size != null && size !== finalSize) {
    if (isInt(value)) {
      label = Math.round(
        size / (finalSize || 0.1) * (parseFloat(value) || 0.1)
      );
    } else {
      let newValue = size / finalSize * value;
      const floatingDigitsNumber = getFloatingDigitsNumber(value);

      newValue = newValue.toFixed(floatingDigitsNumber);
      label = newValue;
    }
  } else {
    label = value;
  }

  return isNaN(label) ? null : label;
}

export default getLabelBasedOnValue;
