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
