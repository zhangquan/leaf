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
