/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const convertProcentageRangeToPositionStyles = (range, horizontal) => {
  let [start, end] = range;

  const positionStartCSSValue = `${start * 100}%`;
  const dimmensionCSSValue = `${(end - start) * 100}%`;

  if (horizontal) {
    return {
      left: positionStartCSSValue,
      width: dimmensionCSSValue
    };
  }

  return {
    top: positionStartCSSValue,
    height: dimmensionCSSValue
  };
};

export { convertProcentageRangeToPositionStyles };
