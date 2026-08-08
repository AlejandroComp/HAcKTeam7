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
    width="300"
    height="300"
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
      
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
