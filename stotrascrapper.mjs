#!/usr/bin/env node

// IMPs - StdLib
import { writeFileSync } from 'fs';
// IMPs - ExtLib
import { launch as pupLaunch } from 'puppeteer';
import prompts from 'prompts';


// INIT
const browser = await pupLaunch({ headless: true });
const page = await browser.newPage();

// FUNC
const getUrl = async () => (prompts({
  type: 'text',
  name: 'url',
  message: 'Paste stotram URL to scrape',
}));

const getTitle = () => {
  const h1 = document.querySelector('h1');
  const h1text = h1.innerText;
  const title = h1text
    .split(' – ')[0]
    .replaceAll(' ', '_')
    .toLowerCase();
  return title;
};

const getStotramText = () => {
  const shlokasArr = Array.from(document.querySelectorAll('.entry-content p'));
  const stotramText = shlokasArr
    .slice(2, (shlokasArr.length - 4))
    .map(p => p.innerText)
    .toString()
    .replace(/,/g, '\n\n');
  return stotramText;
};

// MAIN
const scrapeStotram = async () => {
  const { url } = await getUrl();
  await page.goto(url);
  await page.waitForSelector('.entry-content');

  const title = await page.evaluate(getTitle);
  const stotramText = await page.evaluate(getStotramText);

  if (!title || !stotramText)
    console.log("Could not find the stotram content...");

  writeFileSync(`${title}.txt`, stotramText);

  await browser.close();
}

scrapeStotram()
  .catch(console.error);
