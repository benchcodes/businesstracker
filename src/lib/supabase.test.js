import { describe, expect, it } from "vitest";
import { getSupabaseConfig } from "./supabase";

describe("getSupabaseConfig", () => {
  it("returns config when both values are provided", () => {
    expect(
      getSupabaseConfig("https://example.supabase.co", "anon-key"),
    ).toEqual({
      url: "https://example.supabase.co",
      key: "anon-key",
    });
  });

  it("returns null when values are missing", () => {
    expect(getSupabaseConfig("", "")).toBeNull();
  });
});
