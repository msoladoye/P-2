document.addEventListener("DOMContentLoaded", () => {
  const document_body = document.querySelector("body");
  const message_input = document.querySelector("#message");
  const current_user = document.querySelector(".username");
  const channel_name = document.querySelector(".channel-name");
  const create_channel = document.querySelector("#addChannel");
  const channelList = document.querySelectorAll(".channelList");
  const userChannelList = document.querySelectorAll(".userChannelList");
  const leaveGroup = document.querySelector(".leaveGroup");
  const create_channel_link = document.querySelector("#addChannelLink");
  //   create_channel.style.display = 'none'
  const channels = document.querySelector(".channels");
  const messages_container = document.querySelector(".body-content-messgaes");
  messages_container.scrollTop = messages_container.scrollHeight;
  const socketio = io.connect(
    `${location.protocol}//${location.hostname}:${location.port}`
  );
  document_body.style.height = `${window.innerHeight}px`;
  document_body.style.width = `${window.innerWidth}px`;
  message_input.addEventListener("focus", function () {
    this.parentElement.style.backgroundColor = "#eaeded";
  });
  message_input.addEventListener("blur", function () {
    this.parentElement.style.backgroundColor = "";
  });

  socketio.on("connect", () =>
    onConnect(
      socketio,
      message_input,
      current_user,
      create_channel,
      create_channel_link,
      channel_name,
      channelList,
      leaveGroup
    )
  );
  // socketio.on("leaveGroupReceive", (value) =>
  //   leaveGroupReceive(value, current_user, userChannelList)
  // );
  socketio.on("newChannelReceive", (value) => newChannel(value, current_user));
  socketio.on("joinChannelReceive", (value) =>
    joinChannel(value, current_user)
  );
  socketio.on("isTypingReceive", (value) =>
    isTyping(value, current_user, channel_name)
  );
  socketio.on("isNotTypingReceive", (value) =>
    isNotTyping(value, channel_name)
  );
  socketio.on("messageReceive", (value) =>
    messageReceive(value, current_user, messages_container, channel_name)
  );
});

const onConnect = (
  _socketio,
  _message_input,
  _current_user,
  _create_channel,
  _create_channel_link,
  _channel_name,
  _channelList,
  _leaveGroup
) => {
  _message_input.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (this.value.trim().length >= 1) {
        const d = new Date();
        const _timestamp = {
          year: d.getFullYear(),
          month: d.getMonth() < 10 ? `0${d.getMonth()}` : d.getMonth(),
          date: d.getDate() < 10 ? `0${d.getDate()}` : d.getDate(),
          hours: d.getHours() < 10 ? `0${d.getHours()}` : d.getHours(),
          minutes: d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes(),
          seconds: d.getSeconds() < 10 ? `0${d.getSeconds()}` : d.getSeconds(),
        };
        _socketio.emit("messageSend", {
          message: this.value.trim(),
          channel: _channel_name.innerText.toLowerCase(),
          timestamp: _timestamp,
        });
        this.value = "";
      }
    }
  });
  _message_input.addEventListener("keydown", () => {
    _socketio.emit("isTyping", { user: _current_user.innerText.toLowerCase() });
  });
  _message_input.addEventListener("keyup", () => {
    setTimeout(() => {
      _socketio.emit("isNotTyping", {
        user: _current_user.innerText.toLowerCase(),
      });
    }, 2500);
  });
  _create_channel_link.addEventListener("click", () => {
    if (_create_channel.classList.contains("showAddChannel")) {
      _create_channel.classList.remove("showAddChannel");
      _create_channel.classList.add("hideAddChannel");
      // _create_channel.classList.add('hide')
    } else {
      // _create_channel.style.display = 'block'
      _create_channel.classList.remove("hideAddChannel");
      _create_channel.classList.add("showAddChannel");
      _create_channel.classList.remove("hide");
      _create_channel.focus();
    }
  });
  _create_channel.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (this.value.trim().length >= 1) {
        _socketio.emit("newChannel", {
          channel: this.value.trim().toLowerCase(),
        });
      }
      this.value = "";
    }
  });
  _channelList.forEach((element) => {
    element.addEventListener("click", function () {
      let channelListName = this.childNodes[1].childNodes[1];
      // let channelListName = document.querySelector(".channelListName");
      let confirmJoing = confirm(
        `You are about to join ${channelListName.innerText.toUpperCase()} group`
      );
      if (confirmJoing) {
        _socketio.emit("joinChannel", {
          channel: channelListName.innerText.trim().toLowerCase(),
          username: _current_user.innerText.trim().toLowerCase(),
        });
      }
    });
  });
  // _leaveGroup.addEventListener("click", function () {
  //   let confirmLeaveGroup = confirm("Are you sure you want to leave group?");
  //   if (confirmLeaveGroup) {
  //     if (_channel_name.innerText.toLowerCase() != "main") {
  //       _socketio.emit("leaveGroup", {
  //         channel: _channel_name.innerText.toLowerCase(),
  //         username: _current_user.innerText.trim().toLowerCase(),
  //       });
  //     } else {
  //       alert("you can not leave the main group");
  //     }
  //   }
  // });
};

