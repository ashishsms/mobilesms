const axios = require('axios');
const qs = require('querystring');

const JASMIN_URL = 'http://jasmin:1401/send';
const JASMIN_USERNAME = process.env.JASMIN_USERNAME;
const JASMIN_PASSWORD = process.env.JASMIN_PASSWORD;

async function sendSMS(phone, message) {
  const payload = qs.stringify({
    username: JASMIN_USERNAME,
    password: JASMIN_PASSWORD,
    to: phone,
    content: message,
    from: 'JASMIN'
  });

  try {
    const res = await axios.post(JASMIN_URL, payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (res.status === 200 && typeof res.data === 'string' && res.data.startsWith('Success')) {
      console.info(res.data);
      return true;
    } else {
      return false;
    }

  } catch (err) {
    console.error("SMS error:", err.message);
    console.error("Jasmin error:", err.response?.status, err.response?.data);
    return false;
  }
}

module.exports = { sendSMS };
