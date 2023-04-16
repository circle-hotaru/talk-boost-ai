import Head from 'next/head'
import type { NextPage } from 'next'
import Content from '~/components/Content'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>TalkBoost</title>
        <meta
          name="description"
          content="TalkBoost is a free and open-source web project that helps you practice your spoken language skills and improve your speaking ability using ChatGPT."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="h-screen p-4 pb-8 flex flex-col items-center bg-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Welcome to TalkBoost
        </h1>
        <Content />
      </main>
    </div>
  )
}

export default Home
