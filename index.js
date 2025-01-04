const https = require('https');
const axios = require('axios');

const IP_TO_CHECK = '192.168.1.1'; // Replace with your target IP
const PORT = 8006
const PING_INTERVAL = 10000; // Interval in milliseconds (10 seconds)
const API_URL = 'https://event.pagerduty.com/v2/enqueue';
const ROUTING_KEY = 'KEY_GOES_HERE';

let isDown = false;

const sendApiRequest = async (eventAction, message) => {
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
    console.log(`API request sent: ${eventAction} - ${message}`, response.data);
  } catch (error) {
    console.error('Error sending API request:', error);
  }
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
      console.log('Sending alert...');
      sendApiRequest('resolve', 'The server, [name], has been restored.');
      isDown = false;
    }
  });

  req.on('error', () => {
    console.log("IP is offline.");
    if (!isDown) {
      console.log('Sending alert...');
      sendApiRequest('trigger', 'The server, [name], is down.');
      isDown = true;
    }
  });

  req.end();
};

console.log("Starting script...")
setInterval(pingHost, PING_INTERVAL);
