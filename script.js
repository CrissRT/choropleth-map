const height = 650;
const width = 1100;
const padding = 100;
const collorPalette = [
  "#B0E2FF",
  "#87CEEB",
  "#5D9BBA",
  "#4169E1",
  "#2E3A80",
  "#1F2557",
  "#0C0E29"
];

let svg = d3.select("#stat-container")
            .append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .classed("svg-content-responsive", true);       

function drawCanvas() {
  svg.attr("width", width)
     .attr("height", height)
}

function getLegendRange(dataCounty) {
  let minDegree = d3.min(dataCounty, data => data.bachelorsOrHigher);
  let maxDegree = d3.max(dataCounty, data => data.bachelorsOrHigher);
  let pass = (maxDegree - minDegree) / 7;
  var legendValues = [];

  let pushedValue = minDegree;
  while (pushedValue <= maxDegree) {
    legendValues.push(Math.floor(pushedValue));
    pushedValue += pass;
  }
  legendValues.push(Math.floor(maxDegree));
  return legendValues;
}

function generatePath(dataMap, dataCounty) {

  function _getColorBasedOnDegree(degree, degreeRange) {
    for (let i = 1; i < degreeRange.length; i++) {
        if (degree <= degreeRange[i]) {
            return collorPalette[i - 1];
        }
    }
  }

  let tooltip = d3.select("#stat-container")
                  .append("div")
                  .attr("id", "tooltip")
                  .style("visibility", "hidden"); 
  const degreeRange = getLegendRange(dataCounty);

  svg.selectAll("path")
    .data(dataMap)
    .enter()
    .append("path")
    .attr("d", d3.geoPath())
    .attr("transform", `translate(${padding},0)`)
    .attr("class", "county")
    .attr("data-fips", (dataMap) => dataMap.id)
    .attr("data-education", (dataMap) => {
      const foundData = dataCounty.find(data => {
        return data.fips === dataMap.id
      });
      return foundData.bachelorsOrHigher;
    })
    .attr("fill", (dataMap) => {
      const foundData = dataCounty.find(data => {
        return data.fips === dataMap.id
      });
      return _getColorBasedOnDegree(foundData.bachelorsOrHigher, degreeRange);
    })
    .on("mouseover", function(event, item) {
      const dataOfItem = () => dataCounty.find(data => data.fips === item.id);

      tooltip.html(`${dataOfItem().area_name}, ${dataOfItem().state}: ${dataOfItem().bachelorsOrHigher}`)
              .style("left", (event.clientX - 80) + "px")
              .style("top", (event.pageY - 100) + "px")
              .transition().style("visibility", "visible");
                    
      document.querySelector("#tooltip").setAttribute("data-education", `${dataOfItem().bachelorsOrHigher}`);
    })   
    .on("mouseout", () => {
        tooltip.transition().style("visibility", "hidden");
    });           
}

function generateLegend(dataCounty) {

  function _getColor(degree, degreeRange) {
    for (let i = 0; i < degreeRange.length; i++) {
        if (degree <= degreeRange[i]) {
            return collorPalette[i];
        }
    }
  }
  const legendRange = getLegendRange(dataCounty);
  const widthOfLegendBar = (width / 2.6 - padding) / 8;
  const legendRangeRect = legendRange.slice(1);

  let legendAxisScale = d3.scaleBand()
                  .domain(legendRange)
                  .range([padding, width / 2.6]);  
  let legendAxis = d3.axisBottom(legendAxisScale);
  let legend = svg.append('g')
                    .call(legendAxis)
                    .attr('id', 'legend')
                    .attr('transform', `translate(${width / 2}, 10)`);

  legend.selectAll('.legend-item')
        .data(legendRangeRect)
        .enter()
        .append('rect')
        .attr('class', 'legend-item')
        .attr("width", `${widthOfLegendBar}`)
        .attr("height", "10")
        .attr("y", `-10`) // Adjust the y position as needed
        .attr("x", range => legendAxisScale(range) - widthOfLegendBar / 2)
        .attr("fill", range => _getColor(range, legendRangeRect))   
}

d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json')
  .then(dataMap => {
    d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
      .then(dataCounty => {
        let mapData = topojson.feature(dataMap, dataMap.objects.counties);

        drawCanvas();
        generatePath(mapData.features, dataCounty);
        generateLegend(dataCounty);
      })
  })