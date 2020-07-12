/**
 * @jest-environment node
 */
import Koa from "koa";
import {Server} from "http";
import axios from "axios";
import {log} from "./utils";

describe("axios", () => {
    const DEFAULT_PORT = 3061;

    let app: Server;
    let complete: boolean | undefined;

    beforeAll(() => {
        app = new Koa()
            .use(async (ctx: { body: string; }) => {
                ctx.body = '{ "outer": { "id": "16941", "timestamp": "2020-06-11T20:12:10.000Z" }, "error": null }';
            })
            .listen(DEFAULT_PORT);
    });

    afterAll(() => {
        app.close();
    });

    beforeEach(() => {
        complete = undefined;
    });

    interface Def {
        outer: {
            id: string;
            timestamp: Date;
        };
        error: any;
    }

    async function test(): Promise<Def> {
        const client = axios.create();
        return await client.get<Def>("http://localhost:3061").then(res => res.data);
    }

    it("should convert any dates into strings", async () => {
        await test().then(
            data => {
                complete = true;
                expect(typeof(data)).toEqual("object");
                expect(typeof(data.outer.id)).toEqual("string");
                expect(typeof(data.outer.timestamp)).toEqual("string");
            },
            reason => {
                log(reason);
                complete = false;
            });

        expect(complete).toEqual(true);
    });
});
