// Checks for rule-packs/ai-attack-surface.json (J1O-1358). Runs with Node's built-in test
// runner (`node --test test/`), so the repo gains no test dependency. The pack is loaded through
// rule-packs/index.js, the same export a provisioning client reads.
const test = require("node:test");
const assert = require("node:assert/strict");
const { parse } = require("@jupiterone/query-language-parser");
const { AiAttackSurface } = require("../rule-packs");

// Whitespace-insensitive view of a query, so line breaks in the JSON don't matter.
const flat = (query) => query.replace(/\s+/g, " ").trim();

const rule = (name) => {
  const found = AiAttackSurface.find((r) => r.name === name);
  assert.ok(found, `rule "${name}" is in the pack`);
  return found;
};

const queryOf = (name) => flat(rule(name).queries[0].query);

// The FIND ... WITH ... part, before the alias and RETURN, where the filters live.
const filterOf = (name) => queryOf(name).split(/ AS ai\b/)[0];

// A property used as a filter, matched as a whole word so `active` never matches `lastActivityOn`.
const filtersOn = (text, property) => new RegExp(`\\b${property}\\s*[=<>!]`).test(text);

test("the pack is exported from rule-packs/index.js as an array of three rules", () => {
  assert.ok(Array.isArray(AiAttackSurface));
  assert.deepEqual(
    AiAttackSurface.map((r) => r.name),
    ["Unsanctioned AI apps", "AI identities with broad access", "Inactive AI tokens"]
  );
});

test("every query parses with the J1QL parser the validator uses", () => {
  for (const r of AiAttackSurface) {
    for (const q of r.queries) {
      assert.doesNotThrow(() => parse(q.query), `${r.name} / ${q.name}`);
    }
  }
});

test("every query names an explicit class or type list, never every entity (CWE-400)", () => {
  for (const r of AiAttackSurface) {
    for (const q of r.queries) {
      const find = flat(q.query).match(/^FIND (\([^)]*\)|\S+)/);
      assert.ok(find, `${r.name} starts with FIND`);
      assert.notEqual(find[1], "*", `${r.name} does not FIND *`);
    }
  }
});

test("unsanctioned AI apps reads Reco's shadow flag on Reco AI agents only", () => {
  assert.match(filterOf("Unsanctioned AI apps"), /_type = 'reco_ai_agent' AND isShadow = true/);
});

test("unsanctioned AI apps reads Copilot's blocked flag on Copilot packages only", () => {
  assert.match(
    filterOf("Unsanctioned AI apps"),
    /_type = 'microsoft_365_copilot_package' AND isBlocked = true/
  );
});

test("unsanctioned AI apps reads no other status field (CWE-345)", () => {
  const filter = filterOf("Unsanctioned AI apps");
  for (const property of ["sanctioned", "requestStatus", "type", "approved"]) {
    assert.ok(!filtersOn(filter, property), `does not filter on ${property}`);
  }
});

test("broad access reads Wiz's admin privilege flag on Wiz AI resources", () => {
  const filter = filterOf("AI identities with broad access");
  assert.match(filter, /^FIND wiz_ai_resource WITH /);
  assert.ok(filtersOn(filter, "hasAdminPrivileges"));
});

test("broad access reads Wiz's high privilege flag", () => {
  assert.ok(filtersOn(filterOf("AI identities with broad access"), "hasHighPrivileges"));
});

test("inactive AI tokens compares lastUsedOn with a 90-day window", () => {
  assert.match(filterOf("Inactive AI tokens"), /lastUsedOn < date\.now - 90 days/);
});

test("inactive AI tokens covers AI API keys that no converter marks isAi", () => {
  const filter = filterOf("Inactive AI tokens");
  for (const type of ["anthropic_api_key", "aws_bedrock_api_key"]) {
    assert.match(filter, new RegExp(`_type = '${type}'`), type);
  }
});

test("inactive AI tokens reads no other activity field, so unknown is not inactive (CWE-1188)", () => {
  const filter = filterOf("Inactive AI tokens");
  for (const property of ["lastSeenOn", "lastActivityOn", "_beginOn", "active"]) {
    assert.ok(!filtersOn(filter, property), `does not filter on ${property}`);
  }
});

test("every rule carries the product: ai-asm label for adoption counting", () => {
  for (const r of AiAttackSurface) {
    assert.ok(
      (r.labels || []).some((l) => l.labelName === "product" && l.labelValue === "ai-asm"),
      r.name
    );
  }
});

test("alert levels: unsanctioned and broad access HIGH, inactive MEDIUM", () => {
  assert.equal(rule("Unsanctioned AI apps").alertLevel, "HIGH");
  assert.equal(rule("AI identities with broad access").alertLevel, "HIGH");
  assert.equal(rule("Inactive AI tokens").alertLevel, "MEDIUM");
});
