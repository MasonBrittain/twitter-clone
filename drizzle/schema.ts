import { pgTable, foreignKey, unique, pgPolicy, check, uuid, timestamp, text, boolean, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const profiles = pgTable("profiles", {
	id: uuid().primaryKey().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	username: text().notNull(),
	fullName: text("full_name"),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [users.id],
			name: "profiles_id_fkey"
		}).onDelete("cascade"),
	unique("profiles_username_key").on(table.username),
	pgPolicy("Users can update own profile", { as: "permissive", for: "update", to: ["public"], using: sql`(auth.uid() = id)` }),
	pgPolicy("Users can insert their own profile", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Public profiles are viewable by everyone", { as: "permissive", for: "select", to: ["public"] }),
	check("username_length", sql`length(username) >= 3`),
]);

export const hashtags = pgTable("hashtags", {
	id: uuid().primaryKey().notNull(),
	name: text().notNull(),
}, (table) => [
	unique("hashtags_name_key").on(table.name),
]);

export const tweets = pgTable("tweets", {
	id: uuid().primaryKey().notNull(),
	text: text().notNull(),
	profileId: uuid("profile_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	isReply: boolean("is_reply").default(false),
	replyId: uuid("reply_id"),
}, (table) => [
	foreignKey({
			columns: [table.profileId],
			foreignColumns: [profiles.id],
			name: "tweets_profile_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.replyId],
			foreignColumns: [table.id],
			name: "tweets_reply_id_fkey"
		}).onDelete("cascade"),
]);

export const bookmarks = pgTable("bookmarks", {
	id: uuid().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	tweetId: uuid("tweet_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tweetId],
			foreignColumns: [tweets.id],
			name: "bookmarks_tweet_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "bookmarks_user_id_fkey"
		}).onDelete("cascade"),
	unique("bookmark_unique").on(table.userId, table.tweetId),
]);

export const likes = pgTable("likes", {
	id: uuid().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	tweetId: uuid("tweet_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tweetId],
			foreignColumns: [tweets.id],
			name: "likes_tweet_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "likes_user_id_fkey"
		}).onDelete("cascade"),
	unique("like_unique").on(table.userId, table.tweetId),
]);

export const replies = pgTable("replies", {
	id: uuid().primaryKey().notNull(),
	text: text().notNull(),
	userId: uuid("user_id").notNull(),
	tweetId: uuid("tweet_id"),
	replyId: uuid("reply_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.replyId],
			foreignColumns: [table.id],
			name: "replies_reply_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tweetId],
			foreignColumns: [tweets.id],
			name: "replies_tweet_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "replies_user_id_fkey"
		}).onDelete("cascade"),
]);

export const tweetsReplies = pgTable("tweets_replies", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tweetId: uuid("tweet_id"),
	replyId: uuid("reply_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.replyId],
			foreignColumns: [tweets.id],
			name: "tweets_replies_reply_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tweetId],
			foreignColumns: [tweets.id],
			name: "tweets_replies_tweet_id_fkey"
		}).onDelete("cascade"),
]);

export const tweetHashtag = pgTable("tweet_hashtag", {
	tweetId: uuid("tweet_id").notNull(),
	hashtagId: uuid("hashtag_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.hashtagId],
			foreignColumns: [hashtags.id],
			name: "tweet_hashtag_hashtag_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tweetId],
			foreignColumns: [tweets.id],
			name: "tweet_hashtag_tweet_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.tweetId, table.hashtagId], name: "tweet_hashtag_pkey"}),
]);
