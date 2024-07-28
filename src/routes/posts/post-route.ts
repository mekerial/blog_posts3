import {Router, Response} from "express";
import {PostRepository} from "../../repositories/post-repository";
import {
    Params,
    RequestWithBody,
    RequestWithBodyAndParams,
    RequestWithParams,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../../common";
import {authMiddleware} from "../../middlewares/auth/auth-middleware";
import {postValidation} from "../../validators/post-validator";
import {CreatePostModel, QueryPostInputModel} from "../../models/posts/input";
import {ObjectId} from "mongodb";
import {CreateCommentModel, QueryCommentInputModel} from "../../models/comments/input";
import {CommentRepository} from "../../repositories/comment-repository";
import {loginMiddleWare} from "../../middlewares/auth/login-middleware";
import {commentValidation} from "../../validators/comment-validator";
import {jwtService} from "../../application/jwt-service";
import {UserRepository} from "../../repositories/user-repository";
import mongoose from "mongoose";
import {userModel} from "../../db/db";
import {likeStatusValidation} from "../../validators/likeStatus-validator";

class PostController {
    async getAllPosts(req: RequestWithQuery<QueryPostInputModel>, res: Response) {
        console.log('get on /posts')

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

        const sortData = {
            pageSize: req.query.pageSize,
            pageNumber: req.query.pageNumber,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
        }


        const posts = await PostRepository.getAllPosts(sortData, accessToken)
        res.status(200).send(posts)
    }

    async getPostById(req: RequestWithParams<Params>, res: Response) {
        console.log('get on /posts/:id')

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
            return;
        }

        const post = await PostRepository.getPostById(id)
        if (!post) {
            res.sendStatus(404)
            return;
        }

        const postWithMyStatus = {
            ...post,
            extendedLikesInfo: {
                likesCount: post.extendedLikesInfo.likesCount,
                dislikesCount: post.extendedLikesInfo.dislikesCount,
                myStatus: "None",
                newestLikes: post.extendedLikesInfo.newestLikes.slice(0,3)
            }
        }

        let myStatus = "None"
        if(user){
            const likedPosts = user.likedPosts
            const dislikedPosts = user.dislikedPosts

            if(likedPosts.includes(post.id.toString())) {
                myStatus = "Like"
            }
            if(dislikedPosts.includes(post.id.toString())) {
                myStatus = "Dislike"
            }
        } else {
            myStatus = "None"
        }
        const postWithStatus = {
            ...post,
            extendedLikesInfo: {
                likesCount: post.extendedLikesInfo.likesCount,
                dislikesCount: post.extendedLikesInfo.dislikesCount,
                myStatus: myStatus,
                newestLikes: post.extendedLikesInfo.newestLikes.slice(0,3).map(like => {
                    return {
                        addedAt: like.addedAt,
                        login: like.login,
                        userId: like.userId
                    };
                })
            }
        }

        res.status(200).send(postWithStatus)
    }

    async createPost(req: RequestWithBody<CreatePostModel>, res: Response) {
        console.log('post on /posts')

        const title = req.body.title
        const shortDescription = req.body.shortDescription
        const content = req.body.content
        const blogId = req.body.blogId

        const newPost: CreatePostModel = {
            title,
            shortDescription,
            content,
            blogId,
        }

        const createdPost = await PostRepository.createPost(newPost)

        if (!createdPost) {
            res.sendStatus(400)
        }
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

    async updatePostById(req: RequestWithBodyAndParams<Params, any>, res: Response) {
        console.log('put on /posts/:id')

        const id = req.params.id


        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return;
        }

        const title = req.body.title
        const shortDescription = req.body.shortDescription
        const content = req.body.content
        const blogId = req.body.blogId

        const post = await PostRepository.getPostById(id)

        if (!post) {
            res.sendStatus(404)
            return
        }
        const isPostUpdated = await PostRepository.updatePost(id, {title, shortDescription, content, blogId})

        if (isPostUpdated) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }

    async deletePostById(req: RequestWithParams<string>, res: Response) {
        console.log('delete on /posts/:id')

        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return;
        }

        const isDeletedPost = await PostRepository.deletePostById(id)

        if (isDeletedPost) {
            res.sendStatus(204)
            return
        } else {
            res.sendStatus(404)
            return
        }
    }

    async getAllComments(req: RequestWithParamsAndQuery<Params, QueryCommentInputModel>, res: Response) {
        console.log('get on /posts/:id/comments')

        const postId = req.params.id

        if (!ObjectId.isValid(postId)) {
            res.sendStatus(404)
            return
        }

        const post = await PostRepository.getPostById(postId)

        if (!post) {
            res.sendStatus(404)
            return
        }


        const sortData = {
            pageSize: req.query.pageSize,
            pageNumber: req.query.pageNumber,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
        }


        const accessToken = req.headers.authorization?.split(' ')[1]
        if(accessToken) {
            const userId = await jwtService.getUserIdByAccessToken(accessToken)
            if (!userId) {
                console.log('not found user by token')
            } else {
                req.user = await UserRepository.getUserById(userId)
                if (!req.user) {
                    console.log('user is null')
                }
            }

        }

        const comments = await CommentRepository.getCommentsByPostId(postId, sortData, accessToken)

        if (!comments) {
            res.sendStatus(404)
        }

        res.status(200).send(comments)
    }

    async createCommentToPost(req: RequestWithBodyAndParams<Params, CreateCommentModel>, res: Response) {
        console.log('post on /posts/:id/comments')

        const postId = req.params.id
        const content = req.body.content
        const user = req.user

        const newComment = await CommentRepository.createComment(postId, content, user!)
        const commentWithStatus = {
            ...newComment,
            likesInfo: {
                likesCount: newComment?.likesInfo.likesCount,
                dislikesCount: newComment?.likesInfo.dislikesCount,
                myStatus: "None"
            }
        }

        if (!newComment) {
            res.sendStatus(404)
            return
        }
        res.status(201).send(commentWithStatus)
    }

    async likePost(req: RequestWithBodyAndParams<{id: string}, {likeStatus: string}>, res: Response) {
        console.log('put request | posts/:id/like-status')
        const likeStatus = req.body.likeStatus
        const accessToken = req.headers.authorization!.split(' ')[1]
        const postId = req.params.id

        if (!ObjectId.isValid(postId)) {
            res.sendStatus(404)
            return
        }

        const post = await PostRepository.getPostById(postId)

        if (!post) {
            res.sendStatus(404)
            return
        }
        const statusPost = await PostRepository.likePost(postId, likeStatus, accessToken)
        if(!statusPost) {
            res.sendStatus(400)
            return
        }

        res.sendStatus(204)
        return
    }
}

const postController = new PostController()

export const postRoute = Router({})

postRoute.get('/', postController.getAllPosts)
postRoute.get('/:id', postController.getPostById)
postRoute.post('/', authMiddleware, postValidation(), postController.createPost)
postRoute.put('/:id', authMiddleware, postValidation(), postController.updatePostById)
postRoute.delete('/:id', authMiddleware, postController.deletePostById)
postRoute.put('/:id/like-status', loginMiddleWare, likeStatusValidation(), postController.likePost)

//comments
postRoute.get('/:id/comments', postController.getAllComments)
postRoute.post('/:id/comments', loginMiddleWare, commentValidation(), postController.createCommentToPost)