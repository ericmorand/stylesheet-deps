const Depper = require('../src');
const tap = require('tap');
const fs = require('fs');
const path = require('path');

tap.test('depper', function (test) {
    test.plan(7);

    test.test('should handle import', function (test) {
        let d = new Depper();
        let entry = path.join(__dirname, '/fixtures/import/entry.css');

        let rows = [];

        d.on('data', function (row) {
            rows.push(row);
        });

        d.on('missing', function (row) {
            rows.push(row);
        });

        d.on('error', function (err) {
            t.fail();

            t.end();
        });

        d.on('finish', function () {
            test.same(rows.sort(), [
                path.join(__dirname, '/fixtures/import/entry.css'),
                path.join(__dirname, '/fixtures/import/foo.css'),
                path.join(__dirname, '/fixtures/import/bar.css'),
                path.join(__dirname, '/fixtures/import/foo-bar.css'),
                '/foo/bar.css',
                '/bar/foo'
            ].sort());

            test.end();
        });

        d.end(entry);
    });

    test.test('should handle url', function (test) {
        let d = new Depper();
        let entry = path.join(__dirname, '/fixtures/url/entry.css');

        let rows = [];

        d.on('data', function (row) {
            rows.push(row);
        });

        d.on('missing', function (row) {
            rows.push(row);
        });

        d.on('finish', function () {
            test.same(rows.sort(), [
                path.join(__dirname, '/fixtures/url/entry.css'),
                path.join(__dirname, '/fixtures/assets/foo.png'),
                path.join(__dirname, '/fixtures/assets/bar.png'),
                path.join(__dirname, '/fixtures/assets/foo-bar.png'),
                path.join(__dirname, '/fixtures/assets/foo.eot'),
                '/foo/bar.png',
                '//foo.bar/foo.png',
                'http://foo.bar/foo.png'
            ].sort());

            test.end();
        });

        d.end(entry);
    });

    test.test('should handle url inside import', function (test) {
        let d = new Depper();
        let entry = path.join(__dirname, '/fixtures/url-inside-import/entry.css');

        let rows = [];

        d.on('data', function (row) {
            rows.push(row);
        });

        d.on('missing', function (row) {
            rows.push(row);
        });

        d.on('finish', function () {
            test.same(rows.sort(), [
                path.join(__dirname, '/fixtures/url-inside-import/entry.css'),
                path.join(__dirname, '/fixtures/url-inside-import/foo.css'),
                path.join(__dirname, '/fixtures/assets/foo.png')
            ].sort());

            test.end();
        });

        d.end(entry);
    });

    test.test('should emit "missing" event', function (test) {
        let d = new Depper();
        let entry = path.join(__dirname, '/fixtures/missing/entry.css');

        let rows = [];

        d.on('missing', function (row) {
            rows.push(row);
        });

        d.on('finish', function () {
            test.same(rows.sort(), [
                path.join(__dirname, '/fixtures/missing/missing.css')
            ].sort());

            test.end();
        });

        d.end(entry);
    });

    test.test('should handle circular dependencies', function (test) {
        let d = new Depper();
        let entry = path.join(__dirname, '/fixtures/circular/entry.css');

        let rows = [];

        d.on('data', function (row) {
            rows.push(row);
        });

        d.on('finish', function () {
            test.same(rows.sort(), [
                path.join(__dirname, '/fixtures/circular/entry.css'),
                path.join(__dirname, '/fixtures/circular/foo.css')
            ].sort());

            test.end();
        });

        d.on('error', function (err) {
            test.fail(err);

            test.end();
        });

        d.end(entry);
    });

    test.test('should handle syntax', function (test) {
        test.plan(4);

        test.test('css', function (test) {
            let d = new Depper();
            let entry = path.join(__dirname, '/fixtures/syntax-specific/css/entry.css');

            let rows = [];
            let missing = [];

            d.on('data', function (row) {
                rows.push(row);
            });

            d.on('missing', function (row) {
                missing.push(row);
            });

            d.on('finish', function () {
                test.same(rows.sort(), [
                    path.join(__dirname, '/fixtures/syntax-specific/css/entry.css'),
                    path.join(__dirname, '/fixtures/syntax-specific/css/bar.css'),
                    path.join(__dirname, '/fixtures/assets/foo.png'),
                    path.join(__dirname, '/fixtures/assets/bar.png')
                ].sort());

                test.same(missing.sort(), [
                    path.join(__dirname, '/fixtures/syntax-specific/css/missing.css'),
                ].sort());

                test.end();
            });

            d.end(entry);
        });

        test.test('less', function (test) {
            let d = new Depper({
                syntax: 'less'
            });
            let entry = path.join(__dirname, '/fixtures/syntax-specific/less/entry.less');

            let rows = [];
            let missing = [];

            d.on('data', function (row) {
                rows.push(row);
            });

            d.on('missing', function (row) {
                missing.push(row);
            });

            d.on('finish', function () {
                test.same(rows.sort(), [
                    path.join(__dirname, '/fixtures/syntax-specific/less/entry.less'),
                    path.join(__dirname, '/fixtures/syntax-specific/less/bar.less'),
                    path.join(__dirname, '/fixtures/syntax-specific/less/foo.less')
                ].sort());

                test.same(missing.sort(), [
                    path.join(__dirname, '/fixtures/syntax-specific/less/missing.less')
                ].sort());

                test.end();
            });

            d.end(entry);
        });

        test.test('sass', function (test) {
            let d = new Depper({
                syntax: 'sass'
            });
            let entry = path.join(__dirname, '/fixtures/syntax-specific/sass/entry.sass');

            let rows = [];
            let missing = [];

            d.on('data', function (row) {
                rows.push(row);
            });

            d.on('missing', function (row) {
                missing.push(row);
            });

            d.on('finish', function () {
                test.same(rows.sort(), [
                    path.join(__dirname, '/fixtures/syntax-specific/sass/entry.sass'),
                    path.join(__dirname, '/fixtures/syntax-specific/sass/bar.sass'),
                    path.join(__dirname, '/fixtures/syntax-specific/sass/_foo.sass'),
                ].sort());

                test.same(missing.sort(), [
                    path.join(__dirname, '/fixtures/syntax-specific/sass/missing.sass'),
                    path.join(__dirname, '/fixtures/syntax-specific/sass/_missing.sass')
                ].sort());

                test.end();
            });

            d.end(entry);
        });

        test.test('scss', function (test) {
            let d = new Depper({
                syntax: 'scss'
            });
            let entry = path.join(__dirname, '/fixtures/syntax-specific/scss/entry.scss');

            let rows = [];
            let missing = [];

            d.on('data', function (row) {
                rows.push(row);
            });

            d.on('missing', function (row) {
                missing.push(row);
            });

            d.on('finish', function () {
                test.same(rows.sort(), [
                    path.join(__dirname, '/fixtures/syntax-specific/scss/entry.scss'),
                    path.join(__dirname, '/fixtures/syntax-specific/scss/bar.scss'),
                    path.join(__dirname, '/fixtures/syntax-specific/scss/_foo.scss')
                ].sort());

                test.same(missing.sort(), [
                    path.join(__dirname, '/fixtures/syntax-specific/scss/missing.scss'),
                    path.join(__dirname, '/fixtures/syntax-specific/scss/_missing.scss')
                ].sort());

                test.end();
            });

            d.end(entry);
        });
    });

    test.test('should support inline source', function (test) {
        test.plan(2);

        test.test('with basedir', function(test) {
            let d = new Depper();
            let entry = path.join(__dirname, '/fixtures/inline/entry.css');

            let rows = [];
            let missing = [];

            d.on('data', function (row) {
                rows.push(row);
            });

            d.on('missing', function (row) {
                missing.push(row);
            });

            d.on('finish', function () {
                test.same(rows.sort(), [
                    path.join(__dirname, '/fixtures/inline/foo.css'),
                    path.join(__dirname, '/fixtures/assets/foo.png')
                ].sort());

                test.same(missing.sort(), [
                    path.join(__dirname, '/fixtures/inline/missing.css')
                ].sort());

                test.end();
            });

            d.inline(fs.readFileSync(entry), path.dirname(entry));

            d.end();
        });

        test.test('without basedir', function(test) {
            let d = new Depper();
            let entry = path.join(__dirname, '/fixtures/inline/entry.css');

            let rows = [];
            let missing = [];

            d.on('data', function (row) {
                rows.push(row);
            });

            d.on('missing', function (row) {
                missing.push(row);
            });

            d.on('finish', function () {
                test.same(rows.sort(), [].sort());

                test.same(missing.sort(), [
                    path.join(process.cwd(), 'foo.css'),
                    path.join(process.cwd(), 'missing.css')
                ].sort());

                test.end();
            });

            d.inline(fs.readFileSync(entry));

            d.end();
        });
    });
});