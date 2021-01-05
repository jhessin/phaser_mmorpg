/* eslint-disable no-unused-vars, no-alert */

function postData(url = '', data = {}) {
  return fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include', // needed for cookies
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrer: 'no-referer',
    body: JSON.stringify(data),
  }).then((res) => res.json());
}

function signIn(e) {
  if ((e && e.keyCode !== 13)) return;

  const body = {
    email: document.forms[0].elements[0].value,
    password: document.forms[0].elements[1].value,
  };

  postData('/login', body)
    .then((res) => {
      if (res.status !== 200) throw new Error(res.error);
      window.location.assign('/profile.html');
    })
    .catch((err) => {
      window.alert(err.message);
      window.location.reload(true);
    });
}

function signUp(e) {
  if ((e && e.keyCode !== 13)) return;
  const body = {
    email: document.forms[0].elements[0].value,
    username: document.forms[0].elements[1].value,
    password: document.forms[0].elements[2].value,
    confirmPassword: document.forms[0].elements[3].value,
  };
  postData('/signup', body)
    .then((res) => {
      console.log(res);
      if (res.status !== 200) throw new Error(res.error);
      window.alert('user created successfully');
      window.location.assign('/');
    })
    .catch((err) => {
      window.alert(err.message);
      window.location.reload(true);
    });
}

function forgotPassword(e) {
  if ((e && e.keyCode !== 13)) return;
  const body = {
    email: document.forms[0].elements[0].value,
  };
  postData('/forgot-password', body)
    .then((res) => {
      console.log(res);
      if (res.status !== 200) throw new Error(res.error);
      window.alert('password reset email sent');
      window.location.assign('/');
    })
    .catch((err) => {
      window.alert(err.message);
      window.location.reload(true);
    });
}

function resetPassword(e) {
  if ((e && e.keyCode !== 13)) return;
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const password = document.forms[0].elements[1].value;
  const confirmPassword = document.forms[0].elements[2].value;
  const body = {
    email: document.forms[0].elements[0].value,
    password,
    confirmPassword,
    // token: document.location.href.split('token=')[1],
    token,
  };

  if (password !== confirmPassword) {
    window.alert('passwords do not match');
    window.location.reload(true);
    return;
  }
  postData('/reset-password', body)
    .then((res) => {
      console.log(res);
      if (res.status !== 200) throw new Error(res.error);
      window.alert('password updated');
      window.location.assign('/');
    })
    .catch((err) => {
      window.alert(err.message);
      window.location.reload(true);
    });
}

function updatePassword(e) {
  if ((e && e.keyCode !== 13)) return;
  const body = {
    password: document.forms[0].elements[0].value,
    confirmPassword: document.forms[0].elements[1].value,
  };

  postData('/update-password', body)
    .then((res) => {
      if (res.status !== 200) throw new Error(res.error);
      window.alert('password updated');
      window.location.reload(true);
    })
    .catch((err) => {
      window.alert(err.message);
      window.location.reload(true);
    });
}
