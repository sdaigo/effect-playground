import { Console, Data, Effect } from "effect";

// type Effect<S, E, R> = (ctx: Context<R>) => E | S
//
// S: Success - value that an effect can succeed with when executed
// E: Error - expected error
// R: Requirement - contextual data required by the effect to executed

// Custom error types
class FetchError extends Data.TaggedError("FetchError") {}
class ParseError extends Data.TaggedError("ParseError") {}

/**
 * Creating effect
 * - effect is an "units of computation that encapsulate side effects"
 */
const fetchRequest = Effect.tryPromise({
  try: () => fetch("https://jsonplaceholder.typicode.com/todos/0"),
  catch: () => new FetchError(),
});

const jsonResponse = (resp: Response) =>
  Effect.tryPromise({
    try: () => resp.json(),
    catch: () => new ParseError(),
  });

const printer = Console.log;

// flatMap: access the result of an effect and chain another effect
const main = fetchRequest.pipe(
  Effect.filterOrFail(
    resp => resp.ok,
    () => new FetchError(),
  ),
  Effect.flatMap(jsonResponse), //
  Effect.tap(printer),
  Effect.catchTags({
    FetchError: () => Effect.succeed("Something went wrong while fetching data"),
    ParseError: () => Effect.succeed("Failed to parse JSON response"),
  }),
);

const result = await Effect.runPromise(main);
result;
