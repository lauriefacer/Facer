/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * deprecated
 */
function getLabelWrapperSize(size) {
  // wrapper must be as big as the entire progressbar
  // so we have two color label depending on the progress
  // for 50, we must add 200
  // for 100 do nothing .. so it is inversely  proportional
  // for 0 is 100
  // size = k/n
  // k = constant of proportionality
  // 200 = k/50 => k = 10000
  return 10000 / size;
}

export default getLabelWrapperSize;
