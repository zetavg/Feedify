import PageProcessor from './page-processors/PageProcessor'
import InsidePageProcessor from './page-processors/InsidePageProcessor'
import TheNewsLensPageProcessor from './page-processors/TheNewsLensPageProcessor'
import CodetenguIssuePageProcessor from './page-processors/CodetenguIssuePageProcessor'

const processPageAsync = async (pageURL) => {
  let processor

  if (
    pageURL.match(/^https?:\/\/www\.inside\.com\.tw/) ||
    pageURL.match(/^https?:\/\/feedproxy\.google\.com\/~r\/inside-blog-taiwan/)
  ) {
    processor = new InsidePageProcessor(pageURL)
  } else if (
    pageURL.match(/^https?:\/\/www\.thenewslens\.com\/article/) ||
    pageURL.match(/^https?:\/\/feedproxy\.google\.com\/~r\/TheNewsLens/)
  ) {
    processor = new TheNewsLensPageProcessor(pageURL)
  } else if (
    pageURL.match(/^https?:\/\/weekly\.codetengu\.com\/issues/)
  ) {
    processor = new CodetenguIssuePageProcessor(pageURL)
  } else {
    processor = new PageProcessor(pageURL)
  }

  const result = await processor.getResultAsync()
  return result
}

export default processPageAsync
