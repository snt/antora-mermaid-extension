import test, { describe, it } from "node:test"
import { ok, strictEqual } from "node:assert"

import asciidoctor from 'asciidoctor'
import { load } from 'cheerio'
import extension from '../lib/extension.js'
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

describe('mermaidInitializeOptionsRawTextOverride behavior', () => {
    const createUiCatalog = () => {
        const addedFiles = []
        return {
            addedFiles,
            findByType: () => [],
            addFile: (file) => {
                addedFiles.push(file)
            },
        }
    }

    const executeUiLoaded = (config) => {
        const events = {}
        const warns = []
        const context = {
            on: (eventName, handler) => {
                events[eventName] = handler
            }
        }
        const originalGetLogger = extension.getLogger
        extension.getLogger = () => ({
            warn: (message) => warns.push(message)
        })

        extension.register(context, { config })

        if (originalGetLogger) {
            extension.getLogger = originalGetLogger
        } else {
            delete extension.getLogger
        }

        const uiCatalog = createUiCatalog()
        events.uiLoaded({ uiCatalog })

        return { uiCatalog, warns }
    }

    it('uses raw text override as initialize argument', () => {
        const raw = '{ startOnLoad: false, securityLevel: "strict" }'
        const { uiCatalog } = executeUiLoaded({
            mermaidInitializeOptionsRawTextOverride: raw,
        })

        strictEqual(uiCatalog.addedFiles.length, 1)
        const script = uiCatalog.addedFiles[0].contents.toString('utf8')
        ok(script.includes(`mermaid.initialize(${raw});`))
    })

    it('prefers raw text override over mermaidInitializeOptions and warns once', () => {
        const raw = '{ startOnLoad: false }'
        const { uiCatalog, warns } = executeUiLoaded({
            mermaidInitializeOptionsRawTextOverride: raw,
            mermaidInitializeOptions: { startOnLoad: true }
        })

        strictEqual(warns.length, 1)
        strictEqual(
            warns[0],
            'Both mermaidInitializeOptions and mermaidInitializeOptionsRawTextOverride are set. mermaidInitializeOptionsRawTextOverride is used.'
        )

        const script = uiCatalog.addedFiles[0].contents.toString('utf8')
        ok(script.includes(`mermaid.initialize(${raw});`))
        ok(!script.includes('mermaid.initialize({"startOnLoad":true});'))
    })

    it('does not warn when only raw text override is set', () => {
        const { warns } = executeUiLoaded({
            mermaidInitializeOptionsRawTextOverride: '{ startOnLoad: false }',
        })

        strictEqual(warns.length, 0)
    })

    it('uses mermaidInitializeOptions when raw text override is not set', () => {
        const { uiCatalog, warns } = executeUiLoaded({
            mermaidInitializeOptions: { startOnLoad: false, securityLevel: 'strict' },
        })

        strictEqual(warns.length, 0)
        strictEqual(uiCatalog.addedFiles.length, 1)

        const script = uiCatalog.addedFiles[0].contents.toString('utf8')
        ok(script.includes('mermaid.initialize({"startOnLoad":false,"securityLevel":"strict"});'))
    })
})
