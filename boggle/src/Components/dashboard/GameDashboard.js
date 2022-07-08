import {Form, FormControl, InputGroup} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import {useState} from "react";
import {useTimer} from 'react-timer-hook';
import {useLocation} from "react-router-dom";
import axios from "axios";

const GameDashboard = () => {
    const {state} = useLocation()
    const [gameType, setGameType] = useState({difficulty: "0", padding: 4});
    const [guessWord, setGuessWord] = useState('');
    const [isGameStarted, setIsGameStarted] = useState(false)
    const [gridData, setGridData] = useState({alphabets: [], possibleWords: {}})
    const [correctWordList, setCorrectWordList] = useState([]);
    const [incorrectWordList, setIncorrectWordList] = useState([]);

    const expiryTimestamp = new Date();
    expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + 6); // 10 minutes timer
    const {
        seconds,
        minutes,
        hours,
        days,
        isRunning,
        start,
        pause,
        resume,
        restart
    } = useTimer({expiryTimestamp, onExpire: () => handleGameFinish(), autoStart: false});

    function handleGameFinish() {
        setIsGameStarted(false);
        setCorrectWordList([]);
        setIncorrectWordList([]);
        alert("Game finished, you guessed " + correctWordList.length + " correct words!")
    }


    function getGridData(e) {
        if (e.target.value !== '0')
            axios.post('https://bomhpls6df.execute-api.us-east-1.amazonaws.com/prod',
                {
                    gridSize: e.target.value
                })
                .then((response) => {
                    console.log("Successfully fetched")
                    console.log(response.data)
                    let words = response.data.listOfWords
                    let chars = response.data.grid
                    setGridData({
                        alphabets: chars.split(","),
                        possibleWords: Object.fromEntries(words.map(word => [word, false]))
                    })
                    console.log(gridData)
                    setIsGameStarted(true)
                    const time = new Date();
                    time.setSeconds(time.getSeconds() + 600);
                    restart(time)
                    if (response.data.gridSize === '3')
                        setGameType({difficulty: response.data.gridSize, padding: 5})
                    else if (response.data.gridSize === '4')
                        setGameType({difficulty: response.data.gridSize, padding: 4})
                    else setGameType({difficulty: response.data.gridSize, padding: 3})
                })
                .catch((error) => {
                    console.log(error)
                    console.log("Some error occurred")
                })
        else {
            setGameType({difficulty: e.target.value, padding: 4})
            setIsGameStarted(false)
        }
        setCorrectWordList([]);
        setIncorrectWordList([]);
    }

    const handleGuessWord = (e) => {
        console.log(e)
        setGuessWord(e.target.value);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (guessWord.toUpperCase() in correctWordList || guessWord.toUpperCase() in incorrectWordList) {
                alert('You have already guessed this word, please try a new guess!');
            } else if (guessWord.toUpperCase() in gridData.possibleWords) {
                setCorrectWordList(wordList => [...wordList, guessWord.toUpperCase()]);
                alert('You made a correct guess!');
            } else {
                setIncorrectWordList(wordList => [...wordList, guessWord.toUpperCase()]);
                alert('OOPS! Your guess was wrong, try again!');
            }
            setGuessWord("");
        }
    };
    return (
        <div className="grid grid-cols-3 gap-4 font-mono">
            <div>User Profile Information
                <br/>
                <label>{state.email}</label>
            </div>

            {/*https://react-bootstrap.github.io/forms/select/*/}
            <div className="m-2">

                <div className="flex flex-col">
                    <div>
                        <label>Select difficulty level to start the game:</label>
                        <Form.Select value={gameType.difficulty} onChange={getGridData}
                                     aria-label="Default select example">
                            <option value="0">Select game Type</option>
                            <option value="3">Easy</option>
                            <option value="4">Medium</option>
                            <option value="5">Hard</option>
                        </Form.Select>
                    </div>
                    <div hidden={gameType.difficulty !== '3'} className={`grid grid-cols-3 font-mono m-5 mt-2 mb-2`}>
                        {[...Array(parseInt(gameType.difficulty) * parseInt(gameType.difficulty)).fill(0)].map((_, i) => (
                            <div
                                className={`p-${gameType.padding} border-1 text-5xl font-bold border-solid  bg-yellow-400 text-center`}>
                                {gridData.alphabets[i]}
                            </div>
                        ))}
                    </div>
                    <div hidden={gameType.difficulty !== '4'} className={`grid grid-cols-4 font-mono m-5 mt-2 mb-2`}>
                        {[...Array(parseInt(gameType.difficulty) * parseInt(gameType.difficulty)).fill(0)].map((_, i) => (
                            <div
                                className={`p-${gameType.padding} border-1 text-5xl font-bold border-solid  bg-yellow-400 text-center`}>
                                {gridData.alphabets[i]}
                            </div>
                        ))}
                    </div>
                    <div hidden={gameType.difficulty !== '5'} className={`grid grid-cols-5 font-mono m-5 mt-2 mb-2`}>
                        {[...Array(parseInt(gameType.difficulty) * parseInt(gameType.difficulty)).fill(0)].map((_, i) => (
                            <div
                                className={`p-${gameType.padding} border-1 text-5xl font-bold border-solid  bg-yellow-400 text-center`}>
                                {gridData.alphabets[i]}
                            </div>
                        ))}
                    </div>
                    <InputGroup hidden={gameType.difficulty === "0" || !isGameStarted}>
                        <FormControl
                            placeholder="Guess Word"
                            aria-label="Guess Word"
                            aria-describedby="basic-addon2"
                            onChange={handleGuessWord}
                            value={guessWord}
                            onKeyDown={handleKeyDown}
                        />
                    </InputGroup>
                </div>

            </div>

            <div>
                <div style={{textAlign: 'center'}} hidden={!isGameStarted}>
                    <div style={{fontSize: '80px'}}>
                        <span>{days}</span>:<span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
                    </div>
                </div>
                <div className="bg-white rounded-2 p-2 m-2" hidden={!isGameStarted}>
                    <table className="table-fixed border-collapse table-fixed w-full text-sm">
                        <thead>
                        <tr>
                            <th className="border-b p-2 text-center">Correct Words</th>
                            <th className="border-b p-2 text-center">Incorrect Words</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td className="border-r">{correctWordList.toString()}</td>
                            <td className="p-2">{incorrectWordList.toString()}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default GameDashboard;
