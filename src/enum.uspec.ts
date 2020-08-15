enum Colors {
    RED = "=RED=",
    GREEN = "=GREEN=",
    BLUE = "=BLUE=",
}

describe("enums", () => {
    it("should print an enum's string value", () => {
        const color = Colors.BLUE;
        console.log(color);
    });

    it("should convert a string to an enum from the enum name, not its text value", () => {
        const typed_a = Colors["BLUE" as keyof typeof Colors];
        const typed_b = Colors["BLUE"];
        const typed_c = Colors["=BLUE=" as keyof typeof Colors];

        expect(typed_a).toEqual(Colors.BLUE);
        expect(typed_b).toEqual(Colors.BLUE);
        expect(typed_c).toBeUndefined();
    });

    it("should compare enums", () => {
        const comp1 = Colors.RED.toString() == "=RED=";
        const comp2 = Colors.RED.toString() === "=RED=";
        const comp3 = Colors.RED === "=RED=";

        expect(comp1).toBe(true);
        expect(comp2).toBe(true);
        expect(comp3).toBe(true);
    });
});
