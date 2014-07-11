var yoffset = ($(document).height()-682)/12165,
    xoffset = ($(document).width() - 1366)/6056;


var $nbhd = $('#nbhd_name'),
    nbhd_names,
    baseData,
    layerData,
    currentData,
    selected = 0, //index of selected department -- 0: all, 1: medical, 2: Social 3: Legal
    departmentData = ['SUMTot', 'SUMMed', 'SUMSocial', 'SUMCloth', 'SUMLegal'],
    color,
    highletedHood,
    mapStick = false, 
    other_data = {"Nest Egg": "Other Data", "Data":[]};


var baseMap = 'examples.map-20v6611k',//'lomaxrx.map-9za9bkp7',
    map = L.mapbox.map('map', baseMap, 
      { minZoom:10, 
        maxBounds: [[38.61,-77.5],[39.23, -75.6]]
      }).setView({
        lat: 38.90+xoffset,
        lon: -76.96+yoffset
      }, 12);
    
var geocodeUrl = 'http://maps.googleapis.com/maps/api/geocode/json?address=',
    params = '&sensor=false',
    url,
    latlng;


$(document).ready(function(){
    $(this).on({
      ajaxStart: function() { $('body').addClass("loading");    },
      ajaxStop: function() { $('body').removeClass("loading"); }    
    });
    $.ajax({
      type: 'GET',
      url: '/assets/data/hoods.json', 
      dataType: 'json',
      success: initMap,
      error: function(e){ 
        console.log(e);
        $('body').removeClass("loading");
      } 
    }); 

});


function initMap(hoods){
  console.log(hoods);
  nbhd_names = hoods.nbhd_names
  
  tracts = L.geoJson(hoods.layerData,{
      style : style,
      onEachFeature: onFeature
  }).addTo(map);

  defineColor();
  chartPie(baseData); 
  defineHooks();

}

function defineHooks(){
  

  $('.view_details').click(function(){
    $('#details').toggle('show');
    $('.triangle').toggle();
  });


  $('li.details').click(function(){
    $('.viewing').removeClass('viewing');
    $(this).addClass('viewing');
    var selClass = $(this).attr('id');
    $('div.' + selClass).toggleClass('viewing');
  });

  $('#help').click(function(){
    $('.instructions').toggle();
    $('#help .hidden').toggle();
  });

  $('#address').typeahead({
    name: 'searchood',
    local:nbhd_names,
    limit:0 
   });
  
  $('li.program').click(function(){

    $('li.selected').removeClass('selected');
    $(this).addClass('selected');
    
    selected = parseInt($(this).attr('id'));

    if(!mapStick){
      if(selected!=0){
        chartPie(baseData[selected].detail,selected);
      } else {
        chartPie(baseData,selected);
      }

      $('#nbhd_name').html('Washington, DC') 
    
    } else {
      aggregateData(layerData);
    }
      
    defineColor();
  
  });

}


//////////////////////
///style functions///
////////////////////

function onFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: stick
    });

    var content = definePopupContent(feature.properties);
    layer.bindPopup(content);
}

  function defineColor(){
    if(selected == 0){
      color = d3.scale.linear()
        .domain([0,250,500,1000,1500,2000,2500,3000])
        .range(colorbrewer.BuGn[9]);
    } else if(selected == 1){
      color = d3.scale.linear()
        .domain([0,100,200,300,400,500,600,700,1000])
        .range(colorbrewer.BuGn[9]);
    } else if(selected == 2){
      color = d3.scale.linear()
        .domain([0,50,100,200,300,400,500,600,700])
        .range(colorbrewer.BuGn[9]);
    } else if(selected == 4){
      color = d3.scale.linear()
        .domain([0,5,10, 20,30,40,50,60,70])
        .range(colorbrewer.BuGn[9]);
    }

    tracts.eachLayer(function(e){
      d3.select(e._path)
        .attr('fill',color(e.feature.properties[departmentData[selected]]));
      
      e.setStyle({
        fillColor: color( e.feature.properties[departmentData[selected]]) 
      });
     });
  }

  function style(e) {
    return {
      weight: 1,
      color:'black',
      opacity: 1,
      fillOpacity: 0.4,
    }
  }

  function highlightFeature(e) {
    if(!mapStick){
      if(highletedHood != undefined ){ 
        resetHighlight(highletedHood); 
        if(highletedHood._popup != undefined){
          if(highletedHood._popup._isOpen)highletedHood.closePopup();
        } 
      }

      //some layers have a target others don't. why?
      var layer = e.target == undefined ? e : e.target; 
      highletedHood = layer;
      layerData = layer.feature.properties;

      layer.setStyle({
        weight: 10,
        opacity: 1,
        color: '#09F',
        fillColor:color( layerData[departmentData[selected]])
      });
     
      $nbhd.html(layerData.hood);
      aggregateData(layerData);
    }
  }
  
  function resetHighlight(e) {
    if(!mapStick){
      var layer = e.target == undefined ? e : e.target;
      layer.setStyle({
        weight: 1,
        color: 'black',
        opacity: 1,
      })
    }
  }

  function stick(e){

    var layer = e.target == undefined ? e : e.target;

    //unstick if clicked nbhd is not highlighted
    if(highletedHood._leaflet_id == layer._leaflet_id){
      mapStick = !mapStick
    } else {
      mapStick = false;
      highlightFeature(layer);
      mapStick = true;  
    }

    if(mapStick){
      layer.setStyle({color:'#77cc33'});
    } else {
      layer.setStyle({color:'#09F'});
    }
    
    tweet(layerData);
  }

  function definePopupContent(d){

    if(d.SUMTot != null && d.SUMTot != 0){
      var population = addCommas(Math.round(d.COUNT + d.SUMChild)),
      aveincome = "$" + addCommas(Math.round(d.MEANlInc * 12)) + '/year',
      family = Math.round(d.MEANHChild * 100) + '%',
      child = Math.round(d.MEANChild),
      age = Math.round(d.MEANAge2),
      fem = Math.round(100 - d.MEANSex * 100) + '%',
      male = Math.round(d.MEANSex * 100) + '%,'
      stamps = Math.round(d.MEANStamps * 100) + '%',
      cell = Math.round(d.MEANCell * 100) + '%',
      rent = '$' + Math.round(d.MEANRent) + '/month',
      unenrolled = Math.round(100 - d.MEANInsur * 100),
      pubhousing = Math.round(d.MEANPHouse * 100),
      odata = {
        "Hood":d.hood,
        "ClientPopulation": population, 
        "Visits": d.SUMTot, 
        "AverageIncome": aveincome,
        "AverageRent": rent, 
        "%inPublicHousing":pubhousing,
        "%Families": family, 
        "AverageAge": age, 
        "%Female":fem, 
        "%Male": male, 
        "%onFoodStamps":stamps,
        "%withCellPhone": cell, 
        "%withoutHealthInsurance": unenrolled
      };

      other_data.Data.push(odata);

      var content = "<span class='connm'>" + d.hood + "</span><br/>"
        + "<span class='conlbl'>Client Population:</span> " + population + "<br/>"
        + "<span class='conlbl'>Average Income:</span>  " + aveincome + "<br/>"
        + "<span class='conlbl'>Average Age:</span>  " + age + "<br/>";
    } else {
      var content = "<span class='connm'> There were no visits from this area </span><br/><br/>"
    }
      
    return content;
  }

////////////////
///geocoding///
//////////////

function search(){
  
  var address = $('#address').val().replace(' ','+') + 'Washington+DC';
  url = geocodeUrl + address + params;

  $.ajax({
    type: 'GET',
    global: false,
    url: url, 
    dataType: 'json',
    success: searchResult,
    error: function(e){ console.log(e);} 
  }); 
}; 


function searchResult(d){
   
    if(d.status == "OK"){
      if(d.results[0].formatted_address != "Washington, DC, USA"){
        var location = d.results[0].geometry.location,
        latlng = new L.LatLng(location.lat,location.lng);
        panning(latlng,15);
      } else {
        $('#searching').effect('shake',{distance:5,times:2});
      }
    } else {
      $('#searching').effect('shake',{distance:5,times:2});
    }
};

