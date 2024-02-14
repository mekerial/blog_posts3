import {app} from './settings'
import {runDb} from "./db/db";

const port = 3002;
// export { app };
app.listen(port, async () => {
    await runDb()
})

