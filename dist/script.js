
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
  attr("fill", d => "#e9e316").
  attr("d", path).
  on("mouseover", (d, i, nodes) => {
    d3.select(nodes[i]).attr("fill", "#ff0005");
    tooltip.style("visibility", "visible").
    style("left", `${d3.event.pageX + 10}px`).
    style("top", `${d3.event.pageY - 25}px`).
    html(d.properties.name);
  }).
  on("mouseout", d => {
    tooltip.style("visibility", "hidden");
  });

  loadNewCountry(countryData, svg, gElement, 0, 1);

};

/** Return chart height.*/
const getChartHeight = () => 600;
/** Return chart width.*/
const getChartWidth = () => 950;
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
// @TODO Select unique random country names , no country name should repeat twice
let getRandomCountryName = countryData => {
  let noOfCountries = countryData.objects.countries1.geometries.length;
  return countryData.objects.countries1.geometries[getRandomInteger(noOfCountries)].properties.name;
};
let getRandomInteger = maxOfRange => {
  return Math.floor(Math.random() * Math.floor(maxOfRange));
};
let loadNewCountry = (countryData, svg, gElement, points, questionNo) => {
  if (questionNo > 5) {
    return;
  }
  // @TODO Use curried function concept
  let countryName = getRandomCountryName(countryData);
  let noOfAttempts = 0;
  d3.select("#country-name").
  text(countryName);

  d3.select(".country-region").remove();
  for (let i = 0; i < 180; i++) {
    // @TODO optimize the search
    if (countryData.objects.countries1.geometries[i].properties.name === countryName) {
      let arcData = countryData.objects.countries1.geometries[i].arcs;
      let test = JSON.parse(`{"type":"GeometryCollection","geometries":[{"arcs":[[${arcData}]],"type":"Polygon"}]}`);
      let path = d3.geoPath().projection(d3.geoMercator());
      let centroids = topojson.feature(countryData, test).features.map(feature => {
        return path.centroid(feature);
      });
      /*
            Uncomment to add dot inside country
            svg.selectAll(".centroid").data(centroids)
               .enter().append("circle")
               .attr("class", "centroid")
               .attr("r", 4)
               .attr("cx",(d)=>d[0])
               .attr("cy",(d)=>d[1]);
              */

      let arc = d3.arc().
      innerRadius(150).
      outerRadius(155);
      // @TODO randomize sum to the centreoids as the center of circle will always be the answer       
      let sector = svg.append("path").
      attr("fill", "red").
      attr("class", "country-region").
      attr("stroke-width", 1).
      attr("stroke", "darkslategray").
      attr("d", arc({ startAngle: 0, endAngle: 2 * Math.PI })).
      attr("transform", `translate(${centroids[0][0]},${centroids[0][1]})`);

    }
  }

  gElement.on("click", (d, i, nodes) => {
    d3.select(nodes[i]).attr("fill", "blue");
    if (d3.select(nodes[i]).attr("name") === countryName) {
      points = points + 30 - 10 * noOfAttempts;
      updatePoints(points);
      loadNewCountry(countryData, svg, gElement, points, questionNo + 1);
    }
    noOfAttempts++;
    if (noOfAttempts === 3)
    loadNewCountry(countryData, svg, gElement, points, questionNo + 1);

  });

};
let updatePoints = points => {
  d3.select("#points").
  text(points);
};