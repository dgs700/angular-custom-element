(function(){
    'use strict';

    var tpl = '';
    tpl =
    //'<nav id="ace-navbar"' +
    //'     class="navbar navbar-inverse"' +
    //'     ng-class="[position,theme]">' +
    '    <div class="container-fluid">' +
    '        <div class="navbar-header">' +
    '            <button class="navbar-toggle"' +
    '                    type="button"' +
    '                    ng-click="isCollapsed = !isCollapsed">' +
    '                <span class="sr-only">Toggle navigation</span>' +
    '                <span class="icon-bar"></span>' +
    '                <span class="icon-bar"></span>' +
    '                <span class="icon-bar"></span>' +
    '            </button>' +
    '            <a class="navbar-brand"' +
    '               ng-href="{{ homeUrl }}">Brand Logo</a>' +
    '        </div>' +
    '        <div class="collapse navbar-collapse"' +
    '             collapse="isCollapsed">' +
    '            <ul class="nav navbar-nav ace-data"' +
    '                ng-hide="minimalHeader">' +
    '                <ace-dropdown-menu' +
    '                        ng-repeat="menu in menus">' +
    '                </ace-dropdown-menu>' +
    '            </ul>' +
    '            <ul class="nav navbar-nav ace-include"' +
    '                ng-hide="minimalHeader"' +
    '                ace-include></ul>' +
    '        </div>' +
    '    </div>';// +
    //'</nav>';

    angular.module('aceComponents.navbar', [
        'aceComponents.dropdown',
        'customElements'
    ])

        // utility functions for nav bar population
        .service('aceNavBarService', [
            '$window', function($window){

                // add menu data manually
                var menus = false;
                this.addMenus = function(data){
                    if(angular.isArray(data)){
                        menus = data;
                    }
                };

                // functionality can expanded to include menu data via REST
                // check if a menus json object is available
                this.getMenus = function(){
                    if($window.UIC && $window.UIC.header){
                        return $window.UIC.header;
                    }else if(menus){
                        return menus;
                    }else{
                        return false;
                    }
                };
            }])

        // utility directive that replaces ngTransclude to bind the content
        // to a child scope of the directive rather than a sibling scope
        // which allows the container component complete control of its
        // contents
        .directive('aceInclude', function(){
            return {
                restrict: 'A',
                link: function(scope, iElement, iAttrs, ctrl, $transclude) {
                    $transclude(scope, function(clone) {
                        iElement.append(clone);
                    });
                }
            };
        })

        // Navigation Bar Container Component
        .directive('aceNavbar', [
            'aceDropdownService',
            'aceNavBarService',
            '$customElements',
            '$location',
            '$compile',
            '$log', function( aceDropdownService, aceNavBarService, $customElements, $location, $compile, $log){
                return {
                    template: tpl,
                    restrict: 'E',

                    // allow page designer to include dropdown elements
                    transclude: true,
                    //replace: true,
                    // isolate scope
                    scope: {
                        // attribute API for hiding dropdowns
                        minimalHeader: '@minimal',
                        homeUrl: '@'
                    },
                    controller: [
                        '$scope',
                        '$element',
                        '$attrs', function($scope, $element, $attrs){

                            $customElements.$watchElement( $scope, $element );

                         // make sure $element is updated to the compiled/linked version
                         var that = this;
                         this.init = function( element ) {
                             that.$element = element;
                         };

                        // add a dropdown to the nav bar during runtime
                        // i.e. upon hash navigation
                        this.addDropdown = function(menuObj){

                            // create an isolate scope instance
                            var newScope = $scope.$root.$new();

                            // attach the json obj data at the same location
                            // as the dropdown controller would
                            newScope.menu = newScope.$parent.menu = menuObj;

                            // manually compile and link a new dropdown component
                            var $el = $compile('<ace-dropdown-menu></ace-dropdown-menu>')(newScope);

                            // retrieve access to the ISOLATE scope so we can
                            // call digest which is necessary for unit test coverage
                            var isolateScope = $el.isolateScope();
                            isolateScope.$digest();

                            // attach the new dropdown to the end of the first child <ul>
                            // todo - add more control over DOM attach points
                            $element.find('ul').last().append( $el );
                        };

                        // remove a dropdown from the nav bar during runtime
                        // i.e. upon hash navigation
                        this.removeDropdown = function(dropdownId){

                            // get a reference to the target dropdown
                            var menuArray = $scope.registeredMenus.filter(function (el){
                                return el.aceId == dropdownId;
                            });
                            var dropdown = menuArray[0];

                            // remove and destroy it and all children
                            aceDropdownService.remove(dropdown);
                            dropdown.iElement.remove();
                            dropdown.$destroy();
                        };

                            // check for single or array of dropdowns to add
                        // available on scope for additional invokation flexability
                        $scope.addOrRemove = function(dropdowns, action){
                            action = action + 'Dropdown';
                            if(angular.isArray(dropdowns)){
                                angular.forEach(dropdowns, function(dropdown){
                                    that[action](dropdown);
                                });
                            }else{
                                that[action](dropdowns);
                            }
                        };


                            // at the mobile width breakpoint
                        // the Nav Bar items are not initially visible
                        $scope.isCollapsed = true;

                        // menu json data if available
                        $scope.menus = aceNavBarService.getMenus();

                        // keep track of added dropdowns
                        // for container level manipulation if needed
                        $scope.registeredMenus = [];

                        // listen for minimize event
                        $scope.$on('header-minimize', function(evt){
                            $scope.minimalHeader = true;
                        });

                        // listen for maximize event
                        $scope.$on('header-maximize', function(evt){
                            $scope.minimalHeader = false;
                        });

                        // handle request to add dropdown(s)
                        // obj = menu JSON obj or array of objs
                        $scope.$on('add-nav-dropdowns', function(evt, obj){
                            $scope.addOrRemove(obj, 'add');
                        });

                        // handle request to remove dropdown(s)
                        // ids = string or array of strings matching dd titles
                        $scope.$on('remove-nav-dropdowns', function(evt, ids){
                            $scope.addOrRemove(ids, 'remove');
                        });

                            // listen for dropdown open event
                        $scope.$on('dropdown-opened', function(evt, targetScope){

                            // perform an action when a child dropdown is opened
                            $log.log('dropdown-opened', targetScope);
                        });

                        // listen for dropdown close event
                        $scope.$on('dropdown-closed', function(evt, targetScope){

                            // perform an action when a child dropdown is closed
                            $log.log('dropdown-closed', targetScope);
                        });

                        // listen for menu item event
                        $scope.$on('menu-item-selected', function(evt, scope){
                            // grab the url string from the menu iten scope
                            var url;
                            try{
                                url = scope.url || scope.item.url;
                                // handle navigation programatically
                                //$location.path(url);
                                $log.log(url);
                            }catch(err){
                                $log.warn('no url');
                            }
                        });
                    }],
                    link: function(scope, iElement, iAttrs, navCtrl, $transclude){

                        iElement.addClass('nav navbar navbar-inverse');
                        iElement.attr('id', 'ace-navbar');
                        // know who the tenants are
                        // note that this link function executes *after*
                        // the link functions of any inner components
                        // at this point we could extend our NavBar component
                        // functionality to rebuild menus based on new json or
                        // disable individual menu items based on $location
                        scope.registeredMenus = aceDropdownService.getDropdowns();

                        // Attr API option for sticky vs fixed
                        //scope.position = (iAttrs.sticky == 'true') ? 'navbar-fixed-top' : 'navbar-static-top';
                        iElement.addClass((iAttrs.sticky == 'true') ? 'navbar-fixed-top' : 'navbar-static-top');
                        // get theme css class from attr API if set
                        //scope.theme = (iAttrs.theme) ? iAttrs.theme : null;
                        iElement.addClass((iAttrs.theme) ? iAttrs.theme : '');
                        // send compiled/linked element back to ctrl instance
                        navCtrl.init( iElement );
                    }
                };
            }]);
})();




