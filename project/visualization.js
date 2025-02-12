import { initScrubber } from './src/scrubber.js';
import { processData, getYears } from './src/utils.js';
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
    
    const update1 = createGraph1(processedData, years);
    const update2 = createGraph2(processedData, years);
    const scrubber = initScrubber(processedData);
    
    // Link scrubber to graph update
    scrubber.addEventListener('input', event => {
        update1(event.detail);
        update2(event.detail);
    });
}

init();