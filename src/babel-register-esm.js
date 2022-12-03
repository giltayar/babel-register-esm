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
 * @param {Function} nextResolve
 * @returns {Promise<{ url: string }>}
 */
export async function resolve(specifier, context, nextResolve) {
  try {
    const x = await nextResolve(specifier, context)
    return x
  } catch (/**@type {any} */ error) {
    if (!specifier.startsWith('.') && !specifier.startsWith('/')) throw error

    const extension = path.extname(
      fileURLToPath(/**@type {import('url').URL}*/ (new URL(specifier, context.parentURL))),
    )

    if (error.code === 'ERR_MODULE_NOT_FOUND' && extension === '.js') {
      const specifierUrl = new URL(specifier, context.parentURL)
      const sameFileButTs = replaceExtension(specifierUrl, '.js', '.ts')

      const resolvedTs = await tryResolve(sameFileButTs)
      if (resolvedTs) return resolvedTs

      const sameFileButTsx = replaceExtension(specifierUrl, '.js', '.tsx')
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
      return await nextResolve(specifier, context)
    } catch (error) {
      return undefined
    }
  }
}

/**
 *
 * @param {URL} url
 * @param {string} fromExtension
 * @param {string} toExtension
 */
function replaceExtension(url, fromExtension, toExtension) {
  url.pathname = url.pathname.slice(0, -fromExtension.length) + toExtension

  return url.href
}

/**
 * @param {!(string | SharedArrayBuffer | Uint8Array)} source
 * @param {{
 *   format: string,
 *   url: string,
 * }} context
 * @param {Function} [defaultTransformSource]
 * @returns {Promise<{ source: !(string | SharedArrayBuffer | Uint8Array) }>}
 */
async function transformSource(source, context, defaultTransformSource) {
  const {url, format} = context
  if (format !== 'module' && format !== 'commonjs') {
    if (defaultTransformSource) {
      return defaultTransformSource(source, context, defaultTransformSource)
    } else {
      return {source}
    }
  }

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
    : defaultTransformSource?.(source, context, defaultTransformSource)
}

/**
 * @param {string} url
 * @param {{
 *   format: string,
 * }} context
 * @param {Function} nextLoad
 * @returns {Promise<{ source: !(string | SharedArrayBuffer | Uint8Array), format: string}>}
 */
export async function load(url, context, nextLoad) {
  const {format, source} = await nextLoad(url, context).catch(async (/** @type {any} */ error) => {
    if (error.code === 'ERR_UNKNOWN_FILE_EXTENSION') {
      return await nextLoad(url, {...context, format: 'module'})
    } else {
      throw error
    }
  })

  if (source) {
    const transformed = await transformSource(source, {format, url}, undefined)
    if (transformed) {
      return {source: transformed.source, format}
    } else {
      return {format, source}
    }
  } else {
    return {format, source}
  }
}
