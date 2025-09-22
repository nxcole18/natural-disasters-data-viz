class Timeline {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      disasterCategories: _config.disasterCategories,
      containerWidth: 800,
      containerHeight: 900,
      margin: { top: 106, right: 20, bottom: 20, left: 45 },
      tooltipPadding: 15
    }
    this.data = _data;

    // Init max/min data values
    this.maxCost = d3.max(this.data, row => row.cost);
    this.minCost = d3.min(this.data, row => row.cost);

    // https://d3js.org/d3-scale/ordinal for ordinal color scale
    this.categoryColor = d3.scaleOrdinal(["#ccc", "#ffffd9", "#41b6c4", "#081d58", "#c7e9b4"])
      .domain(["winter-storm-freeze", "drought-wildfire", "flooding", "tropical-cyclone", "severe-storm"]);

    this.initVis();
  }

  /**
   * Initialize the arc generator, scales, axes, and append static elements
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize scales and axes
    // X axis - Months
    vis.xScale = d3.scaleTime()
      .domain([1, 13])
      .range([0, vis.width]);
    vis.xAxis = d3.axisTop(vis.xScale)
      .tickValues(d3.range(1, 13))
      .tickFormat(d => {
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return months[d - 1]
      })
      .tickSize(11)
      .tickSizeOuter(0)
      .tickPadding(8);

    // Y axis - Years
    vis.yScale = d3.scaleLinear()
      .domain([1980, 2017])
      .range([vis.height, 0]);
    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(38)
      .tickFormat(d => d)
      .tickSize(-vis.width)
      .tickSizeOuter(0)
      .tickPadding(10);

    // Radius Scale
    vis.radiusScale = d3.scaleSqrt()
      .domain([vis.minCost, vis.maxCost])
      .range([4, 120]);

    // Initialize arc generator that we use to create the SVG path for the half circles. 
    vis.arcGenerator = d3.arc()
      .outerRadius(d => vis.radiusScale(d))
      .innerRadius(0)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
      .attr('class', 'chart')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chartArea = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append axis groups
    vis.xAxisG = vis.chartArea.append('g')
      .attr('class', 'x-axis')
      .attr('transform', 'translate(0,0)');
    vis.yAxisG = vis.chartArea.append('g')
      .attr('class', 'y-axis');

    // Initialize clipping mask that covers the whole chart
    vis.chartArea.append('defs')
      .append('clipPath')
      .attr('id', 'chart-mask')
      .append('rect')
      .attr('width', vis.width)
      .attr('y', -vis.config.margin.top)
      .attr('height', vis.config.containerHeight);

    // Apply clipping mask to 'vis.chart' to clip semicircles at the very beginning and end of a year
    vis.chart = vis.chartArea.append('g')
      .attr('clip-path', 'url(#chart-mask)');

    vis.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;

    // Create grouped dataset for year 
    vis.groupedYears = d3.groups(vis.data, d => d.year);

    // Create hashmap for costliest disaster amount per year
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
    vis.costliestDisastersMap = {}
    vis.groupedYears.forEach(function (year) {
      let currYear = year[0]
      let maxCostDisaster = d3.max(year[1], d => d.cost)
      vis.costliestDisastersMap[currYear] = maxCostDisaster
    })

    // Prepare scales
    vis.xValue = d => d.date;
    vis.yValue = d => d.year;
    vis.yScale.domain(d3.extent(vis.data, vis.yValue));

    // Init circle group
    vis.circleGroup = vis.chart.append('g')
      .attr('class', 'circle-group');

    vis.renderVis();
  }

  /**
   * Bind data to visual elements (enter-update-exit) and update axes
   */
  renderVis() {
    let vis = this;

    // Level 1 data grouped by years
    const yearRow = vis.circleGroup.selectAll('.year-row')
      .data(vis.groupedYears)
      .join('g')
      .attr('class', 'year-row')
      .attr('transform', d => {
        return `translate(0,${vis.yScale(d[0])})`
      }
      );

    // Level 2 data (inherits level 1) grouped by disasters
    const disasterRow = yearRow.selectAll('.disaster-row')
      .data(d => d[1])
      .join('g')
      .attr('class', 'disaster-row')
      .attr('transform', d => {
        // Process dates (string) to time objects
        let preDate = d.mid.slice(5)

        // https://d3-wiki.readthedocs.io/zh-cn/master/Time-Formatting/ Convert date to day of the year
        let dateParser = d3.timeParse("%m-%d")
        let dateParsed = dateParser(preDate)
        let processedDate = d3.timeFormat("%j")(dateParsed)

        return `translate(${vis.xScale(processedDate / 27)})`
      }
      );


    // Level 3 data with labels
    const mark = disasterRow.selectAll('.mark')
      .data(d => [d])
      .join('text')
      .attr('y', 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('font-size', 11)
      .text(function (d) {
        if (d.cost == vis.costliestDisastersMap[d.year]) {
          return d.name
        } else {
          return null
        }
      });
    disasterRow.selectAll('.mark')
      .data(d => [d])
      .join('path')
      .attr('class', 'mark')
      .attr('d', d => vis.arcGenerator(d.cost))
      // Semi-circle styling
      .attr('fill-opacity', 0.60)
      .attr('stroke', '#333')
      .attr('stroke-width', 0.3)
      // Category colouring
      .attr('fill', function (d) {
        return vis.categoryColor(d.category)
      });

    // Tooltip listener
    // https://codesandbox.io/p/sandbox/github/UBC-InfoVis/2021-436V-examples/tree/master/d3-interactive-scatter-plot?file=%2Fjs%2Fscatterplot.js%3A148%2C9-148%2C50
    disasterRow.selectAll('.mark')
      .on('mouseover', (event, d) => {
        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
          .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
          .html(`<div class="tooltip-title">${d.name}</div>
            <div><i>$${d.cost} billion</i></div>`);
      })
      .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
      });

    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }

}