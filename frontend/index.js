document.addEventListener("DOMContentLoaded", () => {
  document.body.innerHTML = `
    <div class="container mt-5">
      <h3>LDAP Login</h3>
      <form id="loginForm">
        <input class="form-control mb-2" id="username" placeholder="Username" required />
        <input class="form-control mb-2" id="password" type="password" placeholder="Password" required />
        <button class="btn btn-primary">Login</button>
      </form>

      <div id="loginError" class="text-danger mt-2"></div>

      <hr/>

      <form id="smsForm" class="d-none">
        <h3>Send SMS</h3>
        <input class="form-control mb-2" id="phone" placeholder="Phone Number" required />
        <textarea class="form-control mb-2" id="message" placeholder="Your message..." required></textarea>
        <button class="btn btn-success">Send</button>
      </form>

      <div id="smsStatus" class="mt-2"></div>
    </div>
  `;

  let token = '';

  document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        token = data.token;
        document.getElementById('loginForm').classList.add('d-none');
        document.getElementById('smsForm').classList.remove('d-none');
        document.getElementById('loginError').innerText = '';
      } else {
        document.getElementById('loginError').innerText = 'Invalid credentials. Please try again.';
      }
    } catch (err) {
      document.getElementById('loginError').innerText = 'Login error: ' + err.message;
    }
  };

  document.getElementById('smsForm').onsubmit = async (e) => {
    e.preventDefault();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();

    try {
      const res = await fetch('/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ phone, message })
      });

      const smsStatus = document.getElementById('smsStatus');

      if (res.ok) {
        smsStatus.innerHTML = `<span class="text-success">SMS sent successfully.</span>`;
      } else {
        smsStatus.innerHTML = `<span class="text-danger">Failed to send SMS.</span>`;
      }
    } catch (err) {
      document.getElementById('smsStatus').innerHTML = `<span class="text-danger">Error: ${err.message}</span>`;
    }
  };
});
