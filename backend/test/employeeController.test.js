const test = require("node:test");
const assert = require("node:assert/strict");

const { buildEmployeePayload } = require("../src/controllers/employeeController");

test("buildEmployeePayload normalizes empty values and defaults status", () => {
  const payload = buildEmployeePayload({
    full_name: "Budi Santoso",
    nik: "123456789",
    department: "",
    position: "Developer",
    status: "",
  });

  assert.deepEqual(payload, {
    full_name: "Budi Santoso",
    nik: "123456789",
    department: null,
    position: "Developer",
    status: "active",
  });
});

test("buildEmployeePayload omits undefined fields", () => {
  const payload = buildEmployeePayload({
    full_name: "Ani",
    phone: undefined,
  });

  assert.deepEqual(payload, {
    full_name: "Ani",
  });
});
