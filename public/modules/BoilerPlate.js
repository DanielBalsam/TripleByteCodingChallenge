(function() {
  'use strict';

  angular.module('BoilerPlate', ['ui.router'])
    .config(appConfig)
    .run(runApp);

    appConfig.$inject = ['$stateProvider', '$urlRouterProvider','$locationProvider', '$httpProvider'];

    runApp.$inject = ['$rootScope', '$state', 'i18nService'];

    function appConfig($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
      var states = [
          {
            name: 'welcome',
            url: '/welcome',
            templateUrl: '/src/templates/views/welcome.html'
          }
        ];

      states.forEach(function(state) {
        $stateProvider.state(state.name, state);
      });

      $locationProvider.html5Mode(true);
      $urlRouterProvider.otherwise('/welcome');

      $httpProvider.interceptors.push('httpGlobalInterceptor');
    }

    function runApp($rootScope, $state, i18nService) {
      var redirecting;

      $rootScope.translator = i18nService.translator;
      $rootScope.$state = $state;
    }
})();
