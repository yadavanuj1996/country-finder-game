<?php
	$requestBody = file_get_contents('php://input');
	$requestObject=json_decode($requestBody);
	if($requestObject->operation=="insert"){
		insertGameDetails($requestBody);
	}
	else if($requestObject->operation=="update"){
		$inputGid=$requestObject->gid;
		$inputName=$requestObject->name;
		updateName($inputGid,$inputName);
	}
	
	//updateName($inputGid,$inputName);
	//insertGameDetails("test");
	function insertGameDetails($gameDetail){
		//Load the file
		$scoreDetails = file_get_contents('./data/scores.json');
		//Decode the JSON data into a PHP array.
		$scoreArray = json_decode($scoreDetails, true);
		//insert gameDetail in array that has existing data
			
		$gameDetailArray=json_decode($gameDetail, true);
		$i=0;
		foreach($gameDetailArray as $key=>$value) {
		    if($key=="operation"){
			  unset($gameDetailArray[$key]);
		    }
		    $i++;
		}
		$updatedGameDetail=json_encode($gameDetailArray);
		echo $updatedGameDetail;
		array_push($scoreArray, $updatedGameDetail);
		
		//Encode the array back into a JSON string.
		$json = json_encode($scoreArray);
		//Save the file.
		file_put_contents('./data/scores.json', $json);	
	}
	
	function updateName($inputGid,$inputName){
		//Load the file
		$scoreDetails = file_get_contents('./data/scores.json');
		//Decode the JSON data into a PHP array.
		$scoreArray = json_decode($scoreDetails, true);
		//Modify the Name property value on basis of gid key
		foreach($scoreArray as  $key => $value){
			$valueObject=json_decode($value);
			if($valueObject->gid===$inputGid){
				$valueObject->name=$inputName;
				$scoreArray[$key]=json_encode($valueObject);
			}
			
		}
		//Encode the array back into a JSON string.
		$json = json_encode($scoreArray);
		//Save the file.
		file_put_contents('./data/scores.json', $json);	
	}
	
?>