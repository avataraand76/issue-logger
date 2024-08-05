/* eslint-disable no-restricted-globals */
/* global self */

self.addEventListener("push", function (event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "logo192.png",
    badge: "logo192.png",
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
