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

/**
 * Based on a region and a set of boxes (notifications).
 * Determines their position based on a stacking from
 * top to bottom and left to right.
 *
 * There are two cases horizontal and vertical dominant.
 * Using these two cases the positions can be translated to
 * any other direction.

   Case 1.
   Vertical dominant.

   Boxes go from top to bottom and then to left to right.

   +----------------------------------------->
   | +-----+ +------+
   | |     | |      |
   | +-----+ +------+
   | +-----+
   | |     |
   | +-----+
   | +-----+
   | |     |
   | +-----+
   |
   v Dominant

     Case 2.
     Horizontal Dominant

   Boxes go from left to right then down.

                Dominant
   +----------------------------------------->
   | +-----+ +------+ +-----+ +-----+ +-----+
   | |     | |      | |     | |     | |     |
   | +-----+ +------+ +-----+ +-----+ +-----+
   | +-----+
   | |     |
   | +-----+
   |
   |
   |
   |
   v
*/

function getEmptyColumn(overwrites = null) {
  let newColumn = {
    columnBoundry: 0,
    left: 0,
    top: 0,
    height: 0,
    positions: [],
    width: 0
  };

  if (overwrites) {
    newColumn = {
      ...newColumn,
      ...overwrites
    };
  }

  return newColumn;
}

function getWrapPositions({ boxes, isVertical, height, width }) {
  let positions;

  positions = boxes.reduce(
    (acc, box) => {
      let currentColumn = acc[acc.length - 1];

      // check if there is enough room
      const isColumnFull = isVertical
        ? box.height + currentColumn.height > height
        : box.width + currentColumn.width > width;

      if (isColumnFull) {
        // begin a new column
        let newColumn;
        if (isVertical) {
          newColumn = getEmptyColumn({
            left: currentColumn.width + currentColumn.left
          });
        } else {
          newColumn = getEmptyColumn({
            top: currentColumn.height + currentColumn.top
          });
        }

        acc.push(newColumn);
        currentColumn = newColumn;
      }

      let position;
      if (isVertical) {
        position = {
          top: currentColumn.height,
          left: currentColumn.left
        };
      } else {
        position = {
          top: currentColumn.top,
          left: currentColumn.width
        };
      }

      // const newBox = assign({}, box, position)
      currentColumn.positions.push({
        ...box,
        ...position
      }); // push new box

      if (isVertical) {
        currentColumn.height = box.height + currentColumn.height; // increment box height
      } else {
        currentColumn.width = box.width + currentColumn.width; // increment box width
      }

      // biggerst box gives the width of the column, this will be the basis for the
      // next column left
      if (isVertical) {
        if (box.width > currentColumn.width) {
          currentColumn.width = box.width;
        }
      } else if (box.height > currentColumn.height) {
        currentColumn.height = box.height;
      }
      return acc;
    },
    [getEmptyColumn()]
  );

  // normalize to an array of positioned boxes
  positions = positions.reduce((acc, column) => {
    acc = acc.concat(column.positions);
    return acc;
  }, []);

  return positions;
}

/**
 * Creates a single column, simplified algoritm
 */
function getNoWrapPositions({ boxes, isVertical }) {
  return boxes.reduce((acc, box, index, list) => {
    let position;
    if (isVertical) {
      const top = index !== 0 ? acc[index - 1].top + list[index - 1].height : 0;
      position = {
        top,
        left: 0
      };
    } else {
      const left =
        index !== 0 ? acc[index - 1].left + list[index - 1].width : 0;
      position = {
        left,
        top: 0
      };
    }
    acc.push({
      ...box,
      ...position
    });
    return acc;
  }, []);
}

/*
 * @param {
 *  boxes: { width: number, height: number }[],
 *  width: number,
 *  height: number,
 *  stacking: string['vertical'|'horizontal']
 * }
*/
function getPositionsRelativeToTopLeft({
  boxes = [],
  width,
  height,
  isVertical, // vertical, horizontal
  stackingWrap = true
}) {
  let positions;

  // just stacks on first direction
  if (!stackingWrap) {
    positions = getNoWrapPositions({ boxes, isVertical });
  } else {
    // stacking in two directions
    positions = getWrapPositions({ boxes, isVertical, height, width });
  }

  return positions;
}

export default getPositionsRelativeToTopLeft;
