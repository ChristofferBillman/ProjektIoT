const levels = ['critical', 'bad', 'medium', 'good', 'nominal']

const newData = {
    light: 'critical',
    water: 'bad',
    moist: 'okay',
    temp: 'nominal'
    }

const monsterPlant = document.getElementById('monster')

document.getElementById('refresh').addEventListener('click', e => {
    console.log('clicked')
    // Code that fetches new data from server (RPi)
})

document.getElementById('btn1').addEventListener('click', e =>{
    document.getElementsByClassName('modal')[0].style.display = 'block'
})

document.getElementById('modal-close').addEventListener('click', e => {
    document.getElementsByClassName('modal')[0].style.display = 'none'
})

/*
axios.get('/indications')
    .then(res =>{
        light.classList.add('critical')
    })
*/

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

updateStats(monsterPlant,newData)


