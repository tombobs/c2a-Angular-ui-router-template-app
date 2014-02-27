angular.module('boilerplate')

    .service('ajaxSvc', function ($http, $q, $cookieStore, apiUrl) {

        this.onSuccess = function (result) {
            return result.data;
        };

        this.getUsernameById = function (id) {
          return $http.get(apiUrl + '/reports/getUsernameById/' + id)
            .then(this.onSuccess, this.onError);
        },

        this.getDepartments = function (id) {
            return $http.get(apiUrl + '/questions/departments')
                .then(this.onSuccess, this.onError);
        };

        this.getDealerName = function(params){
            return $http.post(apiUrl + '/entities/getNameById', params, null)
                .then(this.onSuccess, this.onError);
        };

        this.onError = function (result) {
            return $q.reject(result);
        };

        this.setCookie = function (key, value) {
            return $cookieStore.put(key, value);
        };

        this.getCookie = function (key) {
            return $cookieStore.get(key);
        };
    });