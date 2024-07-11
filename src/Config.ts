import { Snowflake, ColorResolvable, ActivityType, PresenceStatusData, IntentsString, PermissionString, PartialTypes } from "discord.js";
import * as Emotes from "./emotes.json";

export const name = "Spark";
export const developers: string[] = ["461862173044375572", "812856907432722473"];
export const subDevelopers: string[] = [];
export const whitelistedGuilds: string[] = ["1260704854523777034"]
export const lib = "Discord.JS";

// Configs
export const embedColor: ColorResolvable = "#FD0102";
export const massCommandSleep = 850;
export const intents: IntentsString[] = ["GUILDS", "GUILD_MEMBERS", "GUILD_BANS", "GUILD_MESSAGES", "GUILD_INVITES", "GUILD_MESSAGE_REACTIONS", "GUILD_VOICE_STATES", "GUILD_SCHEDULED_EVENTS"];
export const partials: PartialTypes[] = ["MESSAGE"];
export const defaultPerms: PermissionString[] = ["SEND_MESSAGES", "VIEW_CHANNEL", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS"];

// pm2 configs
export const pm2Name = "bulbbot";

// Client
export const tag = "Spark#8858";
export const id: Snowflake = "1046572874036690974";
export const activityName = "the light shine";
export const type: Exclude<ActivityType, "CUSTOM"> = "WATCHING";
export const status: PresenceStatusData = "online";
export const supportInvite = "https://example.com";
export const botInvite = "https://example.com";

export const discordApi = "https://discord.com/api/v9";

// Server
export const prometheusHost = "localhost";
export const prometheusPort = 7070;

// Logs
export const botDM: Snowflake = "";
export const invite: Snowflake = "1260951212430327941";
export const error: Snowflake = "1260951231271145562";
export const debug: Snowflake = "";
export const translation: Snowflake = "";

export const translatorEmojis: Record<string, string> = {
	emote_warn: Emotes.actions.WARN,
	emote_lock: Emotes.other.LOCK,
	emote_fail: Emotes.other.FAIL,
	emote_wrench: Emotes.actions.WRENCH,
	emote_github: Emotes.other.GITHUB,
	emote_owner: Emotes.other.GUILD_OWNER,
	emote_online: Emotes.status.ONLINE,
	emote_idle: Emotes.status.IDLE,
	emote_dnd: Emotes.status.DND,
	emote_offline: Emotes.status.OFFLINE,
	emote_loading: Emotes.other.LOADING,
	emote_join: Emotes.other.JOIN,
	emote_leave: Emotes.other.LEAVE,
	emote_success: Emotes.other.SUCCESS,
	emote_trash: Emotes.other.TRASH,
	emote_edit: Emotes.other.EDIT,
	emote_add: Emotes.other.ADD,
	emote_remove: Emotes.other.REMOVE,
	emote_ban: Emotes.actions.BAN,
	emote_kick: Emotes.actions.KICK,
	emote_unban: Emotes.actions.UNBAN,
	emote_mute: Emotes.actions.MUTE,
	emote_remind: Emotes.other.REMIND,
	emote_locked: Emotes.other.LOCKED,
	emote_unlocked: Emotes.other.UNLOCKED,
};

export const translatorConfig: Record<string, any> = {
	interpolation: {
		escapeValue: false,
	},
};
