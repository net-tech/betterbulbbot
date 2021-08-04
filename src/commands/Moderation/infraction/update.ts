import SubCommand from "../../../structures/SubCommand";
import { Message, Snowflake } from "discord.js";
import InfractionsManager from "../../../utils/managers/InfractionsManager";
import { NonDigits } from "../../../utils/Regex";

const infractionsManager: InfractionsManager = new InfractionsManager();

export default class extends SubCommand {
	constructor(...args) {
		// @ts-ignore
		super(...args, {
			name: "update",
			clearance: 50,
			minArgs: 2,
			maxArgs: -1,
			argList: ["infraction:int", "reason:string"],
			usage: "<infraction> <reason>",
		});
	}

	public async run(message: Message, args: string[]): Promise<void | Message> {
		if (!(await infractionsManager.getInfraction(<Snowflake>message.guild?.id, Number(args[0].replace(NonDigits, ""))))) {
			return message.channel.send(
				await this.client.bulbutils.translateNew("infraction_not_found", message.guild?.id, {
					infraction_id: args[0],
				}),
			);
		}

		const reason = args.slice(1).join(" ");
		await infractionsManager.updateReason(<Snowflake>message.guild?.id, Number(args[0]), reason);
		return message.channel.send(await this.client.bulbutils.translateNew("infraction_update_success", message.guild?.id, { infraction_id: args[0] }));
	}
}
