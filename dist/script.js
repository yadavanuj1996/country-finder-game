// @TODO Add zooming and navigation feature
// @TODO Increase known countries frequency 
// @TODO Add blinking effect for right answer if user couldn't answer it 
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
  const svgHeight = getChartHeight();
  const svgWidth = getChartWidth();
  const padding = getChartPadding();
  let svg = loadSvg(svgHeight, svgWidth);
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

  zoom = d3.zoom().
  scaleExtent([1, 40]).
  on("zoom", zoomed);

  svg.call(zoom);

  loadNewCountry(countryData, svg, gElement, pElement, 0, 1, []);

};


/** Return chart height.*/
const getChartHeight = () => 500;
/** Return chart width.*/
const getChartWidth = () => 1080;
/** Return chart padding.*/
const getChartPadding = () => 100;
/** Add svg in body and return it.*/
let loadSvg = (height, width) => {
  return d3.select("body").
  append("svg").
  attr("height", height).
  attr("width", width);
};
/** Return tooltip that will show inforamtion about a rectangle when it is hovered.*/
let loadTooltip = () => {
  return d3.select("body").
  append("div").
  style("visibility", "hidden").
  attr("id", "tooltip");
};
let loadNewCountry = (countryData, svg, gElement, pElement, points, questionNo, alreadyDisplayedCountry) => {
  if (questionNo > 5) {
    return;
  }
  let noOfAttempts = 0;
  let countryName = getUniqueRandomCountryName(countryData, alreadyDisplayedCountry);
  alreadyDisplayedCountry.push(countryName);
  hideCountryRegionArc();
  showCountryName(countryName);
  d3.select("#tooltip").style("visibility", "hidden");
  let userSelectedLastChoice;
  let userHoveredLastChoice;
  gElement.on("click", (d, i, nodes) => {
    noOfAttempts++;
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
    if (d3.select(userSelectedCountry).attr("name") === countryName) {
      points = points + 30 - 10 * (noOfAttempts - 1);
      updatePoints(points);
      removeOldColorOnUserSelectedCountry(userSelectedCountry); // removing present choice
      addColorOnCorrectCountry(userSelectedCountry);
      loadNewCountry(countryData, svg, gElement, pElement, points, questionNo + 1, alreadyDisplayedCountry);
    }

    if (areAllAttemptsExhausted(noOfAttempts)) {
      removeOldColorOnUserSelectedCountry(userSelectedCountry);
      loadNewCountry(countryData, svg, gElement, pElement, points, questionNo + 1, alreadyDisplayedCountry); // removing present choice
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
};
let getUniqueRandomCountryName = (countryData, alreadyDisplayedCountry) => {
  let noOfCountries = countryData.objects.countries1.geometries.length;
  let randomCountrySNo = getRandomInteger(noOfCountries);
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
      if (noOfAttempts === 2) {
        arcInnerRadius = 100;
        arcOuterRadius = 105;
      }
      let arc = d3.arc().
      innerRadius(arcInnerRadius).
      outerRadius(arcOuterRadius);
      let errorX = getRandomInteger(75);
      let errorY = getRandomInteger(75);
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