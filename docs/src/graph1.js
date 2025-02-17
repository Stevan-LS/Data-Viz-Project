import { computeRankings } from "./utils.js";
import { config } from "./config.js";

const { width, height, margin } = config;
let countrySelector = config.defaultCountry;

export function createGraph1(data, years) {
    const svg = d3.select('#graph1')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '400')
        .attr("viewBox", [0, 0, width, height]);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Define metrics and their sorting order
    const metricConfig = {
        'Value - GDP per capita': { ascending: false },
        'Value - HDI': { ascending: false },
        'Value - Water Use Efficiency': { ascending: false },
        'Value - Water Stress': { ascending: true }
    };

    function update(year, countrySelector) {
        // Clear previous content
        svg.selectAll('*').remove();
        
        const filteredData = data.filter(d => d.Year === year);

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', margin.top / 10)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .text(`Rankings for ${countrySelector} in ${year}`);
        
        // Create base group
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Compute rankings for each metric
        const rankings = {};
        const orderedCountries = {};
        Object.entries(metricConfig).forEach(([metric, config]) => {
            const result = computeRankings(filteredData, metric, config.ascending);
            rankings[metric] = result.rankings;
            orderedCountries[metric] = result.orderedCountries;
        });

        // Set up scales
        const metrics = Object.keys(metricConfig);
        const xScale = d3.scaleBand()
            .domain(metrics)
            .range([0, innerWidth])
            .padding(0.2);

        // Add vertical lines for each metric
        g.selectAll('.metric-line')
            .data(metrics)
            .join('line')
            .attr('class', 'metric-line')
            .attr('x1', d => xScale(d) + xScale.bandwidth() / 2)
            .attr('x2', d => xScale(d) + xScale.bandwidth() / 2)
            .attr('y1', 0)
            .attr('y2', innerHeight)
            .style('opacity', 1);

        // Create groups for each metric
        const metricGroups = g.selectAll('.metric-group')
            .data(metrics)
            .join('g')
            .attr('class', 'metric-group')
            .attr('transform', d => `translate(${xScale(d)},0)`);

        // For each metric, add rectangles for all countries
        metrics.forEach(metric => {
            const metricGroup = g.select(`.metric-group:nth-of-type(${metrics.indexOf(metric) + 1})`);

            const yScale = d3.scalePoint()
                .domain(orderedCountries[metric])
                .range([0, innerHeight])
                .padding(0.01);
            
            // First, let's create a group for each country that will contain both the rectangle and its label
            metricGroup.selectAll('.country-group')
                .data(filteredData)
                .join('g')
                .attr('class', 'country-group')
                .each(function(d) {
                    const group = d3.select(this);
                
                    // Add the rectangle
                    group.append('rect')
                        .attr('class', 'background-rect')
                        .attr('x', 0)
                        .attr('y', yScale(d.Country) - 5)
                        .attr('width', xScale.bandwidth() / 10)
                        .attr('height', 1)
                        .attr('fill', d.Country === countrySelector ? '#2196F3' : '#E0E0E0')
                        .attr('opacity', d.Country === countrySelector ? 1 : 0.5);
                
                    // Add the text label
                    group.append('text')
                        .attr('class', 'country-label')
                        .attr('x', xScale.bandwidth() / 2) // Center the text horizontally
                        .attr('y', yScale(d.Country) + 3)  // Center the text vertically
                        .attr('text-anchor', 'middle')     // Center align the text
                        .attr('dominant-baseline', 'middle')
                        .attr('fill', d.Country === countrySelector ? 'white' : 'black')
                        .attr('font-size', d.Country === countrySelector ? '12px' : '10px');
                });

            const colorScale = d3.scaleSequential()
                .domain([1, filteredData.length])
                .interpolator(t => d3.interpolate("#0d47a1", "#90caf9")(t));

            // Add larger rectangle for selected country
            const selectedCountryData = filteredData.find(d => d.Country === countrySelector);
            if (selectedCountryData) {
                const rankingPosition = rankings[metric][countrySelector];

                // Add ranking number at the top of the metric line
                metricGroup.append('text')
                    .attr('class', 'ranking-label')
                    .attr('x', xScale.bandwidth() / 2)
                    .attr('y', -10)  // Position above the metric line
                    .attr('text-anchor', 'middle')
                    .attr('fill', '#2196F3')
                    .attr('font-weight', 'bold')
                    .attr('font-size', '14px')
                    .text(`#${rankingPosition}`);

                metricGroup.append('rect')
                    .attr('class', 'selected-rect')
                    .attr('x', 0)
                    .attr('y', yScale(countrySelector) - 10)
                    .attr('width', xScale.bandwidth())
                    .attr('height', 20)
                    .attr('fill', colorScale(rankingPosition))  // Use color based on ranking
                    .attr('opacity', 0.9);

                // Add value label for selected country
                metricGroup.append('text')
                    .attr('class', 'value-label')
                    .attr('x', xScale.bandwidth() / 2)
                    .attr('y', yScale(countrySelector) + 4)
                    .attr('text-anchor', 'middle')
                    .attr('fill', 'white')
                    .text(() => {
                        const value = selectedCountryData[metric];
                        if (metric === "Value - GDP per capita") {
                            return value ? `$${value.toLocaleString()}` : "N/A";
                        }
                        return value || "N/A";
                    });
            }
        });

        // Add metric labels
        g.selectAll('.metric-label')
        .data(metrics)
        .join('text')
        .attr('class', 'metric-label')
        .attr('x', d => xScale(d) + xScale.bandwidth() / 2)
        .attr('y', innerHeight + 30)
        .attr('text-anchor', 'middle')
        .text(d => d.slice(8).toUpperCase());
    }

    return update;
}
