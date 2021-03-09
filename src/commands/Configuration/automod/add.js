const { append } = require("../../../utils/AutoModUtils");

module.exports = async (client, message, args) => {
	const part = args[1];
	const item = args[2];

	if (!part) return message.channel.send("no part");
	if (!item) return message.channel.send("no item");
	if (!["website", "invites", "words"].includes(part.toLowerCase())) return message.channel.send("invalid part");

	const error = await append(message.guild.id, part.toLowerCase(), item);
	if (error === 1) return message.channel.send("already in db");

	message.channel.send("added that");
};
