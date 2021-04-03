const endpoint = 'https://api.ratesapi.io/api/'
const date = 'latest'
const currencies = ['GBP','USD','EUR','JPY','CAD','AUD','KRW','SGD','HKD','INR']
let base = 'GBP'
let requestUrl = endpoint + date + `?base=${base}` + `&symbols=${currencies.join(',')}`

const displayElement = document.querySelector('#display')

const getResults = async () => {  
    try {
        const response = await axios.get(requestUrl)
        renderResults(response.data)
    }
    catch(error) {
        console.log(error)
    }
}

function renderResults(jsonResponse) {
    displayElement.innerHTML = JSON.stringify(jsonResponse)
}

getResults()
