/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function getDefaultMobileHandleConfig(titlePosition) {
  return {
    top: {
      t: { outside: true },
      tl: { outside: false },
      tr: { outside: false },
      l: { outside: false },
      bl: { outside: false },
      b: { outside: false },
      br: { outside: false },
      r: { outside: false }
    },
    left: {
      t: { outside: false },
      tl: { outside: false },
      tr: { outside: false },
      l: { outside: true },
      bl: { outside: false },
      b: { outside: false },
      br: { outside: false },
      r: { outside: false }
    },
    right: {
      t: { outside: false },
      tl: { outside: false },
      tr: { outside: false },
      l: { outside: false },
      bl: { outside: false },
      b: { outside: false },
      br: { outside: false },
      r: { outside: true }
    },
    bottom: {
      t: { outside: false },
      tl: { outside: false },
      tr: { outside: false },
      l: { outside: false },
      bl: { outside: false },
      b: { outside: true },
      br: { outside: false },
      r: { outside: false }
    }
  }[titlePosition];
}

export default getDefaultMobileHandleConfig;
