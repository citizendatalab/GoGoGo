'use strict';

/**
 * @ngdoc directive
 * @name gogogoApp.directive:sticky
 * @description
 * # sticky
 */
angular.module('gogogoApp')
.directive('ddnStickyWrapper', ['$window', '$timeout',function($window, $timeout) {
  var stickies = [],
      height,
      scroll = function scroll() {
        //console.log(angular.element('.routesContainer').scrollTop())
        if($('.routesContainer')[0].scrollHeight != height){
          height=$('.routesContainer')[0].scrollHeight;
          stickies = [];
          $('ddn-sticky').each(function(){
            $(this).removeClass("fixed2");
            $(this).removeAttr("style");
            $(this).data('pos', $(this).position().top+angular.element('.routesContainer').scrollTop());
            stickies.push(angular.element(this));
          })
        }


        angular.forEach(stickies, function($sticky, index) {
          var sticky = $sticky[0],
              pos = $sticky.data('pos');

          if (pos <= angular.element('.routesContainer').scrollTop()) {
            var $next = stickies[index + 1],
                next = $next ? $next[0] : null,
                npos = next?$next.data('pos'):0;

            // $sticky.addClass("fixed");
            // $sticky.css('top', angular.element('.routesContainer').scrollTop()+'px');

            $sticky.addClass("fixed2");
            $sticky.css('width', $(sticky).parent().width());
            $sticky.css('top', angular.element('.routesContainer').position().top+'px');

            // var reltop = angular.element('.routesContainer').scrollTop()
             if (next && npos <= angular.element('.routesContainer').scrollTop()){
                $sticky.addClass("absolute");
                $sticky.removeClass("fixed2");
            //    $sticky.css("top",reltop + (reltop + ($(next).position().top-reltop)) - next.clientHeight + 'px');
              }

          } else {
            var $prev = stickies[index - 1],
                prev = $prev ? $prev[0] : null;

            // if (prev && pos <= angular.element('.routesContainer').scrollTop() - prev.clientHeight ) {
            //     console.log("ciao", prev.clientHeight)
            //     $prev.removeClass("absolute").removeAttr("style");
            // }else{
            //   $sticky.removeClass("fixed2");
            // }
            $sticky.removeClass("absolute").removeAttr("style");
            //$sticky.removeClass("fixed");
            $sticky.removeClass("fixed2");


           }
        });
      },
      link = function($scope, element, attrs) {
        $timeout(function () {

          height = $('.routesContainer')[0].scrollHeight;
          var sticky = element.children()[0],
              $sticky = angular.element(sticky);

          element.css('height', sticky.clientHeight + 'px');

          $sticky.data('pos', $(sticky).position().top);
          stickies.push($sticky);

          angular.element('.routesContainer').off('scroll', scroll).on('scroll', scroll);
          });

          $scope.$watch('isOpen', function(newValue, oldValue){
                if(newValue != oldValue && newValue){
                  if($(element.children()[0]).hasClass('fixed2')){
                    $(element.children()[0]).css('top', angular.element('.routesContainer').position().top+ $('.filtersCollapse').height()+'px');
                  }
                }else if(newValue != oldValue && !newValue){
                  if($(element.children()[0]).hasClass('fixed2')){
                    $(element.children()[0]).css('top', $(element.children()[0]).css('top').replace('px','')-$('.filtersCollapse').height()+'px');
                  }
                }
              })

        };

  //angular.element('.routesContainer').off('scroll', scroll).on('scroll', scroll);

  return {
    restrict: 'E',
    transclude: true,
    template: '<ddn-sticky ng-transclude></ddn-sticky>',
    link: link
  };
}]);
