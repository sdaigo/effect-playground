import { Effect } from "effect";
import { TodoApi } from "./TodoApi";

const program = Effect.gen(function* () {
  const todoApi = yield* TodoApi;
  return yield* todoApi.getTodo;
});

const runnable = program.pipe(
  Effect.provideService(TodoApi, TodoApi.Live), //
);

const main = runnable.pipe(
  Effect.catchTags({
    FetchError: () => Effect.succeed("Something went wrong while fetching data"),
    JsonError: () => Effect.succeed("Failed to parse JSON response"),
    ParseError: () => Effect.succeed("Failed to parse JSON response"),
    ConfigError: () => Effect.succeed("Failed to load configuration"),
  }),
);

Effect.runPromise(main).then(console.log);
