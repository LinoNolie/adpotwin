import type { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>AdpotWin - Windows Adoption Helper</title>
        <meta name="description" content="A Windows adoption helper project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary-color)' }}>
          Welcome to AdpotWin
        </h1>
        <p>Your Windows adoption journey starts here</p>
      </main>
    </>
  )
}

export default Home
