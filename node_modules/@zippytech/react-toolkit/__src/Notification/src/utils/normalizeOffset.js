/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const normalizeRegionOffset = offset => {
  if (typeof offset === 'number') {
    return {
      top: offset,
      left: offset,
      right: offset,
      bottom: offset
    };
  }

  return offset;
};

export default normalizeRegionOffset;
