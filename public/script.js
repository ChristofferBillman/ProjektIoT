const levels = ['low', 'good', 'high']

let serverData
let plantInfo

const monsterPlant = document.getElementById('monster')

// Get data from server initially.
update()

function update(){
    // Request data from server.
    axios.get('/data')
    .then(response =>{
        serverData = JSON.parse(response.data.data)
        plantInfo= JSON.parse(response.data.flowers)
        
        let picker = document.getElementById('plant-picker')
        
        let children = picker.children;
        for (let i = 0; i < children.length; i++) {
            let option = children[i];
            if(serverData.planttype === option.value){
                option.selected = 'selected'
            }
        }
        translateData()

        let currenttemp = document.getElementById('currenttemp')
        let weekavg = document.getElementById('weekavgtemp')

        axios.get('/currenttemp')
            .then(res =>{
                console.log(res.data.currenttemp)
                currenttemp.innerHTML = res.data.currenttemp
            })
        weekavg.innerHTML = average(serverData.airtemp)

        let lastwatered = document.getElementById('lastwatered')
        let date = new Date(serverData.lastwatered)
        console.log(serverData.lastwatered)

        lastwatered.innerHTML = 'Last watered: ' + date.getDate() + ' ' + getMonthString(date.getMonth()) + ' ' + date.getFullYear() + ', ' + date.getHours() + ':' + date.getMinutes()

        let weekavgmoist = document.getElementById('weekavgmoist')
        weekavgmoist.innerHTML = average(serverData.airmoist)
    })
}
    
function changeText(indication, topic, el){
    console.log('Indication: ' + indication + '. Topic: ' + topic)
    el.innerHTML = 'The ' + topic + ' level is ' + indication + '!'
    return indication === 'good'
}

function translateData(){

    let indicatorStatus = {}

    setStatus('airmoist', indicatorStatus)
    setStatus('airtemp', indicatorStatus)
    setStatus('light', indicatorStatus)

    console.log(indicatorStatus)

    let lightText = document.getElementsByClassName('light-text')[0]
    let indicatorText = document.getElementsByClassName('indicator-text')[0]
    let moistText = document.getElementsByClassName('moist-text')[0]
    let tempText = document.getElementsByClassName('temp-text')[0]

    let goodStatus = []
    goodStatus[0] = changeText(indicatorStatus.light,'light',lightText)
    goodStatus[1] = changeText(indicatorStatus.airmoist,'moisture',moistText)
    goodStatus[2] = changeText(indicatorStatus.airtemp,'air temperature',tempText)

    if(
        !goodStatus[0] ||
        !goodStatus[1] ||
        !goodStatus[2]
    ){
        indicatorText.innerHTML = 'Your plant needs attention.'
    }
    else{
        indicatorText.innerHTML = 'Your plant is doing well!'
    }
    setLights()
    updateStats(monsterPlant,indicatorStatus)
}
function setStatus(topic, data){

    if(serverData[topic].length === 7){
        // Avg of the measured values.
        let avg = average(serverData[topic])

        // Deciding the topics' status depending on this plants threshold.
        if(avg > plantInfo[serverData.planttype][topic][1]) {
            data[topic] = 'high'
        }
        else if(avg < plantInfo[serverData.planttype][topic][0]){
            data[topic] = 'low'
        }
        else  {
            data[topic] = 'good'
        }
    }
}

// Open modal
document.getElementById('btn1').addEventListener('click', e =>{
    document.getElementsByClassName('modal')[0].style.display = 'block'
    //disableBodyScroll()
})

// Close modal
document.getElementById('modal-close').addEventListener('click', e => {
    document.getElementsByClassName('modal')[0].style.display = 'none'
    //enableBodyScroll()
})

// Refresh button
document.getElementById('refresh-button').addEventListener('click', () => {
    update()
})

document.getElementById('waterplant').addEventListener('click', () =>{
    let amount = document.getElementById('water-picker').value
    console.log("vattnar " + amount + ' ml')
    axios.post('/waterplant', {amount: amount})
        .then(res =>{
            document.getElementById('waterplant').style.backgroundColor = '#555'
            console.log('hej')
        })
        .catch(err =>{
            // Om det inte funkar
        })
    document.getElementById('waterplant').disabled = true
    document.getElementById('waterplant').innerHTML = 'Watering...'

    setTimeout(() =>{
        document.getElementById('waterplant').disabled = false
        document.getElementById('waterplant').innerHTML = 'Water plant'
        update()
    },((amount / 39) * 60*1000)+2000)
})

// 'Apply' button to change plant type.
document.getElementById('changeplant').addEventListener('click', e => {
    
    // Send selection to server, to /switchplant.
    axios.post('/switchplant',{planttype: document.getElementById('plant-picker').value})
        // If successful:
        .then(response =>{
            document.getElementById('confirmation').innerHTML = "Successfully changed plant."
            document.getElementById('confirmation').classList.remove('err-text')
            document.getElementById('confirmation').classList.add('success-text')
            update()
        })
        // If unsuccessful:
        .catch(err =>{
            document.getElementById('confirmation').innerHTML = "Plant was not changed. Try again later."
            document.getElementById('confirmation').classList.remove('success-text')
            document.getElementById('confirmation').classList.add('err-text')
        })
})

/* Uppdates the indicators on the given plant. */
function updateStats(plant,data){

    // Get all indicators of this plant.
    const indicators = {
        light: plant.getElementsByClassName('light')[0],
        water: plant.getElementsByClassName('water')[0],
        airmoist: plant.getElementsByClassName('moist')[0],
        airtemp: plant.getElementsByClassName('temp')[0],
    }
    // For each indicator
    for (const [key, indicator] of Object.entries(indicators)) {
        turnOffIndicator(indicator)
        // Turn on the indicator with the color provided in data.
        indicator.classList.add(data[key])
    }
}

function turnOffIndicator(el){
    levels.forEach(level =>{
        el.classList.remove(level)
    })
}

function average(arr) {
    return arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
}

function getMonthString(number){
    months = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December']
    return months[number]
}

function setLights(){
    let days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    let d = new Date()
    let today = d.getDay()
    for(let i = serverData.light.length; i > 0; i--){
        let container = document.getElementById('light'+i)
        if(i == serverData.light.length){
            container.children[0].innerHTML = 'Today'
        }
        else if (i == serverData.light.length-1) {
            container.children[0].innerHTML = 'Yest'
        }
        else{
            container.children[0].innerHTML = days[today-1]
         }
        today--
        if(today < 1) today = today + 7;
    }
    /*UPDATE ICON - TO DO NEXT SESSION*/
}


