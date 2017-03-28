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

        let resolve = function (file, parent) {
            let ext = path.extname(file);

            let candidates = [file];

            switch (self.syntax) {
                case 'sass':
                case 'scss': {
                    // partial syntax support
                    switch (ext) {
                        case '.sass':
                        case '.scss': {
                            let basename = path.basename(file);
                            let dirname = path.dirname(file);

                            basename = '_' + basename;

                            let candidate = path.join(dirname, basename);

                            candidates.push(candidate);
                        }
                    }
                }
            }

            let processNode = function (node) {
                let uri = unquote(node.content);
                let url = Url.parse(uri, false, true);

                let dependency = null;
                let remote = (url.host !== null);

                if (remote) {
                    dependency = uri;
                }
                else {
                    if (path.extname(uri).length === 0) {
                        uri += ext;
                    }

                    if (path.isAbsolute(uri)) {
                        dependency = uri;
                    }
                    else {
                        dependency = path.resolve(path.dirname(file), uri);
                    }
                }

                resolve(dependency, file);
            };

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
                file = candidate;

                if (!self.visited.has(file)) {
                    self.visited.set(file, true);

                    self.push(file);

                    try {
                        let parseTree = self.gonzales.parse(data.toString(), {
                            syntax: self.syntax
                        });

                        parseTree.traverseByType('atrule', function (node) {
                            let atKeywordNode = node.first('atkeyword');

                            let identNode = atKeywordNode.first('ident');

                            if (identNode.content === 'import') {
                                let stringNode = node.first('string');

                                processNode(stringNode);
                            }
                        });

                        parseTree.traverseByType('uri', function (node) {
                            let stringNode = node.first('string');

                            if (!stringNode) {
                                stringNode = node.first('raw');
                            }

                            processNode(stringNode);
                        });
                    }
                    catch (err) {
                        throw({
                            file: file,
                            error: err
                        });
                    }
                }
            }
        };

        try {
            resolve(chunk.toString(), null);

            callback();
        }
        catch (err) {
            callback(err);
        }
    }
}

module.exports = Depper;