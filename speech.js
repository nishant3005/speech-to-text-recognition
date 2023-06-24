var messages = {
  start: {
    msg: 'Click on the microphone icon and begin speaking.',
    class: 'alert-success',
  },
  speak_now: {
    msg: 'Speak now.',
    class: 'alert-success',
  },
  no_speech: {
    msg: 'No speech was detected. You may need to adjust your <a href="//support.google.com/chrome/answer/2693767" target="_blank">microphone settings</a>.',
    class: 'alert-danger',
  },
  no_microphone: {
    msg: 'No microphone was found. Ensure that a microphone is installed and that <a href="//support.google.com/chrome/answer/2693767" target="_blank">microphone settings</a> are configured correctly.',
    class: 'alert-danger',
  },
  allow: {
    msg: 'Click the "Allow" button above to enable your microphone.',
    class: 'alert-warning',
  },
  denied: {
    msg: 'Permission to use microphone was denied.',
    class: 'alert-danger',
  },
  blocked: {
    msg: 'Permission to use microphone is blocked. To change, go to chrome://settings/content/microphone',
    class: 'alert-danger',
  },
  upgrade: {
    msg: 'Web Speech API is not supported by this browser. It is only supported by <a href="//www.google.com/chrome">Chrome</a> version 25 or later on desktop and Android mobile.',
    class: 'alert-danger',
  },
  stop: {
    msg: 'Stop listening, click on the microphone icon to restart',
    class: 'alert-success',
  },
  copy: {
    msg: 'Content copy to clipboard successfully.',
    class: 'alert-success',
  },
  problem: {
    msg: 'There is some problem with your microphone',
    class: 'alert-danger',
  },
};

let finalTranscript = '';
let recognizing = false;
let onEndError;
let startTimeStamp;
let recognition;

let selectLanguage = document.querySelector('#select-language');
let selectDialect = document.querySelector('#select-dialect');
let finalSpan = document.getElementById('final-span');
let interimSpan = document.getElementById('interim-span');

document.addEventListener('DOMContentLoaded', function () {
  for (let i = 0; i < langs.length; i++) {
    selectLanguage.options[i] = new Option(langs[i][0], i);
  }

  selectLanguage.selectedIndex = 10;
  updateCountry();
  selectDialect.selectedIndex = 2;

  if (!('webkitSpeechRecognition' in window)) {
    showInfo('upgrade');
    return;
  } else {
    showInfo('start');
    recognition = new webkitSpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function () {
      recognizing = true;
      showInfo('speak_now');
      start_img.src = 'images/mic-animation.gif';
    };

    recognition.onerror = function (e) {
      if (e.error == 'not-allowed') {
        showInfo('blocked');
      } else {
        showInfo('problem');
      }
      onEndError = true;
    };

    recognition.onend = function (e) {
      recognizing = false;
      if (onEndError) {
        return;
      }
      start_img.src = 'images/mic.gif';
      if (!finalTranscript) {
        showInfo('start');
        return;
      }
      showInfo('stop');
    };

    recognition.onresult = function (e) {
      let interimTranscript = '';
      console.log(e);
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        } else {
          interimTranscript += e.results[i][0].transcript;
        }
      }
      finalSpan.innerHTML = finalTranscript;
      interimSpan.innerHTML = interimTranscript;
    };
  }
});

function updateCountry() {
  for (let i = selectDialect.options.length - 1; i >= 0; i--) {
    selectDialect.remove(i);
  }
  let list = langs[selectLanguage.selectedIndex];
  for (let i = 1; i < list.length; i++) {
    selectDialect.options.add(new Option(list[i][1], list[i][0]));
  }

  selectDialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}

document
  .getElementById('select-language')
  .addEventListener('change', function () {
    updateCountry();
  });

document.getElementById('start-btn').addEventListener('click', function (e) {
  if (recognizing) {
    recognition.stop();
    return;
  }
  finalTranscript = '';
  recognition.lang = selectDialect.value;
  recognition.start();
  finalSpan.innerHTML = '';
  interimSpan.innerHTML = '';
});

document.getElementById('copy-btn').addEventListener('click', function (e) {
  if (recognizing) {
    recognizing = false;
    recognition.stop();
  }
  copyToClipboard(finalSpan.innerText);
});

function copyToClipboard(text) {
  const ele = document.createElement('textarea');
  ele.value = text;
  document.body.appendChild(ele);
  ele.select();
  document.execCommand('copy');
  document.body.removeChild(ele);
  showInfo('copy');
}

function showInfo(s) {
  let info = document.getElementById('info');
  if (s) {
    let message = messages[s];
    info.innerHTML = message.msg;
    info.className = 'alert' + message.class;
  } else {
    info.className = 'd-none';
  }
}
