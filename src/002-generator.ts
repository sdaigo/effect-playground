import { Console, Data, Effect } from "effect";

// Custom error types
class FetchError extends Data.TaggedError("FetchError") {}
class ParseError extends Data.TaggedError("ParseError") {}

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
    catch: () => new ParseError(),
  });

// Using generators instead of pipe
const main = Effect.gen(function* () {
  const response = yield* fetchRequest;
  if (!response.ok) {
    return yield* new FetchError();
  }

  return yield* jsonResponse(response);
});

const result = await Effect.runPromise(main);
result;
