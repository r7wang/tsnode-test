describe("async tests", () => {
    jest.setTimeout(30000);
    let counter: number = 0;

    function now(): string {
        return new Date().toISOString();
    }

    function log(message?: string): void {
        if (message) {
            console.log(`${now()}: ${message}`)
        } else {
            console.log(`${now()}`);
        }
    }

    async function processItem(id: number): Promise<void> {
        log(`start ${id}`);
        return new Promise(resolve => setTimeout(
            () => {
                log(`done ${id}`);
                resolve();
            },
            2000,
        ));
    }

    beforeEach(() => {
        counter = 0;
    });

    it("should wait for async operation to complete", async () => {
        log();
        await processItem(1);
        log();
    });

    it("should wait for all async operations to complete sequentially", async() => {
        log();
        for (const item of [1, 2, 3]) {
            await processItem(item);
        }
        log();
    });

    it("should wait for all async operations to complete in parallel", async () => {
        // One problem with this approach is that we have to explicitly write out all of the calls to be made.
        log();
        await Promise.all([
            processItem(1),
            processItem(2),
            processItem(3),
        ]);
        log();
    });

    it("should wait for generated async operations to complete in parallel", async () => {
        log();
        const promises = [...Array(10).keys()].map(processItem);
        await Promise.all(promises);
        log();
    });
});
