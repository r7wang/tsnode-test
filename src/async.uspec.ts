describe("async", () => {
    // Give enough time for tests to run.
    jest.setTimeout(30000);

    const DEFAULT_DELAY = 1000;
    const ERROR_INDEX = 6;

    // Acts like an asynchronous sleep function.
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    function incrementalDelay(id: number): number {
        return DEFAULT_DELAY - (id * 50);
    }

    /**
     * This way of writing promises is very explicit and means that we have to clearly delineate what happens before
     * and after asynchronous execution. For example, logging the start time and logging the end time don't end up on
     * the same indentation level. This can make code highly nested and complicated.
     */
    async function processItemExplicit(
        id: number,
        delayFunc?: (n: number) => number,
        defaultDelay: number = DEFAULT_DELAY,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            log(`start ${id}`);
            const delayMs = delayFunc ? delayFunc(id) : defaultDelay;
            setTimeout(
                () => {
                    if (id == ERROR_INDEX) {
                        reject();
                        return;
                    }
                    counter += 1;
                    log(`done ${id}`);
                    resolve();
                },
                delayMs,
            )
        });
    }

    /**
     * This way of writing promises is much more implicit and looks like synchronous code but has advantages related to
     * asynchronous execution.
     */
    async function processItemDelay(
        id: number,
        delayFunc?: (n: number) => number,
        defaultDelay: number = DEFAULT_DELAY,
    ): Promise<void> {
        log(`start ${id}`);
        const delayMs = delayFunc ? delayFunc(id) : defaultDelay;
        await delay(delayMs);

        if (id == ERROR_INDEX) {
            throw new Error("reject");
        }
        counter += 1;
        log(`done ${id}`);
    }

    /**
     * Is there a reason to run a no delay function using promises? Normally, this is used when we want to wait for a
     * batch operation to complete in parallel.
     */
    async function processItemNoDelay(id: number): Promise<void> {
        log(`start ${id}`);
        if (id == 6) {
            throw new Error("reject");
        }
        counter += 1;
        log(`done ${id}`);
    }

    beforeEach(() => {
        counter = 0;
    });

    it("should wait for async operation to complete", async () => {
        log();
        await processItemDelay(1);
        log();
    });

    it("should wait for all async operations to complete sequentially", async() => {
        log();
        for (const item of [1, 2, 3]) {
            await processItemDelay(item, undefined, 300);
        }
        log();
    });

    it("should wait for all async operations to complete in parallel", async () => {
        // This approach forces us to explicitly write out all of the calls (boilerplate).
        log();
        await Promise.all([
            processItemDelay(1),
            processItemDelay(2),
            processItemDelay(3),
        ]);
        log();
    });

    it("should wait for generated async operations to complete in parallel", async () => {
        log();
        const promises = [...Array(5).keys()].map(id => processItemDelay(id));
        await Promise.all(promises)
            .then(() => log());

        expect(counter).toEqual(5);
    });

    describe("when there is an error", () => {
        it("should finish running all promises that don't yield", async () => {
            // We expect all individual promises to be treated as if they were all started in parallel, and hence they
            // must at least all run until they yield.
            log();
            const promises = [...Array(10).keys()].map(processItemNoDelay);
            await Promise.all(promises)
                .then(() => log(`succeeded, counter = ${counter}`))
                .catch(() => log(`rejected, counter = ${counter}`));

            expect(counter).toEqual(9);
        });

        it("should terminate promises that yield on rejection", async () => {
            // We expect all individual promises to be treated as if they were all started in parallel, and hence they
            // must at least all run until they yield.
            log();
            const promises = [...Array(10).keys()].map(id => processItemDelay(id, incrementalDelay));
            await Promise.all(promises)
                .then(() => log(`succeeded, counter = ${counter}`))
                .catch(() => log(`rejected, counter = ${counter}`));

            // We expect that only IDs (9, 8, 7) are run due to the specified delay algorithm.
            expect(counter).toEqual(3);
        });
    })
});
