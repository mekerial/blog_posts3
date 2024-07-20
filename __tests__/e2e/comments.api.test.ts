import request from "supertest";
import {app} from "../../src/settings";

import dotenv from "dotenv";
import {RouterPaths} from "../../src/routes/router-paths";
import mongoose from "mongoose";
import {dataTestBlogCreate01} from "../data-for-tests/blog-data-for-tests";
import {dataTestPostCreate01} from "../data-for-tests/post-data-for-tests";
import {userDataTest01} from "../data-for-tests/user-data-for-test";



dotenv.config()

const uri = process.env.MONGO_URI
if (!uri) {
    throw new Error(' ! uri error ! ')
}

const getRequest = () => {
    return request(app)
}

describe(RouterPaths.comments, () => {
    beforeAll(async () => {
        await mongoose.connect(uri)
        await getRequest()
            .delete(RouterPaths.testing)
            .expect(204)
    })
    beforeEach(async () => {
        await getRequest()
            .delete(RouterPaths.testing)
            .expect(204)
    })
    afterAll(async () => {
        await mongoose.disconnect()
    })

    it('should create comment', async () => {
        //creating blog -> post
        const createBlog = await getRequest()
            .post(RouterPaths.blogs)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(dataTestBlogCreate01)
            .expect(201)
        const id = createBlog.body.id
        const checkBlog = await getRequest()
            .get(RouterPaths.blogs + `/${id}`)
            .expect(200)

        expect(checkBlog.body).toStrictEqual({
            _id: id,
            name: 'create name',
            description: 'create description',
            websiteUrl: 'https://www.googlesodivjwvj_ef03feqQFF00sdf' +
                'jkKWFJekfkefkdFKSEKOFweQ',
            createdAt: createBlog.body.createdAt,
            isMembership: false
        })

        const createPost = await getRequest()
            .post(RouterPaths.posts)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({...dataTestPostCreate01, blogId: checkBlog.body._id})
            .expect(201)
        const checkPost = await getRequest()
            .get(RouterPaths.posts)
            .expect(200)

        expect(checkPost.body.items).toEqual([{id: createPost.body.id,
            ...dataTestPostCreate01,
            blogId: checkBlog.body._id,
            createdAt: createPost.body.createdAt,
            blogName: createPost.body.blogName
        }])
        //creating user
        const user = userDataTest01
        const createUser = await getRequest()
            .post(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(userDataTest01)
            .expect(201)
        const checkUser = await getRequest()
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(200)
        expect(checkUser.body.items[0]).toStrictEqual(createUser.body)

        //auth
        const authUser = await getRequest()
            .post('/auth/login/')
            .send({
                loginOrEmail: "love@gmail.com",
                password: "123123",
            })
            .expect(200)
        const accessToken = authUser.body.accessToken
        //const cookies = authUser.headers['set-cookie']

        //creating comment
        const createComment = await getRequest()
            .post(RouterPaths.posts + '/' +checkPost.body.id + '/' + RouterPaths.comments)
            .send({
                content: 'valid content!'
            })


    })
})