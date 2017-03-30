const fs = require('fs');
const path = require('path');
const Transform = require('stream').Transform;
const unquote = require('unquote');
const Url = require('url');
const css = require('css');
const addIterations = require('css-ast-iterations');

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
        let urlRegex = /url\(([^,)]+)\)/ig;

        let resolveData = function (data, file, parent) {
            let processNodeContent = function (nodeContent) {
                let uri = unquote(nodeContent);
                let url = Url.parse(uri, false, true);

                let dependency = null;
                let remote = (url.host !== null);

                if (remote) {
                    dependency = uri;
                }
                else {
                    if (self.syntax !== 'css') {
                        if (path.extname(uri).length === 0) {
                            uri += '.' + self.syntax;
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
                if (self.syntax === 'css') {
                    parseTree = css.parse(data.toString());

                    addIterations(parseTree);
                }
                else {
                    parseTree = self.gonzales.parse(data.toString(), {
                        syntax: self.syntax
                    });
                }
            }
            catch (err) {
                // noop, we continue
            }

            if (parseTree) {
                if (self.syntax === 'css') {
                    let nodeContents = [];

                    let processNode = function (node) {
                        let result = null;

                        while (result = urlRegex.exec(node.value)) {
                            nodeContents.push(result[1]);
                        }
                    };

                    parseTree.findAllImport(function (url) {
                        nodeContents.push(url);
                    });

                    parseTree.findAllRulesByType('font-face', function (rule) {
                        rule.declarations.forEach(function (node) {
                            processNode(node);
                        });
                    });

                    parseTree.findAllDeclarations(function (node) {
                        processNode(node);
                    });

                    nodeContents.forEach(function (nodeContent) {
                        processNodeContent(nodeContent)
                    });
                }
                else {
                    parseTree.traverseByType('atrule', function (node) {
                        let atKeywordNode = node.first('atkeyword');

                        let identNode = atKeywordNode.first('ident');

                        if (identNode.content === 'import') {
                            let stringNode = node.first('string');

                            processNodeContent(stringNode.content);
                        }
                    });
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