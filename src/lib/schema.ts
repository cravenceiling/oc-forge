import rawSchema from "@/schemas/config.json";

type OnePropertyUnion<T> = {
  [K in keyof T]-?: { [P in K]: T[K] };
}[keyof T];

export const configSchema = rawSchema;

/*
export type ConfigSchema =
  Required<Pick<typeof configSchema, AlwaysDefined>> &
  Partial<Omit<typeof configSchema, AlwaysDefined>>;
*/

export type ConfigSchema = typeof configSchema;

export type SchemaProperties = typeof configSchema.properties;

type ConfigValue<S extends PropertySchema> = S extends { type: "string" }
  ? string
  : S extends { type: "boolean" }
    ? boolean
    : S extends { type: "number" | "integer" }
      ? number
      : S extends { enum: infer E }
        ? E extends (infer T)[]
          ? T
          : unknown
        : S extends { type: "array"; items: infer I }
          ? I extends PropertySchema
            ? ConfigValue<I>[]
            : unknown[]
          : S extends { type: "object"; properties: infer P }
            ? {
                [K in keyof P]: P[K] extends PropertySchema
                  ? ConfigValue<P[K]>
                  : unknown;
              }
            : unknown;

export type Config = { [K in PropertyKey]: ConfigValue<SchemaProperties[K]> };

export type PropertyKey = keyof typeof configSchema.properties;

export type PropertySchema = (typeof configSchema.properties)[PropertyKey];

export function getConfigSchema() {
  return configSchema;
}

type ResolvePrimitive<T> = T extends "string" | string
  ? string
  : T extends "number" | number
    ? number
    : T extends "boolean" | boolean
      ? boolean
      : never;

type ResolveSchema<T> = T extends { properties: infer P }
  ? Partial<{ [K in keyof P]: ResolveSchema<P[K]> }>
  : T extends { type: infer U }
    ? ResolvePrimitive<U>
    : never;

export type Properties = { $schema: string } & Partial<{
  [K in keyof SchemaProperties]: ResolveSchema<SchemaProperties[K]>;
}>;

export type PropertySchemaValue = OnePropertyUnion<Properties>;

export type PropertyValue =
  | string
  | number
  | boolean
  | PropertyValue[]
  | { [K in PropertyKey]: PropertyValue }
  | undefined;
