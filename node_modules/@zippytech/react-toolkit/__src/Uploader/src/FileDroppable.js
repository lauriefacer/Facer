/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import autoBind from '@zippytech/react-class/autoBind';
import cleanProps from '../../common/cleanProps';

import join from '../../common/join';
import shouldComponentUpdate from '../../common/shouldComponentUpdate';

import assignUniqueFileIds from './utils/assign-unique-file-ids';

import { hocDefaultProps, hocPropTypes } from './props';

const setInvalidityReasson = (file, reasonKey, reasonMessage) => {
  if (!file.invalidDetails) {
    file.invalidDetails = [];
  }

  file.invalidDetails.push({
    reason: reasonKey,
    message: reasonMessage
  });
};

const markInvalidIfOverMaxCount = (files, fileMaxCount) => {
  if (files.length > fileMaxCount) {
    files.slice(fileMaxCount).forEach((file, index) => {
      file.valid = false;
      setInvalidityReasson(
        file,
        '‘fileMaxCount’',
        `File ${
          file.name
        } could not be added because the list is full (fileMaxCount=${fileMaxCount})`
      );
    });
  }

  return files;
};

const markDuplicateFilesById = files => {
  const fileMap = {};
  files.forEach(file => {
    const { id } = file;
    if (file.valid && fileMap[id]) {
      file.valid = false;
      setInvalidityReasson(
        file,
        'fileDuplicate',
        `A file that looks just like ${file.name} already exists`
      );
    } else {
      fileMap[id] = true;
    }
  });
  return files;
};

const assignUserDecidedInvalidFlags = (file, userDecidedValidity) => {
  if (Array.isArray(userDecidedValidity)) {
    userDecidedValidity.forEach(reassonEntity => {
      assignUserDecidedInvalidFlags(file, reassonEntity);
    });
  } else {
    const typeofUserDecidedValidity = typeof userDecidedValidity;
    if (typeofUserDecidedValidity === 'string') {
      setInvalidityReasson(file, 'userValidity', userDecidedValidity);
    } else if (typeofUserDecidedValidity === 'object') {
      setInvalidityReasson(
        file,
        userDecidedValidity.reasson,
        userDecidedValidity.message
      );
    }
  }
};

const getFileMaxCount = ({ fileMaxCount, multiple }) => {
  if (!multiple) {
    return 1;
  }

  return fileMaxCount;
};

const hookUserValidation = (files, isFileValid) => {
  isFileValid &&
    files.forEach((file, index) => {
      const userDecidedValidity = isFileValid({
        file,
        valid: file.valid,
        files,
        index
      });
      if (userDecidedValidity === true) {
        file.valid = true;
        delete file.invalidDetails;
      } else {
        file.valid = false;
        assignUserDecidedInvalidFlags(file, userDecidedValidity);
      }
    });
  return files;
};

const isReallyDragLeave = (event, node) => {
  const rect = node.getBoundingClientRect();
  const nativeEvent = event.nativeEvent;
  const { x, y } = nativeEvent;

  return (
    x >= rect.left + rect.width ||
    x <= rect.left ||
    y >= rect.top + rect.height ||
    y <= rect.top
  );
};

