const puppeteer = require('puppeteer')
const fs = require('fs')
require('dotenv').config()

const extractItems = async () => { // : Promise<string[]>
  const extractedElements = document.querySelectorAll('.movement-information')
  const items = []

  for (const element of extractedElements) {
    items.push(element.innerText)
  }

  return items
}

const authenticate = async () => { // : Promise<void>
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-setuid-sandbox'
    ]
  })

  const page = await browser.newPage()
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1
  })
  const email = process.env.EMAIL
  const password = process.env.PASSWORD

  // Navigate the page to a URL
  await page.goto('https://portal.engineius.co.uk/account/login?logout=true')

  await page.type('#email', email)
  await page.type('input[name="password"]', password)

  await page.click('#LogIn2') // Click on submit button

  await page.waitForTimeout(3000)

  await page.goto('https://portal.engineius.co.uk/app/supplierinbox?selectedTab=3&isGridView=false')
  await page.waitForTimeout(10000)
  await page.screenshot({ path: 'output/screenshot.png' }) // Take screenshot of the page

  const rawData = await page.evaluate(extractItems)

  const rawData2 = Array.from(rawData)
  const rawData3 = rawData2.map(el => el.split('\n'))

  const finaldData = []
  rawData3.forEach(el => (
    finaldData.push(`{
      pu_location: ${el[1]},
      pu_postcode: ${el[2]},
      earliest_pu: ${el[3]},
      latest_pu: ${el[4]},
      do_location: ${el[6]},
      do_postcode: ${el[7]},
      earliest_do: ${el[8]},
      latest_do: ${el[9]},
      distance: ${el[11]}
    }`)
  ))

  fs.writeFileSync('./items.txt', finaldData.join('\n') + '\n')

  await page.close()
  await browser.close()
}

authenticate()
