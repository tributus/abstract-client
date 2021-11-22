const isObject = item => {
  return (typeof item === 'object' && !Array.isArray(item));
}

const mergeDeep = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return mergeDeep(target, ...sources);
};

const buildURL = (baseUrl, path, params) => { 
  let url = `${baseUrl}/${path.replace(/^(\/)?(.+)/, "$2")}`
  if (params) { 
    const keys = url.match(/\{[a-zA-Z]+}/g); 
    if (keys) { 
      keys.forEach(function (key) { 
        url = url.replace(key, params[key.replace(/\{|}/g, "")]); 
      }); 
      return url 
    } 
    else { 
      return url; 
    } 
  } 
  else { 
    return url; 
  } 
}

module.exports.mergeDeep = mergeDeep;
module.exports.buildURL = buildURL;