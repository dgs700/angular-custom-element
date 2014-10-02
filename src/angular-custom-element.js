/* Requires a Custom Element polyfill for all browsers other than Chrome
 Recommended:  https://github.com/WebReflection/document-register-element */
// this will be obsolete with the release of AngularJS 2.0
(function(global){
    'use strict';

    function customElements(){
        // used to keep track of registered elems
        var registeredElements = {};
        this.registeredElements = registeredElements;

        this.register = register;
        function register(name, config){
            // basic checks
            // prevent dups
            if(registeredElements[name]) return this;
            // CEs must have a dash in the name
            if((typeof name !== 'string') || (name.indexOf('-') === -1)) return this;
            name = name.toLowerCase();

            // locate a parent type, default is HTMLElement
            var prototype = (config.parent) ?
                config.parent.prototype :
                config['extends'] ?
                    Object.create(document.createElement(config['extends']).constructor).prototype :
                    HTMLElement.prototype;
            var isa = config['extends'] || null;
            var props = config.properties || {}; // instance
            var members = config.members || {}; // proto
            var tag = {};
            var proto = {};
            var noop = function(){};

            // user defined proto members
            // analogous to Class properties
            for (var member in members) {
                (function (member, members) {
                    var property, getter, setter, value, oldVal, readOnly;
                    var that = this;
                    // common setter tasks go here
                    function memberBP(v, ov, member){
                        // prototype mutation notifier - should rarely be used
                        document.dispatchEvent(new CustomEvent('member:changed', {
                            detail: {
                                propName: member,
                                newValue: v,
                                oldValue: ov || null
                            }
                        }));
                        return v;;
                    }

                    // parse through the proto.members user config obj
                    // function on the custom proto
                    if (typeof members[member] === 'function') {
                        proto[member] = {
                            enumerable: true,
                            value: members[member]
                        };
                        // property on the custom proto
                        // all instantiated CEs will have access - should be used rarely
                        // use-case: theme change
                    } else {
                        property = members[member];
                        readOnly = property.readOnly || false;
                        value = property.value || null;
                        if (typeof property.get === 'function') {
                            getter = function () {
                                value = property.get.call(that, value);
                                return value;
                            }
                        } else {
                            getter = function () {
                                return value;
                            }
                        }
                        if (readOnly) {
                            setter = noop;
                        } else if (typeof property.set === 'function') {
                            setter = function (val) {
                                val = property.set.call(that, val);
                                oldVal = this[member] || null;
                                value = memberBP(val, oldVal, member)
                            };
                        } else {
                            setter = function (val) {
                                oldVal = this[member] || null;
                                value = memberBP(val, oldVal, member)
                            };
                        }
                        proto[member] = {
                            get: getter,
                            set: setter,
                            enumerable: true
                        };
                    }
                })(member, members);
            }

            // add binding fn to elem proto
            // this is an Angular specific hook for to enable detection of custom prop
            // changes, but could be adapted for other data-binding frameworks
            proto.registerCallback = {
                value: function(el, fn){
                    el.onPropChange = fn; // from custom setter
                },
                enumerable: true
            };
            // this is a general purpose notifier for other frameworks consuming
            // a CE defined here
            proto.propChangeNotify = {
                value: function(el, propName, newVal, oldVal, attrName, type){
                    // prop:added? prop:deleted?
                    el.dispatchEvent(new CustomEvent(type, {
                        detail: {
                            propName: propName,
                            newValue: newVal,
                            oldValue: oldVal,
                            attrName: attrName || null
                        }
                    }));
                },
                enumerable: true
            };
            // the original user config for the CE
            proto.definition = {value: config};

            var callbacks = config.callbacks || {};
            var created = callbacks.created || noop;
            var attached = callbacks.attached || noop;
            var detached = callbacks.detached || noop;
            var attributeChanged = callbacks.attributeChanged || noop;
            //var events = ??? TBD
            var attributeMap = {};
            var prop;
            var properties = [];

            // parse through the user config properties obj
            for(prop in props) {
                (function parseProperty(prop, props) {
                    // the functions are invoked during the createdCallback so they are
                    // scoped to the CE instance, i.e. constructor vars
                    properties.push(function (el) {
                        var property, attr, getter, setter, value, oldVal, readOnly, bool;
                        bool = false;
                        value = null;
                        attr = null;
                        property = props[prop];
                        readOnly = property.readOnly || false;

                        // handle prop<-->attr binding
                        if (property.attribute && !readOnly) {
                            bool = (property.attribute.boolean) ? true : false;
                            attr = (property.attribute.name) ? property.attribute.name : prop.toLowerCase();
                            attributeMap[attr] = {
                                name: prop,
                                bool: bool
                            };
                            if(bool){
                                value = (el.hasAttribute(attr)) ?
                                    true :
                                    (property.value) ? true : false;
                            }else{
                                // give priority to an attr value
                                value = (el.hasAttribute(attr)) ?
                                    el.getAttribute(attr) :
                                    (property.value) ?
                                        property.value :
                                        null;
                            }
                            if (!el.hasAttribute(attr)){
                                // make the attr true by setting it to something false
                                if(bool && value) el.setAttribute(attr, '');
                                else if (bool) el.removeAttribute(attr);
                                else el.setAttribute(attr, value);
                            }
                            el.setterCalled[attr] = false;
                        } else {
                            value = (property.value) ? property.value : null;
                        }

                        // construct the property accessor
                        if (typeof property.get === 'function') {
                            // invoke any user supplied getter logic
                            getter = property.get;
                        } else {
                            getter = function () {
                                return value;
                            }
                        }
                        // common setter crap goes here
                        function setterBoiler(val) {
                            el.setterCalled[attr] = true;
                            // this stuff should fail silently
                            try {
                                el.onPropChange(val);
                                if(attr && bool){
                                    (val) ? el.setAttribute(attr, '') : el.removeAttribute(attr);
                                } else if(attr) {
                                    el.setAttribute(attr, val);
                                }
                            } catch (e) {}
                            oldVal = (bool) ? !!el[prop] : el[prop];
                            // code outside the matching directive would use this event
                            el.propChangeNotify(el, prop, val, oldVal, attr, 'prop:changed');
                            return val;
                        }

                        // construct the property mutator
                        // if set fn provided by user, it overrides as far as how the value
                        // is set, otherwise the default is original value
                        if(readOnly){
                            setter = noop;
                        } else if (typeof property.set === 'function') {
                            setter = function (val) {
                                // invoke any setter logic from user
                                val = property.set.call(el, val);
                                value = setterBoiler(val);
                            };
                        } else {
                            setter = function (val) {
                                value = setterBoiler(val);
                            };
                        }
                        Object.defineProperty(el, prop, {
                            get: getter,
                            set: setter,
                            enumerable: true
                        });
                    });
                })(prop, props);
            }
            proto.createdCallback = {
                enumerable: true,
                value: function(){
                    this.setterCalled = {};
                    var that = this; // the element instance
                    // this is essentially the constructor initialization
                    properties.forEach(function(fn){
                        fn.call(that, that);
                    });
                    // invoke any user defined logic
                    var output = created ? created.apply(this, arguments) : null;
                    return output;
                }
            };
            proto.attributeChangedCallback = {
                enumerable: true,
                value: function(attr, oldVal, newVal){
                    // if attr maps to a prop, update the prop
                    // hack to prevent stack overflow, proceesor overheat, case melting
                    // loss of reproductive ability
                    if((attributeMap[attr]) && (!this.setterCalled[attr])){
                        var prop = attributeMap[attr];
                        if (prop.bool && (newVal === '')) newVal = true;
                        this[prop.name] = (prop.bool) ? !!newVal : newVal;
                    }
                    this.setterCalled[attr] = false;
                    var output = attributeChanged ? attributeChanged.apply(this, arguments) : null;
                    return output;
                }
            };
            proto.attachedCallback = {
                enumerable: true,
                value: function(){
                    var output = attached ? attached.apply(this, arguments) : null;
                    return output;
                }
            };
            proto.detachedCallback = {
                enumerable: true,
                value: function(){
                    var output = detached ? detached.apply(this, arguments) : null;
                    return output;
                }
            };

            // and we're off to the races
            tag.prototype = proto;
            var definition = {
                'prototype': Object.create(prototype, tag.prototype)
            };
            // this sets all of the parent element instance props on the CE
            // a custom-name cannot be used for CEs with this option set, so
            // one option is to wrap an <elem is="cust-elem"... in a proxy CE with this as the
            // template - better declarativeness in the markup
            if(isa) definition['extends'] = isa;

            // add the newly registered element to the tracking hash
            registeredElements[name] = document.registerElement( name, definition);
            return this;
        }

        this.$get = $get;
        $get.$inject = ['$window'];
        function $get($window){
            return {
                // return the original element definition
                info: function($el){
                    return $el[0].__proto__.definition;
                },
                // handles the boilerplate of triggering
                // $digest() on external elem prop changes
                $watchElement: function(scope, el){
                    scope.el = el[0];
                    scope.el.registerCallback(scope.el, function(val){
                        setTimeout(function(){
                            scope.$digest();
                        }, 0);
                    });
                },
                // provide limited ability to watch/bind attr/prop changes
                // in foreign web components, values limited to primatives
                // props must be an array of attributeName strings
                // since only attr changes are detected, props must be linked to
                // an attr so TODO - would be to generate an attr for any unlinked props
                // hopefully it will become a best-practice for all CEs to fire events or
                // provide callback hooks in property setters fns
                $importElement: function(scope, el, props){
                    // expects an array of prop names that are bound to attrs
                    if(!Array.isArray(props)) return false;
                    props.forEach(function(val, idx, arr){
                        arr[idx] = arr[idx].toLowerCase();
                    });
                    var observer = new MutationObserver(function(mutations){
                        mutations.forEach(function(mutation){
                            if(props.indexOf(mutation.attributeName) !== -1) scope.$digest();
                        });
                    }).observe(el[0], {
                            attributes: true,
                            childList: true,
                            characterData: true,
                            attributeOldValue: true
                            //attributeFilter: [attr]
                        });
                    return observer;
                }
            };
        }
    }
    angular.module('customElements', ['ng']).provider('$customElements', customElements);
})(window);