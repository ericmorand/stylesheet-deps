# stylesheet-deps

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

Walk the dependency graph of a stylesheet.

## Installation

```bash
npm install stylesheet-deps
```

# API

`let SSDeps = require('stylesheet-deps')`

## depper = SSDeps(opts={})

Return an object transform stream `depper` that expects entry filenames.

Optionally pass in some opts:

* opts.syntax - any of the following: `css`, `less`, `sass`, `scss`. Default one is `css`.

## depper.inline(source, basedir, callback)

Adds a new inline file to the dependency graph, where source is the stylesheet source to include and basedir is the directory to pretend it's being created in. A basedir is required to properly resolve dependencies and defaults to process.cwd().

# Example

``` js
var SSDeps = require('stylesheet-deps');

var depper = new SSDeps();
var entry = '/path/to/your/stylesheet.css';

depper.on('data', function (dependency) {
    // do something with dependency
});

depper.on('missing', function (dependency) {
    // do something with missing dependency
});

depper.on('error', function (error) {
    // do something on error
});

d.end(entry);
```

## Contributing

* Fork the main repository
* Code
* Implement tests using [node-tap](https://github.com/tapjs/node-tap)
* Issue a pull request keeping in mind that all pull requests must reference an issue in the issue queue

## License

Apache-2.0 © [Eric MORAND]()

[npm-image]: https://badge.fury.io/js/stylesheet-deps.svg
[npm-url]: https://npmjs.org/package/stylesheet-deps
[travis-image]: https://travis-ci.org/ericmorand/stylesheet-deps.svg?branch=master
[travis-url]: https://travis-ci.org/ericmorand/stylesheet-deps
[daviddm-image]: https://david-dm.org/ericmorand/stylesheet-deps.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/ericmorand/stylesheet-deps
[coveralls-image]: https://coveralls.io/repos/github/ericmorand/stylesheet-deps/badge.svg
[coveralls-url]: https://coveralls.io/github/ericmorand/stylesheet-deps