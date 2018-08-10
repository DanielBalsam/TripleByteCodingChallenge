(function() {
  'use strict';

  angular.module('BoilerPlate')
    .factory('httpGlobalInterceptor', httpGlobalInterceptor);

  httpGlobalInterceptor.$inject = ['$q', '$rootScope'];

  function httpGlobalInterceptor($q, $rootScope){
    var factory =  {
      'request': function(config) {
        return config;
      },

     'requestError': function(response) {
        return $q.reject(response);
      },


      'response': function(response) {
        return response;
      },

     'responseError': function(response) {
       return $q.reject(response);
      }
    };

    return factory;
  }
})();
