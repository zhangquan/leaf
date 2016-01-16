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
