import {postModel} from "../db/db";
import {transformPostDB} from "../models/posts/mappers/mapper";
import {ObjectId} from "mongodb";
import {OutputPostModel} from "../models/posts/output";
import {CreatePostModel, QueryPostInputModel, UpdatePostModel} from "../models/posts/input";


export class PostRepository {
    static async getAllPosts(sortData: QueryPostInputModel) {
        const pageNumber = sortData.pageNumber ?? 1
        const pageSize = +(sortData.pageSize ?? 10)
        const sortBy = sortData.sortBy ?? 'createdAt'
        const sortDirection = sortData.sortDirection ?? 'desc'

        const posts = await postModel
            .find({})
            .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1 })
            .skip((+pageNumber - 1) * pageSize)
            .limit(+pageSize)
            .lean()

        const totalCount = await postModel.countDocuments({})

        const pagesCount = Math.ceil(totalCount / pageSize)

        return {
            pagesCount,
            page: +pageNumber,
            pageSize: pageSize,
            totalCount,
            items: posts.map(transformPostDB)
        }
    }

    static async getPostById(id: string) {
        const post = await postModel.findOne({_id: new ObjectId(id)})
        if (!post) {
            return false
        }
        return transformPostDB(post)
    }

    static async createPost(createdData: CreatePostModel): Promise<OutputPostModel | undefined> {
        const findBlog = await postModel.findOne({_id: new ObjectId(createdData.blogId)});
        if (!findBlog) {
            return undefined
        }
        const blog = findBlog.toObject()

        const post = {
            ...createdData,
            blogName: blog!.blogName,
            createdAt: new Date().toISOString()
        }

        const newPost = await postModel.insertMany([{...post}])

        const insertedPost = newPost[0];
        const insertedId = insertedPost._id;

        return transformPostDB({...post, _id: insertedId})
    }
    static async updatePost(id: string, updatedData: UpdatePostModel): Promise<boolean> {
        const post = await postModel.updateOne({_id: new ObjectId(id)}, {
            $set: {
                title: updatedData.title,
                shortDescription: updatedData.shortDescription,
                content: updatedData.content,
                blogId: updatedData.blogId,
            }
        })

        return !!post.matchedCount;
    }

    static async deletePostById(id: string): Promise<boolean | null> {

        const post = await postModel.deleteOne({_id: new ObjectId(id)})

        return !!post.deletedCount;
    }
}