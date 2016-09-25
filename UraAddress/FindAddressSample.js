/*!
 * Find Address for map smple v1.0
 *
 * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Copyright 2016 syany
 * Dual licensed under the MIT or GPL Version 3 licenses.
 * Date: 2016-09-19
 */
;(function($, window) {
   $(function() {
     var subWindow,
     subWidth = 720,
     subHeight = 405;
     var subLeft = Number((window.screen.width - subWidth) / 2),
     subTop = Number((window.screen.height - subHeight) / 2);
     $('#search4map').on('click', function(event){
       subWindow = window.open('FindAddress4Map.html', 'findAddress4Map', 'width=' + subWidth +
           ', height=' + subHeight + ', top='+ subTop + ', left=' + subLeft + 'status=no, ' +
           'scrollbars=yes, directories=no, menubar=no, resizable=no, toolbar=no');
     });
   });
})(jQuery, window);