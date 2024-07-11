import { Snowflake, GuildMember } from "discord.js";
import prisma from "../../prisma";

export default class {
	public async createTempBan(target: GuildMember, reason: string, expireTime: number, guildId: Snowflake) {
		return prisma.tempban.create({
			data: {
				targetId: target.user.id,
				targetTag: target.user.tag,
				reason,
				expireTime,
				guildId,
				bulbGuild: {
					connect: {
						guildId,
					},
				},
			},
		});
	}

	public async getTempBan(id: number) {
		return prisma.tempban.findUnique({
			where: {
				id,
			},
		});
	}

	public async getLatestTempBan(target: GuildMember, guildId: Snowflake) {
		return prisma.tempban.findFirst({
			where: {
				targetId: target.user.id,
				bulbGuild: {
					guildId,
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	}

	public async deleteTempBan(id: number) {
		return prisma.tempban.delete({
			where: {
				id,
			},
		});
	}

	public async getAllTemBans() {
		return prisma.tempban.findMany();
	}
}
