# Forge Core compatibility patch

The plugin pins the published `@x-era/forge-core` version in [package.json](../package.json)
and applies the matching patch through [pnpm's patchedDependencies](../pnpm-workspace.yaml).
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
| Node archive layouts | Enforce one executable file for `executable_tar_gz`, or one same-named root with a same-named executable for `directory_tar_gz`; resolve install, cache and runtime paths consistently | `tests/archive-links.test.mjs` |
| Node archive links | Opt in to relative internal symlinks for directory node artifacts only; preflight entries, forbid writes through links, validate final targets and directory cycles, and clean failed staging | `tests/archive-links.test.mjs` |

Node `entrypoint` is a single filename for both archive types. A single-file
archive contains exactly that executable regular file. A directory archive
contains only `<entrypoint>/...`, with a regular executable at
`<entrypoint>/<entrypoint>`; its root directory header may be implicit in tar.
Directory archives are limited to 50,000 entries. Extra top-level files (including
`node.json` or checksum sidecars), linked entrypoints and unsafe names are rejected.
Previously accepted path-valued entrypoints must be repackaged to this layout.

Directory node artifacts may contain relative symbolic links whose final targets exist
inside the extracted artifact. Hard links, absolute or escaping targets, dangling
links, file and directory cycles, duplicate non-directory entries, and archive
entries below a link are rejected. Ordinary files are extracted before any links
are created. Skill bundle archives still reject all links; runtime payload copying
keeps its existing link restrictions. Node binaries run from the node store, so
their validated library links are not copied through that runtime payload path.
Windows symlink creation still depends on host privileges and needs acceptance.

Local archives supplied to `forge_skill_install_local` still receive structural and
safe-extraction validation. They have no trusted remote digest; they are not covered
by the remote-artifact digest guarantee. A checksum sidecar created beside a local
archive does not by itself establish trust.

POSIX mode assertions apply to POSIX filesystems. Windows requires the user's
private-profile ACLs and a separate host acceptance check; `chmod` is not a Windows
ACL enforcement mechanism.

## Maintenance

1. Install with `pnpm install --frozen-lockfile`; npm does not apply this pnpm patch.
2. Change the current patch with `pnpm patch @x-era/forge-core` and `pnpm patch-commit`.
3. Commit the patch, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, and rebuilt MCP file together.
4. Run `pnpm test` and `pnpm run build:check`. The bundle must include the patch.
5. When upgrading core, check which fixes are now upstream. The upgrade command first
   tests the existing patch against the requested release in a temporary checkout. If it
   conflicts, rebase against the pristine npm package, then pass the new patch as the
   second argument to `pnpm upgrade:core`. Retain the regression tests.

The upgrade to core 0.2.2 keeps upstream profile startup budgets, live lock-holder
checks and unique extraction staging directories. Kimi retains its stricter archive
preflight, pinned registry downloads, read-only shared models and runtime permissions.

Rejecting remote artifacts without integrity metadata is an intentional compatibility
change. Registry publishers must provide `sha256` and `size`; do not work around a
failure by disabling verification or retrying with unpinned metadata.
