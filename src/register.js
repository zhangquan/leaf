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
