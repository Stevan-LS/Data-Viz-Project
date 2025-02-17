import { initScrubber } from './src/scrubber.js';
import { processData, getYears, getUniqueCountries } from './src/utils.js';
import { createGraph1 } from './src/graph1.js';
import { createGraph2 } from './src/graph2.js';

function initZoomButtons() {
    const zoomButtons = document.querySelectorAll('.zoom-button');
    
    zoomButtons.forEach(button => {
        button.addEventListener('click', () => {
            const graphId = button.dataset.graph;
            const wrapper = button.parentElement;
            
            if (wrapper.classList.contains('fullscreen')) {
                wrapper.classList.remove('fullscreen');
                button.innerHTML = '<span class="zoom-icon">🔍</span>';
            } else {
                wrapper.classList.add('fullscreen');
                button.innerHTML = '<span class="zoom-icon">✖</span>';
            }
            
            // Trigger resize event to update graph
            window.dispatchEvent(new Event('resize'));
        });
    });
}


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
    
    let currentYear = years[0];  // Move this declaration before select creation
    const update1 = createGraph1(processedData, years);
    const update2 = createGraph2(processedData, years);
    
    // Create country selector
    const select = d3.select('#controls')
        .append('select')
        .attr('id', 'countrySelector')
        .on('change', function() {
            const selectedCountry = this.value;
            // Immediately update both graphs when country changes
            update1(currentYear, selectedCountry);
            update2(currentYear, selectedCountry);
        });

    select.selectAll('option')
        .data(countries)
        .join('option')
        .attr('value', d => d)
        .text(d => d)
        .property('selected', d => d === 'France');
    
    const scrubber = initScrubber(processedData);
    
    // Link scrubber to graph update
    scrubber.addEventListener('input', event => {
        currentYear = event.detail;
        update1(currentYear, select.node().value);
        update2(currentYear, select.node().value);
    });

    initZoomButtons();

    // Initial render with default values
    update1(currentYear, select.node().value);
    update2(currentYear, select.node().value);
}

init();