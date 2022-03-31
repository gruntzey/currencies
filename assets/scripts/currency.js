'use strict'

const configObj = {
  tickers: ['USD','EUR','AUD'],
  currencyDataLink: 'https://www.cbr-xml-daily.ru/daily_json.js',
  DaysNumber: 10,
}


const techVariables = {
  tickersInUse: {},
  currencyRawData: {},
  isTickerToolpisOpen: false,
  PreviousURLRestore: '',
  PreviousURL: '',
  currentPrice: '',
  touchTimeouts: {},
  month: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
}

let temp
const tickersContainer = document.getElementsByClassName('exchange')[0]
const wrapper = document.getElementsByClassName('wrapper')[0]

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
    tooltip.insertAdjacentText("beforeend",`${techVariables.tickersInUse[val].Name}`)
    currentCard.insertAdjacentElement('beforeend', tooltip)
    
    //tooltip adjust
    const tooltipWidth = tooltip.getBoundingClientRect().width + 50
    const tooltipTop = (tooltip.getBoundingClientRect().height + 5)
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

    // setting technical vars
    techVariables.touchTimeouts[val] = false
  })

  //mobile|desktop events
  const mediaQuery = window.matchMedia('(max-width: 767px)')
  if (mediaQuery.matches) {
    //on touch
    function tooltipTouch(e) {
      
      configObj.tickers.forEach((val) => {
        if (e.target.classList.contains(`${val}-currency`)) {
          if (!techVariables.touchTimeouts[val]) {
            techVariables.touchTimeouts[val] = true
            const currentTicker = e.target
            const currentTooltip = currentTicker.nextElementSibling
            currentTooltip.classList.remove('hidden')
            setTimeout(() => {
              currentTooltip.classList.add('hidden')
              currentTicker.classList.remove('currency:hover')
              techVariables.touchTimeouts[val] = false
            }, 1500)
          }
        }
      })
    }
    tickersContainer.addEventListener('touchstart', tooltipTouch)
  } else {  

    //on mousemove
    tickersContainer.addEventListener('mousemove', (e) => {
      configObj.tickers.forEach((val) => {
        
        if (e.target.classList.contains(`${val}-currency`)) {
          const currentTicker = e.target
          const currentCard = currentTicker.parentNode
          const currentTooltip = currentTicker.nextElementSibling
  
          const tooltipWidth = currentTooltip.getBoundingClientRect().width
          const currentCardLeftOffset = currentCard.getBoundingClientRect().left
          const currentX = e.clientX
  
          //adjustingTooltip
          currentTooltip.style.left = -(tooltipWidth/2) - currentCardLeftOffset + currentX + 'px'

          //on mouseleave
          if (!techVariables.isTickerToolpisOpen) {
            currentTooltip.classList.remove('hidden')
            currentTicker.addEventListener('mouseout', onLeavingTicker)
            techVariables.isTickerToolpisOpen = true
          }
          function onLeavingTicker(e) {
            const currentTicker = e.target
            const currentTooltip = currentTicker.nextElementSibling
            currentTooltip.classList.add('hidden')
            removeEventListener('mouseout', onLeavingTicker)
            techVariables.isTickerToolpisOpen = false
          }
        }
      })
    })
    // opening statistics per X days by clicking ticker | closing screener
    createStatisticSheet()
    createHowManyDaysBlock()
  }
}
function createStatisticSheet() {
  tickersContainer.addEventListener('click', (e) => {
    configObj.tickers.forEach((val) => {
      if (e.target.classList.contains(`${val}-currency`)) {

        //creating screener
        const screener = document.createElement('div')
        screener.classList.add('screener')
        wrapper.insertAdjacentElement('beforeend', screener)

        //creating screener's closer
        const closer = document.createElement('div')
        closer.classList.add('closer')
        closer.insertAdjacentText('beforeend', '✕')
        screener.insertAdjacentElement('beforeend', closer)

        //closing screener and statistics
        screener.addEventListener('click', closeScreenerClick)
        function closeScreenerClick(e) {
          document.getElementsByClassName('screener')[0].remove()
          document.getElementsByClassName('statistic-sheet')[0].remove()
          techVariables.PreviousURL = techVariables.PreviousURLRestore
          removeEventListener('click',closeScreenerClick)
          document.removeEventListener('keyup',closeScreenerKey)
        }
        document.addEventListener('keyup', closeScreenerKey)
        function closeScreenerKey(e) {
          if (e.code === 'Escape') {
            document.getElementsByClassName('screener')[0].remove()
            document.getElementsByClassName('statistic-sheet')[0].remove()
            techVariables.PreviousURL = techVariables.PreviousURLRestore
            document.removeEventListener('keyup',closeScreenerKey)
            removeEventListener('click',closeScreenerClick)
          }
        }

        //creating statistic sheet
        const statisticSheet = document.createElement('div')
        statisticSheet.classList.add('statistic-sheet')
        wrapper.insertAdjacentElement('beforeend', statisticSheet)

        //creating label
        const currency = document.createElement('div')
        currency.insertAdjacentText('beforeend', `${val}`)
        currency.classList.add('statistic-label')
        
        statisticSheet.insertAdjacentElement('beforeend', currency) 

        //creating grid
        const grid = document.createElement('div')
        grid.classList.add('statistic-sheet__grid')
        statisticSheet.insertAdjacentElement('beforeend', grid)

        //creating clarification
        grid.insertAdjacentHTML('beforeend', '<div style="width: 90%; text-align: center;">День</div>')
        grid.insertAdjacentHTML('beforeend', '<div style="width: 90%; text-align: center;">Цена</div>')
        grid.insertAdjacentHTML('beforeend', '<div style="width: 90%; text-align: center;">Данная цена к цене предыдущего торгового дня</div>')
        grid.insertAdjacentHTML('beforeend', '<div style="width: 90%; text-align: center;">Текущая цена к данной цене</div>');

        //можно конечно сразу, не дожидаясь нажатия на какой-то тикер, начать загружать все нужные данные 
        //и расположить их в локальном объекте, но что если зашедший человек не будет даже нажимать тикеры? зачем тратить его трафик?
        //поэтому я решил загружать только после нажатия, а потом полученные данные уже можно и "закешировать" в переменной
        
        //filling statistic cells
        (async() => {
          for (let i = 0; i < configObj.DaysNumber; i++) {
            if (i == 0) {
              techVariables.currentPrice = techVariables.currencyRawData.Valute[val].Value
            }
            let response = await fetch(techVariables.PreviousURL)
            if (response.ok) {
              let currencyRawData
              if (i == 0) {
                currencyRawData = techVariables.currencyRawData
              } else {
                currencyRawData = await response.json()
              }
              temp  = await currencyRawData.PreviousURL
              techVariables.PreviousURL = temp
              
              //1
              const date =new Date(currencyRawData.Date)
              const month = techVariables.month[date.getMonth()];
              const day = date.getDate()
              const dayPrice =Math.round(currencyRawData.Valute[val].Value*100)/100 
              const dayPreviousPrice = currencyRawData.Valute[val].Previous

              //insert date info
              const statisticDay = document.createElement('div')
              statisticDay.insertAdjacentText('beforeend', `${month}, ${day}`)
              grid.insertAdjacentElement('beforeend', statisticDay)

              //insert price info
              const price = document.createElement('div')
              price.insertAdjacentText('beforeend', `${dayPrice}₽`)
              grid.insertAdjacentElement('beforeend', price)
              
              //change d/d
              const change = document.createElement('div')
              let difference = (dayPrice - dayPreviousPrice)*100/dayPreviousPrice
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
              grid.insertAdjacentElement('beforeend', change)

              //current price to the day price
              const longChange = document.createElement('div')
              let longDifference = (techVariables.currentPrice - dayPrice )*100/dayPrice
              longDifference = Math.round(longDifference*100)/100
              switch(true)
              {
              case (longDifference < 0):
                longChange.classList.add('negativeChange')
                break;
              case (longDifference > 0):
                longChange.classList.add('positiveChange')
                break;
              }
              longChange.insertAdjacentText('beforeend',`${longDifference}%`)
              grid.insertAdjacentElement('beforeend', longChange)
              
            } else {
              alert(`HTTP-Error:  ${response.status} \n\n Возможно неполадки с сервером-донором данных`)
            }
          }
        })()
      }
    })
  })
}

