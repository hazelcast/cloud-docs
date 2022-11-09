'use strict'

module.exports.register = function ({config}) {
    let content = []
    const addEntity = ({title, url, categories, type, order}) => {
        const arr = categories.split(',').map(cat => cat.trim())
        if (!arr.some(name => (config.categories ?? []).includes(name))) {
            throw Error(`Wrong cloud category '${name}'`)
        }
        content.push({
            title: title && title.trim(),
            url: url && url.trim(),
            categories: arr,
            type: type && type.trim(),
            order: order ? parseInt(order) : 0
        })
    }
    (config.data ?? []).forEach(item => addEntity(item))
    this.on('documentsConverted', ({contentCatalog}) => {
        contentCatalog.findBy({family: 'page'}).forEach((item) => {
            const urlVideo = item.asciidoc.attributes['cloud-url-video']
            const type = urlVideo ? 'video' : 'article'
            const url = urlVideo ?? item.pub.url
            const categories = item.asciidoc.attributes['cloud-category']
            const title = item.asciidoc.attributes['cloud-title'] ?? item.title
            const order = item.asciidoc.attributes['cloud-order']
            if (categories) {
                if (title.includes('|')) {
                    title.split('|').forEach((title_multi, index) => {
                        const category_multi = item.asciidoc.attributes['cloud-category'].split('|')[index]
                        const order_multi = item.asciidoc.attributes['cloud-order'] ? item.asciidoc.attributes['cloud-order'].split('|')[index] : ''
                        const anchor_multi = item.asciidoc.attributes['cloud-anchor'] ? item.asciidoc.attributes['cloud-anchor'].split('|')[index] : ''
                        addEntity({
                            title: title_multi ?? item.title,
                            url: url + (!!anchor_multi ? `#${anchor_multi.trim()}` : ''),
                            categories: category_multi,
                            type,
                            order: order_multi ?? 0
                        })
                    })
                } else {
                    addEntity({
                        title,
                        url,
                        categories,
                        type,
                        order
                    })
                }
            }
        })
    })
        .on('beforePublish', ({siteCatalog}) => {
            siteCatalog.addFile({
                contents: Buffer.from(JSON.stringify({
                    categories: config.categories ?? [],
                    links: content.sort((a, b) => a.order - b.order)
                })),
                out: {path: 'api/all.json'}
            })
        })
}
