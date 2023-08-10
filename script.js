const height = 550;
const width = 1100;
const padding = 100;

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const colorsPalette = ["#4575b4","#74add1","#abd9e9","#e0f3f8","#ffffbf","#fee090", "#fdae61", "#f46d43", "#d73027"];
const temperatureRanges = [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8];

let svg = d3.select("#stat-container")
            .append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .classed("svg-content-responsive", true);

            

function drawCanvas() {
  svg.attr("width", width)
     .attr("height", height)
}

function generateTitle() {
  d3.select("#description")
    .text(`${d3.min(items, item => item.year)} - ${d3.max(items, item => item.year)}: base temperature ${baseTemperature}℃`)
}

function generateScales() {
  // Years
  xAxisScale = d3.scaleLinear()
                  .domain([d3.min(items, item => item.year), d3.max(items, item => item.year) + 1])
                  .range([padding, width - padding]);
  
  // Months                  
  yAxisScale = d3.scaleBand()
                  .domain(months)
                  .range([padding, height - padding]);  
                  
  //Legend
  legendAxisScale = d3.scaleBand()
                  .domain(temperatureRanges)
                  .range([padding, width / 2.6]);                 
}

function generateAxes() {
  let xAxis = d3.axisBottom(xAxisScale).tickFormat(d3.format("d"));

  svg.append("g")
     .call(xAxis)
     .attr("id", "x-axis")
     .attr('transform', `translate(0, ${height - padding})`);

  let yAxis = d3.axisLeft(yAxisScale);

  svg.append("g")
     .call(yAxis)
     .attr("id", "y-axis")
     .attr('transform', `translate(${padding}, 0)`);
}

function getColorBasedOnTemperature(temperature) {
  for (let i = 1; i < temperatureRanges.length; i++) {
      if (temperature <= temperatureRanges[i]) {
          return colorsPalette[i - 1];
      }
  }
  // If temperature is greater than the highest range, return the last color
  return colorsPalette[colorsPalette.length - 1];
}

function generateCells() {
  let tooltip = d3.select("#stat-container")
                  .append("div")
                  .attr("id", "tooltip")
                  .style("visibility", "hidden")

  const numberOfYears = d3.max(items, item => item.year) - d3.min(items, item => item.year);
  const widthOfBar = (width - 2 * padding) / numberOfYears;
  const heightOfBar = ((height - 2 * padding) / 12);

  svg.selectAll("rect")
     .data(items)
     .enter()
     .append("rect")
     .attr("class", "cell")
     .attr("width", `${widthOfBar}`)
     .attr("height", `${heightOfBar}`)
     .attr("data-month", item => item.month - 1)
     .attr("data-year", item => item.year)
     .attr("data-temp", item => baseTemperature + item.variance)
     .attr("fill", item => {
        let temperature = item.variance + baseTemperature;
      //  console.log(temperature)
        return getColorBasedOnTemperature(temperature);
      
     })
     .attr("x", (item) => xAxisScale(item.year))
      // .attr("x", 100)
      .attr("y", (item) => yAxisScale(months[item.month - 1]))
     .on("mouseover", function(event, item) {
      svg.select(`rect[data-year='${item.year}'][data-month="${item.month-1}"]`).style("stroke", "black").style("stroke-width", "1");
      // svg.select("rect").style("stroke", "black").style("stroke-width", "2");

        tooltip.style("left", (event.clientX - 80) + "px")
                .style("top", (event.pageY - 100) + "px")
                .transition().style("visibility", "visible");
        
        tooltip.html(`${item.year} - ${months[item.month - 1]}<br>
                      ${(item.variance + baseTemperature).toFixed(2)}℃<br>
                      ${(item.variance).toFixed(2)}℃`);
                      
        document.querySelector("#tooltip").setAttribute("data-year", item.year);
      })   
      .on("mouseout", (event, item) => {
          tooltip.transition().style("visibility", "hidden");
          svg.select(`rect[data-year='${item.year}'][data-month="${item.month-1}"]`).style("stroke", null).style("stroke-width", null);
      }) ;
}

function generateLegend() {
  let legendAxis = d3.axisBottom(legendAxisScale);

  const widthOfLegendBar = (width / 2.6 - padding) / 10
  const temperatureRangesLegend = [3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8];
  const legend = svg.append('g')
                    .call(legendAxis)
                    .attr('id', 'legend')
                    .attr('transform', `translate(0, ${height - 50})`);

  legend.selectAll('.legend-item')
        .data(temperatureRangesLegend)
        .enter()
        .append('rect')
        .attr('class', 'legend-item')
        .attr("width", `${widthOfLegendBar}`)
        .attr("height", "10")
        .attr("y", `-10`) // Adjust the y position as needed
        .attr("x", (range) => legendAxisScale(range) - widthOfLegendBar / 2)
        .attr("fill", range => getColorBasedOnTemperature(range))   
}

d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
  .then(data => {
    items = data.monthlyVariance;
    baseTemperature = data.baseTemperature;
    // console.log(items)
    drawCanvas();
    generateTitle();
    generateScales();
    generateAxes();
    generateCells();
    generateLegend();
  })