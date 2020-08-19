/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default function splitFileInNameAndType(name) {
  name = name || '';
  const indexOfDot = name.lastIndexOf('.');
  const fileName = name.substring(0, indexOfDot);
  const fileExtention = name.substring(indexOfDot);
  return { fileName, fileExtention };
}
