const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeRole, isRoleAllowed } = require("../src/middleware/roleMiddleware");

test("normalizeRole converts admin aliases to lowercase admin", () => {
  assert.equal(normalizeRole("ADMIN"), "admin");
  assert.equal(normalizeRole("Super_Admin"), "admin");
  assert.equal(normalizeRole("super-admin"), "admin");
});

test("isRoleAllowed treats admin aliases as admin access", () => {
  assert.equal(isRoleAllowed("admin", ["admin"]), true);
  assert.equal(isRoleAllowed("super_admin", ["admin"]), true);
  assert.equal(isRoleAllowed("administrator", ["admin"]), true);
});

test("isRoleAllowed rejects roles outside the allowed list", () => {
  assert.equal(isRoleAllowed("employee", ["admin"]), false);
  assert.equal(isRoleAllowed("manager", ["admin"]), false);
});
