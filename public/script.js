const levels = ['critical', 'bad', 'okay', 'good', 'nominal']

const newData = {
    light: 'critical',
    water: 'bad',
    moist: 'okay',
    temp: 'nominal'
    }

const monsterPlant = document.getElementById('monster')

updateStats(monsterPlant,newData)

document.getElementById('btn1').addEventListener('click', e =>{
    document.getElementsByClassName('modal')[0].style.display = 'block'
})

document.getElementById('modal-close').addEventListener('click', e => {
    document.getElementsByClassName('modal')[0].style.display = 'none'
})

document.getElementById('refresh-button').addEventListener('click', () => {
    axios.get('/data')
    .then(res =>{
        console.log('Value of data:' + res.data.OK)
    })
})

/* Uppdates the indicators on the given plant. */
function updateStats(plant,data){

    // Get all indicators of this plant.
    const indicators = {
        light: plant.getElementsByClassName('light')[0],
        water: plant.getElementsByClassName('water')[0],
        moist: plant.getElementsByClassName('moist')[0],
        temp: plant.getElementsByClassName('temp')[0],
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

//updateStats(monsterPlant,newData)


