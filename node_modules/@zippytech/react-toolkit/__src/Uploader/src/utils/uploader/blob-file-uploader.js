/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const isStatusCodeOk = ({ statusCode }) => {
  return statusCode === 200 || statusCode === 201 || statusCode === 202;
};

/**
 * uploadBlob
 *
 * Uploads a blob. Sends headers for additinal details. Does not chunk upload.
 * This is the basic file upload method used by the file uploader.
 *
 * @param file - required. The file/blob file descriptor pointing to a file
 * on the users local machine.
 *
 * @param targetUrl - required. Server endpoint where to make the post request to.
 *
 * @param xhr - xhr library/warpper implementing .post method with parameters identical
 * to https://www.npmjs.com/package/xhr.
 *
 * @param onProgress, onDone, onError, onAbort - xhr.upload lifecycle callbacks
 * will be called for progress, load, erorr and abort events with the file and
 * xhr arguments. Used by uploader to handle file upload updates in the UI, like
 * progress (eta, procentage) and error dispalying.
 *
 */
const uploadBlob = (file, params) => {
  if (!file) {
    return;
  }
  const {
    headers,
    fileId,
    targetUrl,
    xhr,
    onProgress,
    onStart,
    onDone,
    onError,
    onAbort
  } = params;

  const { id = fileId, name } = file;

  const requestHeaders = {
    FileName: name,
    FileClientId: id,
    'Content-Type': 'multipart/form-data',
    ...headers
  };

  return new Promise((resolve, reject) => {
    if (!targetUrl) {
      return reject('no targetUrl provided');
    }

    file._uploadRequest = xhr.post(
      targetUrl,
      {
        withCredentials: true,
        body: file,
        headers: requestHeaders,
        beforeSend: xhr => {
          onStart && onStart({ file });

          xhr.upload.addEventListener('progress', params =>
            onProgress(id, params)
          );

          xhr.addEventListener('error', params => {
            file._uploadRequest = false;
            onError(id, 'server request error');
          });

          xhr.addEventListener('abort', params => {
            file._uploadRequest = false;
            onAbort(id, params);
          });
        }
      },
      (error, params) => {
        file._uploadRequest = false;
        onDone(id, params);

        if (error) {
          return reject(error);
        }

        if (isStatusCodeOk(params)) {
          resolve(params);
        } else {
          onError(id, `server request error: ${params.statusCode}`);
          resolve(params);
        }
      }
    );
  });
};

export { uploadBlob };
