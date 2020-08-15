// How do you build a proper dictionary in Typescript?

describe("dictionary", () => {
    it("should create a dictionary", () => {
        const dict = {
            "a": false,
            "b": 12,
            "c": "test.value",
            "d": {
                "a": null,
                "b": undefined,
                "c": "test.value",
            }
        }

        // TODO: Implement.
        expect("a" in dict).toBe(true);
        expect(dict["a"]).toBe(false);
        expect(dict["d"]["a"]).toBe(null);
        expect(dict.d.c).toBe("test.value");
    });

    it("should create a dictionary with mixed type keys", () => {
        const dict = {
            1: false,
            2: 12,
            3: "test.value",
            "4": {
                "a": null,
                "b": undefined,
                "c": "test.value",
            }
        }

        expect(dict["1"]).toBe(false);
        expect(dict["2"]).toBe(12);
        expect(dict["4"].a).toBe(null);
    });
});
