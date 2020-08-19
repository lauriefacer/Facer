/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const getETABasedOnSizeAndTime = (uploadedSize, totalSize, startTime) => {
  const deltaTime = Date.now() - startTime || 1;
  const deltaSize = totalSize - uploadedSize;
  const averageSpeedPerMSSecond = uploadedSize / deltaTime;
  return Math.round(deltaSize / averageSpeedPerMSSecond / 1000) * 1000;
};

/**
 * Computes ETA and total size, remaining size etc for the
 * given xhr.upload.progress param
 * @param progress - the xhr.upload.progress for a given file
 *
 * @param fileUploadProgress - the current fileUploadProgress object
 * containg infomration like startTime and current status of file. This
 * is application dependent and used by the file uploader to represent
 * internal state.
 */
const getFileUploadProgress = (xhrProgress, fileUploadProgress) => {
  if (typeof fileUploadProgress !== 'object') {
    fileUploadProgress = { startTime: Date.now() };
  }

  const uploadProgress = { ...fileUploadProgress };

  const { total, loaded } = xhrProgress;
  uploadProgress.uploadedSize = loaded;
  uploadProgress.totalSize = total;
  uploadProgress.eta = getETABasedOnSizeAndTime(
    loaded,
    total,
    uploadProgress.startTime
  );

  if (total === loaded) {
    uploadProgress.done = true;
    uploadProgress.inProgress = false;
    uploadProgress.uploadTime = Date.now() - uploadProgress.startTime;
  }

  return uploadProgress;
};

const getTotalUploadedSizeFromChunks = wrappedChunksArray => {
  // .chunk is blob of file, .progress is xhr progress set by uploader
  const totalSize = wrappedChunksArray
    .filter(chunkWrapper => chunkWrapper.chunk && chunkWrapper.progress)
    .reduce((totalSize, chunkWrapper) => {
      return totalSize + chunkWrapper.progress.loaded;
    }, 0);

  return totalSize;
};

/**
 * Computes ETA and total size, remaining size etc for the
 * given xhr.upload.progress param
 * @param progress - the xhr.upload.progress for a given file
 *
 * @param fileUploadProgress - the current fileUploadProgress object
 * containg infomration like startTime and current status of file. This
 * is application dependent and used by the file uploader to represent
 * internal state.
 */
const getChunkedFileUploadProgress = (
  wrappedChunksArray,
  fileUploadProgress
) => {
  const uploadProgress = { ...fileUploadProgress };

  const uploadedSize = getTotalUploadedSizeFromChunks(wrappedChunksArray);
  const totalSize = uploadProgress.totalSize;
  uploadProgress.uploadedSize = uploadedSize;

  uploadProgress.eta = getETABasedOnSizeAndTime(
    uploadedSize,
    totalSize,
    uploadProgress.startTime
  );

  if (uploadedSize === totalSize) {
    uploadProgress.done = true;
    uploadProgress.inProgress = false;
    uploadProgress.uploadTime = Date.now() - uploadProgress.startTime;
  }

  return uploadProgress;
};

// calculates total progress in % for given uploadProgress map.
const getFilesUplaodProgress = uploadProgress => {
  let totalSizeOfFiles = 0;
  let totalUploadedSizeOfFiles = 0;
  let firstFileStartTime = Infinity;
  Object.keys(uploadProgress).forEach(key => {
    const fileProgress = uploadProgress[key] || {};
    const {
      queued,
      done,
      inProgress,
      totalSize,
      uploadedSize,
      startTime,
      error
    } = fileProgress;

    if (queued || inProgress || done || error) {
      totalSizeOfFiles = totalSizeOfFiles + (totalSize || 0);
      totalUploadedSizeOfFiles = totalUploadedSizeOfFiles + (uploadedSize || 0);
      firstFileStartTime =
        firstFileStartTime > startTime ? startTime : firstFileStartTime;
    }
  });

  return {
    percentage:
      Math.round(totalUploadedSizeOfFiles / totalSizeOfFiles * 100) / 100 * 100,
    totalSizeOfFiles,
    totalUploadedSizeOfFiles,
    globalEta: getETABasedOnSizeAndTime(
      totalUploadedSizeOfFiles,
      totalSizeOfFiles,
      firstFileStartTime
    )
  };
};

export {
  getETABasedOnSizeAndTime,
  getFileUploadProgress,
  getFilesUplaodProgress,
  getChunkedFileUploadProgress
};