function createHowManyDaysBlock() {

  //creatingContainer
  const questionContainer = document.createElement('div')
  questionContainer.classList.add('howManyBlock', 'card')
  tickersContainer.insertAdjacentElement('beforebegin', questionContainer)

  //creating question
  const question = document.createElement('div')
  question.classList.add('questionTitle')
  question.textContent = 'Сколько дней загружать?'
  questionContainer.insertAdjacentElement('beforeend', question)

  //creating input
  const input = document.createElement('input')
  input.id = 'questionInput'
  questionContainer.insertAdjacentElement('beforeend', input)
  input.focus()


  //handling input
  input.addEventListener('keyup', (e) => {
    function validator() {
      if (input.value.length >= 1 &&
          input.value.length < 3 &&
          /^\d+$/.test(input.value) &&
          Number(input.value) >= 2) {
        return true
      } else {
        return false
      }
    }

    if (validator()) {
      input.classList.add('rightValue')
      input.classList.remove('wrongValue')
      if (e.code == 'Enter' || e.code =='NumpadEnter') {
        configObj.DaysNumber = Number(input.value)
        input.value = ''
      }
    } else {
      if (input.value.length !== 0) {
        input.classList.add('wrongValue')
        input.classList.remove('rightValue')
      } else {
        input.classList.remove('wrongValue')
        input.classList.remove('rightValue')
      }
    }
  })
}

//gettingData
(async() => {
  let response = await fetch(configObj.currencyDataLink)
  if (response.ok) {
    const currencyRawData = await response.json()
    techVariables.PreviousURL = currencyRawData.PreviousURL
    techVariables.PreviousURLRestore = currencyRawData.PreviousURL
    techVariables.currencyRawData = currencyRawData
    configObj.tickers.forEach((val)=>{
      techVariables.tickersInUse[val] = currencyRawData.Valute[val]
    })
    createExchangeDOM()
  } else {
    alert(`HTTP-Error:  ${response.status} \n\n Возможно неполадки с сервером-донором данных`)
  }
})()
