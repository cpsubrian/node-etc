var util = require('util')
  , ProtoListDeep = require('proto-list-deep')
  , optimist = require('optimist')
  , fs = require('fs')
  , path = require('path')
  , existsSync = fs.existsSync ? fs.existsSync : path.existsSync
  , glob = require('glob')
  , findPackage = require('witwip')
  , eventflow = require('eventflow');

module.exports = function(delim) {
  return new Etc(delim);
};

function Etc(delim) {
  this.delim = delim || ':';
  this.parsers = {
    'json': this.parseJSON,
    'js': this.parseJSON
  };
  this.mode = 'push';
  ProtoListDeep.call(this, this.delim);
  eventflow(this);
}
util.inherits(Etc, ProtoListDeep);

Etc.prototype.reverse = function() {
  this.mode = (this.mode === 'push') ? 'unshift' : 'push';
  return this;
};

Etc.prototype.get = function(key) {
  var conf = this.deepSnapshot;
  if (typeof key === 'undefined') return conf;

  return key.split(this.delim).reduce(function(prev, part) {
    return prev !== undefined && typeof prev[part] !== 'undefined' ? prev[part] : undefined;
  }, conf);
};

Etc.prototype.set = function(key, value) {
  var full = {};
  var level = full;
  var parts = key.split(this.delim);
  var last = parts.pop();

  parts.forEach(function(part) {
    if (!level[part]) level[part] = {};
    level = level[part];
  });
  level[last] = value;

  this.unshift(full);
  return this;
};

Etc.prototype.toJSON = function(callback) {
  return this.deepSnapshot;
};

Etc.prototype.use = function(plugin, options) {
  if (plugin.attach) {
    plugin.attach.call(this, options);
  }
  return this;
};

Etc.prototype.all = function() {
  this.argv().env().etc().pkg();
  return this;
};

Etc.prototype.argv = function() {
  var self = this;
  if (optimist.argv) {
    this[this.mode](optimist.argv);
  }
  return this;
};

Etc.prototype.env = function(prefix, delim) {
  delim = delim || '_';
  prefix = (prefix || 'app') + delim;

  var self = this;
  var len = prefix.length;
  var env = {};

  Object.keys(process.env).forEach(function(key) {
    if (key.indexOf(prefix) === 0) {
      env[key.substr(len)] = process.env[key];
    }
  });

  this[this.mode](env);

  return this;
};

Etc.prototype.add = function(obj) {
  this[this.mode](obj);
  return this;
};

Etc.prototype.file = function(file, named, baseDir) {
  if (existsSync(file)) {
    var ext = path.extname(file).substr(1);
    if (this.parsers[ext]) {
      var parsed = this.parsers[ext].call(this, file);
      if (named) {
        var parts = file.substr(baseDir.length).replace(/^\//, '').split('/'),
            obj = {};

        parts.reduce(function(prev, next, i) {
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

Etc.prototype.folder = function(dir) {
  var self = this;
  var files = glob.sync(dir + '/**/*.*');
  files.forEach(function(file) {
    var rel = file.substr(dir.length).replace(/^\//, '');
    self.file(file, rel.indexOf('conf') !== 0, dir);
  });
  return this;
};

Etc.prototype.pkg = function(findModule) {
  var pkgPath;
  if (findModule) {
    if (typeof findModule === 'string') {
      pkgPath = findModule;
    }
    else {
      try {
        pkgPath = findPackage(findModule);
      } catch(e){} // Do nothing with the error
    }
  }
  else {
    try {
      pkgPath = findPackage(module.parent);
    } catch(e){} // Do nothing with the error
  }
  if (pkgPath) {
    var pkg = require(pkgPath);
    if (pkg.etc) {
      this[this.mode](pkg.etc);
    }
  }
  return this;
};

Etc.prototype.etc = function(dir) {
  var self = this;
  if (!dir) {
    var pkgPath;
    try {
      pkgPath = findPackage(module.parent);
    } catch(e){} // Do nothing with the error

    if (pkgPath) {
      dir = path.join(path.dirname(pkgPath), 'etc');
    }
  }

  if (dir) {
    self.folder(dir);
  }

  return this;
};

Etc.prototype.parseJSON = function(filePath) {
  return require(filePath);
};

Etc.prototype.load = function (cb) {
  this.series('load', cb);
};

Etc.prototype.save = function (cb) {
  this.series('save', cb);
};
