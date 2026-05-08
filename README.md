# Antora Mermaid Extension

**NOTE: If you are upgrading from a version that defaulted to `mermaid@10`, please read [Migration to v11 default](#migration-to-v11-default). Migration to 0.0.4 and newer also might require you to update `antora-playbook.yaml`. See [Migration to 0.0.4](#migration-to-004-and-newer).**

This extension visualizes [Listing Blocks](https://docs.asciidoctor.org/asciidoc/latest/verbatim/listing-blocks/)
and [Literal Blocks](https://docs.asciidoctor.org/asciidoc/latest/verbatim/literal-blocks/)
of [Mermaid](https://mermaid-js.github.io/mermaid/#/) on HTML files.

```asciidoc
[mermaid]
....
sequenceDiagram
autonumber

participant a as Alice
participant b as Bob

a ->>+ b : Hello.
b -->>- a : Hi, there.
....
```

You can also specify `width` and `height` of outer `div` of `svg` like:

```asciidoc
[mermaid,width=100%]
....
sequenceDiagram
autonumber

participant a as Alice
participant b as Bob

a ->>+ b : Hello.
b -->>- a : Hi, there.
....
```

*Better privacy*:
This extension uses `mermaid.min.js` to convert mermaid diagram text on HTML into SVG.
So the diagram texts won't be sent to anywhere to create image files.

## Configuration

### npm

Install this extension

```bash
npm i -D @sntke/antora-mermaid-extension
```

### Playbook

Append following in your `antora-playbook.yaml`:

```yaml
antora:
  extensions:
    - require: '@sntke/antora-mermaid-extension' # <1>
      mermaid_library_url: https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs # <2>
      script_stem: header-scripts # <3>
      mermaid_initialize_options: # <4>
        start_on_load: true

```

* <1> `npm` package name: `@sntke/antora-mermaid-extension` (required)
* <2> URL of Mermaid.js library (optional)
* <3> Stem that exists in the handlebar templates of UI bundle where HTML script element for `mermaid.js` is placed. (optional)
* <4> The argument to mermaid.initialize(). (optional)
      Make sure to convert the Mermaid config keys to snake case, e.g., `startOnLoad` -> `start_on_load` or `themeVariables` -> `theme_variables`.
      Refer to [the Antora docs](https://docs.antora.org/antora/latest/extend/configure-extension/#configuration-key-transformation) for details.

### ELK Layout

In Mermaid v11, the [ELK](https://eclipse.dev/elk/) layout engine was separated into the [`@mermaid-js/layout-elk`](https://www.npmjs.com/package/@mermaid-js/layout-elk) package.
If your diagrams use `layout: elk`, set `elk_library_url` to load and register it:

```yaml
antora:
  extensions:
    - require: '@sntke/antora-mermaid-extension'
      elk_library_url: https://cdn.jsdelivr.net/npm/@mermaid-js/layout-elk@0/dist/mermaid-layout-elk.esm.min.mjs
```

If you need to pass the argument to `mermaid.initialize()` as raw text rather than as a structured mapping, use `mermaid_initialize_options_raw_text_override` instead of `mermaid_initialize_options`.
Its value is placed between `mermaid.initialize(` and `)` as-is, so it must be valid JSON. You must quote the entire string with single quotes to avoid being parsed as YAML.

### Calling mermaid.run()

By default, `mermaid.run()` is not called. To call it explicitly, use `mermaid_run_options`:

```yaml
antora:
  extensions:
    - require: '@sntke/antora-mermaid-extension'
      mermaid_run_options:
        query_selector: '.mermaid'
```

The value is passed to `mermaid.run()` as a JSON-serialized argument. Make sure to convert keys to snake case as with `mermaid_initialize_options`.

If you need to pass a value that cannot be expressed as JSON (e.g., a callback function), use `mermaid_run_options_raw_text_override` instead:

```yaml
antora:
  extensions:
    - require: '@sntke/antora-mermaid-extension'
      mermaid_run_options_raw_text_override: '{ querySelector: ".mermaid", postRenderCallback: (id) => console.log(id) }'
```

Its value is placed between `mermaid.run(` and `)` as-is. If both `mermaid_run_options` and `mermaid_run_options_raw_text_override` are set, `mermaid_run_options_raw_text_override` takes precedence.

## Migration to 0.0.13 and newer

From version 0.0.13, the default `mermaidLibraryUrl` uses `mermaid@11`.
If you do not set `mermaid_library_url` explicitly, your site will now use Mermaid v11.

We recommend pinning with a semver range (`@11`) rather than a specific patch version (e.g., `@11.0.0`) to receive bug fixes within the v11 series automatically.

### ELK layout no longer bundled

In Mermaid v11, the ELK layout engine was moved to a separate package ([`@mermaid-js/layout-elk`](https://www.npmjs.com/package/@mermaid-js/layout-elk), [release notes](https://github.com/mermaid-js/mermaid/releases/tag/v11.0.0)).
If your diagrams use `layout: elk`, add `elk_library_url` to your playbook as shown in [ELK Layout](#elk-layout).
Without it, diagrams with `layout: elk` may fail to render.

### Diagram width changes for git and Sankey diagrams

Git and Sankey diagrams now default to `useMaxWidth: true` in Mermaid v11 ([release notes](https://github.com/mermaid-js/mermaid/releases/tag/v11.0.0)).
These diagrams will expand to fill the available width. To restore the previous behavior, set `useMaxWidth` explicitly in `mermaid_initialize_options`.
When configuring this from `antora-playbook.yaml`, convert the Mermaid config keys to snake case:

```yaml
mermaid_initialize_options:
  git_graph:
    use_max_width: false
  sankey:
    use_max_width: false
```

### `flowchart.htmlLabels` moved to root level

The `flowchart.htmlLabels` option was deprecated in Mermaid v11.12.3 in favor of the root-level `htmlLabels` option ([source](https://github.com/mermaid-js/mermaid/blob/v11.12.3/packages/mermaid/src/config.type.ts)).
If you use this option, update your playbook:

```yaml
# Before (deprecated)
mermaid_initialize_options:
  flowchart:
    html_labels: true

# After
mermaid_initialize_options:
  html_labels: true
```

## Migration to 0.0.4 and newer

If you set `.antora.extensions[].mermaid_library_url` in `antora-playbook.yaml`, update the value to use `mermaid@10`.

`antora-mermaid-extension@0.0.4` uses [`mermaid@10`](https://github.com/mermaid-js/mermaid/releases/tag/v10.0.0) which
have dropped CJS support.
