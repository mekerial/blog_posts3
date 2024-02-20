import {blogCollection, postCollection} from "../db/db";
import {postMapper} from "../models/posts/mappers/mapper";
import {ObjectId} from "mongodb";
import {OutputPostModel} from "../models/posts/output";
import {CreatePostModel, QueryPostInputModel, UpdatePostModel} from "../models/posts/input";


export class PostRepository {
    static async getAllPosts(sortData: QueryPostInputModel) {
        const pageNumber = sortData.pageNumber ?? 1
        const pageSize = +(sortData.pageSize ?? 10)
        const sortBy = sortData.sortBy ?? 'createdAt'
        const sortDirection = sortData.sortDirection ?? 'desc'

        const posts = await postCollection
            .find({})
            .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1 })
            .skip((+pageNumber - 1) * pageSize)
            .limit(+pageSize)
            .toArray()

        const totalCount = await postCollection.countDocuments({})

        const pagesCount = Math.ceil(totalCount / pageSize)

        return {
            pagesCount,
            page: +pageNumber,
            pageSize: pageSize,
            totalCount,
            items: posts.map(postMapper)
        }
    }

    static async getPostById(id: string) {
        const post = await postCollection.findOne({_id: new ObjectId(id)})
        if (!post) {
            return false
        }
        return postMapper(post)
    }

    static async createPost(createdData: CreatePostModel): Promise<OutputPostModel | undefined>  {
        const blog = await blogCollection.findOne({_id: new ObjectId(createdData.blogId)})

        const post = {
            ...createdData,
            blogName: blog!.name,
            createdAt: new Date().toISOString()
        }

        const newPost = await postCollection.insertOne({...post})

        return postMapper({...post, _id: newPost.insertedId})
    }
    static async updatePost(id: string, updatedData: UpdatePostModel): Promise<boolean> {
        const post = await postCollection.updateOne({_id: new ObjectId(id)}, {
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

        const post = await postCollection.deleteOne({_id: new ObjectId(id)})

        return !!post.deletedCount;
    }
}