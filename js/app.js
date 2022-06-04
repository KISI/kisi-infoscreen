var app = angular.module('KISIInfoscreen', ['ngAnimate']);

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

app.directive('heading', function() {
    return {
        controller: ['$scope', '$timeout', function($scope, $timeout) {
            var scope = $scope;
            
            scope.dayNames = [
                "#Sonntag",
                "#Montag",
                "#Dienstag",
                "#Mittwoch",
                "#Donnerstag",
                "#Freitag",
                "#Samstag"
            ];
            
            scope.monthNames = [
                "Januar",
                "Februar",
                "März",
                "April",
                "Mai",
                "Juni",
                "Juli",
                "August",
                "September",
                "Oktober",
                "November",
                "Dezember"
            ];
            
            scope.time = Date.now();
            scope.date = new Date();
            
            var tick = function() {
                scope.time = Date.now();
                $timeout(tick,1000);
            };
            
            var datetick = function() {
                scope.date = new Date();
                $timeout(datetick,60000);
            };
            
            scope.getDay = function() {
                if (scope.date !== undefined)
                {
                    return scope.dayNames[scope.date.getDay()];
                }
            };
            
            scope.getMonth = function() {
                if (scope.date !== undefined)
                {
                    return scope.monthNames[scope.date.getMonth()];
                }
            };
            
            //$timeout(tick,2500);
            tick();
        }],
        scope: {},
        template: '<div class="datediv"><span class="date" ng-bind="date.getDate() + \'. \' + getMonth() + \' \' + date.getFullYear()"></span><span class="day" ng-bind="getDay()"></span></div><div class="time"><span ng-bind="time | date:\'HH:mm:ss\'"></span></div>'
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

//--- Animations ---//
app.animation('.events', [function() {
  return {
    // make note that other events (like addClass/removeClass)
    // have different function input parameters
    enter: function(element, doneFn) {
      jQuery(element).animateCss('fadeInLeft', doneFn);

      // remember to call doneFn so that angular
      // knows that the animation has concluded
    },

    move: function(element, doneFn) {
      jQuery(element).fadeIn('shake', doneFn);
      //doneFn();
    },

    leave: function(element, doneFn) {
      jQuery(element).animateCss('fadeOutRight', doneFn);
    }
  }
}]);

//--- Controllers ---//
app.controller('EventsController', ['$scope', '$http', '$location', '$timeout', function($scope, $http, $location, $timeout) {
    var scope = $scope;
    scope.events = [];
    scope.eventsrunning = [];
    
    var livestream = '';
    
    var eventsSuccess = function(response){
        for(var i = 0; i < response.data.data.length; i++)
        {
            var missing = true;
            for (var s = 0; s < scope.events.length; s++)
            {
                if (scope.events[s].id == response.data.data[i].id)
                {
                    missing = false;
                }
            }
            if (missing)
            {
                scope.events.push(response.data.data[i]);
            }
        }
        for(var i = 0; i < scope.events.length; i++)
        {
            var exists = false;
            
            for (var s = 0; s < response.data.data.length; s++)
            {
                if (response.data.data[s].id == scope.events[i].id)
                {
                    exists = true;
                    scope.events[i].start = response.data.data[s].start;
                    scope.events[i].end = response.data.data[s].end;
                    scope.events[i].hasEnd = response.data.data[s].hasEnd;
                    scope.events[i].title = response.data.data[s].title;
                    scope.events[i].location = response.data.data[s].location;
                    scope.events[i].featured = response.data.data[s].featured;
                    scope.events[i].livestream = response.data.data[s].livestream;
                }
            }
            if (!exists)
            {
                scope.events.splice(i,1);
            }
        }
        scope.events = scope.events.sort(function (a,b) {
            return a.start - b.start;
        });
        console.log("success");
    };
    
    var eventsrunningSuccess = function(response){
        for(var i = 0; i < response.data.data.length; i++)
        {
            var missing = true;
            for (var s = 0; s < scope.eventsrunning.length; s++)
            {
                if (scope.eventsrunning[s].id == response.data.data[i].id)
                {
                    missing = false;
                }
            }
            if (missing)
            {
                scope.eventsrunning.push(response.data.data[i]);
            }
        }
        for(var i = 0; i < scope.eventsrunning.length; i++)
        {
            var exists = false;
            
            for (var s = 0; s < response.data.data.length; s++)
            {
                if (response.data.data[s].id == scope.eventsrunning[i].id)
                {
                    exists = true;
                    scope.eventsrunning[i].start = response.data.data[s].start;
                    scope.eventsrunning[i].end = response.data.data[s].end;
                    scope.eventsrunning[i].hasEnd = response.data.data[s].hasEnd;
                    scope.eventsrunning[i].title = response.data.data[s].title;
                    scope.eventsrunning[i].location = response.data.data[s].location;
                    scope.eventsrunning[i].featured = response.data.data[s].featured;
                    scope.eventsrunning[i].livestream = response.data.data[s].livestream;
                }
            }
            if (!exists)
            {
                scope.eventsrunning.splice(i,1);
            }
        }
        scope.eventsrunning = scope.eventsrunning.sort(function (a,b) {
            return a.start - b.start;
        });
        console.log("success");
    };
    
    var loadEvents = function() {
        if ($location.search()['livestream'] == 1)
        {
            $http.get('/api/events?count=9&livestream=1&start=' + (Math.round(Date.now() / 1000) - (60 * 30))).then(eventsSuccess, function(response) {
                console.log("error");
            });
        }
        else {
            $http.get('/api/events?count=9&reverse&minend=' + (Math.round(Date.now() / 1000) - (60 * 30)) + '&maxstart=' + (Math.round(Date.now() / 1000))).then(function(response){
                eventsrunningSuccess(response);
                $http.get('/api/events?count=' + Math.abs(9 - scope.eventsrunning.length) + '&start=' + (Math.round(Date.now() / 1000))).then(eventsSuccess, function(response) {
                    console.log("error");
                });
            }, function(response) {
                console.log("error");
            });
        }
    }
    
    var tick = function() {
        loadEvents();
        $timeout(tick,10000);
    }
    
    tick();
    
    var reloadTick = function() {
        location.reload(true);
        $timeout(reloadTick,3600000);
    }
    
    $timeout(reloadTick,3600000);
    
    if ($location.search()['nobg'] == 1)
    {
        jQuery("body").css('background', 'transparent');
        jQuery("#background").css('background', 'transparent');
    }
    
}]);

$.fn.extend({
    animateCss: function (animationName, callback) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        $(this).addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
            callback();
        });
    }
});
