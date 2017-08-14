//  Copyright 2017 Zachary James Guard
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

const UPDATE_INTERVAL = 10 * 1000; // doesn't have to match the one in Main.java, but if it's too high then we'll just be getting repeats of the same data

const GET_PAST_DATA_URL = "/get_past_data"
const UPDATE_DATA_URL = "/update_data"

const statsIntervals = [{
  label: "1 min", size: 60 * 1000
}, {
  label: "5 min", size: 5 * 60 * 1000
}, {
  label: "15 min", size: 15 * 60 * 1000
}, {
  label: "30 min", size: 30 * 60 * 1000
}, {
  label: "all", size: Infinity
}]
const statsParameters = [{
  function: stats.mean, label: "mean"
}, {
  function: stats.medianQuickPresorted, label: "median"
}, {
  function: stats.modeQuick, label: "mode"
}, {
  function: function(values) { return Math.min.apply(window, values) }, label: "min"
}, {
  function: function(values) { return Math.max.apply(window, values) }, label: "max"
}]

const updateChart = function(chart, data, options) {
  if (options && options.prepend === true) {
    chart.data.datasets[0].data.unshift(data)
  } else {
    chart.data.datasets[0].data.push(data)
  }

  chart.update()
}

/**
 0  1  2  3  4
 5  6  7  8  9
10 11 12 13 14
15 16 17 18 19
20 21 22 23 24

5 * (stat. param. index) + (interval index)
**/
const updateStats = function(id) {
  var idInfo = ids[id]
  var now = new Date().getTime()
  var tds = idInfo.statsContainer.querySelectorAll("td")
  
	var tableElem = idInfo.statsContainer.querySelector("table")
	for (let i = 0, l = statsIntervals.length; i < l; i++) {
	  var interval = statsIntervals[i]
	  var intervalSize = interval.size
	  var relevantValues = []
	  for (let j = values[id].length - 1; j >= 0; j--) {
	    if (now - values[id][j].time < intervalSize) {
	      relevantValues.push(values[id][j][id])
	    }
	  }
	  console.log(relevantValues)
	  for (let p = 0, l = statsParameters.length; p < l; p++) {
		  console.log(id + " " + statsParameters[p].label + ": " + statsParameters[p].function(relevantValues))
	    tds[5 * p + i].textContent = statsParameters[p].function(relevantValues).toFixed(2).toString()
	  }
	}
}

var tpsLineChart = new Chart(document.querySelector(".chart--tps").getContext("2d"), {
  type: "line",
  data: {
    datasets: [{
      label: "TPS",
      data: [],
      backgroundColor: "#82B1FF", // blue A100
      borderColor: "#2979FF" // blue A400
    }]
  },
  options: {
    responsive: false,
    elements: { point: { hitRadius: 10, hoverRadius: 10 } },
    scales: {
      xAxes: [{
        type: "time",
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
          min: 0,
          max: 20
        }
      }]
    },
    zoom: {
      enabled: true,
	  drag: true,
	  mode: "x",
	  limits: {
	    max: 10,
		min: 0.5
	  }
	}
  }
})

var playerCountLineChart = new Chart(document.querySelector(".chart--player-count").getContext("2d"), {
  type: "line",
  data: {
    datasets: [{
      label: "Players",
      data: [],
      backgroundColor: "#69F0AE", // green A200
      borderColor: "#00C853" // green A700
    }]
  },
  options: {
    responsive: false,
    elements: { point: { hitRadius: 10, hoverRadius: 10 } },
    scales: {
      xAxes: [{
        type: "time",
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
          min: 0,
          stepSize: 1
        }
      }]
    },
    zoom: {
      enabled: true,
  	  drag: true,
  	  mode: "x",
  	  limits: {
  	    max: 10,
  		min: 0.5
  	  }
  	}
  }
})

var ids = {
  "tps": {
    chart: tpsLineChart,
    tableDataElem: document.querySelector(".table_tps_data"),
    statsContainer: document.querySelector(".section--tps .stats-container")
  },
  "playerCount": {
    chart: playerCountLineChart,
    tableDataElem: document.querySelector(".table_player-count_data"),
    statsContainer: document.querySelector(".section--player-count .stats-container")
  }
}

var values = {}
for (let id of Object.keys(ids)) {
  values[id] = []
}

//cols: statsIntervals.length + 1
//rows: 5 (mean, median, mode, min, max) + 1 = 6
(function() {
	for (let id of Object.keys(ids)) {
	 var tableElem = document.createElement("table")
	
	 // make first row
	 var firstRowElem = document.createElement("tr")
	 firstRowElem.innerHTML = "<th></th>"
	 for (let i = 0, l = statsIntervals.length; i < l; i++) {
	   firstRowElem.innerHTML += `<th>${statsIntervals[i].label}</th>`
	 }
	 tableElem.appendChild(firstRowElem)
	
	 // make the other rows
	 for (let i = 0; i < 5; i++) {
	   var rowElem = document.createElement("tr")
	   rowElem.innerHTML = `<th>${statsParameters[i].label}</th>`
	   for (let i = 0, l = statsIntervals.length; i < l; i++) {
	     rowElem.innerHTML += "<td></td>"
	   }
	   tableElem.appendChild(rowElem)
	 }
	 
	 ids[id].statsContainer.appendChild(tableElem)
	}
}())

var intervalTask = function() {
  request(UPDATE_DATA_URL, function(res) {
    console.log(res)

    var json = JSON.parse(res)
    var time = json.time
    var data = json.data

    for (let id of Object.keys(ids)) {
      var value = data[id]
      if (Number.isFinite(value) && value > -1) {
        var valueObj = {}
        valueObj[id] = value
        valueObj.time = time
        values[id].push(valueObj)

        updateChart(ids[id].chart, {
        	x: new Date(time),
        	y: value
        })

        ids[id].tableDataElem.textContent = value

        updateStats(id)
      }
    }
  })
}

intervalTask()
setInterval(intervalTask, UPDATE_INTERVAL)

request(GET_PAST_DATA_URL, function(res) {
  console.log(res)

  var records = JSON.parse(res)

  for (let id of Object.keys(ids)) {
    var record = records[id]
    for (let recordItem of record.reverse()) { // reverse because we are prepending
      var valueObj = {}
      valueObj[id] = recordItem[id]
      valueObj.time = recordItem.time
      values[id].push(valueObj)

  	  updateChart(ids[id].chart, {
  		  x: new Date(recordItem.time),
  		  y: recordItem[id]
  	  }, { prepend: true })

      updateStats(id)
    }
  }
})
