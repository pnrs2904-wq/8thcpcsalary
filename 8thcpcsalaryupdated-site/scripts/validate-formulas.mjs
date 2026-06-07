import assert from "node:assert/strict";

const payMatrix = {
  1: 18000, 2: 19900, 3: 21700, 4: 25500, 5: 29200, 6: 35400,
  7: 44900, 8: 47600, 9: 53100, 10: 56100, 11: 67700, 12: 78800,
  13: 123100, 14: 144200, 15: 182200, 16: 205400, 17: 225000, 18: 250000,
};

function nearestPayLevel(basic) {
  let level = 7;
  let distance = Number.POSITIVE_INFINITY;
  for (const [key, value] of Object.entries(payMatrix)) {
    const next = Math.abs(value - basic);
    if (next < distance) {
      distance = next;
      level = Number(key);
    }
  }
  return level;
}

function transportAllowance(level) {
  if (level <= 2) return 1350;
  if (level <= 8) return 3600;
  return 7200;
}

assert.equal(nearestPayLevel(44900), 7);
assert.equal(nearestPayLevel(123100), 13);
assert.equal(transportAllowance(1), 1350);
assert.equal(transportAllowance(8), 3600);
assert.equal(transportAllowance(12), 7200);

const basic = 44900;
const da = basic * 0.62;
const projectedBasic = Math.round((basic + da) * 2.57);
assert.equal(projectedBasic, 186937);

console.log("Formula smoke checks passed.");
