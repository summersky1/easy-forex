const displayElement = document.querySelector('#display')
const endpoint = 'https://api.ratesapi.io/api/'
const targetCurrencies = ['GBP','USD','EUR','JPY','CAD','AUD','KRW','SGD','HKD','INR']

let baseCurrency = 'GBP'
let date = 'latest'
let requestUrl = endpoint + date

const queryParams = {
    base: baseCurrency,
    symbols: targetCurrencies.join(',')
}

const getResults = async () => {  
    try {
        const response = await axios.get(requestUrl, {
            params: queryParams
        })
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
