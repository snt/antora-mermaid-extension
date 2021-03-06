# Antora Mermaid Extension

This extension visualizes [Listing Blocks](https://docs.asciidoctor.org/asciidoc/latest/verbatim/listing-blocks/) and [Literal Blocks](https://docs.asciidoctor.org/asciidoc/latest/verbatim/literal-blocks/) of [Mermaid](https://mermaid-js.github.io/mermaid/#/) on HTML files.

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
      mermaid_library_url: https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js # <2>
      script_stem: header-scripts # <3>
      mermaid_initialize_options: "{ startOnLoad: true }" #<4>

```

* <1> `npm` package name: `@sntke/antora-mermaid-extension` (required)
* <2> URL of Mermaid.js library (optional)
* <3> Stem that exists in the handlebar templates of UI bundle where HTML script element for `mermaid.js` is placed. (optional)
* <4> The argument to mermaid.initialize(). (optional)
