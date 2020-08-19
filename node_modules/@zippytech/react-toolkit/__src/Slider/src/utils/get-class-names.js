/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import join from '../../../common/join';

const getClassNames = (props, state, CLASS_NAME) => {
  const {
    className,
    theme,
    orientation,
    rtl,
    showButtons,
    tickBarPosition
  } = props;
  const { focused } = state;

  return join(
    CLASS_NAME,
    className,
    `${CLASS_NAME}--${orientation}-orientation`,
    tickBarPosition === `${tickBarPosition}`
      ? `${CLASS_NAME}--tick-bar-${orientation}-${tickBarPosition}`
      : '',
    `${CLASS_NAME}--theme-${theme}`,
    focused && `${CLASS_NAME}--focused`,
    rtl && `${CLASS_NAME}--rtl`,
    showButtons && `${CLASS_NAME}--with-buttons`
  );
};

export default getClassNames;
