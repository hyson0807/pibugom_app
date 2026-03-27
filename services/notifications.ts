// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Notifications: any = null;

if (!__DEV__) {
  Notifications = require("expo-notifications");

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export { Notifications };
