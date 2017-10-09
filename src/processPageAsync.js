import PageProcessor from './page-processors/PageProcessor'

const processPageAsync = async (pageURL) => {
  let processor

  if (pageURL.match(/https?:\/\/example\.com/)) {
    processor = new PageProcessor(pageURL)
  } else {
    processor = new PageProcessor(pageURL)
  }

  const result = await processor.getResultAsync()
  return result
}

export default processPageAsync
