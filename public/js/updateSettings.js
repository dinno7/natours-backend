/* eslint-disable */
import axios from 'axios';

import showAlert from './alert';

export async function updateUser(name = '', email = '') {
  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (Object.keys(updateData).length) {
      const res = await axios.patch('/api/v1/users/updateMe', updateData);
      if (res.data.ok) {
        showAlert('Updated successfully', 'success');
        if (updateData.hasOwnProperty('name'))
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
  newPasswordConfirm = ''
) {
  if (!currentPassword || !newPassword || !newPasswordConfirm)
    return showAlert('Please provide all password fields', 'error');
  if (newPassword !== newPasswordConfirm)
    return showAlert('New password and confirm must be same', 'error');

  try {
    const res = await axios.patch('/api/v1/users/updateMyPassword', {
      currentPassword,
      newPassword,
      newPasswordConfirm
    });
    if (res.data.ok) {
      return showAlert('Your password changed successfully', 'success');
    }
    throw new Error(res.data.message);
  } catch (error) {
    return showAlert(error.response.data.message, 'error');
  }
}
