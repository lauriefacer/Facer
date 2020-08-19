/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

console.log('setting up enzyme!!!');
Enzyme.configure({ adapter: new Adapter() });
