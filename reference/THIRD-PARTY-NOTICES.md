# Third-party notices

Actweave is licensed under `Apache-2.0`. Third-party components retain
their own licenses; inclusion in Actweave does not relicense those components.

## Copied source

No upstream source files are copied into this repository. If source is added in
the future, record the upstream repository, immutable commit, original paths,
destination paths, copyright holder, SPDX license, and required `LICENSE` or
`NOTICE` text before distribution.

## Dependencies

The DSH and Cordis packages are consumed through their published APIs. The
Actweave Host package declares the DSH rc.8 packages as peer dependencies and
uses the same versions as development dependencies for its tests. They retain
their upstream MIT notices.

The repository also uses published JavaScript packages for build and test
tasks, including TypeScript, tsdown, esbuild, tsx, `js-yaml`, and the Model
Context Protocol fixture server. Their licenses and exact versions are recorded
in `package-lock.json`; packaged distributions must retain the license files
required by each dependency.

The Agent Skills frontmatter shape follows the public Agent Skills
specification. No specification source or validator code is copied here.

External CLIs, MCP servers, HTTP services, workflow engines, credentials, and
their licenses are not bundled by Actweave. A Skill may name such a dependency,
but the dependency remains the responsibility of the host or integration that
provides it.

## Assets and trademarks

Code licenses do not grant trademark rights and do not automatically cover
logos, icons, fonts, model weights, media, sample data, or other assets. Such
material must have a separately verified license before redistribution.
