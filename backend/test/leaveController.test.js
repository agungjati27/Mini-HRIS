process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'service-role-key';

const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveEmployeeForUser, normalizeLeaveStatus } = require('../src/controllers/leaveController');

test('resolveEmployeeForUser creates an employee record when none exists yet', async () => {
  const calls = [];
  const supabase = {
    from(table) {
      calls.push(['from', table]);
      return {
        select() {
          calls.push(['select']);
          return {
            eq() {
              calls.push(['eq']);
              return {
                maybeSingle() {
                  calls.push(['maybeSingle']);
                  return Promise.resolve({ data: null, error: null });
                },
              };
            },
          };
        },
        insert(payload) {
          calls.push(['insert', payload]);
          return {
            select() {
              return {
                single() {
                  return Promise.resolve({ data: { id: 'emp-1', profile_id: 'user-1' }, error: null });
                },
              };
            },
          };
        },
      };
    },
  };

  const employee = await resolveEmployeeForUser(supabase, 'user-1');

  assert.equal(employee.id, 'emp-1');
  assert.equal(employee.profile_id, 'user-1');
  assert.ok(calls.some((call) => call[0] === 'insert'));
});

test('resolveEmployeeForUser returns existing employee without inserting', async () => {
  const supabase = {
    from(table) {
      return {
        select() {
          return {
            eq() {
              return {
                maybeSingle() {
                  return Promise.resolve({ data: { id: 'emp-2', profile_id: 'user-2' }, error: null });
                },
              };
            },
          };
        },
        insert() {
          throw new Error('insert should not be called');
        },
      };
    },
  };

  const employee = await resolveEmployeeForUser(supabase, 'user-2');

  assert.equal(employee.id, 'emp-2');
});

test('normalizeLeaveStatus maps non-standard values to supported database statuses', () => {
  assert.equal(normalizeLeaveStatus('submitted'), 'pending');
  assert.equal(normalizeLeaveStatus('APPROVED'), 'approved');
  assert.equal(normalizeLeaveStatus('rejected '), 'rejected');
  assert.equal(normalizeLeaveStatus(''), 'pending');
});
