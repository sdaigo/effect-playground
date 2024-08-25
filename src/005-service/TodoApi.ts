import type { ParseResult } from "@effect/schema";
import { Schema } from "@effect/schema";
import { Config, Context, Effect } from "effect";
import type { ConfigError } from "effect/ConfigError";
import { FetchError, JsonError } from "./errors";
import { Todo } from "./schema";

process.env.BASE_URL = "https://jsonplaceholder.typicode.com";

// Service interface
export interface TodoApiImpl {
  readonly getTodo: Effect.Effect<
    Todo,
    FetchError | JsonError | ParseResult.ParseError | ConfigError
  >;
}

// Define `Context` for the service
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TodoApi extends Context.Tag("TodoApi")<TodoApi, TodoApiImpl>() {
  static readonly Live = TodoApi.of({
    getTodo: Effect.gen(function* () {
      const baseUrl = yield* Config.string("BASE_URL");

      const response = yield* Effect.tryPromise({
        try: () => fetch(`${baseUrl}/todos/1`),
        catch: () => new FetchError(),
      });

      if (!response.ok) {
        return yield* new FetchError();
      }

      const json = yield* Effect.tryPromise({
        try: () => response.json(),
        catch: () => new JsonError(),
      });

      return yield* Schema.decodeUnknown(Todo)(json);
    }),
  });

  // Implementation of the service for Testing
  static readonly Test = TodoApi.of({
    getTodo: Effect.succeed({
      userId: 1,
      id: 1,
      title: "delectus aut autem",
      completed: false,
    }),
  });
}
