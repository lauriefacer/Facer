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
import * as i18n from '../../i18n';
import ProgressBar from '../../../../ProgressBar';
import Button from '../../../../Button';

import FileExtensionIcon from './FileExtensionIcon';
import splitFileInNameAndType from './utils/split-file-in-name-and-type';
import fileSizeFormatter from './utils/file-size-formatter';
import timeFormatter from './utils/time-formatter';

const CLASS_NAME = 'zippy-react-file-item';

const renderFileErrorMessage = props => {
  return (
    <div className={`${CLASS_NAME}__error__text`}>{props.error.message}</div>
  );
};

const shouldShowUploadButton = props => {
  const showError = shouldShowError(props);
  return !showError && !props.hideUploadButton;
};

const renderUploadButton = props => {
  const { isLabel, ...domProps } = props;
  if (isLabel) {
    return <div {...domProps} />;
  }
  return <Button {...domProps} />;
};

const renderFileExtensionIcon = props => {
  return <FileExtensionIcon {...props} />;
};

const renderClearIcon = props => {
  return (
    <div
      className={`${CLASS_NAME}__clear-icon__trigger`}
      onClick={props.onClick}
    >
      <svg className={`${CLASS_NAME}__clear-icon__content`} viewBox="0 0 24 24">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        <path d="M0 0h24v24H0z" fill="none" />
      </svg>
    </div>
  );
};

const renderFileName = props => {
  return <span className={`${CLASS_NAME}__name__text`}>{props.file.name}</span>;
};

const renderFileSize = ({ fileSizeFormatter, file, locale }) => {
  return fileSizeFormatter(file.size || 0, { locale });
};

const renderUploadProgress = props => {
  const {
    uploadedSizeText,
    totalSizeText,
    etaText,
    percentage,
    percentageText
  } = props;
  const flooredPercentage = Math.floor(percentageText);
  return (
    <div className={`${CLASS_NAME}__progress__wrapper`}>
      <div
        className={`${CLASS_NAME}__progress__text`}
        style={{ position: 'relative' }}
      >
        <div>
          {uploadedSizeText}/{totalSizeText} -
        </div>
        <div style={{ marginLeft: 3 }}>{etaText} remaining</div>
        <div style={{ position: 'absolute', right: 0, top: 0 }}>
          {`${flooredPercentage}%`}
        </div>
      </div>
      <ProgressBar
        value={percentage * 100}
        label={null}
        labelPosition="center"
        transitionDuration=".2s"
      />
    </div>
  );
};

const getMeaninfulUploaderProgressProps = (uploadProgress, props) => {
  const {
    fileSizeFormatter,
    timeFormatter,
    file,
    locale,
    renderFileName
  } = props;

  const { uploadedSize = 0, eta = 0, done, error } =
    uploadProgress || file.uploadProgress || {};

  return {
    done,
    uploaderError: error,
    uploadedSize,
    uploadedSizeText: fileSizeFormatter(uploadedSize, { locale }),
    etaText: timeFormatter(eta, { locale }),
    percentage: uploadedSize / file.size,
    percentageText: (100 * (uploadedSize / file.size)).toLocaleString(locale, {
      maximumFractionDigits: 2
    }),
    totalSize: file.size,
    totalSizeText: fileSizeFormatter(file.size, { locale })
  };
};

const shouldShowJustTheNameOfTheFile = props => {
  const { uploadProgress, invalidDetails, file } = props;
  return !(
    Object.keys(uploadProgress).length ||
    invalidDetails ||
    file.invalidDetails
  );
};

const shouldShowError = props => {
  const { uploadProgress, invalidDetails, file } = props;
  return uploadProgress.error || invalidDetails || file.invalidDetails;
};

const shouldShowUploadDone = props => {
  const { uploadProgress, invalidDetails, file } = props;
  return uploadProgress.done;
};

// could be different in the future
const getFileError = props => {
  const { uploadProgress, invalidDetails = [], file } = props;
  const fileInvalidDetails = file.invalidDetails || [];
  if (uploadProgress.error) {
    return uploadProgress.error;
  }
  return invalidDetails[0] || fileInvalidDetails[0];
};

