import { Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessageSelectMenu, Snowflake } from "discord.js";
import BulbBotClient from "../../../structures/BulbBotClient";
import DatabaseManager from "../../../utils/managers/DatabaseManager";
import { GuildConfiguration } from "../../../utils/types/DatabaseStructures";

const databaseManager: DatabaseManager = new DatabaseManager();

async function quickReasons(interaction: MessageComponentInteraction, client: BulbBotClient) {
	const config: GuildConfiguration = await databaseManager.getConfig(interaction.guild?.id as Snowflake);
	let reasons: { label: string; value: string; default?: boolean }[] = [];
	let selected: string[] = [];

	for (const reason of config.quickReasons) {
		reasons.push({
			label: reason,
			value: reason,
		});
	}

	const [header, back, add, remove] = [
		await client.bulbutils.translate("config_quick_reasons_header", interaction.guild?.id, {}),
		await client.bulbutils.translate("config_button_back", interaction.guild?.id, {}),
		await client.bulbutils.translate("config_quick_reason_button_add", interaction.guild?.id, {}),
		await client.bulbutils.translate("config_quick_reason_button_remove", interaction.guild?.id, {}),
	];

	let selectRow = new MessageActionRow().addComponents([
		new MessageSelectMenu()
			.setCustomId("quickReasons")
			.setPlaceholder(
				reasons.length
					? await client.bulbutils.translate("config_quick_reasons_placeholder_select", interaction.guild?.id, {})
					: await client.bulbutils.translate("config_quick_reason_placeholder_none", interaction.guild?.id, {}),
			)
			.setMinValues(1)
			.setOptions(reasons.length ? reasons : [{ label: "Placeholder", value: "Placeholder" }])
			.setDisabled(reasons.length === 0),
	]);

	let buttonRow = new MessageActionRow().addComponents([
		new MessageButton().setCustomId("back").setLabel(back).setStyle("DANGER"),
		new MessageButton()
			.setCustomId("add")
			.setLabel(add)
			.setStyle("SUCCESS")
			.setDisabled(reasons.length >= 24),
		new MessageButton().setCustomId("remove").setLabel(remove).setStyle("PRIMARY").setDisabled(true),
	]);

	interaction.deferred ? await interaction.editReply({ content: header, components: [selectRow, buttonRow] }) : await interaction.update({ content: header, components: [selectRow, buttonRow] });

	const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id;
	const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 60000 });

	collector?.on("collect", async (i: MessageComponentInteraction) => {
		if (i.isSelectMenu()) {
			selected = [...i.values];

			reasons = [];
			config.quickReasons.map(reason => {
				reasons.push({
					label: reason,
					value: reason,
					default: i.values.includes(reason),
				});
			});

			// @ts-ignore
			selectRow.components[0].setOptions(reasons);
			buttonRow.components[2].setDisabled(selected.length === 0);

			await i.update({ components: [selectRow, buttonRow] });
		} else if (i.isButton()) {
			switch (i.customId) {
				case "back":
					collector.stop();
					await require("./main").default(i, client);
					break;
				case "remove":
					collector.stop();
					for (const reason of selected) {
						await databaseManager.removeQuickReason(interaction.guild?.id as Snowflake, reason);
					}

					await interaction.followUp({
						content: await client.bulbutils.translate("config_quick_reason_remove_success", interaction.guild?.id, {}),
						ephemeral: true,
					});
					await quickReasons(i, client);
					break;
				case "add":
					collector.stop();

					selectRow.components[0].setDisabled(true);
					buttonRow.components[0].setDisabled(true);
					buttonRow.components[1].setDisabled(true);
					buttonRow.components[2].setDisabled(true);

					await interaction.editReply({ components: [selectRow, buttonRow] });

					const msgFilter = (m: Message) => m.author.id === interaction.user.id;
					const msgCollector = interaction.channel?.createMessageCollector({ filter: msgFilter, time: 60000, max: 1 });
					await interaction.followUp({
						content: await client.bulbutils.translate("config_quick_reason_prompt", interaction.guild?.id, {}),
						ephemeral: true,
					});
					await i.deferUpdate();

					msgCollector?.on("collect", async (m: Message) => {
						if (m.content.length > 100) {
							await interaction.followUp({
								content: await client.bulbutils.translate("config_quick_reason_too_long", interaction.guild?.id, {}),
								ephemeral: true,
							});
							await m.delete();
							await quickReasons(i, client);
							return;
						}

						if (config.quickReasons.includes(m.content)) {
							await interaction.followUp({
								content: await client.bulbutils.translate("config_quick_reason_already_exists", interaction.guild?.id, {
									reason: m.content,
								}),
								ephemeral: true,
							});
							await m.delete();
							await quickReasons(i, client);
							return;
						}

						await m.delete();
						await databaseManager.appendQuickReasons(interaction.guild?.id as Snowflake, m.content);
						await interaction.followUp({
							content: await client.bulbutils.translate("config_quick_reason_success", interaction.guild?.id, {
								reason: m.content,
							}),
							ephemeral: true,
						});
						await quickReasons(i, client);
					});
			}
		}
	});
}

export default quickReasons;
