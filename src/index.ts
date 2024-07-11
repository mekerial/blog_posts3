import {app} from './settings'
import {runDb} from "./db/db";

const port = 3002;
// export { app };
app.set('trust proxy', true)
app.listen(port, async () => {
    await runDb()
})