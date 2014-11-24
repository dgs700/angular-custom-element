(function(global){
    'use strict';

    var app = angular.module('aceComponents', [
        'aceComponents.dropdown',
        'aceComponents.navbar',
        'ui.bootstrap.custom',
        'customElements'
    ]);

    app.config(['$customElementsProvider', function ($customElementsProvider) {
        //var objectProperty = 'blah blah';
        $customElementsProvider.registerCollection([
            {
                name: 'ace-menu-item',
                definition: {
                    parent: HTMLLIElement,
                    properties: {}
                }
            },{
                name: 'ace-dropdown-menu',
                definition: {
                    parent: HTMLLIElement,
                    properties: {}
                }
            }
        ]);

        //var stringProperty = '';
        $customElementsProvider.register( 'ace-navbar', {
            parent: HTMLDivElement,
            properties: {
                minimal: {
                    attribute: {
                        boolean: true
                    }
                },
                url: {
                    attribute: {
                        name: 'home-url'
                    }
                },
                sticky: {
                    attribute: {
                        boolean: true
                    }
                },
                theme: {
                    attribute: {}
                }
            }
            /*callbacks: {

                created: function(){
                    //console.log('created')
                },
                attached: function(){
                    this.objectMethod('elem attached')
                },
                detached: function (){
                    //console.log('detached')
                },
                attributeChanged: function(attr, oldVal, newVal){
                    //console.log('attributeChanged')
                }
            },*/
            // CLASS MEMBERS !!!
            /*members: {
                objectProperty: {
                    get: function(val){ return val; },

                    set: function(val){
                        val = val + 'X';
                        return val;
                    },
                    value: "blah blah",
                    //readOnly:
                    enumberable: true
                },
                objectMethod: function(mssg){
                    //alert(mssg)
                }
            }*/
        });

        //var stringProperty = '';
        $customElementsProvider.register('smart-button', {
            parent: HTMLButtonElement,
            //extends: 'button',
            properties: {
                // instance properties
                stringProperty: {
                    set: function(val){
                        val = val + 'X';
                        return val;
                    },
                    //value: 'default',
                    attribute: { name: 'string-prop' }
                },
                testProperty: {
                    attribute: { name: 'test-prop' },
                    value: 'hello',
//                    get: function(){return testProperty;},
//                    set: function(val){
//                        testProperty = val;
//                    },
                    readOnly: true
                },
                booleanTest: {
                    attribute: {
                        name: 'bool-attr',
                        boolean: true
                    }
                    //value: true
                }
            },
            callbacks: {

                created: function(){
                    //console.log('created')
                },
                attached: function(){
                    this.objectMethod('elem attached')
                },
                detached: function (){
                    //console.log('detached')
                },
                attributeChanged: function(attr, oldVal, newVal){
                    //console.log('attributeChanged')
                }
            },
            // CLASS MEMBERS !!!
            members: {
                objectProperty: {
                    get: function(val){ return val; },

                    set: function(val){
                        val = val + 'X';
                        return val;
                    },
                    value: "blah blah",
                    //readOnly:
                    enumberable: true
                },
                objectMethod: function(mssg){
                    //alert(mssg)
                }
            }
        });
    }]);

    /*app.run(['$rootScope', '$window', function($rootScope, $window){
        // let's change the style class of a clicked smart button
        $rootScope.$on('smart-button-click', function(evt){
            // AngularJS creates unique IDs for every instantiated scope
            var targetComponentId = evt.targetScope.$id;
            var command = {setClass: 'btn-warning'};
            $rootScope.$broadcast('smart-button-command', targetComponentId, command);
        });
    }]);*/
})(window);


