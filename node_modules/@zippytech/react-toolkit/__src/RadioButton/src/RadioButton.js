/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CheckBox from '../../CheckBox';

const defaultCheckedIcon = ({ style, size = 24 }) => {
  return (
    <svg style={style} width={size} height={size} viewBox="0 0 50 50">
      <g id="icons" stroke="none" strokeWidth="1">
        <g id="Artboard" transform="translate(-90.000000, -159.000000)">
          <g
            id="radio-button-icon"
            transform="translate(90.000000, 159.000000)"
          >
            <path
              d="M25,50 C11.1928813,50 0,38.8071187 0,25 C0,11.1928813 11.1928813,0 25,0 C38.8071187,0 50,11.1928813 50,25 C50,38.8071187 38.8071187,50 25,50 Z M25,45 C36.045695,45 45,36.045695 45,25 C45,13.954305 36.045695,5 25,5 C13.954305,5 5,13.954305 5,25 C5,36.045695 13.954305,45 25,45 Z"
              id="Combined-Shape"
            />
            <circle id="Oval-2" cx="25" cy="25" r="10" />
          </g>
        </g>
      </g>
    </svg>
  );
};

const defaultUncheckedIcon = ({ style, size = 24 }) => {
  return (
    <svg viewBox="0 0 24 24" height={size} width={size} style={style}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
      <path d="M0 0h24v24H0z" fill="none" />
    </svg>
  );
};

const ZippyRadioButton = props => {
  let checkedIcon = defaultCheckedIcon || props.checkedIcon;
  let uncheckedIcon = defaultUncheckedIcon || props.uncheckedIcon;

  function renderNativeBrowserInput(config) {
    if (props.renderNativeBrowserInput) {
      return renderNativeBrowserInput(config);
    }
    config.inputProps.type = 'radio';
  }

  return (
    <CheckBox
      {...props}
      supportIndeterminate={false}
      checkedIcon={checkedIcon}
      uncheckedIcon={uncheckedIcon}
      renderNativeBrowserInput={renderNativeBrowserInput}
    />
  );
};
function emptyFn() {}

ZippyRadioButton.defaultProps = {
  theme: 'default',
  rootClassName: 'zippy-react-toolkit-radio-button'
};

ZippyRadioButton.propTypes = {
  theme: PropTypes.string,
  rootClassName: PropTypes.string
};

export default ZippyRadioButton;
