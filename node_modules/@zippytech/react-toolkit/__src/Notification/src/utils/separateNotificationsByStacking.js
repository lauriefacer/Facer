/**
 * Copyright (c) 2015-present, Zippy Technologies
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Separates a list o notifications into two lists.
 * One that matches a stacking and the other list
 * the rest of the notificationt
 * @param  {[type]} notifications [description]
 * @param  {[type]} stack         [description]
 * @return {[type]}               [description]
 */
const separateNotificationsByStacking = ({ notifications, stacking }) => {
  const formatedStacking = stacking.join('-');

  return notifications.reduce(
    (acc, notification) => {
      // if is closed it must be excluded for filtered stack
      if (
        notification.stacking.join('-') === formatedStacking &&
        !notification.closed
      ) {
        acc.filteredNotifications.push(notification);
      } else {
        acc.otherNotifications.push(notification);
      }
      return acc;
    },
    { filteredNotifications: [], otherNotifications: [] }
  );
};

export default separateNotificationsByStacking;
