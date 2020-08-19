# [Zippytech React Toolkit](https://www.zippytech.io)

> Professionally Built React Components - Made the React Way

## Purpose

The purpose of the `React Toolkit (@zippytech/react-toolkit)` is to provide a set of high-quality open-source UI components built with React that can be easily composed to build professional-grade apps.

## Installation

**Zippytech React Toolkit** is distributed via **npm**. So getting started is as easy as:

```sh
$ npm install @zippytech/react-toolkit --save
```

or, if you're using yarn

```sh
$ yarn add @zippytech/react-toolkit
```

See the [Installation page](https://docs.zippytech.io/overview/introduction#installation) for more details.

## List of Components

Find [our open-source components](https://www.zippytech.io/#opensource) below:

* [Accordion](https://docs.zippytech.io/accordion)
* [Autocomplete](https://docs.zippytech.io/combobox/autocomplete/)
* [Button](https://docs.zippytech.io/button)
* [ButtonGroup](https://docs.zippytech.io/buttongroup)
* [Calendar](https://docs.zippytech.io/calendar)
* [CheckBox](https://docs.zippytech.io/checkbox)
* [ComboBox](https://docs.zippytech.io/combobox)
* ColorPicker - SOON
* [DateInput](https://docs.zippytech.io/dateinput)
* [Dropdown](https://docs.zippytech.io/combobox/dropdown/)
* [DropdownButton](https://docs.zippytech.io/dropdownbutton)
* [LoadMask](https://docs.zippytech.io/loadmask)
* [MaskedInput](https://docs.zippytech.io/maskedinput)
* [Menu](https://docs.zippytech.io/menu)
* [MessageWindow](https://docs.zippytech.io/messagewindow)
* [Multiselect](https://docs.zippytech.io/combobox/multiselect)
* [Notification](https://docs.zippytech.io/notification)
* [NumericInput](https://docs.zippytech.io/numericinput)
* [Panel](https://docs.zippytech.io/panel)
* [ProgressBar](https://docs.zippytech.io/progressbar)
* [RadioButtonGroup](https://docs.zippytech.io/radiobuttongroup)
* [Slider](https://docs.zippytech.io/slider)
* [SplitButton](https://docs.zippytech.io/splitbutton)
* [SplitContainer](https://docs.zippytech.io/splitcontainer)
* [TabPanel](https://docs.zippytech.io/tabpanel)
* [Toolbar](https://docs.zippytech.io/toolbar)
* [Tooltip](https://docs.zippytech.io/tooltip)
* [TreeView](https://docs.zippytech.io/treeview)
* [Uploader](https://docs.zippytech.io/uploader)
* [Window](https://docs.zippytech.io/window)

Additionally, we're offering two commercial components:

* [DataGrid](https://docs.zippytech.io/datagrid)
* [Scheduler](https://www.zippytech.io/#components)

For the commercial components, please see [our website](https://www.zippytech.io) for more details.

## [Documentation](https://docs.zippytech.io)

We offer [**complete documentation**](https://docs.zippytech.io) about all our components. The documentation contains both usage examples and explanations for common usage patterns, as well as API documentation for each prop supported by the components.

## [Demo app](https://demos.zippytech.io/crm)

If you want to get a taste of what you can build by **only using our components**, see our [demo app](https://demos.zippytech.io/crm) - we're open sourcing the source code of the app soon.

## Features

When we started building the toolkit, we've made a checklist of features that our components need to include out-of-the-box:

* **Performance** - a component is only useful if it's zippy. Performance is generally not a concern with smaller components like buttons, dialogs, color pickers, etc - but menus, lists and grids need a lot of performance considerations in order to be really snappy. On the other hands, when we built the [demo app](https://demos.zippytech.io/crm) we found out that even small components, can cause performance problems when used in a complex app, with a lot of DOM nesting. Therefore, all components need to carefully consider their interaction with the DOM - even in the case of React. We've made the extra step to build the [demo app](https://demos.zippytech.io/crm) for the very purpose of making sure all components play nice with each-other.
* **Simplicity** - components need to be simple to use in the most common scenario. For this, default values for components have been carefully considered, so you need to add a minimum of code when you want to add some custom property and/or logic.
  Look & feel - by default, components need to look carefully crafted & pretty. This leads us to the next consideration, which is:
* **Theming** - all components need to have an easy to understand theming mechanism. We're well aware of the shift to css-in-js, css modules and inline-styling, but for the purpose of reusable components and simplicity everyone can understand, we've decided to stick with the BEM methodology. In this way, when you choose **Zippytech React Toolkit** you're free to keep your existing styling solution in your app.
* **Functionality** - the most common usage patterns for a component should be already built-in. For example, you should be able to easily configure a menu for single selection or a Window to resize proportionally.
* **Flexibility & extensibility** - all components need to be very flexible in adapting to a wide spectrum of needs. Changing some styles, replacing some rendering logic or adding a custom validation should all be possible and easily achievable.
* **Consistency** - designing components that work well with each other is crucial. You'll probably find many excellent but singular UI components - but a consistent & coherent toolkit does make a difference in how fast you can develop your app.
* **RTL** - right-to-left support is very spotty in open-source UI components. We're trying to fix that.

## License

#### [MIT](./LICENSE)
