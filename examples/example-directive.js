(function(){
    'use strict';

    // 1. bind directly to Custom Element properties in your templates
    var tpl = '<a ng-class="bttnClass"' +
        '    ng-click="el.elementMethod()">' +
        '    {{el.propertyNameOne}}' +
        '    {{el.propertyNameTwo}}' +
        '</a>';

    // 2. Import the Custom Element service
    angular.module('myComponents.smartButton', ['customElements'])

        // An example of how an AngularJS 1.x "component" directive
        // might be defined including the Angular independent
        // custom element config that is exported to the DOM
        .directive('smartButton', [
            '$customElements', function($customElements){
                return {
                    template: tpl,

                    // 3. define your directive with the following options:

                    // 3.1 ALWAYS create an isolate (component) scope
                    // This will be the default for NG 2.0 component directives
                    scope: {},

                    // 3.2 must restrict directive matching to custom element name
                    restrict: 'E',

                    // 3.3 must not overwrite the custom element markup
                    // the one exception would be cases where the "extend" option is used
                    // in which case you want the <elem is="another-elem"> as the template root
                    // This will be the default for NG 2.0 component directives
                    replace: false,

                    // 3.4 at a minimum inject $scope and $element into your controller
                    controller: function($scope, $element, $attrs, $document, $log){

                        // 4. This is the only line of code that is required.
                        // this command takes care of binding all custom properties
                        // to the $scope including triggering a $digest() when
                        // any custom property is changed outside of Angular
                        // After this line you can enjoy the full power of AngularJS
                        // when interacting with your Custom Element
                        $customElements.$watchElement($scope, $element);

                        // 4.1 bind to a Custom Elem Prototype prop if needed
                        // for something that affects all elem intances such as a
                        // theme change.
                        $document.on('member:changed', function(evt){
                            if(evt.detail.propName == 'a protopype prop we need to watch'){
                                // i.e. $scope.el.__proto__.memberNameOne
                                $scope.$digest();
                            }
                        });

                        // 4.2
                        // bind to an event on the element
                        // since all prop changes generate a change event
                        // other frameworks in the page can import and react
                        // to the same component
                        $element.on('prop:changed', function(evt){
                            $log.log(evt.detail);
                            $scope.$emit(evt.detail);
                        });

                        // 4.3
                        // gets the original custom elem config obj mostly for any debug
                        var info = $customElements.info($element);

                        //$customElements.$importElement($scope, $element, ['array','of','property','names']);

                    },
                    link: function(scope, iElement, iAttrs, controller){
                        // ...
                    }
                };
            }])
})();



