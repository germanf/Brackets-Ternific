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


/** Brackets Extension to load line navigator CodeMirror addon */
define(["require", "exports", "module", "TernManager", "HintsTransform"], function (require, exports, module, TernManager, HintsTransform) {
	"use strict";

	var DocumentManager     = brackets.getModule("document/DocumentManager"),
		EditorManager       = brackets.getModule("editor/EditorManager"),
		AppInit             = brackets.getModule("utils/AppInit"),
		FileUtils           = brackets.getModule("file/FileUtils"),
		ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
		CodeHintManager 	= brackets.getModule("editor/CodeHintManager");


  	function InitHints () {
		var jsMode = "javascript";

		var session     = null;


		function Hints () {
		}


		Hints.prototype.hasHints = function (editor, implicitChar) {
			return true;
		}


		Hints.prototype.getHints = function (implicitChar) {
			var promise = $.Deferred();

			TernManager.getHints().done(function(response) {
				var query = "";
			  	var hints = HintsTransform(response.list, query);
				promise.resolve(hints);
			});

			return promise;
		}


		Hints.prototype.insertHint = function (hint) {

		}


		/*
		 * Handle the activeEditorChange event fired by EditorManager.
		 * Uninstalls the change listener on the previous editor
		 * and installs a change listener on the new editor.
		 *
		 * @param {Event} event - editor change event (ignored)
		 * @param {Editor} current - the new current editor context
		 * @param {Editor} previous - the previous editor context
		 */
		function handleActiveEditorChange(event, current, previous) {
			TernManager.registerEditor(current);

			if ( previous ) {
				TernManager.unregisterEditor(previous);
			}
		}


		var jsHints = new Hints();
		CodeHintManager.registerHintProvider(jsHints, [jsMode], 0);

		// uninstall/install change listener as the active editor changes
		$(EditorManager).on("activeEditorChange", handleActiveEditorChange);

		// immediately install the current editor
		handleActiveEditorChange(null, EditorManager.getActiveEditor(), null);
	}



  	var promises = [
		$.getScript(FileUtils.getNativeBracketsDirectoryPath() + "/thirdparty/CodeMirror2/addon/hint/show-hint.js").promise(),
		ExtensionUtils.addLinkedStyleSheet(FileUtils.getNativeBracketsDirectoryPath() + "/thirdparty/CodeMirror2/addon/hint/show-hint.css")
	];



	//
	// Synchronize all calls to load resources.
	//
	$.when.apply($, promises).done( function( ) {

		// Once the app is fully loaded, we will proceed to check the theme that
		// was last set
		AppInit.appReady(function () {
			TernManager.onReady(function() {
				InitHints();
			});
		});
	});

});
