import {commentModel, postModel} from "../db/db";
import {transformCommentDB} from "../models/comments/mappers/mapper";
import {CreateCommentModel, QueryCommentInputModel} from "../models/comments/input";
import {ObjectId} from "mongodb";
import {OutputUserModel} from "../models/users/output";
import {OutputCommentModel} from "../models/comments/output";
import {PostRepository} from "./post-repository";


export class CommentRepository {
    static async getCommentsByPostId(postId: string, sortData: QueryCommentInputModel) {

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
            .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1 })
            .skip((+pageNumber - 1) * pageSize)
            .limit(+pageSize)
            .lean()

        const allComments = await commentModel
            .find({postId: postId})
            .lean()
        const totalCount = allComments.length

        const pagesCount = Math.ceil(totalCount / pageSize)

        return {
            pagesCount,
            page: +pageNumber,
            pageSize: pageSize,
            totalCount,
            items: comments
        }

    }
    static async createComment(postId: string, content: string, user: OutputUserModel) {
        const post = await postModel.findOne({_id: new ObjectId(postId)})
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
        const newComment = await commentModel.insertMany([{...comment, postId: postId}])

        const insertedComment = newComment[0];
        const insertedId = insertedComment._id;

        return {
            ...comment,
            id: insertedId
        }
    }
    static async getCommentById(id: string): Promise<OutputCommentModel | null> {
        const comment = await commentModel.find({_id: new ObjectId(id)}).lean()

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
}