import request from "supertest";
import {app} from "../../src/settings";
import {RouterPaths} from "../../src/routes/router-paths";
import {
    userDataTest01,
    userDataTest02,
    userDataTest03,
    userDataTest04, userDataTest05,
    userPaginationView
} from "../data-for-tests/user-data-for-test";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config()

const uri = process.env.MONGO_URI
if (!uri) {
    throw new Error(' ! uri error ! ')
}

const getRequest = () => {
    return request(app)
}

describe(RouterPaths.users, () => {
    beforeAll(async () => {
        await mongoose.connect(uri)
        await getRequest()
            .delete(RouterPaths.testing)
            .expect(204)
    })
    beforeEach(async () => {
        await getRequest().delete(RouterPaths.testing)
    })
    afterAll(async () => {
        await mongoose.disconnect()
    })


    it('post -> get, should return paginationView', async () => {
        const createResponse = await getRequest()
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(200)

        expect(createResponse.body).toEqual(userPaginationView)
    })
    it('should create new user', async () => {
        const createUser = await getRequest()
            .post(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(userDataTest01)
            .expect(201)
        const createResponse = await getRequest()
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(200)
        expect(createResponse.body.items[0]).toStrictEqual(createUser.body)
    })
    it(`shouldn't create user with empty login`, async () => {
        await getRequest()
            .post(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(userDataTest02)
            .expect(400)
        const createResponse = await getRequest()
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(200)
        expect(createResponse.body.items).toStrictEqual([])
    })
    it(`shouldn't create user with long login`, async () => {
        await getRequest()
            .post(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(userDataTest03)
            .expect(400)
        const createResponse = await getRequest()
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(200)
        expect(createResponse.body.items).toStrictEqual([])
    })
    it(`shouldn't create user with empty email`, async () => {
        await getRequest()
            .post(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({...userDataTest01, email: ''})
            .expect(400)
        const createResponse = await getRequest()
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(200)
        expect(createResponse.body.items).toStrictEqual([])
    })
    it(`shouldn't create user with long email`, async () => {
        await getRequest()
            .post(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(userDataTest04)
            .expect(400)
        const createResponse = await getRequest()
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(200)
        expect(createResponse.body.items).toStrictEqual([])
    })
    it(`shouldn't create user with empty password`, async () => {
        await getRequest()
            .post(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({...userDataTest01, password: ''})
            .expect(400)
        const createResponse = await getRequest()
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(200)
        expect(createResponse.body.items).toStrictEqual([])
    })
    it(`shouldn't create user with long password`, async () => {
        await getRequest()
            .post(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(userDataTest05)
            .expect(400)
        const createResponse = await getRequest()
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(200)
        expect(createResponse.body.items).toStrictEqual([])
    })
})