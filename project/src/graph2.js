import { config } from "./config.js";

const { width, height, margin } = config;

export function createGraph2(data, years) {
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

    // Create tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function update(year) {
        const filteredData = data.filter(d => d.Year === year);
        
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
                        .attr("r", d => size(d["Value - Water Use Efficiency"]))),
                exit => exit.remove()
            )
            .on("mouseover", (event, d) => {
                d3.select(event.target)
                    .attr("r", d => size(d["Value - Water Use Efficiency"]) + 10)
                    .attr("fill", "#a71dd1")
                    .attr("stroke", "#333")
                    .attr('stroke-width', 2);

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                tooltip.html(`
                    <strong>Country:</strong> ${d.Country}<br>
                    <strong>HDI:</strong> ${d["Value - HDI"]}<br>
                    <strong>GDP per capita:</strong> ${d["Value - GDP per capita"]}<br>
                    <strong>Continent:</strong> ${d.Continent}
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", (event) => {
                d3.select(event.target)
                    .attr("r", d => size(d["Value - Water Use Efficiency"]))
                    .attr("fill", d => color(d.Continent))
                    .attr("stroke", null);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        yearLabel.text(year);
        titre.text(`GDP & HDI per Country in ${year}`);
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