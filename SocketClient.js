const crypto = require("crypto");
const io = require("socket.io-client");

module.exports = function(options, apiClient) {
  const location = options.clientID || crypto.randomBytes(16).toString("hex");
  let subscribeList = [];
  const notConnectedException = () => {
    throw new Error("not connected");
  }
  let socket = {
    on: (eventName, eventHandler) => subscribeList.push({eventName, eventHandler}),
    emit: () => notConnectedException
  };
  this.initialize = () => {
    socket = io(options.eventBrokerURI, {
      reconnectionDelayMax: options.socketSettings.reconnectionDelayMax,
      transports: options.socketSettings.transports,
      rejectUnauthorized: options.socketSettings.rejectUnauthorized,
      auth: {
        grantType:"application_token",
        client: "thea.labs.app1",
        secret: apiClient.getAuthToken()
      },
      query: {
        location: location
      }
    });
  
    socket.on("error", error => {
      options.socketSettings.onError(error);
    });
  
    socket.on("connect_error", error => {
      options.socketSettings.onConnectError(error);
    });
  
    socket.on("connect", data => {
      if(subscribeList.length > 0) {
        subscribeList.forEach(item => socket.on(item.eventName, item.eventHandler));
        subscribeList = [];
      }
      options.socketSettings.onConnect(data);
    });
  }
  
  this.raise = (eventName, eventSource, eventData) => {
    socket.emit("system.events.generalapplicationevent", { name: eventName, data: eventData, source: eventSource || location});
  };

  this.on = (eventName, eventHandler) => {
    socket.on(eventName, eventHandler);
  };

  this.getSocketClient = () => socket;

  return this;
}
