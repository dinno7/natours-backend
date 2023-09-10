/* eslint-disable */
import axios from 'axios';

import showAlert from './alert';

export async function updateUser(data) {
  try {
    const readableData = Object.fromEntries(data);
    if (Object.keys(readableData).length) {
      const res = await axios.patch('/api/v1/users/updateMe', data);

      if (res.data.ok) {
        showAlert('Updated successfully', 'success');
        setTimeout(() => {
          location.reload(true);
        }, 1000);
      }
    }
  } catch (error) {
    return showAlert(error.response.data.message, 'error');
  }
}

export async function updateUserPassword(
  currentPassword = '',
  newPassword = '',
  newPasswordConfirm = '',
) {
  if (!currentPassword || !newPassword || !newPasswordConfirm)
    return showAlert('Please provide all password fields', 'error');
  if (newPassword !== newPasswordConfirm)
    return showAlert('New password and confirm must be same', 'error');

  try {
    const res = await axios.patch('/api/v1/users/updateMyPassword', {
      currentPassword,
      newPassword,
      newPasswordConfirm,
    });
    if (res.data.ok) {
      return showAlert('Your password changed successfully', 'success');
    }
    throw new Error(res.data.message);
  } catch (error) {
    return showAlert(error.response.data.message, 'error');
  }
}
