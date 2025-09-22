# P1: The Cost of Natural Disasters

Sources + Modifications:
* TA Office Hours (Francis)
    * Went to Francis' OH on Feb 7, 2025 to ask for clarification on how the levels work in, 3. Draw the semicircles. Francis helped me with the general code structure of the three levels and guided me on what data each level should hold and how it should be joined with the next level. He also taught me how to do anonymous functions and I wrote all the code within the anonymous functions. I made modifications to the values in each of the functions. 
* https://d3-wiki.readthedocs.io/zh-cn/master/Time-Formatting/ 
    * This source was referenced to help me understand how time formatting works in d3 and I used what I learned about the time formatting functions and time formatters to write code to parse string dates to time objects.
* https://codesandbox.io/p/sandbox/github/UBC-InfoVis/2021-436V-examples/tree/master/d3-interactive-scatter-plot?file=%2Fjs%2Fscatterplot.js%3A148%2C9-148%2C50 
    * I used this example extensively for a variety of parts in my code:
        * CSS styles: Most of my CSS styles are referenced from the example's CSS but I made modifications to colours, spacings, and sizes to suit P1 and personal style.
        * HTML legend: I learned how to do a legend in HTML through this example and referenced the HTML structure but modified the class names,  attribute names, and text displayed. I also moved it to the appropriate level in the HTML.
        * Filter/legend event listener: I referenced the code in the example's main.js to write my event listener in my own main.js. The code is practically the same because I followed the structure, but I modified the values passed into the function and added an additional line of code to clear the svg.
        * Tooltip listener: In addition to learning about how to write a tooltip from the tutorial, my code is referenced from this example. I only made modifications to the d3.select.html section.
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach 
    * I referenced this source to learn how to use forEach properly for my purposes.
* https://d3js.org/d3-scale/ordinal
    * I referenced this source to learn how to use an ordinal scale to be able to use it for the category colours in the assignment.
* https://stackoverflow.com/questions/22452112/nvd3-clear-svg-before-loading-new-chart
    * I referenced a few responses on stack overflow before determining that the following code would work for my purposes: "d3.selectAll('svg').remove()". I played around with this code to see if I could make any modifications but did not end up making any modifications.
