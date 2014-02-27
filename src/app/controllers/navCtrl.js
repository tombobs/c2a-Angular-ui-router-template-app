angular.module('boilerplate').controller('NavCtrl', function ($rootScope, $scope, $stateParams, $location, clientSvc, projectSvc, ajaxSvc) {

        // watch for the clientId changing
        $scope.$watch(function () {
            return $stateParams.clientId;
        }, function (newVal, oldVal) {
            if (!newVal) {
                $rootScope.client = undefined;
                return setPageTitle();
            }

            clientSvc.getById(newVal).then(function (data) {
                $rootScope.client = data;
                if ($stateParams.entityId) {
                    return setDealer();
                } else {
                    return setPageTitle();
                }
            });

        }, true);

        $scope.$watch(function () {
          return $stateParams.userId;
        }, function(newVal, oldVal) {
          if(newVal) {
            ajaxSvc.getUsernameById(newVal).then(function(data) {
              $scope.user = data;
            });
          }
        });

        // watch for the projectId changing
        $scope.$watch(function () {
            return $stateParams.projectId;
        }, function (newVal, oldVal) {
            if (!newVal) {
                $rootScope.project = undefined;
                return setPageTitle();
            }

            projectSvc.getSelected(newVal).then(function (data) {
                $rootScope.project = data;
                return setPageTitle();
            });
        }, true);


        // watch for the entityId changing
        $scope.$watch(function () {
            return $stateParams.entityId;
        }, function (newVal, oldVal) {
            if (!newVal) {
                $rootScope.dealer = undefined;
                return setPageTitle();
            }
            if ($rootScope.client) {
                return setDealer();
            }
        }, true);

        function setDealer() {
            var params = {
                id: $stateParams.entityId,
                is_trackback_client: $scope.client.settings.is_trackback_client
            };

            ajaxSvc.getDealerName(params).then(function (data) {
                $rootScope.dealer = {
                    entity_name: data.entity_name
                };
                return setPageTitle();

            }, function (data) {
                $rootScope.dealer = {
                    entity_name: 'Dealer'
                };

                return setPageTitle();
            });
        }


        function setPageTitle() {

            var clientName, projectName, dealerName, segments = ['SCAN'];

            if ($rootScope.client) {
                clientName = $rootScope.client.client_name;
                segments.push(clientName);
            }

            if ($rootScope.project) {
                projectName = $rootScope.project.project_name;
                segments.push(projectName);
            }

            if ($rootScope.dealer) {
                dealerName = $rootScope.dealer.entity_name;
                segments.push(dealerName);
            }

            //segments.reverse();

            $rootScope.pageTitle = segments.join(' | ');
        }

    }
)
;