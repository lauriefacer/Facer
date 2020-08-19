/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import join from '../../../../common/join';

const getControllButtonProps = config => {
  const { disabled } = config;
  return {
    disabled
  };
};

const renderIncrementButton = domProps => <button {...domProps} />;
const renderDecrementButton = domProps => <button {...domProps} />;

const renderControlButtonsWrapper = (
  input,
  config,
  startIncrement,
  startDecrement,
  CLASS_NAME
) => {
  const {
    renderIncrementButton,
    renderDecrementButton,
    incrementButton,
    decrementButton
  } = config;

  const buttonConfig = getControllButtonProps(config);

  return [
    renderIncrementButton({
      ...buttonConfig,
      key: 'decrementButton',
      children: decrementButton,
      onMouseDown: startDecrement,
      className: join(
        `${CLASS_NAME}__control-button`,
        `${CLASS_NAME}__decrement-button`
      )
    }),

    <div key="inputWrapper" className={`${CLASS_NAME}__input-wrapper`}>
      {input}
    </div>,

    renderDecrementButton({
      ...buttonConfig,
      key: 'incrementButton',
      children: incrementButton,
      onMouseDown: startIncrement,
      className: join(
        `${CLASS_NAME}__control-button`,
        `${CLASS_NAME}__increment-button`
      )
    })
  ];
};

export {
  renderControlButtonsWrapper,
  renderIncrementButton,
  renderDecrementButton
};
