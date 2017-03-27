const Depper = require('../src');
const tap = require('tap');
const fs = require('fs');
const path = require('path');

tap.test('depper', function (test) {
    test.plan(6);

    test.test('should handle import', function (test) {
        let d = new Depper();
        let entry = path.join(__dirname, '/fixtures/import/entry.scss');

        let rows = [];

        d.on('data', function (row) {
            rows.push(row);
        });

        d.on('finish', function () {
            test.same(rows.sort(), [
                path.join(__dirname, '/fixtures/import/entry.scss'),
                path.join(__dirname, '/fixtures/import/foo.scss'),
                path.join(__dirname, '/fixtures/import/bar.scss'),
                path.join(__dirname, '/fixtures/import/foo-bar.scss'),
                path.join(__dirname, '/fixtures/import/page.scss')
            ].sort());

            test.end();
        });

        d.end(entry);
    });

    test.test('should handle url', function (test) {
        let d = new Depper();
        let entry = path.join(__dirname, '/fixtures/url/entry.scss');

        let rows = [];

        d.on('data', function (row) {
            rows.push(row);
        });

        d.on('finish', function () {
            test.same(rows.sort(), [
                path.join(__dirname, '/fixtures/url/entry.scss'),
                path.join(__dirname, '/fixtures/url/foo.png'),
                path.join(__dirname, '/fixtures/url/bar.png'),
                path.join(__dirname, '/fixtures/url/foo-bar.png'),
                path.join(__dirname, '/fixtures/url/foo.eot')
            ].sort());

            test.end();
        });

        d.end(entry);
    });

    test.test('should emit "error" event', function (test) {
        let d = new Depper();
        let entry = path.join(__dirname, '/fixtures/error/entry.scss');

        let rows = [];

        d.on('error', function (err) {
            rows.push(err);
        });

        d.on('finish', function () {
            test.equal(rows.length, 1);
            test.equal(rows[0].file, path.join(__dirname, '/fixtures/error/entry.scss'));
            test.ok(rows[0].error);

            test.end();
        });

        d.end(entry);
    });

    test.test('should emit "missing" event', function (test) {
        let d = new Depper();
        let entry = path.join(__dirname, '/fixtures/missing/entry.scss');

        let rows = [];

        d.on('data', function (row) {
            rows.push(row);
        });

        d.on('missing', function (row) {
            rows.push(row);
        });

        d.on('finish', function () {
            test.same(rows.sort(), [
                path.join(__dirname, '/fixtures/missing/entry.scss'),
                path.join(__dirname, '/fixtures/missing/missing.scss')
            ].sort());

            test.end();
        });

        d.end(entry);
    });

    test.test('should handle circular dependencies', function (test) {
        let d = new Depper();
        let entry = path.join(__dirname, '/fixtures/circular/entry.scss');

        let rows = [];

        d.on('data', function (row) {
            rows.push(row);
        });

        d.on('finish', function () {
            test.same(rows.sort(), [
                path.join(__dirname, '/fixtures/circular/entry.scss'),
                path.join(__dirname, '/fixtures/circular/foo.scss')
            ].sort());

            test.end();
        });

        d.end(entry);
    });

    test.test('should accept syntax option', function (test) {
        let d = new Depper({
            syntax: 'css'
        });

        let entry = path.join(__dirname, '/fixtures/syntax-sass/entry.css');

        let rows = [];

        d.on('data', function (row) {
            rows.push(row);
        });

        d.on('finish', function () {
            test.same(rows.sort(), [
                path.join(__dirname, '/fixtures/syntax-sass/entry.css'),
                path.join(__dirname, '/fixtures/syntax-sass/foo.css')
            ].sort());

            test.end();
        });

        d.on('error', function (err) {
            test.fail(err);

            test.end();
        });

        d.end(entry);
    });
});