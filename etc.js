var util = require('util');
var ProtoListDeep = require('proto-list-deep');
var optimist = require('optimist');
var fs = require('fs');
var path = require('path');
var glob = require('glob');

module.exports = function(delim) {
  return new Etc(delim);
};

function Etc(delim) {
  this.delim = delim || ':';
  this.parsers = {
    'json': this.parseJSON,
    'js': this.parseJSON
  };
  ProtoListDeep.call(this, this.delim);
}
util.inherits(Etc, ProtoListDeep);

Etc.prototype.get = function(key) {
  var conf = this.deepSnapshot;
  var parts = key.split(this.delim);

  parts.forEach(function(part) {
    if (conf[part]) {
      conf = conf[part];
    }
    else {
      return undefined;
    }
  });

  return conf;
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
  Object.keys(optimist.argv).forEach(function(key) {
    self.set(key, optimist.argv[key]);
  });
  return this;
};

Etc.prototype.env = function(prefix, delim) {
  delim = delim || '_';
  prefix = (prefix || 'app') + delim;

  var self = this;
  var len = prefix.length;

  Object.keys(process.env).forEach(function(key) {
    if (key.indexOf(prefix) === 0) {
      self.set(key.substr(len), process.env[key]);
    }
  });

  return this;
};

Etc.prototype.add = function(obj) {
  this.push(obj);
  return this;
};

Etc.prototype.file = function(file, named) {
  if (fs.existsSync(file)) {
    var ext = path.extname(file).substr(1);
    if (this.parsers[ext]) {
      var parsed = this.parsers[ext].call(this, file);
      if (named) {
        var name = path.basename(file, path.extname(file));
        var obj = {};
        obj[name] = parsed;
        this.push(obj);
      }
      else {
        this.push(parsed);
      }
    }
  }
  return this;
};

Etc.prototype.folder = function(dir) {
  var self = this;
  var files = glob.sync(dir + '/*.*');
  files.forEach(function(file) {
    var name = path.basename(file, path.extname(file));
    self.file(file, name !== 'config');
  });
};

Etc.prototype.pkg = function(module) {
  var pkgPath;
  if (module) {
    pkgPath = findPackage(path.dirname(module.filename));
  }
  else {
    pkgPath = findPackage();
  }
  if (pkgPath) {
    var pkg = require(pkgPath);
    if (pkg.etc) {
      this.push(pkg.etc);
    }
  }
  return this;
};

Etc.prototype.etc = function(dir) {
  var self = this;
  if (!dir) {
    var pkgPath = findPackage();
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

function findPackage(dir) {
  dir = dir || path.dirname(module.parent.filename);
  var pkgPath = path.join(dir, 'package.json');
  if (dir === '/') {
    return false;
  }
  else if (fs.existsSync(pkgPath)) {
    return pkgPath;
  }
  else {
    return findPackage(path.resolve(dir, '..'));
  }
}
