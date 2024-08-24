import { Schema } from "@effect/schema";
import { Config, Data, Effect } from "effect";

process.env.BASE_URL = "https://jsonplaceholder.typicode.com";

// Custom error types
class FetchError extends Data.TaggedError("FetchError") {}
class JsonError extends Data.TaggedError("JsonError") {}

// extracts the base URL from the environment
const config = Config.string("BASE_URL");

class TodoSchema extends Schema.Class<TodoSchema>("Todo")({
  userId: Schema.Positive,
  id: Schema.Positive,
  title: Schema.String,
  completed: Schema.Boolean,
}) {}

// any `unknown` value will be decoded according to the schema
const decodeTodo = Schema.decodeUnknown(TodoSchema);

/**
 * Creating effect
 * - effect is an "units of computation that encapsulate side effects"
 */
// https://jsonplaceholder.typicode.com
const fetchRequest = (baseUrl: string) =>
  Effect.tryPromise({
    try: () => fetch(`${baseUrl}/todos/1`),
    catch: () => new FetchError(),
  });

const jsonResponse = (resp: Response) =>
  Effect.tryPromise({
    try: () => resp.json(),
    catch: () => new JsonError(),
  });

// Using generators instead of pipe
const program = Effect.gen(function* () {
  const baseUrl = yield* config;
  const response = yield* fetchRequest(baseUrl);
  if (!response.ok) {
    return yield* new FetchError();
  }

  const json = yield* jsonResponse(response);

  return yield* decodeTodo(json);
});

// separte program definition from error handling
const main = program.pipe(
  Effect.catchTags({
    FetchError: () => Effect.succeed("Something went wrong while fetching data"),
    JsonError: () => Effect.succeed("Failed to parse JSON response"),
    ParseError: () => Effect.succeed("Failed to parse response to Todo"),
    ConfigError: () => Effect.succeed("BASE_URL not found in environment"),
  }),
);

const result = await Effect.runPromise(main);
result;
