/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Brings id foward (swap with item at next index)
 * @param {Number} id
 * @param {Array} list
 * @return {Array} newList
 */
function bringForwards(id, list) {
  let newList = [...list];
  const indexOfId = newList.indexOf(id);
  if (indexOfId === newList.length - 1 || indexOfId === -1) {
    return list; // nothing changed
  }

  const copy = list[indexOfId + 1];
  newList[indexOfId + 1] = id;
  newList[indexOfId] = copy;

  return newList;
}

export default bringForwards;
