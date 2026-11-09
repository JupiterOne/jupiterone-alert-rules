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

test("every query starts from AI identities only (bounded, CWE-400)", () => {
  for (const r of AiAttackSurface) {
    for (const q of r.queries) {
      assert.match(flat(q.query), /^FIND NHI WITH isAi = true AND /, r.name);
    }
  }
});

test("unsanctioned AI apps matches Reco's shadow flag", () => {
  assert.match(queryOf("Unsanctioned AI apps"), /isShadow = true/);
});

test("unsanctioned AI apps matches Copilot's blocked flag", () => {
  assert.match(queryOf("Unsanctioned AI apps"), /isBlocked = true/);
});

test("unsanctioned AI apps reads no other status field (CWE-345)", () => {
  const where = queryOf("Unsanctioned AI apps").split(" AS ")[0];
  for (const field of ["sanctioned", "requestStatus", "type =", "_type ="]) {
    assert.ok(!where.includes(field), `does not filter on ${field}`);
  }
});

test("broad access matches Wiz's admin privilege flag", () => {
  assert.match(queryOf("AI identities with broad access"), /hasAdminPrivileges = true/);
});

test("broad access matches Wiz's high privilege flag", () => {
  assert.match(queryOf("AI identities with broad access"), /hasHighPrivileges = true/);
});

test("inactive AI tokens compares lastUsedOn with a 90-day window", () => {
  assert.match(queryOf("Inactive AI tokens"), /lastUsedOn < date\.now - 90 days/);
});

test("inactive AI tokens reads no other activity field, so unknown is not inactive (CWE-1188)", () => {
  const where = queryOf("Inactive AI tokens").split(" AS ")[0];
  for (const field of ["lastSeenOn", "lastActivityOn", "_beginOn", "active"]) {
    assert.ok(!where.includes(field), `does not filter on ${field}`);
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
