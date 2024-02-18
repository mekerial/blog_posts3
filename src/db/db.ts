import {BlogDBType, CommentDbType, DBType, PostDBType, UserDbType} from "../models/db/db-types";
import {MongoClient} from "mongodb";
import dotenv from "dotenv";

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
const client = new MongoClient(uri)

export const database = client.db('blogs-posts')

export const blogCollection = database.collection<BlogDBType>('blogs')
export const postCollection = database.collection<PostDBType>('posts')
export const userCollection = database.collection<UserDbType>('users')
export const commentCollection = database.collection<CommentDbType>('comments')


export const runDb = async () => {
    try {
        await client.connect()
        console.log('Client connected to Db')
        console.log(`listen on port ${port}`)
    } catch (err) {
        console.log(`${err}`)
        await client.close()
    }
}