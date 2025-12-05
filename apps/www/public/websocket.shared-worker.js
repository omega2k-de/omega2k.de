/// <reference lib="shared-worker" />

importScripts('./websocket.handler.js');

const helper = new WebsocketHandler();

addEventListener('connect', helper.handleConnectEvent);
