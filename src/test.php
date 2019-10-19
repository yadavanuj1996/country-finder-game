<?php
	
	$requestBody = file_get_contents('php://input');
	$requestObject=json_decode($requestBody);
	
	if($requestObject->operation=="retrieve"){
		echo getTopScores();
	}
	
	if($requestObject->operation=="score-retrieve"){
		echo getUserScorePercentile($requestObject->userScore,$requestObject->difficultyLevel);
	}
	
	if($requestObject->operation=="recent-users-retrieve"){
		echo getRecentUsers();
	}
	
	if($requestObject->operation=="update-top-scores"){
		echo updateTopScores();
	}
	
	
	function getRecentUsers(){
		//Load the file
		$scoreDetails = file_get_contents('./data/scores.json');
		//Decode the JSON data into a PHP array.
		$scoreArray = json_decode($scoreDetails, true);
		//Update user with less score for calculation percentile
		$resultArray=array();
		$j=15;
		$resultTest='{';
		for($i=count($scoreArray)-1;$i>=0 && $j>0;$i--,$j--){
			$resultTest=$resultTest.'"'.(count($scoreArray)-$i).'"'.':'.$scoreArray[$i].',';
			array_push($resultArray, $scoreArray[$i]);
		}
			
		$resultTest=substr_replace($resultTest ,"", -1);
		$resultTest=$resultTest."}";
		return $resultTest;
	}
	function getUserScorePercentile($userScore,$difficultyLevel){
		//Load the file
		$scoreDetails = file_get_contents('./data/scores.json');
		//Decode the JSON data into a PHP array.
		$scoreArray = json_decode($scoreDetails, true);
		//Update user with less score for calculation percentile
		$usersWithLessScore=0;
		$usersWithSameDifficulty=0;
		foreach($scoreArray as  $key => $value){
			$valueObject=json_decode($value);
			if($valueObject->score<=$userScore && $valueObject->difficultyLevel==$difficultyLevel)
				$usersWithLessScore++;
			
			if($valueObject->difficultyLevel==$difficultyLevel)
				$usersWithSameDifficulty++;
		}
		$percentile=($usersWithLessScore/$usersWithSameDifficulty)*100;
		return $percentile;
	}
	
	function getTopScores(){
		//Load the file
		$topScoreDetails = file_get_contents('./data/topscore.json');
		return $topScoreDetails;
	}
	
	function updateTopScores(){
		//Load the file
		$scoreDetails = file_get_contents('./data/scores.json');
		//Decode the JSON data into a PHP array.
		$scoreArray = json_decode($scoreDetails, true);
		//Modify the Name property value on basis of gid key
		$topScore=0;
		$topScorer="Yet to play";
		$intermediateTopScore=0;
		$intermediateTopScorer="Yet to play";
		$easyTopScore=0;
		$easyTopScorer="Yet to play";
		$playerOfTheWeekScore=0;
		$playerOfTheWeek="Yet to play";
		$playerOfTheDayScore=0;
		$playerOfTheDay="Yet to play";
		
		foreach($scoreArray as  $key => $value){
			$valueObject=json_decode($value);
			if($valueObject->score>=$topScore && $valueObject->difficultyLevel=="Hard"){
				$topScore=$valueObject->score;
				$topScorer=$valueObject->name;
			}
			else if($valueObject->score>=$intermediateTopScore && $valueObject->difficultyLevel=="Intermediate"){
				$intermediateTopScore=$valueObject->score;
				$intermediateTopScorer=$valueObject->name;
			}
			else if($valueObject->score>=$intermediateTopScore && $valueObject->difficultyLevel=="Easy"){
				$easyTopScore=$valueObject->score;
				$easyTopScorer=$valueObject->name;
			}
			
			if(isGamePlayedThisWeek($valueObject->date)){
				if($valueObject->score>=$playerOfTheWeekScore){
					$playerOfTheWeekScore=$valueObject->score;
					$playerOfTheWeek=$valueObject->name;
				}
				
				if(isGamePlayedToday($valueObject->date)){
					$playerOfTheDayScore=$valueObject->score;
					$playerOfTheDay=$valueObject->name;
				}
			}
			
		}
		$topScoreJSON='{"topScorer":"'.$topScorer.'","topScore":"'.$topScore.'","totalViews":"","easyTopScorer":"'.$easyTopScorer.'","easyTopScore":"'.$easyTopScore.'","intermediateTopScorer":"'.$intermediateTopScorer.'","intermediateTopScore":"'.$intermediateTopScore.'","playerOfTheDay":"'.$playerOfTheDay.'","playerOfTheDayScore":"'.$playerOfTheDayScore.'","playerOfTheWeek":"'.$playerOfTheWeek.'","playerOfTheWeekScore":"'.$playerOfTheWeekScore.'"}';
		$topScoreString=json_encode($topScoreJSON);
		//Save the file.
		file_put_contents('./data/topscore.json', $topScoreString);	
		
	}
	function isGamePlayedThisWeek($gameDate){
		$diffDays=getDayDiffInDates($gameDate);
		return $diffDays<7?true:false;
	}
	function isGamePlayedToday($gameDate){
		$diffDays=getDayDiffInDates($gameDate);
		return $diffDays==0?true:false;
	}
	function getDayDiffInDates($gameDate){
		$firstIndex=strpos($gameDate,"/");
		$secondIndex=strrpos($gameDate,"/");

		$gameFormattedDate=substr($gameDate,$firstIndex+1,$secondIndex-$firstIndex-1)."-".substr($gameDate,0,$firstIndex)."-".substr($gameDate,$secondIndex+1);
		$datetime1 = date_create($gameFormattedDate); 
		$datetime2 = date_create(date("d-m-Y")); 
		  
		// Calculates the difference between DateTime objects 
		$interval = date_diff($datetime1, $datetime2); 
		  
		// Display the result 
		$diffDays=$interval->format('%a');
		return $diffDays;
	}
?>