const displayElement = document.querySelector('#display')
const chart = setupChart()
const baseCurrencySelect = document.querySelector('#baseCurrencySelect')

const endpoint = 'https://api.ratesapi.io/api/'
const currencyInfo = {
    GBP: { countryCode: 'gb', name: 'British Pound' },
    USD: { countryCode: 'us', name: 'US Dollar' },
    EUR: { countryCode: 'eu', name: 'Euro' },
    JPY: { countryCode: 'jp', name: 'Japanese Yen' },
    CAD: { countryCode: 'ca', name: 'Canadian Dollar' },
    AUD: { countryCode: 'au', name: 'Australian Dollar' },
    KRW: { countryCode: 'kr', name: 'South Korean Won' },
    SGD: { countryCode: 'sg', name: 'Singapore Dollar' },
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
    displayElement.appendChild(tableElement)
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
    while(displayElement.firstChild) {
        displayElement.removeChild(displayElement.lastChild)
    }
    fetchAndDisplayRates(getQueryParams(baseCurrency))
}

async function populateChart() {
    const dates = ['2021-01-01','2021-02-01','2021-03-01','2021-04-01']
    const promises = []
    dates.forEach(date => {
        promises.push(fetchRates(getQueryParams(baseCurrency), date))
    })
    let responseList = await Promise.all(promises)
    for (let i = 0; i < dates.length; i++) {
        chart.data.datasets[0].data.push({ x: dates[i], y: responseList[i].rates.USD })
    }
    chart.update()
}

function setupChart() {
    let ctx = document.querySelector('#chartCanvas').getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'GBP/USD',
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.2,
                },
            ]
        },
    });
}

function main() {
    setupBaseCurrencySelection()
    setupDateSelection()
    fetchAndDisplayRates(getQueryParams(baseCurrency))
    populateChart()
}

main()
