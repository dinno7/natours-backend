/* eslint-disable */
import axios from 'axios';

import showAlert from './alert';

export async function login(email, password) {
  try {
    const { data } = await axios.post('/api/v1/users/login', {
      email,
      password
    });

    if (data.ok) {
      showAlert('You logged in successfully.', 'success');
      setTimeout(() => {
        window.location.replace('/');
      }, 500);
    }
  } catch (error) {
    showAlert(error.response.data.message, 'error');
  }
}

export async function logout() {
  try {
    const { data } = await axios.get('/api/v1/users/logout');
    if (data.ok) {
      if (location.pathname.includes('/me')) return (location.pathname = '/');
      return showAlert('Logout successfully', 'info');
    }
  } catch (error) {
    return showAlert(error.response.data.message, 'error');
  }
}
