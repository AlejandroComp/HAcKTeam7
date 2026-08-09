import { useCallback, useEffect, useRef, useState } from 'react'
import jazz from './assets/teamsevenfreq.png'
import teamphoto from './assets/teamphoto.jpg'
import paperBackground from './assets/sheet-music-texture.jpg'
import guitar from './assets/guitar-sticker.png'
import musicalNote from './assets/musical-note.webp'
import musicNoteSmall from './assets/nicubunu_Musical_note.webp'
import './App.css'

const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']

const FRIENDLY_NAMES = {
  C_MAJOR: 'C Major',
  D_MINOR: 'D Minor',
  E_MINOR: 'E Minor',
  F_MAJOR: 'F Major',
  G_MAJOR: 'G Major',
  A_MINOR: 'A Minor',
  B_DIMINISHED: 'B Diminished',
  B_MINOR: 'B Minor',
  D_MAJOR: 'D Major',
  F_SHARP_DIMINISHED: 'F# Diminished',
  E_DIMINISHED: 'E Diminished',
  G_MINOR: 'G Minor',
  B_FLAT_MAJOR: 'B-flat Major',
  COUNTRY_ROADS: 'Country Roads',
  NEVER_A: 'Verse A',
  NEVER_B: 'Verse B',
  STAND_BY_ME: 'Stand By Me',
}

function friendly(value) {
  if (!value) return '—'
  return FRIENDLY_NAMES[value] ?? value.replaceAll('_', ' ')
}

