import { initializeFirebase, askForPermissionToReceiveNotifications } from './push-notification';

initializeFirebase();

const askForPermission = function() {
  askForPermissionToReceiveNotifications();
}