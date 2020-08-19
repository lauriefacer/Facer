/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from 'object-assign';

/**
 * values fro x and y represent direction
 * or how grad difference is added or substracted
 * for a particular handl
 */
var HANDLE_COORDINATES = (function() {
  return {
    t: {
      x: 0,
      y: -1
    },
    tl: {
      x: -1,
      y: -1
    },
    tr: {
      x: 1,
      y: -1
    },
    l: {
      x: -1,
      y: 0
    },
    bl: {
      x: -1,
      y: 1
    },
    b: {
      x: 0,
      y: 1
    },
    br: {
      x: 1,
      y: 1
    },
    r: {
      x: 1,
      y: 0
    }
  };
})();

function GET_HANDLE_STYLES(config) {
  let width = 5;
  if (config && config.width) {
    width = config.width;
  }

  let outside = false;
  if (config && config.outside) {
    outside = config.outside;
  }

  const halfWidth = width / 2;

  return {
    t: {
      top: !(config.t && config.t.outside !== undefined
        ? config.t.outside
        : outside)
        ? -halfWidth
        : HANDLE_COORDINATES.t.y * width,
      left: !(config.t && config.t.outside !== undefined
        ? config.t.outside
        : outside)
        ? halfWidth
        : HANDLE_COORDINATES.t.x * width,
      right: !(config.t && config.t.outside !== undefined
        ? config.t.outside
        : outside)
        ? halfWidth
        : 0,
      height: width,
      cursor: 'n-resize'
    },
    tl: {
      top: !(config.t && config.tl.outside !== undefined
        ? config.tl.outside
        : outside)
        ? -halfWidth
        : HANDLE_COORDINATES.tl.y * width,
      left: !(config.t && config.tl.outside !== undefined
        ? config.tl.outside
        : outside)
        ? -halfWidth
        : HANDLE_COORDINATES.tl.x * width,
      width: width,
      height: width,
      cursor: 'nw-resize'
    },
    tr: {
      top: !(config.t && config.tr.outside !== undefined
        ? config.tr.outside
        : outside)
        ? -halfWidth
        : HANDLE_COORDINATES.tr.y * width,
      right: !(config.t && config.tr.outside !== undefined
        ? config.tr.outside
        : outside)
        ? -halfWidth
        : -HANDLE_COORDINATES.tr.x * width,
      width: width,
      height: width,
      cursor: 'ne-resize'
    },
    l: {
      top: !(config.l && config.l.outside !== undefined
        ? config.l.outside
        : outside)
        ? halfWidth
        : HANDLE_COORDINATES.l.y * width,
      left: !(config.l && config.l.outside !== undefined
        ? config.l.outside
        : outside)
        ? -halfWidth
        : HANDLE_COORDINATES.l.x * width,
      bottom: !(config.l && config.l.outside !== undefined
        ? config.l.outside
        : outside)
        ? halfWidth
        : 0,
      width: width,
      cursor: 'w-resize'
    },
    bl: {
      bottom: !(config.b && config.bl.outside !== undefined
        ? config.bl.outside
        : outside)
        ? -halfWidth
        : -HANDLE_COORDINATES.bl.y * width,
      left: !(config.b && config.bl.outside !== undefined
        ? config.bl.outside
        : outside)
        ? -halfWidth
        : HANDLE_COORDINATES.bl.x * width,
      width: width,
      height: width,
      cursor: 'sw-resize'
    },
    b: {
      bottom: !(config.b && config.b.outside !== undefined
        ? config.b.outside
        : outside)
        ? -halfWidth
        : -HANDLE_COORDINATES.b.y * width,
      left: !(config.b && config.b.outside !== undefined
        ? config.b.outside
        : outside)
        ? halfWidth
        : -HANDLE_COORDINATES.b.x * width,
      height: width,
      right: !(config.b && config.b.outside !== undefined
        ? config.b.outside
        : outside)
        ? halfWidth
        : 0,
      cursor: 's-resize'
    },
    br: {
      bottom: !(config.b && config.br.outside !== undefined
        ? config.br.outside
        : outside)
        ? -halfWidth
        : -HANDLE_COORDINATES.br.y * width,
      right: !(config.b && config.br.outside !== undefined
        ? config.br.outside
        : outside)
        ? -halfWidth
        : -HANDLE_COORDINATES.br.x * width,
      width: width,
      height: width,
      cursor: 'se-resize'
    },
    r: {
      top: !(config.r && config.r.outside !== undefined
        ? config.r.outside
        : outside)
        ? halfWidth
        : -HANDLE_COORDINATES.r.y * width,
      right: !(config.r && config.r.outside !== undefined
        ? config.r.outside
        : outside)
        ? -halfWidth
        : -HANDLE_COORDINATES.r.x * width,
      bottom: !(config.r && config.r.outside !== undefined
        ? config.r.outside
        : outside)
        ? halfWidth
        : 0,
      width: width,
      cursor: 'e-resize'
    }
  };
}

const defaultHandleStyle = {
  position: 'absolute',
  boxSizing: 'border-box',
  userSelect: 'none',
  display: 'block',
  zIndex: 10
};

function getHandles(config) {
  const handleStyles = GET_HANDLE_STYLES(config);
  let result = {};

  Object.keys(HANDLE_COORDINATES).forEach(function(handleName) {
    var handle = assign({}, HANDLE_COORDINATES[handleName]);

    handle.style = assign(
      {},
      defaultHandleStyle,
      config.handleStyle,
      handleStyles[handleName]
    );

    result[handleName] = handle;
  });

  return result;
}

export default getHandles;
