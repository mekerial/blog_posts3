import {Router, Response} from "express"
import {BlogRepository} from "../../repositories/blog-repository";
import {
    Params,
    RequestWithBody,
    RequestWithBodyAndParams,
    RequestWithParams,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../../common";
import {authMiddleware} from "../../middlewares/auth/auth-middleware";
import {blogValidation} from "../../validators/blog-validator";
import {
    CreateBlogModel,
    CreatePostBlogModel,
    QueryBlogInputModel,
    QueryPostByBlogIdInputModel
} from "../../models/blogs/input";
import {ObjectId} from "mongodb";
import {PostRepository} from "../../repositories/post-repository";
import {blogPostValidation} from "../../validators/blog-post-validator";
import {CreatePostModel} from "../../models/posts/input";
import {jwtService} from "../../application/jwt-service";
import mongoose from "mongoose";
import {UserRepository} from "../../repositories/user-repository";
import {userModel} from "../../db/db";

class BlogsController {
    async getAllBlogs(req: RequestWithQuery<QueryBlogInputModel>, res: Response) {
        console.log('get on /blogs')

        const sortData = {
            searchNameTerm: req.query.searchNameTerm,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize
        }
        const blogs = await BlogRepository.getAllBlogs(sortData)

        res.send(blogs)
    }

    async getBlogById(req: RequestWithParams<Params>, res: Response) {
        console.log('get on /blogs:id')

        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return;
        }

        const blog = await BlogRepository.getBlogById(id)

        if (!blog) {
            res.sendStatus(404)
            return;
        }

        res.send(blog)
    }

    async getPostsByBlog(req: RequestWithParamsAndQuery<Params, QueryPostByBlogIdInputModel>, res: Response) {
        console.log('get on /blogs/:id/posts')

        const id = req.params.id
        const accessToken = req.headers.authorization?.split(' ')[1]
        let user
        if(accessToken) {
            const userId = await jwtService.getUserIdByAccessToken(accessToken)

            if(!userId) {
                console.log('not found user by token')
            } else {
                const mUserId = new mongoose.Types.ObjectId(userId)
                req.user = await UserRepository.getUserById(userId)
                if(!req.user) {
                    console.log('user is null')
                }
                user = await userModel.findById(mUserId)
            }
        }

        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const blog = await BlogRepository.getBlogById(id)
        if (!blog) {
            res.sendStatus(404)
            return
        }

        const sortData = {
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize
        }

        const posts = await BlogRepository.getPostsByBlogId(id, sortData, accessToken)

        res.send(posts)
    }

    async createPostByBlog(req: RequestWithBodyAndParams<Params, CreatePostModel>, res: Response) {
        console.log('post on /blogs/:id/posts')

        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return;
        }

        const title = req.body.title
        const shortDescription = req.body.shortDescription
        const content = req.body.content


        const blog = await BlogRepository.getBlogById(id)

        if (!blog) {
            res.sendStatus(404)
            return
        }

        const newPost = {
            title,
            shortDescription,
            content,
        }

        const createdPost = await PostRepository.createPost({...newPost, blogId: id})

        const postWithStatus = {
            ...createdPost,
            extendedLikesInfo: {
                likesCount: createdPost?.extendedLikesInfo!.likesCount,
                dislikesCount: createdPost?.extendedLikesInfo!.dislikesCount,
                myStatus: "None",
                newestLikes: createdPost?.extendedLikesInfo.newestLikes
            }
        }

        res.status(201).send(postWithStatus)
    }

    async createBlog(req: RequestWithBody<CreateBlogModel>, res: Response) {
        console.log('post on /blogs')

        const name = req.body.name
        const description = req.body.description
        const websiteUrl = req.body.websiteUrl

        const newBlog: CreateBlogModel = {
            name,
            description,
            websiteUrl
        }

        const createdBlog = await BlogRepository.createBlog(newBlog)

        res.status(201).send(createdBlog)
    }

    async postPostByBlog(req: RequestWithBodyAndParams<{ id: string }, CreatePostBlogModel>, res: Response) {
        console.log('post on /blogs/:id/posts')

        const title = req.body.title
        const shortDescription = req.body.shortDescription
        const content = req.body.content
        const blogId = req.params.id

        const blog = await BlogRepository.getBlogById(blogId)
        if (!blog) {
            res.sendStatus(404)
            return
        }

        const createdPostId = await BlogRepository.createPostToBlog(blogId, {title, shortDescription, content})

        const post = await PostRepository.getPostById(createdPostId.toString())

        if (!post) {
            res.sendStatus(404)
            return
        }

        res.status(201).send(post)
    }

    async updateBlogById(req: RequestWithBodyAndParams<Params, any>, res: Response) {
        console.log('put /blogs/:id')

        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return;
        }

        const name = req.body.name
        const description = req.body.description
        const websiteUrl = req.body.websiteUrl

        const blog = await BlogRepository.getBlogById(id)

        if (!blog) {
            res.sendStatus(404)
            return
        }

        const isBlogUpdated = await BlogRepository.updateBlog(id, {name, description, websiteUrl})

        if (isBlogUpdated) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }

    async deleteBlogById(req: RequestWithParams<Params>, res: Response) {
        console.log('delete on /blogs/:id')

        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }

        const isDeletedBlog = await BlogRepository.deleteBlogById(id)

        if (isDeletedBlog) {
            res.sendStatus(204)
            return
        } else {
            res.sendStatus(404)
            return
        }
    }
}

const blogController = new BlogsController()

export const blogRoute = Router({})

blogRoute.get('/', blogController.getAllBlogs)
blogRoute.get('/:id', blogController.getBlogById)
blogRoute.get('/:id/posts', blogController.getPostsByBlog)
blogRoute.post('/:id/posts', authMiddleware, blogPostValidation(), blogController.createPostByBlog)
blogRoute.post('/', authMiddleware, blogValidation(), blogController.createBlog)
blogRoute.post('/:id/posts', authMiddleware, blogController.postPostByBlog)
blogRoute.put('/:id', authMiddleware, blogValidation(), blogController.updateBlogById)
blogRoute.delete('/:id', authMiddleware, blogController.deleteBlogById)