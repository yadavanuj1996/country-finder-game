// for more details about simplebar https://github.com/Grsmto/simplebar

var difficultyLevel="Easy";
//var myElement = document.getElementById('main-div');
	//new SimpleBar(myElement, { autoHide: true });
	
document.addEventListener("DOMContentLoaded",()=>{
	
	document.getElementById("game-start-btn").addEventListener("click",()=>{
		localStorage.setItem('difficulty', difficultyLevel);
		window.location.href="./index.html";
	});
	
	document.getElementById("cbtn1").addEventListener("click",()=>{
		removeColorFromButton();
		let easyButton=document.getElementById("cbtn1");
		easyButton.classList.add("purple-background");
		setDifficultyLevel("Easy");
	});
	document.getElementById("cbtn2").addEventListener("click",()=>{
		removeColorFromButton();
		let intermediateButton=document.getElementById("cbtn2");
		intermediateButton.classList.add("purple-background");
		setDifficultyLevel("Intermediate");
	});
	document.getElementById("cbtn3").addEventListener("click",()=>{
		removeColorFromButton();
		let hardButton=document.getElementById("cbtn3");
		hardButton.classList.add("purple-background");
		setDifficultyLevel("Hard");
	});
	
});
let removeColorFromButton=()=>{
	let easyButton=document.getElementById("cbtn1");
	let intermediateButton=document.getElementById("cbtn2");
	let hardButton=document.getElementById("cbtn3");
	easyButton.classList.remove("purple-background");
	intermediateButton.classList.remove("purple-background");
	hardButton.classList.remove("purple-background");
};

let setDifficultyLevel=(difficulty)=>{
	difficultyLevel=difficulty;
}
let addColorInButton=(buttonElement)=>{
		buttonElement.classList.add("purple-background");
};
