import {
    DBType,

} from "../models/db/db-types";
import {ObjectId} from "mongodb";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config()

const port = 3002;
export const db: DBType = {
    blogs: [],
    posts: [],
}

const uri = process.env.MONGO_URI // || 'mongodb://localhost:27017'

if (!uri) {
    throw new Error(' ! uri error ! ')
}


//const client = new MongoClient(uri)
//export const database = client.db('blogs-posts')

const blogSchema = new mongoose.Schema({
    name: String,
    description: String,
    websiteUrl: String,
    createdAt: String,
    isMembership: Boolean
})
const postSchema = new mongoose.Schema({
    title: String,
    shortDescription: String,
    content: String,
    blogId: String,
    blogName: String,
    createdAt: String
})
const commentSchema = new mongoose.Schema({
    title: String,
    shortDescription: String,
    content: String,
    blogId: String,
    blogName: String,
    createdAt: String
})

const refreshTokenSchema = new mongoose.Schema({
    userId: ObjectId,
    refreshToken: String
})

const sessionSchema = new mongoose.Schema({
        issuedAt: String,
        lastActiveDate: String,
        deviceId: String,
        ip: String,
        deviceName: String,
        userId: String,
        refreshToken: String
    }
)
const userSchema = new mongoose.Schema({
    accountData: {
        login: String,
        email: String,
        passwordHash: String,
        passwordSalt: String,
        createdAt: String
    },
    emailConfirmation: {
        confirmationCode: String,
        expirationDate: Date,
        isConfirmed: Boolean
    }
})
const RecoveryPasswordSchema = new mongoose.Schema({
    userId: String,
    recoveryCode: String,
    expirationDate: Date
})

export const blogModel = mongoose.model('blogs', blogSchema)
export const postModel = mongoose.model('posts', postSchema)
export const userModel = mongoose.model('users', userSchema)
export const commentModel = mongoose.model('comments', commentSchema)
export const refreshTokenModel = mongoose.model('refreshTokens', refreshTokenSchema)
export const sessionModel = mongoose.model('sessions', sessionSchema)
export const recoveryPasswordModel = mongoose.model('recoveryPasswords', RecoveryPasswordSchema)



//export const blogCollection = database.collection<BlogDBType>('blogs')
//export const postCollection = database.collection<PostDBType>('posts')
//export const userCollection = database.collection<UserDbType>('users')
//export const commentCollection = database.collection<CommentDbType>('comments')
//export const refreshTokenCollection = database.collection<refreshTokenDbType>('refreshTokens')
//export const sessionCollection = database.collection<sessionDbType>('sessions')



export const runDb = async () => {
    try {
        // await client.connect()
        await mongoose.connect(uri)
        console.log('Client connected to Db')
        console.log(`listen on port ${port}`)
    } catch (err) {
        console.log(`${err}`)
        //await client.close()
        await mongoose.disconnect()
    }
}