import corsHeaders from '../constants/corsHeaders'
import template from '../templates/index.pug'

export const handler = (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {
      ...corsHeaders,
      'Content-type': 'text/html',
    },
    body: template({ hello: 'world' }),
  }

  callback(null, response)
}
