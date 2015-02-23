<?php
    header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Headers: Content-Type');
	
	$datab_con = new mysqli("localhost", "maps_user", "Mapslogin", "maps_data");
	
	if ($datab_con -> errno){
		echo "Cannot connect to database" . $datab_con -> errno;
		exit();
	}
	
	$num = 10;
	if (isset ($_POST["sz"])){
		$num = $datab_con -> real_escape_string($_POST["sz"]);	
	}
	
	//print_r(array_keys($_POST));
	
	
	$result;
	if (isset ($_GET["rq"])){
		if($_GET["rq"] === "save"){
			$input = file_get_contents("php://input");
				if ( $input ){
					$d_in = json_decode($input);
					$title = $datab_con -> real_escape_string(htmlspecialchars($d_in -> title,ENT_QUOTES));
					$lat =$datab_con -> real_escape_string(htmlspecialchars($d_in -> lat,ENT_QUOTES));
					$lon = $datab_con -> real_escape_string(htmlspecialchars($d_in -> lon,ENT_QUOTES));
					$img = $datab_con -> real_escape_string(htmlspecialchars($d_in -> image,ENT_QUOTES));
					$desc = $datab_con -> real_escape_string(htmlspecialchars($d_in -> desc,ENT_QUOTES));
						
					$result = false;
					if ($d_in != NULL){
						if($d_in -> title !== ""&& $d_in -> image !=="" && $d_in -> desc !== "" && $d_in -> lat !==""&& $d_in -> lon !== ""){
							$result = $datab_con -> query("INSERT INTO awesome_places (Title, Lat, Lon, Img, GDescription) VALUES ('".
								$title ."','".$lat. "','" . $lon . "','" . $img. "','" . $desc . "')");
						}
					}else{
						echo "JSON Error";
						$result = true;
					}
					if (!$result){
						if($datab_con -> errno == 0){
							echo "One of the fields entered was empty";
						}else{
							echo "error saving field! " . $datab_con -> errno . " " . $datab_con -> error;
						}
					}else{
						echo "0";
					}
					
				}else{
					echo "INVALID HEADER: "  ;
					print_r(array_keys($_POST)) ;
				}
		}else if($_GET["rq"] === "load"){
			if ($result = $datab_con -> query("SELECT * FROM awesome_places LIMIT " . $num )){
			$ret_val = "";
			
			$row = $result->fetch_assoc();
			
				
					if ($row){
						$data_arr = array();
						do {
							$data = array(
								'Title' => $row['Title'],
								'Img' => $row['Img'],
								'Desc' => $row['GDescription'],
								'Lat' => $row['Lat'],
								'Lon' => $row['Lon']
								);
							//push data onto data_arr
							array_push($data_arr ,$data);
							
						}while($row = $result->fetch_assoc());
						$ret_val = json_encode($data_arr);
					}else{
						$ret_val = array( 'Error' => 'Problem');
					
				}
			}else{
				$ret_val = "No results to display";
			}
			echo $ret_val;	
		}else{
			echo "-1";
		}
	}else{
		if ($result = $datab_con -> query("SELECT * FROM awesome_places LIMIT " . $num )){
			$ret_val = "";
			
			$row = $result->fetch_assoc();
			$count = 0;
				if ($row){
					do {
						$ret_val .= "<div class = 'm_dat' onmouseover=animations.startAni(marker_dat.marker[".$count."]) onclick=center(".
							$row['Lat'].",".$row['Lon'].") >" . 
						"<h1 class='d_title'>" . $row['Title'] . "</h1>".
						"<img class='d_img' height =200px width = 200px src = \"" . $row['Img'] . "\"/>" . 
						"<p class = 'd_desc'>" . $row['GDescription'] . "</p>".
						"</div>".
						"<hr/>";
						$count = $count + 1;
					}while($row = $result->fetch_assoc());
				}else{
					$ret_val = "No results to display";
				}
				echo $ret_val;			
		}else{
			echo "No results to display";
		}
	}

$datab_con -> close();
?> 