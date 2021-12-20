"use strict";

const core = require('@actions/core')
const httpm = require('@actions/http-client')
const yaml = require('js-yaml');
const fs = require('fs')
const buffer = require('buffer')
const path = require('path')
const showdown = require('showdown')
const extensions = require('./extensions')

async function validateEnvironment () {
  const configFile = core.getInput('config')

  if (!configFile) {
    return Promise.reject("You must specifiy a configuration file with `config` input")
  }

  if (!fs.existsSync(configFile)) {
    return Promise.reject(`config file ${ configFile } does not exist`)
  }

  if (!process.env.ZENDESK_TOKEN) {
    return Promise.reject(`You need to pass a valid ZENDESK_TOKEN env variable`)
  }

  const domain = core.getInput('zendesk_domain')
  if (!domain) {
    return Promise.reject("You must specificy a zendesk domain with `zendesk_domain` input")
  }

  const email = core.getInput('zendesk_admin_email')
  if (!email) {
    return Promise.reject("You must specificy a zendesk admin email with `zendesk_admin_email` input")
  }

  const basePath = path.dirname(configFile)
  const config = yaml.load(fs.readFileSync(configFile, 'utf8'));

  if(!config || !config.articles) {
    return Promise.reject(`The configuration does not include any articles`)
  }

  const client = new httpm.HttpClient()

  let buff = buffer.Buffer.from(`${email}/token:${process.env.ZENDESK_TOKEN}`)

  client.requestOptions = {
    headers: {
      'Authorization': `Basic ${ buff.toString('base64url') }`
    }
  }

  return { articles: config.articles, client, basePath, domain }
}


async function publishDocuments(config) {
  const apiBase = `https://${config.domain}/api/v2`
  const converter = new showdown.Converter(
    { extensions: [ extensions.githubLinkConverter(config), extensions.codeConverter() ] }
  )

  return Promise.all(
    config.articles.map((article) => {
      const docPath = path.join(config.basePath, article.path)
      const docContent = fs.readFileSync(docPath).toString()
      let docHTML = converter.makeHtml(docContent);

      const translationURL = path.join(apiBase, `help_center/articles/${article.article_id}/translations/en-us`)
      const translationPayload = {
        translation: {
          title: article.title,
          body: docHTML + commitInfo(),
          // mark the article as draft by defult, unless it's specifically set to a value
          draft: (article.draft === undefined ? true : article.draft)
        }
      }

      return config.client.putJson(translationURL, translationPayload).catch((error) => {
        return Promise.reject(`Failed to update article ${ article.path }: Error: ${ error }`)
      })
    })
  )
}

function commitInfo() {
  const repository = process.env.GITHUB_REPOSITORY
  const commit = process.env.GITHUB_SHA
  const actor = process.env.GITHUB_ACTOR

  return "\n<p><i>Article published with " +
         '<a href="https://github.com/zendesk/ga/tree/master/zendesk-docs">Zendesk Docs GitHub Action</a>. ' +
         `Commit <a href="https://github.com/${repository}/commits/${commit}">${commit}</a> ` +
         `by <a href="https://github.com/${actor}">${actor}</a></i></p>`

}

async function run() {
  return validateEnvironment()
    .then((config) => publishDocuments(config))
    .then(() => Promise.resolve("All articles were successfully published"))
}

Object.defineProperty(exports, "__esModule", {});
exports.run = run

try {
  if (!(process.env.NODE_ENV === "test")) {
    run()
      .then((message) => core.info(message))
      .catch((error) => core.setFailed(error))
  }
} catch (error) {
  core.setOutput('status', 'error')
  core.setFailed(`Action failed internally with error ${error}`)
}
