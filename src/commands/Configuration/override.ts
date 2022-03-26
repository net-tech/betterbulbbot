import Command from "../../structures/Command";
import BulbBotClient from "../../structures/BulbBotClient";

import create from "./override/create";
import disable from "./override/disable";
import edit from "./override/edit";
import enable from "./override/enable";
import list from "./override/list";
import remove from "./override/delete";

export default class extends Command {
	constructor(client: BulbBotClient, name: string) {
		super(client, {
			name,
			aliases: ["overide"],
			subCommands: [create, disable, edit, enable, list, remove],
			clearance: 75,
			minArgs: 1,
			maxArgs: -1,
			argList: ["action:String"],
			usage: "<action>",
			description: "Configure the override system.",
		});
	}
}