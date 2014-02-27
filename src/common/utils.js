angular.module('utils', ['ui.bootstrap.modal'])
  .filter('truncate', function () {
    return function (input, length) {
      if(input.length > length){
        return input.substring(0, length) + '...';
      }
      else {
        return input;
      }
    };
  })

  .filter('time', function () {
    function pad(str, p, len) {
      str = str.toString();
      p = p.toString();
      while (str.length < len) {
        str = p + str;
      }
      return str;
    }

    return function (seconds, showDays) {
      var days = '',
        hours = 0,
        mins = 0,
        secs = 0;

      if (seconds < 60) {
        secs = parseInt(seconds, null);
      } else {
        secs = seconds % 60;
        mins = Math.floor(seconds / 60) % 60;

        // if it's more than 1 hour
        if (seconds > 3600) {
          hours = Math.floor(seconds / 3600);
          // if it's more than 24 hours
          if (seconds > 86400) {
            // if we're showing days
            if (showDays === true) {
              days = Math.floor(seconds / 86400) + ' ';
              hours = Math.floor(hours % 24);
            }
          }
        }
      }

      return days + pad(hours, "0", 2) + ':' + pad(mins, "0", 2) + ':' + pad(secs.toFixed(0), "0", 2);
    };
  })

  .directive('optionsDisabled', function ($parse, $filter) {

    var optionsData = [],
      filterKey;

    var getMatching = function (subject, filterObj, strict) {
      strict = strict || false;
      return $filter('filter')(subject, filterObj, strict);
    };

    var disableOptions = function (element, model, matchingItems) {

      // refresh the disabled options in the select element.
      angular.forEach(element.find('option'), function (value, index) {
        var elm = angular.element(value),
          optionVal = false;

        elmIndex = elm.val();

        if (elmIndex !== "" && optionsData[elmIndex]) {
          optionVal = optionsData[elmIndex][filterKey];
        }

        if (optionVal) {
          // if the model and the option are the same value
          if (model == optionVal) {
            elm.attr('disabled', false);
          } else {
            // add the option's value to the search key
            var filterObj = {};
            filterObj[filterKey] = optionVal;

            var matches = getMatching(matchingItems, filterObj);
            if (matches.length > 0) {
              return elm.attr('disabled', true);
            } else {
              return elm.attr('disabled', false);
            }
          }
        } else {
          return elm.attr('disabled', false);
        }
      });

      element.css('width', '100%');
    };


    return {
      priority: 0,
      require: 'ngModel',
      link: function (scope, element, attrs, ctrl) {
        var ngOptions = attrs.ngOptions.match(/^\s*(.+)\s+for\s+(.+)\s+in\s+(.+)?\s*/),
          searchArray = $parse(attrs.optionsDisabled)(scope),
          filterObj = $parse(attrs.filterGrouping)(scope) || {};

        // set some directive var values
        filterKey = attrs.filterKey;

        // since the item could be resolved by a promise
        // we need to watch the scope for it's change event
        // and then take action
        scope.$watch(ngOptions[3], function (newVal, oldVal) {
          if (newVal) {
            optionsData = newVal;
          }
          var matchingItems = getMatching($parse(attrs.optionsDisabled)(scope), filterObj);

          if (matchingItems.length > 0) {
            return disableOptions(element, $parse(attrs.ngModel)(scope), matchingItems);
          }
        });

        scope.$watch(attrs.optionsDisabled, function (newVal, oldVal) {
          if (newVal) {
            var matchingItems = getMatching(newVal, filterObj);
            if (matchingItems.length > 0 && optionsData) {
              return disableOptions(element, $parse(attrs.ngModel)(scope), matchingItems);
            }
          }
        }, true);

        scope.$watch(attrs.ngModel, function (newVal, oldVal) {

          var matchingItems = getMatching(searchArray, filterObj);

          if (matchingItems.length > 0 && optionsData) {
            return disableOptions(element, newVal, matchingItems);
          }
        }, true);
      }
    };
  })


  .factory('AudioService', function ($http, $q, authUrl, apiUrl) {

    return {

      getRecordingUrl: function (callGuid) {
        var d = $q.defer(),
          self = this;

        self.getRecordingRequestToken(callGuid).then(function (requestToken) {
          self.getRecordingDownloadToken(requestToken).then(function (recordingToken) {
            if (recordingToken) {
              return d.resolve(apiUrl + '/recording/' + recordingToken);
            }

            return d.reject();
          }, function (result) {
            return d.reject(result);
          });
        }, function (result) {
          return d.reject(result);
        });

        return d.promise;
      },

      getRecordingRequestToken: function (callGuid) {
        return $http.get(authUrl + '/auth/recording_request_token/' + callGuid).then(function (result) {
          if (result.data) {
            return result.data;
          }

          return $q.reject();
        }, function (result) {
          return $q.reject(result);
        });
      },

      getRecordingDownloadToken: function (requestToken) {
        return $http.get(authUrl + '/auth/recording_download_token/' + requestToken).then(function (result) {
          if (result.data) {
            return result.data;
          }

          return $q.reject();
        }, function (result) {
          return $q.reject(result);
        });
      }
    };
  })

  .controller('AudioPlayerModalCtrl', function ($scope, $modalInstance, AudioService, url, callDateTime, callDuration, callId) {

    $scope.url = url;
    $scope.callDateTime = callDateTime;
    $scope.callDuration = callDuration;
    $scope.callId = callId;

    $scope.close = function () {
      console.log('Close');
      $modalInstance.dismiss('cancel');
    };
  })


  .directive('audio', function (AudioService) {
    return {
      restrict: 'E',
      replace: false,
      link: function (scope, element, attrs) {
        attrs.$observe('src', function () {
          // put an audio player that actually works in here?
        });
      }
    };
  })

  .directive('audioPlayer', function (AudioService, $parse, $timeout) {
    return {
      restrict: 'AE',
      template: '<audio ng-show="loaded" src="{{url}}" controls="controls" preload="auto"></audio>',
      replace: false,
      source: {
        callGuid: '='
      },
      controller: function ($scope, $attrs, AudioService) {

        $scope.$watch('callGuid', function (newVal, oldVal) {
          if (newVal) {
            AudioService.getRecordingUrl(newVal).then(function (url) {
              $scope.url = url;
              $scope.loaded = true;
            }, function (result) {
              $scope.$emit('error:unknown');
              $scope.loaded = false;
            });
          }
        }, true);
      }
    };
  })

  .directive('audioPlayerModal', function (AudioService, $parse, $timeout) {

    return {
      restrict: 'AE',
      template: '<button ng-click="loadAudio()" class="btn btn-default btn-sm">' +
        '<i ng-show="!loading && !error" class="fa fa-play fa-lg"></i>' +
        '<i ng-show="loading" class="fa fa-spinner fa-spin fa-lg"></i>' +
        '<i ng-show="!loaded && error" class="fa fa-warning fa-lg"></i>' +
        '</button>',
      replace: false,
      source: {
        callDateTime: '@callDate',
        callDuration: '@',
        callId: '@',
        callGuid: '@'
      },
      controller: function ($scope, $attrs, $modal, AudioService) {
        var modalInstance;

        $scope.loadAudio = function () {
          $scope.loading = true;
          if ($scope.callGuid) {
            AudioService.getRecordingUrl($scope.callGuid).then(function (url) {
              var modalInstance = $modal.open({
                templateUrl: 'audio-player-modal.tpl.html',
                controller: 'AudioPlayerModalCtrl',
                scope: $scope,
                resolve: {
                  url: function () {
                    return url;
                  },
                  callDateTime: function () {
                    return $scope.callDateTime;
                  },
                  callDuration: function () {
                    return $scope.callDuration;
                  },
                  callId: function () {
                    return $scope.callId;
                  }
                },
                backdrop: 'static'
              });

              $scope.loading = false;
            }, function (result) {
              $scope.$emit('error:unknown');
              $scope.loading = false;
              $scope.error = true;

              $timeout(function () {
                $scope.error = false;
              }, 3000);
            });
          }
        };
      }
    };
  })

  .filter('percent', function () {

    return function (a, b) {
      a = parseInt(a, null);
      b = parseInt(b, null);

      if (a === 0 && b > 0) {
        return 0;
      }

      if (b === 0) {
        return 100;
      }

      var percent = (a / b * 100);

      if (percent != parseInt(percent.toFixed(), null)) {
        return parseInt(percent.toFixed(2), null);
      }

      return parseInt(percent.toFixed(), null);
    };
  })

  .directive('percentCompleteBar', function ($filter, $parse) {

    function setPercent(a, b, scope, elem) {
      var percent = 0;

      scope.class = '';

      percent = a === 0 ? 0 : $filter('percent')(a, b);

      if (percent === 100) {
        scope.class = 'alert alert-success';
      } else if (percent >= 85) {
        scope.class = 'alert alert-info';
        elem.css('width', percent + '%');
      } else if (percent > 0) {
        scope.class = 'alert alert-warning';
      }

      if (percent >= 0) {
        elem.css('width', percent + '%');
      }

      scope.percent = percent + '%';
    }

    return {
      restrict: 'A',
      template: '<div class="{{class}}" style="text-align:center; padding:5px 0; margin:0;">{{percent}}</div>',
      scope: {
        numerator: '=',
        denominator: '='
      },
      replace: true,
      link: function (scope, elem, attrs) {

        scope.$watch('numerator', function (newVal, oldVal) {
          return setPercent(newVal, scope.denominator, scope, elem);
        }, true);
      }
    };
  });


Array.prototype.contains = function (key, val) {
  this.forEach(function (item) {
    if (item[key]) {
      if (item[key] == val) {
        return true;
      }
    }
  });
  return false;
};

// return list of all members containing key=value
Array.prototype.selectByKVP = function (key, val) {
  var list = [];
  this.forEach(function (item) {
    if (item[key]) {
      if (item[key] == val) {
        list.push(item);
      }
    }
  });
  return list;
};

Array.prototype.getByKVP = function (key, val) {
  this.forEach(function (item) {
    if (item[key]) {
      if (item[key] == val) {
        return item;
      }
    }
  });
  return null;
};

Array.prototype.removeByKVP = function (key, val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i][key]) {
      if (this[i][key] == val) {
        this.splice(i, 1);
      }
    }
  }
};