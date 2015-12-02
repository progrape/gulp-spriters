/**
 * Created by jf on 15/11/30.
 */

"use strict";

var assert = require('assert');
var path = require('path');
var vfs = require('vinyl-fs');
var through = require('through2');
var sprite = require('../');

describe('gulp-spriters', function () {

    before('xxx', function (done){
        vfs.src('test/fixtures/**/*.html')
            .pipe(vfs.dest('test/output'))
            .on('data', function (){

            })
            .on('end', done);
    });

    it('should merge 1x image', function (done) {

        vfs.src('test/fixtures/style.css')
            .pipe(sprite())
            .pipe(through.obj(function (vinyl, encoding, cb){
                var ext = path.extname(vinyl.path);
                cb(null, vinyl);
            }))
            .pipe(vfs.dest('./test/output/'))
            .on('data', function (){

            })
            .on('end', done);
    });

    it('should merge 2x image', function (done) {

        vfs.src('test/fixtures/style2.css')
            .pipe(sprite({margin: 2}))
            .pipe(through.obj(function (vinyl, encoding, cb){
                cb(null, vinyl);
            }))
            .pipe(vfs.dest('./test/output'))
            .on('data', function (){

            })
            .on('end', done);
    });

    it('should merge both 1x and 2x image', function (done) {

        vfs.src('test/fixtures/style3.css')
            .pipe(sprite())
            .pipe(through.obj(function (vinyl, encoding, cb){
                cb(null, vinyl);
            }))
            .pipe(vfs.dest('./test/output'))
            .on('data', function (){

            })
            .on('end', done);
    });

    it('should support `rootPath` params', function (done) {

        vfs.src('test/fixtures/style4.css')
            .pipe(sprite({rootPath: path.join(__dirname, 'fixtures/images')}))
            .pipe(through.obj(function (vinyl, encoding, cb){
                cb(null, vinyl);
            }))
            .pipe(vfs.dest('./test/output'))
            .on('data', function (){

            })
            .on('end', done);
    });


});
