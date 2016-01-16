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
