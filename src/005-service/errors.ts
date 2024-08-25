import { Data } from "effect";

// Custom error types
export class FetchError extends Data.TaggedError("FetchError") {}
export class JsonError extends Data.TaggedError("JsonError") {}
