const url = require('url')

// convert GitHub relative paths to full Zendesk URLs. Also, transform dashed anchors in URLs
// to Zendesk anchor's style.
const githubLinkConverter = (config) => {
  return {
    type: 'output',
    regex: /href="(.*?)"/g,
    replace: (text, link) => {
      const href = url.parse(link)

      // assume it's a relative link if hostname is not present
      if (!href.hostname) {
        const matchedArticle = config.articles.find((article) => {
          return article.path == href.pathname
        })

        if (matchedArticle) {
          const anchor = href.hash ? href.hash.replaceAll("-", "") : ""

          return `href="https://${config.domain}/hc/en-us/articles/${matchedArticle.article_id}${anchor}"`

        } else if (!href.pathname && href.hash) {
          // link to an anchor, remove `dashes`
          const anchor = href.hash.replaceAll("-", "")

          return `href="${anchor}"`
        } else {
          core.warning(
            `Found relative link: '${link}' that is not defined under articles and cannot be resolved`
          )
        }
      }

      return text
    }
  }
};

// append an extra `hljs` class to `code` elements.
const codeConverter = () => {
  return {
    type: 'output',
    regex: /<pre><code(.*?)>/g,
    replace: (text, attributes) => {
      if (!attributes) {
        return '<pre><code class="hljs">'
      } else {
        // assuming `class` is the only element attribute here.
        // I don't see how another attribute could be added from the markdown source.
        return [ text.slice(0, -2), ' hljs">' ].join("")
      }
    }
  }
};


Object.defineProperty(exports, "__esModule", {});
exports.githubLinkConverter = githubLinkConverter
exports.codeConverter = codeConverter
