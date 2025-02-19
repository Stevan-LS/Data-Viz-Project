import { config } from "./config.js";
const { width, height, margin } = config;

export function createGraph3(data, years) {
  let selectedCountry = null;

  const svg = d3.select('#graph3')
    .append('svg')
    .attr('width', '100%')
    .attr('height', '400')
    .attr("viewBox", [0, 0, width, height]);

  // Scales  
  const x = d3.scaleLinear()
    .domain([-1, 1])  // Set fixed domain since values are normalized
    .range([margin.left, width - margin.right])
    .nice();

  const y = d3.scaleLinear()
    .domain([-1, 1])  // Set fixed domain since values are normalized
    .range([height - margin.bottom, margin.top])
    .nice();
    
  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.Continent))
    .range(d3.schemeTableau10);

  // Remove the size scale (or set a fixed size)
  const CIRCLE_RADIUS = 6; // Fixed radius for all circles



  // Create tooltips
  const selectedTooltip = svg.append("foreignObject")
    .attr("class", "selected-tooltip")
    .attr("width", 200)
    .attr("height", 122)
    .attr("x", margin.left + width - 300)  // Match graph2 position
    .attr("y", margin.top + height - 305)   
    .append("xhtml:div")
    .style("background", "rgba(167, 29, 209, 0.1)")
    .style("border", "2px solid #a71dd1")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("opacity", 0);

  const hoverTooltip = d3.select("body").append("div")
    .attr("class", "hover-tooltip")
    .style("position", "absolute")
    .style("background", "rgba(255, 255, 255, 0.9)")
    .style("border", "1px solid #666")
    .style("padding", "8px")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", "10")
    .style("font-size", "12px")
    .style("visibility", "hidden");

  // Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("2D visualization of several water indicators");

  // Add axes
  const xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .call(g => g.append("text")
      .attr("x", width - margin.right)
      .attr("y", -10)
      .attr("fill", "currentColor")
      .attr("text-anchor", "end")
      .text("t-SNE 1"));

  const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.append("text")
      .attr("x", 10)
      .attr("y", margin.top)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .text("t-SNE 2"));

  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);

  // Add year label
  const yearLabel = svg.append('text')
    .attr('class', 'year')
    .attr('x', width - margin.right - 200)
    .attr('y', height - margin.bottom - 20)
    .attr('fill', '#ccc')
    .attr('font-family', 'Helvetica Neue, Arial')
    .attr('font-weight', 500)
    .attr('font-size', 80)
    .text(years[0]);

    function updateTooltipPosition(tooltip, event) {
        tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    }

  function createTooltipContent(d) {
    return `
      <strong>Country:</strong> ${d.Country}<br>
    `;
  }

  function clearSelection() {
    if (selectedCountry) {
      svg.selectAll("circle.country")
        .filter(d => d.Country === selectedCountry)
        .attr("r", CIRCLE_RADIUS)  // Reset to fixed radius
        .attr("fill", d => color(d.Continent))
        .attr("stroke", null);

      selectedCountry = null;
      selectedTooltip.style("opacity", 0);
    }
  }

  function update(year, newSelectedCountry) {
    const filteredData = data.filter(d => d.Year === year);

    if (selectedCountry !== newSelectedCountry) {
      svg.selectAll("circle.country")
        .filter(d => d.Country === selectedCountry)
        .attr("r", CIRCLE_RADIUS)  // Reset to fixed radius
        .attr("fill", d => color(d.Continent))
        .attr("stroke", null);
        
      selectedCountry = newSelectedCountry;
    }

    const countries = svg.selectAll("circle.country")
      .data(filteredData, d => d.Country)
      .join(
        enter => enter.append("circle")
          .attr("class", "country")
          .attr("cx", d => x(d.TSNE_1))
          .attr("cy", d => y(d.TSNE_2))
          .attr("r", CIRCLE_RADIUS)  // Use fixed radius
          .attr("fill", d => color(d.Continent))
          .attr("opacity", 0.7),
        update => update
          .call(update => update.transition()
            .duration(1000)
            .attr("cx", d => x(d.TSNE_1))
            .attr("cy", d => y(d.TSNE_2))
            .attr("r", d => d.Country === selectedCountry ? 
              CIRCLE_RADIUS + 4 : // Slightly larger for selected country
              CIRCLE_RADIUS)),
        exit => exit.remove()
      );

    if (selectedCountry) {
      const selectedData = filteredData.find(d => d.Country === selectedCountry);
      if (selectedData) {
        const selectedCircle = svg.selectAll("circle.country")
          .filter(d => d.Country === selectedCountry);
            
        selectedCircle
          .attr("r", CIRCLE_RADIUS + 4)  // Slightly larger for selected country
          .attr("fill", "#a71dd1")
          .attr("stroke", "#333")
          .attr("stroke-width", 2);

        selectedTooltip
          .style("opacity", 1)
          .html(createTooltipContent(selectedData));
      }
    }

    countries
        .on("mouseover", (event, d) => {
            hoverTooltip
                .style("visibility", "visible")
                .style("opacity", 1)
                .html(createTooltipContent(d));
            updateTooltipPosition(hoverTooltip, event);
        })
        .on("mousemove", (event) => {
            updateTooltipPosition(hoverTooltip, event);
        })
        .on("mouseout", () => {
            hoverTooltip
                .style("opacity", 0)
                .style("visibility", "hidden");
        });

    yearLabel.text(year);
  }

  // Add legend
  const legend = svg.append("g")
    .attr("transform", `translate(${margin.left + 75}, ${margin.top + 10})`);

  color.domain().forEach((continent, i) => {
    const legendRow = legend.append("g")
      .attr("transform", `translate(0, ${i * 20})`);

    legendRow.append("circle")
      .attr("r", 6)
      .attr("fill", color(continent))
      .attr("opacity", 0.7);

    legendRow.append("text")
      .attr("x", 15)
      .attr("y", 4)
      .attr("fill", "currentColor")
      .attr("font-size", 12)
      .text(continent);
  });

  return update;
}