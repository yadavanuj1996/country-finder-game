document.addEventListener("DOMContentLoaded",()=>{
	let difficultyLevel=localStorage.getItem('difficulty');
	let score=localStorage.getItem('points');
	redirectOnDirectURLAccess(difficultyLevel,score);
	let scoreElement=document.getElementById("player-score");
	let percentileElement=document.getElementById("player-percentile");
	let difficultyElement=document.getElementById("player-difficulty-level");
	scoreElement.innerHTML=score;
	percentileElement.innerHTML="87%";
	difficultyElement.innerHTML=difficultyLevel;
	
	localStorage.removeItem('difficulty');
	localStorage.removeItem('points');
});

let redirectOnDirectURLAccess=(difficultyLevel,score)=>{
	console.log(difficultyLevel===null && score===null);
		if(difficultyLevel===null && score===null)
			window.location.href="./home.html";
};