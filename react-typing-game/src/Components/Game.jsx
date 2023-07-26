import {useState, useEffect, useRef} from "react"
import Line from "./Line"

export default function Game(props) {
    const prevCursorRef = useRef(null)
    const charCursorRef = useRef(null)
    const tokenCursorRef = useRef(null)
    const [cursorPosition, setCursorPosition] = useState(null)
    const [currentLineIndex, setCurrentLineIndex] = useState(0)
    const [currentTokenIndex, setCurrentTokenIndex] = useState(0)
    const [currentCharIndex, setCurrentCharIndex] = useState(0)
    const [charCorrectMap, setCharCorrectMap] = useState({})
    const [tokenCorrectMap, setTokenCorrectMap] = useState({})
    const [linePosition, setLinePosition] = useState(0)
    const [lines, setLines] = useState(props.prompt.filter(line => line.trim() !== '').map(line => {
        const modifiedLine = line.replace(/\t/g, '    ')
        return modifiedLine
    }));
    const originalLines = props.prompt.filter(line => line.trim() !== '').map(line => {
        const modifiedLine = line.replace(/\t/g, '    ')
        return modifiedLine;
    })


    useEffect(() => {
        charCursorRef.current = document.getElementById('cursor')
        prevCursorRef.current = document.querySelector('.char')
        tokenCursorRef.current = document.querySelector('.token')
    }, []);


    function handleTyping(e) {
        const key = e.key
        const currentLine = lines[currentLineIndex].split(' ')
        const currentToken = currentLine[currentTokenIndex]
        const isChar = key.length === 1 && key !== ' '
        const isSpace = key === ' '
        const isNewLine = key === 'Enter'
        const isBackspace = key === 'Backspace'
        const currentChar = currentCharIndex === currentToken.length 
            ? currentTokenIndex+1 === currentLine.length ? 'Enter' : ' '
            : currentToken[currentCharIndex]

        if (props.gameOver) {
            setCurrentCharIndex(0)
            setCurrentLineIndex(0)
            setCurrentTokenIndex(0)
            return
        }
        
        if (currentLineIndex === 0 && currentTokenIndex === 0 && currentCharIndex === 0) {
           if (!isChar) {
            return
           } else {
            props.startTimer()
           }
        }
        
        //console.log({key, currentChar, charCursorRef, prevCursorRef})
        //console.log({currentCharIndex, currentToken})
        //console.log({currentLine, currentToken, currentChar})

        if (isChar) {
            if (key === currentChar) { //correct character typed
                updateCharMap(true, currentTokenIndex, currentCharIndex)
                setCurrentCharIndex(prevCharIndex => prevCharIndex+1)
            } else if (currentChar === ' ' || currentChar === 'Enter') { //expected space or enter but got extra character
                let i = 0//need i to be the index of the last character in the string form of the line
                let spaces = 0
                while (spaces < currentTokenIndex+1 && i <= lines[currentLineIndex].length) {
                    if (lines[currentLineIndex][i] === ' ') {
                        spaces++
                    }
                    i++
                }
                setLines(prevLines =>
                    prevLines.map((line, index) =>
                      index === currentLineIndex
                        ? prevLines[currentLineIndex].slice(0, i-1) +
                          key +
                          prevLines[currentLineIndex].slice(i-1)
                        : line
                    )
                )
                updateCharMap(false,currentTokenIndex, currentCharIndex)
                setCurrentCharIndex(prevCharIndex => prevCharIndex+1)
            } else { //wrong letter typed
                updateCharMap(false,currentTokenIndex, currentCharIndex)
                setCurrentCharIndex(prevCharIndex => prevCharIndex+1)
            }
            if (currentCharIndex + 1 >= currentToken.length) {
                setCursorPosition((prevPosition) => ({
                    ...prevPosition,
                    left: charCursorRef.current?.getBoundingClientRect().right - 1 || 
                    prevCursorRef.current.getBoundingClientRect().right + 12
                    }))
            }
        } else if (isSpace) {
            if (currentChar !== ' ' && currentChar !== 'Enter') { //expected letter but got space
                updateCharMap(false, currentTokenIndex, currentCharIndex)
                updateTokenMap(false, currentLineIndex, currentTokenIndex)
                setCurrentTokenIndex(prevTokenIndex => prevTokenIndex+1)
                if (currentTokenIndex + 1 === currentLine.length) {
                    setCurrentLineIndex(prevLineIndex => prevLineIndex + 1)
                    let i = 0
                    while (lines[currentLineIndex+1].split(' ')[i] === '') {
                        i++
                    }
                    setCurrentTokenIndex(i)
                    if (currentLineIndex > 0) {
                        setLinePosition(prevLinePosition => prevLinePosition - 35)
                    }
                }
            } else if (currentChar !== ' ') { //expected 'Enter' but got space, same result as if pressed 'Enter'
                for (let i = 0; i < currentCharIndex; i++) {
                    if (charCorrectMap[currentLineIndex][currentTokenIndex][i] < 0) {
                        updateTokenMap(false, currentLineIndex, currentTokenIndex)
                        break
                    }
                }
                setCurrentLineIndex(prevLineIndex => prevLineIndex + 1)
                let i = 0
                while (lines[currentLineIndex+1].split(' ')[i] === '') {
                    i++
                }
                setCurrentTokenIndex(i)
                if (currentLineIndex > 0) {
                    setLinePosition(prevLinePosition => prevLinePosition - 35)
                }
            } else { //expected space, got space
                for (let i = 0; i < currentCharIndex; i++) {
                    if (charCorrectMap[currentLineIndex][currentTokenIndex][i] < 0) {
                        updateTokenMap(false, currentLineIndex, currentTokenIndex)
                        break
                    }
                }
                setCurrentTokenIndex(prevTokenIndex => prevTokenIndex+1)
            }
            setCurrentCharIndex(0)
        } else if (isNewLine) {
            if (currentChar !== 'Enter') { //unexpected enter, skip line
                for (let i = currentTokenIndex; i < currentLine.length; i++) {
                    if (i > currentTokenIndex) {
                        for (let j  = 0; j < currentLine[i].length; j++) {
                            updateCharMap(false,i, j)
                        }
                    } else {
                        for (let j  = currentCharIndex; j < currentToken.length; j++) {
                            updateCharMap(false,i, j)
                        }
                    }
                }
            }
            for (let i = 0; i < currentCharIndex; i++) {
                if (charCorrectMap[currentLineIndex][currentTokenIndex][i] < 0) {
                    updateTokenMap(false, currentLineIndex, currentTokenIndex)
                    break
                }
            }
            setCurrentLineIndex(prevLineIndex => prevLineIndex + 1)
            let i = 0
            while (lines[currentLineIndex+1]?.split(' ')[i] === '') {
                i++
            }
            setCurrentTokenIndex(i)
            setCurrentCharIndex(0)
            if (currentLineIndex > 0) {
                setLinePosition(prevLinePosition => prevLinePosition - 35)
            }
        } else if (isBackspace) {
            if (currentCharIndex > 0) { //backsapce in middle of token
                setCurrentCharIndex(prevCharIndex => prevCharIndex-1)
                updateCharMap(null, currentTokenIndex, currentCharIndex-1)
                if (originalLines[currentLineIndex].split(' ')[currentTokenIndex].length < currentToken.length) {
                    //delete chars past original token
                    let i = 0
                    let spaces = 0
                    while (spaces < currentTokenIndex+1 && i <= lines[currentLineIndex].length) {
                        if (lines[currentLineIndex][i] === ' ') {
                            spaces++
                        }
                        i++
                    }
                    setLines(prevLines =>
                        prevLines.map((line, index) =>
                        index === currentLineIndex
                            ? prevLines[currentLineIndex].slice(0, i-2) +
                            prevLines[currentLineIndex].slice(i-1)
                            : line
                        )
                    )
                    setCursorPosition((prevPosition) => ({
                        ...prevPosition,
                        left: tokenCursorRef.current.getBoundingClientRect().right - 15
                        }))
                }
                //backsapce to previous token
            } else if (currentTokenIndex > 0 && tokenCorrectMap[currentLineIndex][currentTokenIndex-1] === -1) {
                setCurrentTokenIndex(prevTokenIndex => prevTokenIndex-1)
                setCurrentCharIndex(currentLine[currentTokenIndex-1].length)
                updateTokenMap(null, currentLineIndex, currentTokenIndex-1)
                setCursorPosition((prevPosition) => ({
                    ...prevPosition,
                    left: prevCursorRef.current.getBoundingClientRect().right - 1
                    }))
            }
        }
    }

    function updateCharMap(correct, tokenIndex, charIndex) {
        setCharCorrectMap((prevMap) => ({
            ...prevMap,
            [currentLineIndex]: {
              ...prevMap[currentLineIndex],
              [tokenIndex]: {
                ...prevMap[currentLineIndex]?.[tokenIndex],
                [charIndex]: correct ? 1 : correct === null ?  0 : -1
              }
            }
        }))
    }

    function updateTokenMap(correct, lineIndex, tokenIndex) {
        setTokenCorrectMap((prevMap) => ({
            ...prevMap,
            [lineIndex]: {
                ...prevMap[lineIndex],
                [tokenIndex]: correct ? 1 : correct === null ?  0 : -1
            }
        }))
    }

    useEffect(() => {
        if (props.gameOver) {
            let totalWords = 0
            for (let i = 0; i < currentLineIndex+1; i++) {
                let iLine = lines[i].split(' ')
                for (let j = 0; j < iLine.length; j++) {
                    if (iLine[j] !== '') {
                        totalWords++ 
                        if (i === currentLineIndex && j >= currentTokenIndex) {
                            totalWords--
                        }
                    }
                }
            }
            let incorrectWords = 0
            Object.keys(tokenCorrectMap).forEach((lineIndex) => {
                // Get the inner object (tokenIndex) corresponding to the lineIndex
                const tokenObj = tokenCorrectMap[lineIndex];
                // Iterate through the inner object's values and count occurrences of 1
                Object.values(tokenObj).forEach((tokenValue) => {
                  if (tokenValue === -1) {
                    incorrectWords++;
                  }
                });
              });
            const correctWords = totalWords-incorrectWords
            const wpm = correctWords / (props.timeLimit / 60)
            const raw = totalWords / (props.timeLimit / 60)
            props.setWordsPerMinute(wpm)
            props.setRaw(raw)
            
            let correctChars = 0
            let totalChars = 0
            Object.keys(charCorrectMap).forEach(lineIndex => {
                const tokenIndex = charCorrectMap[lineIndex]
                Object.keys(tokenIndex).forEach(tokenIndex => {
                    const char = charCorrectMap[lineIndex][tokenIndex]
                    Object.values(char).forEach(charVal => {
                        if (charVal === 1) {
                            correctChars++
                        }
                        totalChars++
                    })
                })
            })
            const accuracy = correctChars / totalChars * 100
            props.setAccuracy(Math.round(accuracy))
          }
    }, [props.gameOver])
    

    //console.log('tokenMap', tokenCorrectMap)
    //console.log('charMap', charCorrectMap)

    useEffect(() => {
        document.getElementById('game').addEventListener('keydown', handleTyping)

        return () => {
            document.getElementById('game').removeEventListener('keydown', handleTyping)
        }
    })    

    useEffect(() => {
        if (charCursorRef.current) {
            setCursorPosition({
                top: charCursorRef.current.getBoundingClientRect().top,
                left: charCursorRef.current.getBoundingClientRect().left
            });
        }
    }, [currentLineIndex, currentCharIndex, currentTokenIndex]);


    return (
            <div id="game" tabIndex="0" className={props.gameOver ? 'over' : ''}>
                <div className="text"
                    style={{
                        marginTop: `${linePosition}px`
                    }}
                >
                    {lines.map((line, index) => (
                        <Line
                            key={index}
                            isCurrent={index === currentLineIndex}
                            tokens={line}
                            index={index}
                            currentTokenIndex={currentTokenIndex}
                            currentCharIndex={currentCharIndex}
                            correctCharMap={charCorrectMap[index]}
                            correctTokenMap={tokenCorrectMap[index]}
                            charCursorRef={charCursorRef}
                            prevCursorRef={prevCursorRef}
                            tokenCursorRef={tokenCursorRef}
                        />
                    ))}
                </div>
                <div id="cursor"
                    style={{
                        position: cursorPosition?.top !== 0 ? 'fixed' : 'absolute',
                        top: cursorPosition?.top || 3,
                        left: cursorPosition?.left || 0
                    }}
                />
                <div className="focus">Click here to focus</div>
            </div>
    )
}