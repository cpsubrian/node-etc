node-etc
========

Configuration loader for node.js applications.

[![build status](https://secure.travis-ci.org/cpsubrian/node-etc.png)](http://travis-ci.org/cpsubrian/node-etc)

Idea
----
Your application probably needs to load configuration from multiple sources and
make them available as one object. Etc is here to help!

Etc provides a fairly complete API for loading configuration from a
variety of sources, however, its been engineered to easily load config from
(in order of precedence): argv, environment, files in `./etc`, package.json, and
 defaults. Etc. also supports a simple plugin system so new file parsers or other
 sources of configuration can be handled.

Examples
--------
#### Easy Mode
```js
var conf = require('etc')().all().toJSON();
```

#### Easy Mode done manually
```js
var etc = require('etc')();

etc
  .argv()
  .env()
  .etc()
  .pkg();

var conf = etc.toJSON();
```

#### Load configuration from argv, env, a file, and defaults.
```js
var etc = require('etc')();

etc.argv();
etc.env();
etc.file('/path/to/you/file/config.json');
etc.add({
  my: 'defaults'
});

var conf = etc.toJSON();
```

#### Load configuration from `/etc/myapp/*`
```js
var etc = require('etc')();
etc.folder('/etc/myapp');
var conf = etc.toJSON();
```

#### Work with configuration using deliminated keys
```js
var etc = require('etc')();

etc.add({
  host: 'localhost',
  port: 3000,
  meta: {
    title: 'Cool title'
  }
});

console.log(etc.get('meta:title'));
// Cool title

etc.set('meta:description', 'This is a really cool app');

console.log(etc.get('meta'));
// { title: 'Cool title',
//  description: 'This is a really cool app' }
```

API
---
### require('etc')([delim])
Etc exports a factory function the creates instances of `Etc` objects. You can
optionally specify the key delimiter to use (defaults to ` : `)

### etc.get(key)
Fetch a value from the configuration stack. Keys can be simple strings or
deliminated strings such as `db:host`, which will dive into the configuration
to grab a nested value.

### etc.set(key, value)
Set a new configuration value. Primitives will override exsting values
whereas Objects and Arrays will merge. The key can be a simple string or a
deliminated string. (Chainable)

### etc.reset(key, value)
Set a configuration value, overriding whatever was there. The key can be a
simple string or a deliminated string. (Chainable)

### etc.clear(key)
Clear the configuration stored under a given key. The key can be a simple string
or a deliminated string. (Chainable)

### etc.toJSON()
Returns all of the configuration, deep-merged into a single object.

### etc.use(plugin, options)
Attach an etc plugin. See more below. (Chainable)

### etc.all()
Alias for `etc.argv().env().etc().pkg()` (Chainable)

### etc.argv()
Parses argv using [optimist](https://github.com/substack/node-optimist)
and adds it to the configuration. (Chainable)

### etc.env(prefix [app], delim [_])
Adds any environment variables that start with the prefix
(defaults to 'app_') to the configuration. The prefix is stripped from the key.
 (Chainable)

### etc.add(obj)
Add configuration from an object literal. (Chainable)

### etc.file(filePath, [nameed])
Add configuration from a file. A suitable parser must be registered
in etc.parsers ('.json' and '.js' supported by default). If `named` is true
then the extension will be stripped from the filename and the contents will
be added nested under that name.

For example, if your filename is `/path/to/conf/db.json`, then the configuration
will be added like:

```
{
  "db": { [contents of db.json ] }
}

```
(Chainable)

### etc.folder(dir)
Loops through the files in `dir` and adds them to the configuration.
All files will be added with `named=true` (see etc.file()), except for one
special case when the filename is `config.*`. (Chainable)

### etc.pkg()
Try to find the local `package.json` for the consumer of etc and
look for an `etc` key in it. If it exists then add the contents to the
configuration.

Example:
```
{
  "name": "etc-example",
  "description": "Etc example",
  "main": "example.js",
  "dependencies": {
    "etc": "*"
  },
  "etc": {
    "db": {
      "host": "localhost",
      "port": 3000
    }
  }
}
```
(Chainable)

### etc.etc()
Look for `[app root]/etc` (based on location of package.json) and
load it using `etc.folder()`. (Chainable)

### etc.reverse()
By default, each call to etc that adds more configuration pushes it on the
bottom of the stack. If you wish to unshift conf onto the top of the stack
instead you can call `etc.reverse()` followed by any other etc commands.
Until you call `etc.reverse()` again all subsequent etc methods will continue
to unshift.

Plugins
-------
Etc supports a simple plugin system, primarily useful for adding new file
parsers. Plugins should implement an `attach` method like so:

```js
exports.attach = function(options) {
  options = options || {};

  // Plugin will be attached with the scope set to an etc instance.
  var etc = this;

  etc.parsers['xml'] = xmlparser;
}

function xmlparser(filePath) {
  // Parse the file and return an object literal.
}
```

### etc-yaml
Support for YAML configuration files can be added via [etc-yaml](https://github.com/cpsubrian/node-etc-yaml).
```js
var etc = require('etc'),
    path = require('path'),
    conf = etc();

conf.use(require('etc-yaml'));

// Load a yaml file.
conf.file(path.join(__dirname, 'config.yaml'));

// Print the config.
console.log(conf.toJSON());
```

### etc-redis
Maybe eventually if I need it :) (or make it yourself).


Credits
-------
Inspired by [dominictarr/rc](https://github.com/dominictarr/rc) and
[dominictarr/config-chain](https://github.com/dominictarr/config-chain), but
with deep-merging and less trolling in the README :)


Developed by [Terra Eclipse](http://www.terraeclipse.com)
--------------------------------------------------------
Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Aptos, CA and Washington, D.C.

[http://www.terraeclipse.com](http://www.terraeclipse.com)


License: MIT
------------
Copyright (C) 2015 Terra Eclipse, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
