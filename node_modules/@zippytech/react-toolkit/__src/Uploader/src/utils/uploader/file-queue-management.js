/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ================================================
// Sequenced file uploading functions
// ================================================

// returns files that were marked as queued for upload.
const getQueuedFiles = (files, uploadProgress) => {
  const filteredFiles = files.filter(file => {
    const progress = uploadProgress[file.id] || {};
    return progress.queued;
  });
  return filteredFiles;
};

const getErroredFiles = (files, uploadProgress) => {
  const filteredFiles = files.filter(file => {
    const progress = uploadProgress[file.id] || {};
    return progress.error;
  });
  return filteredFiles;
};

const getInProgressFiles = (files, uploadProgress) => {
  const filteredFiles = files.filter(file => {
    const progress = uploadProgress[file.id] || {};
    return progress.inProgress;
  });
  return filteredFiles;
};

// marks all given files as 'queued' by setting the appropriate uplaodPgress
// entry for each file.
const queueFilesForUpload = (files, beforeFileUpload, uploadProgress = {}) => {
  files.forEach((file, idx) => {
    const { id, size, valid } = file;
    let nextUploadProgressForFile;
    if (uploadProgress[id] && uploadProgress[id].size) {
      nextUploadProgressForFile = uploadProgress[id];
    } else {
      nextUploadProgressForFile = {
        queued: true,
        totalSize: size,
        uploadedSize: 0
      };
    }
    if (valid) {
      const okToUpload = beforeFileUpload
        ? beforeFileUpload({
            file,
            fileIndex: idx,
            uploadProgress: nextUploadProgressForFile
          })
        : true;
      if (okToUpload) {
        uploadProgress[id] = nextUploadProgressForFile;
      }
    }
  });
  return uploadProgress;
};

const getFileInProgressCount = uploadProgress => {
  let count = 0;
  Object.keys(uploadProgress).forEach(key => {
    const { inProgress } = uploadProgress[key] || {};
    if (inProgress) {
      count++;
    }
  });
  return count;
};

const getNextSetOfQueuedFiles = (
  files,
  uploadProgress,
  simultaneousUploads
) => {
  const filesInProgressCount = getFileInProgressCount(uploadProgress);

  if (filesInProgressCount >= simultaneousUploads) {
    return [];
  }
  const queuedFiles = getQueuedFiles(files, uploadProgress);
  return queuedFiles.slice(0, simultaneousUploads - filesInProgressCount);
};

// initialises a uploadProgress entry based on given file
// used to populate upload progress state in uploader
const getStartProgressForFile = file => {
  return {
    inProgress: true,
    totalSize: file.size,
    uploadedSize: 0,
    startTime: Date.now()
  };
};

// removes any uploadProgress key not found in the files array.
const cleanUploadProgressOfOldFiles = (files, uploadProgress) => {
  const newUploadProgress = {};
  Object.keys(uploadProgress).forEach(key => {
    if (files.findIndex(file => file.id === key) >= 0) {
      newUploadProgress[key] = uploadProgress[key] || {};
    }
  });
  return newUploadProgress;
};

const hasFilesInUploadOrQueued = (files, uploadProgress) => {
  const queuedCount = getQueuedFiles(files, uploadProgress).length;
  const inProgressCount = getInProgressFiles(files, uploadProgress).length;
  return queuedCount || inProgressCount;
};

// ================================================
// END Sequenced file uploading functions
// ================================================

export {
  cleanUploadProgressOfOldFiles,
  getStartProgressForFile,
  getNextSetOfQueuedFiles,
  getFileInProgressCount,
  queueFilesForUpload,
  getQueuedFiles,
  getInProgressFiles,
  hasFilesInUploadOrQueued,
  getErroredFiles
};
