import {knex} from "./database";
import {QuestionRepo} from "./question";

describe("database tests", () => {
    let questionRepo: QuestionRepo;

    beforeAll(() => {
        questionRepo = new QuestionRepo();
    })

    afterAll(async () => {
        await knex.destroy();
    })

    interface QuestionInstance {
        id: number,
        text: string,
        sample: number,
        created_at: Date,
        updated_at: Date,
    }

    async function createQuestion(): Promise<QuestionInstance | undefined> {
        return questionRepo
            .save({text: "Who are you?", sample: 165})
            .then((q) => {
                return q.toJSON();
            })
            .catch((msg) => {
                console.log(msg);
                return undefined;
            });
    }

    async function updateQuestion(inst: Partial<QuestionInstance>): Promise<QuestionInstance | undefined> {
        // Must remember to use the patch option for an update.
        return questionRepo
            .save({
                id: inst.id,
                text: inst.text,
                sample: inst.sample,
            }, { patch: true })
            .then((q) => q.toJSON())
            .catch((msg) => {
                console.log(msg);
                return undefined;
            });
    }

    async function updateQuestionTimestamp(id: number, updated_at: Date): Promise<QuestionInstance | undefined> {
        return questionRepo
            .save({ id, updated_at }, { patch: true })
            .then((q) => q.toJSON())
            .catch((msg) => {
                console.log(msg);
                return undefined;
            });
    }

    async function getQuestion(id: number): Promise<QuestionInstance | undefined> {
        // Treats QuestionRepo like an instance of a question, instead of like a repository.
        return questionRepo
            .where("id", id)
            .fetch()
            .then((q) => q.toJSON())
            .catch((msg) => {
                console.log(msg);
                return undefined;
            });
    }

    it("should return count of a table", async () => {
        let count: number;
        await knex.raw("SELECT count(*) FROM Question")
            .then((resp: any) => {
                count = resp[0][0]["count(*)"];
            })
            .then(() => {
                expect(count).toBeDefined();
            });
    });

    it("should create a new model instance", async () => {
        const q1 = await createQuestion();
        expect(q1).not.toBeNull();
    });

    it("should not update an existing model instance if no changes are made", async () => {
        const model_id = 1;
        const q_get = await getQuestion(model_id);
        expect(q_get).toBeDefined();
        if (!q_get) {
            return;
        }

        const q_upd = await updateQuestion(q_get);
        expect(q_upd).toBeDefined();
        if (!q_upd) {
            return;
        }

        expect(q_upd.id).toEqual(model_id);
        expect(q_get.updated_at).toEqual(q_upd.updated_at);
    });

    it("should update an existing model instance if changes are made", async () => {
        const model_id = 2;
        const q_get = await getQuestion(model_id);
        expect(q_get).toBeDefined();
        if (!q_get) {
            return;
        }

        q_get.sample += 1;
        const q_upd = await updateQuestion(q_get);
        expect(q_upd).toBeDefined();
        if (!q_upd) {
            return;
        }

        expect(q_upd.id).toEqual(model_id);
        expect(q_upd.sample).toEqual(q_get.sample);
        expect(q_get.updated_at).not.toEqual(q_upd.updated_at);
    })

    it("should catch error and return nothing if invalid changes were requested", async () => {
        const q_upd = await updateQuestion({});
        expect(q_upd).not.toBeDefined();
    })

    it("should remember the last fetch when calling toJSON", async () => {
        const model_id = 2;
        const q_get = await getQuestion(model_id);
        expect(q_get).toBeDefined();
        if (!q_get) {
            return;
        }
        const getJson = questionRepo.toJSON();
        expect(getJson).toHaveProperty("id", model_id);
        expect(getJson).toHaveProperty("text", "Who are you?");
        expect(getJson).toHaveProperty("sample", q_get.sample);
    })

    it("should remember the last save when calling to JSON", async () => {
        const model_id = 2;
        const ts = new Date();
        const q_upd = await updateQuestionTimestamp(model_id, ts);
        expect(q_upd).toBeDefined();
        const updJson = questionRepo.toJSON();
        expect(updJson).toHaveProperty("id", model_id);
        expect(updJson).toHaveProperty("text", "Who are you?");
        // TODO: Truncate ts to second granularity to match MySQL timestamp.
        expect(updJson).toHaveProperty("updated_at");
    })

    // TODO: Write a test to experiment with transactional behavior of bookshelf/knex.
    // TODO: Write a test to play around with idempotent update patterns.
});
