# Forge Core compatibility patch

The plugin uses published `@x-era/forge-core@0.2.2` transitively through
`@x-era/dsh-forge@0.2.2 → @x-era/dsh-forge-skill@0.2.2 → @x-era/forge-core@0.2.2`.
Among Forge packages, only the DSH bundle is a direct dependency in development and
runtime manifests; Core is no longer bundled into the MCP adapter. `undici` remains
a separate direct npm dependency. Both lockfiles pin the resolved chain, which is
also recorded in `dsh-upstream.json`.
Development tests apply `patches/@x-era__forge-core@0.2.2.patch` through pnpm's `patchedDependencies`.
At first startup, the bootstrap installs locked npm dependencies into a private, versioned runtime,
copies Core to `compat-core/`, and applies the same exact patch only to that copy. The installed npm
package remains unchanged. `mcp/compatibility.json` pins each patched file's pristine and resulting
SHA256, plus the patch SHA256. No new npm package needs publishing and no upstream checkout is modified.

## Published npm coverage audit (2026-11-26)

The official npm registry's latest version at audit time was `0.2.2`, published
`2026-11-26T06:45:14.327Z`, gitHead `c936454d395ab95e491d0883b2b1a611861e814b`.
The downloaded `0.2.0`, `0.2.1` and `0.2.2` tarballs matched their registry SHA512/SHA1 values;
registry signatures were verified. Provenance digest binding was inspected, but the Sigstore
certificate/transparency chain was not independently validated.

| Existing plugin requirement | Published Core 0.2.2 coverage |
|---|---|
| Directory-node nested entrypoint; executable `lstat` | Present, but exact whole-archive layout checks are incomplete |
| Safe internal node symlinks | Partial; missing whole-archive preflight, directory-alias cycle traversal and other local restrictions |
| Failed download staging cleanup | Present; upstream uses unique staging directories |
| Mandatory remote SHA256/size and digest case normalization | Missing; `download.js` matches pristine 0.2.0 |
| Rehash cached remote skill archives | Missing; `install.js` matches pristine 0.2.0 |
| Shared model roots read-only | Missing; `bootstrap.js` matches pristine 0.2.0 |
| Private runtime permissions and payload symlink rejection | Missing |

Core `0.2.2` also adds startup-timeout and live-lock fixes. Development and the
published runtime now both lock the transitive Core to `0.2.2`, with the compatibility patch rebased onto
that exact release. The patch preserves upstream startup handling and unique node
staging directories while retaining the local archive and integrity restrictions.
The adapter's use of `ready()` and writable `jobs` still relies on JS members
that are private/readonly in the type declarations; integration tests exercise
these paths rather than relying on static API comparison alone.

Audited tarball SHA256:
- 0.2.0: `aaaf1b98ba9e530a40db89d47680d9350a4f55d8052271de23a08aa185976502`
- 0.2.1: `ca2d52d0d2eaba8c8981187e81df53724498723e3309a938a52f21bb337021b7`
- 0.2.2: `fca5d4cd302fc394e89443abe7668e40fccfe7a5a55de02fa11a75945cb2e090`

Sources: official npm registry metadata at `https://registry.npmjs.org/@x-era%2Fforge-core`,
its version-specific `dist.tarball`, `dist.integrity`, registry signatures and attestation records.
The runtime lockfile preserves official 0.2.2 SRI and all transitive package SRI values.

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
2. Audit the Core selected by the target DSH bundle and review whether each local fix is still needed. Rebase or remove fixes explicitly and retain the regression tests; do not add an independent Core dependency.
3. Run `pnpm run sync:dsh -- --check` to inspect the upstream chain, then `pnpm run sync:dsh` to apply it. To fix the target for both commands, add `--version 0.2.2`, replacing the example with the exact stable DSH bundle version. There are no scheduled checks or automatic upgrade PRs.
4. For a reviewed replacement patch, run `pnpm run sync:dsh -- --version 0.2.2 --patch /path/to/reviewed.patch`. The version selects the DSH bundle; the patch applies to its resolved transitive Core. This also supports rebuilding when package versions are unchanged.
5. Sync maintains both manifests' bundle pins, both lockfiles, `dsh-upstream.json`, patches and mappings, compatibility hashes, and generated MCP payload in a temporary candidate. It runs `pnpm test` and `pnpm run build:check` before promoting changes. Review and commit these outputs together, refresh local dependencies with `pnpm install --frozen-lockfile`, and follow the [release guide](releasing_en.md). Runtime-bootstrap tests verify npm originals stay unchanged and compatibility output matches the hashes.

Rejecting remote artifacts without integrity metadata is an intentional compatibility
change. Registry publishers must provide `sha256` and `size`; do not work around a
failure by disabling verification or retrying with unpinned metadata.
