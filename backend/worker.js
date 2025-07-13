const amqp = require('amqplib');
require('dotenv').config();
const { sendSMS } = require('./utils/sms');

async function connectWithRetry() {
  const RABBIT_URL = process.env.RABBITMQ_URL;
  let retries = 5;

  while (retries) {
    try {
      const conn = await amqp.connect(RABBIT_URL);
      const ch = await conn.createChannel();
      await ch.assertQueue("sms_queue");

      ch.consume("sms_queue", async (msg) => {
        if (msg !== null) {
          const { phone, message } = JSON.parse(msg.content.toString());
          console.log("Processing SMS to:", phone);
          const success = await sendSMS(phone, message);
          if (success) {
            ch.ack(msg);
          } else {
           // 🔁 Retry logic — or skip retry for specific status codes
          if (error.response?.status === 412 || error.response?.status === 403) {
             console.log("Non-retriable error. Discarding message.");
              ch.ack(msg); // prevent retry storm
          } else {
             ch.nack(msg, false, true); // retry later
           }
          }
        }
      });

      console.log("SMS Worker connected to RabbitMQ.");
      break;

    } catch (err) {
      console.error("RabbitMQ connection failed. Retrying in 5s...");
      retries--;
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  if (!retries) {
    console.error("Failed to connect to RabbitMQ after multiple attempts.");
    process.exit(1);
  }
}

connectWithRetry();
