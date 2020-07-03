import Knex from "knex";
import Bookshelf from "bookshelf";

class Database {
    public knex: any;
    public bookshelf: Bookshelf;

    constructor() {
        this.knex = Knex({
            client: "mysql",
            connection: "mysql://root@localhost/tsnode_test",
            debug: false,
            pool: {
                min: 2,
                max: 50,
            },
            acquireConnectionTimeout: 5000,
        });
        this.bookshelf = Bookshelf(this.knex);
    }
}

const db: Database = new Database();
export const bookshelf = db.bookshelf;
export const knex = db.knex;
