import _ from "lodash";
import {Counter, log, processItemIncrementalDelay, processItemNoDelay, processItemStaticDelay} from "./utils";

describe("promise.all", () => {
    const ERROR_INDEX = 6;
    let complete: boolean | undefined;

    interface Result {
        id: number;
        success: boolean;
        result: number | void | Error;
    }

    /**
     * Principles of Error Handling:
     *  - Any errors that can be handled immediately should be handled within local scope.
     *  - Any errors that are transient and can be retried should be retried within local scope.
     *  - If an error cannot be handled, collect enough information about the error and log with context.
     *  - If an operation has been partially completed, record partial completion and ensure that the remaining work
     *    can be scheduled in the future.
     */

    /**
     * This function is only responsible for wrapping a call with a generic catch. This is an elegant way to handle
     * errors if the error doesn't need to be returned up the call stack. This approach is good at catching groups of
     * errors underneath a single execution chain to guarantee that Promise.all doesn't fail. Because this does not
     * catch errors within a local context, it's not easy to retry or implement specific operation handling. We would
     * typically consider `processItemDelay` to be a private function and we would instead unit test this function.
     *
     * Investigate whether it's possible and whether or not there is a use case for continuing to chain off a catch.
     */
    async function processItemChainCatch(id: number): Promise<Result> {
        // We can try to extract the error, but `result` will be set to either the result value on success or undefined
        // on failure.
        let result: number | void;
        let hasError = false;
        result = await processItemStaticDelay(id, undefined, ERROR_INDEX)
            .catch(e => {
                log(e);
                hasError = true;
            });

        return {
            id,
            success: !hasError,
            result: result,
        };
    }

    /**
     * This function is only responsible for wrapping a call with a generic catch. This is an elegant way to handle
     * errors if the error needs to be returned up the call stack. Although not currently being used this way, this
     * approach is good at handling errors locally because a lot more context exists within the scope of a function
     * that hasn't yet exited. We would typically consider `processItemDelay` to be a private function and we would
     * instead unit test this function.
     */
    async function processItemCatchError(id: number): Promise<Result> {
        // We don't actually know the specific type of error, which makes it difficult to properly define types here.
        // If we guarantee that all errors inherit from a base error or if we parameterize the Result type with a
        // specific error type, then the interface becomes clearer.
        let result: number | Error;
        let hasError = false;
        try {
            result = await processItemStaticDelay(id, undefined, ERROR_INDEX);
        } catch (e) {
            log(e);
            result = e;
            hasError = true;
        }

        return {
            id,
            success: !hasError,
            result: result,
        }
    }

    beforeEach(() => {
        log();
        complete = undefined;
    });

    afterEach(() => {
        log();
    });

    describe("when there is no error", () => {
        it("should match list of input IDs by moving results out of local scope", async () => {
            let results: number[] | undefined;

            const promises = _.range(10, 20).map(id => processItemStaticDelay(id));
            await Promise.all(promises)
                .then(values => {
                    results = values;
                })
                .catch(() => complete = false);

            expect(results).toBeDefined();
            // @ts-ignore
            expect(results.length).toEqual(10);
        });
    });

    describe("when there is an error", () => {
        it("should finish running all promises that don't yield", async () => {
            // We expect all individual promises to be treated as if they were all started in parallel, and hence they
            // must at least all run until they yield.
            const counter: Counter = {value: 0};
            const promises = _.range(10).map(id => processItemNoDelay(id, counter, ERROR_INDEX));
            await Promise.all(promises)
                .then(() => complete = true)
                .catch(() => complete = false);

            expect(counter.value).toEqual(9);
            expect(complete).toEqual(false);
        });

        it("should terminate promises that yield on rejection", async () => {
            // We expect all individual promises to be treated as if they were all started in parallel, and hence they
            // must at least all run until they yield.
            const counter: Counter = {value: 0};
            const promises = _.range(10).map(id => processItemIncrementalDelay(id, counter, ERROR_INDEX));
            await Promise.all(promises)
                .then(() => complete = true)
                .catch(() => complete = false);

            // We expect that only IDs (9, 8, 7) are run due to the specified delay algorithm.
            expect(counter.value).toEqual(3);
            expect(complete).toEqual(false);
        });

        it("should know which promises failed by moving the results out of local scope", async () => {
            let errors: number[] = [];

            // This approach isn't an efficient use of chaining depth and increases code complexity.
            const counter: Counter = {value: 0};
            const promises = _.range(10).map(id => processItemChainCatch(id));
            await Promise.all(promises)
                .then(values => {
                    errors = values
                        .filter(result => !result.success)
                        .map(result => result.id);
                })

            expect(errors.length).toEqual(1);
            expect(errors[0]).toEqual(ERROR_INDEX);
        });

        it("should know which promises failed by chaining catch", async () => {
            const promises = _.range(10).map(id => processItemChainCatch(id));
            const results = await Promise.all(promises);
            const errors = results
                .filter(result => !result.success)
                .map(result => result.id);

            expect(errors.length).toEqual(1);
            expect(errors[0]).toEqual(ERROR_INDEX);
        });

        it("should know which promises failed by catching error", async () => {
            const promises = _.range(10).map(id => processItemCatchError(id));
            const results = await Promise.all(promises);
            const errors = results
                .filter(result => !result.success)
                .map(result => result.id);

            expect(errors.length).toEqual(1);
            expect(errors[0]).toEqual(ERROR_INDEX);
        });
    });
});
