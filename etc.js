var util = require('util')
  , optimist = require('optimist')
  , fs = require('fs')
  , path = require('path')
  , existsSync = fs.existsSync ? fs.existsSync : path.existsSync
  , glob = require('glob')
  , findPackage = require('witwip')
  , createHooks = require('stact-hooks')
  , merge = require('tea-merge')
  , clone = require('clone');

module.exports = function (delim) {
  return new Etc(delim);
};

function Etc (delim) {
  this.delim = delim || ':';
  this.parsers = {
    'json': this.parseJSON,
    'js': this.parseJSON
  };
  this.mode = 'push';
  this.conf = {};
  this.hooks = createHooks();
}

Etc.prototype.reverse = function () {
  this.mode = (this.mode === 'push') ? 'unshift' : 'push';
  return this;
};

Etc.prototype.push = function (obj) {
  this.conf = merge({}, clone(obj), this.conf);
  return this;
};

Etc.prototype.unshift = function (obj) {
  merge(this.conf, clone(obj));
  return this;
};

Etc.prototype.get = function (key) {
  if (typeof key === 'undefined') return clone(this.conf);
  return clone(key.split(this.delim).reduce(function (prev, part) {
    return prev !== undefined && typeof prev[part] !== 'undefined' ? prev[part] : undefined;
  }, this.conf));
};

Etc.prototype.set = function (key, value) {
  return this.unshift(this.unflattenKey({}, key, value));
};

Etc.prototype.reset = function (key, value) {
  key.split(this.delim).reduce(function (conf, part, i, arr) {
    conf[part] = (i === (arr.length - 1)) ? value : (conf[part] || {});
    return conf[part];
  }, this.conf);
  return this;
};

Etc.prototype.clear = function (key) {
  key.split(this.delim).reduce(function (conf, part, i, arr) {
    if (i === (arr.length - 1)) {
      delete conf[part];
    }
    return conf[part] || {};
  }, this.conf);
  return this;
};

Etc.prototype.unflattenKey = function (dest, key, value, delim) {
  key.split(delim || this.delim).reduce(function (obj, part, i, arr) {
    obj[part] = (i === (arr.length - 1)) ? value : (obj[part] || {});
    return obj[part];
  }, dest);
  return dest;
};

Etc.prototype.toJSON = function (callback) {
  return clone(this.conf);
};

Etc.prototype.use = function (plugin, options) {
  if (plugin.attach) {
    plugin.attach.call(this, options);
  }
  return this;
};

Etc.prototype.all = function () {
  return this.argv().env().etc().pkg();
};

Etc.prototype.argv = function (parser) {
  var self = this, args = {};
  if (optimist.argv) {
    Object.keys(optimist.argv).forEach(function (key) {
      self.unflattenKey(args, key, self.parseValue(optimist.argv[key], parser));
    });
    this[this.mode](args);
  }
  return this;
};

Etc.prototype.env = function (prefix, delim, parser) {
  delim = delim || '_';
  prefix = prefix || 'app_';

  var self = this;
  var len = prefix.length;
  var env = {};

  Object.keys(process.env).forEach(function (key) {
    if (key.indexOf(prefix) === 0) {
      self.unflattenKey(env, key.substr(len), self.parseValue(process.env[key], parser), delim);
    }
  });

  this[this.mode](env);

  return this;
};

Etc.prototype.add = function (obj) {
  return this[this.mode](obj);
};

Etc.prototype.file = function (file, named, baseDir) {
  if (existsSync(file)) {
    var ext = path.extname(file).substr(1);
    if (this.parsers[ext]) {
      var parsed = this.parsers[ext].call(this, file);
      if (named) {
        var parts = file.substr(baseDir.length).replace(/^\//, '').split('/'),
            obj = {};

        parts.reduce(function (prev, next, i) {
          var last = (i === parts.length - 1);
          var name  = last ? path.basename(next, path.extname(next)) : next;
          prev[name] = last ? parsed : {};
          return prev[next];
        }, obj);

        this[this.mode](obj);
      }
      else {
        this[this.mode](parsed);
      }
    }
  }
  return this;
};

Etc.prototype.folder = function (dir) {
  var self = this;
  dir = path.resolve(dir)
  var files = glob.sync(dir + '/**/*.*');
  files.forEach(function (file) {
    var rel = file.substr(dir.length).replace(/^\//, '');
    self.file(file, rel.indexOf('conf') !== 0, dir);
  });
  return this;
};

Etc.prototype.pkg = function (findModule) {
  var pkgPath;
  if (findModule) {
    if (typeof findModule === 'string') {
      pkgPath = findModule;
    }
    else {
      try {
        pkgPath = findPackage(findModule);
      }
      // Do nothing with the error
      catch(e){}
    }
  }
  else {
    try {
      pkgPath = findPackage(module.parent);
    }
    // Do nothing with the error
    catch(e){}
  }
  if (pkgPath) {
    var pkg = require(pkgPath);
    if (pkg.etc) {
      this[this.mode](pkg.etc);
    }
  }
  return this;
};

Etc.prototype.etc = function (dir) {
  var self = this;
  if (!dir) {
    var pkgPath;
    try {
      pkgPath = findPackage(module.parent);
    }
    // Do nothing with the error
    catch(e){}

    if (pkgPath) {
      dir = path.join(path.dirname(pkgPath), 'etc');
    }
  }

  if (dir) {
    self.folder(dir);
  }

  return this;
};

Etc.prototype.parseValue = function (value, parser) {
  parser = parser || JSON.parse;
  if (typeof parser === 'function') {
    try {
      value = parser(value);
    } catch (e) {}
  }
  return value;
};

Etc.prototype.parseJSON = function (filePath) {
  return require(filePath);
};

Etc.prototype.load = function (cb) {
  this.hooks('load').run(cb);
  return this;
};

Etc.prototype.save = function (cb) {
  this.hooks('save').run(cb);
  return this;
};
