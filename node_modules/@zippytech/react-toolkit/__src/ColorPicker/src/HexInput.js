import React, { Component } from 'react';
import { toHsv, toRgb, rgbToHex, isValidColor } from './utils/color';
import TextInput from '../../TextInput';

class HexInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      intermediateValue: null
    };
  }
  componentDidUpdate(prevProps) {
    const prevValue = prevProps.value;
    const currentValue = this.props.value;

    if (prevValue !== currentValue) {
      this.setState({
        value: this.props.value
      });
    }
  }

  render() {
    const { props } = this;

    const displayedValue =
      this.state.intermediateValue != null
        ? this.state.intermediateValue
        : this.state.value;

    return (
      <TextInput
        enableClearButton={false}
        value={displayedValue}
        className={`${props.rootClassName}__input ${
          props.rootClassName
        }__input--hexa`}
        onChange={value => this.handleChange(value)}
      />
    );
  }

  handleChange(value) {
    this.setState({
      intermediateValue: value
    });

    if (isValidColor(value)) {
      const color = toRgb(value);
      this.props.onChange(color);
    }
  }
}

export default HexInput;
