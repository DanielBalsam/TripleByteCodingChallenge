(function() {
  'use strict';

  angular.module('BoilerPlate')
    .filter('stringReplacement', stringReplacementFilter);

    function stringReplacementFilter() {
      return filter;

      function filter(input, v1, v2, v3) {
        if (typeof input !== 'string') {
          return '';
        }

        if (!v1) {
          return '';
        }

        return input.replace('{0}', v1).replace('{1}', v2).replace('{2}', v3);
      }
    }
})();
