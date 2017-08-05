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

const UPDATE_INTERVAL = 10 * 1000; // doesn't have to match the one in Main.java, but if it's too high then we'll just be getting repeats of the same data

const GET_PAST_DATA_URL = "/get_past_data"
const UPDATE_DATA_URL = "/update_data"

var canvasTPS = document.querySelector(".chart--tps")
var ctxTPS = canvasTPS.getContext("2d")

var canvasPlayerCount = document.querySelector(".chart--player-count")
var ctxPlayerCount = canvasPlayerCount.getContext("2d")

var tableTPSDataElem = document.querySelector(".table_tps_data")
var tablePlayerCountDataElem = document.querySelector(".table_player-count_data")

function updateChart(chart, data, options) {
  if (options && options.prepend === true) {
    chart.data.datasets[0].data.unshift(data)
  } else {
    chart.data.datasets[0].data.push(data)
  }
  
  chart.update()
}

var tpsLineChart = new Chart(ctxTPS, {
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

var playerCountLineChart = new Chart(ctxPlayerCount, {
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

var intervalTask = function() {
  request(UPDATE_DATA_URL, function(res) {
	console.log(res)
	
    var json = JSON.parse(res)

    var time = json.time

    var data = json.data
    var tps = data.tps
    var playerCount = data.playerCount

    if (tps > 0) {
    	updateChart(tpsLineChart, {
        	x: new Date(time),
        	y: tps
        })
        
        tableTPSDataElem.textContent = tps
    }
	
	updateChart(playerCountLineChart, {
    	x: new Date(time),
    	y: playerCount
    })
    
    tablePlayerCountDataElem.textContent = playerCount
  })
}

intervalTask()
setInterval(intervalTask, UPDATE_INTERVAL)

request(GET_PAST_DATA_URL, function(res) {
  console.log(res)
  
  var records = JSON.parse(res)
  
  var tpsRecord = records.tps
  var playerCountRecord = records.playerCount
  
  for (let tpsRecordItem of tpsRecord.reverse()) { // reverse because we are prepending
	  updateChart(tpsLineChart, {
		  x: new Date(tpsRecordItem.time),
		  y: tpsRecordItem.tps
	  }, { prepend: true })
  }
  
  for (let playerCountRecordItem of playerCountRecord.reverse()) { // reverse because we are prepending
	  updateChart(playerCountLineChart, {
		  x: new Date(playerCountRecordItem.time),
		  y: playerCountRecordItem.playerCount
	  }, { prepend: true })
  }
})
