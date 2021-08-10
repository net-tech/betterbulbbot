import Command from "../../structures/Command";
import { Guild, GuildMember, Message, Snowflake, User } from "discord.js";
import { NonDigits } from "../../utils/Regex";
import DatabaseManager from "../../utils/managers/DatabaseManager";
import parse from "parse-duration";
import InfractionsManager from "../../utils/managers/InfractionsManager";
import BulbBotClient from "../../structures/BulbBotClient";
import moment from "moment";
import { MuteType } from "../../utils/types/MuteType";

const databaseManager: DatabaseManager = new DatabaseManager();
const infractionsManager: InfractionsManager = new InfractionsManager();

export default class extends Command {
	constructor(client: BulbBotClient, name: string) {
		super(client, {
			name,
			description: "Mutes the selected user",
			category: "Moderation",
			aliases: ["tempmute"],
			usage: "<member> <duration> [reason]",
			examples: ["mute 123456789012345678 5m", "mute 123456789012345678 1h rude user", "mute @Wumpus#0000 24h rude user"],
			argList: ["member:Member", "duration:Duration"],
			minArgs: 2,
			maxArgs: -1,
			clearance: 50,
			clientPerms: ["MANAGE_ROLES"],
		});
	}

	async run(message: Message, args: string[]): Promise<void | Message> {
		const targetID: Snowflake = args[0].replace(NonDigits, "");
		const target: GuildMember = <GuildMember>message.guild?.member(targetID);
		const muteRole: Snowflake = <Snowflake>await databaseManager.getMuteRole(<Snowflake>message.guild?.id);
		const duration: number = <number>parse(args[1]);
		let reason: string = args.slice(2).join(" ");
		let infID: number;

		if (!target)
			return message.channel.send(
				await this.client.bulbutils.translate("global_not_found", message.guild?.id, {
					type: await this.client.bulbutils.translate("global_not_found_types.member", message.guild?.id, {}),
					arg_expected: "member:Member",
					arg_provided: args[0],
					usage: this.usage,
				}),
			);
		if (await this.client.bulbutils.resolveUserHandle(message, this.client.bulbutils.checkUser(message, target), target.user)) return;

		if (!reason) reason = await this.client.bulbutils.translate("global_no_reason", message.guild?.id, {});
		if (!muteRole) return message.channel.send(await this.client.bulbutils.translate("mute_muterole_not_found", message.guild?.id, {}));
		if (target.roles.cache.find(role => role.id === muteRole)) return message.channel.send(await this.client.bulbutils.translate("mute_already_muted", message.guild?.id, { target: target.user }));
		if ((duration && duration <= <number>parse("0s")) || duration === null) return message.channel.send(await this.client.bulbutils.translate("duration_invalid_0s", message.guild?.id, {}));
		if (duration > <number>parse("1y")) return message.channel.send(await this.client.bulbutils.translate("duration_invalid_1y", message.guild?.id, {}));

		infID = await infractionsManager.mute(
			this.client,
			<Guild>message.guild,
			target,
			<GuildMember>message.member,
			await this.client.bulbutils.translate("global_mod_action_log", message.guild?.id, {
				action: await this.client.bulbutils.translate("mod_action_types.mute", message.guild?.id, {}),
				moderator: message.author,
				target: target.user,
				reason,
				until: Date.now() + <number>parse(args[1]),
			}),
			reason,
			muteRole,
			Date.now() + <number>parse(args[1]),
		);

		//let tempmuteID = await TempmuteCreate(message.guild?.id, target.user.tag, target.user.id, reason, Date.now() + <number>parse(args[1]));

		const timezone = this.client.bulbutils.timezones[await databaseManager.getTimezone(<Snowflake>message.guild?.id)];
		await message.channel.send(
			await this.client.bulbutils.translate("action_success", message.guild?.id, {
				context: "temp",
				action: await this.client.bulbutils.translate("mod_action_types.temp_ban", message.guild?.id, {}),
				target: target.user,
				reason,
				infraction_id: infID,
				until: moment(Date.now() + <number>parse(args[1]))
					.tz(timezone)
					.format("MMM Do YYYY, h:mm:ssa z"),
			}),
		);

		const client: BulbBotClient = this.client;
		setTimeout(async function () {
			if ((await infractionsManager.isActive(<Snowflake>message.guild?.id, infID)) === false) return;
			await infractionsManager.setActive(<Snowflake>message.guild?.id, infID, false);

			infID = await infractionsManager.unmute(
				client,
				<Guild>message.guild,
				MuteType.AUTO,
				target,
				<User>client.user,
				await client.bulbutils.translate("global_mod_action_log", message.guild?.id, {
					action: await client.bulbutils.translate("mod_action_types.unmute", message.guild?.id, {}),
					moderator: client.user,
					target: target.user,
					reason: "Automatic unmute",
				}),
				"Automatic unmute",
				muteRole,
			);

			//TempmuteDelete(tempmuteId);
		}, duration);
	}
}
