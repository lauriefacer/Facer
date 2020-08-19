/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// accepts a file based on given acceptedFiles param (which is the html 5 accept prop)
export default function acceptsFile(
  file,
  acceptedFiles,
  index,
  filesArray,
  props
) {
  if (typeof acceptedFiles === 'function') {
    return acceptedFiles(file, index, filesArray, props);
  }

  if (Array.isArray(acceptedFiles)) {
    return acceptedFiles.some(acceptFile => {
      return acceptsFile(file, acceptFile);
    });
  }

  if (file && acceptedFiles) {
    const acceptedFilesArray = acceptedFiles.split(',');
    const fileName = file.name || '';
    const mimeType = file.type || '';
    const baseMimeType = mimeType.replace(/\/.*$/, '');

    return acceptedFilesArray.some(type => {
      const currentType = type.trim();
      if (currentType.charAt(0) === '.') {
        return fileName.toLowerCase().endsWith(currentType.toLowerCase());
      } else if (/\/\*$/.test(currentType)) {
        return baseMimeType === currentType.replace(/\/.*$/, '');
      }
      return mimeType === currentType;
    });
  }
  return true;
}
