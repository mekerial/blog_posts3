import {blogCollection, postCollection} from "../db/db";
import {OutputBlogModel} from "../models/blogs/output";
import {blogMapper} from "../models/blogs/mappers/mapper";
import {ObjectId} from "mongodb";
import {
    CreateBlogModel,
    CreatePostBlogModel,
    QueryBlogInputModel,
    QueryPostByBlogIdInputModel,
    UpdateBlogModel
} from "../models/blogs/input";
import {postMapper} from "../models/posts/mappers/mapper";


export class BlogRepository {
    static async getAllBlogs(sortData: QueryBlogInputModel) {
        const searchNameTerm = sortData.searchNameTerm ?? null
        const sortBy = sortData.sortBy ?? 'createdAt'
        const sortDirection = sortData.sortDirection ?? 'desc'
        const pageNumber = sortData.pageNumber ?? 1
        const pageSize = sortData.pageSize ?? 10

        let filter = {}

        if (searchNameTerm) {
            filter = {
                name: {
                    $regex: searchNameTerm, $options: 'i'
                }
            }
        }

        const blogs = await blogCollection
            .find(filter)
            .sort({ [sortBy]: sortDirection === 'desc' ? -1 : 1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(+pageSize)
            .toArray()

        const totalCount = await blogCollection.countDocuments(filter)

        const pagesCount = Math.ceil(totalCount / +pageSize)

        return {pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount,
            items: blogs.map(blogMapper)
        }
    }
    static async getPostsByBlogId(blogId: string, sortData: QueryPostByBlogIdInputModel) {
        const sortBy = sortData.sortBy ?? 'createdAt'
        const sortDirection = sortData.sortDirection ?? 'desc'
        const pageNumber = sortData.pageNumber ?? 1
        const pageSize = sortData.pageSize ?? 10

        const posts = await postCollection
            .find({blogId: blogId})
            .sort({ [sortBy]: sortDirection === 'desc' ? -1 : 1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(+pageSize)
            .toArray()

        const totalCount = await postCollection
            .countDocuments({blogId: blogId})

        const pagesCount = Math.ceil(totalCount / +pageSize)

        return {pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount,
            items: posts.map(postMapper)
        }
    }
    static async createPostToBlog(blogId: string, postData: CreatePostBlogModel) {
        const blog = await this.getBlogById(blogId)

        const post = {
            title: postData.title,
            shortDescription: postData.shortDescription,
            content: postData.content,
            blogId: blogId,
            blogName: blog!.name,
            createdAt: (new Date).toISOString()
        }

        const res = await postCollection.insertOne(post)

        return res.insertedId
    }
    static async getBlogById(id: string): Promise<OutputBlogModel | null> {
        const blog = await blogCollection.findOne({_id: new ObjectId(id)})
        if (!blog) {
            return null
        }
        return blogMapper(blog)
    }
    static async createBlog(createdData: CreateBlogModel): Promise<OutputBlogModel> {

        const blog = {
            ...createdData,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        const newBlog = await blogCollection.insertOne({...blog})

        return blogMapper({...blog, _id: newBlog.insertedId})
    }
    static async updateBlog(id: string, updatedData: UpdateBlogModel): Promise<boolean> {
        const blog = await blogCollection.updateOne({_id: new ObjectId(id)}, {
            $set: {
                name: updatedData.name,
                description: updatedData.description,
                websiteUrl: updatedData.websiteUrl
        }})

        return !!blog.matchedCount;
    }
    static async deleteBlogById(id: string): Promise<boolean | null> {
        const blog = await blogCollection.deleteOne({_id: new ObjectId(id)})

        return !!blog.deletedCount
    }
}