import { Schema } from "@effect/schema";

export class Todo extends Schema.Class<Todo>("Todo")({
  userId: Schema.Positive,
  id: Schema.Positive,
  title: Schema.String,
  completed: Schema.Boolean,
}) {}
