import Koa from "koa";
import * as fs from "fs";

const DEFAULT_PORT = 9090;
const app = new Koa()
    .use(async (ctx: { body: string; }) => {
        ctx.body = JSON.parse(fs.readFileSync('output.json', 'utf-8'));
    })
    .listen(DEFAULT_PORT);
