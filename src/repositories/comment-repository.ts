import {commentCollection, postCollection} from "../db/db";
import {commentMapper} from "../models/comments/mappers/mapper";
import {CreateCommentModel, QueryCommentInputModel} from "../models/comments/input";
import {ObjectId} from "mongodb";
import {OutputUserModel} from "../models/users/output";
import {OutputCommentModel} from "../models/comments/output";


export class CommentRepository {
    static async getCommentsByPostId(postId: string, sortData: QueryCommentInputModel) {

        const pageNumber = sortData.pageNumber ?? 1
        const pageSize = +(sortData.pageSize ?? 10)
        const sortBy = sortData.sortBy ?? 'createdAt'
        const sortDirection = sortData.sortDirection ?? 'desc'

        const comments = await commentCollection
            .find({postId: postId})
            .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1 })
            .skip((+pageNumber - 1) * pageSize)
            .limit(+pageSize)
            .toArray()

        const allComments = await commentCollection
            .find({postId: postId})
            .toArray()
        const totalCount = allComments.length

        const pagesCount = Math.ceil(totalCount / pageSize)

        return {
            pagesCount,
            page: +pageNumber,
            pageSize: pageSize,
            totalCount,
            items: comments.map(commentMapper)
        }

    }
    static async createComment(postId: string, content: string, user: OutputUserModel) {
        const post = await postCollection.findOne({_id: new ObjectId(postId)})
        if (!post){
            return null
        }
        const comment = {
            content: content,
            commentatorInfo: {
                userId: user.id,
                userLogin: user.login
            },
            createdAt: new Date().toISOString()
        }
        const newComment = await commentCollection.insertOne({...comment, postId: postId})

        return {
            ...comment,
            id: newComment.insertedId
        }
    }
    static async getCommentById(id: string): Promise<OutputCommentModel | null> {
        const comment = await commentCollection.findOne({_id: new ObjectId(id)})

        if (!comment) {
            return null
        }

        return commentMapper(comment)
    }
    static async updateComment(id: string, updateData: CreateCommentModel) {
        const comment = await commentCollection.updateOne({_id: new ObjectId(id)}, {
            $set: {
                content: updateData.content
            }
        })

        return !!comment.matchedCount
    }
    static async deleteComment(id: string): Promise<boolean> {
        const comment = await commentCollection.deleteOne({_id: new ObjectId(id)})

        return !!comment.deletedCount
    }
}