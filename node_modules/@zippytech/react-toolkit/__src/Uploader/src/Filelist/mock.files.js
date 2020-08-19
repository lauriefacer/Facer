/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const PNGFile = {
  name: 'screenshot.png',
  size: 1024 * 1024 + 10,
  id: 1
};

const JPGFile = {
  name: 'wallpaper.jpg',
  size: 1024 * 1024 + 10,
  id: 2
};

const PDFile = {
  name: 'invoice-ducument.pdf',
  size: 1024 * 1024 * 5,
  id: 3
};

const SVGFile = {
  name: 'vector-icon.svg',
  size: 1024 * 1024 * 5,
  id: 4
};

const MOVFile = {
  name: 'night-of-the-living-dead.mov',
  size: 1024 * 1024 * 2000,
  id: 5
};

const TORRENTFile = {
  name: 'night-of-the-living-dead.torrent',
  size: 1024 * 35,
  id: 6
};

const files = [PNGFile, JPGFile, PDFile, SVGFile, MOVFile, TORRENTFile];

export { files, PNGFile, JPGFile, PDFile, SVGFile, MOVFile, TORRENTFile };
