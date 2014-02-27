angular.module('boilerplate.module1.services', []);
angular.module('boilerplate.module1.controllers', ['boilerplate.module1.services']);
angular.module('boilerplate.module1.directives', ['boilerplate.module1.controllers']);

angular.module('boilerplate.module1', [
        'ui.router',
        'ui.bootstrap',
        'boilerplate.module1.controllers',
        'boilerplate.module1.services',
        'boilerplate.module1.directives'
    ])

    .config(function ($stateProvider, messagesProvider) {

        // register the states
        $stateProvider
            .state('boilerplate.module1', {
                abstract: true,
                url: '/module1',
                views: {
                    "": {
                        templateUrl: 'modules/module1/views/index.tpl.html',
                        data: {
                            pageTitle: 'Module 1'
                        }
                    }
                }
            })

            .state('boilerplate.module1.state1', {
                url: '/state1',
                templateUrl: 'modules/module1/views/state1.tpl.html',
                controller: "State1Ctrl"
            });
    });
