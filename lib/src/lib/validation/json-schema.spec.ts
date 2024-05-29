import type { JSONSchema } from "./json-schema";

describe("JSONSchema", () => {

  function test(schema: JSONSchema): void {
    // eslint-disable-next-line no-empty, @typescript-eslint/no-unnecessary-condition
    if (schema !== undefined) {}
    expect().nothing();
  }

  describe("classic", () => {

    it("string", () => {

      const schema = {
        type: "string",
        const: "hello",
        enum: ["hello", "world"],
        maxLength: 10,
        minLength: 1,
        pattern: "[a-Z]+",
      } satisfies JSONSchema;

      test(schema);

    });

    it("number", () => {

      const schema = {
        type: "number",
        const: 1.5,
        enum: [1.5, 2.4],
        exclusiveMaximum: 10.4,
        maximum: 9.6,
        exclusiveMinimum: 2.3,
        minimum: 3.1,
        multipleOf: 2.1,
      } satisfies JSONSchema;

      test(schema);

    });

    it("integer", () => {

      const schema = {
        type: "integer",
        const: 1,
        enum: [1, 2],
        exclusiveMaximum: 10,
        maximum: 9,
        exclusiveMinimum: 2,
        minimum: 3,
        multipleOf: 2,
      } satisfies JSONSchema;

      test(schema);

    });

    it("boolean", () => {

      const schema = {
        type: "boolean",
        const: true,
      } satisfies JSONSchema;

      test(schema);

    });

    it("array", () => {

      const schema = {
        type: "array",
        items: { type: "string" },
        maxItems: 10,
        minItems: 1,
        uniqueItems: true,
      } satisfies JSONSchema;

      test(schema);

    });

    it("tuple", () => {

      const schema = {
        type: "array",
        items: [
          { type: "string" },
          { type: "number" },
        ],
        maxItems: 2,
        minItems: 2,
        uniqueItems: true,
      } satisfies JSONSchema;

      test(schema);

    });

    it("object", () => {

      const schema = {
        type: "object",
        properties: {
          hello: { type: "string" },
          world: { type: "number" },
        },
        required: ["hello"],
      } satisfies JSONSchema;

      test(schema);

    });

  });

  describe("readonly support", () => {

    it("string enum", () => {

      const schema = {
        type: "string",
        enum: ["hello", "world"],
      } as const satisfies JSONSchema;

      test(schema);

    });

    it("number enum", () => {

      const schema = {
        type: "number",
        enum: [1.4, 2.6],
      } as const satisfies JSONSchema;

      test(schema);

    });

    it("integer enum", () => {

      const schema = {
        type: "integer",
        enum: [1, 2],
      } as const satisfies JSONSchema;

      test(schema);

    });

    it("tuple", () => {

      const schema = {
        type: "array",
        items: [
          { type: "string" },
          { type: "number" },
        ],
      } as const satisfies JSONSchema;

      test(schema);

    });

    it("object with required", () => {

      const schema = {
        type: "object",
        properties: {
          hello: { type: "string" },
          world: { type: "number" },
        },
        required: ["hello"],
      } as const satisfies JSONSchema;

      test(schema);

    });

  });

  describe("specials", () => {

    it("unexisting option", () => {

      const schema = {
        type: "string",
        // @ts-expect-error Failure test
        required: ["hello"],
      } satisfies JSONSchema;

      test(schema);

    });

    it("option with wrong type", () => {

      const schema = {
        type: "string",
        // @ts-expect-error Failure test
        maxLength: "1",
      } satisfies JSONSchema;

      // @ts-expect-error Failure test
      test(schema);

    });

  });

});
