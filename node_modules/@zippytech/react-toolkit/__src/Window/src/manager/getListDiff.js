/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Return a list of id that have changed place in the list
 * compares first list one by one with the other list
 * and what is not in the second has changed.
 * @param {Array} list
 * @param {Array} previousList
 * @return {Array} changedList
 */
function getListDiff(next, previous) {
  return next.reduce((acc, item, index) => {
    if (item !== previous[index]) {
      acc.push(item);
    }

    return acc;
  }, []);
}

export default getListDiff;
