/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Region from '@zippytech/region';

function getRelativeRegion(domNode) {
  const parentRegion = Region.from(domNode.parentNode);
  const region = Region.from(domNode);

  region.shift({
    left: -parentRegion.left,
    top: -parentRegion.top
  });

  return region;
}

export default getRelativeRegion;
