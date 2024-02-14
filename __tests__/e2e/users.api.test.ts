import request from "supertest";
import {app} from "../../src/settings";
import {RouterPaths} from "../../src/routes/router-paths";
import {userDataTest01, userPaginationView} from "../data-for-tests/user-data-for-test";

const getRequest = () => {
    return request(app)
}

describe(RouterPaths.users, () => {
    beforeAll(async () => {
        getRequest().delete(RouterPaths.testing)
    })
    beforeEach(async () => {
        getRequest().delete(RouterPaths.testing)
    })


    //1
    it('post -> get, should return paginationView', async () => {
        await getRequest()
            .post(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(userDataTest01)
            .expect(201)

        const createResponse = await getRequest()
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(200)
        console.log(createResponse.body)

        expect(createResponse.body).toEqual(userPaginationView)

    })
})