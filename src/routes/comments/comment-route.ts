import {Router, Response} from "express";
import {Params, RequestWithBodyAndParams, RequestWithParams} from "../../common";
import {ObjectId} from "mongodb";
import {CommentRepository} from "../../repositories/comment-repository";
import {CreateCommentModel} from "../../models/comments/input";
import {loginMiddleWare} from "../../middlewares/auth/login-middleware";
import {commentValidation} from "../../validators/comment-validator";
import {jwtService} from "../../application/jwt-service";
import {userModel} from "../../db/db";
import {UserRepository} from "../../repositories/user-repository";
import mongoose from "mongoose";

class CommentController {
    async getCommentById(req: RequestWithParams<Params>, res: Response) {
        console.log('get request | comments/:id')

        const id = req.params.id
        const accessToken = req.headers.authorization?.split(' ')[1]
        let user
        if(accessToken) {
            const userId = await jwtService.getUserIdByAccessToken(accessToken)

            if(!userId) {
                res.sendStatus(401)
                console.log('not found user by token')
                return
            }
            const mUserId = new mongoose.Types.ObjectId(userId)

            req.user = await UserRepository.getUserById(userId)
            if(!req.user) {
                console.log('user is null')
                res.sendStatus(404)
                return
            }
            user = await userModel.findById(mUserId)
        }

        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const comment = await CommentRepository.getCommentById(id)
        if (!comment) {
            res.sendStatus(404)
            return
        }

        let myStatus = "None"
        if(user){
            const likedComments = user.likedComments
            const dislikedComments = user.dislikedComments

            if(likedComments.includes(comment.id.toString())) {
                myStatus = "Like"
            }
            if(dislikedComments.includes(comment.id.toString())) {
                myStatus = "Dislike"
            }
        } else {
            myStatus = "None"
        }

        const commentWithStatus = {
            ...comment,
            likesInfo: {
                likedCount: comment?.likesInfo.likesCount,
                dislikedCount: comment?.likesInfo.dislikesCount,
                myStatus: myStatus
            }
        }

        if (!comment) {
            res.sendStatus(404)
            return
        }

        res.send(commentWithStatus)
    }
    async editCommentById(req: RequestWithBodyAndParams<Params, CreateCommentModel>, res: Response) {
        console.log('put request | comments/:id')

        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const userId = req.user!.id
        const usersCommentId = await CommentRepository.getCommentById(id)
        if (!usersCommentId) {
            res.sendStatus(404)
            return
        }

        if (userId.toString() != usersCommentId!.commentatorInfo.userId) {
            res.sendStatus(403)
            return
        }

        const updateData = req.body

        const isCommentUpdated = await CommentRepository.updateComment(id, updateData)

        if (isCommentUpdated) {
            res.sendStatus(204)
            return
        } else {
            res.sendStatus(404)
            return
        }
    }
    async deleteCommentById(req: RequestWithParams<Params>, res: Response) {
        console.log('del request | comments/:id')
        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }

        const userId = req.user!.id
        if (!userId) {
            res.sendStatus(404)
            return
        }

        const userComment = await CommentRepository.getCommentById(id)
        if (!userComment) {
            res.sendStatus(404)
            return
        }

        if (userId.toString() != userComment.commentatorInfo.userId) {
            res.sendStatus(403)
            return
        }

        const isDeletedComment = await CommentRepository.deleteComment(id)

        if (isDeletedComment) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }
    async likeComment(req: RequestWithBodyAndParams<{id: string}, {likeStatus: string}>, res: Response) {
        console.log('put request | comments/:id/like-status')
        const likeStatus = req.body.likeStatus
        const accessToken = req.headers.authorization!.split(' ')[1]
        const commentId = req.params.id

        if (!ObjectId.isValid(commentId)) {
            res.sendStatus(404)
            return
        }

        const comment = await CommentRepository.getCommentById(commentId)

        if (!comment) {
            res.sendStatus(404)
            return
        }

        await CommentRepository.likeComment(commentId, likeStatus, accessToken)

        res.sendStatus(204)
    }
}

const commentController = new CommentController()
export const commentRoute = Router({})

commentRoute.get('/:id', commentController.getCommentById)
commentRoute.put('/:id', loginMiddleWare, commentValidation(), commentController.editCommentById)
commentRoute.delete('/:id', loginMiddleWare, commentController.deleteCommentById)
commentRoute.put('/:id/like-status', loginMiddleWare, commentController.likeComment)