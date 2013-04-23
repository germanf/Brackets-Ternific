/*
 * Copyright (c) 2013 Miguel Castillo.
 *
 * Licensed under MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */


define(function (require, exports, module) {
    'use strict';

    var TernProvider   = require("TernProvider"),
        TernHints      = require("TernHints"),
        TernReferences = require("TernReferences"),
        TernTypes      = require("TernTypes");


    /**
    *  Controls the interaction between codemirror and tern
    */
    function TernManager () {
        var onReady = $.Deferred();

        //var ternProvider = new TernProvider.Remote();
        var ternProvider = new TernProvider.Local();
        ternProvider.onReady(onReady.resolve);

        this.ternHints      = new TernHints(ternProvider);
        this.ternReferences = new TernReferences(ternProvider);
        this.ternTypes      = new TernTypes(ternProvider);
        this.ternProvider   = ternProvider;
        this.onReady        = onReady.promise().done;
    }


    TernManager.prototype.clear = function () {
        this.unregister();
        this.ternProvider.clear();
    };


    /**
    * Register a document with tern
    *
    * @param cm is a code mirror instance we will be operating on.
    * We register listeners for keybinding and we also extract the
    * document content and feed it to tern.
    *
    * @param file is just a file object.  The only thing we currenly
    * use is the fullPath, which also includes the file name.  We
    * map the code mirror instance to that file name.
    *
    */
    TernManager.prototype.register = function (cm, file) {
        if (!cm) {
            throw new TypeError("CodeMirror instance must be valid");
        }

        if (!file) {
            throw new TypeError("File object must be valid");
        }

        var _self = this;
        _self.unregister();
        _self._cm = cm;
        cm._ternBindings = _self;

        var keyMap = {
            "name": "ternBindings",
            "Ctrl-I": function(){
                _self.ternTypes.findType(cm);
            },
            "Alt-.": function() {
                //_self.ternReferences.jumpToDef
            },
            "Alt-,": function() {
                //_self.ternReferences.jumpBack
            },
            "Ctrl-R": function() {
                _self.ternReferences.findReferences(cm);
            }
        };

        // Register key events
        cm.addKeyMap(keyMap);
        _self.ternProvider.register(cm, file.fullPath);
    };


    /**
    * Unregister a previously registered document.  We simply unbind
    * any keybindings we have registered
    */
    TernManager.prototype.unregister = function () {
        var _self = this,
            cm = _self._cm;
        if (!cm || !cm._ternBindings) {
            return;
        }

        cm.removeKeyMap("ternBindings");
        delete cm._ternBindings;
        _self.ternProvider.unregister(cm);
    };


    return TernManager;

});

