const puppeteer = require('puppeteer')
const fs = require('fs')
require('dotenv').config()

const extractItems = async (): Promise<string[]> => {
  // const extractedElements = await page.evaluate(() => document.querySelectorAll('.pickup-info-div'))
  const extractedElements = document.querySelectorAll('.pickup-info-div')
  const items = []

  for (const element of extractedElements) {
    items.push(element.innerText)
  }

  console.log(items)

  return items
}

const authenticate = async () => {
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
  // await page.type('[type="email"]', username)
  await page.type('input[name="password"]', password)

  // await page.click("[type=submit]") // Click on submit button
  await page.click('#LogIn2') // Click on submit button
  await page.waitForTimeout(3000)

  await page.goto('https://portal.engineius.co.uk/app/supplierinbox?selectedTab=3&isGridView=false')
  await page.waitForTimeout(10000)
  await page.screenshot({ path: 'output/screenshot.png' }) // Take screenshot of the page

  const items = await page.evaluate(extractItems)
  fs.writeFileSync('./items.txt', items.join('\n') + '\n')

  await page.close()
  await browser.close()
}

authenticate()
