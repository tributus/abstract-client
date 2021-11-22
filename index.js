const helpers = require("./helpers");
const io = require("socket.io-client");
const ApiClient = require("./ApiClient");
const SocketClient = require("./SocketClient");
const defaultSettings = {
  connectSocket: false,
  apiServerURI: "http://localhost:3000",
  eventBrokerURI:"http://localhost:3000",
  auth: {
    authServerURI: "http://localhost:3000",
    protectCredentials: false,
    autoRefreshToken: true,
    credentials: {
      grant_type: "password"
    }
  },
  apiClientSettings: {
    onAuthenticationError: console.error
  },
  socketSettings:{
    reconnectionDelayMax: 10000,
    transports:["websocket"],
    rejectUnauthorized: false,
    onError: console.error,
    onConnectError: console.error,
    onConnect: () => true
  }
}

const Client = function(settings) {
  const options = helpers.mergeDeep(defaultSettings, settings);
  this.api = new ApiClient(options);
  this.socketClient = new SocketClient(options, this.api);
  if(options.connectSocket) {
    this.api.authenticate().then(this.socketClient.initialize).catch(options.apiClientSettings.onAuthenticationError);
  }
  return this;
}
module.exports.initialize = settings => {
  return new Client(settings);
}