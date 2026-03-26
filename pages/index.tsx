import React from 'react';
import Head from 'next/head';
import Timer from '../components/Timer';

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Pomodoro Timer</title>
        <meta name="description" content="A simple and effective Pomodoro timer to boost your productivity" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Timer />
    </>
  );
};

export default HomePage;