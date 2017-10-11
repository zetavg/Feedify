import { JSDOM } from 'jsdom'
import PageProcessor from './PageProcessor'

import tidyHTMLAsync from '../utils/tidyHTMLAsync'

export default class TheNewsLensPageProcessor extends PageProcessor {
  parsePageAsync = async () => {
    const body = await this.getPageBodyAsync()

    const html = await tidyHTMLAsync(body)
    const dom = new JSDOM(html)

    const articleContentElement = dom.window.document.querySelector('.article-content')

    while (articleContentElement.querySelector('script')) {
      articleContentElement.querySelector('script').remove()
    }

    while (articleContentElement.querySelector('.photo-credit')) {
      articleContentElement.querySelector('.photo-credit').remove()
    }

    const articleContentImgElements = articleContentElement.getElementsByTagName('img')

    for (let i = 0; i < articleContentImgElements.length; ++i) {
      if (articleContentImgElements[i].attributes.style) {
        articleContentImgElements[i].attributes.style.value = ''
      }

      articleContentImgElements[i].attributes.src.value =
        articleContentImgElements[i].attributes['src-lg'].value
    }

    const whyNeedKnowElement = dom.window.document.querySelector('.WhyNeedKnow')

    const contents = []

    if (whyNeedKnowElement) {
      contents.push(`<blockquote>${whyNeedKnowElement.innerHTML}</blockquote>`)
    }

    contents.push(articleContentElement.innerHTML.replace(/(<\/?)h5(>)/g, '$1h3$2'))

    const content = contents.join('')

    return {
      // title: undefined,
      // author: undefined,
      // description: undefined,
      // categories: undefined,
      // date: undefined,
      // imageURL: undefined,
      content,
    }
  }
}