// const leaveGroupReceive = (value, _current_user, _userChannelList) => {
//   if (value.username == _current_user.innerText.toLowerCase()) {
//     _userChannelList.forEach((element) => {
//       console.log(element.childNodes);
//     });
//   }
// };
const newChannel = (value, _current_user) => {
  if (value.newChannel == "null") {
    if (value.user == _current_user.innerText.toLowerCase()) {
      alert("Channel Already Exist");
    }
  } else {
    // console.log('here')
    document.location.href = `${location.protocol}//${location.hostname}:${location.port}/index/${value.newChannel}`;
  }
};
const joinChannel = (value, _current_user) => {
  if (value.newChannel == "null") {
    if (value.user == _current_user.innerText.toLowerCase()) {
      alert("You are already in this channel");
    }
  } else {
    document.location.href = `${location.protocol}//${location.hostname}:${location.port}/index/${value.newChannel}`;
  }
};
const isTyping = (value, _current_user, _channel_name) => {
  if (value.channel == _channel_name.innerText.toLowerCase()) {
    //   _current_user = value.user;
    if (_current_user.innerText.toLowerCase() != value.user.toLowerCase()) {
      document.querySelector(
        ".body-content-head span"
      ).innerText = ` ${value.user.toLowerCase()} is typing...`;
    }
  }
};
const isNotTyping = (value, _channel_name) => {
  if (value.channel == _channel_name.innerText.toLowerCase()) {
    //   _current_user = value.user;
    document.querySelector(".body-content-head span").innerText = "";
  }
};
const messageReceive = (
  value,
  _current_user,
  _messages_container,
  _channel_name
) => {
  if (value.messageData.channel == _channel_name.innerText.toLowerCase()) {
    if (value.messageData.username != _current_user.innerText.toLowerCase()) {
      _messages_container.innerHTML += `
              <div class="row user-messages mx-0">
                  <div class="col-1 p-3">
                      <img class="img-fluid" src="/static/img/no_profile.png"
                          alt="profile pic" title="profile pic" width="100">
                  </div>
                  <div class="col-11 pl-1">
                      <div>
                          <a class="text-secondary" href="#"><b>${value.messageData.username}</b></a>
                          &nbsp;
                          <small class="text-secondary">${value.messageData.timestamp.hours}:${value.messageData.timestamp.minutes}</small>
                      </div>
                      <div>
                          <p>${value.messageData.message}</p>
                      </div>
                  </div>
              </div>`;
    } else {
      _messages_container.innerHTML += `
          <div class="row user-messages mx-0">
              <div class="col-11 pl-1">
                  <div class="text-right">
                      <small class="text-secondary">${value.messageData.timestamp.hours}:${value.messageData.timestamp.minutes}</small>
                      &nbsp;
                      <a class="text-secondary" href="#"><b>${value.messageData.username}</b></a>
                  </div>
                  <div>
                      <p class="text-right">${value.messageData.message}</p>
                  </div>
              </div>
              <div class="col-1 p-3">
                  <img class="img-fluid" src="/static/img/no_profile.png"
                      alt="profile pic" title="profile pic" width="100">
              </div>
          </div>`;
    }
    _messages_container.scrollTop = _messages_container.scrollHeight;
  }
};