function App() {
  const [soundCount, setSoundCount] = useState(0)
  const [visualTick, setVisualTick] = useState(0)
  const [showNote, setShowNote] = useState(false)
  const [noteVariant, setNoteVariant] = useState('large')
  const [isPlaying, setIsPlaying] = useState(false)

  const [connection, setConnection] = useState('disconnected')
  const [connectionMessage, setConnectionMessage] = useState('Demo mode')
  const [mode, setMode] = useState('NOTE')
  const [noteFx, setNoteFx] = useState('CLEAN')
  const [activeNote, setActiveNote] = useState('—')
  const [selectedScale, setSelectedScale] = useState('C_MAJOR')
  const [chord, setChord] = useState('C_MAJOR')
  const [effect, setEffect] = useState('WAH')
  const [volume, setVolume] = useState(50)
  const [strumDirection, setStrumDirection] = useState('DOWN')
  const [activeKey, setActiveKey] = useState(null)
  const [activeNav, setActiveNav] = useState(null)
  const [lastEvent, setLastEvent] = useState('Waiting for an AirFret input')
  const [gyroReverse, setGyroReverse] = useState(false)

  const portRef = useRef(null)
  const readerRef = useRef(null)
  const soundSequenceRef = useRef(0)
  const noteTimerRef = useRef(null)
  const playingTimerRef = useRef(null)
  const keyTimerRef = useRef(null)
  const navTimerRef = useRef(null)

  const serialSupported =
    typeof navigator !== 'undefined' && 'serial' in navigator

  const triggerSoundVisual = useCallback((eventLabel, duration = 1600) => {
    soundSequenceRef.current += 1
    const nextSequence = soundSequenceRef.current

    setSoundCount(nextSequence)
    setVisualTick((tick) => tick + 1)
    setNoteVariant(nextSequence % 2 === 0 ? 'large' : 'small')
    setShowNote(true)
    setIsPlaying(true)
    setLastEvent(eventLabel)

    clearTimeout(noteTimerRef.current)
    clearTimeout(playingTimerRef.current)
    noteTimerRef.current = setTimeout(() => setShowNote(false), 700)
    if (duration !== null) {
      playingTimerRef.current = setTimeout(() => setIsPlaying(false), duration)
    }
  }, [])

  const flashKey = useCallback((key) => {
    setActiveKey(key)
    clearTimeout(keyTimerRef.current)
    keyTimerRef.current = setTimeout(() => setActiveKey(null), 380)
  }, [])

  const flashNavigation = useCallback((direction) => {
    setActiveNav(direction)
    clearTimeout(navTimerRef.current)
    navTimerRef.current = setTimeout(() => setActiveNav(null), 380)
  }, [])

  const handleAirFretLine = useCallback(
    (line) => {
      const cleanLine = line.trim()
      if (!cleanLine.startsWith('AIRFRET|')) return

      const [, eventType, ...values] = cleanLine.split('|')
      const [first, second, third] = values

      switch (eventType) {
        case 'READY':
          setMode(first || 'NOTE')
          setConnectionMessage('AirFret ready')
          setLastEvent('Pico connected and ready')
          break
        case 'MODE':
          setMode(first)
          setIsPlaying(false)
          setLastEvent(friendly(first) + ' mode selected')
          break
        case 'KEY':
          flashKey(first)
          setLastEvent('Key ' + first + ' pressed')
          break
        case 'NAV':
          flashNavigation(first)
          setLastEvent('Joystick ' + friendly(first).toLowerCase())
          break
        case 'NOTE_FX':
          setNoteFx(first)
          setLastEvent('Note effect: ' + friendly(first))
          break
        case 'NOTE_ON':
          setActiveNote(first)
          setNoteFx(second || 'CLEAN')
          triggerSoundVisual(first + ' · ' + friendly(second || 'CLEAN'), null)
          break
        case 'NOTE_OFF':
          setActiveNote('—')
          setIsPlaying(false)
          setLastEvent(first + ' released')
          break
        case 'SCALE':
          setSelectedScale(first)
          setLastEvent('Scale: ' + friendly(first))
          break
        case 'CHORD':
          setChord(first)
          setLastEvent('Chord: ' + friendly(first))
          break
        case 'STRUM':
          setStrumDirection(first)
          setChord(second)
          setSelectedScale(third)
          triggerSoundVisual(
            friendly(second) + ' · ' + friendly(first) + ' strum',
            3200,
          )
          break
        case 'EFFECT_SELECT':
          setEffect(first)
          setIsPlaying(false)
          setLastEvent('Effect selected: ' + friendly(first))
          break
        case 'EFFECT_PLAY':
          setEffect(first)
          triggerSoundVisual(friendly(first) + ' effect', 1800)
          break
        case 'VOLUME':
          setVolume(Number(first))
          setLastEvent('Volume ' + first + '%')
          break
        case 'GYRO_REVERSE':
          setGyroReverse(first === 'ON')
          setLastEvent('Gyro reverse ' + first.toLowerCase())
          break
        case 'STOP':
          setIsPlaying(false)
          setActiveNote('—')
          setLastEvent('Audio stopped')
          break
        default:
          break
      }
    },
    [flashKey, flashNavigation, triggerSoundVisual],
  )

  const readFromPort = useCallback(
    async (port) => {
      const decoder = new TextDecoder()
      let pendingText = ''

      while (port.readable && portRef.current === port) {
        const reader = port.readable.getReader()
        readerRef.current = reader

        try {
          while (true) {
            const { value, done } = await reader.read()
            if (done) break

            pendingText += decoder.decode(value, { stream: true })
            const lines = pendingText.split(/\r?\n/)
            pendingText = lines.pop() ?? ''
            lines.forEach(handleAirFretLine)
          }
        } catch (error) {
          if (portRef.current === port) {
            setConnection('error')
            setConnectionMessage(error.message || 'Serial connection lost')
          }
        } finally {
          reader.releaseLock()
          if (readerRef.current === reader) readerRef.current = null
        }
      }
    },
    [handleAirFretLine],
  )

  async function connectAirFret() {
    if (!serialSupported) {
      setConnection('error')
      setConnectionMessage('Use desktop Chrome or Edge for Web Serial')
      return
    }

    try {
      setConnection('connecting')
      setConnectionMessage('Choose the Raspberry Pi Pico port')
      const port = await navigator.serial.requestPort()
      await port.open({ baudRate: 115200 })
      portRef.current = port
      setConnection('connected')
      setConnectionMessage('USB connected — play AirFret')
      void readFromPort(port)
    } catch (error) {
      setConnection('disconnected')
      setConnectionMessage(
        error.name === 'NotFoundError'
          ? 'No port selected — demo mode still works'
          : error.message || 'Could not open the Pico port',
      )
    }
  }

  async function disconnectAirFret() {
    const reader = readerRef.current
    const port = portRef.current
    portRef.current = null

    try {
      if (reader) await reader.cancel()
      if (port) await port.close()
    } catch {
      // The Pico may already be disconnected; the UI still resets safely.
    }

    setConnection('disconnected')
    setConnectionMessage('Demo mode')
    setIsPlaying(false)
  }

  function handleDemoClick() {
    const nextCount = soundSequenceRef.current + 1
    const demoDirection = nextCount % 2 === 0 ? 'UP' : 'DOWN'
    const demoChords = ['C_MAJOR', 'G_MAJOR', 'A_MINOR', 'F_MAJOR']
    const demoChord = demoChords[(nextCount - 1) % demoChords.length]

    setMode('CHORD')
    setStrumDirection(demoDirection)
    setChord(demoChord)
    flashNavigation(nextCount % 2 === 0 ? 'LEFT' : 'RIGHT')
    flashKey(String(((nextCount - 1) % 8) + 1))
    triggerSoundVisual(friendly(demoChord) + ' · ' + demoDirection + ' demo strum')
  }

  useEffect(() => {
    return () => {
      clearTimeout(noteTimerRef.current)
      clearTimeout(playingTimerRef.current)
      clearTimeout(keyTimerRef.current)
      clearTimeout(navTimerRef.current)
      if (readerRef.current) void readerRef.current.cancel()
    }
  }, [])

  const signalClass = isPlaying ? 'is-playing' : 'is-idle'
  const modeClass = 'mode-' + mode.toLowerCase()
  const visibleValue =
    mode === 'NOTE'
      ? activeNote === '—'
        ? noteFx
        : activeNote
      : mode === 'FX'
        ? effect
        : friendly(chord)

  return (
    <div
      className={'page ' + modeClass}
      style={{ backgroundImage: 'url(' + paperBackground + ')' }}
    >
      <main id="center">
        <section className="heroSection" aria-label="Team 7 Frequencies">
          <div className="imageArea">
            <img
              src={guitar}
              className="guitarSticker guitarLeft"
              alt=""
              aria-hidden="true"
            />
            <img
              src={jazz}
              className="bruh"
              width="400"
              height="400"
              alt="Team 7 Frequencies artwork"
            />
            <img
              src={guitar}
              className="guitarSticker guitarRight"
              alt=""
              aria-hidden="true"
            />

            {showNote && (
              <>
                <img
                  key={'left-' + visualTick}
                  src={noteVariant === 'large' ? musicalNote : musicNoteSmall}
                  className={'guitarNote guitarNoteLeft ' + noteVariant + 'Note'}
                  alt=""
                  aria-hidden="true"
                />
                <img
                  key={'right-' + visualTick}
                  src={noteVariant === 'large' ? musicalNote : musicNoteSmall}
                  className={'guitarNote guitarNoteRight ' + noteVariant + 'Note'}
                  alt=""
                  aria-hidden="true"
                />
              </>
            )}
          </div>

          <div className="counterArea">
            <button type="button" className="counter" onClick={handleDemoClick}>
              Guitar noise {soundCount}
            </button>
            <span>Click for a demo when the Pico is not connected.</span>
          </div>
        </section>

        <div className="halfDivider" aria-hidden="true" />
        <h1 className="title">Team 7 Frequencies</h1>

        <section className={'visualizerPanel ' + signalClass}>
          <div className="visualizerHeader">
            <div>
              <p className="eyebrow">LIVE INSTRUMENT VISUALIZER</p>
              <h2>AirFret Signal Stage</h2>
              <p className="connectionMessage" aria-live="polite">
                <span className={'statusDot ' + connection} />
                {connectionMessage}
              </p>
            </div>

            <button
              type="button"
              className="serialButton"
              onClick={
                connection === 'connected' ? disconnectAirFret : connectAirFret
              }
              disabled={connection === 'connecting'}
            >
              {connection === 'connected'
                ? 'Disconnect'
                : connection === 'connecting'
                  ? 'Connecting…'
                  : 'Connect AirFret'}
            </button>
          </div>

          {!serialSupported && (
            <p className="browserNotice">
              USB connection needs desktop Chrome or Edge. The demo button works
              in every browser.
            </p>
          )}

          <div className="signalDisplay" aria-label="Animated audio signal">
            <div className="nowPlaying">
              <span>{mode} MODE</span>
              <strong>{visibleValue}</strong>
              <small>{lastEvent}</small>
            </div>

            <svg
              className="waveform"
              viewBox="0 0 760 180"
              preserveAspectRatio="none"
              role="img"
              aria-label={isPlaying ? 'AirFret sound active' : 'AirFret signal idle'}
            >
              <path className="waveGrid" d="M0 90 H760 M0 45 H760 M0 135 H760" />
              <path
                className="waveGlow"
                d="M0 90 C28 90 32 30 60 90 S92 150 120 90 S152 15 180 90 S212 165 240 90 S272 42 300 90 S332 138 360 90 S392 8 420 90 S452 172 480 90 S512 34 540 90 S572 146 600 90 S632 20 660 90 S692 160 720 90 S748 90 760 90"
              />
              <path
                className="waveLine"
                d="M0 90 C28 90 32 30 60 90 S92 150 120 90 S152 15 180 90 S212 165 240 90 S272 42 300 90 S332 138 360 90 S392 8 420 90 S452 172 480 90 S512 34 540 90 S572 146 600 90 S632 20 660 90 S692 160 720 90 S748 90 760 90"
              />
            </svg>

            <div className="equalizer" aria-hidden="true">
              {Array.from({ length: 22 }, (_, index) => (
                <span
                  key={index}
                  style={{
                    '--bar-index': index,
                    '--bar-level': 28 + ((index * 29) % 68) + '%',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="controlGrid">
            <section className="controlCard">
              <p className="cardLabel">JOYSTICK</p>
              <div className="joystickMap" aria-label="Joystick input map">
                <span className="joystickMuted">UP</span>
                <span className={activeNav === 'LEFT' ? 'activeInput' : ''}>
                  LEFT
                </span>
                <span
                  className={
                    'joystickPress ' +
                    (activeNav === 'PRESS' ? 'activeInput' : '')
                  }
                >
                  PRESS
                </span>
                <span className={activeNav === 'RIGHT' ? 'activeInput' : ''}>
                  RIGHT
                </span>
                <span className="joystickMuted">DOWN</span>
              </div>
              <p className="controlHint">
                Left/right selects. Press opens or plays performance FX.
              </p>
            </section>

            <section className="controlCard">
              <p className="cardLabel">KEYPAD</p>
              <div className="keypadMap" aria-label="Keypad input map">
                {KEYPAD_KEYS.map((key) => (
                  <span className={activeKey === key ? 'activeInput' : ''} key={key}>
                    {key}
                  </span>
                ))}
              </div>
              <p className="controlHint">1–8 select/play · 0 stops · * note · # chord</p>
            </section>

            <section className="controlCard readoutCard">
              <p className="cardLabel">CURRENT STATE</p>
              <dl className="readouts">
                <div><dt>Mode</dt><dd>{mode}</dd></div>
                <div><dt>Chord</dt><dd>{friendly(chord)}</dd></div>
                <div><dt>Scale</dt><dd>{friendly(selectedScale)}</dd></div>
                <div><dt>Note FX</dt><dd>{friendly(noteFx)}</dd></div>
                <div><dt>Perf. FX</dt><dd>{friendly(effect)}</dd></div>
                <div>
                  <dt>Gyro</dt>
                  <dd>{strumDirection}{gyroReverse ? ' · REV' : ''}</dd>
                </div>
              </dl>

              <div className="volumeReadout">
                <span>VOLUME</span>
                <div className="volumeTrack">
                  <span style={{ width: volume + '%' }} />
                </div>
                <strong>{volume}%</strong>
              </div>
            </section>
          </div>
        </section>

        <section className="teamSection">
          <img
            src={teamphoto}
            className="tm"
            width="300"
            height="300"
            alt="The Team 7 Frequencies group"
          />

          <div className="introductions">
            <h2>Meet The Squad</h2>
            <p>
              <strong>Sebastian Ruesta (Bottom Right):</strong> Hi, I&apos;m
              Sebastian, an electrical engineering Pre Ops participant from Pierce
              College. My favorite hobby is playing video games.
            </p>
            <p>
              <strong>Isaac Adegboye (Top Right):</strong> Hi, I&apos;m Isaac, an
              incoming Mechanical Engineering transfer from LA Trade Tech College.
              My favorite hobbies are archery, cars, soccer, and working out!
            </p>
            <p>
              <strong>Htet Lwin (Bottom Left):</strong> Hi, I&apos;m Htet, an
              incoming Computer Engineering transfer from College of San Mateo. My
              favorite hobbies are music, soccer, and watching horror films.
            </p>
            <p>
              <strong>Alejandro Villalta (Top Left):</strong> Hi, I&apos;m
              Alejandro, an electrical engineering Pre Ops participant from El
              Camino College. My favorite hobbies are cooking and going to the gym.
            </p>
          </div>
        </section>

        <div className="ticks" aria-hidden="true" />
        <div id="spacer" />
      </main>
    </div>
  )
}

export default App
