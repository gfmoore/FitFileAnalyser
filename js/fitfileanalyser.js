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
0.0.2   22 February 2021

*/
//#endregion 

let version = '0.0.2';

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

  let margin;
  let width;
  let height;
  let minx;
  let maxx;
  let miny;
  let maxy;
  let x;
  let y;

  const graphsarea = document.getElementById('graphsarea');
  let mapdiv;
  let route = [];

  let svgSdiv;
  let svgPdiv;
  let svgHdiv;
  let svgCdiv;
  let svgAdiv;
  let svgTdiv;


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
    //clear
    graphsarea.innerHTML = null;

    console.log(data);

    doMap(data);

    doSpeed(data);
    doPower(data);
    doHeartRate(data);
    doCadence(data);
    doAltitude(data);
    doTemperature(data);

  }

  function doMap(data) {
    mapdiv = document.createElement('div');
    mapdiv.classList.add('map');
    graphsarea.appendChild(mapdiv);
    mapdiv.id = 'mapdiv';
    mapdiv.style.height = '300px';
    mapdiv.style.background = 'white';

    //create a data array of coordinates
    //let dataArray = [];
    route = [];
    for (let i = 0; i < data.records.length; i++) {
      if (data.records[i].position_lat === undefined) {  //we'll assume position_long is the same

      }
      else {
        //dataArray.push({latitude:data.records[i].position_lat, longitude:data.records[i].position_long});
        route.push([data.records[i].position_lat, data.records[i].position_long]);
      }
    }


    const map = L.map('mapdiv').setView([ route[0][0], route[0][1] ], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    //add a home marker
    L.marker([ route[0][0], route[0][1] ]).addTo(map);

    //add route to map
    let polyline = L.polyline(route, {color: 'magenta'});
    polyline.addTo(map);
  }

  function doSpeed(data) {
    //create a div for the d3 svg
    svgSdiv = document.createElement('div');
    svgSdiv.classList.add('graphs');
    graphsarea.appendChild(svgSdiv);
    svgSdiv.id = 'svgS';
    svgSdiv.style.height = '5rem';
    svgSdiv.style.background = 'lightgreen';

    let svgS = d3.select('#svgS').append('svg').attr('width', '100%').attr('height', '100%');

    //create a data array for use by d3 line generator
    let dataArray = [];
    for (let i = 0; i < data.records.length; i++) {
      if (data.records.speed > 20) console.log(i + '   ' + data.records[i].speed);
      if (data.records[i].speed === undefined) {
        dataArray.push({x:i, y:0});
      }
      else {
        dataArray.push({x:i, y:data.records[i].speed});
      }
    }

    //let's scale
    margin = {top: 0, right: 0, bottom: 0, left: 0};
    width  = svgSdiv.offsetWidth;
    height = svgSdiv.offsetHeight;
    minx = d3.min(dataArray.map( x => x.x ));
    maxx = d3.max(dataArray.map( x => x.x ));
    miny = d3.min(dataArray.map( y => y.y ));
    maxy = d3.max(dataArray.map( y => y.y ));
    x = d3.scaleLinear().domain([minx, maxx]).range([0, width]);
    y = d3.scaleLinear().domain([miny, maxy]).range([height, 0]); 
    
    //let's create the line generator
    let line = d3.line()
      .x(function(d, i) { return x(d.x) })
      .y(function(d, i) { return y(d.y) });

    //let's draw the line
    svgS.append('path').attr('fill', 'none').attr('stroke', 'blue').attr('d', line(dataArray));

    //label
    svgS.append('text').text('Speed').attr('class', 'glabel').attr('x', 5).attr('y', 12).attr('text-anchor', 'start').attr('fill', 'black').style('font-size', '0.8rem');

  }

  function doHeartRate(data) {
    //create a div for the d3 svg
    svgHdiv = document.createElement('div');
    svgHdiv.classList.add('graphs');
    graphsarea.appendChild(svgHdiv);
    svgHdiv.id = 'svgH';
    svgHdiv.style.height = '5rem';
    svgHdiv.style.background = '#f4bbff';

    let svgH = d3.select('#svgH').append('svg').attr('width', '100%').attr('height', '100%');

    //create a data array for use by d3 line generator
    let dataArray = [];
    for (let i = 0; i < data.records.length; i++) {
      if (data.records[i].heart_rate === undefined) {
        dataArray.push({x:i, y:0});
      }
      else {
        dataArray.push({x:i, y:data.records[i].heart_rate});
      }

    }

    //let's scale
    margin = {top: 0, right: 0, bottom: 0, left: 0};
    width  = svgHdiv.offsetWidth;
    height = svgHdiv.offsetHeight;
    minx = d3.min(dataArray.map( x => x.x ));
    maxx = d3.max(dataArray.map( x => x.x ));
    miny = d3.min(dataArray.map( y => y.y ));
    maxy = d3.max(dataArray.map( y => y.y ));
    x = d3.scaleLinear().domain([minx, maxx]).range([0, width]);
    y = d3.scaleLinear().domain([miny, maxy]).range([height, 0]); 
    
    //let's create the line generator
    let line = d3.line()
      .x(function(d, i) { return x(d.x) })
      .y(function(d, i) { return y(d.y) });

    //let's draw the line
    svgH.append('path').attr('fill', 'none').attr('stroke', 'blue').attr('d', line(dataArray));

    //label
    svgH.append('text').text('Heart rate').attr('class', 'glabel').attr('x', 5).attr('y', 12).attr('text-anchor', 'start').attr('fill', 'black').style('font-size', '0.8rem');
  }

  function doPower(data) {
    //create a div for the d3 svg
    svgPdiv = document.createElement('div');
    svgPdiv.classList.add('graphs');
    graphsarea.appendChild(svgPdiv);
    svgPdiv.id = 'svgP';
    svgPdiv.style.height = '5rem';
    svgPdiv.style.background = 'lightblue';

    let svgP = d3.select('#svgP').append('svg').attr('width', '100%').attr('height', '100%');

    //create a data array for use by d3 line generator
    let dataArray = [];
    for (let i = 0; i < data.records.length; i++) {
      //console.log(data.records[i].speed);
      if (data.records[i].power === undefined) {
        dataArray.push({x:i, y:0});
      }
      else {
        dataArray.push({x:i, y:data.records[i].power});
      }
    }
    //let's scale
    margin = {top: 0, right: 0, bottom: 0, left: 0};
    width  = svgPdiv.offsetWidth;
    height = svgPdiv.offsetHeight;
    minx = d3.min(dataArray.map( x => x.x ));
    maxx = d3.max(dataArray.map( x => x.x ));
    miny = d3.min(dataArray.map( y => y.y ));
    maxy = d3.max(dataArray.map( y => y.y ));
    x = d3.scaleLinear().domain([minx, maxx]).range([0, width]);
    y = d3.scaleLinear().domain([miny, maxy]).range([height, 0]); 
    
    //let's create the line generator
    let line = d3.line()
      .x(function(d, i) { return x(d.x) })
      .y(function(d, i) { return y(d.y) });

    //let's draw the line
    svgP.append('path').attr('fill', 'none').attr('stroke', 'blue').attr('d', line(dataArray));

    //label
    svgP.append('text').text('Power').attr('class', 'glabel').attr('x', 5).attr('y', 12).attr('text-anchor', 'start').attr('fill', 'black').style('font-size', '0.8rem');
  }

  function doCadence(data) {
    //create a div for the d3 svg
    svgCdiv = document.createElement('div');
    svgCdiv.classList.add('graphs');
    graphsarea.appendChild(svgCdiv);
    svgCdiv.id = 'svgC';
    svgCdiv.style.height = '5rem';
    svgCdiv.style.background = 'lightyellow';

    let svgC = d3.select('#svgC').append('svg').attr('width', '100%').attr('height', '100%');

    //create a data array for use by d3 line generator
    let dataArray = [];
    for (let i = 0; i < data.records.length; i++) {
      //console.log(data.records[i].speed);
      if (data.records[i].cadence === undefined) {
        dataArray.push({x:i, y:0});
      }
      else {
        dataArray.push({x:i, y:data.records[i].cadence});
      }
    }

    //let's scale
    margin = {top: 0, right: 0, bottom: 0, left: 0};
    width  = svgCdiv.offsetWidth;
    height = svgCdiv.offsetHeight;
    minx = d3.min(dataArray.map( x => x.x ));
    maxx = d3.max(dataArray.map( x => x.x ));
    miny = d3.min(dataArray.map( y => y.y ));
    maxy = d3.max(dataArray.map( y => y.y ));
    x = d3.scaleLinear().domain([minx, maxx]).range([0, width]);
    y = d3.scaleLinear().domain([miny, maxy]).range([height, 0]); 
    
    //let's create the line generator
    let line = d3.line()
      .x(function(d, i) { return x(d.x) })
      .y(function(d, i) { return y(d.y) });

    //let's draw the line
    svgC.append('path').attr('fill', 'none').attr('stroke', 'blue').attr('d', line(dataArray));

    //label
    svgC.append('text').text('Cadence').attr('class', 'glabel').attr('x', 5).attr('y', 12).attr('text-anchor', 'start').attr('fill', 'black').style('font-size', '0.8rem');
  }

  function doAltitude(data) {
    //create a div for the d3 svg
    svgAdiv = document.createElement('div');
    svgAdiv.classList.add('graphs');
    graphsarea.appendChild(svgAdiv);
    svgAdiv.id = 'svgA';
    svgAdiv.style.height = '5rem';
    svgAdiv.style.background = 'gainsboro';

    let svgA = d3.select('#svgA').append('svg').attr('width', '100%').attr('height', '100%');

    //create a data array for use by d3 line generator
    let dataArray = [];
    for (let i = 0; i < data.records.length; i++) {
      if (data.records[i].altitude === undefined) {
        dataArray.push({x:i, y:0});
      }
      else {
        dataArray.push({x:i, y:data.records[i].altitude});
      }
    }

    //let's scale
    margin = {top: 0, right: 0, bottom: 0, left: 0};
    width  = svgAdiv.offsetWidth;
    height = svgAdiv.offsetHeight;
    minx = d3.min(dataArray.map( x => x.x ));
    maxx = d3.max(dataArray.map( x => x.x ));
    miny = d3.min(dataArray.map( y => y.y ));
    maxy = d3.max(dataArray.map( y => y.y ));
    x = d3.scaleLinear().domain([minx, maxx]).range([0, width]);
    y = d3.scaleLinear().domain([miny, maxy]).range([height, 0]); 
    
    //let's create the line generator
    let line = d3.line()
      .x(function(d, i) { return x(d.x) })
      .y(function(d, i) { return y(d.y) });

    //let's draw the line
    svgA.append('path').attr('fill', 'none').attr('stroke', 'blue').attr('d', line(dataArray));

    //label
    svgA.append('text').text('Altitude').attr('class', 'glabel').attr('x', 5).attr('y', 12).attr('text-anchor', 'start').attr('fill', 'black').style('font-size', '0.8rem');
  }

  function doTemperature(data) {
    //create a div for the d3 svg
    svgTdiv = document.createElement('div');
    svgTdiv.classList.add('graphs');
    graphsarea.appendChild(svgTdiv);
    svgTdiv.id = 'svgT';
    svgTdiv.style.height = '5rem';
    svgTdiv.style.background = '#afeeee';

    let svgT = d3.select('#svgT').append('svg').attr('width', '100%').attr('height', '100%');

    //create a data array for use by d3 line generator
    let dataArray = [];
    for (let i = 0; i < data.records.length; i++) {
      if (data.records[i].temperature === undefined) {
        dataArray.push({x:i, y:0});
      }
      else {
        dataArray.push({x:i, y:data.records[i].temperature});
      }
    }

    //let's scale
    margin = {top: 0, right: 0, bottom: 0, left: 0};
    width  = svgTdiv.offsetWidth;
    height = svgTdiv.offsetHeight;
    minx = d3.min(dataArray.map( x => x.x ));
    maxx = d3.max(dataArray.map( x => x.x ));
    //miny = d3.min(dataArray.map( y => y.y ));
    miny = 0; //degrees C
    maxy = d3.max(dataArray.map( y => y.y ));
    x = d3.scaleLinear().domain([minx, maxx]).range([0, width]);
    y = d3.scaleLinear().domain([miny, maxy]).range([height, 0]); 
    
    //let's create the line generator
    let line = d3.line()
      .x(function(d, i) { return x(d.x) })
      .y(function(d, i) { return y(d.y) });

    //let's draw the line
    svgT.append('path').attr('fill', 'none').attr('stroke', 'blue').attr('d', line(dataArray));

    //label
    svgT.append('text').text('Temperature').attr('class', 'glabel').attr('x', 5).attr('y', 12).attr('text-anchor', 'start').attr('fill', 'black').style('font-size', '0.8rem');
  }



}


