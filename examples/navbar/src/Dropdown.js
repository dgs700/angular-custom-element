/*Functionality for the dropdown service and dropdown toggle directive provided by the Angular-UI team*/

(function(){
    'use strict';

    var tpl = '';
    //@import "../../build/src/Dropdown/Dropdown.tpl.js";
tpl =
    '    <a dropdown-toggle' +
    '       ng-bind-html="dropdownTitle"><b class="caret"></b></a>' +
    '    <ul class="dropdown-menu"' +
    '        ng-if="jsonData">' +
    '        <ace-menu-item ng-repeat="item in menuItems"' +
    '            text="{{item.text}}"' +
    '            url="{{item.url}}">' +
    '        </ace-menu-item>' +
    '    </ul>' +
    '    <ul class="dropdown-menu"' +
    '        ng-if="!jsonData"' +
    '        ng-transclude></ul>';

    // Dropdown Menu Component
    // Credit for portions of logic to the Angular-UI Bootstrap team
    // https://github.com/angular-ui/bootstrap
    angular.module('aceComponents.dropdown', [
            'customElements',
            'aceComponents.menuItem',
            'ui.bootstrap.custom',
            'ngSanitize'
        ])

        // because we have a tansclusion option for the dropdowns we cannot
        // reliably track open menu status at the component scope level
        // so we prefer to dedicate a service to this task rather than pollute
        // the $rootScope
        .service('aceDropdownService', ['$document', function($document){

            // currently displayed dropdown
            var openScope = null;

            // array of added dropdown scopes
            var dropdowns = [];

            // event handler for click evt
            function closeDropdown( evt ) {
                if (evt && evt.isDefaultPrevented()) {
                    return;
                }
                openScope.$apply(function() {
                    openScope.isOpen = false;
                });
            }

            // event handler for escape key
            function escapeKeyBind( evt ) {
                if ( evt.which === 27 ) {
                    openScope.focusToggleElement();
                    closeDropdown();
                }
            }

            // exposed service functions
            return {

                // called by linking fn of dropdown directive
                register: function(scope){
                    dropdowns.push(scope);
                },

                // remove/unregister a dropdown scope
                remove: function(scope){
                    for(var x = 0; x < dropdowns.length; x++){
                        if(dropdowns[x] === scope){
                            dropdowns.splice(x, 1);
                            break;
                        }
                    }
                },

                // access dropdown array
                getDropdowns: function(){
                    return dropdowns;
                },

                // access a single dropdown scope by $id
                getById: function(id){
                    var x;
                    for(x = 0; x < dropdowns.length; x++){
                        if(id === dropdowns[x].$id) return dropdowns[x];
                    }
                    return false;
                },

                // open a particular dropdown and set close evt bindings
                open: function( dropdownScope ) {
                    if ( !openScope ) {
                        $document.bind('click', closeDropdown);
                        $document.bind('keydown', escapeKeyBind);
                    }
                    if ( openScope && openScope !== dropdownScope ) {
                        openScope.isOpen = false;
                    }
                    openScope = dropdownScope;
                },

                // close a particular dropdown and set close evt bindings
                close: function( dropdownScope ) {
                    if ( openScope === dropdownScope ) {
                        openScope = null;
                        // cleanup to prevent memory leaks
                        $document.unbind('click', closeDropdown);
                        $document.unbind('keydown', escapeKeyBind);
                    }
                }
            };
        }])

        // Primary dropdown component direcitve
        // this is also technically a container component
        .directive('aceDropdownMenu', [
            '$customElements',
            '$timeout',
            'aceDropdownService',
            function($customElements, $timeout, aceDropdownService){
            return {
                template: tpl,

                // component directives should be elements only
                restrict: 'E',

                // replace custom tags with standard html5 markup
                // replace: true,

                // allow page designer to include menu item elements
                transclude: true,

                // isolate scope
                scope: {
                    url: '@'
                },
                controller: [
                    '$scope',
                    '$element',
                    '$attrs', function($scope, $element, $attrs){

                        $customElements.$watchElement( $scope, $element );

                    $scope.disablable = '';
                    $scope.isOpen = false;
                    // persistent instance reference
                    var that = this,

                    // class that sets display: block
                        closeClass = 'close',
                        openClass = 'open';

                    // supply the view-model with info from json if available
                    // this only handles data from scopes generated by ng-repeat
                    angular.forEach( $scope.$parent.menu, function(menuItems, dropdownTitle){
                        if(angular.isArray(menuItems)){

                            // uses ng-bind-html for template insertion
                            $scope.dropdownTitle = dropdownTitle + '<b class="caret"></b>';
                            $scope.menuItems = menuItems;
                            // add a unique ID matching title string for future reference
                            $scope.aceId = dropdownTitle;
                        }
                    });
                    // supply string value for dropdown title via attribute API
                    if($attrs.text){
                        $scope.aceId = $attrs.text;
                        $scope.dropdownTitle = $scope.aceId + '<b class="caret"></b>';
                    }
                    // indicate if this component was created via data or markup
                    // and hide the empty <ul> if needed
                    if($scope.menuItems) $scope.jsonData = true;

                    // add angular element reference to controller instance
                    // for later class toggling if desired
                    this.init = function( element ) {
                        that.$element = element;
                    };

                    // toggle the dropdown $scope.isOpen boolean
                    this.toggle = function( open ) {
                        $scope.isOpen = arguments.length ? !!open : !$scope.isOpen;
                        return $scope.isOpen;
                    };

                    // set browser focus on active dropdown
                    $scope.focusToggleElement = function() {
                        if ( that.toggleElement ) {
                            that.toggleElement[0].focus();
                        }
                    };

                    $scope.selected = function($event, scope){
                        $scope.$emit('menu-item-selected', scope);
                        $event.preventDefault();
                        $event.stopPropagation();
                        // optionally perform some action before navigation
                    };

                    // all dropdowns need to watch the value of this expr
                    // and set evt bindings and classes accordingly
                    $scope.$watch('isOpen', function( isOpen, wasOpen ) {
                        if ( isOpen ) {
                            $scope.focusToggleElement();

                            // tell our service we've been opened
                            aceDropdownService.open($scope);

                            // fire off an "opened" event (event API) for any listeners out there
                            $scope.$emit('dropdown-opened');
                        } else {

                            // tell our service we've been closed
                            aceDropdownService.close($scope);

                            // fire a closed event (event API)
                            $scope.$emit('dropdown-closed');
                        }
                    });

                    // listen for client side route changes
                    $scope.$on('$locationChangeSuccess', function() {
                        // some bug in current version of angular is causing
                        // $locationChangeSuccess to be broadcast on app.run()
                        //$scope.isOpen = false;
                    });

                    // listen for menu item selected events
                    $scope.$on('menu-item-selected', function(evt, targetScope) {
                        // do something when a child menu item is selected
                    });
                }],
                link: function(scope, iElement, iAttrs, dropdownCtrl){

                    iElement.addClass('li ace-dropdown');
                    dropdownCtrl.init( iElement );

                    // add an element ref to scope for future manipulation
                    scope.iElement = iElement;

                    // add to tracked array of dropdown scopes
                    aceDropdownService.register(scope);
                }
            };
        }])

        // the angular version of $('.dropdown-menu').slideToggle(200)
        .directive('dropdownMenu', function(){
            return {

                // match just classnames to stay consistent with other implementations
                restrict: 'C',
                link: function(scope, element, attr) {

                    // set watch on new/old values of isOpen boolean for component instance
                    scope.$watch('isOpen', function( isOpen, wasOpen ){

                        // if we detect that there has been a change for THIS instance
                        if(isOpen !== wasOpen){

                            // stop any existing animation and start the opposite animation
                            element.stop().slideToggle(200);
                        }
                    });
                }
            };
        })

    // from Angular ui.bootstrap.dropdownToggle
    // helper directive for setting active/passive state on the
    // necessary elements
    .directive('dropdownToggle', function() {
        return {

            // keep to attributes since this is not a UI component
            restrict: 'A',

            // list of UI components to work for
            require: '?^aceDropdownMenu',

            link: function(scope, element, attrs, dropdownCtrl) {

                // render inert if no dropdown controller is injected
                if ( !dropdownCtrl ) {
                    return;
                }

                // set the toggle element in the dropdown component
                dropdownCtrl.toggleElement = element;

                // click event listener for this directive
                var toggleDropdown = function(event) {

                    // prevent the browser default behavior for anchor elements
                    event.preventDefault();
                    event.stopPropagation();

                    // check that we are not disabed before toggling visibility
                    if ( !element.hasClass('disabled') && !attrs.disabled ) {

                        // call toggle() on the correct component scope
                        scope.$apply(function() {
                            dropdownCtrl.toggle();
                        });
                    }
                };

                // add click evt binding
                element.bind('click', toggleDropdown);

                // clean up click event binding
                scope.$on('$destroy', function() {
                    element.unbind('click', toggleDropdown);
                });
            }
        };
    });
})();




