import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';

export const Footer = () => {
    return(
        <div className="footer">
            <a href="https://github.com/leemount96/volatility-futures" target="_blank" rel="noreferrer">View the Code {" "}
            <FontAwesomeIcon icon={faArrowUpRightFromSquare}/>
            </a>
            
        </div>
    )
}