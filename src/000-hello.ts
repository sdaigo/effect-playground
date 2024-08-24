import { Console, Effect } from "effect";

const main = Console.log("Hello, Effect");

Effect.runSync(main);
