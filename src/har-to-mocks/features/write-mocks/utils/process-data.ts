import path from 'path'
import url from 'url'
import {Entry} from '../../../types'

export const entrysToPathsWithData = (entrys: Entry[], targetPath: string) => entrys.map(entry => {
  const parsedUrl = url.parse(entry.request.url)
  const filePath = path.join(targetPath, parsedUrl.pathname ?? '')
  const fileName = `${entry.request.method.toUpperCase()}.json`
  const fileData = entry.response.content.text
  return {
    filePath,
    fileName,
    fileData,
  }
})
