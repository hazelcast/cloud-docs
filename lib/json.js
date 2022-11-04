'use strict'

module.exports.register = function () {
    let content
    this
        .on('documentsConverted', ({contentCatalog}) => {
            content = contentCatalog.findBy({family: 'page'}).reduce((acc, item) => {
                const urlVideo = item.asciidoc.attributes['cloud-url-video']
                const category = item.asciidoc.attributes['cloud-category']
                const order = item.asciidoc.attributes['cloud-order']
                if (category) {
                    acc.push({
                        title: item.title,
                        url: urlVideo ?? item.pub.url,
                        category,
                        type: urlVideo ? 'video' : 'article',
                        order: order ?? 0
                    })
                }
                return acc
            }, [])
        })
        .on('beforePublish', ({siteCatalog}) => {
            siteCatalog.addFile({contents: Buffer.from(JSON.stringify(content)), out: {path: 'api/all.json'}})
        })
}
