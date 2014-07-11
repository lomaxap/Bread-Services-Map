var baseData = [
        {'label':'Food', 'value':50882, 'color':'#16AA8D','detail':[]},
        {'label':'Medical', 'value':10995, 'color':'#E4552F', 'detail':[
          {'label': 'Medical' , 'value': 4530+523 , 'color':'#E4552F'  },
          {'label': 'Dental' , 'value': 1448, 'color':'#e86c54'  },
          {'label': 'Enrollment' , 'value': 2806 , 'color':'#f5a292'  },
          {'label':  'Lab', 'value': 1158 , 'color':'#fbcec5'  },
          {'label': 'Other' , 'value': 430, 'color':'#f7dad4'  }
        ]},
        {'label':'Social Services', 'value':15622, 'color': '#3E749A', 'detail':[
          {'label': 'Walk-In/Intake' , 'value':2815+1161+4430+4348 , 'color':'#3E749A'  },
          {'label': 'Case Management' , 'value':1892+372  , 'color':'#7183c0'  },
          {'label': 'RepPayee' , 'value':1099  , 'color':'#a9bbf5'  },
          {'label':  'PEP', 'value':665  , 'color':'#dfe4f7'  } 
        ]},
        {'label':'Clothing', 'value': 7550, 'color': '#EEB12B','detail':[]},
         {'label':'Legal', 'value': 1321, 'color': '#f5722c', 'detail': [
          {'label':'Family Law' , 'value': 363 , 'color': '#f7aa36' },
          {'label':'Landlord/Tenant' , 'value': 583 , 'color':'#f5722c'  },
          {'label':'Other'  , 'value': 49 , 'color':'#f8ceb2'},
          {'label':'Disability', 'value': 276 , 'color':'#FFC060'},
          {'label':'Public Benefits', 'value': 50, 'color':'#f29b61'},
            ]
          }];


var w = 400,
h = 300,
r = 100,
ir = 45,
pieData,
textOffset = 14,
tweenDuration = 1000,
total,
lines,
valueLabels,
oldData,
nameLabels,
paths,
doPaths;

var donut = d3.layout.pie().value(function(d){ return d.value; });
var arc = d3.svg.arc()
  .startAngle(function(d){ return d.startAngle; })
  .endAngle(function(d){ return d.endAngle; })
  .innerRadius(ir)
  .outerRadius(r);
var vis = d3.select('#breakdown')
  .attr('width',w)
  .attr('height',h);
var arc_group = vis.append('svg:g')
  .attr('class','arc')
  .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");
var label_group = vis.append('svg:g')
  .attr('class','label-group')
  .attr('transform','translate(' + (w/2) + ',' + (h/2) + ')');
var center_group = vis.append('svg:g')
  .attr('class','center')
  .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");
var totalValue = center_group.append('svg:text')
  .attr('class','totalValue')
  .attr('dy',7)
  .attr('text-anchor','middle');
var totalLabel = center_group.append('svg:text')
  .attr('class', 'totaLabel')
  .attr('dy',-15)
  .attr('text-anchor','middle')
  .text('TOTAL')
  .style('font-weight','bolder')
  .style('font-size','10px');
var totalUnits = center_group.append('svg:text')
  .attr('class','units')
  .attr('dy',21)
  .attr('text-anchor','middle')
  .text('visits');


function sumData(array){ 
  total = 0;
  for(i=0;i<array.length;i++){ total += array[i].value; }
}

function filterData(element, index, array){

  element.per = (element.value/total)*100;
  return element.per ;

}


