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
if (document.readyState !== 'loading') {
  ready();
} 
else {
  document.addEventListener('DOMContentLoaded', ready);
}

function ready() {
  console.log('Ready!');  //just to make sure everything is working

  //#region for variable definitions
  const reader = new FileReader();

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
  document.getElementById('selectfitfile').addEventListener('change', function(e) { 
    //filereader version
    reader.readAsArrayBuffer( e.target.files[0] );
    reader.onload = function(ev) {
      fitParser.parse(reader.result, function (error, data) {
        if (error) {
          console.error(error);
        } 
        else {
          analyse(data);
        }
      });
    }
  })

  function analyse(data) {
    console.log(data);

    //create a div for the d3 svg
    let svgAdiv = document.createElement('div');
    document.body.appendChild(svgAdiv);
    svgAdiv.id = 'svgA';
    svgAdiv.style.height = '5rem';
    svgAdiv.style.background = 'lightblue';

    let svgA = d3.select('#svgA').append('svg').attr('width', '100%').attr('height', '100%');

    //create a data array for use by d3 line generator
    let dataArray = [];
    for (let i = 0; i < data.records.length; i++) {
      //console.log(data.records[i].speed);
      dataArray.push({x:i, y:data.records[i].speed});
    }

    //let's scale
    let margin = {top: 0, right: 0, bottom: 0, left: 0};
    let width  = svgAdiv.offsetWidth;
    let height = svgAdiv.offsetHeight;
    let minx = d3.min(dataArray.map( x => x.x ));
    let maxx = d3.max(dataArray.map( x => x.x ));
    let miny = d3.min(dataArray.map( y => y.y ));
    let maxy = d3.max(dataArray.map( y => y.y ));
    let x = d3.scaleLinear().domain([minx, maxx]).range([0, width]);
    let y = d3.scaleLinear().domain([miny, maxy]).range([height, 0]); 
    

    let line = d3.line()
      .x(function(d, i) { return x(d.x) })
      .y(function(d, i) { return y(d.y) });

    svgA.append('path').attr('fill', 'none').attr('stroke', 'blue').attr('d', line(dataArray));

  }
}


