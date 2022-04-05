'use strict'

// based on https://gitlab.com/djencks/antora-generic-svg/-/blob/master/lib/extension.js

module.exports.register = function ({ config }) {
    const mermaidLibraryUrl = config.mermaidLibraryUrl || 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js'
    const scriptStem = config.scriptStem || 'header-scripts'

    this.on('uiLoaded', ({uiCatalog}) => {
        const scriptPartialPath = 'partials/mermaid-script.hbs'
        if(uiCatalog.findByType('partial').some(({path})=> path === scriptPartialPath)) return
        uiCatalog.addFile({
            contents: Buffer.from(`<script src="${mermaidLibraryUrl}"></script><script>mermaid.initialize({startOnLoad:true});</script>`),
            path: scriptPartialPath,
            stem: scriptStem, // stem=header-scripts points to `{{> header-scripts}}` in *.hbs.
            type: 'partial',
        })
    })

    this.on('contentClassified', ({ playbook, contentCatalog, siteAsciiDocConfig }) => {
        const register = (registry, context) =>  {
            function toBlock(attrs, parent, source, lineInfo, self) {
                if (typeof attrs === 'object' && '$$smap' in attrs) {
                    attrs = fromHash(attrs)
                }
                const doc = parent.getDocument()
                const subs = attrs.subs
                if (subs) {
                    source = doc.$apply_subs(attrs.subs, doc.$resolve_subs(subs))
                }
                const idAttr = attrs.id ? ` id="${attrs.id}"` : ''

                return self.$create_pass_block(
                    parent,
                    `<div${idAttr} class="mermaid">${source}</div>`,
                    Opal.hash({}))
            }

            registry.block("mermaid", function () {
                const self = this
                self.onContext(['listing', 'literal'])
                self.process(function (parent, reader, attrs) {
                    const lineInfo = reader.$line_info()
                    var source = reader.getLines().join('\n')
                    return toBlock(attrs, parent, source, lineInfo, self)
                })
            })

            return registry
        }

        if (!siteAsciiDocConfig.extensions) siteAsciiDocConfig.extensions = []
        siteAsciiDocConfig.extensions.push({ register })
    })
}

const fromHash = (hash) => {
    const object = {}
    const data = hash.$$smap
    for (const key in data) {
        object[key] = data[key]
    }
    return object
}
