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
  millisecondText: 'ms',
  secondText: 's',
  minuteText: 'm',
  hourText: 'h',
  dayText: 'd',
  showMilliseconds: false,
  showSeconds: true,
  showMinutes: true,
  showHours: true,
  collapseHalfUnits: true,
  separator: ' ',
  formatNumber
};

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;

export function getMSString(parsedTime, config) {
  let result = '';
  if (config.showMilliseconds && config.showSeconds && config.showMinutes) {
    result = `${parsedTime.mseconds}${config.millisecondText}`;
  }
  return result;
}

function secondsAreNotLastEntry(parsedTime, config) {
  return (
    (parsedTime.minutes || parsedTime.hours || parsedTime.days) &&
    (config.showMinutes || config.showHours || config.showDays)
  );
}

export function getSecondsString(parsedTime, config) {
  let result = '';
  if (config.showSeconds && config.showMinutes) {
    let seconds = parsedTime.seconds;

    if (parsedTime.mseconds && !config.showMilliseconds) {
      seconds = seconds + parsedTime.mseconds / 1000;
      if (secondsAreNotLastEntry(parsedTime, config)) {
        seconds = Math.round(seconds);
      }
    }

    if (seconds) {
      result = `${formatNumber(seconds)}${config.secondText}${
        config.showMilliseconds ? config.separator : ''
      }`;
    }
  }
  return result;
}

function minutesAreNotLastEntry(parsedTime, config) {
  return (
    (parsedTime.hours || parsedTime.days) &&
    (config.showHours || config.showDays)
  );
}

function minutesAreFirstEntry(parsedTime, config) {
  return !(config.showSeconds || config.showMilliseconds);
}

export function getMinutesString(parsedTime, config) {
  let result = '';
  if (config.showMinutes) {
    let minutes = parsedTime.minutes;

    if (minutesAreFirstEntry(parsedTime, config)) {
      // minutes never show decimals
      minutes = Math.round(
        minutes + parsedTime.seconds / 60 + parsedTime.mseconds / 1000
      );
    }

    if (minutes) {
      result = `${formatNumber(minutes)}${config.minuteText}${
        config.showSeconds ? config.separator : ''
      }`;
    }
  }
  return result;
}

function hoursAreNotLastEntry(parsedTime, config) {
  return parsedTime.days && config.showDays;
}

export function getHoursString(parsedTime, config) {
  let result = '';
  if (config.showHours) {
    let hours = parsedTime.hours;

    if (!config.showMinutes) {
      hours = hours + parsedTime.minutes / 60 + parsedTime.seconds / 3600;
      hours = Math.round(hours * 10) / 10;
    }

    if (hours) {
      result = `${formatNumber(hours)}${config.hourText}${
        config.showMinutes ? config.separator : ''
      }`;
    }
  }
  return result;
}

export function getDaysString(parsedTime, config) {
  let result = '';
  let days = parsedTime.days;

  if (!config.showHours) {
    days = days + parsedTime.hours / 24 + parsedTime.minutes / (24 * 60);
    days = Math.round(days * 10) / 10;
  }

  if (days) {
    result = `${formatNumber(days)}${config.dayText}${
      config.showHours ? config.separator : ''
    }`;
  }
  return result;
}

/**
 * @pulbic timeFormatter
 *
 * formats the given time parameter into a pretty format based
 * on config parameter.
 *
 * @param time {mixted} can be the time in ms for now
 * @param config {object} composed of:
 *
 *   - @param config.millisecondText default 'ss', the text for milliseconds
 *   - @param config.secondText default 's', the text for seconds
 *   - @param config.minuteText default 'm', the text for minutes
 *   - @param config.hourText default 'h', the text for hours
 *   - @param config.dayText default 'd', the text for days
 *   - @param config.showMilliseconds default true, show/hide milliseconds
 *   - @param config.showSeconds default true, show/hide seconds and milliseconds
 *   - @param config.showMinutes default true, show/hide minutes, seconds, ms
 *   - @param config.collapseHalfUnits default true, round up smallest dispalyed value
 *   - @param config.locale, custom locale param passed to number.toLocaleStrings(locale)
 *   - @param config.formatNumber, custom number format function, used internally by
 *     the formatter
 */
export default function timeFormatter(time, config = {}) {
  const {
    millisecondText,
    secondText,
    minuteText,
    hourText,
    dayText,
    showMilliseconds,
    showSeconds,
    showMinutes,
    collapseHalfUnits,
    formatNumber,
    locale
  } = (config = {
    ...defaultProps,
    ...config
  });

  const digitsCount = time.toString().length;

  const days = Math.floor(time / day);
  const timeWithoutDays = time - days * day;

  const hours = Math.floor(timeWithoutDays / hour);
  const timeWithoutDaysAndHours = timeWithoutDays - hours * hour;

  const minutes = Math.floor(timeWithoutDaysAndHours / minute);
  const timeWithoutDaysHoursAndMinutes =
    timeWithoutDaysAndHours - minutes * minute;

  const seconds = Math.floor(timeWithoutDaysHoursAndMinutes / second);
  const mseconds = timeWithoutDaysHoursAndMinutes - seconds * second;

  const parsedTime = {
    mseconds,
    seconds,
    minutes,
    hours,
    days
  };

  const msString = getMSString(parsedTime, config);
  const secondsString = getSecondsString(parsedTime, config);
  const minutesString = getMinutesString(parsedTime, config);
  const hoursString = getHoursString(parsedTime, config);
  const daysString = getDaysString(parsedTime, config);
  return `${daysString}${hoursString}${minutesString}${secondsString}${msString}`;
}

const secondsFormatter = (seconds, config) => {
  return timeFormatter(seconds * 1000, config);
};

export { timeFormatter };
