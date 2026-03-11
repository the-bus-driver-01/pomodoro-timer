import { useState, useEffect } from 'react'
import Head from 'next/head'
import Timer from '@/components/Timer'
import SettingsPanel from '@/components/SettingsPanel'
import { useSettings } from '@/hooks/useSettings'
import styles from '@/styles/Home.module.css'

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { settings } = useSettings()

  return (
    <>
      <Head>
        <title>Pomodoro Timer</title>
        <meta name="description" content="A simple pomodoro timer to boost productivity" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Pomodoro Timer</h1>

          <Timer
            workDuration={settings.workDuration}
            breakDuration={settings.breakDuration}
          />

          <button
            className={styles.settingsButton}
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
          >
            ⚙️ Settings
          </button>
        </div>

        {isSettingsOpen && (
          <SettingsPanel
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </main>
    </>
  )
}