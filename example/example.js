var etc = require('../');

// Same as etc().all().add({...})
var conf = etc().argv().env().etc().add({
  name: "default",
  version: "1.0"
});

console.log(conf.toJSON());
