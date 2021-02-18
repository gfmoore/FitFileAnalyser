/*
Program       fitfileanalyser.js
Author        Gordon Moore
Date          15 February 2021
Description   The JavaScript code for analysing fit files
Licence       GNU General Public LIcence Version 3, 29 June 2007
*/

// #region Version history
/*
0.0.1   Initial version

*/
//#endregion 

let version = '0.0.1';

'use strict';
$(function() {
  console.log('jQuery here!');  //just to make sure everything is working

  //#region for variable definitions (just allows code folding)
  let reader = new FileReader();

  const fitParser = new FitParser({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'km',
    temperatureUnit: 'celcius',
    elapsedRecordField: true,
    mode: 'list',                  //using 'cascade' or 'both' doesn't seem to work
  });
  //#endregion 

  //select and load fit file
  $('#selectfitfile').on('change', function(e) { 

    reader.readAsArrayBuffer( e.target.files[0] );
    
    reader.onload = function(ev) {
      fitParser.parse(reader.result, function (error, data) {
        if (error) {
          console.error(error);
        } 
        else {
          //Here is the data as a JavaScript object. You can JSONify it or access the member as you need.
          console.log(data);
        }
      });
    }

  })

})

