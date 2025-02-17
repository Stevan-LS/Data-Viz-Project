import { config } from "./config.js";
const { width, height, margin } = config;

// Modify the function signature to accept the callback
export function createGraph2(data, years) {
  let selectedCountry = null;

  const svg = d3.select('#graph2')
    .append('svg')
    .attr('width', '100%')
    .attr('height', '400')
    .attr("viewBox", [0, 0, width, height]);

  // Scales
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d["Value - HDI"]))
    .range([margin.left, width - margin.right])
    .nice();

  const y = d3.scaleLog()
    .domain(d3.extent(data, d => d["Value - GDP per capita"]))
    .range([height - margin.bottom, margin.top])
    .nice();

  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.Continent))
    .range(d3.schemeTableau10);

  const size = d3.scaleSqrt()
    .domain(d3.extent(data, d => d["Value - Water Use Efficiency"]))
    .range([4, 30]);

  // Background for click handling
  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "transparent")
    .on("click", clearSelection);

  // Create two tooltips
  const selectedTooltip = d3.select("body").append("div")
    .attr("class", "selected-tooltip")
    .style("position", "absolute")
    .style("background", "rgba(167, 29, 209, 0.1)")
    .style("border", "2px solid #a71dd1")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  const hoverTooltip = d3.select("body").append("div")
    .attr("class", "hover-tooltip")
    .style("position", "absolute")
    .style("background", "rgba(255, 255, 255, 0.7)")
    .style("border", "1px solid #666")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Add title
  const titre = svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text(`GDP & HDI per Country in ${years[0]}`);

  // Add axes
  const xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .call(g => g.append("text")
      .attr("x", width - margin.right)
      .attr("y", -10)
      .attr("fill", "currentColor")
      .attr("text-anchor", "end")
      .text("HDI"));

  const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.append("text")
      .attr("x", 10)
      .attr("y", margin.top)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .text("GDP"));

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
    const tooltipNode = tooltip.node();
    const tooltipWidth = tooltipNode.offsetWidth;
    const tooltipHeight = tooltipNode.offsetHeight;
    
    let left = event.pageX - (tooltipWidth / 2); // Center horizontally
    let top = event.pageY - tooltipHeight - 5; // Position just above point

    // Prevent tooltip from going off screen
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth) {
        left = window.innerWidth - tooltipWidth - 10;
    }
    if (top < 10) {
        top = event.pageY + 15; // Position below point if too high
    }

    tooltip
        .style("left", `${left}px`)
        .style("top", `${top}px`);
  }

  function createTooltipContent(d) {
    return `
      <strong>Country:</strong> ${d.Country}<br>
      <strong>HDI:</strong> ${d["Value - HDI"]}<br>
      <strong>GDP per capita:</strong> ${d["Value - GDP per capita"]}<br>
      <strong>Continent:</strong> ${d.Continent}
    `;
  }

  function drawTrajectory(country, isSelected = false) {
    const countryData = data.filter(d => d.Country === country);
    const lineGenerator = d3.line()
      .x(d => x(+d["Value - HDI"]))
      .y(d => y(+d["Value - GDP per capita"]));

    svg.append("path")
      .datum(countryData)
      .attr("fill", "none")
      .attr("stroke", isSelected ? "#a71dd1" : "#666")
      .attr("stroke-width", isSelected ? 2 : 1.5)
      .attr("d", lineGenerator)
      .attr("class", isSelected ? "trajectory-selected" : "trajectory-hover");
  }

  function clearSelection() {
    if (selectedCountry) {
      svg.selectAll("circle.country")
        .filter(d => d.Country === selectedCountry)
        .attr("r", d => size(d["Value - Water Use Efficiency"]))
        .attr("fill", d => color(d.Continent))
        .attr("stroke", null);

      svg.selectAll(".trajectory-selected").remove();
      selectedCountry = null;
      selectedTooltip.style("opacity", 0);
    }
  }

  function update(year, newSelectedCountry) {
    const filteredData = data.filter(d => d.Year === year);

    // Clear previous selection if country changes
    if (selectedCountry !== newSelectedCountry) {
        // Reset previous selected country
        svg.selectAll("circle.country")
            .filter(d => d.Country === selectedCountry)
            .attr("r", d => size(d["Value - Water Use Efficiency"]))
            .attr("fill", d => color(d.Continent))
            .attr("stroke", null);

        // Remove previous trajectory
        svg.selectAll(".trajectory-selected").remove();
        
        // Update selected country
        selectedCountry = newSelectedCountry;
    }

    // Rest of the update function...
    const countries = svg.selectAll("circle.country")
        .data(filteredData, d => d.Country)
        .join(
        enter => enter.append("circle")
          .attr("class", "country")
          .attr("cx", d => x(d["Value - HDI"]))
          .attr("cy", d => y(d["Value - GDP per capita"]))
          .attr("r", d => size(d["Value - Water Use Efficiency"]))
          .attr("fill", d => color(d.Continent))
          .attr("opacity", 0.7),
        update => update
          .call(update => update.transition()
            .duration(1000)
            .attr("cx", d => x(d["Value - HDI"]))
            .attr("cy", d => y(d["Value - GDP per capita"]))
            .attr("r", d => d.Country === selectedCountry ? 
              size(d["Value - Water Use Efficiency"]) + 10 : 
              size(d["Value - Water Use Efficiency"]))),
        exit => exit.remove()
      );

    // Handle selection from dropdown
    if (selectedCountry) {
        const selectedData = filteredData.find(d => d.Country === selectedCountry);
        if (selectedData) {
            // Update circle appearance
            const selectedCircle = svg.selectAll("circle.country")
                .filter(d => d.Country === selectedCountry);
                
            selectedCircle
                .attr("r", d => size(d["Value - Water Use Efficiency"]) + 10)
                .attr("fill", "#a71dd1")
                .attr("stroke", "#333")
                .attr("stroke-width", 2);

            // Update tooltip content and position
            selectedTooltip
                .style("opacity", 1)
                .html(createTooltipContent(selectedData));

            // Get proper coordinates for tooltip
            const circleX = x(selectedData["Value - HDI"]);
            const circleY = y(selectedData["Value - GDP per capita"]);
            const svgRect = svg.node().getBoundingClientRect();
            
            updateTooltipPosition(selectedTooltip, {
                pageX: circleX + svgRect.left + margin.left, // Add margin offset
                pageY: circleY + svgRect.top + margin.top    // Add margin offset
            });

            // Draw trajectory after transition
            setTimeout(() => {
                svg.selectAll(".trajectory-selected").remove();
                drawTrajectory(selectedCountry, true);
            }, 1000); // Match transition duration
        }
    }

    // Handle hover
    countries
        .on("mouseover", (event, d) => {
            hoverTooltip
                .style("opacity", 1)
                .html(createTooltipContent(d));

            updateTooltipPosition(hoverTooltip, event);

            // Draw trajectory
            drawTrajectory(d.Country);
        })
        .on("mousemove", event => updateTooltipPosition(hoverTooltip, event))
        .on("mouseout", () => {
            hoverTooltip.style("opacity", 0);
            svg.selectAll(".trajectory-hover").remove();
        });
    // Update year displays
    yearLabel.text(year);
    titre.text(`GDP & HDI per Country in ${year}`);

    // Update selected country trajectory if exists
    if (selectedCountry) {
      svg.selectAll(".trajectory-selected").remove();
      drawTrajectory(selectedCountry, true);
    }

    // Update size legend
    updateSizeLegend(filteredData);
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

  function updateSizeLegend(filteredData) {
    // Remove previous size legend
    svg.selectAll(".size-legend").remove();

    // Use fixed radius values
    const radiusValues = [30, 21, 12, 4];  // From largest to smallest

    // Get current year's efficiency range
    const currentEfficiencyExtent = d3.extent(filteredData, d => d["Value - Water Use Efficiency"]);
    
    // Calculate values for current year that correspond to the fixed radii
    const sizeValues = radiusValues.map(r => {
        const normalizedRadius = (r - 4) / (30 - 4); // Convert radius to 0-1 range
        return currentEfficiencyExtent[0] + 
               normalizedRadius * (currentEfficiencyExtent[1] - currentEfficiencyExtent[0]);
    });

    const sizeLegend = svg.append("g")
        .attr("class", "size-legend")
        .attr("transform", `translate(${margin.left + 75}, ${margin.top + 180})`);

    sizeLegend.append("text")
        .attr("y", -40)
        .attr("fill", "currentColor")
        .attr("font-size", 12)
        .attr("font-weight", "bold")
        .text("Water Use Efficiency (US$/m³)");

    let currentX = 0;

    radiusValues.forEach((radius, i) => {
        const legendItem = sizeLegend.append("g")
            .attr("transform", `translate(${currentX}, 0)`);
        
        legendItem.append("circle")
            .attr("r", radius)
            .attr("fill", "none")
            .attr("stroke", "currentColor")
            .attr("stroke-width", 1)
            .attr("opacity", 0.7);

        legendItem.append("text")
            .attr("y", radius + 15)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .attr("fill", "currentColor")
            .attr("font-size", 10)
            .text(d3.format(",.0f")(sizeValues[i]));

        currentX += Math.max(radius * 2.5, 40);
    });
  }

  // Remove click handler from background
  svg.select("rect")
    .on("click", null);

  return update;
}