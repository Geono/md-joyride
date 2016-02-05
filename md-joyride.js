'use strict';

function initJoyrideTargetRect($rootScope) {
  $rootScope.tourTargetRect = {
    height: -40,
    width: -40
  };
}

var guideHtml = '<div id="guide-helper">' + '<div ng-style="{' +
                '\'height\': tourTargetRect.height + 40 + \'px\',' +
                '\'left\': tourTargetRect.left  - 20 + \'px\',' +
                '\'top\': tourTargetRect.top - 20 + \'px\',' +
                '\'width\': tourTargetRect.width + 35 + \'px\'}"' +
                'ng-class="{\'hidden\': tourHidden, ' +
                '\'visible\': tourVisible}">' +
                '</div>' +
                '</div>';

var dialogHtml = '<md-dialog class="tour-dialog"' +
                 'ng-style="dialogStyle"' +
                 'aria-label="A sequence of dialogs to tour"' +
                 'ng-cloak>' +
                 '<md-dialog-content>' +
                 '<div class="no-height"' +
                 'layout="row">' +
                 '<span flex></span>' +
                 '<md-icon class="close-button"' +
                 'ng-click="answer(\'finish\')">close</md-icon>' +
                 '</div>' +
                 '<div class="md-dialog-content">' +
                 '<h3>{{title}}</h3>' +
                 '<div class="result-text">{{description}}</div>' +
                 '</div>' +
                 '</md-dialog-content>' +
                 '<md-dialog-actions layout="row">' +
                 '<span flex></span>' +
                 '<md-button class="md-primary"' +
                 'ng-if="buttonType===\'start\'"' +
                 'ng-click="answer(\'finish\')">' +
                 'no thanks' +
                 '</md-button>' +
                 '<md-button class="md-primary"' +
                 'ng-if="buttonType===\'start\'"' +
                 'ng-click="answer(\'next\')">' +
                 'take tour' +
                 '</md-button>' +
                 '<md-button class="md-primary"' +
                 'ng-if="buttonType===\'back-next\' || buttonType===\'finish\'"' +
                 'ng-click="answer(\'back\')">' +
                 'back' +
                 '</md-button>' +
                 '<md-button class="md-primary"' +
                 'ng-if="buttonType===\'next\' || buttonType===\'back-next\'"' +
                 'ng-click="answer(\'next\')">' +
                 'next' +
                 '</md-button>' +
                 '<md-button class="md-primary"' +
                 'ng-if="buttonType===\'finish\'"' +
                 'ng-click="answer(\'finish\')">' +
                 'got it' +
                 '</md-button>' +
                 '</md-dialog-actions>' +
                 '</md-dialog>';

