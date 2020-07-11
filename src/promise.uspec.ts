describe("promise", () => {
    let counter: number;

    function expectOrder(order: number) {
        counter += 1;
        expect(counter).toEqual(order);
    }

    async function task(order: number) {
        expectOrder(order);
    }

    beforeEach(() => {
        counter = 0;
    });

    it("should execute the promise in the correct order", async () => {
        expectOrder(1);
        const promise: Promise<void> = new Promise((resolve, reject) => {
            // The promise executor function gets run immediately before the promise is even made!
            expectOrder(2);
            resolve();
            expectOrder(3);
        });
        expectOrder(4);
        await promise;
        expectOrder(5)
    });

    it("should execute a chained promise in the correct order", async () => {
        expectOrder(1);
        const promise: Promise<void> = new Promise((resolve, reject) => {
            expectOrder(2);
            resolve();
            expectOrder(3);
        })
        .then((result) => {
            // This part of the chained promise is executed only after the promise has been awaited.
            expectOrder(5)
        });
        expectOrder(4);
        await promise;
        expectOrder(6);
    });

    it("should execute an async function in the correct order", async () => {
        expectOrder(1);
        const promise = task(2);
        expectOrder(3);
        await promise;
        expectOrder(4);
    });

    it("should resolve if both resolve and reject are invoked", async () => {
        await new Promise((resolve, reject) => {
            resolve();
            reject("error");
        })
        .then(() => {
            return;
        });
    });

    it("should timeout if we neither resolve nor reject", async () => {
        await new Promise((resolve, reject) => {
            return;
        });
    });
});
