export default class SourceProcessor {
  constructor(source, { limit = 1000 } = {}) {
    this.source = source
    this.limit = limit
  }

  getResultAsync = async () => {
    const sampleItem = {
      url: 'https://google.com',
      title: 'Google',
      description: 'Don\'t be eval. Leave no stone unturned.',
      guid: 'https://google.com',
      date: null,
      author: null,
      categories: [],
      enclosures: [],
    }

    return {
      title: 'Sample Title',
      description: 'Sample Description',
      items: [sampleItem],
    }
  }
}
