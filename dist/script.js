// @TODO Add blinking effect for right answer if user couldn't answer it
// @TODO Animated hearts on correct answer and thumbs down on wrong choice
// @TODO Voice stating country name and yah and nah sound on right/wrong choice.
// @TODO add different difficulty levels.
// @TODO Document the code and prepare jsdocs documentation.
// @TODO Refactor the code.
document.addEventListener("DOMContentLoaded", () => {
  let countryDataPromise = fetch("https://gist.githubusercontent.com/yadavanuj1996/839c37eb95f4fd2f704194e764998351/raw/c09e1f413ee07b2865c09644f37f275553fa3b26/world-countries.json");

  Promise.resolve(countryDataPromise).
  then(responses => responses.text()).
  then(data => {
    loadMap(data);
  });
});
/** 
    *  This function will load the choropleth map.
    *  @param {Array<Object>} tempDataset The county dataset that represents all 
    *  the counties of US used for construcing the chart.
    *  @param {Array<Object>} educationDetails The education dataset that represents 
    *  all eductaion attainment percent of all the counties corresponding with county id.
    */
let loadMap = countryDetails => {
  const countryData = JSON.parse(countryDetails);
  let svg = loadSvg();
  let path = d3.geoPath().projection(d3.geoMercator());
  let tooltip = loadTooltip();
  let gElement = svg.append("g").
  selectAll("path").
  data(topojson.feature(countryData, countryData.objects.countries1).features).
  enter().
  append("path").
  attr("name", (d, i) => countryData.objects.countries1.geometries[i].properties.name).
  attr("class", "pathWithBorder").
  attr("fill", d => getRandomFillColor()).
  attr("d", path);

  let pElement = svg.append("g");
  let zoomed = () => {
    gElement.attr("transform", d3.event.transform);
    pElement.attr("transform", d3.event.transform);
  };
  let screenWidth = Math.max(1080 || document.documentElement.clientWidth, window.innerWidth);
  let screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  let zoom = d3.zoom().
  scaleExtent([1, 40]).
  translateExtent([[0, -100], [0.8 * screenWidth + 100, 0.8 * screenHeight + 100]]).
  on("zoom", zoomed);

  svg.call(zoom);
  loadNewCountry(countryData, svg, gElement, pElement, 0, 1, []);

  svg.append("rect").
  attr("class", "zoom-in-position").
  attr("height", 25).
  attr("width", 25).
  attr("fill", "#ffffff").
  attr("stroke", "#000000").
  style("cursor", "zoom-in").
  on("click", d => {
    zoomIn(svg, zoom);
  });

  svg.append("text").
  text("+").
  attr("id", "zoom-in-text").
  on("click", d => {
    zoomIn(svg, zoom);
  });

  svg.append("rect").
  attr("class", "zoom-out-position").
  attr("height", 25).
  attr("width", 25).
  attr("fill", "#ffffff").
  attr("stroke", "#000000").
  style("cursor", "zoom-out").
  on("click", d => {
    zoomOut(svg, zoom);
  });

  svg.append("text").
  text("-").
  attr("id", "zoom-out-text").
  on("click", d => {
    zoomOut(svg, zoom);
  });

};

