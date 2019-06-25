import { initializeFirebase } from './push-notification';
import { askForPermissionToReceiveNotifications } from './push-notification';

initializeFirebase();

const askForPermission = function() {
  askForPermissionToReceiveNotifications();
}
