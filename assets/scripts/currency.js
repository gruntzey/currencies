'use strict'

const configObj = {
  tickers: ['USD','EUR','AUD'],
  currencyDataLink: 'https://www.cbr-xml-daily.ru/daily_json.js',
}

const techVariables = {
  tickersInUse: {},
  isTickerToolpisOpen: false,
}

const tickersContainer = document.getElementsByClassName('exchange')[0]

function createExchangeDOM() {
  configObj.tickers.forEach((val,i)=>{
    //card
    const card = document.createElement('div')
    card.classList.add('card')
    tickersContainer.insertAdjacentElement('beforeend', card)
    const currentCard = document.getElementsByClassName('card')[i]

    //ticker
    const ticker = document.createElement('div')
    ticker.classList.add(`${val}-currency`, 'currency')
    ticker.insertAdjacentText("beforeend",`${val}`)
    currentCard.insertAdjacentElement('beforeend', ticker)

    //tooltip
    const tooltip = document.createElement('div')
    tooltip.classList.add('tooltip', 'hidden')
    const text = document.createElement('div')
    tooltip.insertAdjacentText("beforeend",`${techVariables.tickersInUse[val].Name}`)
    currentCard.insertAdjacentElement('beforeend', tooltip)
    //tooltip adjust
    const tooltipWidth = tooltip.getBoundingClientRect().width + 10
    const tooltipTop = -(tooltip.getBoundingClientRect().height + 10)
    tooltip.style.width = tooltipWidth+'px'
    tooltip.style.top = tooltipTop+'px'

    //price
    const price = document.createElement('div')
    price.classList.add('price')
    let ReturnsANumber = techVariables.tickersInUse[val].Value
    ReturnsANumber = Math.round(ReturnsANumber*100)/100
    price.insertAdjacentText('beforeend',`${ReturnsANumber}₽`)
    currentCard.insertAdjacentElement('beforeend', price)

    //change d/d
    const change = document.createElement('div')
    change.classList.add('changeDD')
    const cur = techVariables.tickersInUse[val].Value 
    const prev = techVariables.tickersInUse[val].Previous
    let difference = (cur - prev)*100/prev
    difference = Math.round(difference*100)/100
    switch(true)
    {
    case (difference < 0):
      change.classList.add('negativeChange')
      break;
    case (difference > 0):
      change.classList.add('positiveChange')
      break;
    }
    change.insertAdjacentText('beforeend',`${difference}%`)
    currentCard.insertAdjacentElement('beforeend', change)
  })

  //tooltip touch and mousemove events
  const mediaQuery = window.matchMedia('(max-width: 767px)')
  if (mediaQuery.matches) {
    //on touch
    function tooltipTouch(e) {
      configObj.tickers.forEach((val, i) => {
        if (e.target.classList.contains(`${val}-currency`)) {
          const currentTicker = e.target
          const currentTooltip = currentTicker.nextElementSibling
          currentTooltip.classList.remove('hidden')
          setTimeout(() => {
            currentTooltip.classList.add('hidden')
          }, 1500);
        }
      })
    }
    tickersContainer.addEventListener('touchstart', tooltipTouch)
  } else {  

    //on mousemove
    tickersContainer.addEventListener('mousemove', (e) => {
      configObj.tickers.forEach((val, i) => {
        
        if (e.target.classList.contains(`${val}-currency`)) {
          const currentTicker = e.target
          const currentCard = currentTicker.parentNode
          const currentTooltip = currentTicker.nextElementSibling
  
          const TooltipWidth = currentTooltip.getBoundingClientRect().width
          const currentCardLeftOffset = currentCard.getBoundingClientRect().left
          const currentX = e.clientX
  
          //adjustingTooltip
          currentTooltip.style.left = -(TooltipWidth/2) - currentCardLeftOffset + currentX + 'px'
          
          if (!techVariables.isTickerToolpisOpen) {
            currentTooltip.classList.remove('hidden')
          }
          //on mouseleave
          function onLeavingTicker(e) {
            const currentTicker = e.target
            const currentTooltip = currentTicker.nextElementSibling
            currentTooltip.classList.add('hidden')
            removeEventListener('mouseout', onLeavingTicker)
            techVariables.isTickerToolpisOpen = false
          }
          
          if (!techVariables.isTickerToolpisOpen) {
            currentTicker.addEventListener('mouseout', onLeavingTicker)
            techVariables.isTickerToolpisOpen = true
          }
        }
      })
    })
  }
}

//gettingData
(async() => {
  let response = await fetch(configObj.currencyDataLink);
  if (response.ok) {
    let currencyRawData = await response.json();
    configObj.tickers.forEach((val,i)=>{
      techVariables.tickersInUse[val] = currencyRawData.Valute[val]
    })
    createExchangeDOM();
  } else {
    alert(`HTTP-Error:  ${response.status} \n\n Возможно неполадки с серверном-донором данных`);
  }
})()