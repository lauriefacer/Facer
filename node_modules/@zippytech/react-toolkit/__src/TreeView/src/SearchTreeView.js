/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TreeView from './TreeView';
import autoBind from '@zippytech/react-class/autoBind';
import join from '../../common/join';
import cleanProps from '../../common/cleanProps';
import constructMatchText from './utils/constructMatchText';

class ZippySearchTreeView extends Component {
  constructor(props) {
    super(props);
    autoBind(this);

    this.state = {
      searchText: props.defaultSearchText
    };
  }

  render() {
    let result;
    const { props } = this;
    let className = join(this.props.className, props.rootClassName);

    const searchText = this.getSearchText();
    const regex = (this.regex = new RegExp(searchText, 'gi'));

    let filter = this.props.filter;

    if (searchText && !filter) {
      filter = ({ node }) =>
        node.label && node.label.match && node.label.match(regex);
    }

    let input = this.renderInput();
    let tree = (
      <TreeView
        {...cleanProps(this.props, ZippySearchTreeView.propTypes)}
        ref={el => (this.treeView = el)}
        className={className}
        renderNodeText={this.renderNodeText}
        filter={filter}
      />
    );

    /**
     * If filter is defined, it should
     * just render the tree-view naked
     * as the client should handle filter function.
     */
    if (input && !this.props.filter) {
      result = (
        <div {...this.wrapperProps}>
          {input}
          {tree}
        </div>
      );
    } else {
      result = tree;
    }

    return result;
  }

  renderInput() {
    let result;
    let inputProps = {
      className: `${this.props.rootClassName}__input`,
      value: this.getSearchText(),
      onChange: this.onSearchTextChange
    };

    if (this.props.renderInput) {
      result = this.props.renderInput(inputProps, this.props);
    }

    if (result === undefined) {
      result = <input {...inputProps} />;
    }

    return result;
  }

  renderNodeText(domProps, nodeProps) {
    const searchText = this.getSearchText();
    if (searchText.length && !this.props.filter) {
      const { node } = nodeProps;
      const matchFound =
        node.label && node.label.match && node.label.match(this.regex);

      if (!matchFound) {
        if (this.props.renderNodeText) {
          return this.props.renderNodeText(domProps, nodeProps);
        }
        return undefined;
      }

      const matchArray = constructMatchText(node.label, this.regex, searchText);

      const key = nodeProps.path;
      if (this.props.renderNodeText) {
        nodeProps = { ...nodeProps, matchText: matchArray };
        return this.props.renderNodeText(domProps, nodeProps);
      }

      return (
        <div {...domProps} key={key}>
          {matchArray.map((text, index) => {
            if (typeof text === 'object') {
              return (
                <span
                  key={index}
                  className={`${this.props.rootClassName}__hightlight`}
                >
                  {text.match}
                </span>
              );
            }
            /**
             * If the text is without wrapper react will add white space
             * with html comments, this will add extra space because
             * node-text has css props `white-space: pre` so space is not collpased
             * when highlighted subtring has space
             */
            return (
              <span
                key={index}
                className={`${this.props.rootClassName}__non_hightlight`}
              >
                {text}
              </span>
            );
          })}
        </div>
      );
    } else {
      if (this.props.renderNodeText) {
        return this.props.renderNodeText(domProps, nodeProps);
      }
    }
  }

  onSearchTextChange(event) {
    const value = event.target.value;

    this.props.onSearchTextChange(value);

    if (!this.isSearchTextControlled()) {
      this.setState({
        searchText: value
      });
    }
  }

  getSearchText() {
    return this.isSearchTextControlled()
      ? this.props.searchText
      : this.state.searchText;
  }

  isSearchTextControlled() {
    return this.props.searchText !== undefined;
  }

  getTreeViewInstance() {
    return this.treeView;
  }

  isSearchActive() {
    return this.getSearchText() !== '';
  }
}

ZippySearchTreeView.defaultProps = {
  rootClassName: 'zippy-react-toolkit-search-tree-view',
  defaultSearchText: '',
  wrapperProps: {},
  onSearchTextChange: () => {}
};

ZippySearchTreeView.propTypes = {
  rootClassName: PropTypes.string,
  searchText: PropTypes.string,
  filter: PropTypes.func,
  defaultSearchText: PropTypes.string,
  onSearchTextChange: PropTypes.func,
  wrapperProps: PropTypes.object
};

export default ZippySearchTreeView;