let zoomIn = (svg, zoom) => {
  svg.transition().call(zoom.scaleBy, 1.3);
};
let zoomOut = (svg, zoom) => {
  svg.transition().call(zoom.scaleBy, 0.7);
};
/** Add svg in body and return it.*/
let loadSvg = () => {
  return d3.select("#svg-holder").
  append("svg").
  attr("class", "game-area-svg");
};
/** Return tooltip that will show inforamtion about a rectangle when it is hovered.*/
let loadTooltip = () => {
  return d3.select("body").
  append("div").
  style("visibility", "hidden").
  attr("id", "tooltip");
};
let loadNewCountry = (countryData, svg, gElement, pElement, points, questionNo, alreadyDisplayedCountry) => {
  if (questionNo > getTotalQuestions()) {
    return;
  }
  updateQuestionsLeft(questionNo);
  resetAttemptsLeft();
  updateCompletionIndicator(questionNo);
  alterBackgroundGradient(questionNo);
  let noOfAttempts = 0;
  let countryName = getUniqueRandomCountryName(countryData, alreadyDisplayedCountry);
  alreadyDisplayedCountry.push(countryName);
  hideCountryRegionArc();
  showCountryName(countryName);
  d3.select("#tooltip").style("visibility", "hidden");

  let timeForQuestion = 40;
  var timeCounterInterval = setTimeCounterInterval(timeForQuestion);
  setTimeout(() => {
    if (noOfAttempts < 3) {
      stopInterval(timeCounterInterval, noOfAttempts);
      loadNewCountry(countryData, svg, gElement, pElement, points, questionNo + 1, alreadyDisplayedCountry);
    }
  }, timeForQuestion * 1000);

  let userSelectedLastChoice;
  let userHoveredLastChoice;
  gElement.on("click", (d, i, nodes) => {
    noOfAttempts++;
    updateAttemptsLeft(noOfAttempts);
    let userSelectedCountry = nodes[i]; // nodes[i] refer to the clicked element
    removeOldColorOnUserSelectedCountry(userSelectedLastChoice);
    removeOldColorOnUserHoverCountry(userHoveredLastChoice);

    userSelectedLastChoice = userSelectedCountry;
    if (noOfAttempts === 1)
    showCountryRegionArc(countryData, countryName, pElement, noOfAttempts);else
    if (noOfAttempts === 2) {
      hideCountryRegionArc();
      showCountryRegionArc(countryData, countryName, pElement, noOfAttempts);
    }
    addColorOnUserSelectedCountry(userSelectedCountry);
    showTooltip(d3.select(userSelectedCountry).attr("name"));
    let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    if (screenWidth <= 980) {
      setTimeout(() => {
        hideTooltip();
      }, 0800);
    }
    if (d3.select(userSelectedCountry).attr("name") === countryName) {
      points = points + 30 - 10 * (noOfAttempts - 1);
      updatePoints(points);
      removeOldColorOnUserSelectedCountry(userSelectedCountry); // removing present choice
      addColorOnCorrectCountry(userSelectedCountry);
      stopInterval(timeCounterInterval, noOfAttempts);
      noOfAttempts = 3;
      loadNewCountry(countryData, svg, gElement, pElement, points, questionNo + 1, alreadyDisplayedCountry);
      return;
    }

    if (areAllAttemptsExhausted(noOfAttempts)) {
      removeOldColorOnUserSelectedCountry(userSelectedCountry);
      stopInterval(timeCounterInterval, noOfAttempts);
      noOfAttempts = 3;
      loadNewCountry(countryData, svg, gElement, pElement, points, questionNo + 1, alreadyDisplayedCountry);
    }

  });
  gElement.on("mouseover", (d, i, nodes) => {
    let userHoverCountry = nodes[i]; // nodes[i] refer to the clicked element
    addColorOnUserHoverCountry(userHoverCountry);
    if (noOfAttempts === 2) {
      let userHoverCountryName = d3.select(userHoverCountry).attr("name");
      showTooltip(userHoverCountryName);
    }
    userHoveredLastChoice = userHoverCountry;
  });
  gElement.on("mouseout", d => {
    hideTooltip();
    removeOldColorOnUserHoverCountry(userHoveredLastChoice);
  });
  textToSpeech(countryName);
};
let getUniqueRandomCountryName = (countryData, alreadyDisplayedCountry) => {
  let noOfCountries = countryData.objects.countries1.geometries.length;
  let randomCountrySNo = getRandomInteger(noOfCountries);
  let knownCountryBuffer = [56, 0, 4, 8, 15, 23, 25, 28, 31, 38, 42, 48, 50, 56, 58, 65, 74, 75, 76, 77, 80, 84, 91, 96, 108, 110, 114, 122, 123, 125, 128, 132, 133,
  137, 140, 158, 164, 170, 173, 177];
  if (getRandomInteger(20) % 2 === 0)
  randomCountrySNo = knownCountryBuffer[getRandomInteger(knownCountryBuffer.length)];
  let countryName = countryData.objects.countries1.geometries[randomCountrySNo].properties.name;
  if (alreadyDisplayedCountry.includes(countryName))
  return getUniqueRandomCountryName(countryData, alreadyDisplayedCountry);

  return countryName;
};
let getRandomInteger = maxOfRange => {
  return Math.floor(Math.random() * Math.floor(maxOfRange));
};
let showCountryName = countryName => {
  d3.select("#country-name").
  text(countryName);
};
let hideCountryRegionArc = () => {
  d3.select(".country-region").remove();
};
let showCountryRegionArc = (countryData, countryName, pElement, noOfAttempts) => {
  for (let i = 0; i < 180; i++) {
    if (countryData.objects.countries1.geometries[i].properties.name === countryName) {
      let arcData = countryData.objects.countries1.geometries[i].arcs;
      let test = JSON.parse(`{"type":"GeometryCollection","geometries":[{"arcs":[[${arcData}]],"type":"Polygon"}]}`);
      let path = d3.geoPath().projection(d3.geoMercator());
      let centroids = topojson.feature(countryData, test).features.map(feature => {
        return path.centroid(feature);
      });

      // Uncomment to add dot inside country
      /* svg.selectAll(".centroid")
          .data(centroids)
          .enter()
          .append("circle")
          .attr("class", "centroid")
          .attr("r", 40)
          .attr("cx",(d)=>d[0])
          .attr("cy",(d)=>d[1]);*/
      let arcInnerRadius = 150;
      let arcOuterRadius = 155;
      let errorRange = 75;
      let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      if (noOfAttempts === 2 && screenWidth >= 720) {
        arcInnerRadius = 100;
        arcOuterRadius = 105;
      } else
      if (noOfAttempts === 2 && screenWidth < 720) {
        arcInnerRadius = 70;
        arcOuterRadius = 75;
        errorRange = 35;
      }
      let arc = d3.arc().
      innerRadius(arcInnerRadius).
      outerRadius(arcOuterRadius);
      let errorX = getRandomInteger(errorRange);
      let errorY = getRandomInteger(errorRange);
      errorX *= Math.floor(Math.random() * 2) === 1 ? 1 : -1;
      errorY *= Math.floor(Math.random() * 2) === 1 ? 1 : -1;

      let sector = pElement.append("path").
      attr("fill", "red").
      attr("class", "country-region").
      attr("stroke-width", 1).
      attr("stroke", "darkslategray").
      attr("d", arc({ startAngle: 0, endAngle: 2 * Math.PI })).
      attr("transform", `translate(${centroids[0][0] + errorX},${centroids[0][1] + errorY})`);

    }
  }

};
let addColorOnUserSelectedCountry = userSelectedCountry => {
  d3.select(userSelectedCountry).classed('wrong-choice-effects', true);
};
let removeOldColorOnUserSelectedCountry = userSelectedLastChoice => {
  d3.select(userSelectedLastChoice).classed('wrong-choice-effects', false);
};
let addColorOnUserHoverCountry = userHoverCountry => {
  d3.select(userHoverCountry).classed('choice-hover-effects', true);
};
let removeOldColorOnUserHoverCountry = userHoverLastChoice => {
  d3.select(userHoverLastChoice).classed('choice-hover-effects', false);
};
let addColorOnCorrectCountry = userSelectedCountry => {
  d3.select(userSelectedCountry).classed('correct-choice-effects', true);
};
let updatePoints = points => {
  d3.select("#points").
  text(points);
};
let updateQuestionsLeft = qno => {
  d3.select("#questions").
  text(10 - qno);
};
let updateAttemptsLeft = attemptNo => {
  d3.select("#attmepts").
  text(3 - attemptNo);
};
let resetAttemptsLeft = () => {
  d3.select("#attmepts").
  text(3);
};
let updateTimeLeft = timeLeft => {
  d3.select("#time").
  text(timeLeft);
};
let areAllAttemptsExhausted = noOfAttempts => {
  if (noOfAttempts === 3)
  return true;

  return false;
};
let showTooltip = userHoverCountryName => {
  d3.select("#tooltip").
  style("visibility", "visible").
  style("left", `${d3.event.pageX + 10}px`).
  style("top", `${d3.event.pageY - 25}px`).
  html(userHoverCountryName);
};
let hideTooltip = () => {
  d3.select("#tooltip").style("visibility", "hidden");
};
let getRandomFillColor = () => {
  let earthFillColor = ["#FF3F7D", "#B87ED1", "#008788", "#00C5C8", "#004EB7", "#E7AB49", "#FFF065", "#F99BA9", "#976b68"];

  return earthFillColor[getRandomInteger(8)];
};
let setTimeCounterInterval = timeForQuestion => {
  let timeLeft = timeForQuestion - 1;
  let timeCounter = setInterval(() => {
    updateTimeLeft(timeLeft);
    timeLeft--;
  }, 1000);

  return timeCounter;
};
let stopInterval = async (timeCounter, noOfAttempts) => {
  clearInterval(timeCounter);
};
let updateCompletionIndicator = questionNo => {
  let totalQuestions = getTotalQuestions();
  d3.select("#completion-indicator").
  style("width", `${questionNo / totalQuestions * 100}%`);
};
let getTotalQuestions = () => {
  return 10;
};
let alterBackgroundGradient = questionNo => {
  if (questionNo % 2 == 0) {
    d3.select("body").classed('addLightGradient', false);
    d3.select("body").classed('addDarkGradient', true);
  } else
  {
    d3.select("body").classed('addDarkGradient', false);
    d3.select("body").classed('addLightGradient', true);
  }
};

let textToSpeech = countryName => {
  responsiveVoice.speak(countryName);
};