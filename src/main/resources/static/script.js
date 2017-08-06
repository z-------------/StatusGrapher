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

const request = function(url, callback) {
  var req = new XMLHttpRequest()
  req.addEventListener("load", function() {
    callback(this.responseText, this)
  })
  req.open("GET", url)
  req.send()
}

const dashedToCamelCase = function(input) {
  var words = input.split("-")
  for (let i = 1; i < words.length; i++) {
    var letters = words[i].split("")
    letters[0] = letters[0].toUpperCase()
    words[i] = letters.join("")
  }
  return words.join("")
}

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
  function: Math.min, label: "min"
}, {
  function: Math.max, label: "max"
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
  var now = new Date().getTime()
  var tds = tableElem.querySelectorAll("td")
  if (ids.hasOwnProperty(id)) {
    var tableElem = ids[id].statsContainer.querySelector("table")
    for (let i = 0, l = statsIntervals.length; i < l; i++) {
      var interval = statsIntervals[i]
      var intervalSize = interval.size
      var relevantValues = []
      for (let j = values.length - 1; j >= 0; j--) {
        if (now - values[j].time < intervalSize) {
          relevantValues.push(values[j][id])
        }
      }
      for (let p = 0, l = statsParameters.length; p < l; p++) {
        tds[5 * i + p].textContent = statsParameters[p].function(relevantValues)
      }
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
    scales: {
      xAxes: [{
        type: "time",
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
          min: 0
        }
      }]
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

var intervalTask = function() {
  request(UPDATE_DATA_URL, function(res) {
    console.log(res)

    var json = JSON.parse(res)
    var time = json.time
    var data = json.data

    for (let id of Object.keys(ids)) {
      var value = data[id]
      if (!Number.isFinite(value) && value > -1) {
        var valueObj = {}
        valueObj[id] = value
        valueObj.time = time
        values[id].push(valueObj)

        updateChart(ids[id].chart, {
        	x: new Date(time),
        	y: value
        })

        ids[id].tableDataElem.textContent = value

        updateStats(ids[id])
      }
    }
  })
}

// cols: statsIntervals.length + 1
// rows: 5 (mean, median, mode, min, max) + 1 = 6
(function() {
  for (let id of Object.keys(ids)) {
    var tableElem = document.createElement("table")

    // make first row
    var firstRowElem = document.createElement("tr")
    firstRowElem.innerHTML = "<td></td>"
    for (let i = 0, l = statsIntervals.length; i < l; i++) {
      firstRowElem.innerHTML += `<th>${statsIntervals[i].label}</th>`
    }

    // make the other rows
    for (let i = 0; i < 5; i++) {
      var rowElem = document.createElement("tr")
      rowElem.innerHTML = `<th>${statsParameters[i].label}</th>`
      for (let i = 1, l = statsIntervals.length; i < l; i++) {
        rowElem.innerHTML += `<th>${statsIntervals[i].label}</th>`
      }
    }

    ids[id].statsContainer.appendChild(tableElem)
  }
}())

intervalTask()
setInterval(intervalTask, UPDATE_INTERVAL)

request(GET_PAST_DATA_URL, function(res) {
  console.log(res)

  var records = JSON.parse(res)

  for (let id of Object.keys(ids)) {
    var record = records[id]
    for (let recordItem of record.reverse()) { // reverse because we are prepending
      var valueObj = {}
      valueObj[id] = value
      valueObj.time = time
      values[id].push(valueObj)

  	  updateChart(ids[id].chart, {
  		  x: new Date(recordItem.time),
  		  y: recordItem.tps
  	  }, { prepend: true })

      updateStats(ids[id])
    }
  }
})
