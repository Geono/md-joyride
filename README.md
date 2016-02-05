md-joyride
==========

A service that provides the "joyride" functionality for introducing your websites gracefully.

Similar to [ng-Joyride](https://github.com/abhikmitra/ng-joyride/) but looks much better.

Since [Angular Material](https://material.angularjs.org/latest/) does not provide joyride functionality, I made it myself using mdDialog.


###Demo 

![md-joyride](https://raw.githubusercontent.com/Geono/md-joyride/master/mdjoyride-pre.gif)

###Installation

Load js using script.

```html
<script src="location-of-md-joyride/md-joyride.js" type="text/javascript"></script>
```

Add mdJoyride to your module.

```sh
angular.module('myModule', ['$mdJoyride'])
```

### Starting the Joyride 

#### Invocation
You can invoke the joyride like:

```javascript
$mdJoyride.ride(param);
```

#### Parameter Example

```javascript
        var tourParamArray = [
          {
            title: 'mdJoyride',
            description: 'Want to try it',
            buttonType: 'start'
          },
          {
            title: 'Highlight',
            description: 'Highlight elements you want users to focus on',
            elementId: 'elementId',
            buttonType: 'next',
            position: 'left',
            beforeClickButtonId: 'menu-button-id'
          },
          {
            title: 'Click button if you want',
            description: 'Just by giving button ID, mdJoyride clicks the' +
                         ' button before focusing an element',
            buttonType: 'back-next',
            elementId: 'elementId2',
            position: 'bottom',
            beforeClickButtonId: 'menu-button-id2'
          }];
```

#### Parameter Explanation

@param {Array.<Object>} params

'params' should be an array, populated with objects including attributes below:

1. **title** - '{String=}' - The title of the explanation about element

2. **description** - '{String=}' - The explanation about the element

3. **buttonType** - '{String=}'

      - Button type have four options:
      
      1. start  (==> [no, thanks] [take tour] <==)
      
      2. next (==> [next] <==)
      
      3. back-next (==> [back] [next] <==)
      
      4. finish (==> [back] [got it] <==)

4. **elementId** (Optional) - '{String=}'

      - an element id which will be explained about in a dialog

5. **position** (Optional) - '{String=}'

        - The position of the dialog relative to the element. 
        
        - There are five options: 'left', 'right', 'bottom', 'top' and 'center' can be used ('center' means the middle of the screen). 
        
        - They also can be used in mix. For example, 'bottom-right' is also possible. Default position is 'center'.

6. **offset** (Optional) - '{Object=}'

        - The offset you want to give to the. e. g. { 'left': ..., 'top': ... }
        
        - It works only when elementId and position are given.
        
7. **beforeClickButtonId** (Optional) - '{number=}'

        - if 'beforeClickButtonId' is given, it clicks the button before showing a dialog.


###License

Licensed under the terms of the MIT license.
