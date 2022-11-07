'use strict'

module.exports.register = function ({config}) {
    let content = []
    const addEntity = ({title, url, category, type, order}) => {
        if (!config.categories.includes(category.trim())) {
            throw Error(`Wrong cloud category '${category}'`)
        }
        content.push({
            title: title && title.trim(),
            url: url && url.trim(),
            category: category && category.trim(),
            type: type && type.trim(),
            order: order ? order.trim() : 0
        })
    }
    this.on('documentsConverted', ({contentCatalog}) => {
        contentCatalog.findBy({family: 'page'}).forEach((item) => {
            const urlVideo = item.asciidoc.attributes['cloud-url-video']
            const type = urlVideo ? 'video' : 'article'
            const url = urlVideo ?? item.pub.url
            const category = item.asciidoc.attributes['cloud-category']
            const title = item.asciidoc.attributes['cloud-title']
            const order = item.asciidoc.attributes['cloud-order']
            if (category) {
                if (category.includes('|')) {
                    category.split('|').forEach((category_multi, index) => {
                        const title_multi = item.asciidoc.attributes['cloud-title'] ? item.asciidoc.attributes['cloud-title'].split('|')[index] : ''
                        const order_multi = item.asciidoc.attributes['cloud-order'] ? item.asciidoc.attributes['cloud-order'].split('|')[index] : ''
                        const anchor_multi = item.asciidoc.attributes['cloud-anchor'] ? item.asciidoc.attributes['cloud-anchor'].split('|')[index] : ''
                        addEntity({
                            title: title_multi ?? item.title,
                            url: url + (!!anchor_multi ? `#${anchor_multi.trim()}` : ''),
                            category: category_multi,
                            type,
                            order: order_multi ?? 0
                        })
                    })
                } else {
                    addEntity({
                        title: title ?? item.title,
                        url,
                        category: category,
                        type,
                        order: order ?? 0
                    })
                }
            }
        })
    })
        .on('beforePublish', ({siteCatalog}) => {
            siteCatalog.addFile({contents: Buffer.from(JSON.stringify(content)), out: {path: 'api/all.json'}})
        })
}
