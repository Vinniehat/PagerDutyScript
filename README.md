# PagerDuty Ntfy Script
<br>

This is a Node.JS script made to ping an IP every X seconds, and on fail, it will send an alert to PagerDuty and Ntfy once. It will continually check to see if the server comes back online, and if so, it sends another alert.

It's pretty simple and customizable! You can change the IP, port, URLs, message, and interval if you need to. And if you only need to use one or the other, you can easily disable them in the `.env` file.

Links to both tools below:

- [PagerDuty](https://www.pagerduty.com/)
- [Ntfy](https://ntfy.sh/) - (Open Source and self-hostable!)
