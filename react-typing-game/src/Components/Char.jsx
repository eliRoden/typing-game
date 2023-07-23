import React, { useState, useEffect } from "react";

export default function Char(props) {

    return (
        <span
        className={`char ${props.isCurrent ? "current" : ""} ${
            props.isCorrect>0 ? 'correct' : props.isCorrect<0 ? 'incorrect' : ''}`}
        ref={props.isCurrent ? props.charCursorRef : props.isPrevious ? props.prevCursorRef : null}
        >
        {props.char}
        </span>
    );
}