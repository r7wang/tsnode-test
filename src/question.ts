import {bookshelf} from "./database";

export class QuestionRepo extends bookshelf.Model<QuestionRepo> {
    get tableName(): string {
        return "Question";
    }

    get hasTimestamps(): boolean {
        return true;
    }

    constructor(params?: any) {
        super(params);
        this.on("saving", (model) => {
            console.log(model);
        });

        this.on("updating", (model, attrs, options) => {
            console.log(model);
            console.log(attrs);
            console.log(options);
        });
    }
}