angular.module('mdJoyride', ['ng', 'ngMaterial'])
  .factory('$mdJoyride', function($mdDialog, $timeout, $log, $q, $interval,
    $templateRequest, $sce, $compile, $rootScope, $location) {

    return {
      /**
       * @name mdJoyride#ride
       * @description
       *
       * ** NOTE ** it is hightly recommended that this function runs
       * after all the contents of a page are fully loaded
       *
       * This function shows a multiple dialogs in sequence.
       * The goal of this function is to show users several
       * buttons on the pages with brief explanations about them
       * in an effort to let them understand about the web page better.
       *
       * @param {Array.<Object>} params
       *
       * 'params' should be an array, populated with objects including
       * attributes below:
       *
       *  - 'title' - '{String=}' - title of the explanation about element
       *
       *  - 'description' - '{String=}' - explanation for element
       *
       *  - 'buttonType' - '{String=}' -
       *
       *        - button type have four options:
       *            1. start
       *            2. next
       *            3. back-next
       *            4. finish
       *
       *  - 'elementId'(Optional) - '{String=}'
       *
       *        - id of an element to be explained about
       *
       *  - 'position'(Optional) - '{String=}'
       *
       *        - the position that explanation dialog will be positioned.
       *        'left', 'right', 'bottom', 'top' can be used.
       *        They also can be used in mix. For example, 'bottom-right'
       *        is also possible.
       *        Default position is middle of the display
       *
       *  - 'offset'(Optional) - '{Object=}'
       *
       *        - the offset to be positioned
       *          { 'left': ..., 'top': ... }
       *          It works only when elementId and position are given.
       *
       *  - 'beforeClickButtonId'(Optional) - '{number=}'
       *
       *        - if it's given, it clicks the button with the given id
       *          before showing a dialog.
       *
       */
      ride: function(params) {

        $rootScope.tourVisible = true;

        if (!params) {
          $log.debug('No Tour Contents!');
          return;
        }
        initJoyrideTargetRect($rootScope);

        /* Compile 'guide-helper' div and inject it to body */
        var guideTemplate;
        var dialogTemplate;
        $log.debug($location.path());
        guideTemplate = guideHtml;
        dialogTemplate = dialogHtml;
        angular.element(document.body).append(
          $compile(guideTemplate)($rootScope));

        var tourDialogProperties = {
          template: dialogTemplate,
          controller: 'mdJoyrideCtrl',
          clickOutsideToClose: false,
          parentScroll: true,
          hasBackdrop: false,
          locals: {}
        };

        function clickButton(id) {
          return $q(function(resolve) {
            $timeout(function() {
              document.querySelector('#' + id).click();
              $timeout(function() {
                resolve('timed-out');
              }, 1000);
            }, 500);
          });
        }

        function repeatTourDialogs(paramQueue) {
          function makeTourDialogPromise(param) {

            function openDialog() {
              return $mdDialog.show(
                _.assign(tourDialogProperties, {
                  locals: {
                    'title': param.title,
                    'description': param.description,
                    'buttonType': param.buttonType,
                    'elementId': param.elementId,
                    'position': param.position,
                    'offset': param.position
                  }
                })
              );
            }

            /* Set tour guide helper to the button before click */
            if (param.beforeClickButtonId) {
              var buttonElement = document.querySelector(
                '#' + param.beforeClickButtonId);
              if (buttonElement) {
                $rootScope.tourTargetRect =
                  angular.element(buttonElement)[0]
                    .getBoundingClientRect();

                if ($rootScope.tourTargetRect.height === 0 &&
                    $rootScope.tourTargetRect.width === 0) {
                  initJoyrideTargetRect($rootScope);
                }
              }

              /*
               *  $timeout is used here in an effort to execute
               *  beforeFunc() safely, not disturbing digest phase which
               *  is already running.
               *  See: http://stackoverflow.com/a/18996042/1046694
               */
              return $timeout(function() {
                return clickButton(param.beforeClickButtonId).then(
                  function() {
                    var hideMenu = $interval(function() {
                      var dialogContainer = document.querySelector(
                        '.md-dialog-container');
                      $log.debug('dialogContainer: ', dialogContainer);
                      if (dialogContainer) {
                        angular.element(dialogContainer).append(
                          document.querySelector('.md-menu-backdrop'));
                        $interval.cancel(hideMenu);
                      }
                    }, 1000);
                    return openDialog();
                  });
              });
            } else {
              return openDialog();
            }
          }

          function recursiveDialogOpen(dialogArray, idx, promise) {
            $log.debug('Queue length: ', dialogArray.length);
            promise.then(function(value) {
              $log.debug('Original index: ', idx);
              var param = {
                'next': function(dialogArray) {
                  return ((++idx >= 0) && (idx < dialogArray.length)) ?
                         dialogArray[idx] : null;
                },
                'back': function(dialogArray) {
                  return ((--idx >= 0) && (idx < dialogArray.length)) ?
                         dialogArray[idx] : null;
                },
                'finish': function() {
                  return null;
                }
              }[value](dialogArray);
              if (param) {
                recursiveDialogOpen(dialogArray, idx,
                  makeTourDialogPromise(param));
              } else {
                $rootScope.tourVisible = false;
                $timeout(function() {
                  document.querySelector('#guide-helper').remove();
                }, 1000);
              }
            });
          }

          (function startDialogsChain(dialogArray) {
            var idx = 0;
            var param = dialogArray[idx];
            recursiveDialogOpen(dialogArray, idx,
              makeTourDialogPromise(param));
          })(paramQueue);
        }

        repeatTourDialogs(params);
      }
    };
  })
  .controller('mdJoyrideCtrl',
    function($scope, $rootScope, $log, $mdDialog, $q, $window, $mdMedia,
      $timeout, title, description, elementId, position, buttonType, offset) {

      var unregieterGuideWatch = $scope.$watch(function() {
        return document.querySelector('body > #guide-helper');
      }, function() {
        $log.debug(' *** watch guide-helper!: ', document.querySelector(
          'body > #guide-helper'));
        angular.element(document.querySelector('.md-dialog-container')).append(
          document.querySelector('#guide-helper'));
        unregieterGuideWatch();
      });

      $scope.$watch(function() {
        return document.querySelector('body > .md-open-menu-container');
      }, function() {
        $log.debug(' *** watch menu!: ', document.querySelector(
          'body > .md-open-menu-container'));
        angular.element(document.querySelector('.md-dialog-container'))
          .append(document.querySelector('body > .md-open-menu-container'));
      });

      $scope.title = title;
      $scope.description = description;

      $scope.answer = function(answer) {
        angular.element(document.body).append(
          document.querySelector('#guide-helper'));
        var openedMenu = document.querySelector('.md-menu-backdrop');
        if (openedMenu) {
          /* If a menu is being opened, close it */
          $timeout(function() {
            /* $timeout is used here to execute 'click()'
             safely in the next digest phase */
            openedMenu.click();
          });
        }
        $log.debug('Controller answer:', answer);
        $mdDialog.hide(answer);
      };

      $scope.buttonType = buttonType;

      var contentWidth = 260;
      var contentMaxHeight = 170;

      $scope.dialogContentStyle = {
        'width': contentWidth + 'px',
        'max-height': contentMaxHeight + 'px'
      };

      if (elementId) {
        $scope.$watch(function() {
          return $window.innerWidth;
        }, function(value) {
          var targetElement = document.querySelector('#' + elementId);
          if (targetElement) {
            $rootScope.tourTargetRect = angular.element(targetElement)[0]
              .getBoundingClientRect();

            if ($rootScope.tourTargetRect.height === 0 &&
                $rootScope.tourTargetRect.width === 0) {
              initJoyrideTargetRect($rootScope);
            }
            $log.debug('tourTargetRect: ', $rootScope.tourTargetRect);

            if (position && position !== 'center') {
              $log.debug('- Absolute position routine -');

              $scope.dialogStyle = {
                'position': 'absolute',
                'left': $rootScope.tourTargetRect.left,
                'top': $rootScope.tourTargetRect.top,
                'width': contentWidth,
                'min-height': contentMaxHeight
              };
              if (position.indexOf('bottom') > -1) {
                $scope.dialogStyle.top +=
                  ($rootScope.tourTargetRect.height + 40);
              }
              if (position.indexOf('top') > -1) {
                $scope.dialogStyle.top -= (contentMaxHeight + 40);
              }
              if (position.indexOf('left') > -1) {
                $scope.dialogStyle.left -= (contentWidth + 40);
              }
              if (position.indexOf('right') > -1) {
                $scope.dialogStyle.left +=
                  ($rootScope.tourTargetRect.width + 40);
              }
              $scope.dialogStyle =
                _.mapValues($scope.dialogStyle, function(value, key) {
                  if (key === 'position') {
                    return value;
                  } else {
                    return value + 'px';
                  }
                });
              $log.debug('dialogStyle: ', $scope.dialogStyle);
            }
          } else {
            initJoyrideTargetRect($rootScope);
          }
          if (offset && offset.top) {
            $scope.dialogStyle.top += offset.top;
          }
          if (offset && offset.left) {
            $scope.dialogStyle.left += offset.left;
          }
          $log.debug(' -> Watch innerWidth: ', value);
        });
      } else {
        initJoyrideTargetRect($rootScope);
        $log.debug('tourTargetRect: ', $rootScope.tourTargetRect);
      }
    });
