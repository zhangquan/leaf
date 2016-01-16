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
