## AngularJS Web Components - Custom Element 

**Upgrade your AngularJS 1.x.x component directives to Web Components (W3C) Custom Elements!**

Why wait for AngularJS 2.0 to start writing Angular code for the **W3C Web Components** specifications? With just a tiny, 2kb, Custom Element polyfill plus this provider you can define, export, import, and use **Custom Elements** within your AngularJS 1.x.x app or component now.  Your AngularJS element directives can now be real, bonafide Custom Element directives.  The element properties are seemlesly bound to your directive $scope, so changes from outside Angular will be immediately reflected internally.  

Skip to the [API Documentation](#api-documentation)

#### What?

**AngularJS Custom Element** is an **Angular provider** that allows you to define and register W3C spec custom elements in an application config block.  It is also an **Angular service** meant to be injected into your matching element directive that auto binds the element's custom properties, and attributes to directive scope.  You can access these properties via `$scope.el.propertyName`, or just `el.propertyName` in your template bindings.

There is a lot of code boilerplate involved in Custom Element definitions, and even more when it comes time to integrate the element with AngularJS's data-binding.  One of the goals of this provider is to reduce that down to just a little bit of configuration and convention, and keep everything as simple, minimalist, performant, and compatible as possible- just like the rest of AngularJS.

This module is focused exclusively on Custom Elements because their APIs are the integration point for AngularJS and any other app framework.  Other Web Components APIs, including Shadow DOM, HTML Imports, and Template tags are beyond this scope because their usage is essentially independent of any framework internals and/or the polyfills aren't suitable for current use in widescale production code for one reason or another.

Instead of 2-way data-binding, you can now have **3-way data-binding**.

#### Where?

**All modern browsers** including IE 9+, and any existing or yet to be coded Angular element directives.

#### When?

From now until AngularJS 2.0 is in widescale production. AngularJS 2.0 Component Directives will replace this functionality.  It seems this lib was already deprecated before it was released :-0

#### Why?

Because Custom Element APIs, which are essentially HTML element attributes, properties, methods and events, are becoming the common interface through which web components, applications, toolkits and even different frameworks interact.  Reusable UI components will no longer be restricted to the scope of a particular framework, and components will inherit logic and data directly from other components or elements.  By moving component specific data and logic out of the controller and onto the element, code shelf-life will become much longer.

Unlike the other Web Component polyfills such as Shadow DOM, the Custom Element registration polyfill is very small, simple and reasonably performant/stable meaning the risk of use in large scale, production web applications now is very low.  One of the goals of this small add-on is to build upon the polyfill in a manner that can be used to enhance any Angular element directive.  Additional goals and opinions of ths module are:

* provide a **simple element config API**, very similar to X-Tags
* provide an even **simpler service API** (just one line of code in your directive link or controller fn)
* work across **all modern browsers** (IE9+)
* be suitable for production grade, consumer facing code (unlike Polymer)
* be **performant and small** (9kb including polyfill dependency)
* **export Custom Elements** that can be shared, consumed, and bound by other data-binding frameworks
* provide **support for importing** and binding to Custom Elements from other sources 
* do one thing, and do it well 
* help component developers write **longer lasting code**
* help developers to start getting a feel for the **web development APIs of the near future**
* attempt to reflect, where possible, the decisions about how component directives will function in the AngularJS 2.0 design docs
* be a **community** driven project

#### How?

As long as a browser has DOM mutation observer capability, the Custom Element API can be easily shimmed. The one exception is the new css pseudo **:unresolved**, but FOUC can be easily prevented in other ways. Chrome already supports the API natively, and Mozilla will shortly.

The other task is triggering a $digest cycle for element properties that are mutated from outside Angular. Neither Object.observe or DOM Mutation Observers work with element properties due to certain, potential performance reasons.  However, because we can define element properties using ES5 Object property setters and getters, we can invoke callback functions that include an injected $scope.$digest() and trigger custom change events whenever the property setter is called during a mutation.  Any data-binding framework, not just Angular, can use these hooks and events to bind to the Custom Element.

#### Who?

Myself and anyone who wants to help with testing across browsers and suggestion and/or code to help improve.  There are so many DOM peculiarities and weird use-case situations that it is impossible for one person to conceive of comprehensive test coverage or anticipate every edge-case bug. 


## API Documentation

* Also see the code in the usage examples directory for inline docs.  It's written so the documentation is self-explanitory and you can cut and paste the code into your app to get started.

#### Getting the module

You just need to load `angular-custom-element.min.js` after Angular.js and before your app or component modules. The file is available via:

* Bower: `$> bower install angular-custom-element`
* fork or clone this repo
* just copy [angular-custom-element.min.js from here](https://raw.githubusercontent.com/dgs700/angular-custom-element/master/dist/angular-custom-element.min.js)

#### Injecting into your app

````javascript
// 1. include your element directive and Custom Element provider as dependencies
var app = angular.module('MyApp',['myComponents.elementDirectives', 'customElements']);
````

#### Defining Custom Elements in an Angular module config block

````javascript
// 2. inject $customElementsProvider into a config block
app.config(['$customElementsProvider', function ($customElementsProvider) {
````

**The `.register()` method:**
````javascript
// 3. call the .register() function with a tag name (including namespace plus dash plus name)
// and the custom element config object (very similar to X-Tag config). Your directive names must match.
$customElementsProvider.register('elem-name1', { configObject1 })
    .register('elem-name2', { configObject2 })
    .register('elem-name3', { configObject3 });    
````

**The config object options (similar to X-Tags, but not the same):**
````javascript
// parent: <elem prototype> (optional) - is the element prototype we wish to inherit from
// it defaults to HTMLElement
parent: HTMLButtonElement,

// extends: <tag name> (optional) - will include all of the parent's properties, but
// the <button is="smart-button"> tag syntax must appear in the DOM
// In this situation a matching element directive will not work.  The yet-to-be-coded
// work around will likely be a matching tag name directive that wraps the real element,
// or just use the real tag in the template along with the directive replace:true option for now.
// Either way, we want the HTML monkeys to be able to use <smart-button> syntax.
extends: 'button',

// The properties object contains definitions for the element's instance (or constructor)
// properties
properties: {
    // the object key (propertyNameOne) becomes the property name on the element
    propertyNameOne: {

        // include a "get" function (optional) if any adjustments to the value are needed
        // the syntax is the same as an ES5 Object property getter
        get: function(){
            // do any value calculations
            return valueVar;
        },

        // include a "set" function (optional) if any value adjustments are needed
        // unlike the ES5 syntax, this function must return the property value
        set: function(val){
            // do any value calculations
            val = val + 'X';
            return val;
        },

        // include an attribute (optional) with attr name (optional) to bind the property
        // value to an attribute value.
        // using attribute:{} will default to the property name lowercased
        // If the initial markup includes an attribute value, it will be auto assigned to the
        // property value. So you can initialize custom element props with attr string values
        // note: number and boolean value conversion is not yet set up, and DO NOT serialize
        // data objects into attribute strings, use some kind of pointer instead.
        attribute: {
            name: 'property-one'
        }
    },
    antoherPropertyName: {
        // will match or create an attr named anotherpropertyname="..."
        // UNLESS the "readOnly:true" option is included (see below)
        attribute: {},

        // the value:intialValue (optional) option may be used to set the default or initial
        // value of the property
        // NOTE: a) this may be used along with a get and/or set function option which differs from
        // actual ES5 property definitions where that is not allowed
        // NOTE: b) any initial value provided by a matching attribute will take priority
        value: 'hello',

        // creates a read only property (defaults to false). must include the initial value option, and no
        // matching attribute (or it is ignored)
        readOnly: true
    },
    aBooleanProperty: {
        attribute: {
            name: 'bool-prop',
            // note that "true" here just signifies that the attr should
            // treated as a boolean,
            boolean: true // default is false
        },
        value: true // default is false
    }
},
// In all callbacks "this" referes to the element instance
// since that is the context where these are invoked
callbacks: {

    // is called upon custom element instantiation which is effectively the element
    // constructor function (for the custom parts)
    // This happens when the browser finds a tag on load parse, or elemement is
    // created programatically including from a template
    created: function(){
        // include any special logic
        // console.log('created')
    },

    // is called when the element is inserted into the DOM
    attached: function(){
        //console.log('attached')
    },

    // is called when the element is removed from the DOM
    detached: function (){
        // include any cleanup logic
        //console.log('detached')
    },

    // called upon any attribute change including attr set programatically
    // during element instantiation (but not if the elem already exists in markup)
    attributeChanged: function(attr, oldVal, newVal){
        //console.log('attributeChanged', attr, oldVal, newVal)
    }
},

// Element Prototype Methods and Properties
members: {

    // no options, just include a name and function
    elementMethodName: function(args){
        // logic available to any element instance of this type
        // by calling elem.elementProtoMethod(args)
        // All of your custom element 
    },

    // in the RARE case where a property needs to be accessable by ALL element instances of
    // this type, define it here. Any data binding to directive $scope requires an explicit event
    // listener attached to the document.
    // One example use case might be a re-themeing of all elements during a page app lifecycle.
    // the attribute option is not available for this
    memberPropName: {

        // same as element property
        get: function(val){
            return val;
        },

        // same as element property
        set: function(val){
            val = val + 'X';
            return val;
        },

        // same as element property
        value: "blah blah",

        // same as element property
        // most prototype properties if needed would ideally be readOnly
        readOnly: true
    }
}
````


#### Enabling the Custom Element in your matching element directive

**Inject the service into the directive**
````javascript
// Inject the Custom Element service
angular.module('myComponents.smartButton', ['customElements'])
    // An example of how an AngularJS 1.x "component" directive
    // might be defined including the Angular independent
    // custom element config that is exported to the DOM
    .directive('smartButton', [
        '$customElements', function($customElements){
````

**$watchElement(scope, element)** in your directive controller:
````javascript
// This is the only line of code that is required.
// this command takes care of binding all custom properties
// to the $scope including triggering a $digest() when
// any custom property is changed outside of Angular
// After this line you can enjoy the full power of AngularJS
// when interacting with your Custom Element
$customElements.$watchElement($scope, $element);

// now you can add bindings in your controllers and templates
// `$scope.el.propertyName` or `{{el.propertyName}}`
````

**Custom Element instance and prototype property change events:**
````javascript
// bind to a Custom Elem Prototype prop if needed
// for something that affects all elem intances such as a
// theme change.
// NOTE: that these bindings must be specifically destroyed on
// the $destroy event for the directive to avoid memory leaks 
$document.on('member:changed', function(evt){
    if(evt.detail.propName == 'a protopype prop we need to watch'){
        // i.e. $scope.el.__proto__.memberNameOne
        $log.log(evt.detail);
        $scope.$emit(evt.detail);
        // other stuff
    }
});

// bind to an event on the element
// since all prop changes generate a change event
// other frameworks in the page can import and react
// to the same component
$element.on('prop:changed', function(evt){
    $log.log(evt.detail);
    $scope.$emit(evt.detail);
    // other stuff
});
````

**Miscellaneous:**
````javascript
// gets the original custom elem config obj mostly for any debug
var info = $customElements.info($element);

// bind to a foreign Custom Element i.e. something from X-Tags or Polymer
// binding is currently limited to attribute values unless the element
// broadcasts property change events like those above
$customElements.$importElement($scope, $element, ['array','of','property','names']);
````

#### Directive definition guidelines for paring with Custom Elements:

The plan for AngularJS 2.0 Component Directives (based on the current design docs) is to
simplify the directive definition object.  Component Directives will automatically have:

* An isolate (component) scope, `scope: {}`
* Matching restricted to tag names, `restrict: 'E'`
* Templates appended to the tag (vs replacing the tag), `replace: false`

An isolate scope is a must for the proper encapsulation of a component. Otherwise it loses 
portability, reusability, etc.  Appended templates are necessary since deleting
the custom element tag defeats the entire purpose of using one. It also improves 
declarativeness and allows other frameworks in the page to use the custom element. 

Matching only via element name in AngularJS 1.x.x is recommended in most cases. The gray area
would be Custom Elements that extend existing tags and therefor must use the tag name of the
extended element with an `is="custom-tagname"` attribute, i.e. `<input is="smart-input">`. 

There's no best practice for how to handle this in Angular.  The syntax proposed by the W3C is much less
declarative for "extended" tags.  Hopefully that will change, but for now, one suggested
solution would be to create a skeleton custom element that acts as a wrapper and proxy for
the extended element to the associated directive, and have the extended element as the template
for the wrapper element.

Your directive definition will need a link and/or controller function in which to invoke the service
command that data-binds element properties: `$watchElement(scope, element)`.  For simple, stand-alone
components you should be able to invoke this anywhere.  But if you have a "complex" or "container" component 
element that has bindings and interactions with child components, the safest place to invoke $watchElement 
would be in an actual `postLink: function(scope elem){...}` function block.  postLink is invoked after
the full creation and insertion of all children elements.

#### Template bindings

Binding to custom element properties and functions couldn't be more simple.  After `$watchElement()` is
invoked which attaches **el** for the element instance reference to the $scope object, any custom
property or method can be bound in the template. Note that html5 *standard properties* cannot be data-bound
in your templates, only the the props you define can.  

````html
<!-- bind to an element function and a tag property -->
<a ng-click="el.doSomething(this)">
    {{ el.bttnText }}
</a>
````

### FAQs

### Get Involved

If you like the ideas behind this module, PLEASE help by forking, using, identifying bugs and
functionality that is either missing or could be improved, testing, contributing code for tests,
bug fixes, and feature improvements. 


