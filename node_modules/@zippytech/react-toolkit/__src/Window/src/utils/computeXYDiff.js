/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * This method returns an array with 4 elements:
 *
 *      [xDiff, yDiff, handleX, handleY]
 *
 * which are the new values, resized according to the aspect ratio.
 *
 * The forceXDominate and forceYDominate flags are used when there are constraints on the size,
 * and a certain dimension is constrained. For example, when y reaches min, we pass forceYDominate,
 * and thus, x will be computed
 * in function of y, no matter what.
 *
 * @param {Number} xDiff
 * @param {Number} yDiff
 * @param {Number} handleX
 * @param {Number} handleY
 * @param {String} handleName
 * @param {number} aspectRatio The aspect ratio for the resize
 * @param {Boolean} forceXDominate
 * @param {Boolean} forceYDominate
 *
 * @return {Array}
 */
function computeXYDiff(
  xDiff,
  yDiff,
  handleX,
  handleY,
  handleName,
  aspectRatio,
  forceXDominate,
  forceYDominate
) {
  if (handleName.length == 1) {
    // not a corner handle

    if (handleY === 0 || forceXDominate) {
      // left or right handle
      yDiff = xDiff / aspectRatio;

      // handleName will be either l, so left handle, but we also call this method
      // when doing drag from a non-corner anchor, so when we drag from left,
      // we also simulate drag from top, so test both l and t
      handleY = handleName in { l: 1, t: 1 } ? -1 : 1;
    } else {
      // top or bottom
      xDiff = aspectRatio * yDiff;
      handleX = handleName in { t: 1, l: 1 } ? -1 : 1;
    }
  } else {
    /**
     *          |                           |
     *  sx = -1 ` sx = 1                    `
     *  sy = -1 | sy = -1             sx=-1 | sx = 1
     *          `                     sy=-1 ` sy =-1
     *          |[-1,-1]                    |[1,-1]
     *  - - - - -___________________________- - - - -
     * sx = -1  |sx = 1              sx=-1  | sx = 1
     * sy = 1   |sy = 1   x>Ry       sy=-1  | sy = 1
     *          |       `                   |
     *          | x<r*y    `                |
     *          |            `              |
     *          |               `           |
     *  sx=-1   |                  ` sx=-1  |  sx = 1
     *  sy=-1   |                    sy=-1  |  sy = -1
     *  _ _ _ _ |___________________________|_ _ _ _ _
     *          |                           |  [1,1]
     *  sx=-1   |[-1,1]                     |
     *  sy=1    ` sx=1               sx=-1  `  sx = 1
     *          | sy=1               sy= 1  |  sy = 1
     *          `                           `
     *          |                           |
     */

    /**                                        The semiplane above this line has the formula x + ry < 0
     *          |                            |
     *          `                            `          .
     * `  x >R*y|                            |       .         The semiplane below this line has the formula x + ry > 0
     *    `     `                            `    .
     *       `  |   x >R*y                   |  .
     *  - - - - -_____________________________- - - - -
     *          | `  x >R*y               .  |
     *  x <=R*y |    `                 .     |
     *          |      `            .        |
     *          |          `     .           |
     *          |            . `             |
     *          |         .       `          |
     *          |      .             `       |
     *          |   .                   `    |
     *  _ _ _ _ |.___________________________|_ _ _ _ _
     *          |`                           |`
     *          |                            |    `         x>Ry
     *    .     `                            `       `              The semi plane above by the ` line has the formula x - ry > 0,
     * .        |                            | x<Ry      `                  below the line has x - ry < 0
     *          `                            `              `
     *          |                            |
     */

    /**
     *
     *                         x + Ry < 0    d:x + Ry = 0          SECOND AXIS
     * `                                    .
     *    `                              .      x+Ry > 0
     *       `                        .
     *          `                   .
     *             `             .
     *                `       .
     *                   ` .
     *                   .   `
     *                 .        `
     *               .             `
     *             .                  `        x-Ry > 0
     *           .           x-Ry < 0    `
     *         .                          d:x - Ry = 0   FIRST AXIS
     */
    if (handleX == handleY) {
      //FIRST AXIS

      //top left
      if (handleX < 0) {
        if (
          forceYDominate !== true &&
          (forceXDominate || xDiff - aspectRatio * yDiff < 0)
        ) {
          //x dominates
          yDiff = xDiff / aspectRatio;
        } else {
          //y dominates
          xDiff = yDiff * aspectRatio;
        }
      } else {
        //bottom right
        if (
          forceXDominate !== true &&
          (forceYDominate || xDiff - aspectRatio * yDiff < 0)
        ) {
          // y dominates
          xDiff = aspectRatio * yDiff;
        } else {
          // x dominates
          yDiff = xDiff / aspectRatio;
        }
      }
    } else {
      // SECOND AXIS
      if (handleX < 0) {
        // bottom left
        if (
          forceYDominate !== true &&
          (forceXDominate || xDiff + aspectRatio * yDiff < 0)
        ) {
          //x dominates
          yDiff = -xDiff / aspectRatio;
        } else {
          //y dominates
          xDiff = -yDiff * aspectRatio;
        }
      } else {
        //top right
        if (
          forceXDominate !== true &&
          (forceYDominate || xDiff + aspectRatio * yDiff < 0)
        ) {
          // y dominates
          xDiff = -yDiff * aspectRatio;
        } else {
          //x dominates
          yDiff = -xDiff / aspectRatio;
        }
      }
    }
  }

  return [xDiff, yDiff, handleX, handleY];
}

export default computeXYDiff;
