const bPort = chrome.runtime.connect({ name: "eex-background" }) // background port

// receive message from loadBackgroundIframe
window.addEventListener("message", (event) => {
  if (event.source != window)
    return;
  if (event.data.type === 'eex-background') {
    console.assert(event.data.iframe);
    if (event.data.iframe) bPort.postMessage({ type: 'iframe', data: event.data.iframe });
  }
});

// receive background message
bPort.onMessage.addListener(function (msg) {
  if (msg.type === 'localStorageSync') {
    msg.data.forEach(v => {
      localStorage.setItem(v.key, v.val);
    });
  }
});

// core function for content script load, example.: /src/scripts/inject.js
const appendContentJs = function (path, uniqueId) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      if (window.isOptionPage) {
        document.querySelector("#success-block").style.display = "initial";
      }
      const element = document.createElement('script');
      element.innerHTML = xmlHttp.responseText;
      element.id = uniqueId;
      document.querySelector('html').appendChild(element);
    }
    if (xmlHttp.readyState == 4 && xmlHttp.status >= 300) {
      if (window.isOptionPage) {
        document.querySelector("#error-block").style.display = "initial";
      }
    }
  }
  xmlHttp.open("GET", path, true);
  xmlHttp.send(null);
}

// core function for background script
function loadBackgroundIframe(iframe) {
  window.postMessage({ type: 'eex-background', iframe }, "*");
}

// get localStorage item from readonly store
function getItem(host, key) {
  const _key = `eexReadOnly:${host}:${key}`;
  return localStorage.getItem(_key);
}

// register for localStorage item change from readonly store
function regStorageItemChange(host, key, callback = () => { }) {
  const _key = `eexReadOnly:${host}:${key}`;
  let val = localStorage.getItem(_key);
  if (val !== null) callback(val);
  setInterval(() => {
    let _val = localStorage.getItem(_key);
    if (_val !== val) {
      val = _val;
      callback(val);
    }
  }, 50);
}

// load
if (!window.isOptionPage) {
  chrome.storage.sync.get({ urllink: '[]' }, function (items) {
    const links = JSON.parse(items.urllink);
    if (links) {
      const element = document.createElement('script');
      element.innerHTML = `window.eex={};window.eex.loadBackgroundIframe=${loadBackgroundIframe};window.eex.getItem=${getItem};window.eex.regStorageItemChange=${regStorageItemChange}`;
      element.id = 'eexMessenger';
      document.querySelector('html').appendChild(element);
    }
    links.forEach(path => {
      if (window.location.href.includes(path.pathinclude) && !path.corsonly) {
        const url = new URL(path.link);
        bPort.postMessage({ type: 'localStorageSync', data: url.host });
        appendContentJs(path.link, 'boot');
      }
    });
  });
}
