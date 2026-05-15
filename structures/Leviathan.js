require('dotenv').config();
const { Client, Collection, Partials, WebhookClient, Options, GatewayIntentBits } = require('discord.js')
const { REST } = require('@discordjs/rest');
const fs = require('fs')
const mongoose = require('mongoose')
const Utils = require('./util')
const { glob } = require('glob')
const { promisify } = require('util')
const { Database } = require('quickmongo')
const axios = require('axios')
const pg = require('pg')
const redis = require("redis");
const { ClusterClient, getInfo } = require('discord-hybrid-sharding');
module.exports = class Leviathan extends Client {
    constructor() {
        super({
            intents: 53608447,
            fetchAllMembers: true,
            shards: getInfo().SHARD_LIST,
            shardCount: getInfo().TOTAL_SHARDS,
            allowedMentions: {
                parse: ['users', 'roles'],
                repliedUser: true
            },
            partials: [Partials.Message, Partials.Channel, Partials.Reaction],
            sweepers: {

                messages: {

                    interval: 300,

                    lifetime: 1800
                }

            }

        })

        this.setMaxListeners(Infinity)
        this.cluster = new ClusterClient(this);
        this.config = require(`${process.cwd()}/config.json`)
        this.emoji = require(`${process.cwd()}/emoji.json`)
        this.logger = require('./logger')
        this.commands = new Collection()
        this.categories = fs.readdirSync('./commands/')
        this.util = new Utils(this)
        this.color = 0x2b2d31
        this.support = `https://discord.gg/W2bgPVMnEg`
        this.cooldowns = new Collection()
        this.snek = require('axios')

        this.ratelimit = { send: (msg) => this.channels.cache.get('1452127574741356645')?.send(msg) }
        this.error = { send: (msg) => this.channels.cache.get('1452127574741356645')?.send(msg) }

        this.on('error', (error) => {
            this.error.send(`\`\`\`js\n${error.stack}\`\`\``)
        })
        process.on('unhandledRejection', (error) => {
            this.error.send(`\`\`\`js\n${error.stack}\`\`\``)
        })
        process.on('uncaughtException', (error) => {
            this.error.send(`\`\`\`js\n${error.stack}\`\`\``)
        })
        process.on('warning', (warn) => {
            this.error.send(`\`\`\`js\n${warn}\`\`\``)
        })
        process.on('uncaughtExceptionMonitor', (err, origin) => {
            this.error.send(`\`\`\`js\n${err},${origin}\`\`\``)
        })
        this.rest.on('rateLimited', (info) => {
            this.ratelimit.send({
                content: `\`\`\`js\nTimeout: ${info.retryAfter},\nLimit: ${info.limit},\nMethod: ${info.method},\nPath: ${info.hash},\nRoute: ${info.route},\nGlobal: ${info.global}\nURL : ${info.url}\nScope : ${info.scope}\nMajorPrameter : ${info.majorParameter} Black\`\`\``
            })
        })
    }


    async initializedata() {
        const dbPath = `${process.cwd()}/Database`;
        
        // Ensure Database directory exists
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(dbPath, { recursive: true });
        }

        // Simple JSON file database wrapper
        const createJsonDb = (filePath) => {
            const ensureFile = () => {
                if (!fs.existsSync(filePath)) {
                    fs.writeFileSync(filePath, JSON.stringify({}));
                }
            };

            ensureFile();

            return {
                get: (key) => {
                    try {
                        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                        return data[key];
                    } catch (e) {
                        return null;
                    }
                },
                set: (key, value) => {
                    try {
                        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                        data[key] = value;
                        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                    } catch (e) {
                        console.error(`Error saving to ${filePath}:`, e);
                    }
                },
                all: () => {
                    try {
                        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    } catch (e) {
                        return {};
                    }
                },
                delete: (key) => {
                    try {
                        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                        delete data[key];
                        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                    } catch (e) {
                        console.error(`Error deleting from ${filePath}:`, e);
                    }
                },
                clear: () => {
                    fs.writeFileSync(filePath, JSON.stringify({}));
                }
            };
        };

        this.warn = createJsonDb(`${dbPath}/warns.json`);
        this.snipe = createJsonDb(`${dbPath}/snipes.json`);
        this.msgs = createJsonDb(`${dbPath}/messages.json`);
        this.voice = createJsonDb(`${dbPath}/voice.json`);
    }

    async initializeMongoose() {
        const mongoUri = process.env.MONGO_DB || this.config.MONGO_DB;
        this.db = new Database(mongoUri)
        this.db.connect()
        this.logger.log(`Connecting to MongoDb...`)
        await mongoose.connect(mongoUri,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        this.logger.log('Mongoose Database Connected', 'ready')
    }
    async loadEvents() {
        fs.readdirSync('./events/').forEach((file) => {
            if (file.endsWith('.js')) {
                let eventName = file.split('.')[0]
                require(`${process.cwd()}/events/${file}`)(this)
                this.logger.log(`Updated Event ${eventName}.`, 'event')
            }
        })
    }

    async loadlogs() {
        fs.readdirSync('./logs/').forEach((file) => {
            if (file.endsWith('.js')) {
                let logevent = file.split('.')[0]
                require(`${process.cwd()}/logs/${file}`)(this)
                this.logger.log(`Updated Logs ${logevent}.`, 'event')
            }
        })
    }


    async loadMain() {
        const commandFiles = []

        const commandDirectories = fs.readdirSync(`${process.cwd()}/commands`)
        for (const directory of commandDirectories) {
            const files = fs
                .readdirSync(`${process.cwd()}/commands/${directory}`)
                .filter((file) => file.endsWith('.js'))

            for (const file of files) {
                commandFiles.push(
                    `${process.cwd()}/commands/${directory}/${file}`
                )
            }
        }
        commandFiles.map((value) => {
            const file = require(value)
            const splitted = value.split('/')
            const directory = splitted[splitted.length - 2]
            if (file.name) {
                const properties = { directory, ...file }
                this.commands.set(file.name, properties)
            }
        })
        this.logger.log(`Updated ${this.commands.size} Commands.`, 'cmd')
    }
}
