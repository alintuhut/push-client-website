<template>
  <div>Hello pusher</div>
</template>

<script>
import { initializeFirebase, askForPermissionToReceiveNotifications } from './push-notification';

export default {

  computed: {

  },

  methods: {

  },

  created() {
    initializeFirebase();
  }
}
</script>
