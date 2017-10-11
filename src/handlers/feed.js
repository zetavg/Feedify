import RSS from 'rss'

import processSourceAsync, { UnknownSourceTypeError } from '../processSourceAsync'
import processPageAsync from '../processPageAsync'

import corsHeaders from '../constants/corsHeaders'

const getErrorResponse = message => ({
  statusCode: 400,
  headers: {
    ...corsHeaders,
    'Content-type': 'application/json',
  },
  body: JSON.stringify({
    message,
  }, null, 2),
})

const handleRequestAsync = async (sourceType, source, { limit, expand, debug }) => {
  const sourceData = await processSourceAsync(sourceType, source, { limit, expand })

  const feed = new RSS({
    title: sourceData.title,
    description: sourceData.description,
    language: sourceData.language,
    image_url: sourceData.imageURL,
    categories: sourceData.categories,
    copyright: sourceData.copyright,
    site_url: sourceData.link,
    generator: 'aws-lambda-full-text-rss',
  })

  const itemProceedingPromises = sourceData.items.map(async (item) => {
    try {
      const result = await processPageAsync(item.url)
      const itemData = {
        ...item,
        ...result,
      }

      let content = [
        itemData.beforeContent,
        (itemData.content || itemData.description),
        itemData.afterContent,
      ].filter(x => x).join('')

      if (debug) {
        content += `<hr><pre>processingInfo = ${JSON.stringify(itemData.processingInfo, null, 2)}</pre>`
      }

      const author = [itemData.curator, itemData.author].filter(x => x).join(' / ')

      feed.item({
        title: itemData.title,
        description: content,
        url: itemData.link || itemData.url,
        guid: itemData.guid,
        categories: itemData.categories,
        author,
        date: itemData.date,
        enclosure: itemData.enclosure ||
                   (itemData.enclosures && itemData.enclosures[0]) ||
                   (itemData.sampleImageURL && { url: itemData.sampleImageURL }),
      })
    } catch (e) {
      feed.item({
        title: `Error Proceeding Page: '${item.title}'`,
        description: JSON.stringify({
          error: {
            type: e.constructor.name,
            message: e.message,
            raw: e,
          },
        }, null, 2),
        url: item.url,
        guid: `error-${item.guid || item.url}`,
        date: item.date,
        author: item.author,
      })
    }
  })

  await Promise.all(itemProceedingPromises)
  return feed.xml({ indent: true })
}

export const handler = (event, context, callback) => {
  let { source, source_type: sourceType, limit } = event.queryStringParameters || {}
  const { debug, expand } = event.queryStringParameters || {}

  if (!source) {
    const response = getErrorResponse("The query string parameter 'source' is required.")
    callback(null, response)
    return
  }

  if (!sourceType) {
    sourceType = 'feed'
  }

  if (sourceType === 'feed' && !source.match(/^https?:\/\//)) {
    source = `http://${source}`
  }

  if (!limit) {
    limit = null
  } else {
    limit = parseInt(limit, 10)
  }

  let response

  const handleSuccess = (xml) => {
    response = {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-type': 'application/rss+xml',
      },
      body: xml,
    }

    callback(null, response)
  }

  const handleError = (error) => {
    let statusCode = 500

    if (error instanceof UnknownSourceTypeError) {
      statusCode = 400
    }

    response = {
      statusCode,
      headers: {
        ...corsHeaders,
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        statusCode,
        error: error.constructor.name,
        message: error.message,
      }, null, 2),
    }

    callback(null, response)

    if (statusCode === 500) {
      throw error
    }
  }

  try {
    handleRequestAsync(sourceType, source, { limit, expand, debug }).then(handleSuccess).catch(handleError)
  } catch (e) {
    handleError(e)
  }
}
