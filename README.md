## AngularJS Web Components - Custom Element 

Why wait for AngularJS 2.0 to start writing Angular code for the **W3C Web Components** specifications? With just a tiny, 2kb, Custom Element polyfill plus this provider you can define, export, import, and use **Custom Elements** within your AngularJS 1.x.x app or component now.  Your AngularJS element directives can now be real, bonafide Custom Element directives.  The element properties are seemlesly bound to your directive $scope, so changes from outside Angular will be immediately reflected internally.  

#### What?

**AngularJS Custom Element** is an **Angular provider** that allows you to define and register W3C spec custom elements in an application config block.  It is also an **Angular service** meant to be injected into your matching element directive that auto binds the element's custom properties, and attributes to directive scope.  You can access these properties via `$scope.el.propertyName`, or just `el.propertyName` in your template bindings.

There is a lot of code boilerplate involved in Custom Element definitions, and even more when it comes time to integrate the element with AngularJS's data-binding.  One of the goals of this provider is to reduce that down to just a little bit of configuration and convention, and keep everything as simple, minimalist, performant, and compatible as possible- just like the rest of AngularJS.

Because of this, all of the other Web Components APIs are beyond this provider's scope because they cannot be shimmed in a way that is acceptible with widescale production development.  Unfortunately this includes all the lovely style encapsulation we'll get with Shadow DOM.

#### Where?

**All modern browsers** including IE 9+, and any existing or yet to be coded Angular element directives.

#### Why?

Because Custom Element APIs, which are essentially HTML element attributes, properties, methods and events, are becoming the common interface through which web components, applications, toolkits and even different frameworks interact.  Reusable UI components will no longer be restricted to the scope of a particular framework, and components will inherit logic and data directly from other components or elements.  By moving component specific data and logic out of the controller and onto the element, code shelf-life will become much longer.

Unlike the other Web Component polyfills such as Shadow DOM, the Custom Element registration polyfill is very small, simple and reasonably performant/stable meaning the risk of use in large scale, production web applications now is very low.  One of the goals of this small add-on is to build upon the polyfill in a manner that can be used to enhance any Angular element directive.  Additional goals and opinions of ths module are:

* provide a simple element config API, very similar to X-Tags
* provide an even simpler service API (just one line of code in your directive controller)
* work across all modern browsers (IE9+)
* be suitable for production grade, consumer facing code (unlike Polymer)
* be performant and small (5-6kb)
* export Custom Elements that can be shared, consumed, and bound by other data-binding frameworks
* provide support for importing and binding to Custom Elements from other sources 
* do one thing, and do it well 
* help component developers write longer lasting code
* help developers to start getting a feel for the web development APIs of the near future
* attempt to reflect, where possible, the decisions about how component directives will function in the AngularJS 2.0 design docs
* be a **community** project

#### How?

As long as a browser has DOM mutation observer capability, the Custom Element API can be easily shimmed. The one exception is the new css pseudo **:unresolved**, but FOUC can be easily prevented in other ways. Chrome already supports the API natively, and Mozilla will shortly.

The other task is triggering a $digest cycle for element properties that are mutated from outside Angular. Neither Object.observe or DOM Mutation Observers work with element properties due to certain, potential performance reasons.  However, because we can define element properties using ES5 Object property setters and getters, we can invoke callback functions that include an injected $scope.$digest() and trigger custom change events whenever the property setter is called during a mutation.  Any data-binding framework, not just Angular, can use these hooks and events to bind to the Custom Element.

#### Who?

Myself and anyone who wants to help with testing across browsers and suggestion and/or code to help improve.  There are so many DOM peculiarities and weird use-case situations that it is impossible for one person to conceive of comprehensive test coverage or anticipate every edge-case bug. 


### APIs docs and examples coming soon...

See the code in the examples directory for inline docs




