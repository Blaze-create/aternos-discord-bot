require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.content === '!startserver') {
        message.reply('Starting Aternos server...');

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        try {
            // Go directly to the login page and wait for network to be idle
            await page.goto('https://aternos.org/login/', { waitUntil: 'networkidle0' });

            // Wait for the username input to appear and type credentials
            await page.waitForSelector('input.username', { timeout: 60000 }); // Increased timeout
            await page.type('input.username', process.env.ATERNOS_USERNAME);

            // Wait for the password input to appear and type the password
            await page.waitForSelector('input.password', { timeout: 60000 }); // Increased timeout
            await page.type('input.password', process.env.ATERNOS_PASSWORD);

            // Click the submit button
            await page.click('button[type="submit"]');

            // Wait for the page to navigate after submitting the login form
            await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

            // Now that we are logged in, go to the server page
            await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle0' });

            // Wait for the start button to appear and click it to start the server
            await page.waitForSelector('#start', { visible: true, timeout: 60000 }); // Increased timeout
            await page.click('#start');

            message.reply('Server start requested successfully!');
            await browser.close();
        } catch (err) {
            console.error(err);
            message.reply('Failed to start server.');
            await browser.close();
        }


    }
});

client.login(process.env.DISCORD_TOKEN);
