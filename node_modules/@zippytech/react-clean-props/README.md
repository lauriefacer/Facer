# react-clean-props

## Install

```sh
$ npm install @zippytech/react-clean-props
```

## Usage

```js
import cleanProps from '@zippytech/react-clean-props'

class App extends React.Component {
  render() {
    const props = cleanProps(this.props, App.propTypes)
    return <div {...props} />
  }
}

App.propTypes = {
  // all your component props go here
}
```

## LICENSE

#### [Apache2](./LICENSE)
