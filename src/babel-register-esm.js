import path from 'path'
import {fileURLToPath} from 'url'
import babel from '@babel/core'

const SUPPORTED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx']

/**
 * @param {string} specifier
 * @param {{
 *   conditions: !Array<string>,
 *   parentURL: !(string | undefined),
 * }} context
 * @param {Function} defaultResolve
 * @returns {Promise<{ url: string }>}
 */
export async function resolve(specifier, context, defaultResolve) {
  try {
    return defaultResolve(specifier, context, defaultResolve)
  } catch (/**@type {any} */ error) {
    if (!specifier.startsWith('.') && !specifier.startsWith('/')) throw error

    const extension = path.extname(specifier)

    if (error.code === 'ERR_MODULE_NOT_FOUND' && extension === '.js') {
      const sameFileButTs = specifier.replace(/\.js$/, '.ts')
      const sameFileButTsx = specifier.replace(/\.js$/, '.tsx')

      const resolvedTs = await tryResolve(sameFileButTs)
      if (resolvedTs) return resolvedTs

      const resolvedTsx = await tryResolve(sameFileButTsx)
      if (resolvedTsx) return resolvedTsx

      throw error
    } else {
      throw error
    }
  }

  /**
   * @param {string} specifier
   */
  async function tryResolve(specifier) {
    try {
      return await defaultResolve(specifier, context, defaultResolve)
    } catch (error) {
      return undefined
    }
  }
}
/**
 * @param {string} url
 * @param {Object} context
 * @param {Function} defaultGetFormat
 * @returns {Promise<{ format: string }>}
 */
export async function getFormat(url, context, defaultGetFormat) {
  const urlUrl = new URL(url)

  if (urlUrl.protocol === 'file:') {
    const extension = path.extname(fileURLToPath(url))

    if (SUPPORTED_EXTENSIONS.includes(extension)) {
      return defaultGetFormat(url.slice(0, -extension.length) + '.js', context, defaultGetFormat)
    }
  }
  return defaultGetFormat(url, context, defaultGetFormat)
}

/**
 * @param {!(string | SharedArrayBuffer | Uint8Array)} source
 * @param {{
 *   format: string,
 *   url: string,
 * }} context
 * @param {Function} defaultTransformSource
 * @returns {Promise<{ source: !(string | SharedArrayBuffer | Uint8Array) }>}
 */
export async function transformSource(source, context, defaultTransformSource) {
  const {url, format} = context
  if (format !== 'module') return defaultTransformSource(source, context, defaultTransformSource)

  const stringSource =
    typeof source === 'string'
      ? source
      : Buffer.isBuffer(source)
      ? source.toString('utf-8')
      : Buffer.from(source).toString('utf-8')

  const sourceCode = (
    await babel.transformAsync(stringSource, {
      sourceType: 'module',
      filename: fileURLToPath(url),
    })
  )?.code

  return sourceCode
    ? {
        source: sourceCode,
      }
    : defaultTransformSource(source, context, defaultTransformSource)
}
