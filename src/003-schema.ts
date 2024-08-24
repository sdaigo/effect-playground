import { Schema } from "@effect/schema";
import { Data, Effect } from "effect";

// Custom error types
class FetchError extends Data.TaggedError("FetchError") {}
class JsonError extends Data.TaggedError("JsonError") {}

// Define schema for data we expect from the API
// const TodoSchema = Schema.Struct({
//   userId: Schema.Positive,
//   id: Schema.Positive,
//   title: Schema.String,
//   completed: Schema.Boolean,
// });

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
const fetchRequest = Effect.tryPromise({
  try: () => fetch("https://jsonplaceholder.typicode.com/todos/1"),
  catch: () => new FetchError(),
});

const jsonResponse = (resp: Response) =>
  Effect.tryPromise({
    try: () => resp.json(),
    catch: () => new JsonError(),
  });

// Using generators instead of pipe
const program = Effect.gen(function* () {
  const response = yield* fetchRequest;
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
  }),
);

const result = await Effect.runPromise(main);
result;
