'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (constrainTo, domNode) {
  var constrainRegion = void 0;

  if (constrainTo === true) {
    constrainRegion = (0, _getViewportRegion2.default)();
  }

  if (!constrainRegion && typeof constrainTo === 'function') {
    constrainTo = _regionAlign2.default.from(constrainTo(domNode));
  }

  if (!constrainRegion && typeof constrainTo === 'string') {
    constrainTo = (0, _selectParent2.default)(constrainTo, domNode);
  }

  if (!constrainRegion && constrainTo) {
    constrainRegion = _regionAlign2.default.from(constrainTo);
  }

  return constrainRegion;
};

var _regionAlign = require('@zippytech/region-align');

var _regionAlign2 = _interopRequireDefault(_regionAlign);

var _selectParent = require('../selectParent');

var _selectParent2 = _interopRequireDefault(_selectParent);

var _getViewportRegion = require('../getViewportRegion');

var _getViewportRegion2 = _interopRequireDefault(_getViewportRegion);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }