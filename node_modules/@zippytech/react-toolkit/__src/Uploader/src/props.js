/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';

import clientUniqueFileId from './utils/client-unique-file-id';
import acceptsFile from './utils/accepts-file';
import flagDirectories from './utils/dropzone/flag-directories';

const hocDefaultProps = {
  fileMaxSize: Infinity,
  fileMaxCount: Infinity,
  fileMinSize: 0,
  generateUniqueFileIdentifier: clientUniqueFileId,
  accept: () => true,
  acceptDuplicates: false,
  appendOnDrop: true,
  multiple: true,
  acceptInvalid: false,
  acceptsFile,

  isFileValid: false,
  disabled: false,

  fileSizeFormatter: number => number,
  flagDirectories
};

const hocPropTypes = {
  shouldComponentUpdate: PropTypes.func,
  children: PropTypes.any,

  accept: PropTypes.oneOfType([
    PropTypes.func, // accept function will receive the file, and return true to accept it
    PropTypes.string, // accept string or array of string will be used to accept files
    PropTypes.arrayOf(PropTypes.string)
  ]),

  acceptInvalid: PropTypes.bool, //if true, will call onChange with invalid files as well, makred with valid:false
  appendOnDrop: PropTypes.bool, //indicates if new items are appended or replace old ones
  multiple: PropTypes.bool, //if multiple file drag and drop is supported

  // drag interation callbacks
  onDragEnter: PropTypes.func,
  onDragLeave: PropTypes.func,
  onChange: PropTypes.func,

  onRemoveAt: PropTypes.func,

  files: PropTypes.array, // controlled mode of the component with this array of files
  defaultFiles: PropTypes.array, // what the uncontrolled, initial internal state should
  // hold and expose as files[] in the wrapped component,

  acceptsFile: PropTypes.func, //only used for testing accepted utility function
  generateUniqueFileIdentifier: PropTypes.func,

  fileMaxSize: PropTypes.number,
  fileMinSize: PropTypes.number,
  fileMaxCount: PropTypes.number,

  isFileValid: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  // has last say in file validaiton. If it returns false,
  // file will be marked as invalid, if it returns true,
  // file will be marked as valid.

  acceptDuplicates: PropTypes.bool, // defaults to false. If false, will mark as invalid
  // files which are duplicates based on their unique generated
  // client file id.

  disabled: PropTypes.bool,

  fileSizeFormatter: PropTypes.func,
  timeFormatter: PropTypes.func,
  locale: PropTypes.string,
  i18n: PropTypes.object,

  flagDirectories: PropTypes.func
};

const fdzPropTypes = {
  emptyClass: PropTypes.string,
  emptyStyle: PropTypes.object,
  emptyText: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),

  invalidClass: PropTypes.string,
  invalidStyle: PropTypes.object,
  invalidText: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
    PropTypes.string
  ]),

  overClass: PropTypes.string,
  overStyle: PropTypes.object,
  overText: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),

  theme: PropTypes.string,

  noEvents: PropTypes.bool,

  fileList: PropTypes.func,
  uploadProgress: PropTypes.object
};

const fdzDefaultProps = {
  emptyClass: '',
  emptyStyle: {},
  emptyText: null,

  invalidClass: '',
  invalidStyle: {},
  invalidText: null,

  overClass: '',
  overStyle: {},
  overText: null,

  noEvents: false,

  theme: 'default',
  uploadProgress: {}
};

export { hocDefaultProps, fdzDefaultProps, hocPropTypes, fdzPropTypes };
