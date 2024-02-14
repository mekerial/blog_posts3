import request from "supertest";
import {app} from "../../src/settings";
import {RouterPaths} from "../../src/routes/router-paths";
import {dataTestPostCreate01, postPaginationView} from "../data-for-tests/post-data-for-tests";


const getRequest = () => {
    return request(app)
}

describe(RouterPaths.posts, () => {
    beforeAll(async () => {
        getRequest().delete(RouterPaths.testing)
    })
    beforeEach(async () => {
        getRequest().delete(RouterPaths.testing)
    })

    it('should return pagination with empty array and 200', async () => {

        await getRequest()
            .post(RouterPaths.posts)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(dataTestPostCreate01)
            .expect(201)


        const createResponse = await getRequest()
            .get(RouterPaths.posts)
            .expect(200)
        expect(createResponse.body).toEqual(postPaginationView)
        console.log(createResponse.body)
    })

    // jest.setTimeout(5 * 60 * 1000);


})