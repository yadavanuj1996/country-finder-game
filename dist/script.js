
document.addEventListener("DOMContentLoaded", () => {
  //let usCountyDataPromise=fetch("https://unpkg.com/world-atlas@1.1.4/world/110m.json");
  let usCountyDataPromise = fetch("https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json");
  Promise.resolve(usCountyDataPromise).
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
let loadMap = countyDetails => {
  const countyData = JSON.parse(countyDetails);
  console.log(countyData.objects.countries1.geometries);
  const svgHeight = getChartHeight();
  const svgWidth = getChartWidth();
  const padding = getChartPadding();
  let svg = loadSvg(svgHeight, svgWidth);
  let path = d3.geoPath().projection(d3.geoMercator());
  let tooltip = loadTooltip();
  svg.append("g").
  attr("class", "counties").
  selectAll("path").
  data(topojson.feature(countyData, countyData.objects.countries1).features).
  enter().
  append("path").
  attr("class", "county").
  attr("class", "pathWithBorder").
  attr("fill", d => "#e9e316").
  attr("d", path).
  on("click", (d, i, nodes) => {
    d3.select(nodes[i]).attr("fill", "#ff0005");

    tooltip.style("visibility", "visible").
    style("left", `${d3.event.pageX + 10}px`).
    style("top", `${d3.event.pageY - 25}px`).
    html(d.properties.name);
  }).
  on("mouseout", d => {
    tooltip.style("visibility", "hidden");
  });
  d3.select("#country-name").
  text(getRandomCountryName(countyData));
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
let getRandomCountryName = countyData => {
  let noOfCountries = countyData.objects.countries1.geometries.length;

  console.log(countyData.objects.countries1.geometries[getRandomInteger(noOfCountries)]);
  return countyData.objects.countries1.geometries[getRandomInteger(noOfCountries)].properties.name;
};
let getRandomInteger = maxOfRange => {
  return Math.floor(Math.random() * Math.floor(maxOfRange));
};