(function() {
  var app = angular.module('kisiInfoscreenBackend', ['ngCookies', 'ngRoute', 'datatables',]);

  //--Factories--//
  app.factory('authInterceptor', ['$rootScope', '$q', '$window', '$cookies', function($rootScope, $q, $window, $cookies) {
    return {
      request: function(config) {
        config.headers = config.headers || {};
        if ($window.sessionStorage.token) {
          config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
        }
        return config;
      },
      response: function(response) {
        if (response.status === 401) {
          delete $window.sessionStorage.token;
          $rootScope.isLogin = false;
          $rootScope.loginmessage = "Your session expired! Please login again.";
        }
        return response || $q.when(response);
      },
      responseError: function(rejection) {
        if (rejection.status === 401) {
          $cookies.remove('token');
          delete $window.sessionStorage.token;
          $rootScope.isLogin = false;
          $rootScope.loginmessage = "Your session expired! Please login again.";
        }
        return $q.reject(rejection);
      }
    };
  }]);

  //---Config---//
  app.config(function($routeProvider) {
    $routeProvider.when("/", {
      templateUrl: "pages/home.html",
    }).when("/:day", {
      templateUrl: "pages/day.html",
      controller: "DayController",
      controllerAs: "DayCtrl"
    }).otherwise({
      redirectTo: "/"
    });
  });

  app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  }]);

  //---Run---//
  app.run(['$rootScope', function($rootScope) {
    //--Functions--//
    $rootScope.init = function(scope, http) {

    }
  }]);

  //---Directives---//
  app.directive("menuTop", function() {
    return {
      restrict: 'E',
      templateUrl: "includes/menu.html",
      controller: 'MenuController',
      controllerAs: 'menu'
    };
  });

  app.directive("login", function() {
    return {
      restrict: 'E',
      templateUrl: "includes/login.html",
      controller: 'LoginController',
      controllerAs: 'login'
    };
  });

  //---Controller---//
  app.controller('MenuController', ['$rootScope', '$window', '$cookies', '$scope', '$http', '$routeParams', '$sce', function($rootScope, $window, $cookies, $scope, $http, $routeParams, $sce) {
    var scope = $scope;
    var routeParams = $routeParams;
    scope.menu = $sce.trustAsHtml("");
    
    scope.$on('$routeChangeSuccess', function($event, current, previous) { 
      var menu = '<li><a href="#/">Home</a></li>';
      if (routeParams.day) {
        var date = $routeParams.day.split('-');
        var day = new Date(date[2],parseInt(date[1])-1,parseInt(date[0]))
        var previous = new Date(day.getTime() - 86400000);
        var next = new Date(day.getTime() + 86400000);
        menu += '<li><a href="#/' + previous.getDate() + '-' + (previous.getMonth()+1) + '-' + previous.getFullYear() + '">Previous</a></li>';
        menu += '<li><a href="#/' + day.getDate() + '-' + (day.getMonth()+1) + '-' + day.getFullYear() + '">' + day.getDate() + '-' + (day.getMonth()+1) + '-' + day.getFullYear() + '</a></li>';
        menu += '<li><a href="#/' + next.getDate() + '-' + (next.getMonth()+1) + '-' + next.getFullYear() + '">Next</a></li>';
      } else {
        var now = new Date();
        var yesterday = new Date(now.getTime() - 86400000);
        var tomorrow = new Date(now.getTime() + 86400000);
        menu += '<li><a href="#/' + yesterday.getDate() + '-' + (yesterday.getMonth()+1) + '-' + yesterday.getFullYear() + '">Yesterday</a></li>';
        menu += '<li><a href="#/' + now.getDate() + '-' + (now.getMonth()+1) + '-' + now.getFullYear() + '">Today</a></li>';
        menu += '<li><a href="#/' + tomorrow.getDate() + '-' + (tomorrow.getMonth()+1) + '-' + tomorrow.getFullYear() + '">Tomorrow</a></li>';
      }
      scope.menu = $sce.trustAsHtml(menu);
    });
    
    this.logout = function() {
      $cookies.remove('token');
      delete $window.sessionStorage.token;
      $rootScope.isLogin = false;
      $rootScope.loginmessage = '';
    };
  }]);
  
  app.controller('DayController', ['$http', '$scope', '$rootScope', '$routeParams', function ($http, $scope, $rootScope, $routeParams) {
    var scope = $scope;
    scope.loaded = false;
    scope.day = $routeParams.day;

    $rootScope.$watch("isLogin", function(val) {
      if (val) {
        $http({
          url: '/api/backend/events?date='+scope.day,
          method: 'GET'
        }).success(function(data, status, headers, config) {
          scope.events = data.data;
          scope.loaded = true;
        });
      }
    });
    
    scope.add = function() {
      if (scope.adding) {
        var date = scope.day.split('-');
        scope.newevent.start = (new Date(date[2],parseInt(date[1])-1,parseInt(date[0]),scope.newevent.starth,scope.newevent.startm)).getTime()/1000;
        scope.newevent.end = (new Date(date[2],parseInt(date[1])-1,parseInt(date[0]),scope.newevent.endh,scope.newevent.endm)).getTime()/1000;
        $http.post('/api/backend/event', scope.newevent).then(function(response) {
          scope.newevent = {};
          scope.adding = false;
          $http({
            url: '/api/backend/events?date='+scope.day,
            method: 'GET'
          }).success(function(data, status, headers, config) {
            scope.events = data.data;
          });
        }, function(response) {
          console.log(response);
        });
      }
    };

    scope.clone = function() {
      if (scope.newdate) {
        var request = {
          "date": scope.day,
          "newdate": scope.newdate,
        };
        $http.post('/api/backend/events/clone', request).then(function(response) {
          location.href = "/backend/#/" + scope.newdate;
        }, function(response) {
          console.log(response);
        });
      }
    };

    scope.cloneUntil = function() {
      if (!scope.current) {
        var date = scope.day.split('-');
        scope.current = new Date(date[2],parseInt(date[1])-1,parseInt(date[0]));
      }
      
      scope.current.setDate(scope.current.getDate() + 1);
      
      if (scope.newdate) {
        var dateuntil = scope.newdate.split('-');
        var until = new Date(dateuntil[2],parseInt(dateuntil[1])-1,parseInt(dateuntil[0]),23,59);
        
        if (scope.current > until) {
          location.href = "/backend/#/" + scope.newdate;
          return;
        }
        
        var request = {
          "date": scope.day,
          "newdate": scope.current.getDate() + '-' + (scope.current.getMonth()+1) + '-' + scope.current.getFullYear(),
        };

        $http.post('/api/backend/events/clone', request).then(function(response) {
          scope.cloneUntil();
        }, function(response) {
          console.log(response);
        });
      }
    };
  }]);
  
  app.controller('EventController', ['$http', '$scope', '$rootScope', '$routeParams', function ($http, $scope, $rootScope, $routeParams) {
    var scope = $scope;
    
    scope.remove = function() {
      $http.delete('/api/backend/event/' + scope.event.id).then(function (response) {
        scope.$parent.events.splice(scope.$parent.events.indexOf(scope.event), 1);
        $http({
          url: '/api/backend/events?date='+scope.$parent.day,
          method: 'GET'
        }).success(function(data, status, headers, config) {
          scope.$parent.events = data.data;
        });
      }, function (response) {
        console.log(response);
      });
    };
    
    scope.edit = function () {
      scope.switcher = true;
      scope.newevent = angular.copy(scope.event);
      var start = new Date(scope.newevent.start * 1000);
      var end = new Date(scope.newevent.end * 1000);
      scope.newevent.starth = start.getHours();
      scope.newevent.startm = start.getMinutes();
      scope.newevent.endh = end.getHours();
      scope.newevent.endm = end.getMinutes();
    };
    
    scope.save = function () {
      if (scope.switcher) {
        var date = scope.day.split('-');
        scope.newevent.start = (new Date(date[2],date[1].replace("0","")-1,date[0].replace("0",""),scope.newevent.starth,scope.newevent.startm)).getTime()/1000;
        scope.newevent.end = (new Date(date[2],date[1].replace("0","")-1,date[0].replace("0",""),scope.newevent.endh,scope.newevent.endm)).getTime()/1000;
        $http.put('/api/backend/event/' + scope.newevent.id, scope.newevent).then(function(response) {
          $http({
            url: '/api/backend/event/' + scope.newevent.id,
            method: 'GET'
          }).success(function(data, status, headers, config) {
            scope.event = data.data;
          });
          delete scope.newevent;
          scope.switcher = false;
        }, function(response) {
          console.log(response);
        });
      }
    };
    
    scope.cancel = function () {
      delete scope.newevent;
      scope.switcher = false;
    };
  }])
  
  app.controller('DTOptionsController', function(DTOptionsBuilder, DTColumnDefBuilder) {
    var vm = this;
    vm.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withOption('order',[[ 1, 'asc' ]]);
    vm.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2),
        DTColumnDefBuilder.newColumnDef(3),
        DTColumnDefBuilder.newColumnDef(4),
        DTColumnDefBuilder.newColumnDef(5),
        DTColumnDefBuilder.newColumnDef(6),
        DTColumnDefBuilder.newColumnDef(7)
    ];
  });

  app.controller('LoginController', ['$http', '$window', '$rootScope', '$cookies', function($http, $window, $rootScope, $cookies) {
    $rootScope.isLogin = false;
    $rootScope.user = {
      name: '',
      password: ''
    };
    $rootScope.loginmessage = '';

    if ($cookies.get('token') != null) {
      $window.sessionStorage.token = $cookies.get('token');
      $rootScope.isLogin = true;
      $rootScope.init($rootScope, $http);
    }

    $rootScope.submit = function() {
      $http.post('/api/backend/authenticate', $rootScope.user).success(function(data, status, headers, config) {
        $window.sessionStorage.token = data.token;
        $rootScope.isLogin = true;
        $rootScope.user = {
          name: '',
          password: ''
        };
        $cookies.put('token', data.token);
        $rootScope.init($rootScope, $http);
      }).error(function(data, status, headers, config) {
        delete $window.sessionStorage.token;
        $rootScope.loginmessage = 'Wrong user or password!';
        $rootScope.user = {
          name: '',
          password: ''
        };
      });
    }
  }]);
})();
