import 'regenerator-runtime/runtime'
import '../styles/globals.css'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import { Provider } from 'jotai'
import '../src/i18n'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>TalkBoostAI</title>
        <meta
          name="description"
          content="TalkBoostAI is a web application that utilizes AI to help you improve your English speaking and conversation skills."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Provider>
        <Component {...pageProps} />
      </Provider>
    </>
  )
}

export default MyApp
