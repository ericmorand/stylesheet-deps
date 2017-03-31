const fs = require('fs');
const path = require('path');
const Transform = require('stream').Transform;
const unquote = require('unquote');
const Url = require('url');

class Depper extends Transform {
    constructor(options) {
        options = options || {};
        options.objectMode = true;

        super(options);

        this.syntax = options.syntax || 'css';
        this.gonzales = require('gonzales-pe');
        this.visited = new Map();
    }

    _transform(chunk, encoding, callback) {
        let self = this;

        let resolveData = function (data, file, parent) {

            let processNode = function (node) {
                let uri = unquote(node.content);
                let url = Url.parse(uri, false, true);

                let dependency = null;
                let remote = (url.host !== null);

                if (remote) {
                    dependency = uri;
                }
                else {
                    if (self.syntax !== 'css') {
                        let ext = '.' + self.syntax;

                        if (path.extname(uri) !== ext) {
                            uri += ext;
                        }
                    }

                    if (path.isAbsolute(uri)) {
                        dependency = uri;
                    }
                    else {
                        dependency = path.resolve(path.dirname(file), uri);
                    }
                }

                resolveFile(dependency, file);
            };

            let parseTree = null;

            try {
                parseTree = self.gonzales.parse(data.toString(), {
                    syntax: self.syntax
                });
            }
            catch (err) {
                // noop, we continue
            }

            if (parseTree) {
                parseTree.traverseByType('atrule', function (node) {
                    let atKeywordNode = node.first('atkeyword');

                    let identNode = atKeywordNode.first('ident');

                    if (identNode.content === 'import') {
                        let stringNode = node.first('string');

                        processNode(stringNode);
                    }
                });

                switch (self.syntax) {
                    case 'css': {
                        parseTree.traverseByType('uri', function (node) {
                            let stringNode = node.first('string');

                            if (!stringNode) {
                                stringNode = node.first('raw');
                            }

                            processNode(stringNode);
                        });

                        break;
                    }
                }
            }
        };

        let resolveFile = function (file, parent) {
            if (!self.visited.has(file)) {
                self.visited.set(file, true);

                let candidates = [file];

                switch (self.syntax) {
                    case 'sass':
                    case 'scss': {
                        let basename = path.basename(file);
                        let dirname = path.dirname(file);

                        basename = '_' + basename;

                        let candidate = path.join(dirname, basename);

                        candidates.push(candidate);
                    }
                }

                let missing = false;
                let data = null;

                let candidate = candidates.find(function (candidate) {
                    try {
                        data = fs.readFileSync(candidate);

                        return true;
                    }
                    catch (err) {
                        // noop, we just catch this
                    }
                });

                if (!candidate) {
                    candidates.forEach(function (candidate) {
                        self.emit('missing', candidate, parent);
                    });
                }
                else {
                    self.push(candidate);

                    resolveData(data, candidate);
                }
            }
        };

        let file = chunk.toString();

        if (this.inlineSource) {
            resolveData(this.inlineSource, file);
        }
        else {
            resolveFile(file, null);
        }

        callback();
    }

    inline(source, basedir, callback) {
        this.inlineSource = source;

        let inlineName = '__INLINE__' + Math.random();
        let file = path.resolve(basedir || process.cwd(), inlineName);

        this.write(file, 'utf8', callback);
    }
}

module.exports = Depper;