const currentRatesDisplayElement = document.querySelector('#currentRatesDisplay')
const historicalRateChartsElement = document.querySelector('#historicalRateCharts')
const baseCurrencySelect = document.querySelector('#baseCurrencySelect')

const endpoint = 'https://api.ratesapi.io/api/'
const currencyInfo = {
    GBP: { countryCode: 'gb', name: 'British Pound' },
    USD: { countryCode: 'us', name: 'US Dollar' },
    EUR: { countryCode: 'eu', name: 'Euro' },
    JPY: { countryCode: 'jp', name: 'Japanese Yen' },
    CAD: { countryCode: 'ca', name: 'Canadian Dollar' },
    AUD: { countryCode: 'au', name: 'Australian Dollar' },
    CHF: { countryCode: 'ch', name: 'Swiss Franc' },
    HKD: { countryCode: 'hk', name: 'Hong Kong Dollar' },
    INR: { countryCode: 'in', name: 'Indian Rupee' },
}

let baseCurrency = 'GBP'
let specifiedDate = 'latest'

function getQueryParams(baseCurrency) {
    let targetCurrencies = Object.keys(currencyInfo)
        .filter(c => c !== baseCurrency)
    return {
        base: baseCurrency,
        symbols: targetCurrencies.join(',')
    }
}

async function fetchRates(queryParams, date = null) {  
    try {
        let requestUrl = endpoint
        if (date === null) {
            requestUrl += specifiedDate
        } else {
            requestUrl += date
        }
        const response = await axios.get(requestUrl, {
            params: queryParams
        })
        return response.data
    }
    catch(error) {
        console.log(error)
    }
}

async function fetchAndDisplayRates(queryParams) {
    let jsonResponse = await fetchRates(queryParams)
    displayRates(jsonResponse.rates)
}

function displayRates(rates) {    
    let tableElement = document.createElement('table')
    tableElement.classList.add('table', 'table-bordered', 'table-hover', 'table-striped', 'mt-3', 'animate__animated', 'animate__fadeIn')
    let tBodyElement = document.createElement('tbody') // needed for hover
    tableElement.appendChild(tBodyElement)

    tBodyElement.appendChild(generateTableRow(baseCurrency, 1)) // add base currency first to top of table
    for (const [currency, rate] of Object.entries(rates)) {
        tBodyElement.appendChild(generateTableRow(currency, rate))
    }
    currentRatesDisplayElement.appendChild(tableElement)
}

function generateTableRow(currency, rate) {
    let currencyElement = document.createElement('td')
    currencyElement.appendChild(generateFlagImageElement(currency))
    currencyElement.appendChild(document.createTextNode(currency))
    let rateElement = document.createElement('td')
    rateElement.appendChild(document.createTextNode(rate))

    let rowElement = document.createElement('tr')
    rowElement.appendChild(currencyElement)
    rowElement.appendChild(rateElement)
    if (currency === baseCurrency) {
        rowElement.classList.add('bg-primary', 'text-light')
    }
    return rowElement
}

function generateFlagImageElement(currency) {
    let imageElement = document.createElement('img')
    let countryCode = currencyInfo[currency].countryCode
    imageElement.src = `https://flagcdn.com/56x42/${countryCode}.png`
    imageElement.width = 28
    imageElement.classList.add('mr-2', 'mt-n1')
    return imageElement
}

function setupBaseCurrencySelection() {
    for (const currency of Object.keys(currencyInfo)) {
        let optionElement = document.createElement('option')
        optionElement.innerHTML = '&nbsp;&nbsp;' + currency + ' - ' + currencyInfo[currency].name
        if (currency === baseCurrency) {
            optionElement.setAttribute('selected', '')
        }
        baseCurrencySelect.appendChild(optionElement)
    }
    baseCurrencySelect.addEventListener('change', function() {
        baseCurrency = this.value.trim().substring(0,3)
        updateResults()
    })
}

function setupDateSelection() {
    flatpickr('#dateInput', {
        altInput: true,
        altFormat: "J F Y",
        dateFormat: "Y-m-d",
        maxDate: "today",
        onChange: function(selectedDates, dateStr, instance) {
            specifiedDate = dateStr
            updateResults()
        },
    })
}

function updateResults() {
    while(currentRatesDisplayElement.firstChild) {
        currentRatesDisplayElement.removeChild(currentRatesDisplayElement.lastChild)
    }
    fetchAndDisplayRates(getQueryParams(baseCurrency))
}

async function fetchHistoricalRates() {
    const dates = ['2021-01-01','2021-02-01','2021-03-01','2021-04-01']
    const promises = []
    dates.forEach(date => {
        promises.push(fetchRates(getQueryParams(baseCurrency), date))
    })
    let responseList = await Promise.all(promises)

    const historicalData = {}
    let targetCurrencies = Object.keys(currencyInfo)
        .filter(c => c !== baseCurrency)
    targetCurrencies.forEach(currency => {
        let currencyPair = baseCurrency + "/" + currency
        historicalData[currencyPair] = []
        for (let i = 0; i < dates.length; i++) {
            historicalData[currencyPair].push({ x: dates[i], y: responseList[i].rates[currency] })
        }
    })
    return historicalData
}

async function fetchHistoricalRatesAndDisplayCharts() {
    let historicalData = await fetchHistoricalRates()
    Chart.defaults.font.size = 16;

    Object.keys(historicalData).forEach(currencyPair => {
        let canvasElement = document.createElement('canvas')
        canvasElement.id = currencyPair
        let columnElement = document.createElement('div')
        columnElement.classList.add('col-md-6', 'p-1')
        columnElement.appendChild(canvasElement)
        historicalRateChartsElement.appendChild(columnElement)

        let context = canvasElement.getContext('2d')
        let chart = new Chart(context, {
            type: 'line',
            data: {
                datasets: [{
                    label: currencyPair,
                    data: historicalData[currencyPair],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.2,
                }]
            },
        })
    })
}

function main() {
    setupBaseCurrencySelection()
    setupDateSelection()
    fetchAndDisplayRates(getQueryParams(baseCurrency))
    fetchHistoricalRatesAndDisplayCharts()
}

main()
