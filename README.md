# Antora Mermaid Extension

**NOTE: Migration to 0.0.4 and newer might require you to update to `antora-playbook.yaml`. See [Migration to 0.0.4](#migration-to-004).**

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
      mermaid_library_url: https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs # <2>
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

## Migration to 0.0.4 and newer

If you set `.antora.extensions[].mermaid_library_url` in `antora-playbook.yaml`, update the value to use `mermaid@10`.

`antora-mermaid-extension@0.0.4` uses [`mermaid@10`](https://github.com/mermaid-js/mermaid/releases/tag/v10.0.0) which
have dropped CJS support. 
