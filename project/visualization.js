import { initScrubber } from './src/scrubber.js';
import { processData, getYears, getUniqueCountries } from './src/utils.js';
import { createGraph1 } from './src/graph1.js';
import { createGraph2 } from './src/graph2.js';


// Constants and configurations
const width = 960;
const height = 600;
const margin = { top: 40, right: 40, bottom: 60, left: 60 };



// Initialize visualizations
async function init() {
    const data = await d3.csv("aquastat_data.csv");
    const processedData = processData(data);
    const years = getYears(processedData);
    const countries = getUniqueCountries(processedData);
    
    // Create country selector
    const select = d3.select('#controls')
        .append('select')
        .attr('id', 'countrySelector')
        .on('change', function() {
            const selectedCountry = this.value;
            update1(currentYear, selectedCountry);
            update2(currentYear, selectedCountry);
        });

    select.selectAll('option')
        .data(countries)
        .join('option')
        .attr('value', d => d)
        .text(d => d);
        
    let currentYear = years[0];
    const update1 = createGraph1(processedData, years);
    const update2 = createGraph2(processedData, years);
    const scrubber = initScrubber(processedData);
    
    // Link scrubber to graph update
    scrubber.addEventListener('input', event => {
        currentYear = event.detail;
        update1(currentYear, select.node().value);
        update2(currentYear, select.node().value);
    });
}

init();