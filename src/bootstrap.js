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
