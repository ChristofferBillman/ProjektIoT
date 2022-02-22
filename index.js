const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')

const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');

const app = express()
const port = 3000

let currentTemp = 0

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../public')))

app.listen(port, () => {
    console.log('Listening on port ' + port)
})

app.get('/', (req, res) => {
	/* Meddela ESP32a att vi vill ha current temp nu.*/
	/*eRsten sköts handleCurrentTemp()*/
	res.sendFile(path.resolve(__dirname + '/public/index.html'))
})

client.subscribe('temp/#');
client.subscribe('moisture/#')
client.subscribe('light/#')

handleAvgTemp(13)
handleMoistureAirAvg(20)

client.on('message',(topic, msg, packet) => {
	switch(topic)
	{
		case 'temp/avg':
			handleAvgTemp(msg)
			break;
		case 'temp/current':
			handleCurrentTemp(msg)
			break;
		case 'moisture/air/avg':
			handleMoistureAirAvg(msg)
			break;
		case 'light/avg':
			handleLightAvg(msg)
			break;
		case 'moisture/soil/avg':
			handleMoistureSoilAvg(msg)
			break;
		case 'mositure/soil/watered':
			handleSoilWatered(msg)
			break;
		
		}
});

/* Saves average temp in array. Last 7 days saved.*/
function handleAvgTemp(msg){
	logData(msg,'tempdata.txt');
}


function handleCurrentTemp(msg){
	/* Spara i variabel & Displaya current temp */
	currentTemp = JSON.parse(msg)
}

function handleMoistureAirAvg(msg){
	logData(msg,'airMoistureData.txt');
}

function handleMoistureSoilAvg(msg) {
		
}


function logData(msg,filename){
	fs.readFile(filename, 'utf8', (err,data) =>{
		let dataArr = JSON.parse(data);
		
		if(dataArr.length > 6){
			dataArr.shift()
		}
		
		dataArr.push(JSON.parse(msg));
		
		fs.writeFile(filename, JSON.stringify(dataArr), 'utf8',
		 err =>{ 
			 if(err) console.log(err) 
			 else console.log('Success')
			 }
		 )				
	})
}
