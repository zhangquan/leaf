/******/ (function(modules) { // webpackBootstrap
/******/ 	var parentHotUpdateCallback = this["webpackHotUpdate"];
/******/ 	this["webpackHotUpdate"] = 
/******/ 	function webpackHotUpdateCallback(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		hotAddUpdateChunk(chunkId, moreModules);
/******/ 		if(parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
/******/ 		var head = document.getElementsByTagName("head")[0];
/******/ 		var script = document.createElement("script");
/******/ 		script.type = "text/javascript";
/******/ 		script.charset = "utf-8";
/******/ 		script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";
/******/ 		head.appendChild(script);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadManifest(callback) { // eslint-disable-line no-unused-vars
/******/ 		if(typeof XMLHttpRequest === "undefined")
/******/ 			return callback(new Error("No browser support"));
/******/ 		try {
/******/ 			var request = new XMLHttpRequest();
/******/ 			var requestPath = __webpack_require__.p + "" + hotCurrentHash + ".hot-update.json";
/******/ 			request.open("GET", requestPath, true);
/******/ 			request.timeout = 10000;
/******/ 			request.send(null);
/******/ 		} catch(err) {
/******/ 			return callback(err);
/******/ 		}
/******/ 		request.onreadystatechange = function() {
/******/ 			if(request.readyState !== 4) return;
/******/ 			if(request.status === 0) {
/******/ 				// timeout
/******/ 				callback(new Error("Manifest request to " + requestPath + " timed out."));
/******/ 			} else if(request.status === 404) {
/******/ 				// no update available
/******/ 				callback();
/******/ 			} else if(request.status !== 200 && request.status !== 304) {
/******/ 				// other failure
/******/ 				callback(new Error("Manifest request to " + requestPath + " failed."));
/******/ 			} else {
/******/ 				// success
/******/ 				try {
/******/ 					var update = JSON.parse(request.responseText);
/******/ 				} catch(e) {
/******/ 					callback(e);
/******/ 					return;
/******/ 				}
/******/ 				callback(null, update);
/******/ 			}
/******/ 		};
/******/ 	}

/******/ 	
/******/ 	
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "e1e7cfc9b3f65b8d798d"; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentParents = []; // eslint-disable-line no-unused-vars
/******/ 	
/******/ 	function hotCreateRequire(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var me = installedModules[moduleId];
/******/ 		if(!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if(me.hot.active) {
/******/ 				if(installedModules[request]) {
/******/ 					if(installedModules[request].parents.indexOf(moduleId) < 0)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 					if(me.children.indexOf(request) < 0)
/******/ 						me.children.push(request);
/******/ 				} else hotCurrentParents = [moduleId];
/******/ 			} else {
/******/ 				console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		for(var name in __webpack_require__) {
/******/ 			if(Object.prototype.hasOwnProperty.call(__webpack_require__, name)) {
/******/ 				fn[name] = __webpack_require__[name];
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId, callback) {
/******/ 			if(hotStatus === "ready")
/******/ 				hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			__webpack_require__.e(chunkId, function() {
/******/ 				try {
/******/ 					callback.call(null, fn);
/******/ 				} finally {
/******/ 					finishChunkLoading();
/******/ 				}
/******/ 	
/******/ 				function finishChunkLoading() {
/******/ 					hotChunksLoading--;
/******/ 					if(hotStatus === "prepare") {
/******/ 						if(!hotWaitingFilesMap[chunkId]) {
/******/ 							hotEnsureUpdateChunk(chunkId);
/******/ 						}
/******/ 						if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 							hotUpdateDownloaded();
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			});
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/ 	
/******/ 	function hotCreateModule(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 	
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfAccepted = true;
/******/ 				else if(typeof dep === "function")
/******/ 					hot._selfAccepted = dep;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback;
/******/ 				else
/******/ 					hot._acceptedDependencies[dep] = callback;
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfDeclined = true;
/******/ 				else if(typeof dep === "number")
/******/ 					hot._declinedDependencies[dep] = true;
/******/ 				else
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if(!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if(idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		return hot;
/******/ 	}
/******/ 	
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/ 	
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for(var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/ 	
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailibleFilesMap = {};
/******/ 	var hotCallback;
/******/ 	
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/ 	
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = (+id) + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/ 	
/******/ 	function hotCheck(apply, callback) {
/******/ 		if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
/******/ 		if(typeof apply === "function") {
/******/ 			hotApplyOnUpdate = false;
/******/ 			callback = apply;
/******/ 		} else {
/******/ 			hotApplyOnUpdate = apply;
/******/ 			callback = callback || function(err) {
/******/ 				if(err) throw err;
/******/ 			};
/******/ 		}
/******/ 		hotSetStatus("check");
/******/ 		hotDownloadManifest(function(err, update) {
/******/ 			if(err) return callback(err);
/******/ 			if(!update) {
/******/ 				hotSetStatus("idle");
/******/ 				callback(null, null);
/******/ 				return;
/******/ 			}
/******/ 	
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotAvailibleFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			for(var i = 0; i < update.c.length; i++)
/******/ 				hotAvailibleFilesMap[update.c[i]] = true;
/******/ 			hotUpdateNewHash = update.h;
/******/ 	
/******/ 			hotSetStatus("prepare");
/******/ 			hotCallback = callback;
/******/ 			hotUpdate = {};
/******/ 			var chunkId = 0;
/******/ 			{ // eslint-disable-line no-lone-blocks
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if(hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		if(!hotAvailibleFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for(var moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if(!hotAvailibleFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var callback = hotCallback;
/******/ 		hotCallback = null;
/******/ 		if(!callback) return;
/******/ 		if(hotApplyOnUpdate) {
/******/ 			hotApply(hotApplyOnUpdate, callback);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for(var id in hotUpdate) {
/******/ 				if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			callback(null, outdatedModules);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotApply(options, callback) {
/******/ 		if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
/******/ 		if(typeof options === "function") {
/******/ 			callback = options;
/******/ 			options = {};
/******/ 		} else if(options && typeof options === "object") {
/******/ 			callback = callback || function(err) {
/******/ 				if(err) throw err;
/******/ 			};
/******/ 		} else {
/******/ 			options = {};
/******/ 			callback = callback || function(err) {
/******/ 				if(err) throw err;
/******/ 			};
/******/ 		}
/******/ 	
/******/ 		function getAffectedStuff(module) {
/******/ 			var outdatedModules = [module];
/******/ 			var outdatedDependencies = {};
/******/ 	
/******/ 			var queue = outdatedModules.slice();
/******/ 			while(queue.length > 0) {
/******/ 				var moduleId = queue.pop();
/******/ 				var module = installedModules[moduleId];
/******/ 				if(!module || module.hot._selfAccepted)
/******/ 					continue;
/******/ 				if(module.hot._selfDeclined) {
/******/ 					return new Error("Aborted because of self decline: " + moduleId);
/******/ 				}
/******/ 				if(moduleId === 0) {
/******/ 					return;
/******/ 				}
/******/ 				for(var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if(parent.hot._declinedDependencies[moduleId]) {
/******/ 						return new Error("Aborted because of declined dependency: " + moduleId + " in " + parentId);
/******/ 					}
/******/ 					if(outdatedModules.indexOf(parentId) >= 0) continue;
/******/ 					if(parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if(!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push(parentId);
/******/ 				}
/******/ 			}
/******/ 	
/******/ 			return [outdatedModules, outdatedDependencies];
/******/ 		}
/******/ 	
/******/ 		function addAllToSet(a, b) {
/******/ 			for(var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if(a.indexOf(item) < 0)
/******/ 					a.push(item);
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/ 		for(var id in hotUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				var moduleId = toModuleId(id);
/******/ 				var result = getAffectedStuff(moduleId);
/******/ 				if(!result) {
/******/ 					if(options.ignoreUnaccepted)
/******/ 						continue;
/******/ 					hotSetStatus("abort");
/******/ 					return callback(new Error("Aborted because " + moduleId + " is not accepted"));
/******/ 				}
/******/ 				if(result instanceof Error) {
/******/ 					hotSetStatus("abort");
/******/ 					return callback(result);
/******/ 				}
/******/ 				appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 				addAllToSet(outdatedModules, result[0]);
/******/ 				for(var moduleId in result[1]) {
/******/ 					if(Object.prototype.hasOwnProperty.call(result[1], moduleId)) {
/******/ 						if(!outdatedDependencies[moduleId])
/******/ 							outdatedDependencies[moduleId] = [];
/******/ 						addAllToSet(outdatedDependencies[moduleId], result[1][moduleId]);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for(var i = 0; i < outdatedModules.length; i++) {
/******/ 			var moduleId = outdatedModules[i];
/******/ 			if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/ 	
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		var queue = outdatedModules.slice();
/******/ 		while(queue.length > 0) {
/******/ 			var moduleId = queue.pop();
/******/ 			var module = installedModules[moduleId];
/******/ 			if(!module) continue;
/******/ 	
/******/ 			var data = {};
/******/ 	
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for(var j = 0; j < disposeHandlers.length; j++) {
/******/ 				var cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/ 	
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/ 	
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/ 	
/******/ 			// remove "parents" references from all children
/******/ 			for(var j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if(!child) continue;
/******/ 				var idx = child.parents.indexOf(moduleId);
/******/ 				if(idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// remove outdated dependency from module children
/******/ 		for(var moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				var module = installedModules[moduleId];
/******/ 				var moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				for(var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 					var dependency = moduleOutdatedDependencies[j];
/******/ 					var idx = module.children.indexOf(dependency);
/******/ 					if(idx >= 0) module.children.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/ 	
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/ 	
/******/ 		// insert new code
/******/ 		for(var moduleId in appliedUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for(var moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				var module = installedModules[moduleId];
/******/ 				var moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				var callbacks = [];
/******/ 				for(var i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 					var dependency = moduleOutdatedDependencies[i];
/******/ 					var cb = module.hot._acceptedDependencies[dependency];
/******/ 					if(callbacks.indexOf(cb) >= 0) continue;
/******/ 					callbacks.push(cb);
/******/ 				}
/******/ 				for(var i = 0; i < callbacks.length; i++) {
/******/ 					var cb = callbacks[i];
/******/ 					try {
/******/ 						cb(outdatedDependencies);
/******/ 					} catch(err) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Load self accepted modules
/******/ 		for(var i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			var moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch(err) {
/******/ 				if(typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch(err) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				} else if(!error)
/******/ 					error = err;
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if(error) {
/******/ 			hotSetStatus("fail");
/******/ 			return callback(error);
/******/ 		}
/******/ 	
/******/ 		hotSetStatus("idle");
/******/ 		callback(null, outdatedModules);
/******/ 	}

/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: hotCurrentParents,
/******/ 			children: []
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };

/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(0)(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1)
	__webpack_require__(2)

	__webpack_require__(3)
	__webpack_require__(4)
	__webpack_require__(5)

	__webpack_require__(6)
	__webpack_require__(7)
	__webpack_require__(8)
	__webpack_require__(9)
	__webpack_require__(10)
	__webpack_require__(11)
	__webpack_require__(12)


/***/ },
/* 1 */
/***/ function(module, exports) {

	(function (sope) {

	    if (!sope) {

	        var registry = {};

	        function getLeaf(el) {
	        }

	        var Leaf = function (name, prototype) {

	            var args = arguments;
	            if (args.length == 1) {

	                prototype = name;
	                var currentScript;
	                if (document.currentScript || document._currentScript) {
	                    currentScript = document.currentScript || document._currentScript;
	                }
	                else {
	                    var scripts = document.getElementsByTagName("script");
	                    currentScript = scripts[scripts.length - 1];
	                }
	                var parent = currentScript.parentNode;
	                var tagName = parent.tagName.toLowerCase();
	                var name = parent.getAttribute("name");


	                if (tagName == "leaf-element" && name) {
	                    registry[name] = prototype;
	                }
	            }

	            if (args.length == 2) {
	                registry[name] = prototype;
	            }
	        }

	        Leaf._startTime = new Date().getTime();
	        Leaf._registry = registry;
	        window.Leaf = Leaf;
	    }


	})(window.Leaf);

/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * Created by qiaofu on 14-6-27.
	 * domReady From KISSY
	 */
	(function(Leaf) {
	    var win = typeof window !== 'undefined' ? window : {},
	        undef,
	        doc = win.document || {},
	        docElem = doc.documentElement,
	        EMPTY = '',
	        domReady = 0,
	        callbacks = [],
	        // The number of poll times.
	        POLL_RETIRES = 500,
	        // The poll interval in milliseconds.
	        POLL_INTERVAL = 40,
	        // #id or id
	        RE_ID_STR = /^#?([\w-]+)$/,
	        RE_NOT_WHITESPACE = /\S/,
	        standardEventModel = doc.addEventListener,
	        supportEvent = doc.attachEvent || standardEventModel,
	        DOM_READY_EVENT = 'DOMContentLoaded',
	        READY_STATE_CHANGE_EVENT = 'readystatechange',
	        LOAD_EVENT = 'load',
	        COMPLETE = 'complete',
	        /*global addEventListener:true, removeEventListener:true*/
	        addEventListener = standardEventModel ? function (el, type, fn) {
	            el.addEventListener(type, fn, false);
	        } : function (el, type, fn) {
	            el.attachEvent('on' + type, fn);
	        },
	        removeEventListener = standardEventModel ? function (el, type, fn) {
	            el.removeEventListener(type, fn, false);
	        } : function (el, type, fn) {
	            el.detachEvent('on' + type, fn);
	        };

	    var Web = {
	        /**
	         * Specify a function to execute when the Dom is fully loaded.
	         * @param fn {Function} A function to execute after the Dom is ready
	         * @chainable
	         */
	        ready: function (fn) {
	            if (domReady) {
	                try {
	                    fn();
	                } catch (e) {
	                    setTimeout(function () {
	                        throw e;
	                    }, 0);
	                }
	            } else {
	                callbacks.push(fn);
	            }
	            return this;
	        }
	    };

	    function fireReady() {
	        if (domReady) {
	            return;
	        }
	        // nodejs
	        if (win && win.setTimeout) {
	            removeEventListener(win, LOAD_EVENT, fireReady);
	        }
	        domReady = 1;
	        for (var i = 0; i < callbacks.length; i++) {
	            try {
	                callbacks[i]();
	            } catch (e) {
	                /*jshint loopfunc:true*/
	                setTimeout(function () {
	                    throw e;
	                }, 0);
	            }
	        }
	    }

	//  Binds ready events.
	    function bindReady() {
	        // Catch cases where ready() is called after the
	        // browser event has already occurred.
	        if (!doc || doc.readyState === COMPLETE) {
	            fireReady();
	            return;
	        }

	        // A fallback to window.onload, that will always work
	        addEventListener(win, LOAD_EVENT, fireReady);

	        // w3c mode
	        if (standardEventModel) {
	            var domReady = function () {
	                removeEventListener(doc, DOM_READY_EVENT, domReady);
	                fireReady();
	            };

	            addEventListener(doc, DOM_READY_EVENT, domReady);
	        } else {
	            var stateChange = function () {
	                if (doc.readyState === COMPLETE) {
	                    removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
	                    fireReady();
	                }
	            };

	            // ensure firing before onload (but completed after all inner iframes is loaded)
	            // maybe late but safe also for iframes
	            addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);

	            // If IE and not a frame
	            // continually check to see if the document is ready
	            var notframe,
	                doScroll = docElem && docElem.doScroll;

	            try {
	                notframe = (win.frameElement === null);
	            } catch (e) {
	                notframe = false;
	            }

	            // can not use in iframe,parent window is dom ready so doScroll is ready too
	            if (doScroll && notframe) {
	                var readyScroll = function () {
	                    try {
	                        // Ref: http://javascript.nwbox.com/IEContentLoaded/
	                        doScroll('left');
	                        fireReady();
	                    } catch (ex) {
	                        setTimeout(readyScroll, POLL_INTERVAL);
	                    }
	                };
	                readyScroll();
	            }
	        }
	    }

	// bind on start
	// in case when you bind but the DOMContentLoaded has triggered
	// then you has to wait onload
	// worst case no callback at all
	    if (supportEvent) {
	        bindReady();
	    }

	    try {
	        doc.execCommand('BackgroundImageCache', false, true);
	    } catch (e) {
	    }

	    Leaf.ready = Web.ready;

	}(Leaf));



/***/ },
/* 3 */
/***/ function(module, exports) {

	(function (Leaf) {

	    var utils = {
	        ready: function (func) {
	          if (window.jQuery) {
	            jQuery( document ).ready(func)
	            }
	            else {
	                // Use the handy event callback
	                document.addEventListener("DOMContentLoaded", func, false);
	            }
	        },
	        isDocumentLink: function (elt) {

	            return elt.tagName.toLowerCase() == "link" && elt.getAttribute("rel") == "import"

	        },

	        isStylesheetLink: function (elt) {

	            return elt.tagName.toLowerCase() == "link" && elt.getAttribute("rel") == "stylesheet"

	        }

	    }

	    Leaf.utils = utils;

	})(window.Leaf);


/***/ },
/* 4 */
/***/ function(module, exports) {

	(function (scope) {


	    var utils = scope.utils,
	        registry = {},
	        _ce = document.createElement,
	        _createElement = function () {
	            return  _ce.apply(document, arguments);
	        }

	    function register(inName, inOptions) {
	        var definition = inOptions || {};
	        if (!inName) {
	            throw new Error('Name argument must not be empty');
	        }
	        definition.name = inName;
	        resolveTagName(definition);
	        resolveExtends(definition);
	        registerDefinition(inName, definition);
	        definition.ctor = function () {
	            return document.createElement(inName);
	        }
	        return definition.ctor;
	    }

	    function resolveTagName(inDefinition) {
	        inDefinition.tag = inDefinition.name;
	    }


	    function resolveExtends(inDefinition) {
	        var pName = inDefinition.extends;
	        var pDefinition = registry[pName] || {};
	        for (var p in pDefinition) {
	            if (!inDefinition[p]) {
	                inDefinition[p] = pDefinition[p];
	            }
	        }
	    }

	    function registerDefinition(inName, inDefinition) {
	        registry[inName] = inDefinition;
	    }

	    function isInTemplate(el) {
	        var p;
	        while (p = el.parentNode) {
	            if (p.tagName && p.tagName.toLowerCase() == "template") {
	                return true;
	            }
	            el = p;
	        }
	    }

	    function walk(name, context, callback) {
	        var define = registry[name];
	        var tagName = define["extents"] || name;
	        context = context || document;
	        var els = context.getElementsByTagName(tagName);
	        for (var i = 0; i < els.length; i++) {
	            if (!isInTemplate(els[i])) {
	                callback(els[i]);
	            }
	        }
	    }


	    function walkRoot(root, callback) {
	        var child = root.childNodes;
	        for (var i = 0; i < child.length; i++) {

	            var el = child[i];
	            if (el.nodeType == 1) {
	                var tagName = el.tagName.toLowerCase();
	                var result = callback(el, tagName);
	                if (result !== false) {
	                    walkRoot(child[i], callback);
	                }
	            }
	        }
	    }


	    var upgrageCallbacks = [];
	    Leaf.onUpgrade = function (callback) {
	        upgrageCallbacks.push(callback);
	    }

	    var beforeUpgrageCallbacks = [];
	    Leaf.onBeforeUpgrade = function (callback) {
	        beforeUpgrageCallbacks.push(callback);
	    }


	    var getRegName = function (el) {

	        var name = el.tagName.toLowerCase();
	        var className = el.className;
	        className = (" " + className + " ").replace(/[\n\t]/g, " ");

	        for (var regName in registry) {

	            var tn;
	            var cn;
	            var regNames = regName.split(".")

	            if (regNames.length == 1) {
	                tn = regNames[0];
	                if (tn === name) {

	                    return tn;
	                }

	            }
	            else if (regNames.length == 2) {
	                tn = regNames[0];
	                cn = regNames[1];

	                if (tn && cn) {
	                    cn = " " + cn + " ";
	                    if (tn == name && className.indexOf(cn) > -1) {
	                        return regName
	                    }
	                }
	                else if (cn) {
	                    if (className.indexOf(cn) > -1) {
	                        return regName
	                    }
	                }
	            }


	        }
	    }

	    function upgrade(inElement) {


	        if (inElement.__upgraded__) {

	            walkRoot(inElement, function (el, tagName) {


	                var regName = getRegName(el);


	                if (regName) {
	                    upgrade(el);
	                    return false;
	                }
	                return true;
	            })

	            return;

	        }
	        if (!inElement.tagName)return;

	        var name = inElement.tagName.toLowerCase();
	        var is = inElement.getAttribute("is");


	        var regName = getRegName(inElement)


	        if (regName) {


	            var inDefinition = registry[regName];
	            if (inDefinition) {


	                implement(inElement, inDefinition);

	                //如重新渲染innerHTML等

	                implementCallback(inElement)
	                // flag as upgraded
	                //update subtree


	                walkRoot(inElement, function (el, tagName) {


	                    var regName = getRegName(el);


	                    if (regName) {
	                        upgrade(el);
	                        return false;
	                    }
	                    return true;
	                })

	                inElement.__upgraded__ = true;

	                for (var i = 0; i < beforeUpgrageCallbacks.length; i++) {
	                    beforeUpgrageCallbacks[i](inElement);
	                }
	                ready(inElement);

	                for (var i = 0; i < upgrageCallbacks.length; i++) {
	                    upgrageCallbacks[i](inElement);
	                }
	            }
	        }
	        else {


	        }


	        return inElement;


	    }

	    function upgradeOne(inElement) {


	        if (inElement.__upgraded__)return;
	        if (!inElement.tagName)return;

	        var name = inElement.tagName.toLowerCase();
	        var is = inElement.getAttribute("is");

	        if (is) {
	            var inDefinition = registry[is];
	            var parent = inDefinition.extends;
	            if (inDefinition && name == parent) {
	                implement(inElement, inDefinition);

	                //如重新渲染innerHTML等
	                implementCallback(inElement)

	                inElement.__upgraded__ = true;
	                ready(inElement);
	            }
	        }
	        else {
	            var inDefinition = registry[name];

	            if (inDefinition) {

	                implement(inElement, inDefinition);
	                //如重新渲染innerHTML等
	                implementCallback(inElement)
	                // flag as upgraded

	                inElement.__upgraded__ = true;
	                ready(inElement);
	            }
	        }
	        return inElement;
	    }

	    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Internet_Explorer_8_specific_notes

	    function implement(inElement, inDefinition) {
	        for (var p in inDefinition) {
	            inElement[p] = inDefinition[p];
	            // Object.defineProperty(inElement, p, Object.getOwnPropertyDescriptor(inDefinition, p));
	        }
	    }


	    function isLeaf(inElement){
	        if(inElement){
	            var name = inElement.tagName.toLowerCase();
	            return registry[name];
	        }
	    }

	    document.createElement = function (name) {
	        var element = _createElement.call(document, name);
	        //todo 支持创建link时间自动加载和upgrage
	        upgrade(element);
	        return element;
	    };

	    var initialize = function () {
	        for (var p  in registry) {
	            walk(p, document, function (element) {
	                upgrade(element);
	            });
	        }
	    };

	    function ready(inElement) {
	        if (inElement.ready) {
	            try {
	                inElement.ready.apply(inElement, []);
	            } catch (e) {
	                console.error(e.message, e.stack)
	            }
	        }
	        // $(document).trigger("readyCallback", [inElement])
	    }

	    function implementCallback(inElement) {
	        if (inElement.__implementCallback__) {
	            inElement.__implementCallback__.apply(inElement, []);
	        }
	    }


	    utils.ready(function () {
	        scope.ready = true;
	        initialize();
	    })

	    scope.registry = registry;
	    scope.isLeaf = isLeaf;
	    scope.upgrade = upgrade;
	    scope.upgradeOne = upgradeOne;

	    scope.upgradeDocument = function (doc) {


	        walkRoot(doc.body || doc, function (el, tagName) {
	            if (getRegName(el)) {
	                upgrade(el);
	                return false;
	            }
	        })

	    }

	    scope.register = register

	})(window.Leaf);


/***/ },
/* 5 */
/***/ function(module, exports) {

	//import
	(function (scope) {


	    var hasNative = ('import' in document.createElement('link'));
	    var useNative = hasNative;


	    var xhr = {
	        async: true,
	        ok: function (request) {
	            return (request.status >= 200 && request.status < 300)
	                || (request.status === 304)
	                || (request.status === 0);
	        },
	        createXHR: function () {
	            if (window.ActiveXObject) {
	                return  new window.ActiveXObject("Microsoft.XMLHTTP");
	            }
	            else {
	                return new XMLHttpRequest();
	            }

	        },
	        load: function (url, next) {
	            var request = this.createXHR();

	            request.open('GET', url, xhr.async);
	            request.onreadystatechange = function (e) {
	                if (request.readyState === 4) {
	                    next((request.response || request.responseText), url);
	                }
	            };
	            request.send();
	            return request;
	        }

	    };


	    var URL_ATTRS = ['href', 'src', 'action'];
	    var URL_ATTRS_SELECTOR = '[' + URL_ATTRS.join('],[') + ']';
	    var URL_TEMPLATE_SEARCH = '{{.*}}';

	    var path = {
	        nodeUrl: function (node) {
	            return path.resolveUrl(path.documentURL, path.hrefOrSrc(node));
	        },
	        getAttrElts: function (doc, results) {
	            var results = results || [];
	            var self = this;

	            var children = doc.childNodes;
	            if (children.length) {
	                for (var i = 0; i < children.length; i++) {
	                    var el = children[i];
	                    var attrs = el.attributes;
	                    if (attrs) {

	                        for (var j = 0; j < attrs.length; j++) {
	                            var attr = attrs[j];
	                            if (attr && attr.value && (attrs[j].name == "href" || attrs[j].name == "src" || attrs[j].name == "action")) {
	                                results.push(el);
	                            }
	                        }
	                        self.getAttrElts(el, results);
	                    }

	                }
	            }
	            return results;
	        },
	        hrefOrSrc: function (node) {
	            return node.getAttribute("href") || node.getAttribute("src");
	        },
	        documentUrlFromNode: function (node) {
	            return path.getDocumentUrl(node.ownerDocument || node);
	        },
	        getDocumentUrl: function (doc) {
	            var url = doc &&
	                // TODO(sjmiles): ShadowDOMPolyfill intrusion
	                (doc._URL || (doc.impl && doc.impl._URL) || doc.baseURI || doc.URL) || '';
	            // take only the left side if there is a #
	            return url.split('#')[0];
	        },
	        resolveUrl: function (baseUrl, url) {
	            if (this.isAbsUrl(url)) {
	                return url;
	            }
	            return this.compressUrl(this.urlToPath(baseUrl) + url);
	        },
	        resolveRelativeUrl: function (baseUrl, url) {
	            if (this.isAbsUrl(url)) {
	                return url;
	            }
	            return this.makeDocumentRelPath(this.resolveUrl(baseUrl, url));
	        },
	        isAbsUrl: function (url) {
	            return /(^data:)|(^http[s]?:)|(^\/)/.test(url);
	        },
	        urlToPath: function (baseUrl) {
	            var parts = baseUrl.split("/");
	            parts.pop();
	            parts.push('');
	            return parts.join("/");
	        },
	        compressUrl: function (url) {
	            var search = '';
	            var searchPos = url.indexOf('?');
	            // query string is not part of the path
	            if (searchPos > -1) {
	                search = url.substring(searchPos);
	                url = url.substring(searchPos, 0);
	            }
	            var parts = url.split('/');
	            for (var i = 0, p; i < parts.length; i++) {
	                p = parts[i];
	                if (p === '..') {
	                    parts.splice(i - 1, 2);
	                    i -= 2;
	                }
	            }
	            return parts.join('/') + search;
	        },
	        makeDocumentRelPath: function (url) {
	            // test url against document to see if we can construct a relative path
	            path.urlElt.href = url;
	            // IE does not set host if same as document
	            if (!path.urlElt.host ||
	                (path.urlElt.host === window.location.host &&
	                    path.urlElt.protocol === window.location.protocol)) {
	                return this.makeRelPath(path.documentURL, path.urlElt.href);
	            } else {
	                return url;
	            }
	        },
	        // make a relative path from source to target
	        makeRelPath: function (source, target) {
	            var s = source.split('/');
	            var t = target.split('/');
	            while (s.length && s[0] === t[0]) {
	                s.shift();
	                t.shift();
	            }
	            for (var i = 0, l = s.length - 1; i < l; i++) {
	                t.unshift('..');
	            }
	            var r = t.join('/');
	            return r;
	        },
	        makeAbsUrl: function (url) {
	            path.urlElt.href = url;
	            return path.urlElt.href;
	        },
	        resolvePathsInHTML: function (root, url) {
	            url = url || path.documentUrlFromNode(root)
	            path.resolveAttributes(root, url);
	            path.resolveStyleElts(root, url);
	            // handle template.content
	            var templates = root.getElementsByTagName('template');
	            if (templates) {
	                for (var i = 0; i < templates; i++) {
	                    if (templates[i].content) {
	                        path.resolvePathsInHTML(templates[i].content, url);
	                    }
	                }


	            }
	        },
	        resolvePathsInStylesheet: function (sheet) {
	            var docUrl = path.nodeUrl(sheet);

	            sheet.__resource = path.resolveCssText(sheet.__resource, docUrl);
	        },
	        resolveStyleElts: function (root, url) {
	            var styles = root.getElementsByTagName('style');
	            if (styles) {
	                for (var i = 0; i < styles.length; i++) {
	                    if (styles[i].textContent) {
	                        styles[i].textContent = path.resolveCssText(styles[i].textContent, url);
	                    }
	                    else {
	                        styles[i].innerText = path.resolveCssText(styles[i].innerText, url);

	                    }

	                }

	            }
	        },
	        resolveCssText: function (cssText, baseUrl) {
	            return cssText.replace(/url\([^)]*\)/g, function (match) {
	                // find the url path, ignore quotes in url string
	                var urlPath = match.replace(/["']/g, "").slice(4, -1);
	                urlPath = path.resolveRelativeUrl(baseUrl, urlPath);
	                return "url(" + urlPath + ")";
	            });
	        },
	        resolveAttributes: function (root, url) {
	            // search for attributes that host urls
	            var nodes = this.getAttrElts(root);
	            if (nodes) {
	                for (var i = 0; i < nodes.length; i++) {
	                    this.resolveNodeAttributes(nodes[i], url);
	                }


	            }
	        },
	        resolveNodeAttributes: function (node, url) {
	            for (var i = 0; i < URL_ATTRS.length; i++) {
	                var attr = node.attributes[URL_ATTRS[i]];


	                if (attr && attr.value && (attr.value.search(URL_TEMPLATE_SEARCH) < 0)) {
	                    var urlPath = path.resolveRelativeUrl(url, attr.value);
	                    attr.value = urlPath;
	                }
	            }

	        }
	    };

	    path.documentURL = path.getDocumentUrl(document);
	    path.urlElt = document.createElement('a');


	    var Loader = function (onLoad, onComplete) {
	        this.onload = onLoad;
	        this.oncomplete = onComplete;
	        this.inflight = 0;
	        this.pending = {};
	        this.cache = {};
	    };

	    Loader.prototype = {
	        addNodes: function (nodes) {
	            this.inflight += nodes.length;
	            for (var i = 0; i < nodes.length; i++) {
	                this.require(nodes[i]);
	            }
	            this.checkDone();


	        },
	        require: function (elt) {
	            var url = path.nodeUrl(elt);
	            url = path.makeAbsUrl(url);
	            elt.__nodeUrl = url;
	            // deduplication
	            if (!this.dedupe(url, elt)) {
	                // fetch this resource
	                this.fetch(url, elt);
	            }
	        },
	        dedupe: function (url, elt) {
	            if (this.pending[url]) {
	                // add to list of nodes waiting for inUrl
	                this.pending[url].push(elt);
	                // don't need fetch
	                return true;
	            }
	            if (this.cache[url]) {
	                // complete load using cache data
	                this.onload(url, elt, this.cache[url]);
	                // finished this transaction
	                this.tail();
	                // don't need fetch
	                return true;
	            }
	            // first node waiting for inUrl
	            this.pending[url] = [elt];
	            // need fetch (not a dupe)
	            return false;
	        },
	        fetch: function (url, elt) {

	            var self = this;

	            var receiveXhr = function (resource, url) {


	                self.receive(url, elt, resource);
	            };
	            xhr.load(url, receiveXhr);

	        },
	        receive: function (url, elt, resource) {

	            this.cache[url] = resource;
	            var pending = this.pending[url];


	            for (var i = 0; i < pending.length; i++) {

	                this.onload(url, pending[i], resource);

	                this.tail();
	            }

	            this.pending[url] = null;

	        },
	        tail: function () {
	            --this.inflight;
	            this.checkDone();
	        },
	        checkDone: function () {
	            if (!this.inflight) {
	                this.oncomplete && this.oncomplete();
	            }
	        }
	    };


	    function createDocument(resource) {
	        var tmpNode = document.createElement("div");
	        tmpNode.innerHTML = resource;
	        return tmpNode;
	    }


	    function isDocumentLink(elt) {

	        return elt.tagName.toLowerCase() == "link" && elt.getAttribute("rel") == "import"

	    }

	    function isStylesheetLink(elt) {

	        return elt.tagName.toLowerCase() == "link" && elt.getAttribute("rel") == "stylesheet"

	    }

	    function isScript(elt) {

	        return elt.tagName.toLowerCase() == "script"
	    }

	    function isStylesheet(elt) {

	        return elt.tagName.toLowerCase() == "style";

	    }

	    var importer = {
	        isMainDocument: function (doc, node) {
	            if (doc == document) {
	                return true;
	            }
	        },
	        queryByTabName: function () {

	            var args = arguments;
	            var doc = args[args.length - 1];
	            var results = [];
	            for (var i = 0; i < args.length - 1; i++) {
	                var elts = doc.getElementsByTagName(args[i]);
	                for (var j = 0; j < elts.length; j++) {
	                    results.push(elts[j]);
	                }

	            }

	            return results;

	        },
	        walk: function (doc, tagNames, func, complete) {
	            var self = this;

	            var children = doc.childNodes;
	            if (children.length) {
	                for (var i = 0; i < children.length; i++) {
	                    var el = children[i];

	                    if (el && el.nodeType == 1) {
	                        if (el.tagName) {

	                            if (tagNames.indexOf(el.tagName.toLowerCase()) !== -1) {
	                                func(el);
	                            }

	                        }
	                        self.walk(el, tagNames, func)

	                    }


	                }
	            }
	        },
	        queryResourceElts: function (doc) {
	            var result = [];
	            if (this.isMainDocument(doc)) {
	                var links = doc.getElementsByTagName("link");
	                for (var i = 0; i < links.length; i++) {
	                    if (isDocumentLink(links[i])) {
	                        result.push(links[i]);
	                    }
	                }
	            }
	            else {
	                var scripts = doc.getElementsByTagName("script");
	                for (var i = 0; i < scripts.length; i++) {
	                    if (scripts[i].getAttribute("src")) {
	                        result.push(scripts[i]);
	                    }
	                }
	                var links = doc.getElementsByTagName("link");
	                for (var i = 0; i < links.length; i++) {
	                    if (isDocumentLink(links[i]) || isStylesheetLink(links[i])) {
	                        result.push(links[i]);
	                    }
	                }
	            }

	            return result;


	        },
	        parse: function (doc) {
	            var self = this;
	            if (!doc)return;
	            if (!hasNative) {

	                var head = document.getElementsByTagName("head")[0];

	                var selector;

	                if (self.isMainDocument(doc)) {
	                    selector = "link";
	                }
	                else {
	                    selector = "link,script,style";
	                }


	                this.walk(doc, selector, function (elt) {
	                    if (elt) {
	                        if (isDocumentLink(elt)) {
	                            self.parse(elt.import);
	                        }
	                        else if (isStylesheetLink(elt)) {
	                            head.appendChild(elt);
	                        }
	                        else if (isScript(elt)) {
	                            if (elt.__resource) {
	                                document._currentScript = elt;
	                                try {
	                                  //@todo 安全措施
	                                     eval.call(window, elt.__resource);
	                                 }
	                                 catch (e) {

	                                     console.error(e)
	                                 }
	                            }
	                            else {
	                                document._currentScript = elt;
	                                try {
	                                     eval.call(window, elt.textContent || elt.innerText);
	                                 }
	                                 catch (e) {
	                                     console.error(e)
	                                 }
	                            }
	                        }
	                        else  if(isStylesheet(elt)){
	                            //style
	                            head.appendChild(elt);
	                        }
	                    }
	                });

	                var leaf = doc.getElementsByTagName("leaf-element");
	                for (var i = 0; i < leaf.length; i++) {
	                    Leaf.upgradeOne(leaf[i]);
	                }

	            }
	            else {



	                var selector = "link";

	                this.walk(doc, selector, function (elt) {
	                    if (elt) {
	                        if (isDocumentLink(elt)) {


	                            self.parse(elt.content || elt.import);
	                        }

	                    }
	                });


	                var leaf = doc.getElementsByTagName("leaf-element");


	                for (var i = 0; i < leaf.length; i++) {
	                    Leaf.upgradeOne(leaf[i]);
	                }

	            }


	        },
	        importDoc: function (href, callback) {


	            var self = this;


	            var link = $('< link rel="import" href="' + href + '" />');

	            var head = document.getElementsByTagName("head")[0];

	            var link = document.createElement("link");

	            link.setAttribute("rel", "import");
	            link.setAttribute("href", href);

	            head.appendChild(link);
	            var loader, status, doc;


	            var onload = function (url, elt, resource) {

	                if (isDocumentLink(elt)) {


	                    var frag = createDocument(resource);
	                    path.resolvePathsInHTML(frag, url);
	                    elt.import = frag;
	                    elt.content = frag;
	                    elt.imports =  elt.imports||{}
	                    elt.imports.href = url;
	                    elt.imports.ownerNode = elt;

	                    if (!status) doc = frag;
	                    status = 1;
	                    loader.addNodes(self.queryResourceElts(frag));

	                }

	                elt.__resource = resource;
	                if (isStylesheetLink(elt)) {
	                    path.resolvePathsInStylesheet(elt);
	                }

	            }

	            var complete = function () {

	                self.parse(doc);
	                callback && callback()
	            }


	            loader = new Loader(onload, complete);
	            loader.addNodes([link]);



	        },

	        load: function (doc, next) {
	            var self = this, elements, loader;
	            if (hasNative) {


	                var imports = doc.querySelectorAll('link[rel=import]');
	                var loaded = 0, l = imports.length;

	                function checkDone(d) {
	                    if (loaded == l) {
	                        self.parse(doc);
	                        next && next()
	                    }
	                }

	                function loadedImport(e) {
	                    loaded++;
	                    checkDone();
	                }

	                function isImportLoaded(link) {
	                    return useNative ? (link.import && (link.import.readyState !== 'loading')) || link.__loaded :
	                        link.__importParsed;
	                }


	                if (l) {
	                    for (var i = 0, imp; (i < l) && (imp = imports[i]); i++) {
	                        if(!imp.getAttribute("href"))  {
	                          loadedImport.call(imp);
	                          continue;
	                        }
	                        if (isImportLoaded(imp)) {
	                            loadedImport.call(imp);
	                        } else {
	                            imp.addEventListener('load', loadedImport);
	                            imp.addEventListener('error', loadedImport);
	                        }
	                    }
	                } else {
	                    checkDone();
	                }


	            }
	            else {
	                elements = self.queryResourceElts(doc);
	                var onload = function (url, elt, resource) {

	                    if (isDocumentLink(elt)) {
	                        var frag = createDocument(resource);
	                        path.resolvePathsInHTML(frag, url);
	                        elt.import = frag;
	                        elt.content = frag;
	                        elt.imports =  elt.imports||{}
	                        elt.imports.href = url;
	                        elt.imports.ownerNode = elt;
	                        elt.__loaded = true;
	                        loader.addNodes(self.queryResourceElts(frag));
	                    }

	                    elt.__resource = resource;
	                    if (isStylesheetLink(elt)) {
	                        path.resolvePathsInStylesheet(elt);
	                    }

	                }

	                var complete = function () {

	                    self.parse(doc);
	                    next && next()
	                }


	                loader = new Loader(onload, complete);
	                loader.addNodes(elements);
	            }


	        }
	    }


	    scope.importer = importer;

	})
	    (window.Leaf);


/***/ },
/* 6 */
/***/ function(module, exports) {

	(function (global) {
	    'use strict';

	    var PROP_ADD_TYPE = 'add';
	    var PROP_UPDATE_TYPE = 'update';
	    var PROP_RECONFIGURE_TYPE = 'reconfigure';
	    var PROP_DELETE_TYPE = 'delete';
	    var ARRAY_SPLICE_TYPE = 'splice';

	    var UNOPENED = 0;
	    var OPENED = 1;
	    var CLOSED = 2;

	    var allObservers = [];
	    var MAX_DIRTY_CHECK_CYCLES = 10;


	    function isIndex(s) {
	        return +s === s >>> 0;
	    }

	    var numberIsNaN = window.Number.isNaN || function isNaN(value) {
	        return typeof value === 'number' && window.isNaN(value);
	    };

	    function areSameValue(left, right) {
	        if (left === right){
	            return left !== 0 || 1 / left === 1 / right;
	        }

	        if (numberIsNaN(left) && numberIsNaN(right)){
	            return true;
	        }


	        return left !== left && right !== right;
	    }


	    function areSameValueArray(left, right){
	      if(left.length!== right.length){
	        return false;
	      }

	      var result = true;
	      for(var i=0;i<left.length;i++){
	          if(!areSameValue(left[i],right[i])){
	            result = false;
	            break;
	          }
	      }
	      return

	    }


	    function Path(s) {

	        this.parts = [];
	        if (s.trim() == '')
	            return this.parts;

	        if (isIndex(s)) {
	            this.parts.push(s);
	            return this.parts;
	        }

	        s.split(/\s*\.\s*/).filter(function (part) {
	            return part;
	        }).forEach(function (part) {
	                this.parts.push(part);
	            }, this);


	    }

	    // TODO(rafaelw): Make simple LRU cache
	    var pathCache = {};

	    function getPath(pathString) {
	        if (pathString instanceof Path)
	            return pathString;

	        if (pathString == null)
	            pathString = '';

	        if (typeof pathString !== 'string')
	            pathString = String(pathString);

	        var path = pathCache[pathString];
	        if (path)  return path;

	        var path = new Path(pathString);
	        pathCache[pathString] = path;
	        return path;
	    }

	    Path.get = getPath;

	    Path.prototype = {

	        valid: true,

	        toString: function () {
	            return this.parts.join('.');
	        },
	        getValueFromParent: function (obj) {
	            var parent = obj;
	            while (obj) {
	                var value = this.getValueFrom(obj);

	                if (value !== undefined) {
	                    return value;
	                }
	                else {
	                    obj = obj._sope;
	                }

	            }


	        },

	        getValueFrom: function (obj) {
	            var valueTarget;
	            if (obj._model) {
	                valueTarget = obj.valueTarget;
	            }
	            else {
	                valueTarget = obj;
	            }

	            for (var i = 0; i < this.parts.length; i++) {
	                if (valueTarget == null) return;
	                valueTarget = valueTarget[this.parts[i]];
	            }
	            return valueTarget;
	        }

	    };

	    function PathObserver(object, path) {
	        this.object_ = object;
	        this.path_ = path instanceof Path ? path : getPath(path);
	        this.value_ = undefined;
	        this.addToAll = true;

	    }

	    PathObserver.prototype = {
	        open: function (changeFun) {
	            this.state_ = OPENED;
	            this.changeFun_ = changeFun;
	            this.value_ = this.getValue_();
	            if (this.combinator) {
	                this.value_ = this.combinator(this.value_);
	            }

	            if (this.addToAll) allObservers.push(this);
	            return this.value_;
	        },


	        getValue_: function () {
	            if (this.object_.isModel) {
	                return this.object_.getValue(this.path_)
	            }
	            else {
	                return this.path_.getValueFrom(this.object_);
	            }
	        },

	        report_: function () {
	            var report = this.reportArgs_;
	            if (this.combinator) {
	                report[0] = this.combinator(report[0]);
	            }
	            this.changeFun_.apply(undefined, report);
	        },

	        check_: function () {
	            var newValue = this.getValue_();

	            if (areSameValue(this.value_, newValue)) return false;
	            this.reportArgs_ = [newValue, this.value_];
	            this.value_ = newValue;
	            return true;
	        }


	    };


	    function SimpleObserver() {
	        this.value_ = undefined;
	        this.addToAll = true;
	    }


	    SimpleObserver.prototype = {
	        open: function (changeFun) {
	            this.state_ = OPENED;
	            this.changeFun_ = changeFun;
	            this.value_ = this.getValue();
	            if (this.addToAll) allObservers.push(this);
	            this.changeFun_.apply(undefined, [this.value_]);
	            return this.value_;
	        },

	        getValue: function () {
	        },


	        check_: function () {
	            var oldValue = this.value_;
	            var newValue = this.getValue();
	            if (areSameValue(this.value_, newValue)) return false;
	            this.value_ = newValue;
	            this.changeFun_.apply(undefined, [newValue, oldValue]);
	            return true;
	        }

	    };


	    function CompoundObserver() {
	        this.value_ = undefined;
	        this.observed_ = [];
	        this.addToAll = true;
	    }


	    CompoundObserver.prototype = {
	        open: function (changeFun) {
	            this.state_ = OPENED;
	            this.changeFun_ = changeFun;
	            this.value_ = this.getValue();
	            if (this.addToAll) allObservers.push(this);
	            this.changeFun_.apply(undefined, [this.value_]);
	            return this.value_;
	        },

	        addObserver: function (observer) {
	            this.observed_.push(observer);

	        },


	        getValue: function () {

	            var values = [];
	            for (var i = 0; i < this.observed_.length; i++) {
	                var pathObserver = this.observed_[i];
	                var value = pathObserver.getValue();
	                values.push(value);
	            }

	            return values.join("");


	        },

	        check_: function () {
	            var oldValue = this.value_;
	            var newValue = this.getValue();
	            if (areSameValue(this.value_, newValue)) return false;

	            this.value_ = newValue;
	            this.changeFun_.apply(undefined, [newValue, oldValue]);


	            return true;


	        }

	    };


	    function ArrayObserver() {

	        this.addToAll = true;

	        this.value_ = []


	    }

	    ArrayObserver.prototype = {
	        open: function (changeFun) {
	            this.state_ = OPENED;

	            this.changeFun_ = changeFun;

	            this.value_ = this.getValue();

	            if (!this.value_) this.value_ = [];
	            this.oldObject_ = this.value_.slice(0);


	            if (this.addToAll) allObservers.push(this);
	            return this.value_;


	        },
	        getValue:function(){},

	        check_: function () {

	            //如果value没有定义就不继续
	            this.value_ = this.getValue();

	            if (!this.value_) this.value_ = [];

	            var splices;
	            splices = calcSplices(this.value_, 0, this.value_.length,
	                this.oldObject_, 0, this.oldObject_.length);


	            if (!splices || !splices.length)return false;
	            splices.values = this.value_;

	            this.oldObject_ = this.value_.slice(0);
	            this.changeFun_.apply(undefined, [splices]);


	            return true;

	        }
	    };


	    var EDIT_LEAVE = 0;
	    var EDIT_UPDATE = 1;
	    var EDIT_ADD = 2;
	    var EDIT_DELETE = 3;

	    function ArraySplice() {
	    }

	    ArraySplice.prototype = {

	        // Note: This function is *based* on the computation of the Levenshtein
	        // "edit" distance. The one change is that "updates" are treated as two
	        // edits - not one. With Array splices, an update is really a delete
	        // followed by an add. By retaining this, we optimize for "keeping" the
	        // maximum array items in the original array. For example:
	        //
	        //   'xxxx123' -> '123yyyy'
	        //
	        // With 1-edit updates, the shortest path would be just to update all seven
	        // characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
	        // leaves the substring '123' intact.
	        calcEditDistances: function (current, currentStart, currentEnd, old, oldStart, oldEnd) {
	            // "Deletion" columns
	            var rowCount = oldEnd - oldStart + 1;
	            var columnCount = currentEnd - currentStart + 1;
	            var distances = new Array(rowCount);

	            // "Addition" rows. Initialize null column.
	            for (var i = 0; i < rowCount; i++) {
	                distances[i] = new Array(columnCount);
	                distances[i][0] = i;
	            }

	            // Initialize null row
	            for (var j = 0; j < columnCount; j++)
	                distances[0][j] = j;

	            for (var i = 1; i < rowCount; i++) {
	                for (var j = 1; j < columnCount; j++) {
	                    if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1]))
	                        distances[i][j] = distances[i - 1][j - 1];
	                    else {
	                        var north = distances[i - 1][j] + 1;
	                        var west = distances[i][j - 1] + 1;
	                        distances[i][j] = north < west ? north : west;
	                    }
	                }
	            }

	            return distances;
	        },

	        // This starts at the final weight, and walks "backward" by finding
	        // the minimum previous weight recursively until the origin of the weight
	        // matrix.
	        spliceOperationsFromEditDistances: function (distances) {
	            var i = distances.length - 1;
	            var j = distances[0].length - 1;
	            var current = distances[i][j];
	            var edits = [];
	            while (i > 0 || j > 0) {
	                if (i == 0) {
	                    edits.push(EDIT_ADD);
	                    j--;
	                    continue;
	                }
	                if (j == 0) {
	                    edits.push(EDIT_DELETE);
	                    i--;
	                    continue;
	                }
	                var northWest = distances[i - 1][j - 1];
	                var west = distances[i - 1][j];
	                var north = distances[i][j - 1];

	                var min;
	                if (west < north)
	                    min = west < northWest ? west : northWest;
	                else
	                    min = north < northWest ? north : northWest;

	                if (min == northWest) {
	                    if (northWest == current) {
	                        edits.push(EDIT_LEAVE);
	                    } else {
	                        edits.push(EDIT_UPDATE);
	                        current = northWest;
	                    }
	                    i--;
	                    j--;
	                } else if (min == west) {
	                    edits.push(EDIT_DELETE);
	                    i--;
	                    current = west;
	                } else {
	                    edits.push(EDIT_ADD);
	                    j--;
	                    current = north;
	                }
	            }

	            edits.reverse();
	            return edits;
	        },

	        /**
	         * Splice Projection functions:
	         *
	         * A splice map is a representation of how a previous array of items
	         * was transformed into a new array of items. Conceptually it is a list of
	         * tuples of
	         *
	         *   <index, removed, addedCount>
	         *
	         * which are kept in ascending index order of. The tuple represents that at
	         * the |index|, |removed| sequence of items were removed, and counting forward
	         * from |index|, |addedCount| items were added.
	         */

	        /**
	         * Lacking individual splice mutation information, the minimal set of
	         * splices can be synthesized given the previous state and final state of an
	         * array. The basic approach is to calculate the edit distance matrix and
	         * choose the shortest path through it.
	         *
	         * Complexity: O(l * p)
	         *   l: The length of the current array
	         *   p: The length of the old array
	         */
	        calcSplices: function (current, currentStart, currentEnd, old, oldStart, oldEnd) {
	            var prefixCount = 0;
	            var suffixCount = 0;

	            var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
	            if (currentStart == 0 && oldStart == 0)
	                prefixCount = this.sharedPrefix(current, old, minLength);

	            if (currentEnd == current.length && oldEnd == old.length)
	                suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);

	            currentStart += prefixCount;
	            oldStart += prefixCount;
	            currentEnd -= suffixCount;
	            oldEnd -= suffixCount;

	            if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0)
	                return [];

	            if (currentStart == currentEnd) {
	                var splice = newSplice(currentStart, [], 0);
	                while (oldStart < oldEnd)
	                    splice.removed.push(old[oldStart++]);

	                return [splice];
	            } else if (oldStart == oldEnd)
	                return [newSplice(currentStart, [], currentEnd - currentStart)];

	            var ops = this.spliceOperationsFromEditDistances(
	                this.calcEditDistances(current, currentStart, currentEnd,
	                    old, oldStart, oldEnd));

	            var splice = undefined;
	            var splices = [];
	            var index = currentStart;
	            var oldIndex = oldStart;
	            for (var i = 0; i < ops.length; i++) {
	                switch (ops[i]) {
	                    case EDIT_LEAVE:
	                        if (splice) {
	                            splices.push(splice);
	                            splice = undefined;
	                        }

	                        index++;
	                        oldIndex++;
	                        break;
	                    case EDIT_UPDATE:
	                        if (!splice)
	                            splice = newSplice(index, [], 0);

	                        splice.addedCount++;
	                        index++;

	                        splice.removed.push(old[oldIndex]);
	                        oldIndex++;
	                        break;
	                    case EDIT_ADD:
	                        if (!splice)
	                            splice = newSplice(index, [], 0);

	                        splice.addedCount++;
	                        index++;
	                        break;
	                    case EDIT_DELETE:
	                        if (!splice)
	                            splice = newSplice(index, [], 0);

	                        splice.removed.push(old[oldIndex]);
	                        oldIndex++;
	                        break;
	                }
	            }

	            if (splice) {
	                splices.push(splice);
	            }
	            return splices;
	        },

	        sharedPrefix: function (current, old, searchLength) {
	            for (var i = 0; i < searchLength; i++)
	                if (!this.equals(current[i], old[i]))
	                    return i;
	            return searchLength;
	        },

	        sharedSuffix: function (current, old, searchLength) {
	            var index1 = current.length;
	            var index2 = old.length;
	            var count = 0;
	            while (count < searchLength && this.equals(current[--index1], old[--index2]))
	                count++;

	            return count;
	        },

	        calculateSplices: function (current, previous) {
	            return this.calcSplices(current, 0, current.length, previous, 0,
	                previous.length);
	        },

	        equals: function (currentValue, previousValue) {
	            return currentValue === previousValue;
	        }
	    };

	    var arraySplice = new ArraySplice();

	    function calcSplices(current, currentStart, currentEnd, old, oldStart, oldEnd) {
	        return arraySplice.calcSplices(current, currentStart, currentEnd,
	            old, oldStart, oldEnd);
	    }


	    function newSplice(index, removed, addedCount) {
	        return {
	            index: index,
	            removed: removed,
	            addedCount: addedCount
	        };
	    }


	    function checkpoint() {

	        var cycles = 0;
	        var results = {};


	        cycles++;
	        var toCheck = allObservers;
	        allObservers = [];
	        results.anyChanged = false;

	        for (var i = 0; i < toCheck.length; i++) {
	            var observer = toCheck[i];
	            if (observer.state_ != OPENED)
	                continue;

	            observer.check_()



	            allObservers.push(observer);
	        }

	    }


	    var timer;

	    var setFlushInterval = function (time) {
	        if (timer) {
	            clearInterval(timer);
	        }

	        timer = setInterval(checkpoint, time)

	    }

	    timer = setInterval(checkpoint, MAX_DIRTY_CHECK_CYCLES);


	    global.PathObserver = PathObserver;
	    global.SimpleObserver = SimpleObserver;
	    global.ArrayObserver = ArrayObserver;
	    global.CompoundObserver = CompoundObserver;


	    global.Path = Path;
	    global.flush = checkpoint;
	    global.setFlushInterval = setFlushInterval;

	})(window.Leaf);


/***/ },
/* 7 */
/***/ function(module, exports) {

	(function (global) {

	    function unbind(node, name) {
	        var bindings = node.bindings;
	        if (!bindings) {
	            node.bindings = {};
	            return;
	        }

	        var binding = bindings[name];
	        if (!binding)
	            return;

	        binding.close();
	        bindings[name] = undefined;
	    }


	    function sanitizeValue(value) {
	        return value == null ? '' : value;
	    }

	    function updateText(node, value) {
	        node.data = sanitizeValue(value);
	    }

	    function textBinding(node) {
	        return function (value) {
	            return updateText(node, value);
	        };
	    }


	    function updateAttribute(el, name, conditional, value) {
	        if (conditional) {
	            if (value)
	                el.setAttribute(name, '');
	            else
	                el.removeAttribute(name);
	            return;
	        }

	        el.setAttribute(name, sanitizeValue(value));
	    }

	    function attributeBinding(el, name, conditional) {
	        return function (value) {
	            updateAttribute(el, name, conditional, value);
	        };
	    }


	    function bind(node, name, observer) {

	        if (name == "textContent") {
	            unbind(node, 'textContent');
	            updateText(node, observer.open(textBinding(node)));
	            return node.bindings.textContent = observer;
	        }
	        else {
	            var conditional = name[name.length - 1] == '?';
	            if (conditional) {
	                node.removeAttribute(name);
	                name = name.slice(0, -1);
	            }
	            unbind(node, name);
	            updateAttribute(node, name, conditional,
	                observer.open(attributeBinding(node, name, conditional)));

	            return node.bindings[name] = observer;
	        }


	    }

	    global.bind = bind;


	})(window.Leaf);


/***/ },
/* 8 */
/***/ function(module, exports) {

	/*
	  Copyright (C) 2013 Ariya Hidayat <ariya.hidayat@gmail.com>
	  Copyright (C) 2013 Thaddee Tyl <thaddee.tyl@gmail.com>
	  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
	  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
	  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
	  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
	  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
	  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
	  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

	  Redistribution and use in source and binary forms, with or without
	  modification, are permitted provided that the following conditions are met:

	    * Redistributions of source code must retain the above copyright
	      notice, this list of conditions and the following disclaimer.
	    * Redistributions in binary form must reproduce the above copyright
	      notice, this list of conditions and the following disclaimer in the
	      documentation and/or other materials provided with the distribution.

	  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
	  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
	  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
	  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/

	(function (global) {
	    'use strict';

	    var Token,
	        TokenName,
	        Syntax,
	        Messages,
	        source,
	        index,
	        length,
	        delegate,
	        lookahead,
	        state;

	    Token = {
	        BooleanLiteral: 1,
	        EOF: 2,
	        Identifier: 3,
	        Keyword: 4,
	        NullLiteral: 5,
	        NumericLiteral: 6,
	        Punctuator: 7,
	        StringLiteral: 8
	    };

	    TokenName = {};
	    TokenName[Token.BooleanLiteral] = 'Boolean';
	    TokenName[Token.EOF] = '<end>';
	    TokenName[Token.Identifier] = 'Identifier';
	    TokenName[Token.Keyword] = 'Keyword';
	    TokenName[Token.NullLiteral] = 'Null';
	    TokenName[Token.NumericLiteral] = 'Numeric';
	    TokenName[Token.Punctuator] = 'Punctuator';
	    TokenName[Token.StringLiteral] = 'String';

	    Syntax = {
	        ArrayExpression: 'ArrayExpression',
	        BinaryExpression: 'BinaryExpression',

	        ConditionalExpression: 'ConditionalExpression',


	        Identifier: 'Identifier',
	        Literal: 'Literal',

	        CallExpression:'CallExpression',
	        MemberExpression: 'MemberExpression',


	        Property: 'Property',
	        ThisExpression: 'ThisExpression',
	        UnaryExpression: 'UnaryExpression'
	    };

	    // Error messages should be identical to V8.
	    Messages = {
	        UnexpectedToken:  'Unexpected token %0',
	        UnknownLabel: 'Undefined label \'%0\'',
	        Redeclaration: '%0 \'%1\' has already been declared'
	    };

	    // Ensure the condition is true, otherwise throw an error.
	    // This is only to have a better contract semantic, i.e. another safety net
	    // to catch a logic error. The condition shall be fulfilled in normal case.
	    // Do NOT use this to enforce a certain condition on any user input.

	    function assert(condition, message) {
	        if (!condition) {
	            throw new Error('ASSERT: ' + message);
	        }
	    }

	    function isDecimalDigit(ch) {
	        return (ch >= 48 && ch <= 57);   // 0..9
	    }


	    // 7.2 White Space

	    function isWhiteSpace(ch) {
	        return (ch === 32) ||  // space
	            (ch === 9) ||      // tab
	            (ch === 0xB) ||
	            (ch === 0xC) ||
	            (ch === 0xA0) ||
	            (ch >= 0x1680 && '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(String.fromCharCode(ch)) > 0);
	    }

	    // 7.3 Line Terminators

	    function isLineTerminator(ch) {
	        return (ch === 10) || (ch === 13) || (ch === 0x2028) || (ch === 0x2029);
	    }

	    // 7.6 Identifier Names and Identifiers

	    function isIdentifierStart(ch) {
	        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
	            (ch >= 65 && ch <= 90) ||         // A..Z
	            (ch >= 97 && ch <= 122);          // a..z
	    }

	    function isIdentifierPart(ch) {
	        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
	            (ch >= 65 && ch <= 90) ||         // A..Z
	            (ch >= 97 && ch <= 122) ||        // a..z
	            (ch >= 48 && ch <= 57);           // 0..9
	    }

	    // 7.6.1.1 Keywords

	    function isKeyword(id) {
	        return (id === 'this')
	    }

	    // 7.4 Comments

	    function skipWhitespace() {
	        while (index < length && isWhiteSpace(source.charCodeAt(index))) {
	           ++index;
	        }
	    }

	    function getIdentifier() {
	        var start, ch;

	        start = index++;
	        while (index < length) {
	            ch = source.charCodeAt(index);
	            if (isIdentifierPart(ch)) {
	                ++index;
	            } else {
	                break;
	            }
	        }

	        return source.slice(start, index);
	    }

	    function scanIdentifier() {
	        var start, id, type;

	        start = index;

	        id = getIdentifier();

	        // There is no keyword or literal with only one character.
	        // Thus, it must be an identifier.
	        if (id.length === 1) {
	            type = Token.Identifier;
	        } else if (isKeyword(id)) {
	            type = Token.Keyword;
	        } else if (id === 'null') {
	            type = Token.NullLiteral;
	        } else if (id === 'true' || id === 'false') {
	            type = Token.BooleanLiteral;
	        } else {
	            type = Token.Identifier;
	        }

	        return {
	            type: type,
	            value: id,
	            range: [start, index]
	        };
	    }


	    // 7.7 Punctuators

	    function scanPunctuator() {
	        var start = index,
	            code = source.charCodeAt(index),
	            code2,
	            ch1 = source[index],
	            ch2;

	        switch (code) {

	        // Check for most common single-character punctuators.
	        case 46:   // . dot
	        case 40:   // ( open bracket
	        case 41:   // ) close bracket
	        case 59:   // ; semicolon
	        case 44:   // , comma
	        case 123:  // { open curly brace
	        case 125:  // } close curly brace
	        case 91:   // [
	        case 93:   // ]
	        case 58:   // :
	        case 63:   // ?
	            ++index;
	            return {
	                type: Token.Punctuator,
	                value: String.fromCharCode(code),
	                range: [start, index]
	            };

	        default:
	            code2 = source.charCodeAt(index + 1);

	            // '=' (char #61) marks an assignment or comparison operator.
	            if (code2 === 61) {
	                switch (code) {
	                case 37:  // %
	                case 38:  // &
	                case 42:  // *:
	                case 43:  // +
	                case 45:  // -
	                case 47:  // /
	                case 60:  // <
	                case 62:  // >
	                case 124: // |
	                    index += 2;
	                    return {
	                        type: Token.Punctuator,
	                        value: String.fromCharCode(code) + String.fromCharCode(code2),
	                        range: [start, index]
	                    };

	                case 33: // !
	                case 61: // =
	                    index += 2;

	                    // !== and ===
	                    if (source.charCodeAt(index) === 61) {
	                        ++index;
	                    }
	                    return {
	                        type: Token.Punctuator,
	                        value: source.slice(start, index),
	                        range: [start, index]
	                    };
	                default:
	                    break;
	                }
	            }
	            break;
	        }

	        // Peek more characters.

	        ch2 = source[index + 1];

	        // Other 2-character punctuators: && ||

	        if (ch1 === ch2 && ('&|'.indexOf(ch1) >= 0)) {
	            index += 2;
	            return {
	                type: Token.Punctuator,
	                value: ch1 + ch2,
	                range: [start, index]
	            };
	        }

	        if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
	            ++index;
	            return {
	                type: Token.Punctuator,
	                value: ch1,
	                range: [start, index]
	            };
	        }

	        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	    }

	    // 7.8.3 Numeric Literals
	    function scanNumericLiteral() {
	        var number, start, ch;

	        ch = source[index];
	        assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
	            'Numeric literal must start with a decimal digit or a decimal point');

	        start = index;
	        number = '';
	        if (ch !== '.') {
	            number = source[index++];
	            ch = source[index];

	            // Hex number starts with '0x'.
	            // Octal number starts with '0'.
	            if (number === '0') {
	                // decimal number starts with '0' such as '09' is illegal.
	                if (ch && isDecimalDigit(ch.charCodeAt(0))) {
	                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                }
	            }

	            while (isDecimalDigit(source.charCodeAt(index))) {
	                number += source[index++];
	            }
	            ch = source[index];
	        }

	        if (ch === '.') {
	            number += source[index++];
	            while (isDecimalDigit(source.charCodeAt(index))) {
	                number += source[index++];
	            }
	            ch = source[index];
	        }

	        if (ch === 'e' || ch === 'E') {
	            number += source[index++];

	            ch = source[index];
	            if (ch === '+' || ch === '-') {
	                number += source[index++];
	            }
	            if (isDecimalDigit(source.charCodeAt(index))) {
	                while (isDecimalDigit(source.charCodeAt(index))) {
	                    number += source[index++];
	                }
	            } else {
	                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	            }
	        }

	        if (isIdentifierStart(source.charCodeAt(index))) {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }

	        return {
	            type: Token.NumericLiteral,
	            value: parseFloat(number),
	            range: [start, index]
	        };
	    }

	    // 7.8.4 String Literals

	    function scanStringLiteral() {
	        var str = '', quote, start, ch, octal = false;

	        quote = source[index];
	        assert((quote === '\'' || quote === '"'),
	            'String literal must starts with a quote');

	        start = index;
	        ++index;

	        while (index < length) {
	            ch = source[index++];

	            if (ch === quote) {
	                quote = '';
	                break;
	            } else if (ch === '\\') {
	                ch = source[index++];
	                if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
	                    switch (ch) {
	                    case 'n':
	                        str += '\n';
	                        break;
	                    case 'r':
	                        str += '\r';
	                        break;
	                    case 't':
	                        str += '\t';
	                        break;
	                    case 'b':
	                        str += '\b';
	                        break;
	                    case 'f':
	                        str += '\f';
	                        break;
	                    case 'v':
	                        str += '\x0B';
	                        break;

	                    default:
	                        str += ch;
	                        break;
	                    }
	                } else {
	                    if (ch ===  '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                }
	            } else if (isLineTerminator(ch.charCodeAt(0))) {
	                break;
	            } else {
	                str += ch;
	            }
	        }

	        if (quote !== '') {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }

	        return {
	            type: Token.StringLiteral,
	            value: str,
	            octal: octal,
	            range: [start, index]
	        };
	    }

	    function isIdentifierName(token) {
	        return token.type === Token.Identifier ||
	            token.type === Token.Keyword ||
	            token.type === Token.BooleanLiteral ||
	            token.type === Token.NullLiteral;
	    }

	    function advance() {
	        var ch;

	        skipWhitespace();

	        if (index >= length) {
	            return {
	                type: Token.EOF,
	                range: [index, index]
	            };
	        }

	        ch = source.charCodeAt(index);

	        // Very common: ( and ) and ;
	        if (ch === 40 || ch === 41 || ch === 58) {
	            return scanPunctuator();
	        }

	        // String literal starts with single quote (#39) or double quote (#34).
	        if (ch === 39 || ch === 34) {
	            return scanStringLiteral();
	        }

	        if (isIdentifierStart(ch)) {
	            return scanIdentifier();
	        }

	        // Dot (.) char #46 can also start a floating-point number, hence the need
	        // to check the next character.
	        if (ch === 46) {
	            if (isDecimalDigit(source.charCodeAt(index + 1))) {
	                return scanNumericLiteral();
	            }
	            return scanPunctuator();
	        }

	        if (isDecimalDigit(ch)) {
	            return scanNumericLiteral();
	        }

	        return scanPunctuator();
	    }

	    function lex() {
	        var token;

	        token = lookahead;
	        index = token.range[1];

	        lookahead = advance();

	        index = token.range[1];

	        return token;
	    }

	    function peek() {
	        var pos;

	        pos = index;
	        lookahead = advance();
	        index = pos;
	    }

	    // Throw an exception

	    function throwError(token, messageFormat) {
	        var error,
	            args = Array.prototype.slice.call(arguments, 2),
	            msg = messageFormat.replace(
	                /%(\d)/g,
	                function (whole, index) {
	                    assert(index < args.length, 'Message reference must be in range');
	                    return args[index];
	                }
	            );

	        error = new Error(msg);
	        error.index = index;
	        error.description = msg;
	        throw error;
	    }

	    // Throw an exception because of the token.

	    function throwUnexpected(token) {
	        throwError(token, Messages.UnexpectedToken, token.value);
	    }

	    // Expect the next token to match the specified punctuator.
	    // If not, an exception will be thrown.

	    function expect(value) {
	        var token = lex();
	        if (token.type !== Token.Punctuator || token.value !== value) {
	            throwUnexpected(token);
	        }
	    }

	    // Return true if the next token matches the specified punctuator.

	    function match(value) {
	        return lookahead.type === Token.Punctuator && lookahead.value === value;
	    }

	    // Return true if the next token matches the specified keyword

	    function matchKeyword(keyword) {
	        return lookahead.type === Token.Keyword && lookahead.value === keyword;
	    }

	    function consumeSemicolon() {
	        // Catch the very common case first: immediately a semicolon (char #59).
	        if (source.charCodeAt(index) === 59) {
	            lex();
	            return;
	        }

	        skipWhitespace();

	        if (match(';')) {
	            lex();
	            return;
	        }

	        if (lookahead.type !== Token.EOF && !match('}')) {
	            throwUnexpected(lookahead);
	        }
	    }




	    // 11.1.6 The Grouping Operator

	    function parseGroupExpression() {
	        var expr;

	        expect('(');

	        expr = parseExpression();

	        expect(')');

	        return expr;
	    }


	    // 11.1 Primary Expressions

	    function parsePrimaryExpression() {
	        var type, token, expr;

	        if (match('(')) {
	            return parseGroupExpression();
	        }

	        type = lookahead.type;

	        if (type === Token.Identifier) {
	            expr = delegate.createIdentifier(lex().value);
	        } else if (type === Token.StringLiteral || type === Token.NumericLiteral) {
	            expr = delegate.createLiteral(lex());
	        } else if (type === Token.Keyword) {
	            if (matchKeyword('this')) {
	                lex();
	                expr = delegate.createThisExpression();
	            }
	        } else if (type === Token.BooleanLiteral) {
	            token = lex();
	            token.value = (token.value === 'true');
	            expr = delegate.createLiteral(token);
	        } else if (type === Token.NullLiteral) {
	            token = lex();
	            token.value = null;
	            expr = delegate.createLiteral(token);
	        }

	        if (expr) {
	            return expr;
	        }

	        throwUnexpected(lex());
	    }

	    // 11.2 Left-Hand-Side Expressions

	    function parseArguments() {
	        var args = [];

	        expect('(');

	        if (!match(')')) {
	            while (index < length) {
	                args.push(parseExpression());
	                if (match(')')) {
	                    break;
	                }
	                expect(',');
	            }
	        }

	        expect(')');

	        return args;
	    }

	    function parseNonComputedProperty() {
	        var token;

	        token = lex();

	        if (!isIdentifierName(token)) {
	            throwUnexpected(token);
	        }

	        return delegate.createIdentifier(token.value);
	    }

	    function parseNonComputedMember() {
	        expect('.');

	        return parseNonComputedProperty();
	    }

	    function parseComputedMember() {
	        var expr;

	        expect('[');

	        expr = parseExpression();

	        expect(']');

	        return expr;
	    }

	    function parseLeftHandSideExpression() {
	        var expr, property;

	        expr = parsePrimaryExpression();

	        while (match('.') || match('[')) {
	            if (match('[')) {
	                property = parseComputedMember();
	                expr = delegate.createMemberExpression('[', expr, property);
	            } else {
	                property = parseNonComputedMember();
	                expr = delegate.createMemberExpression('.', expr, property);
	            }
	        }

	        return expr;
	    }

	    // 11.3 Postfix Expressions

	    var parsePostfixExpression = parseLeftHandSideExpression;

	    // 11.4 Unary Operators

	    function parseUnaryExpression() {
	        var token, expr;

	        if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
	            expr = parsePostfixExpression();
	        } else if (match('+') || match('-') || match('!')) {
	            token = lex();
	            expr = parseUnaryExpression();
	            expr = delegate.createUnaryExpression(token.value, expr);
	        } else if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
	            throwError({}, Messages.UnexpectedToken);
	        } else {
	            expr = parsePostfixExpression();
	        }

	        return expr;
	    }

	    function binaryPrecedence(token) {
	        var prec = 0;

	        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
	            return 0;
	        }

	        switch (token.value) {
	        case '||':
	            prec = 1;
	            break;

	        case '&&':
	            prec = 2;
	            break;

	        case '==':
	        case '!=':
	        case '===':
	        case '!==':
	            prec = 6;
	            break;

	        case '<':
	        case '>':
	        case '<=':
	        case '>=':
	        case 'instanceof':
	            prec = 7;
	            break;

	        case 'in':
	            prec = 7;
	            break;

	        case '+':
	        case '-':
	            prec = 9;
	            break;

	        case '*':
	        case '/':
	        case '%':
	            prec = 11;
	            break;

	        default:
	            break;
	        }

	        return prec;
	    }

	    // 11.5 Multiplicative Operators
	    // 11.6 Additive Operators
	    // 11.7 Bitwise Shift Operators
	    // 11.8 Relational Operators
	    // 11.9 Equality Operators
	    // 11.10 Binary Bitwise Operators
	    // 11.11 Binary Logical Operators

	    function parseBinaryExpression() {
	        var expr, token, prec, stack, right, operator, left, i;

	        left = parseUnaryExpression();

	        token = lookahead;
	        prec = binaryPrecedence(token);
	        if (prec === 0) {
	            return left;
	        }
	        token.prec = prec;
	        lex();

	        right = parseUnaryExpression();

	        stack = [left, token, right];

	        while ((prec = binaryPrecedence(lookahead)) > 0) {

	            // Reduce: make a binary expression from the three topmost entries.
	            while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
	                right = stack.pop();
	                operator = stack.pop().value;
	                left = stack.pop();
	                expr = delegate.createBinaryExpression(operator, left, right);
	                stack.push(expr);
	            }

	            // Shift.
	            token = lex();
	            token.prec = prec;
	            stack.push(token);
	            expr = parseUnaryExpression();
	            stack.push(expr);
	        }

	        // Final reduce to clean-up the stack.
	        i = stack.length - 1;
	        expr = stack[i];
	        while (i > 1) {
	            expr = delegate.createBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
	            i -= 2;
	        }

	        return expr;
	    }


	    // 11.12 Conditional Operator

	    function parseConditionalExpression() {
	        var expr, consequent, alternate;

	        expr = parseBinaryExpression();

	        if (match('?')) {
	            lex();
	            consequent = parseConditionalExpression();
	            expect(':');
	            alternate = parseConditionalExpression();

	            expr = delegate.createConditionalExpression(expr, consequent, alternate);
	        }

	        return expr;
	    }

	    // Simplification since we do not support AssignmentExpression.
	    var parseExpression = parseConditionalExpression;

	    // Polymer Syntax extensions

	    // Filter ::
	    //   Identifier
	    //   Identifier "(" ")"
	    //   Identifier "(" FilterArguments ")"

	    function parseFilter() {
	        var identifier, args;

	        identifier = lex();

	        if (identifier.type !== Token.Identifier) {
	            throwUnexpected(identifier);
	        }

	        args = match('(') ? parseArguments() : [];

	        return delegate.createFilter(identifier.value, args);
	    }

	    // Filters ::
	    //   "|" Filter
	    //   Filters "|" Filter

	    function parseFilters() {
	        while (match('|')) {
	            lex();
	            parseFilter();
	        }
	    }

	    // TopLevel ::
	    //   LabelledExpressions
	    //   AsExpression
	    //   InExpression
	    //   FilterExpression

	    // AsExpression ::
	    //   FilterExpression as Identifier

	    // InExpression ::
	    //   Identifier, Identifier in FilterExpression
	    //   Identifier in FilterExpression

	    // FilterExpression ::
	    //   Expression
	    //   Expression Filters

	    function parseTopLevel() {
	        skipWhitespace();
	        peek();

	        var expr = parseExpression();
	        if (expr) {
	            if (lookahead.value === ',' || lookahead.value == 'in' &&
	                       expr.type === Syntax.Identifier) {
	                parseInExpression(expr);
	            } else {
	                parseFilters();
	                if (lookahead.value === 'as') {
	                    parseAsExpression(expr);
	                } else {
	                    delegate.createTopLevel(expr);
	                }
	            }
	        }

	        if (lookahead.type !== Token.EOF) {
	            throwUnexpected(lookahead);
	        }
	    }

	    function parseAsExpression(expr) {
	        lex();  // as
	        var identifier = lex().value;
	        delegate.createAsExpression(expr, identifier);
	    }

	    function parseInExpression(identifier) {
	        var indexName;
	        if (lookahead.value === ',') {
	            lex();
	            if (lookahead.type !== Token.Identifier)
	                throwUnexpected(lookahead);
	            indexName = lex().value;
	        }

	        lex();  // in
	        var expr = parseExpression();
	        parseFilters();
	        delegate.createInExpression(identifier.namee, indexName, expr);
	    }

	    function parse(code, inDelegate) {
	        delegate = inDelegate;
	        source = code;
	        index = 0;
	        length = source.length;
	        lookahead = null;
	        state = {
	            labelSet: {}
	        };

	        return parseTopLevel();
	    }

	    global.esprima = {
	        parse: parse
	    };
	})(window.Leaf);


/***/ },
/* 9 */
/***/ function(module, exports) {

	(function (global) {

	    var Path = global.Path;

	    var unaryOperators = {
	        '+': function (v) {
	            return +v;
	        },
	        '-': function (v) {
	            return -v;
	        },
	        '!': function (v) {
	            return !v;
	        }
	    };

	    var binaryOperators = {
	        '+': function (l, r) {
	            return l + r;
	        },
	        '-': function (l, r) {
	            return l - r;
	        },
	        '*': function (l, r) {
	            return l * r;
	        },
	        '/': function (l, r) {
	            return l / r;
	        },
	        '%': function (l, r) {
	            return l % r;
	        },
	        '<': function (l, r) {
	            return l < r;
	        },
	        '>': function (l, r) {
	            return l > r;
	        },
	        '<=': function (l, r) {
	            return l <= r;
	        },
	        '>=': function (l, r) {
	            return l >= r;
	        },
	        '==': function (l, r) {
	            return l == r;
	        },
	        '!=': function (l, r) {
	            return l != r;
	        },
	        '===': function (l, r) {
	            return l === r;
	        },
	        '!==': function (l, r) {
	            return l !== r;
	        },
	        '&&': function (l, r) {
	            return l && r;
	        },
	        '||': function (l, r) {
	            return l || r;
	        }
	    };


	    var parse = function (expressionText, model) {

	        var result = function(){};

	        var filters = [];

	        var createGetValueFun = function (expresson) {


	            return function () {
	                var result = expresson();

	                for (var i = 0; i < filters.length; i++) {

	                    var fun = model.getValue(filters[i].name);
	                    if (fun) {
	                        result = fun.call(model.scope, result)
	                    }
	                }

	                return result;


	            }

	        }

	        global.esprima.parse(expressionText, {

	            createUnaryExpression: function (op, argument) {
	                if (!unaryOperators[op])
	                    throw Error('Disallowed operator: ' + op);
	                return function () {
	                    return unaryOperators[op](argument());
	                };
	            },

	            createBinaryExpression: function (op, left, right) {

	                return function () {
	                    return binaryOperators[op](left(), right())
	                }


	            },

	            createConditionalExpression: function (test, consequent, alternate) {


	                return function () {
	                    return test() ? consequent() : alternate();
	                }
	            },

	            createFilter: function (name, args) {
	                filters.push({name: name, args: args})
	            },


	            createIdentifier: function (name) {


	                var path = global.Path.get(name);


	                var result = function () {
	                    return  model.getValue(path);
	                }
	                result.name = name;//会被清空
	                result.namee = name;
	                result.type = 'Identifier';
	                return result;

	            },
	            createLiteral: function (token) {
	                return function () {
	                    return token.value;
	                }
	            },
	            createMemberExpression: function (accessor, object, property) {




	                var path = Path.get(property.namee);



	                var result = function () {
	                    var obj = object();
	                    return  path.getValueFrom(obj);
	                }

	                return result;

	            },
	            createAsExpression: function (expression, scopeIdent) {

	                result = createGetValueFun(expression);;
	                model.scopeIdent = scopeIdent;


	            },

	            createInExpression: function (scopeIdent, indexIdent, expression) {
	                result = createGetValueFun(expression);
	                model.scopeIdent = scopeIdent;
	                model.indexIdent = indexIdent;
	            },

	            createTopLevel: function (expression) {
	                result = createGetValueFun(expression);

	            }


	        })

	        return  result;

	    }

	    global.expressionParse = parse;


	    // global.expressionParse = function(expressionText, model){
	    //   var func =  new Function(expressionText);
	    //   var result = ""
	    //   try{
	    //     result = func.apply(model.value_);
	    //   }catch(e){
	    //       console.error(e)
	    //   }
	    //
	    //   return result;
	    //
	    //
	    // }


	})(window.Leaf);


/***/ },
/* 10 */
/***/ function(module, exports) {

	// Copyright 2011 Google Inc.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	//     http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.


	(function (global) {


	    var REPEAT = 'repeat';
	    var IF = 'if';

	    function trim(s) {
	        return s.replace(/(^\s*)|(\s*$)/g, "");
	    }

	    function relValue(s) {
	        return trim(s.replace(/(^{{)|(}}*$)/g, ""));
	    }


	    var Model = function (value, scopeIdent, indexIdent, index) {
	        this.value_ = value

	        if(!scopeIdent&&!indexIdent){
	            value._model = this;
	        }

	        this.scopeIdent = scopeIdent;
	        this.indexIdent = indexIdent;
	        this.index = index
	        this.parent = null;
	        this.isModel = true;
	        this.scope = this.value_;
	        this.allObservers = [];

	    }

	    Model.prototype.getValue = function (path, from) {

	        var path = path instanceof Leaf.Path ? path : Leaf.Path.get(path);

	        var valueTarget = this.value_;
	        if (valueTarget == null) return;

	        for (var i = 0; i < path.parts.length; i++) {
	            if (i == 0 && this.scopeIdent && path.parts[i] == this.scopeIdent) {
	                valueTarget = this.value_;
	            }
	            else if (i == 0 && this.indexIdent && path.parts[i] == this.indexIdent) {
	                valueTarget = this.index;
	            }
	            else {
	                valueTarget = valueTarget[path.parts[i]];
	            }


	            if (i == 0 && valueTarget === undefined && this.parent) {
	                if (from)from.scope = this.value_;
	                return this.parent.getValue(path, this);
	            }

	            if (valueTarget == null) return;


	        }
	        return valueTarget;

	    }

	    Model.prototype.addObserver = function(observer){
	      this.allObservers.push(observer)
	    }

	    Model.prototype.checkpoint = function() {
	        var toCheck = this.allObservers;
	        for (var i = 0; i < toCheck.length; i++) {
	            var observer = toCheck[i];
	            if (observer.state_ != OPENED)
	                continue;
	            observer.check_();
	        }

	    }


	    function createInstance(template, model, node) {

	        if (!model.isModel) {
	            model = new Model(model);
	        }


	        if (!template.content) {
	            template.content = document.createDocumentFragment();
	            var child;
	            while (child = template.firstChild) {
	                template.content.appendChild(child);
	            }
	        }

	        var content = template.content;

	        var valueString, bindings = {};
	        if (valueString = template.getAttribute(IF)) {
	            processIfBinding(relValue(valueString), content, node, model)
	        }
	        else if (valueString = template.getAttribute(REPEAT)) {
	            processRepeatBinding(relValue(valueString), content, node, model);
	        }
	        else {
	            var i = 0;
	            for (var child = content.firstChild; child; child = child.nextSibling) {
	                cloneAndBindingInstance(child, node, model);
	            }
	        }

	        return node;

	    }

	    function cloneAndBindingInstance(node, doc, model) {
	        if (node.tagName && node.tagName.toLowerCase() == "template") {
	            createInstance(node, model, doc);
	        }
	        else {
	            var clone = node.cloneNode();
	            doc.appendChild(clone);
	            var i = 0;

	            for (var child = node.firstChild; child; child = child.nextSibling) {
	                cloneAndBindingInstance(child, clone, model);
	            }

	            processBinding(clone, model);
	            return clone;
	        }
	    }


	    //@todo 多个values？还是一个value？
	    var combinator = function (values, tokens) {
	        var newValue = tokens[0];
	        for (var i = 1; i < tokens.length; i += 2) {
	            var value = tokens.hasOnePath ? values : values[(i - 1) / 2];
	            if (value !== undefined) {
	                newValue += value;
	            }
	            newValue += tokens[i + 1];
	        }
	        return newValue;
	    }


	    function processBinding(node, model) {
	        var bindings = parseBinding(node);
	        if (!bindings)return;


	        for (var i = 0; i < bindings.length; i += 2) {
	            var name = bindings[i];
	            var tokens = bindings[i + 1];

	            if (tokens.hasOnePath) {
	                var observer = new Leaf.SimpleObserver();
	                model.addObserver(observer)
	                var expression = Leaf.expressionParse(tokens[1], model);

	                if (tokens.isSimplePath) {
	                    observer.getValue = expression;
	                }
	                else {
	                    observer.getValue = function () {
	                        return tokens[0] + expression() + tokens[2];
	                    };
	                }

	                Leaf.bind(node,name,observer)

	                return observer;
	            }


	            var observer = new Leaf.CompoundObserver();
	            model.addObserver(observer)
	            for (var i = 1; i < tokens.length; i += 2) {
	                var ob = new Leaf.SimpleObserver();
	                var expression = Leaf.expressionParse(tokens[i], model);

	                ob.getValue = (function (before, after) {

	                    return function () {
	                        return  before + expression() + after;
	                    }


	                })(tokens[i - 1], tokens[i + 1]);

	                observer.addObserver(ob);
	            }

	            Leaf.bind(node,name,observer)
	          }

	        return observer;
	    }


	    function processIfBinding(ifValue, content, doc, model) {

	        var firstChild;
	        var lastChild;
	        var instanceNodes = [];
	        // var observer = new PathObserver(model, ifValue);

	        var observer = new Leaf.SimpleObserver();
	        model.addObserver(observer)
	        var expression = Leaf.expressionParse(ifValue, model);
	        observer.getValue = expression;


	        var fragment;
	        var stamp = document.createTextNode("");
	        doc.appendChild(stamp);

	        observer.open(function (value) {
	            if (value) {
	                if (instanceNodes.length) {
	                    for (var i = 0; i < instanceNodes.length; i++) {
	                        if (stamp.nextSibling) {
	                            doc.insertBefore(instanceNodes[i], stamp.nextSibling);
	                        }
	                        else {
	                            doc.appendChild(instanceNodes[i])
	                        }
	                    }
	                    instanceNodes = [];
	                }
	                else {
	                    var fragment = document.createDocumentFragment();
	                    var i = 0;

	                    for (var child = content.firstChild; child; child = child.nextSibling) {
	                        cloneAndBindingInstance(child, fragment, model);
	                    }
	                    lastChild = fragment.lastChild;
	                    firstChild = fragment.firstChild;
	                    doc.appendChild(fragment);
	                }
	            }

	            else {

	                if (firstChild) {

	                    var current = lastChild;
	                    var end = stamp;
	                    while (current != end) {
	                        var old = current;
	                        current = current.previousSibling;
	                        instanceNodes.push(old);
	                        doc.removeChild(old);
	                    }
	                }
	            }
	        });

	    }


	    function processRepeatBinding(repeatValue, content, doc, model) {


	        var firstChild;
	        var lastChild;
	        var instanceNodes = [];
	        var stamp = document.createTextNode("");
	        doc.appendChild(stamp);

	        var terminators = [];

	        var getTerminatorAt = function (i) {
	            if (i < 0) {
	                return stamp;
	            }
	            return terminators[i];
	        }


	        var observer = new Leaf.ArrayObserver();

	          model.addObserver(observer)
	        var expression = Leaf.expressionParse(repeatValue, model);

	        observer.getValue = expression


	        var values = observer.open(function (splices) {

	            splices.forEach(function (splice) {

	                if (splice.removed.length) {
	                    var removedIndex = splice.index;
	                    var lastIndex = removedIndex + splice.removed.length;
	                    var start = getTerminatorAt(removedIndex - 1);
	                    start = start.nextSibling;
	                    var end = getTerminatorAt(lastIndex);

	                    while (start != end) {
	                        var old = start;
	                        start = start.nextSibling;
	                        old.parentNode.removeChild(old);
	                    }
	                    terminators.splice(removedIndex, splice.removed.length);
	                }


	                if (splice.addedCount) {

	                    var addIndex = splice.index;
	                    for (; addIndex < splice.index + splice.addedCount; addIndex++) {
	                        var fragment = document.createDocumentFragment();
	                        for (var child = content.firstChild; child; child = child.nextSibling) {


	                            var childModel = new Model(splices.values[addIndex], model.scopeIdent, model.indexIdent, addIndex);
	                            childModel.parent = model;

	                            cloneAndBindingInstance(child, fragment, childModel);
	                        }

	                        var terminator = getTerminatorAt(addIndex + 1);

	                        var lastChild = fragment.lastChild;

	                        if (terminator) {
	                            doc.insertBefore(fragment, terminator);
	                        }
	                        else {
	                            terminator = getTerminatorAt(terminators.length - 1).nextSibling;
	                            if (terminator) {
	                                doc.insertBefore(fragment, terminator);
	                            }
	                            else {
	                                getTerminatorAt(terminators.length - 1).parentNode.appendChild(fragment)
	                            }
	                        }
	                        terminators[addIndex] = lastChild;

	                    }

	                }
	            }, this);

	        });

	        if (values && values.length) {

	            for (var i = 0; i < values.length; i++) {
	                var fragment = document.createDocumentFragment();

	                for (var child = content.firstChild; child; child = child.nextSibling) {

	                    var childModel = new Model(values[i], model.scopeIdent, model.indexIdent, i);
	                    childModel.parent = model;

	                    cloneAndBindingInstance(child, fragment, childModel);

	                }

	                terminators[i] = fragment.lastChild;
	                doc.appendChild(fragment);
	            }
	        }
	    }


	    function parseBinding(node) {

	        var bindings = {};

	        var valueString;

	        if (node.tagName && node.tagName.toLowerCase() == "template") {

	        }
	        if (node.nodeType == 1) {
	            return  parseAttrbuteBinding(node);
	        }
	        else if (node.nodeType == 3) {

	            var tokens = parseMustaches(node.data, 'textContent', node);
	            if (tokens) return ['textContent', tokens];

	        }


	    }

	    function parseAttrbuteBinding(element) {

	        var bindings = [];
	        var ifFound = false;
	        var bindFound = false;

	        for (var i = 0; i < element.attributes.length; i++) {
	            var attr = element.attributes[i];
	            var name = attr.name;
	            var value = attr.value;


	            while (name[0] === '_') {
	                name = name.substring(1);
	            }


	            var tokens = parseMustaches(value, name, element);
	            if (!tokens)
	                continue;

	            bindings.push(name, tokens);
	        }

	        return bindings;


	    }

	    function parseWithDefault(el, name) {
	        var v = el.getAttribute(name);
	        return parseMustaches(v == '' ? '{{}}' : v, name, el);

	    }

	    // Returns
	    //   a) undefined if there are no mustaches.
	    //   b) [TEXT, ( PATH, TEXT)+] if there is at least one mustache.
	    function parseMustaches(s, name, node) {
	        if (!s || !s.length)
	            return;

	        var tokens;
	        var length = s.length;
	        var startIndex = 0,
	            lastIndex = 0,
	            endIndex = 0;

	        while (lastIndex < length) {

	            var startIndex = s.indexOf('{{', lastIndex);
	            var terminator = '}}';

	            endIndex = startIndex < 0 ? -1 : s.indexOf(terminator, startIndex + 1);

	            if (endIndex < 0) {
	                if (!tokens) return;
	                tokens.push(s.slice(lastIndex)); // TEXT
	                break;
	            }

	            tokens = tokens || [];


	            tokens.push(s.slice(lastIndex, startIndex)); // TEXT
	            var pathString = s.slice(startIndex + 2, endIndex).trim();

	            tokens.push(pathString); // PATH

	            lastIndex = endIndex + 2;
	        }

	        if (lastIndex === length) tokens.push(''); // TEXT

	        tokens.hasOnePath = tokens.length === 3;
	        tokens.isSimplePath = tokens.hasOnePath && tokens[0] == '' && tokens[2] == '';


	        return tokens;
	    };


	    global.createInstance = createInstance;

	})(window.Leaf);


/***/ },
/* 11 */
/***/ function(module, exports) {

	/**
	 * template , content
	 */
	(function (scope) {

	    scope.register("template")
	    scope.register("content")
	    scope.register("children")


	})(window.Leaf);

	/*
	 * p-element
	 * @todo leaf-element不需要update子节点。
	 */

	(function (scope) {


	    var base = {

	        __implementCallback__: function () {

	            var host = this;
	            var name = this.getAttribute("name");
	            var prototype = {};


	            this.state = {};

	            this.setState = function(name, value){
	              this.state[name]=value;
	              if(this._model){
	                this._model.checkpoint();
	              }
	            }

	            registerAttrs(this, prototype);
	            registerSheets(this, prototype);
	            registerTemplate(this, prototype);
	            // registerScripts(this, prototype);

	            var customPrototype = Leaf._registry[name];

	            if (customPrototype) {
	                for (var p in customPrototype) {
	                    prototype[p] = customPrototype[p]
	                }


	            }


	            if (this.getAttribute("extends")) {
	                prototype.extends = this.getAttribute("extends");
	            }

	            prototype.__implementCallback__ = function () {

	                renderTemplate(this);
	            }


	            Leaf.register(name, prototype)

	        }


	    }


	    function registerAttrs(inElement, prototype) {
	        var attrString = inElement.getAttribute("attributes") || "";

	        var attr = attrString.split(" ");

	        for (var i = 0; i < attr.length; i++) {
	            prototype[attr[i]] = {}
	        }

	        var attrs = inElement.attributes;
	        for (var i = 0; i < attrs.length; i++) {

	            prototype[attrs[i].name] = attrs[i].value
	        }


	    }

	    function registerSheets(inElement, prototype) {

	        var head = document.getElementsByTagName("head")[0];

	        var styles = inElement.getElementsByTagName("style");

	        // var sheets = $("style", $(inElement));

	        // console.log(sheets)

	        for (var i = 0; i < styles.length; i++) {
	            head.appendChild(styles[i]);
	        }


	    }

	    function registerTemplate(inElement, prototype) {

	        var template = inElement.getElementsByTagName("template")[0];
	        prototype.template = template;


	    }

	    function registerScripts(inElement, prototype) {

	        var scripts = inElement.getElementsByTagName("script");
	        for (var i = 0; i < scripts.length; i++) {
	            if (scripts[i].innerText) {
	                var pro = eval(scripts[i].innerText);
	                if (pro) {
	                    for (var p in pro) {
	                        prototype[p] = pro[p];
	                    }
	                }
	            }
	        }
	    }


	        function renderTemplate(inElement) {


	            if (Leaf.renderTemplateCallback) {
	                var result = Leaf.renderTemplateCallback(inElement);
	                if (result === false) {
	                    return;
	                }

	            }


	            if (inElement.template) {
	                //保存起所有元素

	                var childNodes = inElement.childNodes;
	                var nodes = [];
	                for (var i = 0; i < childNodes.length; i++) {
	                    //文本标签也是要的

	                    if (childNodes[i].nodeType == 1) {
	                        nodes.push(childNodes[i]);
	                    }
	                    else if (childNodes[i].nodeType == 3) {
	                        var text = childNodes[i].textContent;
	                        var trimText = text.replace(/(^\s*)|(\s*$)/g, "")
	                        if (trimText) {
	                            nodes.push(childNodes[i]);

	                        }
	                    }




	                }

	                //删除所有子元素

	                for(var i=0;i<nodes.length;i++){
	                     nodes[i].parentNode.removeChild(nodes[i])
	                }

	                // inElement.innerHTML = ""


	                //  inElement.template = inElement.template.replace("<content></content>", content);
	                scope.createInstance(inElement.template, inElement, inElement);

	                var content = inElement.getElementsByTagName("content")[0];
	                var childrenElement = inElement.getElementsByTagName("children")[0];
	                if (inElement.beforeRender) {
	                  var  result = inElement.beforeRender(inElement.template, nodes);
	                  if(result){
	                    nodes = result;
	                  }
	                }
	                if (inElement.renderContent) {
	                  var   result = inElement.renderContent(nodes);
	                  if(result){
	                    nodes = result;
	                  }
	                }
	                if(content){

	                    for (var i = 0; i < nodes.length; i++) {
	                        content.parentNode.insertBefore(nodes[i], content);
	                    }
	                    content.parentNode.removeChild(content);

	                } else if(childrenElement){


	                      if(nodes.length){
	                         var childNodes =  childrenElement.childNodes
	                          var tempChild = [];

	                          for(var i=0;i<childNodes.length;i++){
	                            tempChild.push(childNodes[i])
	                          }

	                         for(var i=0;i<tempChild.length;i++){
	                           tempChild[i].parentNode.removeChild(tempChild[i])
	                         }


	                         for (var i = 0; i < nodes.length; i++) {

	                            childrenElement.appendChild(nodes[i]);
	                         }
	                      }

	                      inElement.contentElement = childrenElement;
	                }

	                if (inElement.afterRender) {
	                    inElement.afterRender();
	                }






	            }
	        }


	    function installSheets(inElement) {
	        var styles = $("style", inElement);
	        $("head").append(styles);


	    }

	    scope.register("leaf-element", base);




	})(window.Leaf);


/***/ },
/* 12 */
/***/ function(module, exports) {

	//bootstrap
	(function (scope) {

	  var utils = scope.utils;
	  var head = document.getElementsByTagName("head")[0];
	  var style = document.createElement("style");
	  style.innerText = "body{opacity:0;filter:alpha(opacity=0)}";
	  //  head.appendChild(style);

	  var ready = false;

	  var readyCallbacks = [];

	  Leaf.readyCallback = Leaf.complete = function (callback) {
	      if (ready) {
	          callback && callback()

	      }
	      else {
	          readyCallbacks.push(callback);
	      }
	  }


	  utils.ready(function () {
	      Leaf.importer.load(document, function () {
	          var leaf = document.getElementsByTagName("leaf-element");
	          for (var i = 0; i < leaf.length; i++) {
	              Leaf.upgradeOne(leaf[i]);
	          }

	          try {
	              var leaf = document.getElementsByTagName("leaf-element");
	              for (var i = 0; i < leaf.length; i++) {
	                  Leaf.upgradeOne(leaf[i]);
	              }

	              Leaf.upgradeDocument(document);

	          } catch (e) {
	              throw e;

	          } finally {
	              //  head.removeChild(style);

	              Leaf._endTime = new Date().getTime();
	              Leaf._time = Leaf._endTime - Leaf._startTime;
	              console.log("Leaf用时：" + Leaf._time / 1000 + "s");

	              ready = true;
	              for (var i = 0; i < readyCallbacks.length; i++) {
	                  readyCallbacks[i]();
	              }

	              setTimeout(function () {
	                  Leaf.setFlushInterval(100);
	              }, 3000)
	          }
	      });
	  })


	  Leaf.render = function (complete) {


	      Leaf.importer.load(document, function () {
	          var leaf = document.getElementsByTagName("leaf-element");
	          for (var i = 0; i < leaf.length; i++) {
	              Leaf.upgradeOne(leaf[i]);
	          }

	          Leaf.upgradeDocument(document);

	          complete && complete();



	      });

	  }



	})(window.Leaf);


/***/ }
/******/ ]);