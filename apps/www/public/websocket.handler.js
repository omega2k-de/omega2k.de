/* eslint-disable no-console */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class WebsocketHandler {
  socket = null;
  handlerUuid = this.uuidV4();
  messageQueue = [];
  websocketUrl = 'wss://local.www.o2k:42080';
  reconnectMaxCount = 50;
  reconnectRetries = 0;
  reconnectEnabled = false;
  reconnectTimerId = null;
  reconnectIntervalMs = 5_000;

  constructor() {
    this.broadcastChannel = new BroadcastChannel('WebSocketChannel');
  }

  postMessage(data) {
    try {
      const message = { ...this.requiredFields(), ...data };
      this.broadcastChannel.postMessage(message);
    } catch (error) {
      console.error('WebsocketHandler.postMessage', { error });
    }
  }

  requiredFields() {
    const created = this.timestamp();
    const uuid = this.uuidV4();
    return { created, uuid, author: { uuid: this.handlerUuid } };
  }

  uuidV4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  handleBurstPingPong(message) {
    if (message?.countdown > 0 && !message?.completed) {
      message.countdown--;
      this.send(message);
    }
  }

  connect(url) {
    try {
      if (
        this.socket?.readyState === WebSocket.OPEN ||
        this.socket?.readyState === WebSocket.CLOSING ||
        this.socket?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }
      this.websocketUrl = `${url ?? this.websocketUrl}`;
      this.socket = new WebSocket(this.websocketUrl);

      this.socket.onopen = _event => {
        this.postMessage({
          event: 'open',
          state: this.socket?.readyState ?? WebSocket.CLOSED,
          url: this.websocketUrl,
        });
        this.sendQueuedMessages();
      };

      this.socket.onmessage = event => {
        const data = JSON.parse(`${event?.data ?? 'null'}`);
        switch (data?.command) {
          case 'ping':
            this.pong(data);
            break;
          case 'burst-ping-pong':
            this.handleBurstPingPong(data);
            this.postMessage({ event: 'burst-ping-pong', countdown: data.countdown });
            break;
          default:
            this.postMessage(data);
        }
      };

      this.socket.onclose = ({ code, reason, wasClean }) => {
        this.postMessage({
          event: 'close',
          state: this.socket?.readyState ?? WebSocket.CLOSED,
          code,
          reason,
          wasClean,
        });
        this.socket = null;
        this.reconnect();
      };

      this.socket.onerror = event => {
        this.postMessage({
          event: 'error',
          state: this.socket?.readyState ?? WebSocket.CLOSED,
          message: this.stringify(event),
        });
        this.socket.close();
      };
    } catch (error) {
      this.postMessage({
        event: 'error',
        state: this.socket?.readyState ?? WebSocket.CLOSED,
        message: this.stringify(error),
      });
      this.socket?.close();
      this.reconnect();
    }
  }

  reconnect() {
    if (this.reconnectEnabled && this.reconnectTimerId === null) {
      if (this.reconnectRetries >= this.reconnectMaxCount) {
        this.postMessage({
          event: 'reconnect',
          state: this.socket?.readyState ?? WebSocket.CLOSED,
          disabled: true,
          retry: this.reconnectRetries,
          retries: this.reconnectMaxCount,
          interval: this.reconnectIntervalMs,
        });
        return;
      }

      this.reconnectRetries++;
      this.reconnectTimerId = setTimeout(() => {
        this.connect();
        this.reconnectTimerId = null;
      }, this.reconnectIntervalMs);

      this.postMessage({
        event: 'reconnect',
        state: this.socket?.readyState ?? WebSocket.CLOSED,
        disabled: false,
        retry: this.reconnectRetries,
        retries: this.reconnectMaxCount,
        interval: this.reconnectIntervalMs,
      });
    }
  }

  timestamp() {
    return new Date().getTime();
  }

  stringify(value) {
    const seen = new WeakSet();
    const replacer = (_, v) => {
      if (v !== null && typeof v === 'object') {
        if (seen.has(v)) {
          return;
        }

        seen.add(v);

        if (!Array.isArray(v)) {
          const keys = Object.keys(v).sort();
          const clone = {};

          for (let i = 0, l = keys.length; i < l; i++) {
            const key = keys[i];
            clone[key] = v[key];
          }

          return clone;
        }
      }
      return v;
    };
    return JSON.stringify(value, replacer);
  }

  handleConnectEvent = event => {
    const source = event?.ports[0];
    source.onmessage = this.handleMessageEvent.bind(this);
  };

  handleMessageEvent = event => {
    const data = JSON.parse(`${event?.data ?? 'null'}`);
    switch (data?.command) {
      case 'open-socket':
        if (this.socket === null) {
          this.connect(data?.url);
          this.reconnectMaxCount = 50;
          this.reconnectEnabled = true;
        }
        break;
      case 'readyState':
        this.postMessage({
          event: 'readyState',
          state: this.socket?.readyState,
        });
        break;
      case 'isPaused':
        this.postMessage({
          event: 'isPaused',
          state: this.socket?.isPaused,
        });
        break;
      case 'pause':
        this.postMessage({
          event: 'pause',
          state: this.socket?.isPaused,
        });
        break;
      case 'resume':
        this.postMessage({
          event: 'resume',
          state: this.socket?.isPaused,
        });
        break;
      case 'close-socket':
        this.reconnectEnabled = false;
        this.socket?.close();
        this.socket = null;
        break;
      default:
        this.send(data);
        break;
    }
  };

  send(data) {
    const message = { ...this.requiredFields(), ...data };
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(this.stringify(message), () => this.messageQueue.push(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  sendQueuedMessages() {
    let delay = 50;
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      setTimeout(() => this.send(message), delay);
      delay += 50;
    }
  }

  pong(data) {
    const rtt = this.timestamp() - data.created;
    this.send({ event: 'pong', rtt, message: `pong ${rtt}ms` });
  }
}
