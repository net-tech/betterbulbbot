import Command from "../../../structures/Command";
import SubCommand from "../../../structures/SubCommand";
import { Message } from "discord.js";
import { readdirSync, unlinkSync } from "fs";
import { join } from "path";
import BulbBotClient from "../../../structures/BulbBotClient";

export default class extends SubCommand {
	constructor(client: BulbBotClient, parent: Command) {
		super(client, parent, {
			name: "clearfiles",
		});
	}

	public async run(message: Message): Promise<void | Message> {
		let count: number = 0;
		const path: string = `${__dirname}/../../../../files`;
		const files: string[] = readdirSync(path);
		for (const file of files) {
			if (file.endsWith(".gitignore")) continue;

			count++;
			unlinkSync(join(path, file));
		}

		message.channel.send(`Successfully deleted \`${count}\` files from the storage`);
	}
}