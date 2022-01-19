const Discord = require("discord.js");
const axios = require("axios").default;
const config = require("./config.json");
const bot = new Discord.Client({
	intents: ["GUILD_MESSAGES", "GUILD_BANS", "GUILD_MEMBERS", "GUILD_INVITES", "GUILDS"]
});

bot.on('ready', () => {
	console.log(`Logged in as ${bot.user.tag}`);
	bot.user.setPresence(config.discord.status);
});

bot.on("messageCreate", (msg) => {
	if (msg.author.bot) return;
	if (msg.channel.type == "DM") return;
	// Funky debug commands
	const prefix = "!";
	const args = msg.content.slice(prefix.length).trim().split(/ +/g);
	const cmd = args.shift().toLowerCase();
	if (msg.content.toLowerCase().startsWith(prefix)) {
		switch (cmd) {
			case "qrz":
				// Handle lack of callsign
				if (!args[0]) return msg.channel.send("Please provide a callsign!").then((msg1) => {
					setTimeout(() => {
						msg.delete();
						msg1.delete();
					}, 10000)
				});
				msg.reply("Fetching...").then((msg1) => {
					callsign = args[0].replaceAll(/[^a-zA-Z0-9]/g, ""); // Filter out all non-alphanumeric characters
					axios.get(`https://callook.info/${callsign}/json`, {
						headers: {
							'User-Agent': 'QRZ-Bot/1.0; KO4WAL'
						}
					}).then((resp) => {
						data = resp.data;
						if (data.status == "INVALID") return msg1.edit("Callsign invalid!")
						msg1.edit({
							"content": null,
							"embeds": [{
								//"title": data.name,
								"color": 36863,
								"description": data.current.operClass,
								"fields": [{
										"name": "Address",
										"value": `${data.name}\n${data.address.line1}\n${data.address.line2}\n${data.address.attn}`
									},
									{
										"name": "Status",
										"value": data.status,
										"inline": true
									},
									{
										"name": "Type",
										"value": data.type,
										"inline": true
									},
									{
										"name": "Grant Date",
										"value": `${data.otherInfo.grantDate}-${data.otherInfo.expiryDate}`,
										"inline": true
									}
								],
								"author": {
									"name": data.current.callsign,
									"url": data.otherInfo.ulsUrl
								},
								"footer": {
									"text": `FRN: ${data.otherInfo.frn}`
								},
								"timestamp": new Date()
							}]
						})
					})
				})
				break;
		}
	}
});

bot.login(config.discord.token)