const levels = ['low', 'good', 'high']

const newData = {
    light: 'critical',
    water: 'bad',
    moist: 'okay',
    temp: 'nominal'
}

let serverData
let plantInfo

const monsterPlant = document.getElementById('monster')

fetchData()
//updateStats(monsterPlant,newData)

function fetchData(){
    axios.get('/data')
    .then(res =>{
        serverData = JSON.parse(res.data.data)
        plantInfo= JSON.parse(res.data.flowers)
        
        let picker = document.getElementById('plant-picker')
        
        let children = picker.children;
        for (let i = 0; i < children.length; i++) {
            let option = children[i];
            if(serverData.planttype === option.value){
                option.selected = 'selected'
            }
        }
        translateData()
    })
}

const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
    
function changeText(indication, topic,el){
    el.innerHTML = 'The ' + topic + ' level is ' + indication + '!'
    return indication === 'good'
}

function translateData(){

    let indicatorStatus = {}

    setStatus('airmoist', indicatorStatus)
    setStatus('airtemp', indicatorStatus)
    setStatus('light', indicatorStatus)

    let lightText = document.getElementsByClassName('light-text')[0]
    let indicatorText = document.getElementsByClassName('indicator-text')[0]
    let moistText = document.getElementsByClassName('moist-text')[0]
    let tempText = document.getElementsByClassName('temp-text')[0]

    if(
        !changeText(indicatorStatus.light,'light',lightText) ||
        !changeText(indicatorStatus.airmoist,'moisture',moistText) ||
        !changeText(indicatorStatus.airtemp,'air temperature',tempText)
    ){
        indicatorText.innerHTML = 'Your plant needs attention.'
    }
    else{
        indicatorText.innerHTML = 'Your plant is doing well!'
    }
    updateStats(monsterPlant,indicatorStatus)
}
function setStatus(topic, data){

    if(serverData[topic].length === 7){
        let avg = average(serverData[topic])

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

document.getElementById('btn1').addEventListener('click', e =>{
    document.getElementsByClassName('modal')[0].style.display = 'block'
})

document.getElementById('modal-close').addEventListener('click', e => {
    document.getElementsByClassName('modal')[0].style.display = 'none'
})

document.getElementById('refresh-button').addEventListener('click', () => {
    fetchData()
})

document.getElementById('changeplant').addEventListener('click', e => {
    console.log(document.getElementById('plant-picker').value)
    axios.post('/switchplant',document.getElementById('plant-picker').value)
        .then(res =>{
            document.getElementById('confirmation').innerHTML = "Successfully changed plant."
            document.getElementById('confirmation').classList.remove('err-text')
            document.getElementById('confirmation').classList.add('success-text')
        })
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
        console.log(key)
        indicator.classList.add(data[key])
    }
}

function turnOffIndicator(el){
    levels.forEach(level =>{
        el.classList.remove(level)
    })
}

let plantpicker = document.getElementById('plant-picker')


