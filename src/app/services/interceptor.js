angular.module('boilerplate')
    .factory('systemHttpInterceptor', function ($rootScope, $q) {

        var reqCount = 0;

        return {
            // for every route that isn't in the list of exceptions
            'request': function (config) {
                if (reqCount === 0) {
                    $rootScope.$emit('spinner:loading');
                }
                reqCount++;
                return config || $q.when(config);
            },

            'response': function(response) {
                reqCount--;
                if (response.status === 200 || response.status === 201) {
                    if (reqCount === 0) {
                       $rootScope.$emit('spinner:success');
                    }
                    return response || $q.when(response);
                }
                return $q.reject(response);
            },

            'responseError': function(rejection) {
                reqCount--;
                if (rejection.status !== 401) {
                    $rootScope.$emit('error:reload', rejection);
                }
                if (reqCount === 0) {
                    $rootScope.$emit('spinner:error');
                }
                return $q.reject(rejection);
            }
        };
    });