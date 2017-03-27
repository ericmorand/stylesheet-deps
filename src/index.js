const fs = require('fs');
const path = require('path');
const Transform = require('stream').Transform;
const unquote = require('unquote');

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

        console.log(chunk);

        let resolve = function (file, parent) {
            let ext = path.extname(file);

            let missing = false;
            let data = null;

            try {
                data = fs.readFileSync(file);
            }
            catch (err) {
                missing = true;
            }

            if (missing) {
                self.emit('missing', file, parent);
            }
            else {
                if (!self.visited.has(file)) {
                    self.visited.set(file, true);

                    self.push(file);
                }

                try {
                    let parseTree = self.gonzales.parse(data.toString(), {
                        syntax: self.syntax
                    });

                    parseTree.traverseByType('atrule', function (node) {
                        let atKeywordNode = node.first('atkeyword');

                        let identNode = atKeywordNode.first('ident');

                        if (identNode.content == 'import') {
                            let stringNode = node.first('string');
                            let uri = unquote(stringNode.content);
                            let dependency = path.resolve(path.dirname(file), uri);

                            if (path.extname(dependency).length == 0) {
                                dependency += ext; // @todo should be an option
                            }

                            resolve(dependency, file);
                        }
                    });

                    parseTree.traverseByType('uri', function (node) {
                        let stringNode = node.first('string');

                        if (!stringNode) {
                            stringNode = node.first('raw');
                        }

                        let uri = unquote(stringNode.content);
                        let dependency = path.resolve(path.dirname(file), uri);

                        resolve(dependency, file);
                    });
                }
                catch (err) {
                    throw({
                        file: file,
                        error: err
                    });
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