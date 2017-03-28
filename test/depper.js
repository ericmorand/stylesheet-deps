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

        d.on('finish', function () {
            test.same(rows.sort(), [
                path.join(__dirname, '/fixtures/import/entry.css'),
                path.join(__dirname, '/fixtures/import/foo.css'),
                path.join(__dirname, '/fixtures/import/bar.css'),
                path.join(__dirname, '/fixtures/import/foo-bar.css'),
                path.join(__dirname, '/fixtures/import/page.css'),
                '/foo/bar.css',
                '/bar/foo.css'
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

    test.test('should emit "error" event', function (test) {
        let d = new Depper();
        let entry = path.join(__dirname, '/fixtures/error/entry.css');

        let rows = [];

        d.on('error', function (err) {
            rows.push(err);
        });

        d.on('finish', function () {
            test.equal(rows.length, 1);
            test.equal(rows[0].file, path.join(__dirname, '/fixtures/error/entry.css'));
            test.ok(rows[0].error);

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

            d.on('data', function (row) {
                rows.push(row);
            });

            d.on('missing', function (row) {
                rows.push(row);
            });

            d.on('finish', function () {
                test.same(rows.sort(), [
                    path.join(__dirname, '/fixtures/syntax-specific/css/entry.css'),
                    path.join(__dirname, '/fixtures/syntax-specific/css/bar.css'),
                    path.join(__dirname, '/fixtures/assets/foo.png'),
                    path.join(__dirname, '/fixtures/assets/bar.png')
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

            d.on('data', function (row) {
                rows.push(row);
            });

            d.on('missing', function (row) {
                rows.push(row);
            });

            d.on('finish', function () {
                test.same(rows.sort(), [
                    path.join(__dirname, '/fixtures/syntax-specific/sass/entry.sass'),
                    path.join(__dirname, '/fixtures/syntax-specific/sass/bar.sass'),
                    path.join(__dirname, '/fixtures/syntax-specific/sass/_foo.sass'),
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

            d.on('data', function (row) {
                rows.push(row);
            });

            d.on('missing', function (row) {
                rows.push(row);
            });

            d.on('finish', function () {
                test.same(rows.sort(), [
                    path.join(__dirname, '/fixtures/syntax-specific/scss/entry.scss'),
                    path.join(__dirname, '/fixtures/syntax-specific/scss/bar.scss'),
                    path.join(__dirname, '/fixtures/syntax-specific/scss/_foo.scss'),
                    path.join(__dirname, '/fixtures/syntax-specific/scss/missing.scss'),
                    path.join(__dirname, '/fixtures/syntax-specific/scss/_missing.scss')
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

            d.on('data', function (row) {
                rows.push(row);
            });

            d.on('missing', function (row) {
                rows.push(row);
            });

            d.on('finish', function () {
                test.same(rows.sort(), [
                    path.join(__dirname, '/fixtures/syntax-specific/less/entry.less'),
                    path.join(__dirname, '/fixtures/syntax-specific/less/bar.less'),
                    path.join(__dirname, '/fixtures/syntax-specific/less/missing.less')
                ].sort());

                test.end();
            });

            d.end(entry);
        });
    });
});