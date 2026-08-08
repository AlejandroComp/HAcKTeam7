import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import jazz from './assets/teamsevenfreq.png'
import teamphoto from './assets/teamphoto.jpg'
import paperBackground from './assets/sheet-music-texture.jpg'
import guitar from './assets/guitar-sticker.png'
import musicalNote from './assets/musical-note.webp'
import musicNoteSmall from './assets/nicubunu_Musical_note.webp'
import './App.css'



function App() {
  const [count, setCount] = useState(0)
const [showNote, setShowNote] = useState(false)
const noteTimer = useRef(null)

function handleCounterClick() {
  setCount((count) => count + 1)
  setShowNote(true)

  clearTimeout(noteTimer.current)

  noteTimer.current = setTimeout(() => {
    setShowNote(false)
  }, 400)
}

  return (
     <div
    className="page"
    style={{ backgroundImage: `url(${paperBackground})` }}
    >
      <section id="center">
        
      <div className="picture">
  <div className="imageArea">

  <img
    src={guitar}
    className="guitarSticker guitarLeft"
    alt=""
  />

  <img
    src={jazz}
    className="bruh"
    width="300"
    height="300"
    alt=""
  />

  <img
    src={guitar}
    className="guitarSticker guitarRight"
    alt=""
  />

  {showNote && (
    <>
      <img
        key={`left-${count}`}
        src={count % 2 === 0 ? musicalNote : musicNoteSmall}
        className={`guitarNote guitarNoteLeft ${
          count % 2 === 0 ? "bigNote" : "smallNote"
        }`}
        alt=""
      />

      <img
        key={`right-${count}`}
        src={count % 2 === 0 ? musicalNote : musicNoteSmall}
        className={`guitarNote guitarNoteRight ${
          count % 2 === 0 ? "bigNote" : "smallNote"
        }`}
        alt=""
      />
    </>
  )}

</div>


<div className="counterArea">

  <button
    type="button"
    className="counter"
    onClick={handleCounterClick}
  >
    Guitar noise {count}
  </button>
</div>
</div>
        <div>
          <h1 className="title">Team 7 Frequencies</h1>
        </div>
          
          
      <div className="team">
    
  <img
    src={teamphoto}
    className="tm"
    width="300"
    height="300"
    alt=""
  />
</div>


<div className="ticks"></div>
      <div className="introductions">
  <h2>Meet The Squad</h2>

  <p>
    <strong> Sebastian Ruesta (Bottom Right:)</strong> Hi, I'm Sebastian an electrical engineering Pre Ops participant from Pierce College. My favorite hobby is playing video games.
  </p>

  <p>
    <strong>Isaac Adegboye (Top Right):</strong> Hi I'm Isaac, an incoming Mechanical Engineering transfer from LA Trade Tech College. My favorite hobbies are archery, cars, soccer, and working out!
  </p>

  <p>
    <strong>Htet Lwin (Bottom Left):</strong> Hi I'm Htet, an incoming Computer Engineering transfer from College of San Mateo. My favorite hobbies are music, soccer, watching horror films.
  </p>

  <p>
    <strong>Alejandro Villalta (Top Left):</strong> Hi, I'm Alejandro, an electrical engineering Pre Ops participant from El Camino College. My favorite hobbies are cooking and going to the gym.
  </p>
</div>

      <div className="ticks"></div>
    <section id="spacer"></section>

  </section>
</div>
)
}

export default App

