import {OutputCommentModel} from "../output";
import {ObjectId, WithId} from "mongodb";
import {CommentDbType} from "../../db/db-types";
import {FlattenMaps} from "mongoose";
import {jwtService} from "../../../application/jwt-service";
import {userModel} from "../../../db/db";

export const commentMapper = (commentDB: WithId<CommentDbType>): OutputCommentModel => {
    return {
        content: commentDB.content,
        commentatorInfo: commentDB.commentatorInfo,
        createdAt: commentDB.createdAt,
        id: commentDB._id,
        likesInfo: commentDB.likesInfo
    }
}





export function transformCommentDB(value: FlattenMaps<{
    createdAt?: string | null | undefined;
    content?: string | null | undefined;
    commentatorInfo?: {
        userId?: string | null | undefined,
        userLogin?: string | null | undefined,
    } | null | undefined,
    likesInfo?: {
        likesCount?: number | null | undefined,
        dislikesCount?: number | null | undefined
    } | null | undefined;
}> &
    { _id: ObjectId }): OutputCommentModel {

    return {
        id: value._id,
        commentatorInfo: {
            userId: value.commentatorInfo?.userId || '',
            userLogin: value.commentatorInfo?.userLogin || '',
        },
        createdAt: value.createdAt || '',
        content: value.content || '',
        likesInfo: {
            likesCount: value.likesInfo?.likesCount || 0,
            dislikesCount: value.likesInfo?.dislikesCount || 0
        }
    };
}

export async function transformCommentDbWithMyStatus(value: {
    id: ObjectId,
    createdAt: string;
    content: string;
    commentatorInfo: {
        userId: string,
        userLogin: string,
    },
    likesInfo: {
        likesCount: number,
        dislikesCount: number
    };
}[], accessToken: string | undefined) {

    if(accessToken) {
        const userId = await jwtService.getUserIdByAccessToken(accessToken)
        const user = await userModel.findById(userId)
        const commentsWithStatus = []
        for(let i = 0; i < value.length; i++){
            let myStatus = "None"

            if(!user) {
                myStatus = "None"
            } else {

            }

            if(user!.likedComments.includes(value[i].id.toString())) {
                myStatus = "Like"
            }
            if(user!.dislikedComments.includes(value[i].id.toString())) {
                myStatus = "Dislike"
            }

            commentsWithStatus.push({
                id: value[i].id,
                commentatorInfo: {
                    userId: value[i].commentatorInfo?.userId || '',
                    userLogin: value[i].commentatorInfo?.userLogin || '',
                },
                createdAt: value[i].createdAt || '',
                content: value[i].content || '',
                likesInfo: {
                    likesCount: value[i].likesInfo?.likesCount || 0,
                    dislikesCount: value[i].likesInfo?.dislikesCount || 0,
                    myStatus: myStatus
                }
            })
        }
        return commentsWithStatus
    }


    const commentsWithStatusNone = []
    for(let i = 0; i < value.length; i++){
        const myStatus = "None"

        commentsWithStatusNone.push({
            id: value[i].id,
            commentatorInfo: {
                userId: value[i].commentatorInfo?.userId || '',
                userLogin: value[i].commentatorInfo?.userLogin || '',
            },
            createdAt: value[i].createdAt || '',
            content: value[i].content || '',
            likesInfo: {
                likesCount: value[i].likesInfo?.likesCount || 0,
                dislikesCount: value[i].likesInfo?.dislikesCount || 0,
                myStatus: myStatus
            }
        })
    }
    return commentsWithStatusNone
}