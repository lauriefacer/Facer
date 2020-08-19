/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Extracts props that are relevant for notification
 */
const getDefaultConfig = props => {
  const {
    stacking,
    clearOpacityOnMouseEnter,
    hideOnClick,
    delayAutoHideOnMouseOver,
    cancelAutoHideOnClick,
    nonBlocking,
    rtl,

    // subcomponents
    title,
    titleEllipsis,
    closeButton,
    pinButton,
    icon,
    content,

    // style
    theme,
    position,
    border,
    style,
    padding,
    height,
    width,
    minSize,
    maxSize,
    opacity,
    shadow,
    borderRadius,

    offset,
    push,
    autoHideDelay,
    moveTransition,
    showAnimation,
    hideAnimation,
    hideTransitionDuration,
    showTransitionDuration,
    background
  } = props;

  return {
    stacking,
    clearOpacityOnMouseEnter,
    hideOnClick,
    delayAutoHideOnMouseOver,
    cancelAutoHideOnClick,
    nonBlocking,
    rtl,

    // subcomponents
    title,
    titleEllipsis,
    closeButton,
    pinButton,
    icon,
    content,

    // style
    theme,
    position,
    border,
    style,
    padding,
    height,
    width,
    minSize,
    maxSize,
    opacity,
    shadow,
    borderRadius,

    offset,
    push,
    autoHideDelay,
    moveTransition,
    showAnimation,
    hideAnimation,
    hideTransitionDuration,
    showTransitionDuration,
    background,

    visible: false
  };
};

export default getDefaultConfig;
