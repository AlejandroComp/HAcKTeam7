import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import jazz from './assets/teamsevenfreq.png'
import teamphoto from './assets/teamphoto.jpg'
import './App.css'



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        
      <div className="picture">
  <img
    src={jazz}
    className="bruh"
    width="450"
    height="450"
    alt=""
  />
</div>
        <div>
          <h1>Team 7 Frequencies</h1>
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
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>
      <div className="introductions">
  <h2>Meet The Squad</h2>

  <p>
    <strong> Sebastian Ruesta (Bottom Right:)</strong> Hi, I'm Sebastian an electrical engineering Pre Ops participant from Pierce College. My favorite hobby is playing video games
  </p>

  <p>
    <strong>Isaac Adegboye (Top Right):</strong> Hi I'm Isaac, an incoming Mechanical Engineering transfer from LA Trade Tech College. My favorite hobbies are archery, cars, soccer, and working out!
  </p>

  <p>
    <strong>Htet Lwin (Bottom Left):</strong> Hi I'm Htet, an incoming Computer Engineering transfer from College of San Mateo. My favorite hobbies are music, soccer, watching horror films.
  </p>

  <p>
    <strong>Alejandro Villalta (Top Left):</strong> Hi, I'm Alejandro, an electrical engineering Pre Ops participant from El Camino College. My favorite hobbies are cooking and going to the gym
  </p>
</div>

    <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
