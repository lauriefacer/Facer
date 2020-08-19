/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let document = null;
if (typeof global.document !== 'undefined') {
  document = global.document;
}

export default function getSelectionEnd(el) {
  if (el.createTextRange && !global.getSelection) {
    const range = document.selection.createRange().duplicate();
    range.moveStart('character', -el.value.length);
    return range.text.length;
  } else {
    return el.selectionEnd;
  }
}
