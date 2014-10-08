## AngularJS Web Components - Custom Element 

**Upgrade your AngularJS 1.x.x component directives to Web Components (W3C) Custom Elements!**

Why wait for AngularJS 2.0 to start writing Angular code for the **W3C Web Components** specifications? With just a tiny, 2kb, Custom Element polyfill plus this provider you can define, export, import, and use **Custom Elements** within your AngularJS 1.x.x app or component now.  Your AngularJS element directives can now be real, bonafide Custom Element directives.  The element properties are seemlesly bound to your directive $scope, so changes from outside Angular will be immediately reflected internally.  

Table of Contents

- [API Documentation](#api-documentation)
    - [Getting and Installing](#getting-and-installing)
    - [Injecting AngularCustomElement into your app](#injecting-angularcustomelement-into-your-app)
    - [Defining Custom Elements](#defining-custom-elements)
    - [Options for the Custom Element config object](#options-for-the-custom-element-config-object)
    - [Enabling Custom Element binding in the directive](#enabling-custom-element-binding-in-the-directive)
    - [Directive Definition Guidelines](#directive-definition-guidelines)
    - [Template bindings](#template-bindings)
- [FAQs and Opinions](#faqs-and-opinions)
    - [What?](#what?)
    - [](#)
    - [](#)
    - [](#)
    - [](#)
    - [](#)
    - [](#)
    - [](#)
- [Get Involved](#get-involved)



## API Documentation

* Also see the code in the usage examples directory for inline docs.  It's written so the documentation is self-explanitory and you can cut and paste the code into your app to get started.

#### Getting and Installing

You just need to load `angular-custom-element.min.js` after Angular.js and before your app or component modules. The file is available via:

* Bower: `$> bower install angular-custom-element`
* fork or clone this repo
* just copy [angular-custom-element.min.js from here](https://raw.githubusercontent.com/dgs700/angular-custom-element/master/dist/angular-custom-element.min.js)

#### Injecting AngularCustomElement into your app

1) Include your element directive and Custom Element provider as dependencies.
````javascript
var app = angular.module('MyApp',['myComponents.elementDirectives', 'customElements']);
````

#### Defining Custom Elements

2) Inject $customElementsProvider into a config block.
````javascript
app.config(['$customElementsProvider', function ($customElementsProvider) {
````

**The `.register()` method:**


3) Call the .register() function with a tag name (including namespace plus dash plus name)
and the custom element config object (very similar to X-Tag config). You will also need
to define matching element directives, i.e. "tagName1"...
````javascript
$customElementsProvider.register('tag-name1', { elemConfigObj1 })
    .register('tag-name2', { elemConfigObj2 })
    .register('tag-name3', { elemConfigObj3 });    
````

#### Options for the Custom Element config object

The format and options are similar to X-Tags, but there are some differences. Also keep in mind
that the context of any code placed in the element config object executes *outside of* AngularJS, so 
it should be VanillaJS and framework agnostic.

**parent: element prototype** (optional) is the element prototype we wish to inherit from. 
It defaults to HTMLElement. You may inherit from standard HTML elements or other custom elements.
````javascript
parent: HTMLButtonElement,
````

**extends: tag name** (optional) will include all of the parent's properties, but
the `<tagname is="custom-element">` tag syntax must appear in the DOM.
In this situation a matching element directive will not work.  The yet-to-be-coded
work around will likely be a matching tag name directive that wraps the real element,
Or you can just use the real tag in the template along with the directive replace:true option for now.
Either way, we want the HTML monkeys to be able to use `<custom-element>` syntax for 
declarativeness and simplicity.
````javascript
extends: 'button',
````

The **properties** object contains definitions for the element's instance (or constructor)
properties. 
````javascript
properties: {
````

The object key (propertyNameOne) becomes a property name on the element
````javascript
    propertyNameOne: {
````

Include a **get** function (optional) if any calculations or adjustments to the value are needed
The syntax is the same as an ES5 Object property getter.
````javascript
        get: function(){
            // do any value calculations
            return valueVar;
        },
````
Include a **set** function (optional) if any value adjustments are needed, or other actions
that need to happen upon a change. Unlike the ES5 syntax, this function *must return the property value*.
````javascript
        set: function(val){
            // do any value calculations
            val = val + 'X';
            return val;
        },
````        

The `value: intialValue` (optional) option may be used to set the default or initial
value of a property.

NOTE: a) This may be used along with a get and/or set function option which differs from
actual ES5 property definitions where that is not allowed

NOTE: b) Any initial value provided by a matching attribute will take priority.
````javascript
        value: 'I am a new property',
````

Include an **attribute object** (optional) with an attribute **name** (optional) to bind the property
value to an attribute value. Using `attribute: {}` will default to the property name lowercased.
If the initial markup includes an attribute value, it will be auto assigned to the
property value, so you can initialize custom element props with attribute string values.

Include **boolean: true** (defaults to false) in order to have the attribute behave as a
boolean such as "checked" or "selected". **Note** that the behavior is not the same as the actual *value*.
To set a boolean property/attribute's initial value to true, you must also include 
`value: true` as well.

Note: DO NOT serialize large data objects into attribute strings in order to set the 
initial value, use some kind of pointer to another property or data store instead.
````javascript        
        attribute: {
            name: 'property-one',
            boolean: true  // default is false
        }
    },
````

**readOnly** set to **true** creates a read only property (defaults to false). You must also 
include an initial **value** option and no matching attribute (it is ignored).
````javascript        
        readOnly: true
    }
},
````

The **callbacks** object follows the W3C Custom Elements spec except that the names are 
shortened similar to X-Tags and Polymer configs.  This object and any callback functions are
optional. The callbacks execute in the context of the element instance so `this` may be used to 
reference the element instance and its properties.

**Best Practice:** To ensure that your components are portable, shareable, and reusable, the component 
(element) should have NO knowledge of anything outside its boundaries. This means you should not have any
direct references to any application or global vars in your callbacks.  Any initialization values 
should be *injected* into the element. Use attributes for primatives and pointers to anything else, or have a
"container" component or application inject any necessary instantiation data or logic. 
````javascript
callbacks: {
````

The **created** callback is called upon custom element instantiation which is effectively the element
constructor function (for the custom parts). This happens when the browser finds a tag on load parse, 
or elemement is created programatically including from a template.  Any special initialization tasks that 
you would typically have in a "constructor function" would go here.
````javascript    
    created: function(){
        // include any special logic
        // console.log('created')
    },
````

The **attached** callback is called when the element is inserted into the DOM. Any tasks that 
require the DOM to be in place would go here.
````javascript    
    attached: function(){
        //console.log('I am now in the DOM')
    },
````

The **detached** callback is called when the element is removed from the DOM. Any cleanup such as
destruction of event bindings would go here.
````javascript    
    detached: function (){
        // include any cleanup logic
        //console.log('detached')
    },
````

The **attributeChanged** callback is called upon any attribute change including any set programatically
during element instantiation (but not if the elem already exists in markup).
````javascript    
    attributeChanged: function(attrName, oldVal, newVal){
        //console.log('attributeChanged', attrName, oldVal, newVal)
    }
},
````

The **members** object contains any Custom Element Prototype Methods and Properties.  These would be
akin to class members in which every element instance has access to the same function or value.
````javascript
members: {
````

Typically any component logic would be placed in functions here. There are no ES5 object options. Just include a name and function.
````javascript    
    elementMethodName: function(args){
        // logic available to any element instance of this type
        // by calling elem.elementProtoMethod(args)
        // All of your custom element 
    },
````

Prototype properties - in the RARE case where a property needs to be accessable by ALL element instances of
this type, define it here. Any data binding to directive $scope requires an explicit event
listener attached to the document (see below).
One example use case might be a re-themeing of all elements during a page app lifecycle.
The attribute option is not available for these. All other options are the same as in the
properties object.
````javascript    
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


#### Enabling Custom Element binding in the directive

**Inject the Custom Element service into the directive**
````javascript
angular.module( 'myComponents.tagName1', ['customElements'] )
    .directive( 'tagName1', [
        '$customElements', function($customElements){ ...
````

**Call $watchElement( scope, element )** in your directive link or controller function:

This is the only line of code that is required.
It takes care of binding all custom properties
to the directive's $scope including triggering a $digest() when
any custom property is changed from outside of Angular. Two or more 
frameworks can share the same custom elements and no boilerplate!

After this line you can enjoy the full power of AngularJS' framework tools
when interacting with your Custom Element. You can have normal bindings
in your templates and controllers: `$scope.el.propertyName` or `{{el.propertyName}}`.
````javascript
$customElements.$watchElement( $scope, $element );
````


**Custom Element instance and prototype property change events:**

You can bind to a property change event on the element.
Since all prop changes generate a change event
other frameworks in the page can import and interact with
the same component.
````javascript
$element.on( 'prop:changed', function(evt){
    $log.log(evt.detail);
    $scope.$emit(evt.detail);
    // do stuff
});
````

You can bind to a Custom Elemement prototype property change event if needed
for something that affects all elem intances such as a theme change.

NOTE: that these bindings must be specifically destroyed on
the $destroy event for the directive to avoid memory leaks 
````javascript
$document.on( 'member:changed', function(evt){
    if(evt.detail.propName == 'a prototype prop we need to watch'){
        // do stuff
        $log.log(evt.detail);
        $scope.$emit(evt.detail);
    }
});
````

**Utility functions** 

The **.info( $element )** function returns the original custom element config
object for debugging purposes.
````javascript
var info = $customElements.info($element);
````

**Attempt to bind to a foreign Custom Element** i.e. something generated by X-Tags or Polymer.
Binding is currently limited to attribute values unless the element
broadcasts property change events like those above. 

The $scope and $element params are required. If you know that the custom element dispatches
an event and its name (`evtName` below) upon property changes then complete binding can be achieved.
Otherwise attribute names are the fallback. *This function is even more experimental than the rest
of this module ;-)
````javascript
$customElements.$importElement($scope, $element, [array of attr names], evtName);
````
Note that if you control the element configuration source code for X-Tags, or even
Polymer elements, then complete integration with matching AngularJS directives is possible with 
about 10 extra lines of code. (examples coming soon).


#### Directive Definition Guidelines

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
would be Custom Elements that extend existing tags and therefore must use the tag name of the
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

To learn more about building component directives with AngularJS plus component best practices, check out my 
book: [Web Component Architecture and Development with AngularJS](https://leanpub.com/web-component-development-with-angularjs). It is free to download or read online while it is still being completed.


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

## FAQs and Opinions

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


## Get Involved

If you like the ideas behind this module, PLEASE help by forking, using, identifying bugs and
functionality that is either missing or could be improved, testing, contributing code for tests,
bug fixes, and feature improvements. 


