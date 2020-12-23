const Event = require("../structures/Event");

module.exports = class extends (
	Event
) {
	constructor(...args) {
		super(...args, {});
	}

	run(guild, user) {
		// TODO
		/*
		==Guild==
		guild.id

		==User==
		user.id
		user.tag
		*/

		// check if it was a manual ban (fetch the audit logs)
		// if manual create an inf
		// check if it was from bulbbot

		console.log("new ban in:", guild);
		console.log("user:", user);
	}
};