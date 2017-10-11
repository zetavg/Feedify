import { tidy } from 'htmltidy2'

const tidyHTMLAsync = html => (new Promise((resolve, reject) => {
  tidy(html, (err, resultHTML) => {
    if (err) {
      reject(err)
    } else {
      resolve(resultHTML)
    }
  })
}))

export default tidyHTMLAsync
