// Data processing functions
export function processData(data) {
    return data.map(d => ({
        ...d,
        Year: Number(d.Year),
        "Value - GDP per capita": d["Value - GDP per capita"] !== "" ? Number(d["Value - GDP per capita"]) : NaN,
        "Value - HDI": d["Value - HDI"] !== "" ? Number(d["Value - HDI"]) : NaN
    })).filter(d => {
        const validGDP = !isNaN(d["Value - GDP per capita"]);
        const validHDI = !isNaN(d["Value - HDI"]);
        return validGDP && validHDI;
    });
}

// Get years from data
export function getYears(data) {
    return d3.extent(data, d => d.Year);
}

// Helper function to compute rankings and maintain country order
export function computeRankings(data, metric, ascending) {
    const values = data.map(d => ({
      country: d.Country,
      value: d[metric]
    }));
    
    values.sort((a, b) => ascending ? 
      a.value - b.value : 
      b.value - a.value
    );
    
    // Create rankings object and ordered countries array
    const rankings = {};
    const orderedCountries = [];
    values.forEach((item, index) => {
      rankings[item.country] = index + 1;
      orderedCountries.push(item.country);
    });
    
    return {rankings, orderedCountries};
  }