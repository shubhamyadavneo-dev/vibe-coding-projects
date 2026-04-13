import PromptList from './components/PromptList'
import './App.css'

function App() {

  return (
    <>

      <div className="ticks"></div>

      {/* Main Prompt Playbook Section */}
      <section id="prompt-playbook">
          <h1>Prompt Playbook</h1>
        <PromptList />
      </section>

      <div className="ticks"></div>
      
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
