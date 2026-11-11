import { execFile } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'

const run = promisify(execFile)
const uniRoot = path.resolve(import.meta.dirname, '../../../examples/uni-app-vue3')

async function verifyDependency(script: string, root = uniRoot) {
  const { stdout } = await run(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import {createRequire} from 'node:module';
    const uniRequire = createRequire(process.argv[1]);
    ${script}
  `, path.join(root, 'package.json')], {
    cwd: root,
    // Run hostile inputs outside Vitest so an unpatched regexp cannot block its worker.
    timeout: 10_000,
  })
  return JSON.parse(stdout)
}

it('keeps Uni Intlify dotted translations while rejecting prototype pollution through its actual resolver', async () => {
  const result = await verifyDependency(`
    const sharedRequire = createRequire(uniRequire.resolve('@dcloudio/uni-cli-shared/package.json'));
    const core = sharedRequire('@intlify/core-base');
    const coreRequire = createRequire(sharedRequire.resolve('@intlify/core-base'));
    const resolver = coreRequire('@intlify/message-resolver');
    assert.equal(core.handleFlatJson, resolver.handleFlatJson);
    const messages = core.handleFlatJson({
      'greetings.hello': 'Hello {name}!',
      'greetings.nested.title': 'Nested translation',
    });
    assert.equal(resolver.resolveValue(messages, 'greetings.hello'), 'Hello {name}!');
    const context = core.createCoreContext({
      locale: 'en',
      fallbackLocale: 'en',
      messages: {en: messages},
      messageCompiler: core.compileToFunction,
    });
    const pollutionKey = 'weappPandaDependencyPolluted';
    assert.equal(Object.hasOwn(Object.prototype, pollutionKey), false);
    assert.throws(
      () => core.handleFlatJson(JSON.parse('{"__proto__.weappPandaDependencyPolluted":true}')),
      /unsafe key: __proto__/,
    );
    assert.equal(Object.hasOwn(Object.prototype, pollutionKey), false);
    console.log(JSON.stringify({
      greeting: core.translate(context, 'greetings.hello', {name: 'Panda'}),
      nested: core.translate(context, 'greetings.nested.title'),
    }));
  `)
  expect(result).toEqual({ greeting: 'Hello Panda!', nested: 'Nested translation' })
})

it('keeps Uni Express route matching and rejects long ambiguous parameter inputs within a bounded process', async () => {
  const result = await verifyDependency(`
    const pluginRequire = createRequire(uniRequire.resolve('@dcloudio/vite-plugin-uni/package.json'));
    const expressRequire = createRequire(pluginRequire.resolve('express/package.json'));
    const route = expressRequire('path-to-regexp');
    const keys = [];
    const flights = route('/flights/:from-:to', keys);
    assert.deepEqual(keys.map(key => key.name), ['from', 'to']);
    assert.deepEqual(flights.exec('/flights/SFO-LAX').slice(1), ['SFO', 'LAX']);
    assert.equal(flights.test('/flights/SFO-LAX/'), true);
    assert.equal(flights.test('/flights/SFO-LAX/extra'), false);
    const docs = route('/docs/:section?', []);
    assert.equal(docs.test('/docs'), true);
    assert.equal(docs.test('/docs/api'), true);
    const assets = route('/assets/*', []);
    assert.equal(assets.exec('/assets/icons/panda.svg')[1], 'icons/panda.svg');
    const router = pluginRequire('express').Router();
    router.get('/flights/:from-:to', () => {});
    const layer = router.stack[0];
    assert.equal(layer.match('/flights/%E5%8C%97%E4%BA%AC-%E4%B8%8A%E6%B5%B7'), true);
    assert.deepEqual(layer.params, {from: '北京', to: '上海'});
    // A failed suffix makes the old two-parameter regexp try quadratic partitions.
    const adversarial = '/flights/' + '-'.repeat(100_000) + '/extra';
    assert.equal(flights.test(adversarial), false);
    assert.equal(layer.match(adversarial), false);
    console.log(JSON.stringify({parameters: keys.map(key => key.name), longInputRejected: true}));
  `)
  expect(result).toEqual({ parameters: ['from', 'to'], longInputRejected: true })
})

it.each([
  ['uni-app-vue3', '@dcloudio/uni-cli-shared/package.json'],
  ['taro-app', '@tarojs/cli/package.json'],
  ['taro-app-vue3', '@tarojs/cli/package.json'],
])('keeps %s ZIP reads and extraction while rejecting symlink escapes and false output sizes', async (workspace, parent) => {
  const result = await verifyDependency(`
    import fs from 'node:fs';
    import os from 'node:os';
    import path from 'node:path';
    const parentRequire = createRequire(uniRequire.resolve(${JSON.stringify(parent)}));
    const AdmZip = parentRequire('adm-zip');
    const archive = new AdmZip(undefined, {method: 8});
    const content = 'Panda archive content'.repeat(100);
    archive.addFile('nested/data.txt', Buffer.from(content));
    const bytes = archive.toBuffer();
    const zip = new AdmZip(bytes);
    assert.equal(zip.readAsText('nested/data.txt'), content);
    const readAsync = entry => new Promise((resolve, reject) => {
      entry.getDataAsync((data, error) => error ? reject(error) : resolve(data));
    });
    assert.equal((await readAsync(zip.getEntry('nested/data.txt'))).toString(), content);
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'weapp-zip-security-'));
    try {
      const destination = path.join(root, 'output');
      zip.extractAllTo(destination);
      assert.equal(fs.readFileSync(path.join(destination, 'nested/data.txt'), 'utf8'), content);
      fs.rmSync(path.join(destination, 'nested'), {recursive: true});
      const outside = path.join(root, 'outside');
      fs.mkdirSync(outside);
      fs.symlinkSync(outside, path.join(destination, 'nested'), process.platform === 'win32' ? 'junction' : 'dir');
      assert.throws(() => zip.extractAllTo(destination, true), /in the way/i);
      assert.equal(fs.existsSync(path.join(outside, 'data.txt')), false);
      const malformed = Buffer.from(bytes);
      const central = malformed.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
      assert(central >= 0);
      malformed.writeUInt32LE(0, central + 24);
      const invalid = new AdmZip(malformed).getEntry('nested/data.txt');
      assert.throws(() => invalid.getData(), /larger|size|length/i);
      await assert.rejects(readAsync(invalid), /larger|size|length/i);
    } finally {
      fs.rmSync(root, {recursive: true, force: true});
    }
    console.log(JSON.stringify({roundTrip: true, symlinkEscapeRejected: true, falseSizeRejected: true}));
  `, path.resolve(uniRoot, '..', workspace))
  expect(result).toEqual({ roundTrip: true, symlinkEscapeRejected: true, falseSizeRejected: true })
})
