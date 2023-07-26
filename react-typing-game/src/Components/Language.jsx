export default function Language(props) {

    let language;
    if (props.language === 'cpp') {
        language = 'c++'
    } else if (props.language === 'csharp') {
        language = 'c#'
    } else {
        language = props.language
    }

    return (
        <button className={!props.arraysEqual && props.includes ? 'current' : ''} 
            onClick={() => props.handleLanguages(props.language)}>{language}</button>
    )
}