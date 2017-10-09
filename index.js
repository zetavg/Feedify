const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}

export const hello = (event, context, callback) => {
  console.log(event) // Contains incoming request data (e.g., query params, headers and more)

  const response = {
    statusCode: 200,
    headers: {
      ...corsHeaders,
    },
    body: JSON.stringify({ message: 'Hello World!' }),
  }

  callback(null, response)
}
