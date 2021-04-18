import path from 'path'
import {describe, it} from 'mocha'
import {expect} from 'chai'
import execa from 'execa'

const __dirname = new URL('.', import.meta.url).pathname

describe('babel-register-esm (e2e)', function () {
  it('should run a file unchanged if no plugins', async () => {
    const result = await executeFileWithLoader('simple', 'nochange.js')

    expect(result.all).to.equal('hi')
  })

  it('should work with JSX', async () => {
    const result = await executeFileWithLoader('jsx', 'jsx.js')

    expect(result.all).to.equal('button')
  })

  it('should work with JSX in a .jsx file', async () => {
    const result = await executeFileWithLoader('jsx', 'jsx.jsx')

    expect(result.all).to.equal('button')
  })

  it('should work with TypeScript', async () => {
    const result = await executeFileWithLoader('typescript', 'ts.ts')

    expect(result.all).to.equal('hi')
  })

  it('should ignore ignorec files', async () => {
    expect(
      await executeFileWithLoader('jsx', 'ignored.js').catch((error) => error.message),
    ).to.include('SyntaxError')
  })

  it('should lookup babel rc files upward', async () => {
    expect((await executeFileWithLoader('subfolders/sub', 'jsx.js')).all).to.equal('button')
  })

  it('should support all kinds of babelrc files, not just json', async () => {
    expect((await executeFileWithLoader('babelrcjs', 'jsx.js')).all).to.equal('button')
  })
})

/**
 * @param {string} fixture
 * @param {string} file
 */
async function executeFileWithLoader(fixture, file) {
  return await execa(
    'node',
    ['--no-warnings', '--loader', path.resolve(__dirname, '../../src/babel-register-esm.js'), file],
    {all: true, cwd: path.resolve(__dirname, 'fixtures', fixture)},
  )
}
