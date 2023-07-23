import React, { useState, useEffect } from "react";
import Char from "./Char";

export default function Token(props) {
    const chars = props.token.split('')

    return (
        <div className={`token ${props.isCurrent ? "current" : ""} ${
            props.isCorrect<0 ? 'token-incorrect' : ''}`}
            ref={props.isPrevious ? props.prevCursorRef : props.isCurrent ? props.tokenCursorRef : null}
        >
            {chars.map((char, index) => (
                <Char
                    key={index}
                    char={char}
                    index={index}
                    isCurrent={props.isCurrent && index === props.currentCharIndex}
                    isPrevious={props.index === 0 ? props.isCurrent && index + 1 === props.currentCharIndex : null}
                    isCorrect={props.correctMap?.[index] || null}
                    charCursorRef={props.charCursorRef}
                    prevCursorRef={props.prevCursorRef}
                />
            ))}
        </div>
    );
}



