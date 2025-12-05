/// <reference lib="webworker" />

importScripts('./websocket.handler.js');

const helper = new WebsocketHandler();

addEventListener('message', helper.handleMessageEvent);
