import { describe, expect, it } from "vitest";
import { formatSar, formatDate, initials, daysBetween, currentPeriod } from "@/lib/utils";

describe("formatSar (money as integer minor units)", () => {
  it("formats whole riyals without decimals", () => {
    expect(formatSar(0)).toBe("0 SAR");
    expect(formatSar(100)).toBe("1 SAR");
    expect(formatSar(8_500_00)).toBe("8,500 SAR");
  });

  it("keeps decimals for fractional amounts", () => {
    expect(formatSar(150)).toBe("1.50 SAR");
    expect(formatSar(99)).toBe("0.99 SAR");
  });

  it("compacts thousands and millions when asked", () => {
    expect(formatSar(1_250_000_00, { compact: true })).toBe("1.25M SAR");
    expect(formatSar(8_500_00, { compact: true })).toBe("8.5k SAR");
  });

  it("handles negative amounts (deductions)", () => {
    expect(formatSar(-250)).toBe("-2.50 SAR");
  });
});

describe("formatDate", () => {
  it("formats an ISO date in en-GB style", () => {
    expect(formatDate("2026-10-09")).toMatch(/9 Oct 2026/);
  });

  it("returns an em dash for null/undefined/invalid", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("initials", () => {
  it("takes the first two name tokens", () => {
    expect(initials("Sarah Chen")).toBe("SC");
  });

  it("derives initials from an email handle", () => {
    expect(initials("sepnetflix2023@outlook.com")).toBe("SO");
  });

  it("handles single names", () => {
    expect(initials("Plato")).toBe("P");
  });
});

describe("daysBetween", () => {
  it("counts inclusive days", () => {
    expect(daysBetween("2026-10-01", "2026-10-03")).toBe(3);
  });

  it("returns at least one day for same-day leave", () => {
    expect(daysBetween("2026-10-09", "2026-10-09")).toBe(1);
  });

  it("returns at least one day for reversed input", () => {
    expect(daysBetween("2026-10-09", "2026-10-01")).toBe(1);
  });
});

describe("currentPeriod", () => {
  it("formats the month as YYYY-MM", () => {
    expect(currentPeriod()).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
  });
});
