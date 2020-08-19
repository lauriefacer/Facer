/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Given a string value and a config with mask and maskDefinitions
 * will return a string where the mask is intersected with the value,
 * based on the maskedDefinition rules. Each character that matches
 * the un identified mask characters will be copied from the mask;
 *
 * Every character that matches the mask definition for each mask position
 * will replace the mask content.
 *
 * The first invalid character from value will stop the iteration and all
 * characters from the mask will be replaced with the maskFiller character
 *
 * @return Array[resultString, firstInvalidCharacterInValue]
 */
export default function getMaskedString(value = '', props = {}) {
  const { mask, maskDefinitions = {}, maskFiller = '_' } = props;

  if (!mask) {
    return [value, -1, -1];
  }

  const definitionKeys = Object.keys(maskDefinitions).filter(
    key => !!maskDefinitions[key]
  );
  if (!maskDefinitions || !definitionKeys.length) {
    return [mask, -1, -1];
  }

  if (typeof value !== 'string') {
    value = `${value}`;
  }

  const maskCharArray = mask.split('');
  const valueCharArray = value.split('');

  const result = maskCharArray.reduce(
    (accumulator, charFromMask, idx) => {
      const matchedDefinitionKey = ~definitionKeys.indexOf(charFromMask);

      if (matchedDefinitionKey) {
        const indexRelativeToValueArray = idx - accumulator.skippedChars;
        if (
          indexRelativeToValueArray < valueCharArray.length &&
          accumulator.invaidMaskIdx === -1
        ) {
          const valueAtCurrentIndex = valueCharArray[indexRelativeToValueArray];

          if (~valueAtCurrentIndex.search(maskDefinitions[charFromMask])) {
            accumulator.values.push(valueAtCurrentIndex);
          } else {
            accumulator.invaidMaskIdx = idx;
            accumulator.invalidValueIdx = indexRelativeToValueArray;
            accumulator.values.push(maskFiller);
          }
        } else {
          // value does not reach the current mask character
          // the character is matched by a definition
          accumulator.values.push(maskFiller);
        }
      } else {
        accumulator.skippedChars++;
        // mask contains element that is not part of the definition
        accumulator.values.push(charFromMask);
      }

      return accumulator;
    },
    { values: [], invaidMaskIdx: -1, skippedChars: 0 }
  );

  return [result.values.join(''), result.invalidValueIdx, result.invaidMaskIdx];
}

const getValueCharCountInMask = (mask, maskDefinitions) => {
  if (!mask) {
    return 0;
  }

  const definitionKeys = Object.keys(maskDefinitions).filter(
    key => !!maskDefinitions[key]
  );

  if (!maskDefinitions || !definitionKeys.length) {
    return mask.length;
  }

  return mask.split('').reduce((valueCharCount, charFromMask) => {
    if (~definitionKeys.indexOf(charFromMask)) {
      valueCharCount++;
    }

    return valueCharCount;
  }, 0);
};

/**
 * given a new string value, a mask and mask definition, it will return
 * the position in the mask where the next value is or the end of the mask.
 *
 * Used to figure out where to place the cursor in the masked string while
 * typing.
 */
const getPositionInMaskedStringBasedOnValue = (value = '', props = {}) => {
  const { mask, maskDefinitions = {} } = props;

  if (!mask) {
    return -1;
  }

  const definitionKeys = Object.keys(maskDefinitions).filter(
    key => !!maskDefinitions[key]
  );

  if (!maskDefinitions || !definitionKeys.length) {
    return -1;
  }

  const maskCharArray = mask.split('');

  const result = maskCharArray.reduce(
    (accumulator, charFromMask, idx) => {
      const matchedDefinitionKey = ~definitionKeys.indexOf(charFromMask);
      const valueAtIndex = value[accumulator.valueIterator];

      if (matchedDefinitionKey) {
        if (valueAtIndex) {
          accumulator.valueIterator++;
        } else {
          accumulator.keepCounting = false;
        }
      } else {
        if (accumulator.keepCounting) {
          accumulator.skippedMaskedChars++;
        }
      }

      return accumulator;
    },
    { valueIterator: 0, skippedMaskedChars: 0, keepCounting: true }
  );

  return result.valueIterator + result.skippedMaskedChars;
};

