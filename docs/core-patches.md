# Forge Core compatibility patch

The plugin keeps the published `@x-era/forge-core@0.2.0` version and applies
`patches/@x-era__forge-core@0.2.0.patch` through pnpm's `patchedDependencies`.
No external upstream checkout is modified and no alternate core is vendored.
The patched dependency is used both by source tests and by the single-file MCP build.

## Changes and regression coverage

| Area | Change | Regression coverage |
|---|---|---|
| Remote artifacts | Require a 64-digit SHA256 and a non-negative safe-integer byte length before downloading; verify both for new downloads and cached skill archives | `tests/core-hardening.test.mjs` |
| Corrupt cache | Return `FORGE_NODE_INTEGRITY` without extracting, deleting or automatically downloading a replacement | `tests/core-hardening.test.mjs` |
| Shared models | A model root outside the default `<home>/models` is treated as read-only; managed model cache directories stay under the isolated runtime | Core regression tests and the managed MCP runtime test |
| Runtime secrets | Create the instance directory as `0700`, restrict copied files to `0600` (owner-executable files to `0700`), and explicitly restrict the injected dataflow and runtime lock | `tests/core-hardening.test.mjs` |
| Links | Treat a symlinked default model root as shared; reject symbolic links in copied runtime payloads before substitution or secret injection | `tests/core-hardening.test.mjs` |

Local archives supplied to `forge_skill_install_local` still receive structural and
safe-extraction validation. They have no trusted remote digest; they are not covered
by the remote-artifact digest guarantee. A checksum sidecar created beside a local
archive does not by itself establish trust.

POSIX mode assertions apply to POSIX filesystems. Windows requires the user's
private-profile ACLs and a separate host acceptance check; `chmod` is not a Windows
ACL enforcement mechanism.

## Maintenance

1. Install with `pnpm install --frozen-lockfile`; npm does not apply this pnpm patch.
2. Change the patch with `pnpm patch @x-era/forge-core@0.2.0` and `pnpm patch-commit`.
3. Commit the patch, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, and rebuilt MCP file together.
4. Run `pnpm test` and `pnpm run build:check`. The bundle must include the patch.
5. When upgrading core, check whether upstream incorporates each fix. Remove or
   rebase the patch explicitly, update the lockfile, and retain the regression tests.

Rejecting remote artifacts without integrity metadata is an intentional compatibility
change. Registry publishers must provide `sha256` and `size`; do not work around a
failure by disabling verification or retrying with unpinned metadata.
