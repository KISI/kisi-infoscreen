var app = angular.module('KISIInfoscreen', []);

//--- Directives ---//
app.directive('clock', function() {
    return {
        controller: ['$scope', '$timeout', function($scope, $timeout) {
            var scope = $scope;
            scope.time = Date.now();
            
            var tick = function() {
                scope.time = Date.now();
                $timeout(tick,1000);
            }
            
            tick();
        }],
        scope: {},
        template: '<p ng-bind="time | date:\'HH:mm:ss\'"></p>'
    };
});

//--- Filters ---//
app.filter('reverse', function() {
  return function(items) {
      if (items !== undefined)
      {
          return items.slice().reverse();
      }
      return undefined;
  };
});

//--- Controllers ---//
app.controller('EventsController', ['$scope', '$http', '$location', function($scope, $http, $location) {
    var scope = $scope;
    
    var livestream = '';
    
    if ($location.search()['livestream'] == 1)
    {
        livestream = '&livestream=1';
    }
    else {
        $http.get('/api/events?count=10&reverse&minend=' + (Math.round(Date.now() / 1000) - (60 * 30)) + '&maxstart=' + (Math.round(Date.now() / 1000))).then(function(response){
            scope.eventsrunning = response.data.data;
            console.log("success");
        }, function(response) {
            console.log("error");
        });
    }
    
    $http.get('/api/events?count=10' + livestream + '&start=' + (Math.round(Date.now() / 1000))).then(function(response){
        scope.events = response.data.data;
        console.log("success");
    }, function(response) {
        console.log("error");
    });
}]);