/**
 * 데이터베이스 필드(snake_case)와 API 응답(camelCase) 간 변환 유틸리티
 */

type SnakeToCamelCase<T extends string> =
  T extends `${infer P1}_${infer P2}${infer P3}`
    ? `${P1}${Uppercase<P2>}${SnakeToCamelCase<P3>}`
    : T;

type CamelToSnakeCase<T extends string> = T extends `${infer P1}${infer P2}`
  ? P2 extends Uncapitalize<P2>
    ? `${Lowercase<P1>}${CamelToSnakeCase<P2>}`
    : `${Lowercase<P1>}_${CamelToSnakeCase<Uncapitalize<P2>>}`
  : T;

// 더 안전한 타입 정의를 위한 유틸리티 타입
type Primitive = string | number | boolean | null | undefined | Date;

type ObjectType = Record<string, unknown>;

type KeysToSnakeCase<T> = {
  [K in keyof T as CamelToSnakeCase<string & K>]: T[K] extends ObjectType
    ? T[K] extends Primitive
      ? T[K]
      : KeysToSnakeCase<T[K]>
    : T[K] extends Array<infer U>
      ? U extends ObjectType
        ? U extends Primitive
          ? T[K]
          : Array<KeysToSnakeCase<U>>
        : T[K]
      : T[K];
};

type KeysToCamelCase<T> = {
  [K in keyof T as SnakeToCamelCase<string & K>]: T[K] extends ObjectType
    ? T[K] extends Primitive
      ? T[K]
      : KeysToCamelCase<T[K]>
    : T[K] extends Array<infer U>
      ? U extends ObjectType
        ? U extends Primitive
          ? T[K]
          : Array<KeysToCamelCase<U>>
        : T[K]
      : T[K];
};

/**
 * 값이 플레인 객체인지 확인
 */
function isPlainObject(value: unknown): value is ObjectType {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof RegExp) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}

/**
 * 객체의 키를 snake_case로 변환
 */
export function toSnakeCase<T extends ObjectType>(obj: T): KeysToSnakeCase<T> {
  if (!isPlainObject(obj)) {
    return obj as KeysToSnakeCase<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map((item: unknown) =>
      isPlainObject(item) ? toSnakeCase(item) : item
    ) as KeysToSnakeCase<T>;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    );

    if (isPlainObject(value)) {
      result[snakeKey] = toSnakeCase(value);
    } else if (Array.isArray(value)) {
      result[snakeKey] = value.map((item: unknown) =>
        isPlainObject(item) ? toSnakeCase(item) : item
      );
    } else {
      result[snakeKey] = value;
    }
  }

  return result as KeysToSnakeCase<T>;
}

/**
 * 객체의 키를 camelCase로 변환
 */
export function toCamelCase<T extends ObjectType>(obj: T): KeysToCamelCase<T> {
  if (!isPlainObject(obj)) {
    return obj as KeysToCamelCase<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map((item: unknown) =>
      isPlainObject(item) ? toCamelCase(item) : item
    ) as KeysToCamelCase<T>;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter: string) =>
      letter.toUpperCase()
    );

    if (isPlainObject(value)) {
      result[camelKey] = toCamelCase(value);
    } else if (Array.isArray(value)) {
      result[camelKey] = value.map((item: unknown) =>
        isPlainObject(item) ? toCamelCase(item) : item
      );
    } else {
      result[camelKey] = value;
    }
  }

  return result as KeysToCamelCase<T>;
}

/**
 * DB 레코드를 API 응답 형태로 변환
 */
export function dbToApi<T extends ObjectType>(dbRecord: T): KeysToCamelCase<T> {
  return toCamelCase(dbRecord);
}

/**
 * API 요청을 DB 레코드 형태로 변환
 */
export function apiToDb<T extends ObjectType>(apiData: T): KeysToSnakeCase<T> {
  return toSnakeCase(apiData);
}
