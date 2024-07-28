import {ObjectId, WithId} from "mongodb";
import {PostDBType} from "../../db/db-types";
import {OutputPostModel} from "../output";
import mongoose, {FlattenMaps} from "mongoose";
import {jwtService} from "../../../application/jwt-service";
import {userModel} from "../../../db/db";

export const postMapper = (postDB: WithId<PostDBType>): OutputPostModel => {
    return {
        id: postDB._id,
        title: postDB.title,
        shortDescription: postDB.shortDescription,
        content: postDB.content,
        blogId: postDB.blogId,
        blogName: postDB.blogName,
        createdAt: postDB.createdAt,
        extendedLikesInfo: {
            likesCount: postDB.extendedLikesInfo.likesCount,
            dislikesCount: postDB.extendedLikesInfo.dislikesCount,
            newestLikes: postDB.extendedLikesInfo.newestLikes
        }
    }
}

export function transformPostDB(value: FlattenMaps<{
    createdAt?: string | null | undefined;
    title?: string | null | undefined;
    shortDescription?: string | null | undefined;
    content?: string | null | undefined;
    blogName?: string | null | undefined;
    blogId?: string | null | undefined;
    extendedLikesInfo?: {
        likesCount?: number | null | undefined,
        dislikesCount?: number | null | undefined,
        newestLikes?: {
            addedAt: string | null | undefined,
            userId: string | null | undefined,
            login: string | null | undefined
        }[] | null | undefined
    } | null | undefined
}> &
    { _id: ObjectId }): OutputPostModel {

    return {
        id: value._id,
        blogId: value.blogId || '',
        createdAt: value.createdAt || '',
        title: value.title || '',
        shortDescription: value.shortDescription || '',
        content: value.content || '',
        blogName: value.blogName || '',
        extendedLikesInfo: {
            likesCount: value.extendedLikesInfo?.likesCount || 0,
            dislikesCount: value.extendedLikesInfo?.dislikesCount || 0,
            newestLikes: (value.extendedLikesInfo?.newestLikes || []).map(like => ({
                addedAt: like.addedAt || '',
                userId: like.userId || '',
                login: like.login || ''
            }))
        }
    };
}

export async function transformPostDbWithMyStatus(value: {
    _id?: mongoose.Types.ObjectId,
    title?: string | null | undefined,
    shortDescription?: string | null | undefined,
    content?: string | null | undefined,
    blogId?: string | null | undefined,
    blogName?: string | null | undefined,
    createdAt?: string | null | undefined,
    extendedLikesInfo?: {
        likesCount: number,
        dislikesCount: number,
        newestLikes: {
            addedAt: string,
            userId: string,
            login: string
        }[]
    } | null | undefined
}[], accessToken: string | undefined) {
    if (accessToken) {
        const userId = await jwtService.getUserIdByAccessToken(accessToken)
        const user = await userModel.findById(userId)
        const postsWithStatus = []
        if(user) {
            for(let i = 0; i < value.length; i++){
                let myStatus = "None"

                if(!user) {
                    myStatus = "None"
                } else {

                }

                if(user!.likedPosts.includes(value[i]._id!.toString())) {
                    myStatus = "Like"
                }
                if(user!.dislikedPosts.includes(value[i]._id!.toString())) {
                    myStatus = "Dislike"
                }

                postsWithStatus.push({
                    id: value[i]._id!.toString(),
                    createdAt: value[i].createdAt || '',
                    title: value[i].title || '',
                    shortDescription: value[i].shortDescription || '',
                    content: value[i].content || '',
                    blogId: value[i].blogId || '',
                    blogName: value[i].blogName || '',
                    extendedLikesInfo: {
                        likesCount: value[i].extendedLikesInfo?.likesCount || 0,
                        dislikesCount: value[i].extendedLikesInfo?.dislikesCount || 0,
                        myStatus: myStatus,
                        newestLikes: value[i].extendedLikesInfo!.newestLikes.slice(0,3).map(like => {
                            return {
                                addedAt: like.addedAt,
                                login: like.login,
                                userId: like.userId
                            }
                        }) || []
                    }
                })
            }
            return postsWithStatus

        }

    }

    const postsWithStatusNone = []
    for(let i = 0; i < value.length; i++){
        const myStatus = "None"

        postsWithStatusNone.push({
            id: value[i]._id!.toString(),
            createdAt: value[i].createdAt || '',
            title: value[i].title || '',
            shortDescription: value[i].shortDescription || '',
            content: value[i].content || '',
            blogId: value[i].blogId || '',
            blogName: value[i].blogName || '',
            extendedLikesInfo: {
                likesCount: value[i].extendedLikesInfo?.likesCount || 0,
                dislikesCount: value[i].extendedLikesInfo?.dislikesCount || 0,
                myStatus: myStatus,
                newestLikes: value[i].extendedLikesInfo!.newestLikes.slice(0,3).map(like => {
                    return {
                        addedAt: like.addedAt,
                        login: like.login,
                        userId: like.userId
                    }
                }) || []
            }
        })
    }
    return postsWithStatusNone
}