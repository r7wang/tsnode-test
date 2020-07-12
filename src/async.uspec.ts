import _ from "lodash";
import {Counter, processItemIncrementalDelay, processItemStaticDelay} from "./utils";

describe("async", () => {
    it("should wait for async operation to complete", async () => {
        await processItemStaticDelay(1);
    });

    it("should wait for all async operations to complete sequentially", async() => {
        for (const item of [1, 2, 3]) {
            await processItemStaticDelay(item, undefined);
        }
    });

    it("should wait for all async operations to complete in parallel", async () => {
        // This approach forces us to explicitly write out all of the calls (boilerplate).
        const counter: Counter = {value: 0};
        await Promise.all([
            processItemStaticDelay(1, counter),
            processItemStaticDelay(2, counter),
            processItemStaticDelay(3, counter),
        ]);

        expect(counter.value).toEqual(3);
    });

    it("should wait for generated async operations to complete in parallel", async () => {
        const counter: Counter = {value: 0};
        const promises = _.range(5).map(id => processItemIncrementalDelay(id, counter));
        await Promise.all(promises);

        expect(counter.value).toEqual(5);
    });
});
