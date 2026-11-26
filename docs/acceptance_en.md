English | [简体中文](acceptance_zh.md)

# Host, Simulation and Release Acceptance

Automated tests use synthetic bundles, mock Dora executables and loopback Gateways. They verify contracts and safety properties; they do not certify real Kimi, Dora, MuJoCo or hardware.

## 1. Automated gates

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run build:check
pnpm run benchmark:startup
```

Coverage includes remote digest/size enforcement, cached archives, read-only shared models, runtime permissions/link boundaries, managed copies without node_modules, the 41 schemas/documented mappings, package/install/export, setup without persisted binary paths followed by a synthetic run, Query/Action/unknown reconciliation, and cancellable jobs surviving config refresh/restore.

CI is configured for Node 22 on Linux/macOS/Windows and Node 24 on Linux. Windows skips POSIX executable, mode and symlink scenarios. A skip does not certify Windows runtime execution or ACLs; consult actual CI results.

The startup benchmark reports npm preparation separately as `preparationMs`, then process creation to initialize after dependencies are ready, with platform/Node, p50/p95 and the 50ms target. Preparation needs reachable or cached npm tarballs; subsequent measurements exclude installation and Registry access and may use warm OS caches. Do not advertise a universal cold-start time. Bootstrap tests cover concurrent preparation, failure retry, offline cache reuse, compatibility hashes and unchanged npm originals.

## 2. Manual matrix

All rows below are **not executed** during this source repair. Record date, commit, client/OS/Node/Core versions, redacted outputs and evidence paths when executing them.

| Target | Required check | Pass criteria | Status |
|---|---|---|---|
| Kimi Work macOS | Custom plugin import, new session, MCP status, env/skills commands | Connected tools, instructions/commands available, isolated paths | Not executed |
| Kimi Work Windows | Same workflow plus private-profile/runtime ACL inspection | Clear binary platform limits, working catalog/config/export, correct ACLs | Not executed |
| Kimi Code CLI Linux | Install/reload, config backup/restore, user-Skill export/discovery | 41 tools available; no DSH modification | Not executed |
| Desktop + SSH Linux | Follow the complete remote setup; disable local Forge server; inspect platform/home | Execution is remote; loopback Gateway remains remote; no accidental local runtime | Not executed |
| Real Linux MuJoCo | Install/poll robot-control-sim, inspect/doctor, authorized mujoco-piper start, context, sim.get_robot_info, authorized stop | Actual healthy processes, robot info returned, processes/ports released after stop | Not executed |
| Real first bootstrap | Isolated home without Dora; approve setup, then authorized start without reload | Matching generation starts in the same session using isolated binaries | Not executed |
| Forge 2 Python flow | Compatible Python bundle and Dora1; authorized run/query/stop using mode=run | No mixed Dora generations; complete lifecycle | Not executed |
| Failure/unknown behavior | Controlled synthetic/simulation failure, inspect agent follow-up | Failure ends the turn; no repair/retry; unknown reconciled without duplicate action | Not executed |

Never inject faults into moving hardware to perform these checks. After any failed Forge call, report its exact code and already collected evidence and stop that turn. Further diagnosis and test-instance shutdown require a subsequent explicit user instruction.

## 3. Hardware-free reviewer workflow

1. Import the plugin, start a new session and inspect MCP status.
2. Run `/phyagentos:env`; absent Dora is reported, not installed automatically.
3. Run `/phyagentos:skills robot` to exercise anonymous Registry search and local listing.
4. Search node repositories, obtain an actual artifact ID, then call `forge_node_info` and `forge_node_source`; verify the pinned commit returned. Never guess an artifact ID.
5. Full simulation requires the separate real Linux MuJoCo row above.

Network speed is not a fixed acceptance-duration guarantee. Preserve failures without silently changing registries or source mirrors.

## 4. Release evidence

| Deliverable | Evidence required | Status |
|---|---|---|
| CI | Full matrix results for the repaired commit | Verify after push |
| Host acceptance | Completed matrix and redacted logs | Not executed |
| Release | Immutable tag/URL matching the accepted commit and version | Maintainer publication pending |
| Marketplace application | Maintainer contact, desktop/cli scope, reproduction steps, receipt | Maintainer submission pending |
| Marketplace approval | Official decision or published listing | Unconfirmed |

Phase-two HTTP MCP, a public hosted Gateway and optional upstream feature PRs are outside this first release scope.
