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
    let results = jsonResponse.rates
    delete results[baseCurrency]
    
    let tableElement = document.createElement('table')
    tableElement.classList.add('table', 'table-bordered', 'table-hover', 'table-striped', 'mt-3')
    let trHead = document.createElement('tr')
    let thCurrency = document.createElement('th')
    thCurrency.appendChild(document.createTextNode(baseCurrency))
    trHead.appendChild(thCurrency)
    let thRate = document.createElement('th')
    thRate.appendChild(document.createTextNode(1))
    trHead.appendChild(thRate)
    tableElement.appendChild(trHead)

    let tBodyElement = document.createElement('tbody') // needed for hover
    tableElement.appendChild(tBodyElement)

    for (const [currency, rate] of Object.entries(results)) {
        let tr = document.createElement('tr')
        let tdCurrency = document.createElement('td')
        tdCurrency.appendChild(document.createTextNode(currency))
        tr.appendChild(tdCurrency)
        let tdRate = document.createElement('td')
        tdRate.appendChild(document.createTextNode(rate))
        tr.appendChild(tdRate)
        tBodyElement.appendChild(tr)
    }
    displayElement.appendChild(tableElement)
}

getResults()
