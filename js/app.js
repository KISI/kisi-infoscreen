var app = angular.module('KISIInfoscreen', ['ngAnimate']);

//--- Directives ---//
app.directive('heading', function() {
    return {
        controller: ['$scope', '$timeout', function($scope, $timeout) {
            var scope = $scope;
            
            scope.dayNames = [
                "Sonntag",
                "Montag",
                "Dienstag",
                "Mittwoch",
                "Donnerstag",
                "Freitag",
                "Samstag"
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
        template: '<div class="datediv"><span ng-bind="getDay()"></span>,&nbsp;<span ng-bind="date.getDate() + \'. \' + getMonth() + \' \' + date.getFullYear()"></span>&nbsp;&ndash;&nbsp;<span class="bold"><span ng-bind="time | date:\'HH:mm\'"></span>&nbsp;Uhr</span><div class="heading"><b>HEUTE</b> STEHT AM<br/>PROGRAMM</div></div>'
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
        for (var s = 0; s < scope.events.length; s++)
        {
            if (scope.events[s].start - Math.round(Date.now() / 1000) < 0 && Math.round(Date.now() / 1000) - scope.events[s].end < 0)
            {
                scope.events[s].running = true;
            } else {
                scope.events[s].running = false;
            }

            if (scope.events.length > 10) {
                if (Math.round(Date.now() / 1000) - scope.events[s].end - (60 * 30) > 0) {
                    scope.events.splice(s,1);
                    s--;
                }
            }
        }
        if (scope.events.length > 10) {
            scope.events.splice(10);
        }
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
        let date = Date.now();
        $http.get('/api/events?count=100&start=' + (Math.round((date - date % 86400000) / 1000))).then(eventsSuccess, function(response) {
            console.log("error");
        });
        $http.get('/api/events?count=1&minend=' + (Math.round(Date.now() / 1000)) + '&maxstart=' + (Math.round((date + 86400000 - date % 86400000) / 1000))).then(function(response){
            eventsrunningSuccess(response);
        });
    }
    
    var tick = function() {
        loadEvents();
        $timeout(tick,10000);
    }
    
    tick();
    
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
