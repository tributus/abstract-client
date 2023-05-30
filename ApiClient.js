const helpers = require("./helpers");
const http = require("http");
const https = require("https");
const protocols = {http,https};
const refreshTokenHasting = 5000;

module.exports = function(options) {
  let authToken = null;
  let authPromise = null;

  const buildURL = (url, params) => { 
    return helpers.buildURL(options.apiServerURI, url, params);
  }

  const buildHeaders = (requestHeaders, requestBody) => {
    const headers = {
      "Content-Type": "application/json"
    }
    if(requestBody) {
      headers["Content-Length"] = requestBody.length;
    }
    return helpers.mergeDeep(headers, requestHeaders);
  }

  generateResponseObject = text => {
    try {
      const json = JSON.parse(text);
      return json;
    } catch {
      return {text};
    }
  }
  
  this.request = (url, method="GET", requestBody, requestHeaders) => new Promise((resolve, reject) => {
    const uri = new URL(url);
    const protocol = uri.protocol.replace(":", "");
    const path = uri.href.replace(uri.origin, "");
    const data = requestBody ? JSON.stringify(requestBody) : null;
    const headers = buildHeaders(requestHeaders, data);
    const options = {
      method: method,
      hostname: uri.hostname,
      port: uri.port,
      path: path,
      headers: headers
    };
    const req = protocols[protocol].request(options, response => {
      response.on("data", responseData => {
        const dataString = responseData.toString();
        if(response.statusCode >= 400) {
          return reject({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            responseData: generateResponseObject(dataString)
          });
        } else {
          return resolve(generateResponseObject(dataString));
        }
      });
    });
    req.on("error", reject);
    if(data) {
      req.write(data);
    }
    req.end();
  });

  this.prepareForReqest = () => new Promise((resolve, reject)=>{
    this.authenticate().then(authToken => {
      const preparedRequestData = {
        authToken,
        buildURL
      }
      return resolve(preparedRequestData);
    }).catch(reject);
  });

  const requestAuthToken = () => new Promise((resolve, reject) => {
    this.request(helpers.buildURL(options.auth.authServerURI, "/api/com.core.system/security/authenticate"),"POST", options.auth.credentials).then(token => {
      authToken = token;
      if (options.auth.autoRefreshToken) {
        setTimeout(this.refreshToken,authToken.expires_in - refreshTokenHasting);
      }
      return resolve(token);
    }).catch(reject);
  });
  const refreshAuthToken = () => new Promise((resolve, reject) => {
    const refreshCredentials = {
      api_key: options.auth.credentials.api_key,
      grant_type: "refresh_token",
      secret: authToken.refresh_token
    }
    this.request(helpers.buildURL(options.auth.authServerURI, "/api/com.core.system/security/authenticate"),"POST", refreshCredentials).then(token => {
      authToken = token;
      if (options.auth.autoRefreshToken) {
        setTimeout(this.refreshToken,authToken.expires_in - refreshTokenHasting);
      }
      return resolve(token);
    }).catch(reject);
  });
  this.get = (url, params) => new Promise((resolve, reject) => {
    this.authenticate().then(authToken => {
      this.request(buildURL(url, params),"GET", null, {"Authorization": `${authToken.token_type} ${authToken.access_token}`}).then(resolve).catch(reject);
    }).catch(reject);
  });
  this.post = (url, params, requestbody) => new Promise((resolve, reject) => {
    this.authenticate().then(authToken => {
      this.request(buildURL(url, params),"POST", requestbody, {"Authorization": `${authToken.token_type} ${authToken.access_token}`}).then(resolve).catch(reject);
    }).catch(reject);
  });
  this.put = (url, params, requestbody) => new Promise((resolve, reject) => {
    this.authenticate().then(authToken => {
      this.request(buildURL(url, params),"PUT", requestbody, {"Authorization": `${authToken.token_type} ${authToken.access_token}`}).then(resolve).catch(reject);
    }).catch(reject);
  });
  this.delete = (url, params, requestbody) => new Promise((resolve, reject) => {
    this.authenticate().then(authToken => {
      this.request(buildURL(url, params),"DELETE", requestbody, {"Authorization": `${authToken.token_type} ${authToken.access_token}`}).then(resolve).catch(reject);
    }).catch(reject);
  });
  this.patch = (url, params, requestbody) => new Promise((resolve, reject) => {
    this.authenticate().then(authToken => {
      this.request(buildURL(url, params),"PATCH", requestbody, {"Authorization": `${authToken.token_type} ${authToken.access_token}`}).then(resolve).catch(reject);
    }).catch(reject);
  });
  this.authenticate = () => {
    if(!authPromise) {
      authPromise = requestAuthToken();
    }
    return authPromise;
  };
  this.refreshToken = () => {
    if (authToken) {
      return refreshAuthToken();
    } else {
      return this.authenticate();
    }
  }
  this.getAuthToken = () => `${authToken.token_type} ${authToken.access_token}`;
  return this;
}