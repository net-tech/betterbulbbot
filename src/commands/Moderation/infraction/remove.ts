import Command from "../../../structures/Command";
import SubCommand from "../../../structures/SubCommand";
import { Message, Snowflake } from "discord.js";
import InfractionsManager from "../../../utils/managers/InfractionsManager";
import * as Emotes from "../../../emotes.json";
import { NonDigits } from "../../../utils/Regex";
import BulbBotClient from "../../../structures/BulbBotClient";

const infractionsManager: InfractionsManager = new InfractionsManager();

export default class extends SubCommand {
	constructor(client: BulbBotClient, parent: Command) {
		super(client, parent, {
			name: "delete",
			aliases: ["del", "remove"],
			clearance: 50,
			minArgs: 1,
			maxArgs: 1,
			argList: ["infraction:int"],
			usage: "<infraction>",
		});
	}

	public async run(message: Message, args: string[]): Promise<void | Message> {
		const infID: number = Number(args[0]);

		if (isNaN(infID) || (await infractionsManager.getInfraction(<Snowflake>message.guild?.id, infID)) === undefined) {
			return message.channel.send(
				await this.client.bulbutils.translate("infraction_not_found", message.guild?.id, {
					infraction_id: args[0],
				}),
			);
		}

		const inf: Record<string, any> = <Record<string, any>>await infractionsManager.getInfraction(<Snowflake>message.guild?.id, infID);
		const target: Record<string, string> = { tag: inf.target, id: inf.targetId };
		const moderator: Record<string, string> = { tag: inf.moderator, id: inf.moderatorId };

		let confirmMsg: Message;

		await message.channel
			.send(
				await this.client.bulbutils.translate("infraction_delete_confirm", message.guild?.id, {
					infraction_id: inf["id"],
					moderator,
					target,
					reason: inf["reason"],
				}),
			)
			.then(msg => {
				confirmMsg = msg;
				msg.react(Emotes.other.SUCCESS);
				msg.react(Emotes.other.FAIL);

				const filter = (reaction, user) => {
					return user.id === message.author.id;
				};

				msg
					.awaitReactions(filter, { max: 1, time: 30000, errors: ["time"] })
					.then(async collected => {
						const reaction = collected.first();

						if (reaction?.emoji.id === Emotes.other.SUCCESS.replace(NonDigits, "")) {
							await infractionsManager.deleteInfraction(<Snowflake>message.guild?.id, infID);
							await msg.delete();
							return await message.channel.send(
								await this.client.bulbutils.translate("infraction_delete_success", message.guild?.id, {
									infraction_id: infID,
								}),
							);
						} else {
							await msg.delete();
							return await message.channel.send(await this.client.bulbutils.translate("global_execution_cancel", message.guild?.id, {}));
						}
					})
					.catch(async () => {
						await confirmMsg.delete();
						return await message.channel.send(await this.client.bulbutils.translate("global_execution_cancel", message.guild?.id, {}));
					});
			});
	}
}