const uploadIsInProgress = props => {
  const { uploadProgress } = props;
  return uploadProgress.inProgress;
};

const getUploadActionText = ({
  inDoneState,
  inQuedState,
  inProgressState,
  i18n
}) => {
  if (inDoneState) {
    return i18n ? i18n.UPLOADED : 'uploaded';
  }

  if (inQuedState) {
    return i18n ? i18n.QUEUED : 'queued';
  }

  if (inProgressState) {
    return i18n ? i18n.UPLOADING : 'uploading';
  }

  return i18n ? i18n.UPLOAD : 'upload';
};

const renderSuccessState = ({
  file,
  uploadProgress,
  locale,
  fileSizeFormatter,
  timeFormatter
}) => {
  uploadProgress = uploadProgress || {};

  return (
    <div>
      <div className={`${CLASS_NAME}__success__text`}>
        Uploaded {fileSizeFormatter(file.size, { locale })} in{' '}
        {timeFormatter(uploadProgress.uploadTime, { locale })}
      </div>
    </div>
  );
};

class FileItem extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState);
  }

  getClearIconContent() {
    const { renderClearIcon, onClearClick } = this.props;
    if (renderClearIcon) {
      return (
        <div className={`${CLASS_NAME}__clear-icon__layout`}>
          {renderClearIcon({ onClick: onClearClick })}
        </div>
      );
    }
  }

  getNameContent() {
    const { renderFileName, file } = this.props;
    if (renderFileName) {
      return (
        <div className={`${CLASS_NAME}__name__layout`}>
          {renderFileName({ file })}
          {this.getFileSizeContent()}
        </div>
      );
    }
  }

  getFileExtensionContent() {
    const { renderFileExtensionIcon, file } = this.props;
    if (renderFileExtensionIcon) {
      return (
        <div className={`${CLASS_NAME}__extension__layout`}>
          {renderFileExtensionIcon({ file })}
        </div>
      );
    }
  }

  getFileSizeContent() {
    const { renderFileSize, file, fileSizeFormatter, locale } = this.props;
    if (renderFileSize) {
      return (
        <div className={`${CLASS_NAME}__size__layout`}>
          {renderFileSize({ file, fileSizeFormatter, locale })}
        </div>
      );
    }
  }

  getUploaderProgressContent() {
    const {
      renderUploadProgress,
      renderFileName,
      file,
      uploadProgress
    } = this.props;
    if (renderUploadProgress) {
      return (
        <div className={`${CLASS_NAME}__progress__layout`}>
          {renderFileName({ file })}
          {renderUploadProgress(
            getMeaninfulUploaderProgressProps(uploadProgress, this.props)
          )}
        </div>
      );
    }
  }

  getUploadButtonContent({ inDoneState, inQuedState, inProgressState }) {
    const {
      renderUploadButton,
      file,
      uploadText,
      uploadingText,
      onUploadClick,
      connected,
      i18n,
      getUploadActionText
    } = this.props;

    if (renderUploadButton) {
      const uploadActionText = getUploadActionText({
        inDoneState,
        inQuedState,
        inProgressState,
        i18n
      });

      let buttonStatusClassName = 'upload';
      let isLabel = false;
      if (inProgressState) {
        buttonStatusClassName = 'uploading';
        isLabel = true;
      }
      if (inQuedState) {
        buttonStatusClassName = 'queued';
        isLabel = true;
      }
      if (inDoneState) {
        buttonStatusClassName = 'uploaded';
        isLabel = true;
      }

      return (
        <div className={`${CLASS_NAME}__upload-button__layout`}>
          {renderUploadButton({
            children: uploadActionText,
            disabled: !connected,
            isLabel,
            className: join(
              `${CLASS_NAME}__upload-button__trigger`,
              inDoneState && `${CLASS_NAME}__upload-button__trigger--done`,
              `${CLASS_NAME}__upload-button__trigger--${buttonStatusClassName}`,
              connected === false &&
                `${CLASS_NAME}__upload-button__trigger-disabled`
            ),
            onClick: connected ? onUploadClick : () => {}
          })}
        </div>
      );
    }
  }

  getErrorContent() {
    const { props } = this;
    const { renderFileErrorMessage, renderFileName, file } = props;
    if (renderFileErrorMessage) {
      return (
        <div className={`${CLASS_NAME}__error__layout`}>
          {renderFileName({ file })}
          {renderFileErrorMessage({ error: getFileError(props) })}
        </div>
      );
    }
  }

  getSuccessContent() {
    const { props } = this;
    const {
      renderFileName,
      renderSuccessState,
      file,
      uploadProgress,
      timeFormatter,
      fileSizeFormatter,
      locale
    } = props;
    return (
      <div className={`${CLASS_NAME}__success__layout`}>
        {renderFileName && renderFileName({ file })}
        {renderSuccessState &&
          renderSuccessState({
            file,
            locale,
            uploadProgress,
            timeFormatter,
            fileSizeFormatter
          })}
      </div>
    );
  }

  getQueuedContent() {
    const { props } = this;
    const { renderFileName, file } = props;
    if (renderFileName) {
      return (
        <div className={`${CLASS_NAME}__queued__layout`}>
          {renderFileName({ file })}
          {this.getFileSizeContent()}
        </div>
      );
    }
  }

  getClassNames() {
    const { className } = this.props;

    const classNames = join(CLASS_NAME, className);

    return classNames;
  }

  render() {
    const { props } = this;
    const {
      uploadProgress,
      uploadProgress: { queued, inProgress: inProgressState },
      invalidDetails,
      file
    } = this.props;

    const inDoneState = shouldShowUploadDone(props);
    const inQuedState = queued;
    return (
      <div
        {...cleanProps(this.props, FileItem.propTypes)}
        data-file-id={file.id}
        className={this.getClassNames()}
      >
        {this.getFileExtensionContent(props)}

        {shouldShowJustTheNameOfTheFile(props) ? this.getNameContent() : null}

        {shouldShowError(props) ? this.getErrorContent() : null}
        {inDoneState ? this.getSuccessContent() : null}
        {inQuedState ? this.getQueuedContent() : null}

        {inProgressState ? this.getUploaderProgressContent() : null}

        {shouldShowUploadButton(props)
          ? this.getUploadButtonContent({
              inDoneState,
              inQuedState,
              inProgressState
            })
          : null}
        {this.getClearIconContent()}
      </div>
    );
  }
}