function FileDroppable(ComponentClass, config = {}) {
  const supportMultiple =
    typeof document !== 'undefined' && document && document.createElement
      ? 'multiple' in document.createElement('input')
      : true;

  class FileDroppable extends Component {
    constructor(props, context) {
      super(props, context);
      autoBind(this);
      this.state = {
        isOver: false
      };

      const { files, defaultFiles } = props;
      let initialFilesLength = (files || defaultFiles || []).length;

      if (!this.isControlled(props)) {
        this.state.currentFiles = this.getCurrentFiles(props);
        initialFilesLength = this.state.currentFiles.length;
      }

      this.state.isEmpty = initialFilesLength === 0;
    }

    shouldComponentUpdate(nextProps, nextState) {
      return shouldComponentUpdate(this, nextProps, nextState);
    }

    // -----------------------------------------------------------------------------
    // begin interaction handlers
    // -----------------------------------------------------------------------------

    _stopEvent(event) {
      event.preventDefault && event.preventDefault();
      event.stopPropagation && event.stopPropagation();
    }

    _getFilesFromEvenObject(event) {
      return (
        (event.dataTransfer ? event.dataTransfer.files : event.target.files) ||
        []
      );
    }

    componentDidMount() {
      this.node = findDOMNode(this);
    }

    onDragEnter(event) {
      this._stopEvent(event);
      this.setState({ isOver: true, isValid: null });
      const { onDragEnter } = this.props;
      onDragEnter && onDragEnter(event);
    }

    onDragStart(event) {
      this._stopEvent(event);
    }

    onDragOver(event) {
      event.preventDefault();
    }

    onDragLeave(event) {
      this._stopEvent(event);
      if (isReallyDragLeave(event, this.node)) {
        this.setState({ isOver: false, isValid: null });
        const { onDragLeave } = this.props;
        onDragLeave && onDragLeave(event);
      }
    }

    // onPick should be called
    onPick(event) {
      this._stopEvent(event);

      this.enterCounter = 0;

      const pickedFiles = Array.prototype.slice.call(
        this._getFilesFromEvenObject(event)
      );
      return this.addFiles(pickedFiles, event);
    }

    onDisableDrop(event) {
      this._stopEvent(event);
    }

    addFiles(pickedFiles, event) {
      const { onDrop, onChange, acceptInvalid, disabled } = this.props;
      return this.getNewCurrentFiles(pickedFiles).then(newCurrentFiles => {
        // only active files, not combined get into onDrop
        const { validFiles, invalidFiles } = this.splitItemsByValidity(
          pickedFiles
        );
        const isValid = !invalidFiles.length;

        onDrop &&
          onDrop({
            files: pickedFiles,
            validFiles: validFiles,
            invalidFiles: invalidFiles,
            isValid
          });

        onChange &&
          onChange({
            files: newCurrentFiles,
            event
          });

        const nextStateProps = {
          isValid,
          isOver: false
        };

        if (!this.isControlled()) {
          nextStateProps.currentFiles = newCurrentFiles;
        }
        return new Promise(resolve => {
          this.setState(nextStateProps, resolve);
        });
      });
    }

    // -----------------------------------------------------------------------------
    // end interaction handlers
    // -----------------------------------------------------------------------------

    // -----------------------------------------------------------------------------
    // begin uncontrolled behavior
    // -----------------------------------------------------------------------------

    // handleIternalFilePick(pickedFiles) {
    //   const {app}
    // }

    // -----------------------------------------------------------------------------
    // end uncontrolled behavior
    // -----------------------------------------------------------------------------

    // -----------------------------------------------------------------------------
    // begin instance logic functions
    // -----------------------------------------------------------------------------

    isControlled(props) {
      return !!(props || this.props).files;
    }

    // will be ran each render when computing props to send to wrapped component
    // will be ran when a drop event happens. If an alteration of the file array
    // happens here, it should always be applied each time a prop is set, a state
    // is change, or a render is triggered.
    setFileValidity(files, controlProps = {}) {
      const { acceptsFile, accept, isFileValid, acceptDuplicates } = this.props;

      const fileMaxCount = getFileMaxCount(this.props);

      files.forEach((file, index) => {
        delete file.invalidDetails;

        const fileAccepted = acceptsFile(
          file,
          accept,
          index,
          files,
          this.props
        );
        const validFileSize = this.validFileSize(file);
        const fileCountOk = fileMaxCount > index;

        !fileAccepted &&
          setInvalidityReasson(
            file,
            'fileAccept',
            `File ${file.name} did not pass the given accept test`
          );

        !fileCountOk &&
          setInvalidityReasson(
            file,
            'fileMaxCount',
            `File ${
              file.name
            } could not be added because the list is full (fileMaxCount=${fileMaxCount})`
          );
        file.isDirectory &&
          setInvalidityReasson(
            file,
            'directory',
            `File ${file.name} could not be added because it is a directory`
          );

        file.valid =
          fileAccepted && validFileSize && fileCountOk && !file.isDirectory;
      });

      // in append on drop, we need to check duplicates after we merge with existing
      // files, so duplication check needs to happen after setting file validity
      // based on accept, size and count
      if (!acceptDuplicates && !controlProps.skipDuplicate) {
        markDuplicateFilesById(files);
      }

      // in append on drop, we need to check duplicates after we merge with existing
      // files, so validation via user hook should happen after that.
      if (!controlProps.skipUserIsValid) {
        hookUserValidation(files, isFileValid);
      }

      return files;
    }

    validFileSize(file) {
      const {
        fileMinSize,
        fileMaxSize,
        fileSizeFormatter,
        locale
      } = this.props;
      const size = file.size || 0;

      const okMinSize = size >= fileMinSize;
      const okMaxSize = size <= fileMaxSize;

      !okMinSize &&
        setInvalidityReasson(
          file,
          'fileMinSize',
          `The file size is less than ${fileSizeFormatter(fileMinSize, {
            locale
          })}`
        );
      !okMaxSize &&
        setInvalidityReasson(
          file,
          'fileMaxSize',
          `The file exceeds the maximum allowed size of ${fileSizeFormatter(
            fileMaxSize,
            {
              locale
            }
          )}`
        );

      return okMinSize && okMaxSize;
    }

    splitItemsByValidity(files) {
      const invalidFiles = [];
      const validFiles = [];

      files.forEach(file => {
        if (file.valid) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file);
        }
      });

      return { invalidFiles, validFiles };
    }

    getNewCurrentFiles(newProvidedFiles) {
      const {
        appendOnDrop,
        acceptDuplicates,
        acceptInvalid,
        isFileValid,
        flagDirectories
      } = this.props;

      const fileMaxCount = getFileMaxCount(this.props);

      return flagDirectories(newProvidedFiles).then(() => {
        let newCurrentFiles = this.setValidityAndClientUId(
          newProvidedFiles,
          this.props,
          { skipDuplicate: appendOnDrop, skipUserIsValid: appendOnDrop }
        );

        if (appendOnDrop) {
          newCurrentFiles = [...this.getCurrentFiles(), ...newCurrentFiles];

          markInvalidIfOverMaxCount(newCurrentFiles, fileMaxCount);
          !acceptDuplicates && markDuplicateFilesById(newCurrentFiles);
          hookUserValidation(newCurrentFiles, isFileValid);
        }

        if (!acceptInvalid) {
          newCurrentFiles = this.splitItemsByValidity(newCurrentFiles)
            .validFiles;
        }
        return Promise.resolve(newCurrentFiles);
      });
    }

    // -----------------------------------------------------------------------------
    // end instance logic functions
    // -----------------------------------------------------------------------------

    // -----------------------------------------------------------------------------
    // begin props functions
    // -----------------------------------------------------------------------------

    getCustomPropsForWrappedComponent() {
      const { props } = this;
      const {
        multiple,

        accept,
        acceptDuplicates,
        acceptInvalid,
        i18n,

        filePicker,
        fileMaxSize,
        fileMinSize,
        fileMaxCount,

        disabled,

        fileSizeFormatter,
        timeFormatter
      } = props;
      const files = this.getCurrentFiles();

      const { isOver, isValid } = this.state;
      const wrappedInstanceProps = {
        events: disabled
          ? { onDrop: this.onDisabledDrop }
          : {
              onDragOver: this.onDragOver,
              onDragStart: this.onDragStart,
              onDragLeave: this.onDragLeave,
              onDragEnter: this.onDragEnter,
              onDrop: this.onPick
            },

        getFiles: this.getFiles,
        getTotalFileSize: this.getTotalFileSize,
        getFileNames: this.getFileNames,
        clearFiles: this.clearFiles,
        removeFile: this.removeFile,
        removeFileAt: this.removeFileAt,

        files: files,
        multiple: supportMultiple && multiple,

        accept,
        acceptDuplicates,
        acceptInvalid,
        i18n,

        fileMaxSize,
        fileMinSize,
        fileMaxCount: getFileMaxCount(this.props),

        isOver,
        isValid,
        isEmpty: files.length === 0,

        fileSizeFormatter,
        timeFormatter
      };

      return wrappedInstanceProps;
    }

    getForwardProp() {
      const { forwardProp } = config;
      let forwardPropName = 'forwardProp';
      let result = this.getCustomPropsForWrappedComponent();

      if (forwardProp !== null) {
        if (typeof forwardProp === 'string') {
          forwardPropName = forwardProp;
        }
        result = {
          [`${forwardPropName}`]: result
        };
      }

      return result;
    }

    // method for getting files based on state and props.
    // used on every render once.
    // use getFile for external use instead of this one.
    getCurrentFiles(props, state) {
      props = props || this.props;
      const { files, defaultFiles } = props;
      const { currentFiles: stateFiles } = state || this.state;
      let currentFiles = [];

      if (files) {
        currentFiles = this.setValidityAndClientUId(files, props);
      } else if (stateFiles) {
        currentFiles = stateFiles;
      } else if (defaultFiles) {
        currentFiles = this.setValidityAndClientUId(defaultFiles, props);
      }

      return currentFiles;
    }

    setValidityAndClientUId(files, props, controlProps) {
      const { generateUniqueFileIdentifier } = props || this.props;
      return this.setFileValidity(
        assignUniqueFileIds(files, generateUniqueFileIdentifier),
        controlProps
      );
    }

    // -----------------------------------------------------------------------------
    // end props functions
    // -----------------------------------------------------------------------------

    // -----------------------------------------------------------------------------
    // begin public api
    // -----------------------------------------------------------------------------

    getFiles() {
      const newFiles = this.getCurrentFiles(this.props, this.state);
      return this.props.files || this.state.currentFiles;
    }

    getFileNames() {
      return this.getFiles().map(file => {
        return file.name || '';
      });
    }

    getTotalFileSize() {
      const files = this.getFiles();
      let totalSize = 0;
      files.forEach(file => {
        totalSize += file.size || 0;
      });
      return totalSize;
    }

    revalidateFiles() {
      const { onChange } = this.props;
      const files = this.getFiles();
      const reValidatedFiles = this.setFileValidity(files);
      if (!this.isControlled()) {
        this.setState({
          currentFiles: reValidatedFiles,
          isValid:
            reValidatedFiles.length === 0
              ? null
              : !reValidatedFiles.filter(file => !file.valid).length
        });
      }

      onChange &&
        onChange({
          files: reValidatedFiles,
          event: null
        });
    }

    clearFiles() {
      const { onChange } = this.props;
      const nextState = { isValid: null };
      if (!this.isControlled()) {
        nextState.currentFiles = [];
      }

      this.setState(nextState);

      onChange &&
        onChange({
          files: [],
          event: null
        });
    }

    removeFileAt(idx) {
      const files = this.getFiles();

      const { onChange, onRemoveAt } = this.props;

      if (idx < 0 || idx > files.length) {
        return null;
      }

      const action = onRemoveAt
        ? onRemoveAt({
            idx,
            file: files[idx]
          })
        : true;

      if (!action) {
        return;
      }

      let newFiles = files;
      if (idx >= 0 && idx < files.length) {
        newFiles = [...files.slice(0, idx), ...files.slice(idx + 1)];
      }

      if (!this.isControlled()) {
        this.setState(
          {
            currentFiles: newFiles
          },
          () => {
            this.revalidateFiles();
          }
        );
      } else {
        onChange &&
          onChange({
            files: newFiles,
            event: null
          });
      }
    }

    removeFile(fileID) {
      const files = this.getFiles();
      const targetFile = files.findIndex(file => file.id === fileID);
      if (targetFile !== -1) {
        return this.removeFileAt(targetFile);
      }
      return null;
    }
    // -----------------------------------------------------------------------------
    // end public api
    // -----------------------------------------------------------------------------

    render() {
      return (
        <ComponentClass
          {...this.getForwardProp()}
          {...cleanProps(this.props, hocPropTypes)}
        >
          {this.props.children}
        </ComponentClass>
      );
    }
  }

  const configuredDefaultProps = {};
  Object.keys(hocDefaultProps).forEach(key => {
    configuredDefaultProps[key] = config[key];
    if (config[key] == null) {
      configuredDefaultProps[key] = hocDefaultProps[key];
    }
  });

  // syntax sugar for fileMaxCount = 1
  if (config.multiple === false) {
    configuredDefaultProps.fileMaxCount = 1;
  }

  FileDroppable.defaultProps = configuredDefaultProps;
  FileDroppable.propTypes = hocPropTypes;
  return FileDroppable;
}

export { FileDroppable };
export default FileDroppable;
