import React, { useRef, useState } from "react";
import { FaPlayCircle } from "react-icons/fa";
import { ImVolumeDecrease, ImVolumeIncrease } from "react-icons/im";
import getPronunciationLink from "../getPronunciationLink";
const synth = window.speechSynthesis;
import { auth, db } from "../config/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";

const Url = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

// shuffle array function when random order is selected
function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
}

function cleanDefinition(defArray, word) {
    const removeStr = word.slice(0, 4);
    const regex = new RegExp("\\S*" + removeStr + "\\S*", "gi");
    for (let i in defArray) {
        defArray[i] = defArray[i].replace(regex, "---");
    }
}

const CreateTest = ({
    words,
    setWords,
    missedWords,
    setMissedWords,
    numOfWordsSpelled,
    setNumOfWordsSpelled,
}) => {
    // set state variables variables
    const [test, setTest] = useState(false); // is user taking test
    const [i, setI] = useState(0); // index of word list
    const [text, setText] = useState(""); // user input
    const [status, setStatus] = useState(""); // whether input was right or wrong, used to color input background
    const [numberOfQuestion, setnumberOfQuestion] = useState(words.length ?? 1);
    const [volume, setVolume] = useState(2);
    const [wordListInUse, setWordListInUse] = useState([...words]); // store word list in testing order
    const [definition, setDefinition] = useState([""]);
    let initNumOfWordsRef = useRef(numOfWordsSpelled);
    const isRandom = useRef(false);

    // receive mp3 link and play audio
    async function playAudio(idx) {
        let data = await getPronunciationLink(wordListInUse[idx], API_KEY);
        console.log("Create Test");
        console.log(data);
        cleanDefinition(data.def, wordListInUse[idx]);
        setDefinition(data.def);
        if (data.status == "success") {
            // console.log(data);
            const audio = new Audio(data.link); // audio object with retrieved mp3 link
            audio.volume = (volume * 2) / 10;
            audio.play();
        } else {
            // use tts
            let ourText = wordListInUse[idx];
            const utterThis = new SpeechSynthesisUtterance(ourText);
            utterThis.rate = 0.75;
            utterThis.volume = (volume * 2) / 10;
            synth.speak(utterThis);
        }
    }

    // check if user input is correct
    const checkSpell = () => {
        // if wrong, color input box red and add word to missed word set
        if (text != wordListInUse[i]) {
            setStatus("bg-red-300");
            setMissedWords(missedWords.add(wordListInUse[i]));
        } else {
            setI(i + 1);
            setNumOfWordsSpelled(numOfWordsSpelled + 1);
            //initNumOfWordsRef.current += 1;
            setText("");
            setStatus(status == "bg-warning" ? "" : "bg-green-300");
            //setTimeout(() => alert(numOfWordsSpelled), 1000);
            //alert(numOfWordsSpelled);
            if (i + 1 >= numberOfQuestion) endTest(); // end test
            else playAudio(i + 1);
        }
    };

    // fill input with word
    const giveUp = () => {
        setStatus("bg-warning");
        setText(wordListInUse[i]);
        setMissedWords(missedWords.add(wordListInUse[i]));
    };

    const endTest = async () => {
        setTest(false);
        if (auth.currentUser) {
            const userRef = doc(db, "Users", auth.currentUser.uid);
            console.log(initNumOfWordsRef.current);
            console.log(numberOfQuestion);
            //alert(numOfWordsSpelled);
            await updateDoc(userRef, {
                numWordsSpelled:
                    parseInt(initNumOfWordsRef.current) +
                    parseInt(numberOfQuestion),
                missedWords: Array.from(missedWords),
            });
        }
    };

    const changeVolume = (num) => {
        if (volume + num < 0) setVolume(0);
        else if (volume + num > 5) setVolume(5);
        else setVolume(volume + num);
    };

    const noWords = (
        <h3 className=" text-xl px-3 py-1 mt-8 rounded-full bg-red-300 animate-bounce">
            Looks like you have chosen no words! Head over to Choose Words to
            create your list.
        </h3>
    );

    // Test creation menu
    const setupTest = (
        <div className=" flex flex-col mx-auto items-center w-1/2">
            <div className="collapse hover:scale-105 ">
                <input
                    disabled={test}
                    checked={test ? false : null}
                    type="checkbox"
                />
                <div
                    className={`collapse-title text-xl font-medium mt-6  ${
                        test ? "bg-base-300" : "bg-primary"
                    }`}
                >
                    Click me to show/hide word list
                </div>
                <div className="collapse-content border border-primary bg-gray-200">
                    <p className=" pt-2">{words.join(", ")}</p>
                    <p className=" italic pt-4">Word Count: {words.length}</p>
                </div>
            </div>
            <h3 className=" text-lg mt-6">Number of questions:</h3>
            <input
                type="number"
                placeholder=""
                min="1"
                max={words.length ?? 1}
                className="input input-bordered input-primary w-1/5 max-w-xs"
                disabled={test ?? false}
                value={numberOfQuestion ?? 0}
                onChange={(e) => setnumberOfQuestion(e.target.value)}
            />
            <div className=" flex flex-row gap-4 mt-4">
                <p>Random Order</p>
                <input
                    type="checkbox"
                    className="checkbox"
                    onChange={(e) => {
                        isRandom.current = e.target.checked;
                    }}
                />
            </div>
            <button
                onClick={() => {
                    setI(0);
                    setStatus("");
                    setTest(true);
                    if (isRandom.current) {
                        setWordListInUse(shuffle(wordListInUse));
                    }
                }}
                className={`btn btn-secondary my-12 btn-wide ${
                    test && "btn-disabled"
                }`}
            >
                Create
            </button>
        </div>
    );

    const inTest = (
        <div className=" flex flex-col mx-auto items-center w-1/2 p-4 bg-yellow-100 drop-shadow-2xl rounded-2xl mb-20">
            <hr className="my-4 mx-auto w-48 h-1 rounded border-0 md:my-10 bg-base-300" />
            <h1 className=" text-xl">
                <span className=" animate-pulse italic">
                    Test in progress...
                </span>
            </h1>
            <h1 className=" mt-4 text-2xl">
                Progress: {i + 1}/{numberOfQuestion}
            </h1>
            <progress
                className="progress w-40 h-[5px] mt-1"
                value={i + 1}
                max={numberOfQuestion}
            ></progress>
            <div className=" flex flex-row gap-4 items-center justify-center w-full mt-5">
                <FaPlayCircle
                    size={90}
                    className="text-info cursor-pointer h-fit"
                    onClick={() => playAudio(i)}
                />
                <div className=" flex flex-col items-center gap-4">
                    <ImVolumeIncrease
                        onClick={() => changeVolume(1)}
                        className=" text-md cursor-pointer hover:scale-125"
                    />
                    <ImVolumeDecrease
                        onClick={() => changeVolume(-1)}
                        className=" text-md cursor-pointer hover:scale-125"
                    />
                </div>

                <input
                    type="text"
                    spellCheck={false}
                    placeholder="Type here"
                    className={`input input-bordered input-primary w-full max-w-xs ${status}`}
                    value={text ?? ""}
                    onChange={(e) => {
                        setText(e.target.value);
                        setStatus("");
                    }}
                    onKeyDown={(e) => {
                        // key shortcuts
                        if (e.key == "Enter") checkSpell();
                        else if (e.key == "ArrowDown") playAudio(i);
                        else if (e.key == "ArrowRight") giveUp();
                    }}
                />
                <button
                    onClick={() => checkSpell()}
                    className=" btn btn-lg btn-info btn-circle text-white text-sm"
                >
                    Check
                </button>
                <button
                    onClick={() => {
                        giveUp();
                    }}
                    className=" btn btn-lg btn-warning btn-circle text-white text-sm"
                >
                    Give Up
                </button>
            </div>
            <p className=" text-xs mt-2">
                <kbd className="kbd kbd-xs">Enter</kbd> to check spelling.{" "}
                <kbd className="kbd kbd-xs">▼</kbd> to repeat.{" "}
                <kbd className="kbd kbd-xs">▶︎</kbd> to give up.
            </p>
            <div className=" text-sm mt-6 rounded-lg collapse bg-base-200">
                <input type="checkbox" />
                <div className=" collapse-title font-bold">
                    Definition:
                    <span className=" font-thin"> (Click to show/hide)</span>
                </div>
                <div className=" collapse-content">
                    {definition.map((def, i) => (
                        <p key={i} className=" text-xs mt-1 italic">
                            {def}
                        </p>
                    ))}
                </div>
            </div>

            <button
                onClick={() => endTest()}
                className="btn btn-error my-12 btn-wide"
            >
                Exit Test
            </button>
        </div>
    );

    return (
        <div>
            <div className=" h-fit w-full ">
                <div className=" max-w-screen-lg mx-auto flex flex-col items-center justify-start gap-2 py-5">
                    <h1 className=" self-center text-3xl font-bold p-2">
                        Create Test
                    </h1>
                    <h1 className=" self-center text-lg">
                        Confirm your words, select the number of questions, and
                        begin testing!
                    </h1>
                    {/* if no word list chosen, display no words prompt */}
                    {words.length == 0 ? noWords : setupTest}
                    {test && inTest}
                </div>
            </div>
        </div>
    );
};

export default CreateTest;
