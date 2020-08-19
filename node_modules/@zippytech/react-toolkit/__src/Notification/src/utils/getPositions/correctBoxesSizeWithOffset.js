/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Adjusts the sizes of the boxes taking into account their offset.
 * @param {[type]} boxes [description]
 */
function correctBoxesSizeWithOffset(boxes) {
  return boxes.map(box => {
    if (box.offset) {
      const newBox = { ...box };

      if (box.offset.top) {
        newBox.height += box.offset.top;
      }
      if (box.offset.bottom) {
        newBox.height += box.offset.bottom;
      }
      if (box.offset.left) {
        newBox.width += box.offset.left;
      }
      if (box.offset.right) {
        newBox.width += box.offset.right;
      }

      return newBox;
    }

    return box;
  });
}

export default correctBoxesSizeWithOffset;
