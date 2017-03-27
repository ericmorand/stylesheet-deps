const Depper = require('../src');
const tap = require('tap');
const fs = require('fs');
const path = require('path');

tap.test('depper', function (test) {
    test.plan(6);

    test.test('should handle import', function (test) {
        let d = new Depper();
        let entry = path.join(__dirname, '/fixtures/import/entry.css');

        let rows = [];

        d.on('data', function (row) {
            rows.push(row);
        });

        d.on('finish', function () {
            test.same(rows.sort(), [
                path.join(__dirname, '/fixtures/import/entry.css'),
                path.join(__dirname, '/fixtures/import/foo.css'),
                path.join(__dirname, '/fixtures/import/bar.css'),
                path.join(__dirname, '/fixtures/import/foo-bar.css'),
                path.join(__dirname, '/fixtures/import/page.css')
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

        d.on('finish', function () {
            test.same(rows.sort(), [
                path.join(__dirname, '/fixtures/url/entry.css'),
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

        d.on('data', function (row) {
            rows.push(row);
        });

        d.on('missing', function (row) {
            rows.push(row);
        });

        d.on('finish', function () {
            test.same(rows.sort(), [
                path.join(__dirname, '/fixtures/missing/entry.css'),
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

    test.test('should accept syntax option', function (test) {
        let d = new Depper({
            syntax: 'scss'
        });

        let entry = path.join(__dirname, '/fixtures/syntax-scss/entry.scss');

        let rows = [];

        d.on('data', function (row) {
            rows.push(row);
        });

        d.on('finish', function () {
            test.same(rows.sort(), [
                path.join(__dirname, '/fixtures/syntax-scss/entry.scss'),
                path.join(__dirname, '/fixtures/syntax-scss/foo.scss')
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