import React, { Component } from 'react';
import NumericInput from '../../NumericInput';

class RgbaInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      focused: false,
      intermediateValue: null
    };

    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  render() {
    const {
      minValue,
      maxValue,
      allowFloat,
      value,
      rootClassName,
      name,
      step
    } = this.props;
    const { intermediateValue } = this.state;

    return (
      <NumericInput
        minValue={minValue}
        maxValue={maxValue}
        allowFloat={allowFloat}
        enableClearButton={false}
        step={step}
        value={
          this.state.focused
            ? intermediateValue == null ? value : intermediateValue
            : value
        }
        className={`${rootClassName}__input ${rootClassName}__input--${name}`}
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
      />
    );
  }

  handleFocus() {
    this.setState({
      focused: true
    });
  }

  handleBlur() {
    this.setState({
      focused: false
    });
  }

  handleChange(value) {
    this.setState({
      intermediateValue: value || ''
    });

    this.props.onChange(value || 0);
  }
}

export default RgbaInput;
