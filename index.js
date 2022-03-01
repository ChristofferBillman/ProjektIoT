const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')

const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://localhost:1883')

const app = express()
const port = 80

let currentTemp = 0

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

app.listen(port, () => {
    console.log('Listening on port ' + port)
})

app.get('/', (req, res) => {
	/* Meddela ESP32a att vi vill ha current temp nu.*/
	/*eRsten sköts handleCurrentTemp()*/
	res.sendFile(path.resolve(__dirname + '/public/index.html'))
})

app.get('/data', (req, res) => {
	res.send({
		OK: true
	})
})

client.subscribe('temp/#');
client.subscribe('moisture/#')
client.subscribe('light/#')

handleAvgTemp(13)
handleMoistureAirAvg(20)

client.on('connect', () =>{
	console.log("Someone connected!")
})

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
	logData(msg,'tempdata.json');
}
function handleCurrentTemp(msg){
	/* Spara i variabel & Displaya current temp */
	currentTemp = JSON.parse(msg)
}
function handleMoistureAirAvg(msg){
	logData(msg,'airMoistureData.json');
}
function handleLightAvg(msg){
	logData(msg,'lightData.json')
}
function handleMoistureSoilAvg(msg) {

}
function handleSoilWatered(msg){
	console.log('Nu är det färdigvattnat!')
}
/**
 * 
 * @param {Number} amount Waters a plant the specified amount (ml)
 */
function waterPlant(amount){
	let seconds = (amount / 39) * 60
	
	client.publish('/moisture/soil/startpump', seconds.toString())
	console.log('Skickar att ESP ska vattna!')
}

waterPlant(10)

/**
 * Logs the given data to a JSON-file.
 * NOTE: Saves MAX 7 datapoints. The last datapoint will be removed when given new data.
 * @param {*} msg 
 * @param {*} filename 
 */
function logData(msg,filename){

	filepath = './data/' + filename

	fs.readFile(filepath, 'utf8', (err,data) =>{
		let dataArr = JSON.parse(data);
		
		if(dataArr.length > 6){
			dataArr.shift()
		}
		
		dataArr.push(JSON.parse(msg));
		
		fs.writeFile(filepath, JSON.stringify(dataArr), 'utf8',
		 err =>{ 
			if(err) console.log(err) 
			else console.log('Success')
			}
		 )	
	})
}

function getLogs(){

	data = []

	fs.readdir('./data', (err, files) => {
		let i = 0
		files.forEach(file => {
			console.log(file)
			fs.readFile('./data' + file, (err,data) =>{
				data[i] = JSON.parse(data)
				console.log(data[i])
				i++
			})
		});
		return data
	  });
}
