require('dotenv').config();
const https = require('https');
const axios = require('axios');

const IP_TO_CHECK = process.env.IP_TO_CHECK;
const PORT = process.env.PORT;
const PING_INTERVAL = process.env.PING_INTERVAL;
const PAGERDUTY_ENABLED = process.env.PAGERDUTY_ENABLED === 'true';
const NTFY_ENABLED = process.env.NTFY_ENABLED === 'true';

const API_URL = process.env.PAGERDUTY_API_URL;
const ROUTING_KEY = process.env.PAGERDUTY_ROUTING_KEY;
const NTFY_URL = process.env.NTFY_URL;
const SERVICE_NAME = process.env.SERVICE_NAME;

let isDown = false;

const sendPagerDutyRequest = async (eventAction, message) => {
  if (!PAGERDUTY_ENABLED) return;
  try {
    const response = await axios.post(API_URL, {
      payload: {
        summary: message,
        severity: 'critical',
        source: 'Pager Duty Script',
      },
      routing_key: ROUTING_KEY,
      event_action: eventAction,
    });
    console.log(`PagerDuty request sent: ${eventAction} - ${message}`, response.data);
  } catch (error) {
    console.error('Error sending PagerDuty request:', error);
  }
};

const sendNtfyRequest = async (eventAction, message) => {
  if (!NTFY_ENABLED) return;
  try {
    await axios.post(NTFY_URL, message, {
      headers: {
        'Title': message,
        'Priority': 'high',
        'Tags': 'SnowPVE',
        'Content-Type': 'text/plain'
         }
    });
    console.log(`Ntfy request sent: ${eventAction} - ${message}`);
  } catch (error) {
    console.error('Error sending Ntfy request:', error);
  }
};

const handleAlert = async (eventAction, message) => {
  await sendPagerDutyRequest(eventAction, message);
  await sendNtfyRequest(eventAction, message);
};

const pingHost = () => {
  const req = https.request({
    hostname: IP_TO_CHECK,
    port: PORT,
    method: 'GET',
    rejectUnauthorized: false,
  }, (res) => {
    console.log("IP is online.");
    if (isDown) {
      console.log('Sending restore alert...');
      handleAlert('resolve', `The server, ${SERVICE_NAME}, has been restored.`);
      isDown = false;
    }
  });

  req.on('error', () => {
    console.log("IP is offline.");
    if (!isDown) {
      console.log('Sending down alert...');
      handleAlert('trigger', `The server, ${SERVICE_NAME}, is down.`);
      isDown = true;
    }
  });

  req.end();
};

console.log("Starting script...")
setInterval(pingHost, PING_INTERVAL);
