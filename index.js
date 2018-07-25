// Started working from here
// https://towardsdatascience.com/building-a-co-occurrence-matrix-with-d3-to-analyze-overlapping-topics-in-dissertations-fb2ae9470dee

var margin = {
    top: 285,
    right: 0,
    bottom: 10,
    left: 285
  },
  width = 700,
  height = 700

var svg = d3
  .select('#CoOccurrenceMatrix')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
svg
  .append('rect')
  .attr('class', 'background')
  .attr('width', width)
  .attr('height', height)

var myData = {
  rowLabels: [
    'ADMINISTRAÇÃO',
    'ANTROPOLOGIA',
    'BIOLOGIA ANIMAL',
    'BIOLOGIA APLICADA À SAÚDE'
  ],
  rowIndexes: [1, 2, 3, 4],
  columnLabels: ['MYCOLUMN', 'MYCOLUMN2', 'MYCOLUMN3', 'MYCOLUMN4'],
  columnIndexes: [1, 2, 3, 4]
}

var links = [
  { source: 0, target: 0, value: 0.0 },
  { source: 0, target: 1, value: 2.0 },
  { source: 1, target: 0, value: 2.0 }
]

var rowData = myData.rowLabels.map((rowLabel, i) => {
  return {
    index: myData.rowIndexes[i] - 1,
    name: rowLabel
  }
})

var columnData = myData.columnLabels.map((columnLabel, i) => {
  return {
    index: myData.columnIndexes[i] - 1,
    name: columnLabel
  }
})

var data = {
  nodes: [
    {
      group: 'humanas',
      index: 0,
      name: 'ADMINISTRAÇÃO'
    },
    {
      group: 'humanas',
      index: 1,
      name: 'ANTROPOLOGIA'
    }
  ]
}

var matrix = []
var nodes = rowData
var total_items = nodes.length
var matrixScale = d3
  .scaleBand()
  .range([0, width])
  .domain(d3.range(total_items))
var opacityScale = d3
  .scaleLinear()
  .domain([0, 10])
  .range([0.3, 1.0])
  .clamp(true)
var colorScale = d3.scaleOrdinal(d3.schemeCategory20)
// Create rows for the matrix
nodes.forEach(function(node) {
  node.count = 0
  node.group = groupToInt(node.group)
  matrix[node.index] = d3.range(total_items).map(item_index => {
    return {
      x: item_index,
      y: node.index,
      z: 0
    }
  })
})
// Fill matrix with data from links and count how many times each item appears
links.forEach(function(link) {
  matrix[link.source][link.target].z += link.value
  matrix[link.target][link.source].z += link.value
  nodes[link.source].count += link.value
  nodes[link.target].count += link.value
})
// Draw each row (translating the y coordinate)
var rows = svg
  .selectAll('.row')
  .data(matrix)
  .enter()
  .append('g')
  .attr('class', 'row')
  .attr('transform', (d, i) => {
    return 'translate(0,' + matrixScale(i) + ')'
  })
var squares = rows
  .selectAll('.cell')
  .data(d => d.filter(item => item.z > 0))
  .enter()
  .append('rect')
  .attr('class', 'cell')
  .attr('x', d => matrixScale(d.x))
  .attr('width', matrixScale.bandwidth())
  .attr('height', matrixScale.bandwidth())
  .style('fill-opacity', d => opacityScale(d.z))
  .style('fill', d => {
    return nodes[d.x].group == nodes[d.y].group
      ? colorScale(nodes[d.x].group)
      : 'grey'
  })
// .on('mouseover', mouseover)
// .on('mouseout', mouseout)
var columns = svg
  .selectAll('.column')
  .data(matrix)
  .enter()
  .append('g')
  .attr('class', 'column')
  .attr('transform', (d, i) => {
    return 'translate(' + matrixScale(i) + ')rotate(-90)'
  })
rows
  .append('text')
  .attr('class', 'label')
  .attr('x', -5)
  .attr('y', matrixScale.bandwidth() / 2)
  .attr('dy', '.32em')
  .attr('text-anchor', 'end')
  .text((d, i) => capitalize_Words(nodes[i].name))
columns
  .append('text')
  .attr('class', 'label')
  .attr('y', 100)
  .attr('y', matrixScale.bandwidth() / 2)
  .attr('dy', '.32em')
  .attr('text-anchor', 'start')
  .text((d, i) => capitalize_Words(columnData[i].name))

rows.append('line').attr('x2', width)
columns.append('line').attr('x1', -width)

function groupToInt(area) {
  if (area == 'exatas') {
    return 1
  } else if (area == 'educacao') {
    return 2
  } else if (area == 'humanas') {
    return 3
  } else if (area == 'biologicas') {
    return 4
  } else if (area == 'linguagem') {
    return 5
  } else if (area == 'saude') {
    return 6
  }
}
function intToGroup(area) {
  if (area == 1) {
    return 'exatas'
  } else if (area == 2) {
    return 'educacao'
  } else if (area == 3) {
    return 'humanas'
  } else if (area == 4) {
    return 'biologicas'
  } else if (area == 5) {
    return 'linguagem'
  } else if (area == 6) {
    return 'saude'
  }
}
function capitalize_Words(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}
