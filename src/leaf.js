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