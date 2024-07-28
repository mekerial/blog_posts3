import {blogModel, postModel, userModel} from "../db/db";
import {transformPostDB, transformPostDbWithMyStatus} from "../models/posts/mappers/mapper";
import {ObjectId} from "mongodb";
import {OutputPostModel} from "../models/posts/output";
import {CreatePostModel, QueryPostInputModel, UpdatePostModel} from "../models/posts/input";
import mongoose from 'mongoose';
import {jwtService} from "../application/jwt-service";


export class PostRepository {
    static async getAllPosts(sortData: QueryPostInputModel, accessToken: string | undefined) {
        const pageNumber = sortData.pageNumber ?? 1
        const pageSize = +(sortData.pageSize ?? 10)
        const sortBy = sortData.sortBy ?? 'createdAt'
        const sortDirection = sortData.sortDirection ?? 'desc'

        let posts = await postModel
            .find({})
            .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1 })
            .skip((+pageNumber - 1) * pageSize)
            .limit(+pageSize)

        let leanPosts = posts.map(function(model) { return model.toObject(); });


        const totalCount = await postModel.countDocuments({})

        const pagesCount = Math.ceil(totalCount / pageSize)
        // @ts-ignore
        const postsWithMyStatus = await transformPostDbWithMyStatus(leanPosts, accessToken)
        return {
            pagesCount,
            page: +pageNumber,
            pageSize: pageSize,
            totalCount,
            items: postsWithMyStatus
        }
    }

    static async getPostById(id: string) {
        const postId = new mongoose.Types.ObjectId(id);

        const post = await postModel.findById(postId)

        if (!post) {
            return false
        }

        return {
            id: post._id!.toString(),
            createdAt: post.createdAt,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            extendedLikesInfo: {
                likesCount: post.extendedLikesInfo?.likesCount,
                dislikesCount: post.extendedLikesInfo?.dislikesCount,
                newestLikes: post.extendedLikesInfo!.newestLikes.slice(0,3)
            }
        }
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
            createdAt: new Date().toISOString(),
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                newestLikes: []
            }
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

    static async likePost(postId: string, likeStatus: string, accessToken: string): Promise<boolean> {

        const post = await PostRepository.getPostById(postId)
        if (!post) {
            return false
        }

        const userId = await jwtService.getUserIdByAccessToken(accessToken)
        if (!userId) {
            console.log('not found user by token')
            return false
        }

        const mUserId = new mongoose.Types.ObjectId(userId.toString())

        const user = await userModel.findById(mUserId)
        if(!user) {
            return false
        }
        const newestLike = {
            userId: userId.toString(),
            login: user.accountData!.login!,
            addedAt: new Date().toISOString()
        }

        if (likeStatus === 'Like') {
            if (user!.likedPosts.includes(postId)) {
                return true
            } else {
                if (user!.dislikedPosts.includes(postId)) {
                    post.extendedLikesInfo!.dislikesCount!--

                    user!.dislikedPosts = user!.dislikedPosts.filter(i => i !== postId)
                    await userModel.updateOne({_id: userId}, {$set: {'dislikedPosts': user!.dislikedPosts}})
                    await postModel.updateOne({_id: postId}, {$set: {'extendedLikesInfo.dislikesCount': post.extendedLikesInfo!.dislikesCount}})
                }
                // @ts-ignore
                post!.extendedLikesInfo!.newestLikes.unshift(newestLike)

                post.extendedLikesInfo!.likesCount!++
                user!.likedPosts.push(postId)
                await userModel.updateOne({_id: userId}, {$set: {'likedPosts': user!.likedPosts}})
                await postModel.updateOne({_id: postId}, {$set: {'extendedLikesInfo.likesCount': post.extendedLikesInfo!.likesCount,
                                                                'extendedLikesInfo.newestLikes': post.extendedLikesInfo.newestLikes}})
                return true
            }
        }
        if (likeStatus === 'Dislike') {
            if (user!.dislikedPosts.includes(postId)) {
                return true
            }
            if (user!.likedPosts.includes(postId)) {
                post.extendedLikesInfo!.likesCount!--
                post!.extendedLikesInfo!.newestLikes = post!.extendedLikesInfo!.newestLikes.filter(i => i.userId!.toString() !== userId.toString())
                user!.likedPosts = user!.likedPosts.filter(i => i !== postId)
                await userModel.updateOne({_id: userId}, {$set: {'likedPosts': user!.likedPosts}})
                await postModel.updateOne({_id: postId}, {$set: {'extendedLikesInfo.likesCount': post.extendedLikesInfo!.likesCount,
                                                                'extendedLikesInfo.newestLikes': post.extendedLikesInfo!.newestLikes}})
            }
            post.extendedLikesInfo!.dislikesCount!++
            user!.dislikedPosts.push(postId)
            await userModel.updateOne({_id: userId}, {$set: {'dislikedPosts': user!.dislikedPosts}})
            await postModel.updateOne({_id: postId}, {$set: {'extendedLikesInfo.dislikesCount': post.extendedLikesInfo!.dislikesCount}})
            return true
        }

        if (likeStatus === 'None') {
            if (user!.dislikedPosts.includes(postId)) {
                post.extendedLikesInfo!.dislikesCount!--
                post.extendedLikesInfo!.newestLikes = post.extendedLikesInfo!.newestLikes.filter(i => i.userId!.toString() !== userId.toString())
                user!.dislikedPosts = user!.dislikedPosts.filter(i => i !== postId)

                await userModel.updateOne({_id: userId}, {$set: {'dislikedPosts': user!.dislikedPosts}})
                await postModel.updateOne({_id: postId}, {$set: {'extendedLikesInfo.dislikesCount': post.extendedLikesInfo!.dislikesCount,
                                                                'extendedLikesInfo.newestLikes': post.extendedLikesInfo!.newestLikes}})
            }
            if (user!.likedPosts.includes(postId)) {
                post.extendedLikesInfo!.likesCount!--
                post!.extendedLikesInfo!.newestLikes = post!.extendedLikesInfo!.newestLikes.filter(i => i.userId!.toString() !== userId.toString())
                user!.likedPosts = user!.likedPosts.filter(i => i !== postId)
                await userModel.updateOne({_id: userId}, {$set: {'likedPosts': user!.likedPosts}})
                await postModel.updateOne({_id: postId}, {$set: {'extendedLikesInfo.likesCount': post.extendedLikesInfo!.likesCount,
                                                                   'extendedLikesInfo.newestLikes': post.extendedLikesInfo!.newestLikes}})
                return true
            }
            return true
        }
        return true
    }
}