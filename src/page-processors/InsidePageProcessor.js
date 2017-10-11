import PageProcessor from './PageProcessor'

export default class InsidePageProcessor extends PageProcessor {
  parsePageAsync = async () => {
    const article = await this.getArticleAsync()

    const contentElement = article.document.getElementsByClassName('post_content')[0]

    const contentImgElements = contentElement.getElementsByTagName('img')

    for (let i = 0; i < contentImgElements.length; ++i) {
      if (contentImgElements[i].attributes.style) {
        contentImgElements[i].attributes.style.value = ''
      }
    }

    const noscriptElement = contentElement.getElementsByTagName('noscript')[0]

    if (noscriptElement) {
      noscriptElement.remove()
    }

    return {
      // title: undefined,
      // author: undefined,
      // description: undefined,
      // categories: undefined,
      // date: undefined,
      // imageURL: undefined,
      content: contentElement.innerHTML,
    }
  }
}
