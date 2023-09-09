/* eslint-disable */
export default function showAlert(msg, type = 'success') {
  removeAlert();
  const alertTag = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', alertTag);
  removeAlert(5000);
}

export function removeAlert(timeout = 0) {
  const alertTag = document.querySelector('.alert');
  setInterval(() => {
    if (alertTag && alertTag?.parentElement)
      alertTag.parentElement.removeChild(alertTag);
  }, timeout);
}
