
// 1. include your element directive and Custom Element provider as dependencies
var app = angular.module('MyApp',['myComponents.smartButton', 'customElements']);

// 2. inject $customElementsProvider into a config block
app.config(['$customElementsProvider', function ($customElementsProvider) {

    // 3. call the .register() function with a tag name (including namespace plus dash plus name)
    // and the custom element config object (very similar to X-Tag config).
    // TODO - add some kind of bulk register option so the source element configs can live elswhere
    $customElementsProvider.register('smart-button', {

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
            propertyNameTwo: {
                // will match or create an attr named propertynametwo="..."
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
            booleanProperty: {
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
            elementMethod: function(args){
                // logic available to any element instance of this type
                // by calling elem.elementProtoMethod(args)
            },

            // in the RARE case where a property needs to be accessable by ALL element instances of
            // this type, define it here. Any data binding to directive $scope requires an explicit event
            // listener attached to the document.
            // One example use case might be a re-themeing of all elements during a page app lifecycle.
            // the attribute option is not available for this
            memberNameOne: {

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
    })

        // create a Custom Element that uses all defaults
        .register('smart-input', {});
}]);
