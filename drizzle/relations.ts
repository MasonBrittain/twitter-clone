import { relations } from "drizzle-orm/relations";
import { usersInAuth, profiles, tweets, bookmarks, likes, replies, tweetsReplies, hashtags, tweetHashtag } from "./schema";

export const profilesRelations = relations(profiles, ({one, many}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [profiles.id],
		references: [usersInAuth.id]
	}),
	tweets: many(tweets),
	bookmarks: many(bookmarks),
	likes: many(likes),
	replies: many(replies),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	profiles: many(profiles),
}));

export const tweetsRelations = relations(tweets, ({one, many}) => ({
	profile: one(profiles, {
		fields: [tweets.profileId],
		references: [profiles.id]
	}),
	tweet: one(tweets, {
		fields: [tweets.replyId],
		references: [tweets.id],
		relationName: "tweets_replyId_tweets_id"
	}),
	tweets: many(tweets, {
		relationName: "tweets_replyId_tweets_id"
	}),
	bookmarks: many(bookmarks),
	likes: many(likes),
	replies: many(replies),
	tweetsReplies_replyId: many(tweetsReplies, {
		relationName: "tweetsReplies_replyId_tweets_id"
	}),
	tweetsReplies_tweetId: many(tweetsReplies, {
		relationName: "tweetsReplies_tweetId_tweets_id"
	}),
	tweetHashtags: many(tweetHashtag),
}));

export const bookmarksRelations = relations(bookmarks, ({one}) => ({
	tweet: one(tweets, {
		fields: [bookmarks.tweetId],
		references: [tweets.id]
	}),
	profile: one(profiles, {
		fields: [bookmarks.userId],
		references: [profiles.id]
	}),
}));

export const likesRelations = relations(likes, ({one}) => ({
	tweet: one(tweets, {
		fields: [likes.tweetId],
		references: [tweets.id]
	}),
	profile: one(profiles, {
		fields: [likes.userId],
		references: [profiles.id]
	}),
}));

export const repliesRelations = relations(replies, ({one, many}) => ({
	reply: one(replies, {
		fields: [replies.replyId],
		references: [replies.id],
		relationName: "replies_replyId_replies_id"
	}),
	replies: many(replies, {
		relationName: "replies_replyId_replies_id"
	}),
	tweet: one(tweets, {
		fields: [replies.tweetId],
		references: [tweets.id]
	}),
	profile: one(profiles, {
		fields: [replies.userId],
		references: [profiles.id]
	}),
}));

export const tweetsRepliesRelations = relations(tweetsReplies, ({one}) => ({
	tweet_replyId: one(tweets, {
		fields: [tweetsReplies.replyId],
		references: [tweets.id],
		relationName: "tweetsReplies_replyId_tweets_id"
	}),
	tweet_tweetId: one(tweets, {
		fields: [tweetsReplies.tweetId],
		references: [tweets.id],
		relationName: "tweetsReplies_tweetId_tweets_id"
	}),
}));

export const tweetHashtagRelations = relations(tweetHashtag, ({one}) => ({
	hashtag: one(hashtags, {
		fields: [tweetHashtag.hashtagId],
		references: [hashtags.id]
	}),
	tweet: one(tweets, {
		fields: [tweetHashtag.tweetId],
		references: [tweets.id]
	}),
}));

export const hashtagsRelations = relations(hashtags, ({many}) => ({
	tweetHashtags: many(tweetHashtag),
}));