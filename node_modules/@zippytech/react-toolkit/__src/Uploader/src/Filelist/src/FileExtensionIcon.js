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
import splitFileInNameAndType from './utils/split-file-in-name-and-type';

const CLASS_NAME = 'zippy-react-file-extension-icon';

const renderExtensionBox = extension => {
  const upperExtension = extension
    ? extension.toUpperCase().replace('.', '')
    : '';
  return (
    <svg width={28} height={28} viewBox="0 0 24 28">
      <g fill="none" fillRule="evenodd">
        <g fill="#A1B6D3" transform="translate(2)">
          <path d="M-4.28101998e-13,0 L12.6923077,0 L20,9.01694915 L20,28 L-4.28101998e-13,28 L-4.28101998e-13,0 Z M1,1 L1,27 L19,27 L19,9.21052632 L12.52,1 L1,1 Z" />
          <path d="M12,0 L20,10 L12,10 L12,0 Z M13,2 L13,9 L19,9 L13,2 Z" />
        </g>
        <rect width="26" height="12" x="-1" y="14" fill="#5C8EEB" />
        <text
          fill="#E6EEFF"
          fontFamily="Verdana, Geneva, sans-serif"
          fontSize="8"
          fontWeight="700"
          textAnchor="middle"
        >
          <tspan x="12" y="23">
            {upperExtension}
          </tspan>
        </text>
      </g>
    </svg>
  );
};

class FileExtensionIcon extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState);
  }

  getExtension() {
    const { file, extension, showStartingDot } = this.props;
    let ext = extension;
    let rawExtension = ext;

    let fileName = typeof file == 'object' ? file.name : file;

    if (!extension && file) {
      rawExtension = ext = splitFileInNameAndType(fileName).fileExtention;
    }

    if (!showStartingDot) {
      ext = extension.replace('.', '');
    }

    return { extension: ext, rawExtension };
  }

  getClassNames() {
    const { className } = this.props;

    const classNames = join(CLASS_NAME, className);

    return classNames;
  }

  getColorForExtension(extension) {
    const { colors, unknownExtensionColor } = this.props;
    if (!colors && !unknownExtensionColor) {
      return;
    }

    let pickedColor = unknownExtensionColor;
    colors &&
      Object.keys(colors).forEach(colorKey => {
        if (
          extension.replace('.', '').indexOf(colorKey.replace('.', '')) !== -1
        ) {
          pickedColor = colors[colorKey];
        }
      });
    return pickedColor;
  }

  getProps() {
    const { renderExtensionBox } = this.props;
    return {
      ...this.getExtension(),
      className: this.getClassNames(),
      renderExtensionBox
    };
  }

  render() {
    const {
      extension,
      rawExtension,
      className,
      renderExtensionBox
    } = (this.p = this.getProps());

    return (
      <div
        {...cleanProps(this.props, FileExtensionIcon.propTypes)}
        className={className}
      >
        {renderExtensionBox(
          extension,
          this.getColorForExtension(extension),
          rawExtension
        )}
      </div>
    );
  }
}

FileExtensionIcon.defaultProps = {
  showStartingDot: true,
  renderExtensionBox
};

FileExtensionIcon.propTypes = {
  shouldComponentUpdate: PropTypes.func,
  children: PropTypes.any,
  file: PropTypes.object,
  extension: PropTypes.string,
  showStartingDot: PropTypes.bool,
  renderExtensionBox: PropTypes.func,
  colors: PropTypes.object,
  unknownExtensionColor: PropTypes.string
};

export default FileExtensionIcon;
