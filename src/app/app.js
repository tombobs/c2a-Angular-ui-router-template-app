angular.module('boilerplate', [
        'ui.router',
        'system.messages',
        'utils',
        'templates-app',
        'templates-common',
        'ui.bootstrap.modal',
        'boilerplate.module1'
    ])

    .constant('apiUrl', 'http://localhost:1337')
    .constant('authUrl', 'http://localhost:1338')
    .constant('appDebugEnabled', false)

    .config(function ($httpProvider, $stateProvider, $urlRouterProvider, messagesProvider, $sceDelegateProvider, apiUrl) {

        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            apiUrl + '/**'
        ]);

        $stateProvider
          .state('boilerplate', {
            url: '/boilerplate',
            views: {
                navbar: {
                    controller: 'NavCtrl',
                    templateUrl: 'views/navigation.tpl.html'
                },
                main: {
                    templateUrl: 'views/index.tpl.html'
                }
            },

            data: {
                pageTitle: 'BOILERPLATE'
            }
        });

        //$httpProvider.interceptors.push('systemHttpInterceptor');

        $urlRouterProvider.otherwise('/boilerplate/module1/state1');
    })

    .run(function ($rootScope, $state, $stateParams, $location, $modal, appDebugEnabled) {

        $rootScope.pageTitle = 'BOILERPLATE';

        $rootScope.appDebugEnabled = appDebugEnabled;
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        $rootScope.$on('error:reload', function (event, data) {
            $modal.open({
                backdrop: 'static',
                templateUrl: 'views/reloadModal.tpl.html',
                controller: function ($scope, error) {
                    $scope.reload = function () {
                        location.reload();
                    };

                    if (error.config) {
                        delete error.config.transformRequest;
                        delete error.config.transformResponse;
                    }

                    $scope.debugMessage = error;
                },
                resolve: {
                    error: function () {
                        return data;
                    }
                }
            });
        });

        // if route change fails
        // check the error and do something
        $rootScope.$on('$stateChangeError', function (event, to, toParams, from, fromParams, error) {
            error = error || {};


            switch (error.status) {
                case 404:
                    $rootScope.$broadcast('system:404');
                    break;

                case 403:
                case 401:
                    break;

                default:
                    if (from.name !== "") {
                        $state.transitionTo(from, fromParams);
                    } else {
                        $location.path('/');
                    }
                    $rootScope.$broadcast('error:unknown');
                    break;
            }
        });
    });
