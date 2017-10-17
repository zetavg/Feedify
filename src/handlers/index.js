import corsHeaders from '../constants/corsHeaders'
import template from '../templates/index.pug'
import config from '../config'

const { gaTrackingID } = config

export const handler = (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {
      ...corsHeaders,
      'Content-type': 'text/html',
    },
    body: template({ gaTrackingID }),
  }

  callback(null, response)
}
