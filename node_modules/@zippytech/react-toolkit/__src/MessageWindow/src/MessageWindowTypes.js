/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import MessageWindow from './MessageWindow';

const InfoWindow = props => <MessageWindow type="info" {...props} />;
const WarningWindow = props => <MessageWindow type="warning" {...props} />;
const QuestionWindow = props => <MessageWindow type="question" {...props} />;
const ErrorWindow = props => <MessageWindow type="error" {...props} />;
const YesNoCancelWindow = props => (
  <MessageWindow type="yesNoCancel" {...props} />
);

export {
  InfoWindow,
  WarningWindow,
  QuestionWindow,
  ErrorWindow,
  YesNoCancelWindow
};
