"use server";

import { Database } from "../database.types";
import { supabaseServer } from ".";
import { db } from "../db";
import {
  Like,
  Profile,
  Tweet,
  likes,
  profiles,
  tweets,
  tweetsReplies,
} from "../db/schema";
import { and, desc, eq, exists } from "drizzle-orm";

export type TweetType = Database["public"]["Tables"]["tweets"]["Row"] & {
  profiles: Pick<
    Database["public"]["Tables"]["profiles"]["Row"],
    "full_name" | "username"
  >;
};

export const getTweets = async ({
  currentUserID,
  getSingleTweetId,
    limit,
  replyId,
  profileUsername,
}: {
  currentUserID?: string;
    getSingleTweetId?: string;
  limit?: number;
  replyId?: string;
  profileUsername?: string;
}) => {
  try {
    // Build all WHERE conditions first
    const conditions = [];

    if (getSingleTweetId) {
      conditions.push(eq(tweets.id, getSingleTweetId));
    }

    if (replyId) {
      conditions.push(eq(tweets.replyId, replyId));
      conditions.push(eq(tweets.isReply, true));
    } else {
      conditions.push(eq(tweets.isReply, false));
    }

    if (profileUsername) {
      conditions.push(eq(profiles.username, profileUsername));
      // Only show non-replies for profile pages unless specifically looking for replies
      if (!replyId) {
        conditions.push(eq(tweets.isReply, false));
      }
    }

    // Build the complete query in one chain to avoid TypeScript issues
    const baseQuery = db
      .select({
        tweets,
        profiles,
        ...(currentUserID
          ? {
              hasLiked: exists(
                db
                  .select()
                  .from(likes)
                  .where(
                    and(
                      eq(likes.tweetId, tweets.id),
                      eq(likes.userId, currentUserID)
                    )
                  )
              ),
            }
          : {}),
        likes,
        tweetsReplies,
      })
        .from(tweets)
      .leftJoin(likes, eq(tweets.id, likes.tweetId))
      .leftJoin(tweetsReplies, eq(tweets.id, tweetsReplies.replyId))
      .innerJoin(profiles, eq(tweets.profileId, profiles.id));

    // Execute the complete query with all conditions at once
    const rows = await baseQuery
      .$dynamic()
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tweets.createdAt))
      .limit(limit || 50);

    if (rows) {
      const result = rows.reduce<
        Record<
          string,
          {
            tweet: Tweet;
            likes: Like[];
            profile: Profile;
            hasLiked: boolean;
            replies: Tweet[];
          }
        >
      >((acc, row) => {
        const tweet = row.tweets;
        const like = row.likes;
        const profile = row.profiles;
        const hasLiked = Boolean(row.hasLiked);
        const reply = row.tweetsReplies;

        if (!acc[tweet.id]) {
          acc[tweet.id] = {
            tweet,
            likes: [],
            profile,
            hasLiked,
            replies: [],
          };
        }

        if (like) {
          // Check if this like is already added to avoid duplicates
          const likeExists = acc[tweet.id].likes.some(existingLike => existingLike.id === like.id);
          if (!likeExists) {
            acc[tweet.id].likes.push(like);
          }
        }

        if (reply) {
          // Check if this reply is already added to avoid duplicates
          const replyExists = acc[tweet.id].replies.some(existingReply => existingReply.id === reply.id);
          if (!replyExists) {
            acc[tweet.id].replies.push(reply as Tweet);
          }
        }

        return acc;
      }, {});

      const data = Object.values(result);
      return data;
    }

    return [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getLikesCount = async (tweetId: string) => {
  const res = await supabaseServer
    .from("likes")
    .select("id", {
      count: "exact",
    })
    .eq("tweet_id", tweetId);

  return res;
};

export const isLiked = async ({
  tweetId,
  userId,
}: {
  tweetId: string;
  userId?: string;
}) => {
  if (!userId) return false;

  const { data, error } = await supabaseServer
    .from("likes")
    .select("id")
    .eq("tweet_id", tweetId)
    .eq("user_id", userId)
    .single();

  return Boolean(data?.id);
};