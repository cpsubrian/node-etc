node-etc
========

Configuration loader for node.js applications.

Idea
----
Your application probably needs to load configuration from multiple different
sources and make them available (with fallbacks) as one object. Etc is here to
help! Etc provides a fairly complete API for loading configuration from a
variety of sources, however, its primary intended use case is to load config from
(in order of importance): argv, environment, files in `./etc`, and defaults.

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
  .etc();

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
(Chainable) Set a new configuration value. The key can be a simple string or a deliminated
string.

### etc.toJSON()
Returns all of the configuration, deep-merged into a single object.

### etc.use(plugin, options)
(Chainable) Attach an etc plugin. See more below.

### etc.all()
(Chainable) Alias for `etc.argv().env().etc().pkg()`

### etc.argv()
(Chainable) Parses argv using [optimist](https://github.com/substack/node-optimist)
and adds it to the configuration.

### etc.env(prefix [app], delim [_])
(Chainable) Adds any environment variables that start with the prefix
(defaults to 'app_') to the configuration. The prefix is stripped from the key.

### etc.add(obj)
(Chainable) Add configuration from an object literal.

### etc.file(filePath, [nameed])
(Chainable) Add configuration from a file. A suitable parser must be registered
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

### etc.folder(dir)
(Chainable) Loops through the files in `dir` and adds them to the configuration.
All files will be added with `named=true` (see etc.file()), except for one
special case when the filename is `config.*`.

### etc.pkg()
(Chainable) Try to find the local `package.json` for the consumer of etc and
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

### etc.etc()
(Chainable) Look for `[app root]/etc` (based on location of package.json) and
load it using `etc.folder()`.

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
Coming soon

### etc-redis
Coming soon


Credits
-------
Inspired by [dominictarr/rc](https://github.com/dominictarr/rc) and
[dominictarr/config-chain](https://github.com/dominictarr/config-chain), but
with more customization and less trolling in the README :)


Developed by [Terra Eclipse](http://www.terraeclipse.com)
--------------------------------------------------------
Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Aptos, CA and Washington, D.C.

[http://www.terraeclipse.com](http://www.terraeclipse.com)


License: MIT
------------
Copyright (C) 2012 Terra Eclipse, Inc.

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