function chartPie(data,sel){

  sumData(data);
  oldData = pieData
  pieData = donut(data).filter(filterData);

  totalValue.text(addCommas(total))
    .style('font-size','16px')
    .style('font-weight','bold');

    if(sel==4) {
      totalUnits.text('issues');
    } else { 
      totalUnits.text('visits');
    }

    paths = arc_group.selectAll('path').data(pieData);
    doPaths = paths.enter().append('svg:path')
      .attr('stroke','black')
      .attr('stroke-width',1)
      .attr('fill', function(d){ return d.data.color; });
      

    if(oldData == null) doPaths.attr('d',arc);

      lines = label_group.selectAll('line').data(pieData);
      lines.enter().append('svg:line')
        .attr('x1', 0)
        .attr('x2',0)
        .attr('y1',-r-3)
        .attr('y2',-r-8)
        .attr('stroke','gray')
        .attr('transform', function(d){
          return 'rotate(' + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ')';
        });

      valueLabels = label_group.selectAll('text.valueLabels')
          .data(pieData).attr("dy", function(d){
            if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
              return 5;
            } else {
              return -7;
            }
          }).attr("text-anchor", function(d){
            if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
              return "beginning";
            } else {
              return "end";
            }
          }).text(function(d){
            var percentage = (d.value/total)*100;
            if(percentage >=2){
            return percentage.toFixed(1) + "%";
          } else { return '';}
          });
      
      valueLabels.enter().append("svg:text")
        .attr('class', 'valueLabels')
        .attr("transform", function(d) {
          return "translate(" + Math.cos(((d.startAngle+d.endAngle - Math.PI)/2)) * (r+textOffset) + "," + Math.sin((d.startAngle+d.endAngle - Math.PI)/2) * (r+textOffset) + ")";
        }).attr("dy", function(d){
          if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
            return 5;
          } else {
            return -7;
          }
        }).attr("text-anchor", function(d){
          if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
            return "beginning";
          } else {
            return "end";
          }
        }).text(function(d){
          var percentage = (d.value/total)*100;
          if(percentage >=2){
            return percentage.toFixed(1) + "%";
          } else { return '';}
        });

      nameLabels = label_group.selectAll("text.units").data(pieData)
        .attr("dy", function(d){
          if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
            return 17;
          } else {
            return 5;
          }
        })
        .attr("text-anchor", function(d){
          if ((d.startAngle+d.endAngle)/2 < Math.PI ) {
            return "beginning";
          } else {
            return "end";
          }
        }).text(function(d){
          var percentage = (d.value/total)*100;
          if (percentage >= 2){
          return d.data.label;
        } else {return '';}
        })
      nameLabels.enter().append("svg:text")
        .attr('class', 'units')
        .attr("transform", function(d) {
          return "translate(" + Math.cos(((d.startAngle+d.endAngle - Math.PI)/2)) * (r+textOffset) + "," + Math.sin((d.startAngle+d.endAngle - Math.PI)/2) * (r+textOffset) + ")";
        }).attr("dy", function(d){
          if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
            return 17;
          } else {
            return 5;
          }
        }).attr("text-anchor", function(d){
          if ((d.startAngle+d.endAngle)/2 < Math.PI ) {
            return "beginning";
          } else {
            return "end";
          }
        }).text(function(d){
          return d.data.label;
        });


    if(oldData != null){

        doPaths.transition()
          .duration(tweenDuration)
          .attrTween('d',pieTween)
          .attr('fill',function(d){ return d.data.color;});
        paths.transition()
          .duration(tweenDuration)
          .attrTween('d',pieTween)
          .attr('fill',function(d){ return d.data.color;})
        paths.exit()
          .transition()
          .duration(tweenDuration)
          .attrTween('d',removePieTween)
          .attr('fill',function(d){ return d.data.color;})
          .remove();

        lines.transition()
          .duration(tweenDuration)
          .attr("transform", function(d) {
            return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
          });
        lines.exit().remove();

        valueLabels.transition()
          .duration(tweenDuration)
          .attrTween("transform", textTween);
        valueLabels.exit().remove();

        nameLabels.transition()
          .duration(tweenDuration)
          .attrTween("transform", textTween);
        nameLabels.exit().remove();

    }

} //end pieCharted function




///////////////////////////////////////////////////////////
// ANIMATION FUNCTIONS ////////////////////////////////////
///////////////////////////////////////////////////////////


function pieTween(d, i) {
  var s0;
  var e0;
  if(oldData[i]){
    s0 = oldData[i].startAngle;
    e0 = oldData[i].endAngle;
  } else if (!(oldData[i]) && oldData[i-1]) {
    s0 = oldData[i-1].endAngle;
    e0 = oldData[i-1].endAngle;
  } else if(!(oldData[i-1]) && oldData.length > 0){
    s0 = oldData[oldData.length-1].endAngle;
    e0 = oldData[oldData.length-1].endAngle;
  } else {
    s0 = 0;
    e0 = 0;
  }
  var i = d3.interpolate(
      {startAngle: s0, endAngle: e0}, 
      {startAngle: d.startAngle, endAngle: d.endAngle}
    );
  return function(t) {
    var b = i(t);
    return arc(b);
  };
}

function removePieTween(d, i) {
  s0 = 2 * Math.PI;
  e0 = 2 * Math.PI;
  var a = d3.interpolate(
      {startAngle: d.startAngle, endAngle: d.endAngle}, 
      {startAngle: s0, endAngle: e0}
    );
  return function(t) {
    var b = a(t);
    return arc(b);
  };
}


function textTween(d, i) {
  var a;
  if(oldData[i]){
    a = (oldData[i].startAngle + oldData[i].endAngle - Math.PI)/2;
  } else if (!(oldData[i]) && oldData[i-1]) {
    a = (oldData[i-1].startAngle + oldData[i-1].endAngle - Math.PI)/2;
  } else if(!(oldData[i-1]) && oldData.length > 0) {
    a = (oldData[oldData.length-1].startAngle + oldData[oldData.length-1].endAngle - Math.PI)/2;
  } else {
    a = 0;
  }
  var b = (d.startAngle + d.endAngle - Math.PI)/2;

  var fn = d3.interpolateNumber(a, b);
  return function(t) {
    var val = fn(t);
    return "translate(" + Math.cos(val) * (r+textOffset) + "," + Math.sin(val) * (r+textOffset) + ")";
  };
}

function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}