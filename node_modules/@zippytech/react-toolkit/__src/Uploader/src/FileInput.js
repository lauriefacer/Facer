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
import join from '../../common/join';
import Button from '../../Button';

const CLASS_NAME = 'zippy-react-uploader-file-input';

class FileInput extends Component {
  constructor(props, context) {
    super(props, context);
    autoBind(this);
  }

  startChooseAction(ev) {
    if (this.props.disabled) {
      return;
    }
    this._input.click();
  }

  setFileInputRef(el) {
    this._input = el;
  }

  onChange(ev) {
    this.props.onChange(Array.prototype.slice.call(ev.target.files, 0));
    this.clearFiles();
  }

  clearFiles() {
    this._input.value = null;
  }

  render() {
    const { props, props: { children, onChange, multiple, disabled } } = this;

    return (
      <Button
        {...cleanProps(props, FileInput.propTypes)}
        disabled={disabled}
        onClick={this.startChooseAction}
        className={join(props.className, CLASS_NAME)}
      >
        {children}
        <input
          ref={this.setFileInputRef}
          multiple={multiple}
          disabled={disabled}
          onChange={this.onChange}
          type="file"
          className={`${CLASS_NAME}__field`}
        />
      </Button>
    );
  }
}

FileInput.defaultProps = {
  multiple: true
};

FileInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
  disabled: PropTypes.bool
};

export default FileInput;
