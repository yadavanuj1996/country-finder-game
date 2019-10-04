document.addEventListener("DOMContentLoaded",()=>{
	let scoreElement=document.getElementById("player-score");
	let percentileElement=document.getElementById("player-percentile");
	let difficultyElement=document.getElementById("player-difficulty-level");
	let topScorerElement=document.getElementById("highest-scorer");
	let topScoreElement=document.getElementById("top-score-hard");
	let intermediateScorerElement=document.getElementById("intermediate-scorer");
	let intermediateScoreElement=document.getElementById("intermediate-score");
	let easyScorerElement=document.getElementById("easy-scorer");
	let easyScoreElement=document.getElementById("easy-score");
	let podScorerElement=document.getElementById("player-of-the-day-scorer");
	let podScoreElement=document.getElementById("player-of-the-day-score");
	let powScorerElement=document.getElementById("player-of-the-week-scorer");
	let powScoreElement=document.getElementById("player-of-the-week-score");
	
	let difficultyLevel=localStorage.getItem('difficulty');
	let score=localStorage.getItem('points');
	
	
	fetch('test.php', {
		method: 'post',
		headers: {
		'Accept': 'application/json, text/plain, */*',
		'Content-Type': 'application/json'
		},
		body: JSON.stringify({"operation": "retrieve"})
	})
	.then(response => response.json())
	.then(jsonResponse => JSON.parse(jsonResponse))
	.then(data=> {
		topScorerElement.innerHTML=data.topScorer;
		topScoreElement.innerHTML=data.topScore;		
		intermediateScorerElement.innerHTML=data.intermediateTopScorer;
		intermediateScoreElement.innerHTML=data.intermediateTopScore;
		easyScorerElement.innerHTML=data.easyTopScorer;
		easyScoreElement.innerHTML=data.easyTopScore;
		podScorerElement.innerHTML=data.playerOfTheDay;
		podScoreElement.innerHTML=data.playerOfTheDayScore;
		powScorerElement.innerHTML=data.playerOfTheWeek;
		powScoreElement.innerHTML=data.playerOfTheWeekScore;
		
	});
  
	fetch('test.php', {
		method: 'post',
		headers: {
		'Accept': 'application/json, text/plain, */*',
		'Content-Type': 'application/json'
		},
		body: JSON.stringify({"operation": "score-retrieve","userScore":score,"difficultyLevel":difficultyLevel})
	})
	.then(response => response.json())
	.then(jsonResponse => {
		percentileElement.innerHTML=`${Math.round(jsonResponse)}%`;	
	});
	
	fetch('test.php', {
		method: 'post',
		headers: {
		 'Content-Type': 'application/json',
        'Accept': 'application/json'
		},
		body: JSON.stringify({"operation": "recent-users-retrieve"})
	})
	.then(response => response.json())
	.then(jsonResponse => {
		let recentUsersElement=document.getElementById("other-scores-div");
		for (const i in jsonResponse){
		  recentUsersElement.innerHTML += `<div class="scorer-card">
          <div class="scorer-card-points">
            <h4>${jsonResponse[i].name}</h4>
            <h4 class="score-type">${jsonResponse[i].difficultyLevel}</h4>
            <h4>${jsonResponse[i].score}</h4>
          </div>
        </div>`;
		}
			
	});
	
	//redirectOnDirectURLAccess(difficultyLevel,score);
	scoreElement.innerHTML=score;
	difficultyElement.innerHTML=difficultyLevel;
	
	localStorage.removeItem('difficulty');
	localStorage.removeItem('points');
});

let redirectOnDirectURLAccess=(difficultyLevel,score)=>{
	console.log(difficultyLevel===null && score===null);
		if(difficultyLevel===null && score===null)
			window.location.href="./home.html";
};