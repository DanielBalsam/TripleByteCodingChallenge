(function() {
  'use strict';

  angular.module('BoilerPlate')
    .service('i18nService', i18nService);

    i18nService.$inject = ['$http'];

    function i18nService($http) {
      var me = this;

      init();

      function init() {
        me.translator = {};

        getStrings();
      }

      function getStrings() {
        $http.get('api/i18n')
          .then(function(res) {
            me.translator.i18n = res.data;
          });
      }
    }
})();
