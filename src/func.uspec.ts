function runOptional(a: number, b?: number, c?: number): { a: number, b?: number, c?: number } {
    return {a, b, c};
}

function runDefaults(a: number, b: number = 5, c: boolean = false): { a: number, b: number, c: boolean } {
    return {a, b, c};
}

describe("func", () => {
    it("should verify calls with missing optional params", () => {
        const result = runOptional(3, 7);
        expect(result.a).toBe(3);
        expect(result.b).toBe(7);
        expect(result.c).toBe(undefined);
    });

    it("should verify calls with missing default params", () => {
        const result = runDefaults(3);
        expect(result.a).toBe(3);
        expect(result.b).toBe(5);
        expect(result.c).toBe(false);
    });

    // Basically, there is no way to have default parameters end up with undefined.
    it("should verify calls with default params set to undefined", () => {
        const result = runDefaults(3, undefined, undefined);
        expect(result.a).toBe(3);
        expect(result.b).toBe(5);
        expect(result.c).toBe(false);
    });
});
