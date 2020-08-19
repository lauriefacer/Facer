/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import autoBind from '@zippytech/react-class/autoBind';
import cleanProps from '../../common/cleanProps';

import FileList, { FileListPropTypes } from './Filelist/src/FileList';

import pickProps from './utils/pick-props';
import join from '../../common/join';
import shouldComponentUpdate from '../../common/shouldComponentUpdate';

import FileDroppable from './FileDroppable';

import {
  hocDefaultProps,
  hocPropTypes,
  fdzDefaultProps,
  fdzPropTypes
} from './props';

const CLASS_NAME = 'zippy-react-file-drop-zone';

/**
 * Default render function
 * ========================================================================
 */

const renderFunction = props => {
  const cleanedProps = cleanProps(props, FileDropZoneRenderer.propTypes);
  const isMarkedInvalid = props.isValid === false;
  const shouldShowInvalidMessage = isMarkedInvalid;
  const errorText =
    props.invalidText !== null ? (
      props.invalidText
    ) : (
      <DefaultInvalidState {...props} />
    );
  if (props.isOver) {
    return (
      <div className={`${CLASS_NAME}__over-state__layout`}>
        {isMarkedInvalid && errorText}
        {FileListWrapper(cleanedProps, props)}
        <div className={`${CLASS_NAME}__over-state__wrapper`}>
          {props.overText || <DefaultOverState />}
          {props.isEmpty && (props.emptyText || <DefaultEmptyState />)}
        </div>
      </div>
    );
  } else if (props.isEmpty) {
    return (
      <div className={`${CLASS_NAME}__empty-state__layout`}>
        {isMarkedInvalid && errorText}
        {props.emptyText || <DefaultEmptyState />}
      </div>
    );
  } else if (isMarkedInvalid) {
    return (
      <div className={`${CLASS_NAME}__invalid-state__layout`}>
        {errorText}
        {FileListWrapper(cleanedProps, props)}
      </div>
    );
  } else {
    return FileListWrapper(cleanedProps, props);
  }
};

const DefaultEmptyState = props => {
  return (
    <div className={`${CLASS_NAME}__empty-placeholder`}>
      <svg className={`${CLASS_NAME}__empty-icon`} viewBox="0 0 24 24">
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
      </svg>
      <span className={`${CLASS_NAME}__empty-text`}>
        Click "Select Files" or drag and drop your files here
      </span>
    </div>
  );
};

const DefaultOverState = props => {
  return <div />;
};

const DefaultInvalidState = props => {
  const { files } = props;

  const countProplematicErrors = files.filter(
    ({ invalidDetails }) => invalidDetails
  ).length;

  if (!countProplematicErrors) {
    return null;
  }

  return null;
};

const FileListWrapper = (cleanedProps, props) => {
  const connected = props.connected;
  const FileList = props.fileList;

  return (
    <FileList
      {...cleanedProps}
      {...getPropsForFilelist(props)}
      i18n={props.i18n}
      connected={connected}
    />
  );
};

const getPropsForFilelist = props => {
  const {
    removeFile,
    files,
    uploadFile,
    cancelUploadFile,
    uploadProgress,
    fileSizeFormatter,
    timeFormatter,
    i18n
  } = props;

  return {
    ...pickProps(props, FileListPropTypes),
    files,
    onUploadClick: uploadFile,
    onUploadCancelClick: cancelUploadFile,
    onClearClick: removeFile,
    uploadProgress,
    fileSizeFormatter,
    timeFormatter
  };
};

/**
 * File DropZone dumb component
 * ========================================================================
 */

class FileDropZoneRenderer extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState);
  }

  isInvalid() {
    return this.props.isInvalid;
  }

  getClassNames() {
    const {
      forwardProp,
      className,
      theme,
      emptyClass,
      overClass,
      invalidClass
    } = this.props;
    const { isOver, isEmpty, isValid, acceptInvalid } = forwardProp;

    let extraClass = '';
    if (isOver) {
      extraClass = overClass;
    } else if (isEmpty) {
      extraClass = emptyClass;
    } else if (!isValid) {
      extraClass = invalidClass;
    }

    return join(
      className,
      extraClass,
      CLASS_NAME,
      `${CLASS_NAME}--theme-${theme}`,
      isEmpty && `${CLASS_NAME}--empty`,
      !isEmpty && `${CLASS_NAME}--hasfiles`,
      isOver && `${CLASS_NAME}--over`,
      isValid === true && `${CLASS_NAME}--valid`,
      acceptInvalid === true && isValid === false && `${CLASS_NAME}--invalid`
    );
  }

  getStyle() {
    const {
      emptyStyle,
      invalidStyle,
      overStyle,
      style = {},
      forwardProp
    } = this.props;

    const { isOver, isEmpty, isValid, acceptInvalid } = forwardProp;

    let computedStyle = style;

    if (isOver) {
      computedStyle = {
        ...style,
        ...overStyle
      };
    } else if (isEmpty) {
      computedStyle = {
        ...style,
        ...emptyStyle
      };
    } else if (!isValid) {
      computedStyle = {
        ...style,
        ...invalidStyle
      };
    }

    return computedStyle;
  }

  onDragEnter(callback, dispatch, event) {
    if (callback) {
      callback(dispatch, event);
    }
  }

  render() {
    const { props } = this;

    const {
      children,
      forwardProp,
      forwardProp: { events, files }
    } = props;
    const { onDragEnter } = events || {};
    return (
      <div
        {...cleanProps(props, FileDropZoneRenderer.propTypes)}
        {...events}
        className={this.getClassNames()}
        style={this.getStyle()}
        onDragEnter={this.onDragEnter.bind(this, onDragEnter)}
      >
        {children({
          ...pickProps(props, FileDropZoneRenderer.propTypes),
          ...forwardProp
        })}
      </div>
    );
  }
}

FileDropZoneRenderer.defaultProps = {
  children: renderFunction,
  forwardProp: {},
  fileList: FileList,
  ...hocDefaultProps,
  ...fdzDefaultProps
};

FileDropZoneRenderer.propTypes = {
  forwardProp: PropTypes.object,
  i18n: PropTypes.object,
  children: PropTypes.func,
  connected: PropTypes.bool,
  renderListScroller: PropTypes.func,
  clearFiles: PropTypes.func,
  getFileNames: PropTypes.func,
  getFiles: PropTypes.func,
  getTotalFileSize: PropTypes.func,

  removeFile: PropTypes.func,
  removeFileAt: PropTypes.func,

  uploadFile: PropTypes.func,
  cancelUploadFile: PropTypes.func,

  events: PropTypes.object,
  files: PropTypes.arrayOf(PropTypes.object),

  isEmpty: PropTypes.bool,
  isOver: PropTypes.bool,
  isValid: PropTypes.bool,

  ...hocPropTypes,
  ...fdzPropTypes,
  ...FileListPropTypes
};

const WrappedFileDropZoneRenderer = FileDroppable(FileDropZoneRenderer);

export { FileDropZoneRenderer, WrappedFileDropZoneRenderer, CLASS_NAME };
