/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Window from '../../Window';
import cleanProps from '../../common/cleanProps';
import assign from '../../common/assign';

import { OkButton, CancelButton, NoButton, YesButton } from './Buttons';
import { QuestionIcon, WarningIcon, ErrorIcon, InfoIcon } from './Icons';

import join from '../../common/join';
import shouldComponentUpdate from '../../common/shouldComponentUpdate';
import toLowerCaseFirst from './utils/toLowerCaseFirst';

const emptyFn = function() {};

const buttonMap = {
  OkButton,
  CancelButton,
  NoButton,
  YesButton
};

const messageWindowTypes = {
  info: {
    buttons: ['OkButton'],
    icon: InfoIcon
  },
  warning: {
    buttons: ['OkButton'],
    icon: WarningIcon
  },
  question: {
    buttons: ['YesButton', 'NoButton'],
    icon: QuestionIcon
  },
  error: {
    buttons: ['OkButton'],
    icon: ErrorIcon
  },
  yesNoCancel: {
    buttons: ['YesButton', 'NoButton', 'CancelButton'],
    icon: InfoIcon
  }
};

class MessageWindow extends Component {
  constructor(props) {
    super(props);

    this.renderFooter = this.renderFooter.bind(this);
    this.renderButton = this.renderButton.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState);
  }

  render() {
    const props = this.props;
    const { children } = props;

    const className = join(
      props.className,
      `${this.props.rootClassName}--buttons-align-${this.props.buttonsAlign}`
    );

    const style = assign({}, props.style, {
      opacity: this.props.opacity
    });

    return (
      <Window
        {...cleanProps(props, MessageWindow.propTypes)}
        modal
        maximizable={false}
        style={style}
        className={className}
        title={this.renderTitle}
        renderFooter={this.renderFooter}
      />
    );
  }

  renderTitle(domProps) {
    domProps.children = [this.renderIcon(), this.props.title];
  }

  renderIcon() {
    if (!messageWindowTypes[this.props.type]) {
      return null;
    }
    let result;
    let domProps = {
      key: 'icon',
      size: this.props.iconSize,
      className: `${this.props.rootClassName}__icon`
    };

    if (this.props.icon) {
      if (typeof this.props.icon === 'function') {
        result = this.props.icon(domProps, this.props.type);
      } else {
        result = this.props.icon;
      }
    } else {
      const Icon = messageWindowTypes[this.props.type].icon;
      result = <Icon {...domProps} />;
    }

    return result;
  }

  renderFooter(pannelProps) {
    let buttons;

    if (this.props.buttons) {
      buttons = this.props.buttons;
    } else if (messageWindowTypes[this.props.type]) {
      buttons = messageWindowTypes[this.props.type].buttons.map(
        this.renderButton
      );
    } else {
      return null;
    }

    let domProps = {
      className: `${this.props.rootClassName}__footer`,
      children: buttons
    };

    let result;
    if (this.props.renderFooter) {
      result = this.props.renderFooter(domProps, this.props);
    }

    if (result == null) {
      result = <footer {...domProps} />;
    }

    return result;
  }

  renderButton(name) {
    const ButtonFactory = buttonMap[name];
    let buttonProps = {
      onClick: this.onButtonClick.bind(this, name),
      key: name,
      ...this.props[`${toLowerCaseFirst(name)}Props`],
      buttonLabel: this.props[`${toLowerCaseFirst(name)}Label`],
      className: join(
        `${this.props.rootClassName}__button`,
        `${this.props.rootClassName}__button--${toLowerCaseFirst(
          name.replace('Button', '')
        )}`
      )
    };

    let result;
    if (this.props.renderButton) {
      result = this.props.renderButton(buttonProps, name);
    }

    if (result == null) {
      result = <ButtonFactory {...buttonProps} />;
    }

    return result;
  }

  onButtonClick(name, event) {
    this.props[`on${name}Click`](name, event);

    if (this.props.dismissOnButtonClick) {
      this.props.onDismiss();
    }
  }
}

MessageWindow.defaultProps = {
  // misc
  rootClassName: 'zippy-react-toolkit-message-window',
  iconSize: 26,
  opacity: 1,
  dismissOnButtonClick: true,

  // window props
  maxSize: { height: 500, width: 450 },
  minSize: { width: 450, height: 170 },

  // type
  type: 'info',
  modal: false,
  defaultCentered: true,

  // footer and buttons
  onOkButtonClick: emptyFn,
  onCancelButtonClick: emptyFn,
  onNoButtonClick: emptyFn,
  onYesButtonClick: emptyFn,
  okButtonProps: null,
  cancelButtonProps: null,
  noButtonProps: null,
  yesButtonProps: null,
  buttonsAlign: 'center',
  collapsible: false,

  // onDismiss
  onDismiss: emptyFn
};

MessageWindow.propTypes = {
  // misc
  shouldComponentUpdate: PropTypes.func,
  onDismiss: PropTypes.func,
  icon: PropTypes.node,
  iconSize: PropTypes.number,
  opacity: PropTypes.number,
  buttonsAlign: PropTypes.oneOf([
    'start',
    'center',
    'end',
    'space-between',
    'space-around'
  ]),
  dismissOnButtonClick: PropTypes.bool,

  // type
  type: PropTypes.oneOf([
    'info',
    'warning',
    'question',
    'error',
    'yesNoCancel'
  ]),

  // footer and buttons
  onOkButtonClick: PropTypes.func,
  onCancelButtonClick: PropTypes.func,
  onNoButtonClick: PropTypes.func,
  onYesButtonClick: PropTypes.func,
  okButtonProps: PropTypes.object,
  cancelButtonProps: PropTypes.object,
  noButtonProps: PropTypes.object,
  yesButtonProps: PropTypes.object,

  okButtonLabel: PropTypes.node,
  cancelButtonLabel: PropTypes.node,
  noButtonLabel: PropTypes.node,
  yesButtonLabel: PropTypes.node,

  renderFooter: PropTypes.func,
  buttons: PropTypes.arrayOf(PropTypes.node)
};

export default MessageWindow;
