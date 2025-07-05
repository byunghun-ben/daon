/* eslint-disable */
// @ts-nocheck

/**
 * Polyfill for query-string compatibility with @react-native-kakao/core
 * This fixes the "queryString.stringify is not a function" error
 */

// Import the query-string module
import * as queryStringModule from "query-string";

// Create a polyfill if stringify method doesn't exist
if (typeof window !== "undefined" && window) {
  // @ts-ignore
  if (!window.queryString) {
    // @ts-ignore
    window.queryString = {
      stringify: (obj: Record<string, unknown>) => {
        // Use the modern API if available
        // @ts-ignore
        if (queryStringModule.stringify) {
          return queryStringModule.stringify(obj);
        }
        // Fallback to URLSearchParams
        return new URLSearchParams(obj).toString();
      },
      parse: (str: string) => {
        // Use the modern API if available
        if (queryStringModule.parse) {
          return queryStringModule.parse(str);
        }
        // Fallback to URLSearchParams
        const params = new URLSearchParams(str);
        const result: Record<string, any> = {};
        params.forEach((value, key) => {
          result[key] = value;
        });
        return result;
      },
    };
  }
}

// Also patch the module itself if needed
const qs = queryStringModule as any;
if (!qs.stringify && qs.default) {
  qs.stringify =
    qs.default.stringify ||
    function (obj: Record<string, any>) {
      return new URLSearchParams(obj).toString();
    };
  qs.parse =
    qs.default.parse ||
    function (str: string) {
      const params = new URLSearchParams(str);
      const result: Record<string, any> = {};
      params.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    };
}

export {};
