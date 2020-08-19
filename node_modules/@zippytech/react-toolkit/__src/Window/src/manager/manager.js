/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import getListDiff from './getListDiff';
import bringToFront from './bringToFront';
import sendToBack from './sendToBack';
import bringForwards from './bringForwards';
import sendBackwards from './sendBackwards';
import getTopModalWindow from './getTopModalWindow';

/**
 * Manages zIndex for windows
 * - a window registers and gets back an id, that it saves
 * - manager calls windows with it's zIndex when it Registers
 * or when a change in order has happened
 * - zIndex is calculated idList.indexOf(id) + 1 * 10
 */
function manager() {
  const initialId = 0;
  const defaultNameSpace = 'all';
  let step = 10;
  let startFrom = 100;

  let id = initialId;

  return {
    _windows: {},

    updateStartFrom(index, nameSpace = defaultNameSpace) {
      startFrom = index;
      this.ajustZIndex(nameSpace, true);
    },

    updateStep(index, nameSpace = defaultNameSpace) {
      step = index;
      this.ajustZIndex(nameSpace, true);
    },

    /**
     * Registers window
     * @param {Object} instance
     * @return {Int} Id
     */
    register(instance, nameSpace = defaultNameSpace) {
      if (!this._windows[nameSpace]) {
        this._windows[nameSpace] = {
          nameSpace,
          list: [],
          previousList: [],
          instances: {},
          previousTop: null,
          previousTopModal: null
        };
      } else {
        // save in previous
        this.saveCurrentListToPrevious(nameSpace);
      }

      this._windows[nameSpace].instances[id] = instance;
      const newList = [...this.getList(nameSpace), id];

      this.updateList(newList, nameSpace);
      this.ajustZIndex(nameSpace, true);

      const currentId = id;
      id += 1;

      return currentId;
    },

    unRegister(id, nameSpace = defaultNameSpace) {
      if (!this._windows[nameSpace].instances[id]) {
        return null;
      }

      // save in previous
      this.saveCurrentListToPrevious(nameSpace);

      delete this._windows[nameSpace].instances[id];
      // filter out id to remove
      const newList = this.getList(nameSpace).reduce((acc, el) => {
        if (el !== id) {
          acc.push(el);
        }

        return acc;
      }, []);

      this.updateList(newList, nameSpace);
      this.ajustZIndex(nameSpace);

      return true;
    },

    getList(nameSpace = defaultNameSpace) {
      return this._windows[nameSpace].list;
    },

    getInstances(nameSpace = defaultNameSpace) {
      return this._windows[nameSpace].instances;
    },

    saveCurrentListToPrevious(nameSpace = defaultNameSpace) {
      let previousList = this.getPreviousList(nameSpace);
      this._windows[nameSpace].previousList = this.getList(nameSpace);
    },

    getPreviousList(nameSpace = defaultNameSpace) {
      return this._windows[nameSpace].previousList;
    },

    updateList(list, nameSpace = defaultNameSpace) {
      this._windows[nameSpace].list = list;
    },

    bringToFront(id, nameSpace = defaultNameSpace) {
      const newList = bringToFront(id, this.getList(nameSpace));

      this.saveCurrentListToPrevious(nameSpace);
      this.updateList(newList, nameSpace);
      this.ajustZIndex(nameSpace);
    },

    sendToBack(id, nameSpace = defaultNameSpace) {
      const newList = sendToBack(id, this.getList(nameSpace));

      this.saveCurrentListToPrevious(nameSpace);
      this.updateList(newList, nameSpace);
      this.ajustZIndex(nameSpace);
    },

    bringForwards(id, nameSpace = defaultNameSpace) {
      const newList = bringForwards(id, this.getList(nameSpace));

      this.saveCurrentListToPrevious(nameSpace);
      this.updateList(newList, nameSpace);
      this.ajustZIndex(nameSpace);
    },

    sendBackwards(id, nameSpace = defaultNameSpace) {
      const newList = sendBackwards(id, this.getList(nameSpace));

      this.saveCurrentListToPrevious(nameSpace);
      this.updateList(newList, nameSpace);
      this.ajustZIndex(nameSpace);
    },

    /**
     * Checks list with previusList to see
     * what has changed. Changed windows,
     * that are not in the same position
     * in the list will be called with window.setZIndex
     * to update their zIndexes
     * @param {Object} registered windows
     * @param {Boolean} ajustAll - wether to update all windows
     * @instance getListDiff
     * @return {Bool} true if something changed, false if not
     */
    ajustZIndex(nameSpace = defaultNameSpace, ajustAll = true) {
      const { list, previousList, instances } = this.getWindows(nameSpace);

      const changedWindows = ajustAll ? list : getListDiff(list, previousList);

      changedWindows.forEach(id => this.refreshWindow(id, nameSpace));
    },

    refreshWindow(id, nameSpace = defaultNameSpace) {
      const { list, previousList, instances } = this.getWindows(nameSpace);

      const topWindow = list[list.length - 1];
      const topModalWindow = getTopModalWindow(
        list,
        this.getInstances(nameSpace)
      );
      const instance = instances[id];

      if (instance && instance.setZIndex) {
        const zIndex = this.getZIndex(id, nameSpace);
        const isTop = id === topWindow;
        const isTopModal = id === topModalWindow;

        instance.setZIndex({ zIndex, isTop, isTopModal });
      }
    },

    /**
     * It is just it's index inside the list of ids
     * @param {Int} id
     * @return zIndex
     */
    getZIndex(id, nameSpace = defaultNameSpace) {
      if (!this._windows[nameSpace]) {
        return null;
      }
      const windowIndex = this._windows[nameSpace].list.indexOf(id);
      return (windowIndex + 1) * step;
    },

    /**
     * @param {Int} id
     * @param {String} nameSpace?
     * @return {instance} registered instance or null
     */
    getWindow(id, nameSpace = defaultNameSpace) {
      const windows = this.getWindows(nameSpace);
      return (windows && windows.instances[id]) || null;
    },

    getWindows(nameSpace = defaultNameSpace) {
      return this._windows[nameSpace];
    },

    reset() {
      this._windows = {};
      id = initialId;
    }
  };
}

export default manager();
