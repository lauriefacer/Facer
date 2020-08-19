/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// given an array of files, assigns id to all of them based on
// uuid function provided
export default function assignFileUniqueIds(files, uuidFunction, config = {}) {
  const key = config.key || 'id';

  files.forEach((file, index) => {
    file[key] = uuidFunction(file, index, files, config);
  });

  return files;
}
