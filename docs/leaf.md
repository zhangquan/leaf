
## Leaf core reference


Leaf provides a thin layer of API on top of web components.
It expresses Leaf's opinion, provides the extra sugaring that all Leaf elements use, and is meant to help make developing web components much easier.

## Element declaration

At the heart of Leaf are Custom Elements. Thus, it should be no surprise that defining a Leaf element is similar to the way you define a standard Custom Element. The major difference is that Leaf elements are created declaratively using `<leaf-element>`.

    <leaf-element name="tag-name" constructor="TagName">
      <template>
        <!-- lightdom DOM here -->
      </template>
      <script>Leaf('tag-name');</script>
    </leaf-element>

### Attributes

Leaf [reserves](https://github.com/Leaf/leaf-/blob/master/src/declaration/attributes.js#L53) special attributes to be used on `<leaf-element>`:



<table class="table">
  <tr>
    <th>Attribute</th><th>Required?</th><th>Description</th>
  </tr>
  <tr>
    <td><code>name</code></td><td><b>required</b></td><td>Name for the custom element. Requires a "-".</td>
  </tr>
  <tr>
    <td><code>attributes</code></td><td>optional</td><td>Used to <a href="#published-properties">publish properties</a>.</td>
  </tr>
  <tr>
    <td><code>extends</code></td><td>optional</td><td>Used to <a href="#extending-other-elements">extend other elements</a>.</td>
  </tr>
  <tr>
    <td><code>noscript</code></td><td>optional</td><td>For simple elements that don't need to call <code>Leaf()</code>. See <a href="#altregistration">Alternate ways to register an element</a>.</td>
  </tr>
  <tr>
    <td><code>lightdom</code></td><td>optional</td><td>Produces Light DOM instead of Shadow DOM. See <a href="#createligthdom">Producing Light DOM instead of Shadow DOM</a>.</td>
  </tr>
  <tr>
    <td><code>constructor</code></td><td>optional</td><td>The name of the constructor to put on the global object. Allows users to create instances of your element using the <code>new</code> operator (e.g. <code>var tagName = new TagName()</code>).</td>
  </tr>
</table>


#### Default attributes {#defaultattrs}

Other attributes you declare on `<leaf-element>` will automatically be included
on each instance of the element. For example:

    <leaf-element name="tag-name" class="active" mycustomattr>
      <template>...</template>
      <script>Leaf('tag-name');</script>
    </leaf-element>

When an instance of `<tag-name>` is created, it contains `class="active" mycustomattr`
as default attributes:

    <tag-name class="active" mycustomattr></tag-name>

### Alternate ways to register an element {#altregistration}

For convenient decoupling of script and markup, you don't have to inline your script.
Leaf elements can be created by referencing an external script
which calls `Leaf('tag-name')`:

    <!- 2. Script refereced inside the element definition. -->
    <leaf-element name="tag-name">
      <template>...</template>
      <script src="path/to/tagname.js"></script>
    </leaf-element>

    <!-- 3. Script comes before the element definition. -->
    <script src="path/to/tagname.js"></script>
    <leaf-element name="tag-name">
      <template>...</template>
    </leaf-element>

    <!-- 4. No script -->
    <leaf-element name="tag-name" constructor="TagName" noscript>
      <template>
        <!-- shadow DOM here -->
      </template>
    </leaf-element>

#### Producing Light DOM instead of Shadow DOM {#createlightdom}



#### Imperative registration {#imperativeregister}

Elements can be registered in pure JavaScript like so:

    <script>
      Leaf('name-tag', {nameColor: 'red'});
      var el = document.createElement('div');
      el.innerHTML = '\
        <leaf-element name="name-tag" attributes="name">\
          <template>\
            Hello <span style="color:{%raw%}{{nameColor}}{%endraw%}">{%raw%}{{name}}{%endraw%}</span>\
          </template>\
        </leaf-element>';
      // The custom elements polyfill can't see the <leaf-element>
      // unless you put it in the DOM.
      document.body.appendChild(el);
    </script>

    <name-tag name="John"></name-tag>

Note that you need to add the `<leaf-element>` to the document so that the
Custom Elements polyfill picks it up.

### Adding public properties and methods {#propertiesmethods}

If you wish to define methods/properties on your element (optional), pass an object
as the second argument to `Leaf()`. This object is used to define
the element's `prototype`.

The following example defines a property `message`, a computed property `greeting`
using an ES5 getter, and a method `foo`:

    <leaf-element name="tag-name">
      <template>...</template>
      <script>
        Leaf('tag-name', {
          message: "Hello!",
          get greeting() {
            return this.message + ' there!';
          },
          foo: function() {...}
        });
      </script>
    </leaf-element>

**Note:** `this` references the custom element itself inside a Leaf element. For example, `this.localName == 'tag-name'`.
{: .alert .alert-info }

**Important:** Be careful when initializing properties that are objects or arrays. Due to the nature of `prototype`, you may run into unexpected "shared state" across instances of the same element. If you're initializing an array or object, do it in `ready()` rather than directly on the `prototype`.

Do this:

    Leaf('x-foo', {
      ready: function() {
        this.list = [];
        this.person = {};
      }
    });

instead of this:

    Leaf('x-foo', {
      list: [],
      person: {}
    });

### Adding private or static variables {#static}

If you need private state within an element, wrap your script using standard
techniques like anonymous self-calling functions:

    <leaf-element name="tag-name">
      <template>...</template>
      <script>
        (function() {
          // Ran once. Private and static to the element.
          var foo_ = new Foo();

          // Ran for every instance of the element that's created.
          Leaf('tag-name', {
            get foo() { return foo_; }
          });
        })();
      </script>
    </leaf-element>

### Element lifecycle methods {#lifecyclemethods}

Leaf has first class support for the Custom Element lifecycle
callbacks, though for convenience, implements them with shorter names.

All of the lifecycle callbacks are optional:

    Leaf('tag-name', {
      created: function() { ... },
      ready: function() { ... },
      attached: function () { ... },
      detached: function() { ... },
      attributeChanged: function(attrName, oldVal, newVal) {
        //var newVal = this.getAttribute(attrName);
        console.log(attrName, 'old: ' + oldVal, 'new:', newVal);
      },
    });

Below is a table of the lifecycle methods according to the Custom Elements
[specification](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/custom/index.html#custom-element-lifecycle) vs. the names Leaf uses.

Spec | Leaf | Called when
|-
createdCallback | created | an instance of the element is created
- | ready | The `<leaf-element>` has been fully prepared (e.g. Shadow DOM created, property observers setup, event listeners attached, etc.)
attachedCallback | attached | an instance was inserted into the document
detachedCallback | detached | an instance was removed from the document
attributeChangedCallback | attributeChanged | an attribute was added, removed, or updated
{: .table }

### The WebComponentsReady event {#WebComponentsReady}

The polyfills parse element definitions and handle their upgrade _asynchronously_.
If you prematurely fetch the element from the DOM before it has a chance to upgrade,
you'll be working with an `HTMLUnknownElement`. In these situations, wait for the `WebComponentsReady` event
before interacting with the element:

    <head>
      <link rel="import" href="path/to/x-foo.html">
    </head>
    <body>
      <x-foo></x-foo>
      <script>
        window.addEventListener('WebComponentsReady', function(e) {
          var xFoo = document.querySelector('x-foo');
          xFoo.barProperty = 'baz';
        });
      </script>
    </body>

## Features {#features}

### Published properties

When you _publish_ a property name, you're making that property two-way data-bound and part
of the element's "public API". Published properties can be initialized by an HTML attribute
of the same name.

There are two ways to publish properties:

1. **Preferred** - Include its name in the `<leaf-element>`'s `attributes` attribute.
2. Include the name in a `publish` object on your prototype.

As an example, here's an element that publishes three public properties, `foo`, `bar`, and `baz`, using the `attributes` attribute:

    <leaf-element name="x-foo" attributes="foo bar baz">
      <script>
        Leaf('x-foo');
      </script>
    </leaf-element>

And here's one using the `publish` object:

    <leaf-element name="x-foo">
      <script>
        Leaf('x-foo', {
          publish: {
            foo: 'I am foo!',
            bar: 'Hello, from bar',
            baz: 'Baz up in here'
          }
        });
      </script>
    </leaf-element>

Let's look at the difference between the two and when you might prefer one option over the other.

#### Default property values

By default, properties defined in `attributes` are `null`:

    <leaf-element name="x-foo" attributes="foo">
      <script>
        Leaf('x-foo'); // x-foo has a foo property with null value.
      </script>
    </leaf-element>

As such, you can provide default values using a combination of the `attributes` attribute and the `prototype`:

    <leaf-element name="x-foo" attributes="bar">
      <script>
        Leaf('x-foo', { // x-foo has a bar property with default value false.
          bar: false
        });
      </script>
    </leaf-element>

Or you can define the whole thing using the `publish` property:

    <leaf-element name="x-foo">
      <script>
        Leaf('x-foo', {
          publish: {
            bar: false
          }
        });
      </script>
    </leaf-element>

Generally it's preferable to use the `attributes` attribute because it's the declarative approach and you can easily see all of the exposed properties at the top of the element.

You should opt for the `publish` property when either of the following is true:

1. Your element has many properties and placing them all on one line feels unwieldy.
2. You want to define default values for you properties and prefer the DRYness of doing it all in one place.

#### Configuring an element via attributes

Attributes are a great way for users of your element to configure it, declaratively.
They can customize a published property by passing an initial value on the attribute
with the same name:

    <x-foo name="Bob"></x-foo>

##### Hinting an attribute's type {#attrhinting}

When attribute values are converted to property values, Leaf attempts to convert the value to the correct type, depending on the default value of the property.

    <leaf-element name="x-foo" attributes="foo">
      <script>
        Leaf('x-foo', {
          foo: false // hint that foo is Boolean
        });
      </script>
    </leaf-element>

##### Property reflection to attributes {#attrreflection}

Property values are reflected back into their attribute counterpart. For example, setting `this.name = "Joe"` or calling `this.setAttribute('name', 'Joe')` from within the element updates the markup accordingly:

    <x-foo name="Joe"></x-foo>

### Data binding and custom attributes

Published properties are data-bound inside of Leaf elements and accessible
via `{%raw%}{{}}{%endraw%}`. These bindings are by reference and are two-way.

For example, we can define a `name-tag` element that publishes two properties,
`name` and `nameColor`.

    <leaf-element name="name-tag" attributes="name nameColor">
      <template>
        Hello! My name is <span style="color:{{"{{nameColor"}}}}">{{"{{name"}}}}</span>
      </template>
      <script>
        Leaf('name-tag', {
          nameColor: "orange"
        });
      </script>
    </leaf-element>

In this example, `name` has initial value of `null` and `nameColor` has a value of "orange".
Thus, the `<span>`'s color will be orange.

#### Binding objects to attribute values

**Important:** Be careful when your properties are objects or arrays. Element registration
is evaluated once. This means only one instance of an object used in property initialization is ever created. Because of the nature of `prototype`, you may run into unexpected "shared state" across different instances of the same element if you're setting an initial value for a property which is an object or array. Do this type of initialization in `ready()` rather than directly on the `prototype`.
{: .alert .alert-error }

Generally, attributes are string values, but Leaf makes it possible to bind references between elements using attributes. The binding engine interprets reference bindings
by interrogating the [attribute's type](#hinting-an-attributes-type). This means you
can bind an an object to an HTML attribute!

Let's modify the `name-tag` example to take an object instead of individual properties.

    <leaf-element name="name-tag" attributes="person">
      <template>
        Hello! My name is <span style="color:{{"{{person.nameColor"}}}}">{{"{{person.name"}}}}</span>
      </template>
      <script>
        Leaf('name-tag', {
          ready: function() {
            this.person = {
              name: "Scott",
              nameColor: "orange"
            }
          }
        });
      </script>
    </leaf-element>

Now, imagine we make a new component called `<visitor-creds>` that uses `name-tag`:

    <leaf-element name="visitor-creds">
      <template>
        <name-tag person="{{"{{person"}}}}"></name-tag>
      </template>
      <script>
        Leaf('visitor-creds', {
          ready: function() {
            this.person = {
              name: "Scott2",
              nameColor: "red"
            }
          }
        });
      </script>
    </leaf-element>

When an instance of `<visitor-creds>` is created, its `person` property (an object)
is also bound to `<name-tag>`'s `person` property. Now both components are using
the same `person` object.

### Observing properties {#observeprops}

#### Changed watchers {#change-watchers}

The simplest way to observe property changes on your element is to use a changed watcher.
All properties on Leaf elements can be watched for changes by implementing a <code><em>propertyName</em>Changed</code> handler. When the value of a watched property changes, the appropriate change handler is automatically invoked.

    <leaf-element name="g-cool" attributes="better best">
      <script>
        Leaf('g-cool', {
          plain: '',
          best: '',
          betterChanged: function(oldValue, newValue) {
            ...
          },
          bestChanged: function(oldValue, newValue) {
            ...
          }
        });
      </script>
    </leaf-element>

In this example, there are two watched properties, `better` and `best`. The `betterChanged` and `bestChanged` function will be called whenever `better` or `best` are modified, respectively.

#### Custom property observers - `observe` blocks {#observeblock}

Sometimes a [changed watcher](#change-watchers) is not enough. For more control over
property observation, Leaf provides `observe` blocks.

An `observe` block defines a custom property/observer mapping for one or more properties.
It can be used to watch for changes to nested objects or share the same callback
for several properties.

**Example:** - share a single observer

    Leaf('x-element', {
      foo: '',
      bar: '',
      observe: {
        foo: 'validate',
        bar: 'validate'
      },
      ready: function() {
        this.foo = 'bar';
        this.bar = 'foo';
      },
      validate: function(oldValue, newValue) {
        ...
      },
    });

In the example, `validate()` is called whenever `foo` or `bar` changes.

**Example:** - watching for changes to a nested object path

    Leaf('x-element', {
      observe: {
        'a.b.c': 'validateSubPath'
      },
      ready: function() {
        this.a = {
          b: {
            c: 'exists'
          }
        };
      },
      validateSubPath: function(oldValue, newValue) {
        var value = Path.get('a.b.c').getValueFrom(this);
        // oldValue == undefined
        // newValue == value == this.a.b.c === 'exists'
      }
    });

It's important to note that **Leaf does not call the <code><em>propertyName</em>Changed</code> callback for properties included in an `observe` block**. Instead, the defined observer gets called.

    Leaf('x-element', {
      bar: '',
      observe: {
        bar: 'validate'
      },
      barChanged: function(oldValue, newValue) {
        console.log("I'm not called");
      },
      validate: function(oldValue, newValue) {
        console.log("I'm called instead");
      }
    });

### Automatic node finding

Another useful feature of Leaf is node reference marshalling. Every node in a component's shadow DOM that is tagged with an `id` attribute is automatically referenced in the component's `this.$` hash.

For example, the following defines a component whose template contains an `<input>` element whose `id` attribute is `nameInput`. The component can refer to that element with the expression `this.$.nameInput`.

    <leaf-element name="x-form">
      <template>
        <input type="text" id="nameInput">
      </template>
      <script>
        Leaf('x-form', {
          logNameValue: function() {
            console.log(this.$.nameInput.value);
          }
        });
      </script>
    </leaf-element>

### Firing custom events {#fire}

Leaf core provides a convenient `fire()` method for
sending custom events. Essentially, it's a wrapper around your standard `node.dispatchEvent(new CustomEvent(...))`. In cases where you need to fire an event after microtasks have completed,
use the asynchronous version: `asyncFire()`.

Example:

{% raw %}
    <leaf-element name="ouch-button">
      <template>
        <button >Send hurt</button>
      </template>
      <script>
        Leaf('ouch-button', {
          onClick: function() {
            this.fire('ouch', {msg: 'That hurt!'}); // fire(inType, inDetail, inToNode)
          }
        });
      </script>
    </leaf-element>

    <ouch-button></ouch-button>

    <script>
      document.querySelector('ouch-button').addEventListener('ouch', function(e) {
        console.log(e.type, e.detail.msg); // "ouch" "That hurt!"
      });
    </script>
{% endraw %}

**Tip:** If your element is within another Leaf element, you can
use the special [`on-*`](#declarative-event-mapping) handlers to deal with the event: `<ouch-button on-ouch="{% raw %}{{myMethod}}{% endraw %}"></ouch-button>`
{: .alert .alert-success }

### Extending other elements

A Leaf element can extend another element by using the `extends`
attribute. The parent's properties and methods are inherited by the child element
and data-bound.

    <leaf-element name="leaf-cool">
      <!-- UI-less element -->
      <script>
        Leaf('leaf-cool', {
          praise: 'cool'
        });
      </script>
    </leaf-element>

    <leaf-element name="leaf-cooler" extends="leaf-cool">
      <template>
        {%raw%}{{praise}}{%endraw%} <!-- "cool" -->
      </template>
      <script>
        Leaf('leaf-cooler');
      </script>
    </leaf-element>

#### Overriding a parent's methods

When you override an inherited method, you can call the parent's method with `this.super()`, and optionally pass it a list of arguments (e.g. `this.super([arg1, arg2])`). The reason the paramater is an array is so you can write `this.super(arguments)`.

{% raw %}
    <leaf-element name="leaf-cool">
      <script>
        Leaf('leaf-cool', {
          praise: 'cool',
          makeCoolest: function() {
            this.praise = 'coolest';
          }
        });
      </script>
    </leaf-element>

    <leaf-element name="leaf-cooler" extends="leaf-cool" on-click="{{makeCoolest}}">
      <template>leaf-cooler is {{praise}}</template>
      <script>
        Leaf('leaf-cooler', {
          praise: 'cooler',
          makeCoolest: function() {
            this.super(); // calls leaf-cool's makeCoolest()
          }
        });
      </script>
    </leaf-element>

    <leaf-cooler></leaf-cooler>
{% endraw %}

In this example, when the user clicks on a `<leaf-cooler>` element, its
`makeCoolest()` method is called, which in turn calls the parent's version
using `this.super()`. The `praise` property (inherited from `<leaf-cool>`) is set
to "coolest".
