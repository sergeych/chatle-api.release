// Chatle api (version 0.2.24)
// Generated by CoffeeScript 1.6.3
(function() {
  var ChatleClient;

  ChatleClient = (function() {
    function ChatleClient(key, host, transport, onload) {
      this.key = key;
      this.host = host;
      this.transport = transport;
      if (this.key == null) {
        throw new Error('ChatleClient constructor call without api key');
      }
      if (this.host == null) {
        this.host = ChatleClient.DEFAULT_HOST;
      }
      if (this.transport == null) {
        this.transport = new ChatleClient.Transport(this.host, this.key, onload);
      }
      this.auth = new ChatleClient.Auth(this);
      this.rooms = new ChatleClient.Rooms(this);
      this.users = new ChatleClient.Users(this);
    }

    ChatleClient.prototype.setAuthToken = function(token) {
      return this.transport.authToken = token;
    };

    ChatleClient.prototype.deactivate = function() {
      return this.transport.deactivate();
    };

    return ChatleClient;

  })();

  ChatleClient.DEFAULT_HOST = 'https://chatle.co/system/widgets/api/api.html';

  window.ChatleClient = ChatleClient;

}).call(this);
// Generated by CoffeeScript 1.6.3
(function() {
  var GUID_CHARS, Transport,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  GUID_CHARS = '0123456789QWERTYUIOPASDFGHJKLZXCVBNM';

  Transport = (function() {
    function Transport(frame_url, key) {
      this.frame_url = frame_url;
      this.key = key;
      this.onmessage = __bind(this.onmessage, this);
      this.onload = __bind(this.onload, this);
      if (this.frame_url == null) {
        throw new Error('ChatleClient.Transport constructor call without frame_url');
      }
      if (this.key == null) {
        throw new Error('ChatleClient.Transport constructor call without key');
      }
      this.id = this.generateGuid();
      this.loaded = false;
      this.queue = [];
      this.iframe = document.createElement('iframe');
      this.iframe.src = "" + this.frame_url + "#" + this.id;
      this.iframe.setAttribute('style', 'width:0;height:0;display:none');
      document.body.appendChild(this.iframe);
      this.commands = {
        index: 0
      };
      window.addEventListener('message', this.onload);
    }

    Transport.prototype.onload = function(event) {
      var command;
      if ((event == null) || (event.data == null) || event.data.id !== this.id) {
        return;
      }
      this.loaded = true;
      while (this.queue.length > 0) {
        command = this.queue.shift();
        this.sendCommand(command.type, command.url, command.data, command.callback);
      }
      window.removeEventListener('message', this.onload);
      return window.addEventListener('message', this.onmessage);
    };

    Transport.prototype.onmessage = function(event) {
      var data, result;
      result = event.data;
      data = this.commands[result.id];
      if (data == null) {
        return;
      }
      delete this.commands[result.id];
      return typeof data.callback === "function" ? data.callback((result.status === 'ok' ? null : result.errorStatus), (result.status === 'ok' ? result.data : null)) : void 0;
    };

    Transport.prototype.generateGuid = function() {
      var i, result, _i;
      result = '';
      for (i = _i = 0; _i <= 31; i = ++_i) {
        result += GUID_CHARS[Math.round(Math.random() * (GUID_CHARS.length - 1))];
      }
      return result;
    };

    Transport.prototype.sendCommand = function(type, url, data, callback) {
      if (!this.loaded) {
        return this.queue.push({
          type: type,
          url: url,
          data: data,
          callback: callback
        });
      }
      data = {
        command: {
          id: "" + this.id + "_" + (this.commands.index++),
          type: type,
          url: url,
          data: data,
          headers: {
            "X-AppKey": this.key
          }
        },
        callback: callback
      };
      if (this.authToken != null) {
        if (data.command.headers == null) {
          data.command.headers = {};
        }
        data.command.headers['X-Auth-Token'] = this.authToken;
      }
      this.commands[data.command.id] = data;
      return this.iframe.contentWindow.postMessage(data.command, '*');
    };

    Transport.prototype.get = function(url, data, callback) {
      return this.sendCommand('GET', url, data, callback);
    };

    Transport.prototype.post = function(url, data, callback) {
      return this.sendCommand('POST', url, data, callback);
    };

    Transport.prototype.put = function(url, data, callback) {
      return this.sendCommand('PUT', url, data, callback);
    };

    Transport.prototype["delete"] = function(url, data, callback) {
      return this.sendCommand('DELETE', url, data, callback);
    };

    Transport.prototype.deactivate = function() {
      window.removeEventListener('message', this.onload);
      window.removeEventListener('message', this.onmessage);
      return this.iframe.parentNode.removeChild(this.iframe);
    };

    return Transport;

  })();

  ChatleClient.Transport = Transport;

}).call(this);
// Generated by CoffeeScript 1.6.3
(function() {
  var Auth;

  Auth = (function() {
    function Auth(client) {
      this.client = client;
      if (this.client == null) {
        throw new Error('ChatleClient.Auth constructor call without client');
      }
    }

    Auth.prototype.registerMobile = function(number, callback) {
      return this.client.transport.get("" + Auth.URL + Auth.REGISTER_MOBILE_URL, {
        number: number
      }, callback);
    };

    Auth.prototype.registerEmail = function(email, callback) {
      return this.client.transport.get("" + Auth.URL + Auth.REGISTER_EMAIL_URL, {
        email: email
      }, callback);
    };

    Auth.prototype.confirmCode = function(confirmation_id, code, display_name, callback) {
      return this.client.transport.get("" + Auth.URL + Auth.CONFIRM_CODE_URL, {
        confirmation_id: confirmation_id,
        code: code,
        display_name: display_name
      }, callback);
    };

    return Auth;

  })();

  Auth.URL = '/api/auth/';

  Auth.REGISTER_MOBILE_URL = 'register_mobile';

  Auth.REGISTER_EMAIL_URL = 'email';

  Auth.CONFIRM_CODE_URL = 'confirm_code';

  ChatleClient.Auth = Auth;

}).call(this);
// Generated by CoffeeScript 1.6.3
(function() {
  var Rooms;

  Rooms = (function() {
    function Rooms(client) {
      this.client = client;
      if (this.client == null) {
        throw new Error('ChatleClient.Rooms constructor call without client');
      }
    }

    Rooms.prototype.list = function(callback) {
      return this.client.transport.get("" + Rooms.URL, null, callback);
    };

    Rooms.prototype.messages = function(room, filter, callback) {
      return this.client.transport.get("" + Rooms.URL + "/" + room, filter, callback);
    };

    Rooms.prototype.sendMessage = function(room, message, callback) {
      return this.client.transport.post("" + Rooms.URL + "/" + room + "/" + Rooms.SEND_MESSAGE_URL, {
        message: {
          text: message,
          guid: this.client.transport.generateGuid()
        }
      }, callback);
    };

    Rooms.prototype.deleteMessage = function(room, message, callback) {
      return this.client.transport["delete"]("" + Rooms.URL + "/" + room + "/" + message, null, callback);
    };

    Rooms.prototype.createPrivate = function(user, group, callback) {
      return this.client.transport.get("" + Rooms.URL + "/" + Rooms.CREATE_PRIVATE_ROOM_URL, {
        user_id: user,
        group: group
      }, callback);
    };

    Rooms.prototype.createInviteOnly = function(users, group, name, callback) {
      return this.client.transport.get("" + Rooms.URL + "/" + Rooms.CREATE_INVITE_ONLY_URL, {
        user_ids: users,
        group: group,
        name: name
      }, callback);
    };

    Rooms.prototype.update = function(room, group, name, mute, data, callback) {
      return this.client.transport.put("" + Rooms.URL + "/" + room, {
        group: group,
        name: name,
        mute: mute,
        data: data
      }, callback);
    };

    Rooms.prototype.invite = function(room, users, callback) {
      var data;
      data = {};
      data[users instanceof Array ? 'user_ids' : 'user'] = users;
      return this.client.transport.get("" + Rooms.URL + "/" + room + "/" + Rooms.INVITE_USERS, data, callback);
    };

    Rooms.prototype.leave = function(room, callback) {
      return this.client.transport.get("" + Rooms.URL + "/" + room + "/" + Rooms.LEAVE, null, callback);
    };

    return Rooms;

  })();

  Rooms.URL = '/api/rooms';

  Rooms.SEND_MESSAGE_URL = 'message';

  Rooms.CREATE_PRIVATE_ROOM_URL = 'private';

  Rooms.CREATE_INVITE_ONLY_URL = 'group';

  Rooms.INVITE_USERS = 'invite';

  Rooms.LEAVE = 'leave';

  ChatleClient.Rooms = Rooms;

}).call(this);
// Generated by CoffeeScript 1.6.3
(function() {
  var Users;

  Users = (function() {
    function Users(client) {
      this.client = client;
      if (this.client == null) {
        throw new Error('ChatleClient.Users constructor call without client');
      }
    }

    Users.prototype.me = function(callback) {
      return this.client.transport.get("" + Users.URL + "/" + Users.ME_URL, null, callback);
    };

    Users.prototype.info = function(id, callback) {
      return this.client.transport.get("" + Users.URL + "/" + id, null, callback);
    };

    Users.prototype.update = function(first_name, last_name, display_name, callback) {
      return this.client.transport.post("" + Users.URL + "/" + Users.UPDATE_URL, {
        first_name: first_name,
        last_name: last_name,
        display_name: display_name
      }, callback);
    };

    return Users;

  })();

  Users.URL = '/api/users';

  Users.ME_URL = 'me';

  Users.UPDATE_URL = 'me';

  ChatleClient.Users = Users;

}).call(this);
