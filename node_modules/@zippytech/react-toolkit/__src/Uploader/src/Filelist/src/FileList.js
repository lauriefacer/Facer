/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import autoBind from '@zippytech/react-class/autoBind';
import cleanProps from '../../../../common/cleanProps';
import join from '../../../../common/join';
import shouldComponentUpdate from '../../../../common/shouldComponentUpdate';
import FileExtensionIcon from './FileExtensionIcon';

import pickProps from './utils/pick-props';
import fileSizeFormatter from './utils/file-size-formatter';
import timeFormatter from './utils/time-formatter';
import FileItem, { FileItemPropTypes } from './FileItem';

const CLASS_NAME = 'react-file-list';

// returns constructor state for files if needed.
// in controlled state we rely on getCurrentFiles to
// read files, not the state.
const getInitialStateFile = props => {
  const { files, defaultFiles } = props;
  if (files) {
    return null;
  }
  return defaultFiles || [];
};

// returns current files for given props and state. Will
// know where to read files array from based on the type
// of component (controlled or uncontrolled)
const getCurrentFiles = (props, state) => {
  const { files: controlledFiles, defaultFiles } = props;
  const { files: stateFiles } = state;

  let files = defaultFiles || [];
  if (controlledFiles) {
    files = controlledFiles;
  } else if (stateFiles) {
    files = stateFiles;
  }

  return files;
};

// logic for rendering one individual file, bind callbacks etc
const renderFiles = (props, callbacks) => {
  const { files, fileItemsProps, uploadProgress, FileItem } = props;
  return files.map((file, idx) => {
    const uploadProgressForFile = uploadProgress[file.id] || {};
    return (
      <FileItem
        {...fileItemsProps}
        {...callbacks}
        uploadProgress={uploadProgressForFile}
        connected={props.connected}
        key={`${file.id}-${idx}`}
        i18n={props.i18n}
        file={file}
      />
    );
  });
};

const getFileIDFromDOM = ev => {
  let target = ev.target;
  while (!target.getAttribute('data-file-id')) {
    target = target.parentNode;
  }

  return target.getAttribute && target.getAttribute('data-file-id');
};

const getClassName = props => {
  const { className } = props;
  return join(CLASS_NAME, className);
};

const isControlledComponent = (props, state) => {
  return !!props.files;
};

class FileList extends Component {
  constructor(props, context) {
    super(props, context);
    autoBind(this);
    this.state = {
      files: getInitialStateFile(props)
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState);
  }

  getProps() {
    const { state, props } = this;
    const { uploadProgress, FileItem, connected, i18n } = props;
    return {
      files: getCurrentFiles(props, state),
      FileItem,
      i18n,
      connected,
      uploadProgress,
      fileItemsProps: pickProps(props, FileItemPropTypes),
      className: getClassName(props),
      isControlled: isControlledComponent(props, state)
    };
  }

  onClearClick(ev) {
    const { onClearClick } = this.props;
    const targetID = getFileIDFromDOM(ev);
    onClearClick && onClearClick(targetID);
  }

  onUploadClick(ev) {
    const { onUploadClick } = this.props;
    const targetID = getFileIDFromDOM(ev);
    onUploadClick && onUploadClick(targetID);
  }

  setNewFiles(newFiles) {
    if (!this.p.isControlled) {
      this.setState({
        files: newFiles
      });
    }

    const { onChange } = this.props;
    onChange && onChange(newFiles);
  }

  // public api

  getFiles() {
    return this.p.files;
  }

  clearFiles() {
    this.setNewFiles([]);
  }

  addFile(file) {
    if (!file) {
      return;
    }
    this.addFiles([file]);
  }

  addFiles(files) {
    if (!files) {
      return;
    }

    const newFiles = this.state.files.concat(files);
    this.setNewFiles(newFiles);
  }

  removeFile(id) {
    if (!id) {
      return;
    }
    this.removeFileAt(this.p.files.findIndex(file => file.id === id));
  }

  removeFileAt(idx) {
    const { files } = this.p;
    if (
      typeof idx !== 'number' ||
      idx === NaN ||
      idx < 0 ||
      idx >= files.length
    ) {
      return;
    }
    const newFiles = [...files.slice(0, idx), ...files.slice(idx + 1)];
    this.setNewFiles(newFiles);
  }

  render() {
    const { files, className, i18n } = (this.p = this.getProps());
    const { onClearClick, onUploadClick } = this;
    const list = renderFiles(this.p, {
      onClearClick,
      onUploadClick
    });

    const listProps = {
      children: list,
      ...cleanProps(this.props, FileList.propTypes),
      className
    };
    let result;

    if (this.props.renderListScroller) {
      result = this.props.renderListScroller(listProps);
    }

    if (result === undefined) {
      result = <div {...listProps} />;
    }

    return result;
  }
}

const FileListDefaultProps = (FileList.defaultProps = {
  defaultFiles: [],
  uploadProgress: {},
  timeFormatter,
  fileSizeFormatter,
  FileItem
});

const FileListPropTypes = (FileList.propTypes = {
  ...FileItemPropTypes,
  files: PropTypes.arrayOf(PropTypes.object),
  uploadProgress: PropTypes.object,
  connected: PropTypes.bool,
  defaultFiles: PropTypes.arrayOf(PropTypes.object),

  onChange: PropTypes.func,
  onClearClick: PropTypes.func,
  onUploadClick: PropTypes.func,
  i18n: PropTypes.object,

  fileSizeFormatter: PropTypes.func,
  timeFormatter: PropTypes.func,
  renderListScroller: PropTypes.func,
  locale: PropTypes.string,
  FileItem: PropTypes.any
});

export default FileList;
export {
  timeFormatter,
  fileSizeFormatter,
  FileListPropTypes,
  FileListDefaultProps,
  FileItemPropTypes,
  FileItem,
  FileExtensionIcon
};
