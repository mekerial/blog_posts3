import {commentModel, postModel, userModel} from "../db/db";
import {transformCommentDB, transformCommentDbWithMyStatus} from "../models/comments/mappers/mapper";
import {CreateCommentModel, QueryCommentInputModel} from "../models/comments/input";
import {ObjectId} from "mongodb";
import {OutputUserModel} from "../models/users/output";
import {OutputCommentModel} from "../models/comments/output";
import {PostRepository} from "./post-repository";

import {jwtService} from "../application/jwt-service";
import mongoose from "mongoose";


export class CommentRepository {
    static async getCommentsByPostId(postId: string, sortData: QueryCommentInputModel, accessToken: string | undefined) {

        const post = await PostRepository.getPostById(postId)

        if (!post) {
            return null
        }


        const pageNumber = sortData.pageNumber ?? 1
        const pageSize = +(sortData.pageSize ?? 10)
        const sortBy = sortData.sortBy ?? 'createdAt'
        const sortDirection = sortData.sortDirection ?? 'desc'

        const comments = await commentModel
            .find({postId: postId})
            .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1})
            .skip((+pageNumber - 1) * pageSize)
            .limit(+pageSize)
            .lean()

        const allComments = await commentModel
            .find({postId: postId})
            .lean()
        const totalCount = allComments.length

        const pagesCount = Math.ceil(totalCount / pageSize)
        let commentsWithStatus = comments.map(transformCommentDB)
        const commentsWithMyStatus = await transformCommentDbWithMyStatus(commentsWithStatus, accessToken)

        return {
            pagesCount,
            page: +pageNumber,
            pageSize: pageSize,
            totalCount,
            items: commentsWithMyStatus
        }

    }

    static async createComment(postId: string, content: string, user: OutputUserModel) {
        const mPostId = new mongoose.Types.ObjectId(postId)
        const post = await postModel.findOne({_id: mPostId})
        if (!post) {
            return null
        }
        const comment = {
            content: content,
            commentatorInfo: {
                userId: user.id,
                userLogin: user.login
            },
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0
            }
        }
        const newComment = await commentModel.insertMany([{...comment, postId: postId}])

        const insertedComment = newComment[0];
        const insertedId = insertedComment._id;

        return {
            ...comment,
            id: insertedId,
        }
    }

    static async getCommentById(id: string): Promise<OutputCommentModel | null> {
        const commentId = new mongoose.Types.ObjectId(id)
        const comment = await commentModel.find({_id: commentId}).lean()

        if (!comment[0]) {
            return null
        }

        return transformCommentDB(comment[0])
    }

    static async updateComment(id: string, updateData: CreateCommentModel) {
        const comment = await commentModel.updateOne({_id: new ObjectId(id)}, {
            $set: {
                content: updateData.content
            }
        })

        return !!comment.matchedCount
    }

    static async deleteComment(id: string): Promise<boolean> {
        const comment = await commentModel.deleteOne({_id: new ObjectId(id)})

        return !!comment.deletedCount
    }

    static async likeComment(commentId: string, likeStatus: string, accessToken: string): Promise<boolean> {

        const comment = await CommentRepository.getCommentById(commentId)

        if (!comment) {
            return false
        }
        const userId = await jwtService.getUserIdByAccessToken(accessToken)
        if (!userId) {
            console.log('not found user by token')
            return false
        }

        const mUserId = new mongoose.Types.ObjectId(userId.toString())

        const user = await userModel.findById(mUserId)

        if (likeStatus === 'Like') {
            if (user!.likedComments.includes(commentId)) {
                //comment.likesInfo.likesCount--
                //user!.likedComments = user!.likedComments.filter(i => i !== commentId)
                //await userModel.updateOne({_id: userId}, {$set: {'likedComments': user!.likedComments}})
                //await commentModel.updateOne({_id: commentId}, {$set: {'likesInfo.likesCount': comment.likesInfo.likesCount}})

                return true
            } else {
                if (user!.dislikedComments.includes(commentId)) {
                    comment.likesInfo.dislikesCount--
                    user!.dislikedComments = user!.dislikedComments.filter(i => i !== commentId)
                    await userModel.updateOne({_id: userId}, {$set: {'dislikedComments': user!.dislikedComments}})
                    await commentModel.updateOne({_id: commentId}, {$set: {'likesInfo.dislikesCount': comment.likesInfo.dislikesCount}})

                }
                comment.likesInfo.likesCount++
                user!.likedComments.push(commentId)
                await userModel.updateOne({_id: userId}, {$set: {'likedComments': user!.likedComments}})
                await commentModel.updateOne({_id: commentId}, {$set: {'likesInfo.likesCount': comment.likesInfo.likesCount}})
                return true
            }

        }
        if (likeStatus === 'Dislike') {
            if (user!.dislikedComments.includes(commentId)) {
                //comment.likesInfo.dislikesCount--
                //user!.dislikedComments = user!.dislikedComments.filter(i => i !== commentId)
                //await userModel.updateOne({_id: userId}, {$set: {'dislikedComments': user!.dislikedComments}})
                //await commentModel.updateOne({_id: commentId}, {$set: {'likesInfo.dislikesCount': comment.likesInfo.dislikesCount}})
                return true
            }
            if (user!.likedComments.includes(commentId)) {
                comment.likesInfo.likesCount--
                user!.likedComments = user!.likedComments.filter(i => i !== commentId)
                await userModel.updateOne({_id: userId}, {$set: {'likedComments': user!.likedComments}})
                await commentModel.updateOne({_id: commentId}, {$set: {'likesInfo.likesCount': comment.likesInfo.likesCount}})
            }
            comment.likesInfo.dislikesCount++
            user!.dislikedComments.push(commentId)
            await userModel.updateOne({_id: userId}, {$set: {'dislikedComments': user!.dislikedComments}})
            await commentModel.updateOne({_id: commentId}, {$set: {'likesInfo.dislikesCount': comment.likesInfo.dislikesCount}})
            return true
        }

        if (likeStatus === 'None') {
            if (user!.dislikedComments.includes(commentId)) {
                comment.likesInfo.dislikesCount--
                user!.dislikedComments = user!.dislikedComments.filter(i => i !== commentId)
                await userModel.updateOne({_id: userId}, {$set: {'dislikedComments': user!.dislikedComments}})
                await commentModel.updateOne({_id: commentId}, {$set: {'likesInfo.dislikesCount': comment.likesInfo.dislikesCount}})
            }
            if (user!.likedComments.includes(commentId)) {
                comment.likesInfo.likesCount--
                user!.likedComments = user!.likedComments.filter(i => i !== commentId)
                await userModel.updateOne({_id: userId}, {$set: {'likedComments': user!.likedComments}})
                await commentModel.updateOne({_id: commentId}, {$set: {'likesInfo.likesCount': comment.likesInfo.likesCount}})
                return true

            }
            return true
        }
        return true
    }
}