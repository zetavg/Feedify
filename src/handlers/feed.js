import processSourceAsync, { UnknownSourceTypeError } from '../processSourceAsync'

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

  return JSON.stringify(sourceData)
const handleRequestAsync = async (sourceType, source, { limit }) => {
  const sourceData = await processSourceAsync(sourceType, source, { limit })
}

export const handler = (event, context, callback) => {
  let { source, source_type: sourceType, limit } = event.queryStringParameters || {}

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
    limit = 1000
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
    handleRequestAsync(sourceType, source, { limit }).then(handleSuccess).catch(handleError)
  } catch (e) {
    handleError(e)
  }
}
