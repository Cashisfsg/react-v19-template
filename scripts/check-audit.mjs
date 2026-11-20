// Fails on any dependency advisory that is not written down in
// audit-allowlist.json, and on any allowlist entry that no longer matches one,
// so the list can only shrink and every line on it says why.
//
// `npm audit --audit-level` gates by severity only: it has nowhere to record
// why an advisory is tolerated and never says when that reason has expired.
//
// Dev dependencies are audited too: a compromised build tool runs on every
// machine that installs the template.
//
//   npm run check:audit

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ALLOWLIST = resolve(HERE, "audit-allowlist.json");
const PROJECT = resolve(HERE, "..");

// npm audit exits non-zero whenever it finds anything; the report is on stdout
// either way. Nothing on stdout means it could not audit at all.
const audit = () => {
    try {
        return execFileSync("npm", ["audit", "--json"], {
            cwd: PROJECT,
            encoding: "utf8"
        });
    } catch (error) {
        if (typeof error.stdout === "string" && error.stdout.length > 0) {
            return error.stdout;
        }
        throw new Error("npm audit failed", { cause: error });
    }
};

const advisoryId = url => url.split("/").pop();

const allowlist = JSON.parse(readFileSync(ALLOWLIST, "utf8"));
const allowed = new Map(
    allowlist.map(entry => [`${entry.package} ${entry.advisory}`, entry])
);
const matched = new Set();

const problems = new Set();
const excused = new Set();

const report = JSON.parse(audit());

if (report.error !== undefined) {
    console.error(`npm audit failed: ${report.error.summary}`);
    process.exit(1);
}

// Each vulnerable package lists in `via` either the advisories against it, as
// objects, or the names of the dependencies it is vulnerable through. Only the
// objects are advisories; the names point at another entry of the same report.
for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
    for (const advisory of vulnerability.via) {
        if (typeof advisory === "string") continue;

        const key = `${advisory.name} ${advisoryId(advisory.url)}`;
        const entry = allowed.get(key);

        if (entry === undefined) {
            problems.add(
                `${advisory.severity}: ${advisory.name} — ${advisory.title}\n    ${advisory.url}`
            );
            continue;
        }

        matched.add(key);
        excused.add(`${advisory.severity}: ${key} — ${entry.reason}`);
    }
}

for (const key of allowed.keys()) {
    if (!matched.has(key)) {
        problems.add(
            `allowlisted but no longer reported: ${key} — drop it from audit-allowlist.json`
        );
    }
}

if (excused.size > 0) {
    console.log(`Allowed (${String(excused.size)}):`);
    for (const line of excused) console.log(`  ${line}`);
    console.log("");
}

if (problems.size > 0) {
    console.error(`Unreviewed advisories (${String(problems.size)}):`);
    for (const line of problems) console.error(`  ${line}`);
    console.error(
        "\nFix them, or add an entry with a reason to scripts/audit-allowlist.json:" +
            '\n  { "package": "<name>", "advisory": "GHSA-…", "reason": "…" }'
    );
    process.exit(1);
}

console.log("No unreviewed advisories.");
