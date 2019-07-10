let allowButton = null;
let cancelButton = null;
let bodyMessage = null;
let icon = null;

window.addEventListener('message', event => {
  console.log('Iframe', event);
  switch (event.data.action) {
    case 'init':
      allowButton.innerHTML = event.data.content.allowButton;
      cancelButton.innerHTML = event.data.content.cancelButton;
      bodyMessage.innerHTML = event.data.content.message;
      icon.src = event.data.content.icon;
      break;
  }
}, false);

var sendMessage = function (msg) {
  // Make sure you are sending a string, and to stringify JSON
  window.parent.postMessage(msg, '*');
};

document.addEventListener('DOMContentLoaded', function(event) {
  allowButton = document.getElementById('movalio-popover-allow-button');
  cancelButton = document.getElementById('movalio-popover-cancel-button');
  bodyMessage = document.getElementsByClassName('popover-body-message')[0];
  icon = document.getElementById('movalio-popover-icon');

  allowButton.addEventListener('click', e => {
    let container = document.getElementById('movalio-popover-container');
    container.classList.add('close-popover');
    sendMessage({ action: 'allow' });
  }, false);

  cancelButton.addEventListener('click', e => {
    let container = document.getElementById('movalio-popover-container');
    container.classList.add('close-popover');
    sendMessage({ action: 'not-allow' });
  }, false);
});
