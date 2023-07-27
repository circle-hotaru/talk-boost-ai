import Head from 'next/head'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
const Content = dynamic(() => import('~/components/Content'), { ssr: false })

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>TalkBoostAI</title>
        <meta
          name="description"
          content="TalkBoostAI is a web application that utilizes AI to help you improve your English speaking and conversation skills."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="h-screen p-4 md:py-8 flex flex-col items-center bg-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          TalkBoostAI
        </h1>

        <Content />
      </main>
    </div>
  )
}

export default Home
