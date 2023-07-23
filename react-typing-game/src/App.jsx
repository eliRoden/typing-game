import { useState, useEffect } from 'react';
import Header from './Components/Header';
import Game from './Components/Game';
import './style.css';

export default function App() {
  const [prompt, setPrompt] = useState(null);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(15);
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
  ];

  useEffect(() => {
    fetch('https://api.github.com/repos/neetcode-gh/leetcode/contents')
      .then((response) => response.json())
      .then((contents) => {
        // Get language directories
        const languages = contents.filter(
          (item) => item.type === 'dir' && languageDirectories.includes(item.name)
        );

        // Select a random language
        const randomLanguage = languages[Math.floor(Math.random() * languages.length)];

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
                  console.log('in loop');
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
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <main>
      <Header />
      <h2 className="timer">{time}</h2>
      {prompt ? <Game prompt={prompt} /> : <div>Loading</div>}
    </main>
  );
}

