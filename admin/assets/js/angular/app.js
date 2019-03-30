var app = angular.module('app', []);
/*
postCreate.directive('fileModel', ['$parse', function ($parse) {
  return {
     restrict: 'A',
     link: function(scope, element, attrs) {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;

        element.bind('change', function(){
           scope.$apply(function(){
              modelSetter(scope, element[0].files[0]);
           });
        });
     }
  };
}]);
*/
app.controller('app', function ($scope,$http) {
  loader.modal('show');
  $scope.loggedIn = 0;
  $scope.logginActive = 0;
  $scope.results = {users:[]};
  $scope.name = "";
  $scope.signupActive = 0;
  $scope.page = 0;
  init();
  function init(){
    makeApiRequest($http, {method: 'POST', u: '/checkloggedin'},
      function(err, data){
        let errors=null;
        if(err)
          errors=err;
        if(data.errors)
          errors=data.errors;
        if(errors){
          loader.modal('hide');
          //showError(JSON.stringify(errors));
          $scope.logginActive = 1;
          $scope.signupActive = 0;
          return;
        }
        $scope.loggedIn = 1;
        $scope.name = data.userInfo.name;
        fetchUsers();
      }
    );
  }

  function fetchUsers(){
    makeApiRequest($http, {method: 'POST', u: '/fetchuser', obj:{p: $scope.page}},
      function(err, data){
        loader.modal('hide');
        let errors=null;
        if(err)
          errors=err;
        if(data.errors)
          errors=data.errors;
        if(errors){
          showError(JSON.stringify(errors));
          return;
        }
        $scope.results.users = data.results;
        console.log($scope.results.users);
      }
    );
  }

  $scope.login = function(){
    let username = $('#loginusername').val();
    let pass = $('#loginpass').val();
    if( ! username){
      showAlert("Username needed");
      return;
    }
    if( ! pass){
      showAlert("Password needed");
      return;
    }
    makeApiRequest($http, {method: 'POST', u: '/login', obj: {
      username: username,
      pass: pass
    }},
      function(err, data){
        let errors=null;
        if(err)
          errors=err;
        if(data.errors)
          errors=data.errors;
        if(errors){
          loader.modal('hide');
          showError(JSON.stringify(errors));
          $scope.logginActive = 1;
          $scope.signupActive = 0;
          return;
        }
        $scope.logginActive = 0;
        $scope.signupActive = 0;
        $scope.loggedIn = 1;
        $scope.name = data.userInfo.name;
        fetchUsers();
      }
    );
  }

  $scope.signup = function(){
    let username = $('#usernamesignup').val();
    let name = $('#namesignup').val();
    let pass = $('#passsignup').val();
    if( ! username){
      showAlert("Username needed");
      return;
    }
    if( ! pass){
      showAlert("Password needed");
      return;
    }
    if( ! name){
      showAlert("Name needed");
      return;
    }
    loader.modal('show');
    makeApiRequest($http, {method: 'POST', u: '/signup', obj: {
      username: username,
      pass: pass,
      name: name
    }},
      function(err, data){
        loader.modal('hide');
        let errors=null;
        if(err)
          errors=err;
        if(data.errors)
          errors=data.errors;
        if(errors){
          loader.modal('hide');
          showAlert(errors);
          $scope.logginActive = 1;
          $scope.signupActive = 0;
          return;
        }
        showAlert("Sign up done, please login");
        $scope.logginActive = 1;
        $scope.signupActive = 0;
      }
    );
  }
  $scope.toggleform = function(state){
    if(parseInt(state) === 1){
      $scope.logginActive = 0;
      $scope.signupActive = 1;
    } else {
      $scope.logginActive = 1;
      $scope.signupActive = 0;
    }
  }
  $scope.prevPage = function(){
    if($scope.page === 0){
      showAlert("No previous page exists");
      return;
    }
    $scope.page =  $scope.page -1;
    loader.modal('show');
    fetchUsers();
  }

  $scope.nextPage = function(){
    $scope.page =  $scope.page +1;
    loader.modal('show');
    fetchUsers();
  }
  $scope.logout = function(){
    setCookie("site_token", "", 0);
    location.reload();
  }

  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
});

var loadMessage='<div class="text-center" style="font-size:36px;color:#228be6"><strong><i class="fa fa-spin fa-spinner"></i></strong>  loading...</i></strong></div>';
var loader= bootbox.dialog({message: loadMessage, closeButton:false});
loader.modal('hide');

var bootBoxErrorObj = {'title' : 'Error', 'message': '', 'backdrop': true};

function showError(error){
  bootBoxErrorObj.message = error;
  bootbox.alert(bootBoxErrorObj);
}

var bootBoxAlertObj = {'title': 'Alert !!', 'message': '', 'backdrop': false};

function showAlert(alertMessage){
  bootBoxAlertObj.message = alertMessage;
  bootbox.alert(bootBoxAlertObj);
}

function makeApiRequest(http, options, callback){
  if ( ! options.u) {
    callback(['Invalid Request'], null);
    return;
  }
  var httpObj = {
    'method': options.method ? options.method : 'POST',
    'url': options.u
  };
  if (options.obj) {
    httpObj.data = options.obj;
  }

  httpObj.headers = {'Content-Type': 'application/json'};

  http(httpObj).then(function (data) {
    callback(null, data.data);
    return;
  }, function (data) {
    callback(data, null);
    return;
  });
}

function bootBoxConfirm(options, callback){

  bootbox.confirm({
    title: "Confirmation !!",
    message: options.alertMessage,
    buttons: {
      cancel: {
        label: '<i class="fa fa-times"></i> Cancel',
        className: 'sv-blue-btn-sm'
      },
      confirm: {
        label: '<i class="fa fa-check"></i> Confirm',
        className: 'sv-orange-btn-sm'
      }
    },
    callback: function (result) {
      if (result) {
        if (options.showLoader){
          loader.modal('show');
        }
        makeApiRequest(options.http, options.options, callback);
      }
    }
  });
}
