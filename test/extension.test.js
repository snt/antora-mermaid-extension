'use strict'

const cheerio = require('cheerio')
const Asciidoctor = require('@asciidoctor/core')
const asciidoctor = Asciidoctor()

const extension = require('../lib/extension.js')

describe('Extension tests', () => {
    describe('The extension produce inline SVG from the mermaid block', () => {
        const registry = asciidoctor.Extensions.create()
        const processMermaidBlock = extension.processMermaidBlock
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
        const output = asciidoctor.convert(sampleDoc, {extension_registry: registry});

        //console.log(output)

        const html = cheerio.load(output)

        test('mermaid text is stored in HTML', () => {
            const mermaidDivText = html('#example-diagram div[class="mermaid content"]').text()
            expect(mermaidDivText).toContain("stateDiagram-v2")
            expect(mermaidDivText).toContain("Crash --> [*]")
        })

        test('cross reference is valid', () => {
            expect(html('a[href="#example-diagram"]').text()).toBe("Fig 1")
            expect(html('#example-diagram div[class=title]').text()).toBe('Fig 1. Test caption #1')
        })
    });
})