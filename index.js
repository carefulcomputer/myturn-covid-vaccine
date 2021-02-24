const puppeteer = require("puppeteer");

const imageFolder = './'
let screenShotCount = 0;

// takes array of selectors and return the selector which matched first
const checkAnySelector = async (page, selectors) => {
  const jsHandle = await page.waitForFunction((selectors) => {
      for (const selector of selectors) {
          if (document.querySelector(selector) !== null) {
              return selector;
          }
      }
      return false;
  }, { visible: true, timeout: 10000 }, selectors);

  const selector = await jsHandle.jsonValue();
  return selector;

}

async function clickLinkOrButton(frame, selector) {
  await frame.waitForSelector(selector, { visible: true, timeout: 20000 })
  await frame.hover(selector)
  const button = await frame.$(selector);
  await button.click();
}

async function enterText(page, selector, textToEnter) {
  //console.log('text to enter: ' + textToEnter );
  await page.waitForSelector(selector, { visible: true, timeout: 10000 })
  const textBox = await page.$(selector);
  await page.hover(selector)
  await textBox.focus();
  //await page.evaluate((val, selector) => document.querySelector(selector).value = val, textToEnter, selector);
  await page.keyboard.type(textToEnter);
}

const checkForEach = async (browser, industry, county, zip, final_address) => {
  let page = await browser.newPage();
  await page.setDefaultNavigationTimeout(20000);
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36');
  await page.setViewport({ width: 1366, height: 1024 });

  let shouldProceed = true;

  try {

    page.on('response', async (response) => {
      // check if eligible
      if (response.url() == "https://api.myturn.ca.gov/public/eligibility" && response.request().method() == "POST") {
        const locationResp = await response.json();
        if (!locationResp.eligible) {
          console.log('Not eligible for ' + industry + ' ' + county);
          shouldProceed = false;
          //await page.close();
        }
      } else if (response.url().indexOf('availability') > -1 && response.url().indexOf('https://api.myturn.ca.gov/public/locations') > -1 && response.request().method() == "POST") {
        // checking if slot available
        const slots = await response.json();
        if (slots.availability && slots.availability.length > 0) {
          const availableSlots = slots.availability.filter(slot => slot.available);
          if (availableSlots.length > 0) {
            console.log('Slots found for ' + industry + ' ' + county)
          } else {
            console.log('No slots found for ' + industry + ' ' + county)
          }
        } else {
          console.log('No slots found for ' + industry + ' ' + county)
        }
        //await page.close();
      }
    });
    await page.goto('https://myturn.ca.gov/', { waitUntil: 'networkidle2' });

    // first page
    await clickLinkOrButton(page, 'button[data-testid="landing-page-continue"]');

    // industry, county, zip, final_address
    // second page
    await clickLinkOrButton(page, 'input[name="q-screening-18-yr-of-age"]');
    await clickLinkOrButton(page, 'input[name="q-screening-health-data"]');
    await clickLinkOrButton(page, 'input[name="q-screening-privacy-statement"]');
    await clickLinkOrButton(page, 'input[value="16 - 49"]');
    await page.select("select#q-screening-eligibility-industry", industry);
    await page.select("select#q-screening-eligibility-county", county);
    await clickLinkOrButton(page, 'button[data-testid="continue-button"]');
    await page.waitForTimeout(1000);
    if (shouldProceed) {
      // third page
      await enterText(page, '#location-search-input', zip);
      await page.waitForTimeout(1000);

      const addressSelector = await page.$x('//span[contains(text(), "' + final_address + '")]');
      await page.waitForTimeout(500);
      await addressSelector[0].click();

      const nextBtnSelector = 'button[data-testid="location-select-location-continue"';
      const noLocationSelector = 'div[class="tw-pb-8"] > p'
      
      let whichPage = await checkAnySelector(page, [nextBtnSelector, noLocationSelector]);
      if (whichPage == nextBtnSelector) {
      // if yes
        await page.waitForSelector(nextBtnSelector, { visible: true, timeout: 10000 })
        const allLocationButtons = await page.$$(nextBtnSelector);
        for (const currentLocationButton of allLocationButtons) {
          await currentLocationButton.click();
          await page.waitForTimeout(1000); // wait for api call to finish for slots
          await clickLinkOrButton(page, 'button[data-testid="back-button"]');
        }
      } else {
        // check if any location listed
        // if no then return 
        console.log('No location found for ' + industry + ' ' + county);
      }
    }
  } catch (err) {
    console.log("Error getting vaccine eligibility");
    await page.screenshot({ path: imageFolder + '/error.png' });
    console.log(err);
  }
  page.close();

}

const actionFunc = async (toCheck) => {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      userDataDir: 'myturn',
      excludeSwitches: 'enable-automation',
      ignoreDefaultArgs: ["--enable-automation"],
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      slowMo: 10,
    });

    for (const entry of toCheck) {
      await checkForEach(browser, ...entry);
    };


  } catch (error) {
    //console.log("Error getting vaccine eligibility");
    console.log(error);
  }
  browser.close();
};

(async () => {
  
  // enter all relevent locations which apply to you. 
  const toCheck = [
    ['Healthcare Worker', 'San Luis Obispo', '93433', 'Grover Beach, CA 93433, USA'],
    ['Healthcare Worker', 'Santa Clara', '94043', 'Mountain View, CA 94043, USA'],
    ['Education and childcare', 'Santa Clara', '94043', 'Mountain View, CA 94043, USA'],
    ['Communications and IT', 'Alameda', '94555', 'Fremont, CA 94555, USA'],
    ['Communications and IT', 'Santa Clara', '94043', 'Mountain View, CA 94043, USA']
  ]
  await actionFunc(toCheck);
})();
