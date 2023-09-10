/* eslint-disable */
import '@babel/polyfill';

import { login, logout } from './login';
import { updateUser, updateUserPassword } from './updateSettings';

window.addEventListener('load', (e) => {
  const loginForm = document.querySelector('form.form--login');
  const logoutBtn = document.querySelector('.nav__el--logout');
  const updateUserForm = document.querySelector('form.form-user-data');
  const updateUserPasswordForm = document.querySelector(
    'form.form-user-password',
  );

  // >> ---------------------
  if (loginForm)
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.querySelector('#email').value,
        password = document.querySelector('#password').value;

      await login(email, password);
    });

  // >> ---------------------
  if (logoutBtn)
    logoutBtn.addEventListener('click', async (e) => {
      await logout();
    });

  // >> ---------------------
  if (updateUserForm)
    updateUserForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const { name, email, photo } = Object.fromEntries(new FormData(this));

      const form = new FormData();
      form.append('name', name);
      form.append('email', email);
      form.append('photo', photo);

      await updateUser(form);
    });

  // >> ---------------------
  if (updateUserPasswordForm)
    updateUserPasswordForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      let formData = new FormData(this);
      formData = Object.fromEntries(formData);
      const { currentPassword, newPassword, newPasswordConfirm } = formData;
      return await updateUserPassword(
        currentPassword,
        newPassword,
        newPasswordConfirm,
      );
    });
});
