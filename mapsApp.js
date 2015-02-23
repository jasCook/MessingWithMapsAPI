	var formOptions = "<div id = 'fm_l'>" + 
		"<form id = 'f_entry'>" +
		"<p id = 'h_title'>Title</p>" +
		"<input type='text' id = 'f_title'/><br/>" +
		"<span>URL of image:<br/></span><input type = 'text' id= 'f_img' /><br/>"+
		"<span>What's Interesting About Here:<br/></span><textarea type = 'text' id = 'f_story' style='rows: 7; resize:none;'></textarea><br/>" +
        "<button type = 'button' id = 'f_button' onclick = 'add_marker()'>Add Info!</button>"+
		"</form></div>";
		
		
	var infoWindow;
	var map;
	var marker_dat = {marker : [], content:[] , event: []};
	var curr_marker =  null;
	
	var animations = (function(){
		var m_hover = null;
		var time_ref = null;
	
		return { 
			startAni : function(curr){
				if (time_ref != null){
					if(m_hover != curr){
						clearTimeout(time_ref);
						m_hover.setAnimation(null);
					}
				}
				m_hover = curr;
				m_hover.setAnimation(google.maps.Animation.BOUNCE);
				time_ref = setTimeout(function(){m_hover.setAnimation(null)},2000);
			}
		};
	})();
		
      function initialize() {
	  
        var mapOptions = {
          center: new google.maps.LatLng(38.9854, -76.9424),
          zoom: 15
        };
        map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);
			
		infoWindow = new google.maps.InfoWindow({
			content: formOptions
		});
	
		google.maps.event.addListener(map, "rightclick", function(event){ 
			if (curr_marker !== null){
				curr_marker.setMap(null);
				curr_marker = null;
			}
			add_story(event.latLng.lat(),event.latLng.lng()) 
			});
		
			
		req_data(100);
		load_data(100);
		
}

	
	//adds new data to map and adds data to database
	function add_story(lat,lng){
		
		curr_marker = new google.maps.Marker({
			position: new google.maps.LatLng(lat,lng),
			map: map,
			title: 'Add New Story!'
			});
			
		infoWindow.open(map, curr_marker); 
		//removes the marker if user presses x in infoWindow
		google.maps.event.clearInstanceListeners(infoWindow);
		google.maps.event.addListener(infoWindow, 'closeclick', function(){
			curr_marker.setMap(null);
			curr_marker = null;
		});
	}

	// function called when the submit button on form is pressed
	function add_marker(){
	
		var desc = document.getElementById("f_story").value;
		var m_title = document.getElementById("f_title").value;
		var  m_img =  document.getElementById("f_img").value;
		
		if(desc === "" || m_title === "" || m_img === ""){
			alert("Please fill out all fields");
			return;
		}
		var data = "<div id = 'm_content' style ='width:200px; height:100%; max-height:400px;'>" + 
		"<h3 id = 'head_title'>" + m_title + "</h3>" +
		"<img id = 'm_img' height = '150px' width = '150px' src= ' " + m_img + " ' />" +
		"<p id = 'm_story'>"+ desc +"</p>" +
		"</div>";
		var iContent = new google.maps.InfoWindow({
			tg: true,
			content : data });
		
		if (curr_marker !== null){
			curr_marker.setTitle(m_title);
			//curr_marker.setPosition(infoWindow.getPosition()); 
		}else{
			alert("An error occured please try again");
		}
		
		infoWindow.close();
		save_data(m_img,desc);
		
		marker_dat.event.push (function(i_content,curr) {
			google.maps.event.addListener(curr, "click" , function() { iToggle(i_content,curr) })
			}(iContent,curr_marker)
			);
		marker_dat.marker.push(curr_marker);
		marker_dat.content.push(iContent);
		/*}else{
			curr_marker.setMap(null);
			curr_marker = null;
			
		}*/
		
	}
	
	//toggles infoWindow between open and close
	function iToggle(cont, marker){
		if (cont.tg === true) {
			cont.open(map,marker);
			cont.tg = false;
		}else {
			cont.close();
			cont.tg = true;
		}
	}
	
	function req_data(d_size){
	var xmlhttp;
		if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
		  xmlhttp=new XMLHttpRequest();
		}else{// code for IE6, IE5
		  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		
		//xmlhttp request
		xmlhttp.open("POST","http://localhost/mapsApp/my_response.php",true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlhttp.send("sz=" + d_size);
		
		//xmlhttp response
		xmlhttp.onreadystatechange=function(){
	  if (xmlhttp.readyState==4 && xmlhttp.status==200){
			document.getElementById("side-col").innerHTML=xmlhttp.responseText;
		}
	  }
	}
	
	function save_data(image,desc){
		//ajax send
		
		if (curr_marker !== null){
			var xmlhttp;
			var s_obj = {
				title: curr_marker.getTitle(),
				image: image,
				desc: desc,
				lat: curr_marker.getPosition().lat(),
				lon: curr_marker.getPosition().lng()
			};
			
			if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
			  xmlhttp=new XMLHttpRequest();
			}else{// code for IE6, IE5
			  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			
			//xmlhttp request
			xmlhttp.open("POST","http://localhost/mapsApp/my_response.php?rq=save",true);
			xmlhttp.setRequestHeader("Content-type","application/json; charset=UTF-8");
			xmlhttp.send(JSON.stringify(s_obj));
			
			xmlhttp.onreadystatechange = function(){
				if(xmlhttp.readyState==4 && xmlhttp.status == 200){
					var txt = xmlhttp.responseText;
					txt = txt.replace(/^\s+/, '').replace(/\s\s*$/, '');
					if ( txt.valueOf() !== "0" ){
						alert("An Error Occured (onreadystatechange): " + txt);
						console.log("|"+txt+"|");
						curr_marker.setMap(null);
						curr_marker = null;
					}else{
						//refresh_data()
					}
				}
				
			}
			
		}else{
			alert("An Error Occured!");
			curr_marker.setMap(null);
			curr_marker = null;
		}
	}
	
	function load_data(d_size){
		var xmlhttp;
		if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
		  xmlhttp=new XMLHttpRequest();
		}else{// code for IE6, IE5
		  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		
		//xmlhttp request
		xmlhttp.open("POST","http://localhost/mapsApp/my_response.php?rq=load",true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlhttp.send("sz=" + d_size);
		
		//xmlhttp response
		xmlhttp.onreadystatechange=function(){
	  if (xmlhttp.readyState==4 && xmlhttp.status==200){
			var txt = xmlhttp.responseText;
			var ret_object ;
			
			try{
			ret_object = JSON.parse(txt);
			}catch (e){
				alert(txt);
			}
			
			for (var i = 0; i < ret_object.length; i++){
				var desc = ret_object[i].Desc;
				var m_title = ret_object[i].Title;
				var  m_img =  ret_object[i].Img;
				var data = "<div id = 'm_content' style ='width:275px; height:100%; max-height:400px; word-wrap:break-word; overflow:auto;'>"  +
				"<h3 id = 'head_title'>" + m_title + "</h3>" +
				"<img id = 'm_img' height = '150px' width = '150px' src= ' " + m_img + " ' />" +
				"<p id = 'm_story' >"+ desc +"</p>" +
				"</div>";
				var curr_marker = new google.maps.Marker({
					position: new google.maps.LatLng(ret_object[i].Lat, ret_object[i].Lon),
					map: map,
					title: m_title
				});
				
				var iContent = new google.maps.InfoWindow({
					tg: true,
					content : data });
					
				marker_dat.event.push (function(i_content,curr) {
					google.maps.event.addListener(curr, "click" , function() { iToggle(i_content,curr) })
					}(iContent,curr_marker)
					);
				marker_dat.marker.push(curr_marker);
				marker_dat.content.push(iContent);
			}
		}
	  }
	}
	
	function setSize(){
	  var myWidth = 0, myHeight = 0;
	  if( typeof( window.innerWidth ) == 'number' ) {
		//Non-IE
		myWidth = window.innerWidth;
		myHeight = window.innerHeight;
	  }else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
		//IE 6+ in 'standards compliant mode'
		myWidth = document.documentElement.clientWidth;
		myHeight = document.documentElement.clientHeight;
	  }
	  var sidH = myHeight - 131;
	  var mapH = myHeight -125;
	  document.getElementById("map-canvas").style.height = mapH + "px"; //size of menu header
	  document.getElementById("side-col").style.height = sidH + "px";
	}
	
	function winResizeSetup(){
		if(window.attachEvent) {
			window.attachEvent('onresize', setSize);
		}
		else if(window.addEventListener) {
			window.addEventListener('resize', setSize, true);
		}
	}
	
	function center(lat,lon){
		map.panTo(new google.maps.LatLng(lat,lon));
	}
	
	function refresh_data(){
		for (var i=0; i < marker_dat.marker.length; i++){
			marker_dat.marker[i].setMap(null);
		}
						
		for(var current in marker_dat){
			marker_dat[current] = [];
		}
		
		req_data(100);
		load_data(100);
	}
	
	window.onload = setSize;
	winResizeSetup();
	google.maps.event.addDomListener(window, 'load', initialize);
	