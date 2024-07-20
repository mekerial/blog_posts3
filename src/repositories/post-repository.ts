import {blogModel, postModel} from "../db/db";
import {transformPostDB} from "../models/posts/mappers/mapper";
import {ObjectId} from "mongodb";
import {OutputPostModel} from "../models/posts/output";
import {CreatePostModel, QueryPostInputModel, UpdatePostModel} from "../models/posts/input";
import mongoose from 'mongoose';


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
        const postId = new mongoose.Types.ObjectId(id);
        const post = await postModel.find({_id: postId}).lean()
        if (!post[0]) {
            return false
        }
        return transformPostDB(post[0])
    }

    static async createPost(createdData: CreatePostModel): Promise<OutputPostModel | undefined> {
        const blogId = new mongoose.Types.ObjectId(createdData.blogId)



        const findBlog = await blogModel.findById(blogId)
        if (!findBlog) {
            return undefined
        }
        const blog = findBlog

        const post = {
            ...createdData,
            blogName: blog!.name,
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