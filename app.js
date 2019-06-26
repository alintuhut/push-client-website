import { initializeFirebase, askForPermissionToReceiveNotifications } from './push-notification';

initializeFirebase();

const askForPermission = () => {
  askForPermissionToReceiveNotifications();
}