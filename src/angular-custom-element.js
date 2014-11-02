/* Requires a Custom Element polyfill for all browsers other than Chrome
 Recommended:  https://github.com/WebReflection/document-register-element */
(function(global){
    'use strict';

    function customElements(){
        // used to keep track of registered elems
        var registeredElements = {};
        // need a global registered cutom elem map for CEs inheriting from other CEs
        window.registeredElements = this.registeredElements = registeredElements;

        this.register = register;
        function register(name, config){
            // basic checks
            // CEs must have a dash in the name
            if((typeof name !== 'string') || !/.*-.*/.test(name)){
                console.error('Invalid element name: ', name);
                return this;
            }
            name = name.toLowerCase();
            // prevent dups
            if(registeredElements[name]) return this;
            // locate a parent type, default is HTMLElement
            var prototype = (config.parent) ?
                config.parent.prototype :
                config['extends'] ?
                    Object.create(document.createElement(config['extends']).constructor).prototype :
                    HTMLElement.prototype;
            var isa = config['extends'] || null;
            var props = config.properties || {}; // instance
            var members = config.members || {}; // proto
            var tag = {
                prototype: {}
            };
            //var proto = {};
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
                        tag.prototype[member] = {
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
                        tag.prototype[member] = {
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
            tag.prototype.registerCallback = {
                value: function(el, fn){
                    el.onPropChange = fn; // from custom setter
                },
                enumerable: true
            };
            // this is a general purpose notifier for other frameworks consuming
            // a CE defined here
            tag.prototype.propChangeNotify = {
                value: function(el, propName, newVal, oldVal, attrName, type){
                    // prop:added? prop:deleted?
                    // todo - combine with the other fn
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
            tag.prototype.definition = {value: config};

            var callbacks = config.callbacks || {};
            var created = callbacks.created || noop;
            var attached = callbacks.attached || noop;
            var detached = callbacks.detached || noop;
            var attributeChanged = callbacks.attributeChanged || noop;
            //var events = ??? TBD
            var attributeMap = {};
            var prop;
            function checkNum(v) {
                var n = parseFloat(v);
                return (!isNaN(n) && isFinite(n)) ? n : v;
            }
            function setterBoiler(prop, val, el, oldVal, attr, bool) {
                if(!el) return val;
                el.setterCalled[attr] = true;
                // this stuff should fail silently
                try {
                    if(attr && bool){
                        (val) ? el.setAttribute(attr, '') : el.removeAttribute(attr);
                    } else if(attr) {
                        el.setAttribute(attr, val);
                    }
                    el.onPropChange(val); //needs to happen last
                } catch (e) {}
                oldVal = (bool) ? !!el[prop] : el[prop];
                // code outside the matching directive would use this event
                el.propChangeNotify(el, prop, val, oldVal, attr, 'prop:changed');
                return val;
            }

            // parse through the user config properties obj
            var properties = [];
            for(prop in props) {
                (function parseProperty(prop, props) {
                    // the functions are invoked during the createdCallback so they are
                    // scoped to the CE instance, i.e. constructor vars
                    properties.push(function (el) {
                        var property, attr, getter, setter, value, oldVal, readOnly, bool, hasAttr;
                        bool = false;
                        value = null;
                        attr = null;
                        property = props[prop];
                        readOnly = property.readOnly || false;
                        hasAttr = (property.attribute) ? true : false;

                        // handle prop<-->attr binding
                        bool = (hasAttr && property.attribute.boolean) ? true : false;
                        if (hasAttr && !readOnly && !!el) {
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
                                value = checkNum(value);
                            }
                            if (!el.hasAttribute(attr)){
                                // make the attr true by setting it to something false
                                if(bool && value) el.setAttribute(attr, '');
                                else if (bool) el.removeAttribute(attr);
                                else el.setAttribute(attr, value);
                            }
                            el.setterCalled[attr] = false;
                        } else {
                            if(bool && !el) {
                                value = (property.value) ? true : false;
                            }else{
                                value = (property.value) ? property.value : null;
                                value = checkNum(value);
                            }
                        }

                        // construct the property accessor
                        getter = (typeof property.get === 'function') ?
                            property.get :
                            function(){return value;};

                        // construct the property mutator
                        // if set fn provided by user, it overrides as far as how the value
                        // is set, otherwise the default is original value
                        if(readOnly){
                            setter = noop;
                        } else if (typeof property.set === 'function') {
                            setter = function (val) {
                                // invoke any setter logic from user
                                val = property.set.call(el, val);
                                val = setterBoiler(prop, val, el, oldVal, attr, bool);
                                value = val;
                            };
                        } else {
                            setter = function (val) {
                                value = setterBoiler(prop, val, el, oldVal, attr, bool);
                            };
                        }
                        if(!!el){
                            Object.defineProperty(el, prop, {
                                get: getter,
                                set: setter,
                                enumerable: true,
                                configurable: true
                            });
                        }else{
                            tag.prototype[prop] = {
                                get: getter,
                                set: setter,
                                enumerable: true
                            };
                        }
                    });
                })(prop, props);
                // add instance prop to el.proto so tags
                // aren't limited to is="parent" syntax
                properties.forEach(function(fn){
                    fn.call(this, null);
                });
            }
            tag.prototype.createdCallback = {
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
            tag.prototype.attributeChangedCallback = {
                enumerable: true,
                value: function(attr, oldVal, newVal){
                    // if attr maps to a prop, update the prop
                    // hack to prevent stack overflow, proceesor overheat, case melting
                    // loss of reproductive ability
                    if((attributeMap[attr]) && (!this.setterCalled[attr])){
                        var prop = attributeMap[attr];
                        if (prop.bool && (newVal === '')) newVal = true;
                        this.setterCalled[attr] = false;
                        this[prop.name] = (prop.bool) ? !!newVal : checkNum(newVal);
                    }
                    var output = attributeChanged ? attributeChanged.apply(this, arguments) : null;
                    return output;
                }
            };
            tag.prototype.attachedCallback = {
                enumerable: true,
                value: function(){
                    this.classList.remove("unresolved"); // IE 10+
                    var output = attached ? attached.apply(this, arguments) : null;
                    return output;
                }
            };
            tag.prototype.detachedCallback = {
                enumerable: true,
                value: function(){
                    var output = detached ? detached.apply(this, arguments) : null;
                    return output;
                }
            };

            var definition = {
                'prototype': Object.create(prototype, tag.prototype)
            };
            // this sets all of the parent element instance props on the CE
            // a custom-name cannot be used for CEs with this option set, so
            // one option is to wrap an <elem is="cust-elem"... in a proxy CE with this as the
            // template - better declarativeness in the markup
            if(isa) definition['extends'] = isa;

            // add the newly registered element to the tracking map
            registeredElements[name] = document.registerElement( name, definition);
            return this;
        }
        // register an array of opbj
        var provider = this;
        this.registerCollection = registerCollection;
        function registerCollection(definitions){
            if(!Array.isArray(definitions)){
                console.error('parameter to registerCollection must be an array');
                return false;
            }
            definitions.forEach(function(el){
                var name = el.name, config = el.definition;
                if(typeof name !== 'string' || config !== Object(config)) {
                    console.warn('bad element definition format');
                    return false;
                }
                provider.register(name, config);
            });
            return true;
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
                $watchElement: function(scope, el, noBindings){
                    noBindings = noBindings || false;
                    scope.el = el[0];
                    if(!noBindings){
                        scope.el.registerCallback(scope.el, function(val){
                            setTimeout(function(){
                                scope.$digest();
                            }, 0);
                            return true;
                        });
                    }
                },
                // provide limited ability to watch/bind attr/prop changes
                // in foreign web components, values limited to primatives
                // props must be an array of attributeName strings
                // since only attr changes are detected, props must be linked to
                // an attr so
                // TODO - would be to generate an attr for any unlinked props
                // hopefully it will become a best-practice for all CEs to fire events or
                // provide callback hooks in property setters fns
                $importElement: function(scope, el, props, eventName){
                    // expects an array of prop names that are bound to attrs

                    //if(!Array.isArray(props)) return false;
                    var observer = null;
                    var evtBinding = null;
                    if(Array.isArray(props)){
                        props.forEach(function(val, idx, arr){
                            arr[idx] = arr[idx].toLowerCase();
                        });
                        observer = new MutationObserver(function(mutations){
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
                    }
                    // if an external custom element fires a property change event
                    // and we know the name of it, we can trigger a $digest directly
                    // on prop changes
                    // this is untested
                    if(eventName){
                        evtBinding = el.addEventListener(eventName, function(){
                            // we might want to pass back the evt obj at some point
                            scope.$digest();
                        });
                    }
                    if(!Array.isArray(props) || !eventName){
                        return false;
                    }else{
                        return {
                            observer: observer,
                            eventBinding: evtBinding
                        };
                    }
                }
            };
        }
    }
    angular.module('customElements', ['ng']).provider('$customElements', customElements);
})(window);