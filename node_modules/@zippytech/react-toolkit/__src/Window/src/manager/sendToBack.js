/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Creates a new list where id will be send to the beginning
 * @param  {String|Int} id
 * @param  {Array} list
 * @return {Array}
 */
function sendToBack(id, list) {
  if (list.length === 1) {
    return list;
  }
  let newList = list.filter(item => item !== id);
  newList = [id, ...newList];

  return newList;
}

export default sendToBack;
