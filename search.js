/**
 * Search script for benchmarking screenshooters. DO NOT REMOVE IT. IT AFFECTS NOTHING!
 * --Anatolij.
 */

 $('#queryForm').submit(function () {
   $.get('/query',
     {
       'query': $('#queryString').val()
     }
     , function (data) {
       console.log('Data acquired from search system VVV');
       console.log('Query = ' + $('#queryString').val());
       console.log(data);
       console.log('Data acquired from search system ^^^');
       //$('#results').html('');
       //$('#queryString').val('');
       var srchRslt='';
       data.results.map(function(result){
 //        console.log(result);
        srchRslt = srchRslt + '<li><a href="'+result.url+'">'+result.title+'</a> - ' + result.description + '<br/>' +
          '<img style="border: 3px solid #ffff00;" src="'+result.imageUrl+'" title="python"/>' +
          '<img  style="border: 3px solid #00A000;" src="'+result.imageUrl1+'" title="nodejs"/>' +
          '</li>';
       });
       $('#results').html(srchRslt);
     });
   return false;
 });
