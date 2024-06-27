import test, { describe, it } from "node:test"
import { ok, strictEqual } from "node:assert"

import asciidoctor from 'asciidoctor'
import { load } from 'cheerio'
import { processMermaidBlock as _processMermaidBlock } from '../lib/extension.js'

const Asciidoctor = asciidoctor()


describe('The extension produce inline SVG from the mermaid block', () => {
    const registry = Asciidoctor.Extensions.create()
    const processMermaidBlock = _processMermaidBlock
    registry.block("mermaid", processMermaidBlock)

    const sampleDoc = `
= Sample Document
:doctype: article
:xrefstyle: short
:figure-caption: Fig

See <<example-diagram>>.

[[example-diagram]]
.Test caption #1
[mermaid]
----
stateDiagram-v2
    direction LR
    [*] --> Still
    Still --> [*]

    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]
----
`;
    const output = Asciidoctor.convert(sampleDoc, { extension_registry: registry });

    //console.log(output)

    const html = load(output)

    test('mermaid text is stored in HTML', () => {
        const mermaidDivText = html('#example-diagram div[class="mermaid content"]').text()
        ok(mermaidDivText.includes("stateDiagram-v2"))
        ok(mermaidDivText.includes("Crash --> [*]"))
    })

    test('cross reference is valid', () => {
        strictEqual(html('a[href="#example-diagram"]').text(), "Fig 1")
        strictEqual(html('#example-diagram div[class=title]').text(), 'Fig 1. Test caption #1')
    })
});
