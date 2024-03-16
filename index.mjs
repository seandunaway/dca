#!/usr/bin/env node

let symbol = 'SPY'
let date_start = new Date('1950-01-01')
let date_stop = new Date()
let dca_amount = 1000

let number_trades = 0
let total_shares = 0
let total_invested = 0
let cost_basis = 0.00
let pnl = 0.00

let period1 = Math.trunc(date_start.getTime() / 1000)
let period2 = Math.trunc(date_stop.getTime() / 1000)
let yf_url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&period1=${period1}&period2=${period2}`
let yf_response = await fetch(yf_url)
let yf_json = await yf_response.json()
let yf_result = yf_json.chart.result[0]

let yf = {}
for (let i = 0; i < yf_result.timestamp.length; i++) {
    let date = new Date(yf_result.timestamp[i] * 1000)
    let price = yf_result.indicators.quote[0].close[i]
    if (!price) continue

    yf[date.toLocaleDateString()] = price
}

let date_i = new Date(date_start)
while (date_i < date_stop) {
	let today = new Date(date_i)
	date_i.setDate(date_i.getDate() + 1)

	let quote = yf[today.toLocaleDateString()]
	if (!quote) continue

	let is_buy = today.getDay() == 4
	if (!is_buy) continue

	let quantity_to_buy = dca_amount / quote

	number_trades++
	total_shares += quantity_to_buy
	total_invested += dca_amount
	// cost_basis = ((cost_basis * (number_trades - 1)) + quote) / number_trades
	cost_basis = total_invested / total_shares
	pnl = (quote - cost_basis) * total_shares
	let growth = (pnl / total_invested) * 100

	console.info(`#${number_trades} ${today.toLocaleDateString()} buy ${symbol} ${f(quantity_to_buy)} @ $${f(quote)}; shares: ${f(total_shares)}, invested: $${total_invested}, basis: $${f(cost_basis)}, pnl: $${f(pnl)}, return: ${f(growth)}%`)
}

function f(float) {
	return float.toFixed(2)
}
