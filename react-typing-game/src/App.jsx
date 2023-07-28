import { useState, useEffect } from 'react';
import Header from './Components/Header';
import Game from './Components/Game';
import Language from './Components/Language'
import './style.css';

export default function App() {
  const [prompt, setPrompt] = useState(null);
  const [error, setError] = useState(null);
  const [nextGame, setNextGame] = useState(0)
  const languageDirectories = [
    'c',
    'cpp',
    'csharp',
    'dart',
    'go',
    'java',
    'javascript',
    'kotlin',
    'python',
    'ruby',
    'rust',
    'scala',
    'swift',
    'typescript',
  ]
  const[languages, setLanguages] = useState(languageDirectories)

  useEffect(() => {
    fetch('https://api.github.com/repos/neetcode-gh/leetcode/contents')
      .then((response) => response.json())
      .then((contents) => {
        // Get language directories
        const filteredLanguages = contents.filter(
          (item) => item.type === 'dir' && languages.includes(item.name)
        );

        // Select a random language
        const randomLanguage = filteredLanguages[Math.floor(Math.random() * filteredLanguages.length)];

        // Fetch the problems in that language
        fetch(randomLanguage.url)
          .then((response) => response.json())
          .then((problems) => {
            // Select a random problem
            const randomProblem = problems[Math.floor(Math.random() * problems.length)];

            // Fetch the code for that problem
            fetch(randomProblem.download_url)
              .then((response) => {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.text();
              })
              .then((code) => {
                // set the prompt to the code
                console.log(code);
                while (
                  code.startsWith(' ') ||
                  code.startsWith('/*') ||
                  code.startsWith('\n') ||
                  code.startsWith('//') ||
                  code.startsWith('#')
                ) {
                  if (code.startsWith(' ') || code.startsWith('\n')) {
                    code = code.substring(1);
                  } else if (code.startsWith('//') || code.startsWith('#')) {
                    code = code.substring(code.indexOf('\n'));
                  } else {
                    code = code.substring(code.indexOf('*/') + 2);
                  }
                }
                setPrompt(code.split('\n'));
              })
              .catch((error) => {
                setError(error);
              });
          })
          .catch((error) => {
            setError(error);
          });
      })
      .catch((error) => {
        setError(error);
      });
  }, [nextGame, languages]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const [timeLimit, setTimeLimit] = useState(30)
  const [timerStarted, setTimerStarted] = useState(false);
  const [time, setTime] = useState(timeLimit);
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    setTime(timeLimit)
  }, [timeLimit])

  useEffect(() => {
    let interval;

    if (timerStarted) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    }

    if (time === 0) {
      clearInterval(interval);
      setGameOver(true)
    }

    return () => {
      clearInterval(interval);
    };
  }, [timerStarted, time]);

  const startTimer = () => {
    setTimerStarted(true);
  };

  const [WPM, setWPM] = useState(null)
  const [accuracy, setAccuracy] = useState(null)
  const [raw, setRAW] = useState(null)

  function setWordsPerMinute(wpm) {
    if (time === 0) {
      setWPM(wpm)
    }
    else {
      const actualTime = timeLimit-time;
      const ratio = timeLimit / actualTime;
      setWPM(wpm * ratio)
    }
  }

  function setAcurracy(acc) {
    setAccuracy(acc)
  }

  function setRaw(raw) {
    if (time === 0) {
      setRAW(raw)
    }
    else {
      const actualTime = timeLimit-time;
      const ratio = timeLimit / actualTime;
      setRAW(Math.round(raw * ratio))
    }
  }

  function endGame() {
    setGameOver(true)
  }

  function goNextGame() {
    setNextGame(prevGame => prevGame+1)
    setGameOver(false)
    setPrompt(null)
    setTimerStarted(false)
    setTime(timeLimit)
  }

  const arraysEqual = (arr1, arr2) => {
    return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
  }

  function handleLanguages(language) {
    setPrompt(null)
    if (arraysEqual(languages, languageDirectories)) {
      setLanguages([language])
    } else if (languages.includes(language)) {
      if (arraysEqual(languages, [language])) {
        setLanguages(languageDirectories)
      } else {
        setLanguages(prevLanguages => prevLanguages.filter(lang => lang !== language))
      }
    } else {
      setLanguages(prevLanguages => [...prevLanguages, language])
    }
  }

  return (
    <main >
      <Header />
      {!timerStarted && <div id='selection'>
        <div id='language'>
          <button className={arraysEqual(languages,languageDirectories) ? 'current' : ''} 
            onClick={() => setLanguages(languageDirectories)}>random</button>
          <div id="spacer" style={{marginTop: 5 + 'px'}}></div>
          {languageDirectories.map((language, index) => (
            <Language 
              key={index}
              language={language}
              arraysEqual={arraysEqual(languages,languageDirectories)} 
              includes={languages.includes(language)}
              handleLanguages={handleLanguages}
            />
          ))}
        </div>
        <div id='time'>
          <button className={timeLimit === 15 ? 'current' : ''} onClick={() => setTimeLimit(15)}>15</button>
          <button className={timeLimit === 30 ? 'current' : ''} onClick={() => setTimeLimit(30)}>30</button>
          <button className={timeLimit === 60 ? 'current' : ''} onClick={() => setTimeLimit(60)}>60</button>
          <button className={timeLimit === 120 ? 'current' : ''} onClick={() => setTimeLimit(120)}>120</button>
        </div>
      </div>}
      {timerStarted && !gameOver && <h2 className="timer">{time}</h2>}
      {gameOver && (
        <h2 className="stats">
          <span style={{ marginRight: '80px' }}>WPM: {WPM}</span>
          <span style={{ marginRight: '80px' }}>Acc: {accuracy}%</span>
          <span>Raw: {raw}</span>
        </h2>
      )}
      {prompt ? <Game 
        prompt={prompt} 
        startTimer={startTimer}
        gameOver={gameOver}
        timeLimit={timeLimit}
        setWordsPerMinute={setWordsPerMinute}
        setAccuracy={setAcurracy}
        setRaw={setRaw}
        endGame={endGame}
       /> : <div id='game'>Loading</div>}
       {gameOver && <div id="nextGame"><svg  className="next" onClick={goNextGame} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
          <span id="hoverText" >Next test</span></div>}
    </main>
  );
}

