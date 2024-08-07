import { CommandInteraction } from "discord.js";
import { unlink } from "fs/promises";
import { exists } from "../../utils/helpers";
import { CustomEmote, GetEverythingAfterColon } from "../../utils/Regex";
import axios from "axios";
import sharp from "sharp";
import emojiUnicode from "emoji-unicode";
import BulbBotClient from "../../structures/BulbBotClient";
import { join } from "path";
import ApplicationCommand from "../../structures/ApplicationCommand";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";
import { filesDir } from "../..";

export default class Jumbo extends ApplicationCommand {
	constructor(client: BulbBotClient, name: string) {
		super(client, {
			name,
			description: "Sends a bigger version of the given emoji(s)",
			type: ApplicationCommandType.ChatInput,
			options: [
				{
					name: "emoji",
					type: ApplicationCommandOptionType.String,
					description: "The emoji(s) you want to send a bigger version of",
					required: true,
				},
			],
		});
	}

	public async run(interaction: CommandInteraction): Promise<void> {
		await interaction.deferReply();

		const emojis = interaction.options.getString("emoji")?.split(" ") as string[];

		const TWEMOJI_VERSION = "14.0.2";
		let doesIncludeAnimatedEmoji = false;

		const SIZE = 250;
		const imgPath: any = [];
		sharp.cache({ files: 0 });

		const realList: string[] = [];
		for (const element of emojis) {
			const customEmoji = element.match(CustomEmote);
			if (!customEmoji) realList.push(...element);
			else {
				realList.push(...customEmoji);
				if (customEmoji[0].startsWith("<a:")) doesIncludeAnimatedEmoji = true;
			}
		}

		if (realList.length > 1 && doesIncludeAnimatedEmoji)
			return void (await interaction.followUp({
				content: await this.client.bulbutils.translate("jumbo_too_many_animated", interaction.guild?.id, {}),
				ephemeral: true,
			}));
		if (realList.length > 10)
			return void (await interaction.followUp({
				content: await this.client.bulbutils.translate("jumbo_too_many", interaction.guild?.id, {}),
				ephemeral: true,
			}));

		try {
			const jumboList: string[] = [];

			const sharpCanvas = sharp({
				create: {
					width: SIZE * realList.length + 1,
					height: SIZE,
					channels: 4,
					background: { r: 0, g: 0, b: 0, alpha: 0 },
				},
				animated: doesIncludeAnimatedEmoji,
			});

			if (doesIncludeAnimatedEmoji) sharpCanvas.gif();
			else sharpCanvas.png();
			await sharpCanvas.toFile(`${filesDir}/${interaction.user.id}-${interaction.guild?.id}.${doesIncludeAnimatedEmoji ? "gif" : "png"}`);
			jumboList.push(`${interaction.user.id}-${interaction.guild?.id}.${doesIncludeAnimatedEmoji ? "gif" : "png"}`);

			for (const element of realList) {
				let emote: Nullable<RegExpMatchArray | string | []> = element;
				let emoteName: string | undefined;

				emote = emote.match(CustomEmote);

				if (emote === null) {
					emoteName = await emojiUnicode(element).split(" ").join("-");
					if (!(await exists(join(filesDir, `${emoteName}.png`))))
						/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						-- because of the above reassignment it will either be the custom
						emoji or the unicode emoji name  */
						await this.downloadEmoji(`https://cdnjs.cloudflare.com/ajax/libs/twemoji/${TWEMOJI_VERSION}/svg/${emoteName}.svg`, "png", emote, emoteName!, SIZE, filesDir, TWEMOJI_VERSION);

					jumboList.push(`${emoteName}.png`);
				} else {
					const extension = emote[0].startsWith("<a:") ? "gif" : "png";
					emote = emote[0].substring(1).slice(0, -1);
					emote = emote.match(GetEverythingAfterColon) || [];
					emoteName = emote[0];
					if (!emoteName) continue;

					if (!(await exists(join(filesDir, `${emoteName}.${extension}`))))
						await this.downloadEmoji(`https://cdn.discordapp.com/emojis/${emoteName}.${extension}?v=1&quality=lossless`, extension, emote, emoteName, SIZE, filesDir, TWEMOJI_VERSION);
					jumboList.push(`${emoteName}.${extension}`);
				}
			}

			if (doesIncludeAnimatedEmoji) {
				await interaction.editReply({
					files: [
						{
							attachment: `${filesDir}/${jumboList[1]}`,
							name: "jumbo.gif",
							description: `Jumbo created by ${interaction.user.tag} (${interaction.user.id})`,
						},
					],
					content: null,
				});
			} else {
				for (let i = 1; i < jumboList.length; i++) {
					imgPath.push({
						input: `${filesDir}/${jumboList[i]}`,
						gravity: "southeast",
						top: 0,
						left: SIZE * (i - 1),
						density: 2400,
						premultiplied: true,
					});
				}

				await sharp(`${filesDir}/${jumboList[0]}`).composite(imgPath).png().toFile(`${filesDir}/final-${interaction.user.id}-${interaction.guild?.id}.png`);
				await interaction.editReply({
					files: [
						{
							attachment: `${filesDir}/final-${interaction.user.id}-${interaction.guild?.id}.png`,
							name: "jumbo.png",
							description: `Jumbo created by ${interaction.user.tag} (${interaction.user.id})`,
						},
					],
					content: null,
				});
				await unlink(`${filesDir}/final-${interaction.user.id}-${interaction.guild?.id}.png`);
			}

			await unlink(`${filesDir}/${interaction.user.id}-${interaction.guild?.id}.${doesIncludeAnimatedEmoji ? "gif" : "png"}`);
		} catch (err) {
			this.client.log.error(`[JUMBO] ${interaction.user.tag} (${interaction.user.id}) had en error: `, err);
			return void (await interaction.followUp({
				content: await this.client.bulbutils.translate("jumbo_invalid", interaction.guild?.id, {}),
				ephemeral: true,
			}));
		}
	}

	private async downloadEmoji(url: string, extension: string, emote: any, emoteName: string, size: number, path: string, twemojiVersion: string) {
		try {
			await axios.get(url, { responseType: "arraybuffer" }).then(async (res) => {
				const sharpEmoji = sharp(res.data, {
					density: 2400,
					animated: extension === "gif",
				}).resize(size, size);
				if (extension === "gif") sharpEmoji.gif();
				else sharpEmoji.png();
				await sharpEmoji.toFile(`${path}/${emoteName}.${extension}`);

				return sharpEmoji;
			});
		} catch (error) {
			if (CustomEmote.test(emote)) throw error;

			url = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/${twemojiVersion}/svg/${emoteName.split("-fe0f").join("")}.svg`;

			await axios.get(url, { responseType: "arraybuffer" }).then(async (res) => {
				return await sharp(res.data, { density: 2400 }).png().resize(size, size).toFile(`${path}/${emoteName}.${extension}`);
			});
		}
	}
}
