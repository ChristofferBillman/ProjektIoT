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
    })
}
    
function changeText(indication, topic, el){
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
        console.log(key)
        indicator.classList.add(data[key])
    }
}

function turnOffIndicator(el){
    levels.forEach(level =>{
        el.classList.remove(level)
    })
}

function disableBodyScroll(){
    document.body.style.position = 'fixed';
    document.body.style.top = `-${window.scrollY}px`;
}
function enableBodyScroll(){
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
}

function average(arr) {
    return arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
}


