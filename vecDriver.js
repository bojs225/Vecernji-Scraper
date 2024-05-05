const { Builder, By, Key, until } = require("selenium-webdriver");
const fs = require("fs");
//Logger for success messages
function logSuccess(message) {
  const timestamp = new Date().toISOString();
  const logLine = `${timestamp} ==> Success Log: ${message}\n`;
  try {
    fs.appendFileSync("./application.log", logLine);
  } catch (err) {
    console.error("Error writing to application log file:", err);
  }
}
//Logger for Errors
function logError(message, error) {
  const timestamp = new Date().toISOString();
  const logLine = `${timestamp} ==> Error Log: ${message} - ${error.message}\n`;
  try {
    fs.appendFileSync("./application.log", logLine);
  } catch (err) {
    console.error("Error writing to application log file:", err);
  }
}

async function vecTest() {
  //Basic start, opening the Chrome Driver Browser and maximizing it
  const driver = await new Builder().forBrowser("chrome").build();
  logSuccess("Launching Chrome Driver Browser");

  try {
    logSuccess("!!!!!!NOVO POKRETANJE!!!!!!");
    await driver.manage().window().maximize();
    logSuccess("Maximizing browser window");
  } catch (error) {
    logError("Error maximizing browser window:", error);
  }
  //Navigating to Vecernji
  try {
    await driver.get("https://www.vecernji.hr/");
    logSuccess("Navigating to Vecernji");
  } catch (error) {
    logError("Error navigating to Vecernji:", error);
  }
  //Accepting cookies
  try {
    await driver
      .wait(until.elementLocated(By.id("didomi-notice-agree-button")), 5000)
      .click();
    logSuccess("Accepting cookies");
  } catch (error) {
    logError("Error accepting cookies:", error);
  }

  await driver.sleep(2000);
  //Clicking on search Icon the leads to search page
  try {
    const search = await driver.wait(
      until.elementLocated(By.xpath("//a[contains(.,'Pretraga')]")),
      10000
    );
    search.click();
    await driver.sleep(3000);
    logSuccess("Making a search");
  } catch (error) {
    logError("Error making a search:", error);
  }
  //Entering search of " Žanamari in the search input box and pressing ENTER"
  try {
    await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "//input[@type='search' and @placeholder='Upišite traženi pojam...']"
          )
        ),
        5000
      )
      .sendKeys("Žanamari", Key.ENTER);
    logSuccess("Made a search");
  } catch (error) {
    logError("Error entering search:", error);
  }
  //Logic to save search results of first 3 pages(there are too many on the website)
  try {
    let searchResults = [];

    // Iterate over the first three pages
    // Using url, instead of clicking numbers of pages links
    for (let page = 1; page <= 3; page++) {
      const vecUrl = `https://www.vecernji.hr/pretraga?query=%C5%BDanamari&order=-publish_from&page=${page}`;
      await driver.get(vecUrl);
      //Extracting search results
      const searchResultElements = await driver.wait(
        until.elementsLocated(
          By.xpath("//div[contains(@class, 'card-group__item')]")
        ),
        10000
      );
      //Looping through search results
      for (const element of searchResultElements) {
        try {
          const titleElement = await element.findElement(
            By.xpath(".//h3[contains(@class, 'card__title')]")
          );
          const title = await titleElement.getText();

          const descriptionElement = await element.findElement(
            By.xpath(".//p[contains(@class, 'card__description')]")
          );
          const description = await descriptionElement.getText();

          const imageElement = await element.findElement(By.xpath(".//img"));
          let imageSrc = await imageElement.getAttribute("data-src");
          if (imageSrc.startsWith("/")) {
            imageSrc = "https://www.vecernji.hr" + imageSrc;
          }
          //Pushing search results to array of objects
          searchResults.push({ title, description, imageSrc });
        } catch (error) {
          logError("Error extracting search result:", error);
        }
      }
    }
    //Saving search results to JSON
    const fileName = "search_results.json";
    fs.writeFileSync(fileName, JSON.stringify(searchResults, null, 2));
    logSuccess("Search results saved to JSON file:", fileName);
  } catch (error) {
    logError("Error extracting search results:", error);
    //Closing the browser
  } finally {
    driver.quit();
  }
}

vecTest();
