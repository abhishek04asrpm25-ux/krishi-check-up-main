import { describe, expect, it } from "vitest";
import { DEMO_ACCOUNT, DEMO_CAPTCHA, checkCaptcha, isDemoCredentials, newCaptcha, validateLogin, validateRegister } from "@/lib/demo-auth";

const reg = { name: "Asha", mobile: "98765 43210", username: "asha_k", password: "secret123", confirm: "secret123", village: "Rai", district: "Panipat", state: "Haryana", language: "Hindi" };

describe("demo login", () => {
  it("accepts the demo account", () => {
    expect(validateLogin({ user: DEMO_ACCOUNT.username, password: DEMO_ACCOUNT.password, captcha: DEMO_CAPTCHA })).toEqual({});
  });
  it("requires fields", () => {
    expect(Object.keys(validateLogin({ user: "", password: "", captcha: "" }))).toEqual(["user", "password", "captcha"]);
  });
  it("rejects wrong password", () => {
    expect(isDemoCredentials(DEMO_ACCOUNT.username, "x")).toBe(false);
    expect(isDemoCredentials(DEMO_ACCOUNT.username, DEMO_ACCOUNT.password)).toBe(true);
  });
  it("captcha rejects empty and wrong, accepts right (case-insensitive)", () => {
    const c = newCaptcha();
    expect(checkCaptcha("", c)).toBeDefined();
    expect(checkCaptcha("ZZZZZZ", c)).toBeDefined();
    expect(checkCaptcha(c.toLowerCase(), c)).toBeUndefined();
    expect(validateLogin({ user: "a", password: "b", captcha: "nope" }, c).captcha).toBeDefined();
  });
});

describe("demo registration", () => {
  it("accepts valid input", () => expect(validateRegister(reg)).toEqual({}));
  it("rejects bad mobile", () => expect(validateRegister({ ...reg, mobile: "12345" }).mobile).toBeDefined());
  it("rejects mismatched passwords", () => expect(validateRegister({ ...reg, confirm: "other123" }).confirm).toBe("Passwords do not match."));
});
