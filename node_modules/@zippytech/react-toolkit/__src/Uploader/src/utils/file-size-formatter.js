/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const formatNumber = (number, locale) =>
  number.toLocaleString(locale, {
    maximumFractionDigits: 2
  });

const defaultProps = {
  gbSingular: 'GB',
  gbPlural: 'GBs',
  mbSingular: 'MB',
  mbPlural: 'MBs',
  kbSingular: 'KB',
  kbPlural: 'KBs',
  byteSingular: 'B',
  bytePlural: 'Bs',
  formatNumber
};

const KB = 1024;
const MB = 1024 * KB;
const GB = 1024 * MB;

export default function fileSizeFormatter(size = 0, config = {}) {
  const {
    gbSingular,
    gbPlural,
    mbSingular,
    mbPlural,
    kbSingular,
    kbPlural,
    byteSingular,
    bytePlural,
    formatNumber,
    locale
  } = {
    ...defaultProps,
    ...config
  };

  const isByte = size === 0 || size === 1;
  const isBytes = size < KB;
  const isKByte = size === KB;
  const isKBytes = size < MB;
  const isMB = size === MB;
  const isMBs = size < GB;
  const isGByte = size === GB;
  const isGBytes = size > GB;

  let suffix;

  if (isByte) {
    suffix = byteSingular;
  } else if (isBytes) {
    suffix = bytePlural;
  } else if (isKByte) {
    suffix = kbSingular;
    size = size / KB;
  } else if (isKBytes) {
    suffix = kbPlural;
    size = size / KB;
  } else if (isMB) {
    suffix = mbSingular;
    size = size / MB;
  } else if (isMBs) {
    suffix = mbPlural;
    size = size / MB;
  } else if (isGByte) {
    suffix = gbSingular;
    size = size / GB;
  } else if (isGBytes) {
    suffix = gbPlural;
    size = size / GB;
  }

  return `${formatNumber(size, locale)}${suffix}`;
}

export { formatNumber };
