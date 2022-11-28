import React, { useState } from "react";
import { AiFillWarning } from "react-icons/ai";
import { pageList } from "../wordData";

const ChooseWords = ({ words, setWords, inp, setInp }) => {
    // update word list for user-inputted words
    const updateWords = (s) => {
        if (s) {
            const wordArray = s.split(",");
            for (let i = 0; i < wordArray.length; i++) {
                wordArray[i] = wordArray[i].trim();
            }
            setWords(wordArray);
        }
    };

    return (
        <div>
            <div className=" h-full w-full ">
                <div className=" max-w-screen-lg mx-auto flex flex-col items-center justify-start gap-4 py-10">
                    <h1 className=" self-center text-5xl font-bold mb-10 p-2">
                        Choose Words
                    </h1>
                    <h1 className=" self-center text-2xl">
                        Type in the words you want to learn in the textbox below
                    </h1>
                    <textarea
                        className="textarea textarea-primary mt-1  w-1/2 text-sm h-40"
                        placeholder="Enter words separated by commas (e.g. cat, hat, bat...)"
                        onChange={(e) => {
                            setInp(e.target.value);
                        }}
                        value={inp}
                    ></textarea>
                    <div class="inline-flex justify-center items-center w-full">
                        <hr class="my-8 w-64 h-px bg-gray-200 border-0 dark:bg-gray-700" />
                        <span class="absolute left-1/2 px-3 font-medium text-gray-900 bg-white -translate-x-1/2 dark:text-white dark:bg-gray-900">
                            or
                        </span>
                    </div>
                    <p className=" self-center text-2xl">
                        Use a page from the{" "}
                        <a
                            className=" underline"
                            href="https://www.iasp.org/wp-content/uploads/2019/05/SpellSrWordList.pdf"
                        >
                            official IASP Word List
                        </a>
                        :
                    </p>
                    <div className=" flex flex-row gap-8">
                        <select
                            onChange={(e) => {
                                setInp(pageList[e.target.value].join(", ")); // populate textarea
                                setWords(pageList[e.target.value]); // word list now in use
                            }}
                            className="select select-primary w-full max-w-xs"
                        >
                            <option value="none" disabled selected>
                                Choose page
                            </option>
                            <option value="p1">Page 1</option>
                            <option value="p2">Page 2</option>
                            <option value="p3">Page 3</option>
                            <option value="p4">Page 4</option>
                            <option value="p5">Page 5</option>
                            <option value="p6">Page 6</option>
                            <option value="p7">Page 7</option>
                            <option value="p8">Page 8</option>
                            <option value="p9">Page 9</option>
                            <option value="p10">Page 10</option>
                        </select>
                    </div>
                    <hr class="my-4 mx-auto w-48 h-1 rounded border-0 md:my-10 bg-base-300" />
                    <button
                        onClick={() => updateWords(inp)}
                        className="btn btn-info w-1/2"
                    >
                        Update Words
                    </button>
                    <div className=" group w-full text-center">
                        <button
                            onClick={() => {
                                setWords([]);
                                setInp("");
                            }}
                            className="btn btn-error w-1/2"
                        >
                            Clear Words
                        </button>
                        <p className=" mt-2 underline underline-offset-2">
                            <AiFillWarning className=" inline mb-1 mx-1 text-xl text-warning" />
                            Clearing words will erase current list!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChooseWords;
