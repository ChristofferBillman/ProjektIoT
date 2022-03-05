const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')

const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://localhost:1883')

const app = express()
const port = 3000

let currentTemp = 0
const tooDry = 20
const wateringAmount = 200 //In ml

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
app.post('/switchplant', (req,res) =>{
	console.log(req.body)
	logData(req.body.planttype, 'planttype')
	res.sendFile(path.resolve(__dirname + '/public/index.html'))
})

app.get('/data', (req, res) => {
	res.send({
		data: getData('data.json'),
		flowers: getData('flowers.json')
	})
})

client.subscribe('temp/#');
client.subscribe('moisture/#')
client.subscribe('light/#')

handleAvgTemp(13)

client.on('connect', () =>{
	console.log("Someone connected!")
	waterPlant(10)
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
		case 'moisture/soil/watered':
			handleSoilWatered(msg)
			break;
		case 'moisture/soil/current':
			handleCurrentSoilMoist(msg)
			break;	
		}
	console.log('Got message on topic ' + topic + ' with content ' + msg)
});

/* Saves average temp in array. Last 7 days saved.*/
function handleAvgTemp(msg){
	logData(msg,'airtemp');
}
function handleCurrentTemp(msg){
	/* Spara i variabel & Displaya current temp */
	currentTemp = JSON.parse(msg)
}
function handleMoistureAirAvg(msg){
	logData(msg,'airmoist');
}
function handleLightAvg(msg){
	logData(msg,'light')
}
function handleMoistureSoilAvg(msg) {
	let plantData = JSON.parse(getData('flowers.json'))
	let plant = JSON.parse(getData('data.json'))

	if(msg < tooDry){
		let maxDaysDry = plantData[plant.planttype].daysdry

		let daysDry = 0
		for(let i = 6; i >= maxDaysDry; i--){
			let soilMoist = plantData[plant.planttype].soilmoist[i]
			if(soilMoist < tooDry){
				daysDry++
			}
		}
		if(daysDry >= maxDaysDry){
			waterPlant(wateringAmount)
		}
	}
	logData(msg,'soilmoist')
}
function handleSoilWatered(msg){
	let d = new Date()
	if(JSON.parse(msg)){
		logData('','lastwatered')
		console.log('Vattnat klart kl ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds())
		setTimeout(checkSoilMoist, 60 * 60 * 1000)
	}
}
function checkSoilMoist() {
	client.publish('moisture/soil/current/request', 'true')
}
function handleCurrentSoilMoist(msg) {
	if(JSON.parse(msg) < tooDry){
		waterPlant(wateringAmount)
	}
}
/**
 * 
 * @param {Number} amount Waters a plant the specified amount (ml)
 */
function waterPlant(amount){
	let seconds = (amount / 39) * 60
	
	client.publish('moisture/soil/startpump', seconds.toString())
	console.log('Skickar att ESP ska vattna!')
}

function getData(filename){
	filepath = './data/' + filename
	return fs.readFileSync(filepath, 'utf8')
}
/**
 * Logs the given data to a JSON-file.
 * NOTE: Saves MAX 7 datapoints. The last datapoint will be removed when given new data.
 * @param {*} msg 
 * @param {*} filename 
 */
function logData(msg, topic){

	filepath = './data/data.json'

	fs.readFile(filepath, 'utf8', (err,data) =>{
		save = JSON.parse(data);
		
		if(topic === 'lastwatered'){
			save[topic] = Date.now()
		}
		if(topic === 'planttype'){
			console.log(save[topic])
			save[topic] = msg
		}
		else{
			if(save[topic].length > 6){
			save[topic].shift()
			}
			save[topic].push(JSON.parse(msg))
		}
		
		fs.writeFile(filepath, JSON.stringify(save), 'utf8',
		 err =>{ 
			if(err) console.log(err) 
			else console.log('Wrote to data file successfully.')
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
