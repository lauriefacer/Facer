/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Cretes a new list where id will be send to the back
 * @param  {String|Int} id
 * @param  {Array} list
 * @return {Array}
 */
function bringToFront(id, list) {
  if (list.length === 1) {
    return list;
  }
  let newList = list.filter(item => item !== id);
  newList = [...newList, id];

  return newList;
}

export default bringToFront;
