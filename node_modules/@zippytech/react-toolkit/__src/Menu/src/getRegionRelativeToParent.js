/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Region from '@zippytech/region-align';
import selectParent from '../../common/selectParent';

function getRegionRelativeToParent(child, prentClassName) {
  const parent = selectParent(`.${prentClassName}`, child);
  const menuRegion = Region.from(parent);
  const thisRegion = Region.from(child);
  return {
    left: thisRegion.left - menuRegion.left,
    top: thisRegion.top - menuRegion.top,
    width: thisRegion.width,
    height: thisRegion.height
  };
}

export default getRegionRelativeToParent;
