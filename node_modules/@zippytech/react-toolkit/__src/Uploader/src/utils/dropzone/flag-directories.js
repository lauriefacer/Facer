/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 *
 * Checking if file is a directroy
 * - check if type does not exists
 * - check if size is multiple of 4096
 * - try to read as text the file
 * - if checks are true and read fails, then file is a directory
 * - references:
 *    - http://stackoverflow.com/questions/25016442/how-to-distinguish-if-a-file-or-folder-is-being-dragged-prior-to-it-being-droppe
 *    - http://stackoverflow.com/questions/8856628/detecting-folders-directories-in-javascript-filelist-objects
 *
 */

export default function flagDirectories(files) {
  return Promise.all(files.map(asyncCheckDirectory));
}

// async check if file is directory via type, multiple of 4096 and read try
// return true if file is directory, false if not
const asyncCheckDirectory = fileDescriptor => {
  return new Promise(resolve => {
    const loadListener = () => {
      fileDescriptor.isDirectory = false;
      resolve(false);
    };

    var reader = new FileReader();

    reader.addEventListener('progress', () => {
      reader.removeEventListener('load', loadListener);
      reader.abort();
      fileDescriptor.isDirectory = false;
      resolve(false);
    });

    reader.addEventListener('load', loadListener);

    reader.addEventListener('error', payload => {
      //this is fixing a safari bug, which would now allow certain files to
      //be uploaded, because of an error
      if (
        payload.currentTarget &&
        payload.currentTarget.error &&
        payload.currentTarget.error.code == 3
      ) {
        fileDescriptor.isDirectory = false;
      } else {
        fileDescriptor.isDirectory = true;
      }
      resolve(true);
    });

    try {
      reader.readAsText(fileDescriptor);
    } catch (ex) {
      resolve(false);
    }
  });
};
