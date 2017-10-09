import FeedSourceProcessor from './source-processors/FeedSourceProcessor'

export class UnknownSourceTypeError extends Error {
  constructor(sourceType) {
    super(`Unknown source type: '${sourceType}'.`)
  }
}

const processSourceAsync = async (sourceType, source, { limit }) => {
  let processor

  switch (sourceType) {
    case 'feed':
      processor = new FeedSourceProcessor(source, { limit })
      break
    default:
      throw new UnknownSourceTypeError(sourceType)
  }

  const result = await processor.getResultAsync()
  return result
}

export default processSourceAsync
