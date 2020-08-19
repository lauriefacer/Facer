/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default function fileReadAsDataURL(file) {
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();

      reader.addEventListener('load', () => {
        resolve(reader.result);
      });

      reader.readAsDataURL(file);
    });
  }

  return Promise.resolve();
}