FileItem.defaultProps = {
  renderFileExtensionIcon,
  renderClearIcon,
  renderFileName,
  renderFileSize,
  renderUploadProgress,
  renderUploadButton,
  renderFileErrorMessage,
  renderSuccessState,

  file: {},
  uploadProgress: {},
  timeFormatter,
  fileSizeFormatter,

  uploadText: 'upload',
  uploadingText: 'uploading',

  hideUploadButton: false,

  getUploadActionText
};

const FileItemPropTypes = (FileItem.propTypes = {
  shouldComponentUpdate: PropTypes.func,

  file: PropTypes.object,
  invalidDetails: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object)
  ]),
  uploadProgress: PropTypes.object,

  renderFileExtensionIcon: PropTypes.func,
  renderClearIcon: PropTypes.func,
  renderFileName: PropTypes.func,
  renderFileSize: PropTypes.func,

  renderFileErrorMessage: PropTypes.func,
  renderUploadProgress: PropTypes.func,
  renderUploadButton: PropTypes.func,
  renderSuccessState: PropTypes.func,

  connected: PropTypes.bool,

  timeFormatter: PropTypes.func,
  fileSizeFormatter: PropTypes.func,

  uploadText: PropTypes.string,
  uploadingText: PropTypes.string,

  onClearClick: PropTypes.func,
  onUploadClick: PropTypes.func,
  onUploadCancelClick: PropTypes.func,
  i18n: PropTypes.object,

  getUploadActionText: PropTypes.func,

  hideUploadButton: PropTypes.bool,

  locale: PropTypes.string
});

export default FileItem;
export { CLASS_NAME, FileItemPropTypes };
