/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// generates a unique client identifier for the given file object.
// used for determining duplicates and allowing removal and progress
// updating from the external component api.
export default function clientUniqueFileId(file) {
  let pathOrName =
    file.relativePath ||
    file.webkitRelativePath ||
    file.fileName ||
    file.name ||
    '';
  return file.size + '-' + pathOrName.replace(/[^0-9a-zA-Z_-]/gim, '');
}
