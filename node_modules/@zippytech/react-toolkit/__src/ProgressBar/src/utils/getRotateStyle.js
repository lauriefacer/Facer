/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function getRotateStyle(rotateLabel) {
  let rotateValue;

  if (rotateLabel === true) {
    rotateValue = '90deg';
  } else if (rotateLabel === false) {
    rotateValue = false;
  } else {
    rotateValue = `${rotateLabel}deg`;
  }

  const rotateStyle = rotateValue
    ? { transform: `rotate(${rotateValue})` }
    : {};

  return rotateStyle;
}

export default getRotateStyle;
