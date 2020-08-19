/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { uploadBlob } from './blob-file-uploader';

const getNumberOfChunksForSize = (size, chunkSize) => {
  const numberOfChunkcs = size / chunkSize;
  let roundedNumberOfChunks = Math.round(numberOfChunkcs);
  if (roundedNumberOfChunks < numberOfChunkcs) {
    roundedNumberOfChunks = roundedNumberOfChunks + 1;
  }

  return roundedNumberOfChunks;
};

// returns an array of offsets for chunkcs, based on chunkSize and chunkCount
// for exmaple, if chunkcSize is 2B, and chunkCount is 5, will return
// [[0,2], [2,4], [4,6], [6,8], [8,10]]
const generateChunkOffsets = (fileSize, chunkSize, chunkCount) => {
  let count = 0,
    endOffset;
  const chunkedOffset = [];
  while (count < chunkCount) {
    endOffset = chunkSize * (count + 1);
    if (endOffset > fileSize) {
      endOffset = fileSize;
    }
    chunkedOffset.push([chunkSize * count, endOffset]);
    count++;
  }
  return chunkedOffset;
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
const uploadChunkedBlob = (file, params) => {
  if (!file) {
    return;
  }

  const {
    headers,
    targetUrl,
    xhr,
    chunkSize,
    simultaneousChunksPerFile,
    onBeforeStart,
    onStart,
    onProgress,
    onDone,
    onError,
    onAbort
  } = params;

  const { id, name, size } = file;
  const numberOfChunkcs = getNumberOfChunksForSize(size, chunkSize);

  const chunkedOffsets = generateChunkOffsets(size, chunkSize, numberOfChunkcs);

  const wrappedBloblsArray = wrapChunksWithProgressData(chunkedOffsets, {
    // TODO blob callbacks don't have to be on blob Wrappers, they can be on
    // upper level object
    onBlobError: (chunk, error) => {
      chunk.status = 'error';
      chunk.error = error;
      onError(id, error);
    },

    onBlobDone: (chunk, xhrParams) => {
      chunk.status = 'done';
      onProgress(id, wrappedBloblsArray);
    },

    onBlobAbort: (chunk, xhrParams) => {
      chunk.status = 'aborted';
      onAbort(id, wrappedBloblsArray);
    },

    onBlobProgress: (chunk, xhrParams) => {
      chunk.progress = xhrParams;
      onProgress(id, wrappedBloblsArray);
    },

    fileId: id
  });

  // before upload hook
  const resultOfBeforeStart = onBeforeStart
    ? onBeforeStart({
        file,
        numberOfChunkcs,
        chunkedOffsets,
        chunkWrappers: wrappedBloblsArray
      })
    : true;

  if (!resultOfBeforeStart) {
    return;
  }

  // start upload hook
  onStart &&
    onStart({
      file,
      numberOfChunkcs,
      chunkedOffsets,
      chunkWrappers: wrappedBloblsArray
    });

  const requestHeaders = {
    ...headers,
    FileName: name,
    NumberOfChunkcs: numberOfChunkcs,
    Chunked: true
  };

  return uploadAllChunkcsInSequence(
    file,
    simultaneousChunksPerFile,
    wrappedBloblsArray,
    { ...params, headers: requestHeaders },
    () => {
      onDone(id, wrappedBloblsArray);
    }
  );
};

const initialiseFileSliceForChunk = (file, chunkWrapper) => {
  if (!chunkWrapper.chunk) {
    const { chunkOffsets: [startOffset, endOffset] } = chunkWrapper;
    chunkWrapper.chunk = file.slice(startOffset, endOffset);
    chunkWrapper.chunk.id = chunkWrapper.chunkId;
  }
  return chunkWrapper;
};

const getNextAvailableChunks = (file, simultaneousChunksPerFile, chunks) => {
  const chunksInProgressCount = countInProgressChunks(chunks);
  if (chunksInProgressCount >= simultaneousChunksPerFile) {
    return null;
  }

  const queuedChunks = chunks.filter(
    chunkWrapper => chunkWrapper.status === 'queued'
  );
  if (!queuedChunks.length) {
    return null;
  }

  return queuedChunks
    .slice(0, simultaneousChunksPerFile - chunksInProgressCount)
    .map(chunkWrapper => initialiseFileSliceForChunk(file, chunkWrapper));
};

const wrapChunksWithProgressData = (chunks, progressData) => {
  const { fileId } = progressData;
  return chunks.map((chunkOffsets, idx) => {
    return {
      ...progressData,
      chunkId: `${fileId}-chunk-${idx}`,
      chunkOffsets,
      idx,
      status: 'queued'
    };
  });
};

const getChunkUploadParams = (chunkSpecificParams, uploaderSpecificParams) => {
  return {
    ...uploaderSpecificParams,
    ...chunkSpecificParams
  };
};

const countRemaningQueuedChunks = chunkWrappers => {
  return chunkWrappers.filter(chunkWrapper => chunkWrapper.status === 'queued')
    .length;
};

const countAbortedChunks = chunkWrappers => {
  return chunkWrappers.filter(chunkWrapper => chunkWrapper.status === 'aborted')
    .length;
};

const countInProgressChunks = chunkWrappers => {
  return chunkWrappers.filter(
    chunkWrapper => chunkWrapper.status === 'uploading'
  ).length;
};

const uploadValidityHolds = chunkWrappers => {
  return !countAbortedChunks(chunkWrappers);
};

const setChunksStatus = (chunkWrappers, status) => {
  if (!chunkWrappers) {
    return [];
  }
  return chunkWrappers.map(chunkWrapper => {
    chunkWrapper.status = status;
    return chunkWrapper;
  });
};

const uploadAllChunkcsInSequence = (
  file,
  simultaneousChunksPerFile,
  chunkWrappers,
  params,
  onDone
) => {
  if (countRemaningQueuedChunks(chunkWrappers) === 0) {
    onDone && onDone();
    return;
  }

  const currentChunks = setChunksStatus(
    getNextAvailableChunks(file, simultaneousChunksPerFile, chunkWrappers),
    'uploading'
  );

  if (!currentChunks.length) {
    return;
  }

  const currentChunksUploads = currentChunks.map(currentChunk => {
    return uploadBlob(
      currentChunk.chunk,

      getChunkUploadParams(
        {
          onError: (chunkId, xhrParams) => {
            currentChunk.onBlobError(currentChunk, xhrParams);
          },
          onAbort: (chunkId, xhrParams) => {
            currentChunk.onBlobAbort(currentChunk, xhrParams);
          },
          onDone: (chunkId, xhrParams) => {
            currentChunk.onBlobDone(currentChunk, xhrParams);
          },
          onProgress: (chunkId, xhrParams) => {
            currentChunk.onBlobProgress(currentChunk, xhrParams);
          },
          headers: {
            ...params.headers,
            FileClientId: currentChunk.fileId,
            ChunkID: currentChunk.chunkId,
            ChunkNumber: currentChunk.idx
          }
        },
        params
      )
    ).then(() => {
      if (uploadValidityHolds(chunkWrappers)) {
        return uploadAllChunkcsInSequence(
          file,
          simultaneousChunksPerFile,
          chunkWrappers,
          params,
          onDone
        );
      }
    });
  });

  return Promise.all(currentChunksUploads);
};

const abortAnyChunksInProgress = uplaodProgress => {
  const { chunkWrappers } = uplaodProgress;
  chunkWrappers
    .filter(chunkWrapper => chunkWrapper.status === 'uploading')
    .forEach(chunkWrapper => {
      chunkWrapper.chunk._uploadRequest.abort();
    });
};

export { uploadChunkedBlob, abortAnyChunksInProgress };
