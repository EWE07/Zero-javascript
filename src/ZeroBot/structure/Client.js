const { Client, Collection } = require('discord.js');
const { readdirSync } = require('fs');

const { prefix, token } = require("../../../config.json");
const error = require("../errors/error.js");

const PathCmd = "./src/ZeroBot/commands"
const PathEvent = "./src/ZeroBot/events"

require("../../ZeroServer/server")
class ZeroClient extends Client {
	constructor(options) {
		super(options);
		this.commands = new Collection();
		this.aliases = new Collection();
		this.prefix = prefix;
}


	login() {
		let Token = process.env.token || token;
		error.ValidToken(Token);
		super.login(Token);
	}

	LoadCommands() {
		readdirSync(PathCmd).forEach(dir => {
			const commands = readdirSync(PathCmd + `/${dir}/`).filter(file =>
				file.endsWith('.js')
			);
			
			for (let file of commands) {
				let pull = require(`../commands/${dir}/${file}`);
				if (pull.name) {
					this.commands.set(pull.name, pull);
				} else {
					continue;
				}
				if (pull.aliases && Array.isArray(pull.aliases))
					pull.aliases.forEach(alias => this.aliases.set(alias, pull.name));
			}
		});
	}

	LoadEvents() {
		const events = readdirSync(PathEvent).filter(file =>
			file.endsWith('.js')
		);
		for (let file of events) {
			try {
				let pull = require(`../events/${file}`);
				pull.event = pull.event || file.replace('.js', '');
				this.on(pull.event, pull.bind(null, this));
			} catch (err) {
				console.log("Zero: " + err);
			}
		}
	}
}

module.exports = {
	ZeroClient
}