const countPositionsWithFillerValues = ({
  maskCharArray,
  definitionKeys,
  maskDefinitions,
  start,
  end
}) => {
  return maskCharArray.slice(start, end).reduce((count, maskChar, index) => {
    if (definitionKeys.indexOf(maskChar) === -1) {
      count++;
    }
    return count;
  }, 0);
};

const getValueSelectionRangeFromMaskedSelectionRange = (
  value = '',
  props = {}
) => {
  const { start = 0, end = 0, mask, maskDefinitions = {} } = props;

  if (!mask) {
    return [-1, -1];
  }

  const definitionKeys = Object.keys(maskDefinitions).filter(
    key => !!maskDefinitions[key]
  );

  if (!maskDefinitions || !definitionKeys.length) {
    return [-1, -1];
  }

  const maskCharArray = mask.split('');

  const fillersTillStart = countPositionsWithFillerValues({
    maskCharArray,
    definitionKeys,
    maskDefinitions,
    start: 0,
    end: start
  });

  const fillersBetweenStartTillEnd = countPositionsWithFillerValues({
    maskCharArray,
    definitionKeys,
    maskDefinitions,
    start,
    end
  });

  const realValuesBeforeStart = start - fillersTillStart;
  const realValuesBetween = end - start - fillersBetweenStartTillEnd;

  let computedStartRangeInValue = realValuesBeforeStart;
  let computedEndRangeInValue = realValuesBetween + realValuesBeforeStart;

  if (realValuesBeforeStart > value.length) {
    computedStartRangeInValue = 0;
  }

  if (computedEndRangeInValue > value.length) {
    computedEndRangeInValue = value.length;
  }

  return [computedStartRangeInValue, computedEndRangeInValue];
};

const getPreviousRealValuePosition = (posInMask = 0, props = {}) => {
  if (!posInMask) {
    return 0;
  }

  const { mask, maskDefinitions = {} } = props;

  if (!mask) {
    return 0;
  }

  const definitionKeys = Object.keys(maskDefinitions).filter(
    key => !!maskDefinitions[key]
  );

  if (!maskDefinitions || !definitionKeys.length) {
    return 0;
  }

  const subMaskChars = mask
    .substring(0, posInMask)
    .split('')
    .reverse();

  const result = subMaskChars.reduce(
    (accumulator, charFromMask, index) => {
      const { found, position } = accumulator;
      if (!found) {
        if (definitionKeys.indexOf(charFromMask) !== -1) {
          accumulator.found = true;
          accumulator.position = subMaskChars.length - index - 1;
        }
      }

      return accumulator;
    },
    { position: 0, found: false }
  );

  return result.position;
};

const getNextRealValuePosition = (posInMask = 0, props = {}) => {
  posInMask = posInMask || 0;

  const { mask, maskDefinitions = {} } = props;

  if (!mask) {
    return 0;
  }

  const definitionKeys = Object.keys(maskDefinitions).filter(
    key => !!maskDefinitions[key]
  );

  if (!maskDefinitions || !definitionKeys.length) {
    return 0;
  }

  const subMaskChars = mask.substring(posInMask + 1).split('');

  if (subMaskChars.length === 0) {
    return posInMask + 1;
  }

  const result = subMaskChars.reduce(
    (accumulator, charFromMask, index) => {
      const { found, position } = accumulator;
      if (!found) {
        if (definitionKeys.indexOf(charFromMask) !== -1) {
          accumulator.found = true;
          accumulator.position = posInMask + index + 1;
        }

        if (index === subMaskChars.length) {
          accumulator.position = index;
        }
      }

      return accumulator;
    },
    { position: mask.length, found: false }
  );

  return result.position;
};

export {
  getPositionInMaskedStringBasedOnValue,
  getMaskedString,
  getValueSelectionRangeFromMaskedSelectionRange,
  getPreviousRealValuePosition,
  getNextRealValuePosition,
  getValueCharCountInMask
};
