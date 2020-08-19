/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from 'object-assign';

/**
 * Searches a string for searchValue
 * The string is split into an array,
 * where the matched words are inside an object {match: 'matchedSubstrig'}
 * @return {[type]} [description]
 */
function constructMatchText(text, regex, searchValue) {
  const searchValueLength = searchValue.length;
  let matchText = [];
  let localMatch;
  let previousLocalMatch;
  let wordIndex = 0;

  // while you find a word
  while ((localMatch = regex.exec(text)) !== null) {
    const index = localMatch.index;
    const previousSegmentIndex = previousLocalMatch
      ? previousLocalMatch.index + searchValueLength
      : 0;

    // text before match
    if (previousSegmentIndex !== index) {
      matchText.push(text.slice(previousSegmentIndex, index));
    }
    matchText.push({
      match: text.slice(localMatch.index, localMatch.index + searchValueLength)
    });

    previousLocalMatch = localMatch;
    wordIndex += 1;
  }

  // at the end we apend the rest of the string
  if (
    previousLocalMatch &&
    previousLocalMatch.index + searchValueLength !== text.length
  ) {
    matchText.push(text.slice(previousLocalMatch.index + searchValueLength));
  }

  return matchText;
}

export default constructMatchText;
