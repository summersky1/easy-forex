const displayElement = document.querySelector('#display')
const baseCurrencySelect = document.querySelector('#baseCurrencySelect')

const endpoint = 'https://api.ratesapi.io/api/'
const currencyInfo = {
    GBP: 'gb',
    USD: 'us',
    EUR: 'eu',
    JPY: 'jp',
    CAD: 'ca',
    AUD: 'au',
    KRW: 'kr',
    SGD: 'sg',
    HKD: 'hk',
    INR: 'in',
}

let baseCurrency = 'GBP'
let date = 'latest'
let requestUrl = endpoint + date

function getQueryParams(baseCurrency) {
    let targetCurrencies = Object.keys(currencyInfo)
        .filter(c => c !== baseCurrency)
    return {
        base: baseCurrency,
        symbols: targetCurrencies.join(',')
    }
}

const getResults = async (queryParams) => {  
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
    
    let tableElement = document.createElement('table')
    tableElement.classList.add('table', 'table-bordered', 'table-hover', 'table-striped', 'mt-3')
    let trHead = document.createElement('tr')
    trHead.classList.add('bg-primary', 'text-light')
    let thCurrency = document.createElement('th')
    thCurrency.appendChild(generateFlagImageElement(baseCurrency))
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
        tdCurrency.appendChild(generateFlagImageElement(currency))
        tdCurrency.appendChild(document.createTextNode(currency))
        tr.appendChild(tdCurrency)
        let tdRate = document.createElement('td')
        tdRate.appendChild(document.createTextNode(rate))
        tr.appendChild(tdRate)
        tBodyElement.appendChild(tr)
    }
    displayElement.appendChild(tableElement)
}

function generateFlagImageElement(currency) {
    let imageElement = document.createElement('img')
    let countryCode = currencyInfo[currency]
    imageElement.src = `https://flagcdn.com/56x42/${countryCode}.png`
    imageElement.width = 28
    imageElement.classList.add('mr-2', 'mt-n1')
    return imageElement
}

function setupBaseCurrencySelection() {
    for (const currency of Object.keys(currencyInfo)) {
        let optionElement = document.createElement('option')
        optionElement.innerHTML = '&nbsp;&nbsp;' + currency
        if (currency === baseCurrency) {
            optionElement.setAttribute('selected', '')
        }
        baseCurrencySelect.appendChild(optionElement)
    }
    baseCurrencySelect.addEventListener('change', updateRates)
}

function updateRates(event) {
    event.preventDefault()
    while(displayElement.firstChild) {
        displayElement.removeChild(displayElement.lastChild)
    }
    baseCurrency = this.value.trim()
    getResults(getQueryParams(baseCurrency))
}

function main() {
    setupBaseCurrencySelection()
    getResults(getQueryParams(baseCurrency))
}

main()
