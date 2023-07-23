import { useState } from 'react'
import Token from './Token'

export default function Line(props) {
    const tokens = props.tokens.split(' ')

    return (
        <div className={`line ${props.isCurrent ? 'current' : ''}`} >
            {tokens.map((token, i) => (
                <Token 
                    token={token}
                    key={i}
                    index={i}
                    isCurrent={props.isCurrent && i === props.currentTokenIndex}
                    currentCharIndex={props.currentCharIndex}
                    correctMap={props.correctCharMap?.[i] || null}
                    isCorrect={props.correctTokenMap?.[i] || null}
                    charCursorRef={props.charCursorRef}
                    prevCursorRef={props.prevCursorRef}
                    isPrevious={props.isCurrent && i + 1 === props.currentTokenIndex}
                    tokenCursorRef={props.tokenCursorRef}
                />
            ))}
        </div>
    )
}