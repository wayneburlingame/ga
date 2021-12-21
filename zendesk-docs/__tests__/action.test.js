process.env.NODE_ENV = "test"

const nock = require("nock")
const fs = require("fs")
const path = require('path')
const action = require('../action')
const assert = require ("assert/strict")

const zdDomain = "myzendesk.zendesk.com"
const zdEmail = "staff@zendesk.com"
const zdToken =  "thetoken"
const zdMock = nock(`https://${zdDomain}`, {
  reqheaders: {
    authorization: `Basic c3RhZmZAemVuZGVzay5jb20vdG9rZW46dGhldG9rZW4`,
  },
})

// always disable all HTTP connection.
// We want to ensure we don't make API calls we don't control
nock.disableNetConnect()

let defaultEnv = {
  INPUT_CONFIG: path.join(__dirname, "fixtures/config.yml"),
  INPUT_ZENDESK_DOMAIN: zdDomain,
  INPUT_ZENDESK_ADMIN_EMAIL: zdEmail,
  ZENDESK_TOKEN: zdToken,
  GITHUB_REPOSITORY: "zendesk/example",
  GITHUB_SHA: "dec40e9dec40e9dec40e9dec40e9",
  GITHUB_ACTOR: "nogates",
}

const testMissingConfigFile = () => {
  const env = { ...defaultEnv }
  delete env.INPUT_CONFIG

  return assert.rejects(
    runWithEnv(env, action.run),
    /You must specifiy a configuration file with `config` input/
  )
}

const testConfigFileIsNotValid = () => {
  const env = { ...defaultEnv, INPUT_CONFIG: "i-dont-exist" }

  return assert.rejects(
    runWithEnv(env, action.run),
    /config file i-dont-exist does not exist/
  )
}

const testMissingZendeskDomain = () => {
  let env = { ...defaultEnv }
  delete env.INPUT_ZENDESK_DOMAIN

  return assert.rejects(
    runWithEnv(env, action.run),
    /You must specificy a zendesk domain with `zendesk_domain` input/
  )
}

const testMissingZendeskAdminEmail = () => {
  const env = { ...defaultEnv }
  delete env.INPUT_ZENDESK_ADMIN_EMAIL

  return assert.rejects(
    runWithEnv(env, action.run),
    /You must specificy a zendesk admin email with `zendesk_admin_email` input/
  )
}

const testValidEnvironment = () => {
  const env = { ...defaultEnv }

  zdMock.put(
    '/api/v2/help_center/articles/2/translations/en-us',
    {
      translation: {
        title: "Linked",
        body: "<p>Linked <em>content</em></p>\n" +
        '<p><i>Article published with ' +
        '<a href="https://github.com/zendesk/ga/tree/master/zendesk-docs">Zendesk Docs GitHub Action</a>. ' +
        'Commit <a href="https://github.com/zendesk/example/commits/dec40e9dec40e9dec40e9dec40e9">dec40e9dec40e9dec40e9dec40e9</a> ' +
        'by <a href="https://github.com/nogates">nogates</a></i></p>',
        draft: true
      }
    }).reply(200)

    zdMock.put(
      '/api/v2/help_center/articles/1/translations/en-us',
      {
        translation: {
          title: "Main",
          body: '<h1 id="title">Title</h1>\n' +
                '<p><a href="https://myzendesk.zendesk.com/hc/en-us/articles/2">link</a>\n' +
                '<a href="https://myzendesk.zendesk.com/hc/en-us/articles/2#withanchor">link2</a>\n' +
                '<a href="#onlyananchor">link3</a></p>\n' +
                '<pre><code class="yaml language-yaml hljs">a:\n  b: 1\n</code></pre>\n' +
                '<pre><code class="hljs">$ shell\n</code></pre>\n' +
                '<p><i>Article published with ' +
                '<a href="https://github.com/zendesk/ga/tree/master/zendesk-docs">Zendesk Docs GitHub Action</a>. ' +
                'Commit <a href="https://github.com/zendesk/example/commits/dec40e9dec40e9dec40e9dec40e9">dec40e9dec40e9dec40e9dec40e9</a> ' +
                'by <a href="https://github.com/nogates">nogates</a></i></p>',
          draft: false
        }
      }).reply(200)


  return assert.doesNotReject(
    runWithEnv(env, action.run)
      .then((message) => assert.equal("All articles were successfully published", message))
  )
}

// append all the tests environment variables to `process.env`
const beforeEach = (env) => {
  Object.keys(env).forEach((key) => {
    process.env[key] = env[key]
  })
}

// remove all the default environment variables from `process.env`
// and clean up any nock mock
const afterEach = () => {
  Object.keys(defaultEnv).forEach((key) => {
    delete process.env[key]
  })

  nock.cleanAll()
}

const runWithEnv = async (env, fn) => {
  beforeEach(env)

  try {
    return await fn()
  } catch(error) {
    return Promise.reject(error)
  } finally {
    afterEach()
  }
}

// Unfortunately, since we are using `process.env` because GitHub action library reads
// directly from `process.env`, we need to run the tests sequentially
[
  testMissingConfigFile,
  testConfigFileIsNotValid,
  testMissingZendeskDomain,
  testMissingZendeskAdminEmail,
  testValidEnvironment,
].reduce((promise, next) => promise.then(next), Promise.resolve())
 .then(() => console.log("all test succeeded"))
