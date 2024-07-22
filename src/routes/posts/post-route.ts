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
import {OutputPostModel} from "../../models/posts/output";
import {ObjectId} from "mongodb";
import {CreateCommentModel, QueryCommentInputModel} from "../../models/comments/input";
import {CommentRepository} from "../../repositories/comment-repository";
import {loginMiddleWare} from "../../middlewares/auth/login-middleware";
import {commentValidation} from "../../validators/comment-validator";
import {jwtService} from "../../application/jwt-service";
import {UserRepository} from "../../repositories/user-repository";

class PostController {
    async getAllPosts(req: RequestWithQuery<QueryPostInputModel>, res: Response) {
        console.log('get on /posts')

        const sortData = {
            pageSize: req.query.pageSize,
            pageNumber: req.query.pageNumber,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
        }


        const posts = await PostRepository.getAllPosts(sortData)
        res.status(200).send(posts)
    }

    async getPostById(req: RequestWithParams<Params>, res: Response) {
        console.log('get on /posts/:id')

        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return;
        }

        const post = await PostRepository.getPostById(id)

        if (!post) {
            res.sendStatus(404)
            return;
        }

        res.status(200).send(post)
    }

    async createPost(req: RequestWithBody<CreatePostModel>, res: Response<OutputPostModel>) {
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

        res.status(201).send(createdPost)
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
                res.sendStatus(401)
                console.log('not found user by token')
                return
            }
            req.user = await UserRepository.getUserById(userId)
            if (!req.user) {
                console.log('user is null')
                res.sendStatus(404)
                return
            }
        }


        const comments = await CommentRepository.getCommentsByPostId(postId, sortData, accessToken!)

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
                likedCount: newComment?.likesInfo.likesCount,
                dislikedCount: newComment?.likesInfo.dislikesCount,
                myStatus: "None"
            }
        }

        if (!newComment) {
            res.sendStatus(404)
            return
        }
        res.status(201).send(newComment)
    }
}

const postController = new PostController()

export const postRoute = Router({})

postRoute.get('/', postController.getAllPosts)
postRoute.get('/:id', postController.getPostById)
postRoute.post('/', authMiddleware, postValidation(), postController.createPost)
postRoute.put('/:id', authMiddleware, postValidation(), postController.updatePostById)
postRoute.delete('/:id', authMiddleware, postController.deletePostById)

//comments
postRoute.get('/:id/comments', postController.getAllComments)
postRoute.post('/:id/comments', loginMiddleWare, commentValidation(), postController.createCommentToPost)