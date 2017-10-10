import PageProcessor from './PageProcessor'

export default class TheNewsLensPageProcessor extends PageProcessor {
  parsePageAsync = async () => {
    const article = await this.getArticleAsync()

    let { content } = article

    content = content.replace(/src="[^"]+" src-lg=/g, 'src=')
    content = content.replace(/src-lg=/g, 'src=')

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
