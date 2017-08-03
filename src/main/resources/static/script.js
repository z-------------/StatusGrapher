const request = function(url, callback) {
  var req = new XMLHttpRequest()
  req.addEventListener("load", function() {
    callback(this.responseText, this)
  })
  req.open("GET", url)
  req.send()
}

const GET_PAST_DATA_URL = "/get_past_data"
const UPDATE_DATA_URL = "/update_data"

var canvas = document.querySelector(".chart--tps")
var ctx = canvas.getContext("2d")

function updateChart(chart, data) {
  chart.data.datasets[0].data.push(data)
  chart.update()
}

var tpsLineChart = new Chart(ctx, {
  type: "line",
  data: {
    datasets: [{
      label: "TPS",
      data: []
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

var intervalTask = function() {
  request(UPDATE_DATA_URL, function(res) {
	console.log(res)
	
    var json = JSON.parse(res)

    var time = json.time

    var data = json.data
    var tps = data.tps
    var playerCount = data.playerCount

    updateChart(tpsLineChart, {
    	x: new Date(time),
    	y: tps
    })
  })
}

setInterval(intervalTask, 2000)

request(GET_PAST_DATA_URL, function(res) {
  console.log(res)
  
  var tpsRecord = JSON.parse(res)
  
  for (let tpsRecordItem of tpsRecord) {
	  updateChart(tpsLineChart, {
		  x: new Date(tpsRecordItem.time),
		  y: tpsRecordItem.tps
	  })
  }
})
