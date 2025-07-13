const express = require('express');
const jwt = require('jsonwebtoken');
const ldap = require('ldapjs');
const amqp = require('amqplib');
require('dotenv').config();

const app = express();
app.use(express.json());

function authenticateLDAP(username, password, cb) {
  const client = ldap.createClient({ url: process.env.LDAP_URL });

  client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_CREDENTIALS, err => {
    if (err) {
      console.error('LDAP admin bind failed:', err.message);
      return cb(false);
    }

    const filter = process.env.LDAP_SEARCH_FILTER.replace('{{username}}', username);
    const searchOptions = {
      filter,
      scope: 'sub'
    };

    client.search(process.env.LDAP_SEARCH_BASE, searchOptions, (err, res) => {
      if (err) {
        console.error('LDAP search error:', err.message);
        return cb(false);
      }

      let found = false;

      res.on('searchEntry', entry => {
        found = true;
        const userDN = entry.object.dn;
        console.log('Found user DN:', userDN);

        client.bind(userDN, password, err => {
          client.unbind();
          if (err) {
            console.error('LDAP user bind failed:', err.message);
            return cb(false);
          }
          return cb(true);
        });
      });

      res.on('error', err => {
        console.error('LDAP search error:', err.message);
        cb(false);
      });

      res.on('end', result => {
        if (!found) {
          console.warn('LDAP user not found with filter:', filter);
          cb(false);
        }
      });
    });
  });
}

let channel;
(async () => {
  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await conn.createChannel();
  await channel.assertQueue("sms_queue");
})();

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  authenticateLDAP(username, password, success => {
    if (success) {
      const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});


app.post('/send-sms', async (req, res) => {
  const { phone, message } = req.body;
  channel.sendToQueue("sms_queue", Buffer.from(JSON.stringify({ phone, message })));
  res.json({ status: "queued" });
});

app.listen(3000, () => console.log('Backend running on port 3000'));
