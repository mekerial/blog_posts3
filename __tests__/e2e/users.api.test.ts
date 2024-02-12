import request from "supertest";
import {app} from "../../src";
import {RouterPaths} from "../../src/routes/router-paths";

const getRequest = () => {
    return request(app)
}

describe(RouterPaths.users, () => {
    beforeAll(async () => {
        getRequest().delete(RouterPaths.testing)
    })

    it('should return 200 and users array', async () => {
        await getRequest()
            .post(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                "login": "new user",
                "password": "123123",
                "email": "love@gmail.com"
            })
            .expect(201)

        await getRequest()
            .get(RouterPaths.users)
            .set('authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(200)

    })

})