# Abstract Server Connector
The Abstract Server connector allows clients to connect and use Abstract Server apis and event broker.

# Setup
Install via NPM: ```npm install git@github.com:tributus/abstract-client.git --save```

## Usage
```javascript
const options = {
  clientID: "lab-socket",
  connectSocket: true,
  apiServerURI: "https://localhost:3001",
  eventBrokerURI:"https://localhost:3001",
  auth: {
    authServerURI: "https://localhost:3001",
    credentials: {
      grant_type: "password",
      api_key: "my.app.key",
      secret: "******",
    }
  }
}
const client = require("abstract-client").initialize(options);

//invoking Apis
client.api.get("/api/com.core.system/apps").then(console.log);

//subscribing events
client.socketClient.on("system.events.sampleevent", data => {
  console.log("Sample Event Fired with data:", data);
});

//emit events
client.socketClient.raise("system.events.sampleevent", "client-sample", {message: "some message"});

```

## Options
The code below shows the complete options list with default values:
```javascript
const defaultSettings = {
  connectSocket: false,
  apiServerURI: "http://localhost:3000",
  eventBrokerURI:"http://localhost:3000",
  auth: {
    authServerURI: "http://localhost:3000",
    autoRefreshToken: true,
    credentials: {
      grant_type: "password",
      api_key: null,
      secret: null
    }
  },
  apiClientSettings: {
    onAuthenticationError: console.error
  },
  socketSettings:{
    reconnectionDelayMax: 10000,
    transports:["websocket"],
    onError: console.error,
    onConnectError: console.error,
    onConnect: () => true
  }
}
```
```connectSocket```: 

Define if client should connect to event broker

```apiServerURI```: 

Base address of API Server

```eventBrokerURI```: 

Base address of Event Broker Server

## ```auth```: 

Authentication options

```auth.authServerURI```: 

Base address of Authentication Server

```auth.authServerURI```: 

Base address of Authentication Server

```auth.autoRefreshToken```: 

Define if security token shoud auto refresh before it expires

```auth.credentials```: 

Credential data

## ```apiClientSettings```: 

Api Client specific options

```apiClientSettings.onAuthenticationError```: 

Method that should be invoked in case of authentication error. If no method is provided, the error will be printed on console

## ```socketSettings```: 

Event Broker Client specific options

```socketSettings.reconnectionDelayMax```: 

The maximum delay between two reconnection attempts. Each attempt increases the reconnection delay by 2x.

```socketSettings.transports```: 

The low-level connection to the Socket.IO server can either be established with:
- HTTP long-polling: successive HTTP requests (POST for writing, GET for reading)
- WebSocket

```socketSettings.onError```:

Method that should be invoked in case of socket general error. If no method is provided, the error will be printed on console

```socketSettings.onConnectError```:

Method that should be invoked in case of socket connection error. If no method is provided, the error will be printed on console

```socketSettings.onConnect```:

Method that should be invoked after socket connection success.