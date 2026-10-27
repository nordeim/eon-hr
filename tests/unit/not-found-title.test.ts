import { describe, expect, it } from "vitest";

import { unknownRouteSlug } from "@/lib/not-found-title";

// Session 104 (R104-B): the 404 title's multi-word form — the live REF read
// at the 68th deploy state showed the REF Title-Cases every hyphen-separated
// word of the last path segment ("definitely-not-a-real-route-r104" →
// "Definitely Not A Real Route R104 | Eon HR"), while the clone rendered the
// raw segment with only the first letter capitalized. The r35 pin's fixtures
// were single-word segments — the multi-word form was never measured (the
// fixture blind spot; the neo-crm D-194a4 doctrine's eon-hr member).
describe("unknownRouteSlug (the 404 title transform — R104-B)", () => {
  it("keeps the single-word r35 pins verbatim (the regression net)", () => {
    expect(unknownRouteSlug("/nonexistentroute123")).toBe("Nonexistentroute123");
    expect(unknownRouteSlug("/foo/bar")).toBe("Bar");
  });

  it("Title-Cases every hyphen-separated word (the REF's multi-word form)", () => {
    // ← RED before the fix: the raw-segment first-letter form
    expect(unknownRouteSlug("/definitely-not-a-real-route-r104")).toBe("Definitely Not A Real Route R104");
  });

  it("keeps multi-segment routes on the LAST segment (the r35 rule)", () => {
    expect(unknownRouteSlug("/foo/definitely-not-a-real-route")).toBe("Definitely Not A Real Route");
  });

  it("yields the empty slug for empty and root-only paths", () => {
    expect(unknownRouteSlug("/")).toBe("");
    expect(unknownRouteSlug("")).toBe("");
    expect(unknownRouteSlug("///")).toBe("");
  });

  it("treats leading/trailing/doubled hyphens as empty words", () => {
    expect(unknownRouteSlug("/-foo-")).toBe("Foo");
    expect(unknownRouteSlug("/foo--bar")).toBe("Foo Bar");
  });

  it("keeps digit-leading words intact (the capitalized first char is a digit)", () => {
    expect(unknownRouteSlug("/404-page")).toBe("404 Page");
    expect(unknownRouteSlug("/1040")).toBe("1040");
  });
});