function panning(ltlg,z){
    var poly = leafletPip.pointInLayer(ltlg, tracts)[0];
    var data = poly.feature.properties;
    
    if(poly == undefined){
      $('#searching').effect('shake',{distance:5,times:2});

    } else if(data.hood == 'Ellipse'){
      $('#searching').effect('shake',{distance:5,times:2});

    } else {

      map.panTo(ltlg);

      mapStick = false;
      
      highlightFeature(poly);
      stick(poly);
      
      //something weird with where to call openPopup in leaflet
      if(poly._layers != undefined){ 
        poly._layers[37].openPopup();
      }
      else { 
        poly.openPopup(ltlg); 
      }
      
      tweet(data);
    }
}

  function tweet(d){

    var $gos = $('#giveorshare'),
    pop = d.COUNT + d.SUMChild,
    visits = d.SUMTot,
    txt = 'Bread for the City helped <b>' + pop + '</b> people from your neighborhood <b>' + visits + '</b> times';
    txt2 = 'In the last year, @BreadfortheCity helped ' + pop + ' people from my neighborhood ' + visits + ' times!';


    if(visits != null && visits != 0){
      $('li.yourhooddata').html(txt);
    } else {
      $('li.yourhooddata').html('There were no visits from this area.');
      txt2 = '';
    }

    $('.twitter-share-button').remove();
    var tweetBtn = $('<a></a>')
        .addClass('twitter-share-button')
        .attr('href', 'http://twitter.com/share')
        .attr('data-size', 'large')
        .attr('data-dnt', 'true')
        .attr('data-count', 'none')
        .attr('data-text', txt2);
    
    $('li.share').append(tweetBtn);
    
    twttr.widgets.load();
    
    if($gos.is(':hidden')) $gos.effect('slide',{ direction:'right' });
  }


////////////////////
///pie functions///
//////////////////


function aggregateData(d){
   
    var hoodName = d.hood,
    visits = d.SUMTot,
    
    //social\\
    nwwalk = d.SUMNWW,
    sewalk = d.SUMSEW,
    nwint = d.SUMNWInt,
    seint = d.SUMSEInt,
    rep = d.SUMRPP,
    pep = d.SUMPEP,
    nwcm = d.SUMNWCM,
    secm = d.SUMSECM,

    ssnw = nwwalk + nwint,
    ssse = sewalk + seint,
    walkin = ssnw + ssse,
    case_m = nwcm + secm;
    social = walkin + case_m + rep + pep, 
    
    //medical\\
    adult = d.SUMAdult,
    ped = d.SUMPed,
    medi = adult + ped,
    dent = d.SUMDent,
    ben = d.SUMEnr,
    mother = d.SUMMOth,
    lab = d.SUMLab,
    medical = d.SUMMed,
    
    //food\\
    nwfood = d.SUMNWFood,
    sefood = d.SUMSEFood,
    food = nwfood + sefood,
    
    //legal\\
    law_fam = d.SUMFamL,
    law_land = d.SUMLanTen,
    law_disa = d.SUMDisa,
    law_pb = d.SUMPBen,
    law_other = d.SUMOPrac,

    lother = law_disa + law_other + law_pb,
    legal = lother + law_land + law_fam,

    clothing = d.SUMCloth;

    currentData = [
        {'label':'Food', 'value': food, 'color':'#16AA8D', 'detail': [
          {'label':'NW', 'value': nwfood} , 
          {'label':'SE', 'value': sefood }
        ]},
        {'label':'Medical', 'value': medical, 'color':'#E4552F', 'detail':[
          {'label':'Medical'  , 'value': medi  , 'color':'#E4552F'},
          {'label':'Dental'  , 'value': dent , 'color':'#e86c54'  },
          {'label':'Enrollment'  , 'value': ben  , 'color':'#f5a292'  },
          {'label':'Lab'  , 'value': lab , 'color':'#fbcec5'  },
          {'label':'Other', 'value':mother  , 'color':'#f7dad4' }
        ]},
        {'label':'Social Services', 'value':social, 'color': '#3E749A', 'detail':[
          {'label':'Walk-In/Intake', 'value': walkin  , 'color':'#3E749A', 'detail': [
            {'label':'NW', 'value':ssnw }, 
            {'label':'SE', 'value':ssse }
          ]},
          {'label':'Case Management'  , 'value':case_m  , 'color':'#7183c0', 'detail': [
            {'label':'NW', 'value':nwcm}, 
            {'label':'SE', 'value':secm }
          ]},
          {'label':'RepPayee'  , 'value': rep  , 'color':'#a9bbf5'  },
          {'label':'PEP'  , 'value': pep  , 'color':'#dfe4f7'  }
        ]},
        {'label':'Clothing', 'value': clothing, 'color': '#ebdd3a'},
         {'label':'Legal', 'value': legal, 'color': '#f5722c', 'detail': [
          {'label':'Family Law' , 'value': law_fam , 'color': '#f7aa36' },
          {'label':'Landlord/Tenant' , 'value': law_land , 'color':'#f5722c'  },
          {'label':'Other'  , 'value': law_other , 'color':'#f8ceb2'},
          {'label':'Disability', 'value': law_disa, 'color':'#FFC060'},
          {'label':'Public Benefits', 'value': law_pb, 'color':'#f29b61'}
  
          ]}
        ];
    
    if(selected!=0) currentData = currentData[selected].detail;  
  
    chartPie(currentData,selected);
}




