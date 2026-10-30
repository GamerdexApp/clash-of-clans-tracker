import { createTranslator } from "next-intl";

import { formatNumber, getI18nState } from "./formatter";
import type { Messages } from "./locales";

/**
 * A message object that reads the current catalog every time a property is read, so a component or
 * a service keeps the same `text.section.key` and `text.section.key(count)` calls whatever the
 * language is. `I18nProvider` renders its children again when the language changes, so a value read
 * while rendering is always current. Do not keep a read value in a module level constant.
 *
 * `meta.fns` lists the messages that are functions and names their parameters. A parameter is
 * written `name` for text and `name:kind` for the others:
 * - `number`: the number is formatted with the number format of the player.
 * - `plural`: the count chooses the plural form, and `amount` holds the formatted number.
 * - `list`: a list of names, joined with commas, plus `has<Name>` to say whether it has any.
 * - `present`: text that may be empty, plus `has<Name>` to say whether it has any.
 * - `plusOne`: a position that starts at 0 and is shown from 1.
 * `meta.arrays` lists the paths that are lists. A list is stored as `item1`, `item2` and so on.
 */
export interface TextMeta {
  fns: Record<string, string[]>;
  arrays: string[];
}

type Namespace = keyof Messages;
type Translate = (key: string, values?: Record<string, string | number>) => string;
type Entry = Record<string, unknown>;

const translators = new WeakMap<object, Map<string, Translate>>();
const results = new WeakMap<object, Map<string, string>>();

const isEntry = (value: unknown): value is Entry => typeof value === "object" && value !== null;

const translatorFor = (namespace: Namespace): Translate => {
  const { locale, messages } = getI18nState();
  let byNamespace = translators.get(messages);
  if (!byNamespace) translators.set(messages, (byNamespace = new Map()));
  let translate = byNamespace.get(namespace);
  if (!translate) {
    const created = createTranslator({ locale, messages, namespace, onError: () => {} });
    translate = (key, values) => created(key as never, values as never);
    byNamespace.set(namespace, translate);
  }
  return translate;
};

const cachedText = (namespace: Namespace, dotted: string): string => {
  const { messages } = getI18nState();
  let cache = results.get(messages);
  if (!cache) results.set(messages, (cache = new Map()));
  const key = `${namespace}.${dotted}`;
  let text = cache.get(key);
  if (text === undefined) cache.set(key, (text = translatorFor(namespace)(dotted)));
  return text;
};

const rawAt = (namespace: Namespace, path: string[]): unknown => {
  let node: unknown = getI18nState().messages[namespace];
  for (const step of path) {
    if (!isEntry(node)) return undefined;
    node = node[step];
  }
  return node;
};

const capitalized = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

const valuesFor = (parameters: string[], args: unknown[]) => {
  const values: Record<string, string | number> = {};
  parameters.forEach((entry, index) => {
    const [name, kind = "text"] = entry.split(":");
    const arg = args[index];
    if (kind === "number") values[name] = typeof arg === "number" ? formatNumber(arg) : String(arg ?? "");
    else if (kind === "plural") {
      values[name] = Number(arg);
      if (!parameters.some((other) => other.split(":")[0] === "amount")) values.amount = formatNumber(Number(arg));
    } else if (kind === "list") {
      const list = Array.isArray(arg) ? arg : [];
      values[name] = list.join(", ");
      values[`has${capitalized(name)}`] = list.length > 0 ? "true" : "false";
    } else if (kind === "present") {
      values[name] = String(arg ?? "");
      values[`has${capitalized(name)}`] = arg ? "true" : "false";
    } else if (kind === "plusOne") values[name] = Number(arg) + 1;
    else values[name] = arg as string | number;
  });
  return values;
};

const resolve = (namespace: Namespace, meta: TextMeta, path: string[]): unknown => {
  const dotted = path.join(".");
  const parameters = meta.fns[dotted];
  if (parameters) {
    return (...args: unknown[]) => translatorFor(namespace)(dotted, valuesFor(parameters, args));
  }
  const raw = rawAt(namespace, path);
  if (meta.arrays.includes(dotted) && isEntry(raw)) {
    return Object.keys(raw)
      .sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)))
      .map((key) => resolve(namespace, meta, [...path, key]));
  }
  if (typeof raw === "string") return cachedText(namespace, dotted);
  if (isEntry(raw)) return objectAt(namespace, meta, path);
  return undefined;
};

const objectAt = (namespace: Namespace, meta: TextMeta, path: string[]): unknown =>
  new Proxy({} as Entry, {
    get: (_, key) => (typeof key === "string" ? resolve(namespace, meta, [...path, key]) : undefined),
    has: (_, key) => typeof key === "string" && rawAt(namespace, [...path, key]) !== undefined,
    ownKeys: () => {
      const raw = rawAt(namespace, path);
      return isEntry(raw) ? Object.keys(raw) : [];
    },
    getOwnPropertyDescriptor: (_, key) =>
      typeof key === "string" && rawAt(namespace, [...path, key]) !== undefined
        ? { enumerable: true, configurable: true, value: resolve(namespace, meta, [...path, key]) }
        : undefined,
  });

export const messages = <Shape>(namespace: Namespace, meta: TextMeta): Shape => objectAt(namespace, meta, []) as Shape;
