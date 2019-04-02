function renderSvg(userEdu, counties) {
  const margin = { top: 50, left: 50, right: 50, bottom: 50 },
    height = 800 - margin.top - margin.bottom,
    width = 1100 - margin.left - margin.right;

  const maxEdu = d3.max(userEdu, d => d.bachelorsOrHigher)
  const minEdu = d3.min(userEdu, d => d.bachelorsOrHigher)

  d3.select('body')
    .append('h1')
    .html('US Education Attainment')
    .attr('id', 'title')
    .style('text-align', 'center')

  d3.select('body')
    .append('h4')
    .html('Percentage of persons over 25 who acquired Bachelors or Higher Degree (2010-2014)')
    .attr('id', 'description')
    .style('text-align', 'center')

  d3.select('body')
    .append('div')
    .attr('id', 'tooltip')
    .style('background', 'rgba(255, 251, 0, 0.377)')
    .style('border-radius', '5px')
    .style('padding', '5px')
    .style('position', 'absolute')
    .style('display', 'none')


  const svg = d3.select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // color scale
  const colorScale = d3.scaleThreshold()
    .domain(d3.range(minEdu, maxEdu, (maxEdu - minEdu) / 9))
    .range(d3.schemeBlues[9])

  d3.select('svg')
    .append('g')
    .attr('id', 'legend')
    .attr('transform', 'translate(500,0)')
    .selectAll('rect')
    .data(d3.schemeBlues[9])
    .enter()
    .append('rect')
    .attr('width', 24)
    .attr('height', 24)
    .attr('fill', (d, i) => d)
    .attr('x', (d, i) => i * 200 / 9)

  const scaleLegend = d3.scaleLinear()
    .domain([minEdu, maxEdu])
    .range([0, 200])
    .nice()

  const xLegend = d3.axisBottom()
    .scale(scaleLegend)
    .ticks(9)
    .tickFormat(d => d + '%')

  d3.select('#legend')
    .append('g')
    .call(xLegend)
    .attr('transform', 'translate(0, 24)')

  svg.append('g')
    .selectAll('path')
    .data(topojson.feature(counties, counties.objects.counties).features)
    .enter()
    .append('path')
    .attr('d', d3.geoPath()) // draw path
    .attr('fill', d => {
      const match = userEdu.filter(dEdu => { // find match
        return dEdu.fips === d.id
      })
      return match[0] ? colorScale(match[0].bachelorsOrHigher) : colorScale(0)
    })
    .attr('class', 'county')
    .attr('data-fips', d => {
      const match = userEdu.filter(dEdu => { // find match
        return dEdu.fips === d.id
      })
      return match[0].fips
    })
    .attr('data-education', d => {
      const match = userEdu.filter(dEdu => { // find match
        return dEdu.fips === d.id
      })
      return match[0].bachelorsOrHigher
    })
    .on('mouseover', () => {
      d3.select('#tooltip').style('display', 'block')
    })
    .on('mouseout', () => {
      d3.select('#tooltip').style('display', 'none')
    })
    .on('mousemove', function (d) {
      let xPos = d3.mouse(this)[0] + 60
      let yPos = d3.mouse(this)[1] + 146
      d3.select('#tooltip')
        .style('top', yPos + 'px')
        .style('left', xPos + 'px')
        .html(dx => {
          const match = userEdu.filter(dEdu => { // find match
            return dEdu.fips === d.id
          })
          return `${match[0].area_name} ${match[0].bachelorsOrHigher}%`
        })
        .attr('data-education', dx => {
          const match = userEdu.filter(dEdu => { // find match
            return dEdu.fips === d.id
          })
          return match[0].bachelorsOrHigher
        })
    })


}

//###############3

(function () {
  fetch("./counties.json").then(res => res.json()).then(data1 => {
    function getData1(data1) {
      fetch('./for_user_education.json').then(res => res.json()).then(data2 => {
        function getData2(userEdu, counties) {
          renderSvg(userEdu, counties)
        }
        getData2(data2, data1)
      })
    }
    getData1(data1)
  })
})()


