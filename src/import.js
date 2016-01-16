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
