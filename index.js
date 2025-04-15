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
            await page.goto('https://aternos.org/go/');
            await page.goto('https://aternos.org/login/');

            await page.type('#user', process.env.ATERNOS_USERNAME);
            await page.type('#password', process.env.ATERNOS_PASSWORD);
            await page.click('button[type="submit"]');
            await page.waitForNavigation();

            await page.goto('https://aternos.org/server/');
            await page.waitForSelector('#start', { visible: true });
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
