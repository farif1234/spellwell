import React from "react";

const Footer = () => {
    return (
        <div>
            <footer className="footer footer-center p-4 bg-base-300 text-base-content fixed bottom-0">
                <div>
                    <p>
                        Copyright © 2022 - Faihaan Arif
                        <a
                            href="https://github.com/farif1234/spell-quiz"
                            className="link mx-4"
                        >
                            View source code
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Footer;