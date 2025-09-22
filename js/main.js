// Initialize helper function to convert date strings to date objects
const parseTime = d3.timeParse("%Y-%m-%d");

let data, timeline;

//Load data from CSV file asynchronously and render chart
d3.csv('data/disaster_costs.csv').then(_data => {
  data = _data;
  data.forEach(d => {
    d.cost = +d.cost;
    d.year = +d.year;
    d.date = parseTime(d.mid);
    d.disaster = d.name;
    d.category = d.category;
  });

  timeline = new Timeline({parentElement: '#vis',}, data);
  timeline.updateVis();
});

// Legend event listeners
// https://codesandbox.io/p/sandbox/github/UBC-InfoVis/2021-436V-examples/tree/master/d3-interactive-scatter-plot?file=%2Fjs%2Fmain.js%3A6%2C18
d3.selectAll('.legend-item').on('click', function () {
  // Make a category inactive
  d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));

  // Check which categories are active
  let selectedCategories = [];
  d3.selectAll('.legend-item:not(.inactive)').each(function () {
    selectedCategories.push(d3.select(this).attr('disaster'));
  });

  // Filter data with selected categories and update vis
  timeline.data = data.filter(d => selectedCategories.includes(d.category));
  // https://stackoverflow.com/questions/22452112/nvd3-clear-svg-before-loading-new-chart 
  d3.selectAll('svg').remove();
  timeline.initVis();
});