const { createClient } = require('contentful')
const apiConfig = require('./api/config')
const { flattenIssue } = require('./helpers/parsers')

function getIssues () {
  const client = createClient({
    space: apiConfig.space,
    accessToken: apiConfig.accessToken,
    host: apiConfig.host
  })

  return client.getEntries({
    content_type: apiConfig.contentTypes.issues
  })
}

const create = async feed => {
  feed.options = {
    title: 'Vue.js Brasil',
    link: 'https://news.vuejs.org/feed.xml',
    description: 'Comunidade brasileira de Vue.js',
    image: 'http://news.vuejs.org/logo.png',
    favicon: 'http://news.vuejs.org/logo.png',
    author: {
      name: 'Comunidade brasileira de Vue.js',
      email: 'hello@igorluiz.me ',
      link: 'https://twitter.com/vuejs_brasil'
    }
  }

  const { items } = await getIssues()

  items.map(flattenIssue).forEach(issue => {
    feed.addItem({
      title: issue.name,
      id: issue.issueNumber,
      link: `https://news.vuejs.org/issues/${issue.issueNumber}`,
      description: issue.description
    })
  })
}

let modules = [
  ['@nuxtjs/google-analytics', { id: 'UA-78373326-4' }],
  '@nuxtjs/onesignal',
  '@nuxtjs/pwa',
  '@nuxtjs/feed'
]

if (process.env.NODE_ENV !== 'production') {
  modules.push('@nuxtjs/dotenv')
}

module.exports = {
  modules,
  env: {
    SPACE: process.env.SPACE,
    ACCESS_TOKEN: process.env.ACCESS_TOKEN,
    HOST: process.env.HOST
  },
  oneSignal: {
    init: {
      appId: 'ef270e2f-4469-4a50-965f-0ba7ea1d936f',
      allowLocalhostAsSecureOrigin: true,
      welcomeNotification: {
        disable: true
      }
    }
  },
  manifest: {
    name: 'Vue.js Brasil',
    short_name: 'Vue.js Brasil',
    lang: 'pt-BR',
    display: 'standalone',
    background: '#fff',
    description: 'Comunidade brasileira de Vue.js'
  },
  generate: {
    routes () {
      return getIssues().then(data =>
        data.items.map(item => `/issues/${item.fields.issueNumber}/`)
      )
    }
  },
  feed: [
    {
      path: 'feed.xml',
      create,
      cacheTime: 1000 * 60 * 10,
      type: 'rss2'
    }
  ],
  /*
  ** Headers of the page
  */
  head: {
    title: 'Vue.js Brasil',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Acompanhe todas as novidades da comunidade brasileira de Vue.js' },
      { property: 'og:title', content: 'Comunidade brasileira de Vue.js' },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: 'https://news.vuejs.org' },
      { property: 'og:image', content: 'https://news.vuejs.org/logo.png' },
      { property: 'og:description', content: 'Acompanhe todas as novidades da comunidade brasileira de Vue.js' },
      { 'name': 'twitter:card', content: 'summary' },
      { 'name': 'twitter:site', content: '@vuejs_brasil' },
      { 'name': 'twitter:title', content: 'Comunidade brasileira de Vue.js' },
      { 'name': 'twitter:description', content: 'Acompanhe todas as novidades da comunidade brasileira de Vue.js' },
      { 'name': 'twitter:image', content: 'https://news.vuejs.org/logo.png' }

    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/logo.png' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Dosis:500|Source+Sans+Pro:400,600', media: 'screen' }
    ]
  },
  plugins: [
    '~/plugins/font-awesome'
  ],
  css: [
    '@fortawesome/fontawesome/styles.css'
  ],
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLint on save
    */
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
