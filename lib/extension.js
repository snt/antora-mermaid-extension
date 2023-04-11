'use strict'

// based on https://gitlab.com/djencks/antora-generic-svg/-/blob/master/lib/extension.js

module.exports.register = (context, {config}) => {
    context.on('uiLoaded', appendMermaidScript(config))
    context.on('contentClassified', appendBlockProcessor)
}

const DEFAULT_MERMAID_LIBRARY_URL = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs'
const DEFAULT_SCRIPT_STEM = 'header-scripts'
const DEFAULT_MERMAID_INITIALIZE_OPTIONS = {startOnLoad: true}

const SCRIPT_PARTIAL_PATH = 'partials/mermaid-script.hbs'

const appendBlockProcessor = ({siteAsciiDocConfig}) => {
    if (!siteAsciiDocConfig.extensions) siteAsciiDocConfig.extensions = []
    // noinspection JSUnusedGlobalSymbols
    siteAsciiDocConfig.extensions.push({
        register: (registry, _context) => {
            registry.block("mermaid", processMermaidBlock)
            return registry
        }
    })
};

const appendMermaidScript = (config) => ({uiCatalog}) => {

    // noinspection JSUnresolvedVariable
    const mermaidLibraryUrl = config.mermaidLibraryUrl || DEFAULT_MERMAID_LIBRARY_URL
    // noinspection JSUnresolvedVariable
    const scriptStem = config.scriptStem || DEFAULT_SCRIPT_STEM
    // noinspection JSUnresolvedVariable
    const mermaidInitializeOptions = JSON.stringify(config.mermaidInitializeOptions || DEFAULT_MERMAID_INITIALIZE_OPTIONS)

    // noinspection JSUnresolvedFunction
    if (uiCatalog.findByType('partial').some(({path}) => path === SCRIPT_PARTIAL_PATH)) return

    const hbsContent = `<script type="module">import mermaid from '${mermaidLibraryUrl}'; mermaid.initialize(${mermaidInitializeOptions});</script>`
    // noinspection JSUnresolvedFunction
    uiCatalog.addFile({
        contents: Buffer.from(hbsContent),
        path: SCRIPT_PARTIAL_PATH,
        // https://gitlab.com/antora/antora-lunr-extension/-/blob/79f6032ada12993e45abf391c180cc8ab8520a97/lib/index.js#L44
        stem: scriptStem, // stem=header-scripts points to `{{> header-scripts}}` in *.hbs.
        type: 'partial',
    })
}

const processMermaidBlock = (context) => {
    // noinspection JSUnresolvedFunction
    context.onContext(['listing', 'literal'])
    context.positionalAttributes(['target', 'format'])
    context.process((parent, reader, attrs) => {
        //const lineInfo = reader.$line_info()
        // noinspection JSUnresolvedFunction
        const source = reader.getLines().join('\n');
        return toBlock(attrs, parent, source, context)
    })
};
module.exports.processMermaidBlock = processMermaidBlock

const toBlock = (attrs, parent, source, context) => {
    if (typeof attrs === 'object' && '$$smap' in attrs) {
        attrs = fromHash(attrs)
    }
    // noinspection JSUnresolvedFunction
    const doc = parent.getDocument()
    // noinspection JSUnresolvedVariable
    const subs = attrs.subs
    if (subs) {
        // noinspection JSUnresolvedFunction,JSUnresolvedVariable
        source = doc.$apply_subs(attrs.subs, doc.$resolve_subs(subs))
    }
    const idAttr = attrs.id ? ` id="${attrs.id}"` : ''
    const classAttr = attrs.role ? `${attrs.role} imageblock` : `imageblock`


    // noinspection JSUnresolvedFunction,JSUnresolvedVariable
    const block = context.$create_pass_block(
        parent,
        '',
        Opal.hash(attrs));

    const title = attrs.title
    if (title) {
        block.title = title
        delete block.caption

        const caption = attrs.caption
        delete attrs.caption
        block.assignCaption(caption, 'figure')
    }

    const titleElement = title ? `<div class="title">${block.caption}${title}</div>` : ''
    block.lines = [`<div${idAttr} class="${classAttr}"><div class="mermaid content" style="${Object.hasOwn(attrs, "width") ? `width: ${attrs.width};` : ""} ${Object.hasOwn(attrs, "height") ? `height: ${attrs.height};` : ""}">${source}</div>${titleElement}</div>`]

    return block
}

const fromHash = (hash) => {
    const object = {}
    // noinspection JSUnresolvedVariable
    const data = hash.$$smap
    for (const key in data) {
        object[key] = data[key]
    }
    return object
}
