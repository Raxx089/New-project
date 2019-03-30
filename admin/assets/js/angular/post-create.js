var postCreate = angular.module('postCreate', []);
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
postCreate.controller('postCreate', function ($scope,$http) {
  loader.modal('show');
  init();
  function init(){
    makeApiRequest($http, {method: 'POST', u: '/adminAuth'},
      function(err, data){
        let errors=null;
        if (err || data.errors){
          hideOtherLinks();
        }
        loader.modal('hide');
      }
    );
  }

  function hideOtherLinks(){
    $('#otherToolLinks').hide();
  }

  $scope.searchResults={values: []};
  $scope.authors={values: []};
  $scope.postForm={};
  $scope.searchString = '';
  $scope.selectedAuthor='';
  $scope.tagNames = [];
  $scope.postType = "image";
  $scope.setPostType = function(intPostType){
    if(intPostType === 1){
      $scope.postType = "card";

    } else {
      $scope.postType = "image";
    }
  }
  $scope.seachStringChanged = function(searchString){
		if( ! searchString || searchString.length==0 || $scope.invoked){
			return;
		}
		$scope.invoked=true;
		$scope.lastInvoked=Date.now();
		makeApiRequest($http,{method:'POST',u:'/q', obj: {prefix:searchString, typeContent: 1}},
		  function(err,data){
			$scope.invoked=false;
			if(!err){
				$scope.searchResults.values=data.results;
  		}
    });
	}

  $scope.getAuthors=function(skillDetails){
    if($scope.postForm['tag_details']){
      if($scope.postForm['tag_details'].length >= 2){
        showAlert('Can not add more than two tags');
        return;
      }
      $scope.tagNames.push(skillDetails.name);
      $scope.postForm['tag_details'].push({
        id:skillDetails.id,
        name: skillDetails.name
      });
    } else {
      $scope.tagNames.push(skillDetails.name);
      $scope.postForm['tag_details']=[{
        id:skillDetails.id,
        name: skillDetails.name
      }]
    }
    $scope.searchString=skillDetails.name;
    loader.modal('show');
    makeApiRequest($http, {u: '/fetchMentorForSkill', obj: {'skillName': skillDetails.name, 'skillType': skillDetails.doc_type}}, function(err, data){
      loader.modal('hide');
      var errors=err;
      if(data && data.errors)
        errors=data.errors;
      if(errors){
        showError(errors);
        return;
      }
      $scope.authors.values=data.results;
    });
  }

  $scope.authorSelected=function(author){
    $scope.selectedAuthor=author._source.name;
    $scope.postForm['author_id']=author._source.id;
  }



  $scope.uploadFile=function(){
    loader.modal('show');
    var data=new FormData();
    data.append( 'userfile', $( '#mediaUrl' )[0].files[0] );
    loader.modal('show');
    $.ajax({
      url: '/uploadFile',
      data: data,
      processData: false,
      contentType: false,
      type: 'POST',
      success: function(data){
        loader.modal('hide');
        $scope.postForm['media_url']=data.results;
      },
      error: function(err){
        loader.modal('hide');
        showError(JSON.parse(err));
        console.log(err);
      }
    });
  }

  $scope.sendRequest=function(){
    $scope.postForm['type'] = 'card';
    let mandatoryFields = ['media_url', 'author_id', 'tag_details'];

    if($scope.postType === "image"){
      mandatoryFields = ['source_url','caption','inshort','type','media_url','author_id','tag_details'];
      $scope.postForm['source_url'] = $('#sourceUrl').val();
      $scope.postForm['caption'] = $('#postHeader').val();
      $scope.postForm['inshort'] = $('#inShort').val();
      $scope.postForm['type'] = 'image';
    }

    console.log($scope.postForm);
    var errors=[];

    mandatoryFields.forEach(function(f){
      if( ! $scope.postForm[f]){
        errors.push('Mandatory Field Missing: ' + f);
      }
    });
    if(errors.length){
      showError(errors);
      return;
    }
    var alertMessage='Creating post with data: ' + JSON.stringify($scope.postForm);
    bootBoxConfirm({
      http: $http,
      showLoader: true,
      alertMessage: alertMessage,
      options: {
        u: '/postCreate',
        obj: $scope.postForm
      }
    },function(err, data){
      loader.modal('hide');
      var errors=err;
      if(data && data.errors){
        errors=data.errors;
      }
      if(errors){
        showError(errors);
        return;
      }
      showAlert('Your post has been created');
      $scope.searchResults.values==[];
      $scope.authors.values=[];
      $scope.postForm={};
      $scope.selectedAuthor='';
      $scope.searchString='';
      $scope.tagNames=[];
      return;
    });
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
