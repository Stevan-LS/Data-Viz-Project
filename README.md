# Global Water Resource Visualization

A dynamic data visualization project focused on exploring and analyzing global water resources using AQUASTAT data. This interactive web-based dashboard presents multiple visualizations to help understand water availability, usage patterns, and related metrics across different countries and regions.

## Project Overview

This project provides an interactive platform to explore water resource data through multiple coordinated visualizations:

- **Multiple Interactive Graphs**: Three interconnected visualizations (graph1, graph2, graph3) that provide different perspectives on the data
- **Dynamic Controls**: Interactive elements allowing users to filter and manipulate the displayed data
- **Responsive Design**: Optimized layout for various screen sizes with zoom functionality

## Technologies Used

- **D3.js**: Primary visualization library for creating interactive data graphics
- **JavaScript**: Core programming language for visualization logic and interactions
- **HTML/CSS**: Structure and styling for the web interface
- **Data Processing**: Data preparation and dimensionality reduction (TSNE) for advanced visualization

## Features

- **Zoom Functionality**: Detailed examination of specific data points
- **Interactive Controls**: Filtering and parameter adjustment capabilities
- **Coordinated Views**: Changes in one visualization affect related visualizations
- **Metrics Panel**: Explanations of water resource metrics for better understanding

## Project Structure

- `docs/` - Main project directory
  - `index.html` - Main webpage structure
  - `styles.css` - Visual styling
  - `visualization.js` - Core visualization initialization
  - `aquastat_TSNE_data.csv` - Processed dataset
  - `src/` - Source code modules
    - `config.js` - Configuration settings
    - `graph1.js`, `graph2.js`, `graph3.js` - Individual visualization implementations
    - `scrubber.js` - Time-based data navigation
    - `utils.js` - Helper functions

## Getting Started

1. Clone this repository
2. Open `docs/index.html` in a modern web browser
3. Interact with the visualizations to explore global water resource data

## Data Source

This project uses AQUASTAT data, which provides comprehensive water-related statistics at the country level.

## Authors

- Axel Labrousse
- Stevan Le Stanc

## License

This project is available for academic and personal use.