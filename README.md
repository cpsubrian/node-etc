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
