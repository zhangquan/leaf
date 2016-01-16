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
