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
    }

    async function createQuestion(): Promise<QuestionInstance | undefined> {
        return questionRepo
            .save({text: "Who are you?", sample: 165})
            .then((q) => {
                    return q.toJSON();
                })
            .catch((msg) => {
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
            .then((q) => {
                return q.toJSON();
            }, () => {
                return undefined;
            });
    }

    async function getQuestion(id: number): Promise<QuestionInstance | undefined> {
        // Treats QuestionRepo like an instance of a question, instead of like a repository.
        return new QuestionRepo({id: id})
            .fetch()
            .then((q) => {
                return q.toJSON();
            })
            .catch((msg) => {
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

        // TODO: Verify that the value has been updated.
        expect(q_upd.id).toEqual(model_id);
    })
});
