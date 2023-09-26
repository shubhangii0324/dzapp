import React, { useState, useEffect } from 'react';
import errorSvg from '../assets/error.svg';
import { generateLineNumbers } from '../shared/functions';
import './index.css';

function Disperse() {
    const maxCharactersPerLine = 42;
    const [code, setCode] = useState('');
    const [errors, setErrors] = useState([]);
    const [lineNumbers, setLineNumbers] = useState(1);
    const [isDuplicated, setIsDuplicated] = useState(false);


    useEffect(() => {
        setErrors([]);
        setIsDuplicated(false);
    }, [code])

    const validateInput = (inputLines) => {
        const errors = [];
        const duplicateAddresses = {};

        for (let i = 0; i < inputLines.length; i++) {
            const line = inputLines[i]?.trim();
            const parts = line.split(/[=, ]+/); // Split by '=', ',', or space and remove empty parts

            if (parts.length === 2) {
                const address = parts[0];
                const amount = parts[1];
                if (!address.startsWith('0x')) {
                    errors.push(`Line ${i + 1} Invalid Ethereum address`);
                } else if (address.length !== maxCharactersPerLine && isNaN(amount)) {
                    errors.push(`Line ${i + 1} Invalid Ethereum address and wrong amount.`);
                } else {
                    if (isNaN(amount)) {
                        errors.push(`Line ${i + 1} wrong amount`);
                    }
                    if (address.length !== maxCharactersPerLine) {
                        errors.push(`Line ${i + 1} Invalid Ethereum address`);
                    }
                }
                if (duplicateAddresses[address]) {
                    duplicateAddresses[address].lines.push(i + 1);
                } else {
                    duplicateAddresses[address] = { lines: [i + 1] };
                }
            } else {
                errors.push(`Line ${i + 1} is invalid. It should contain a valid Ethereum address and an amount.`);
            }
        }
        // Add error messages for duplicate addresses
        for (const address in duplicateAddresses) {
            const lines = duplicateAddresses[address].lines;
            if (lines.length > 1) {
                lines.forEach((line) => {
                    errors.push(`${address} duplicate in line : ${lines.join(", ")}`);
                });
            } else if (lines.length <= 1) {
                delete duplicateAddresses[address];
            }
        }
        const hasDuplicateAddresses = Object.keys(duplicateAddresses).length > 0;
        const deduplicatedErrors = Array.from(new Set(errors));
        setErrors(deduplicatedErrors);
        setIsDuplicated(hasDuplicateAddresses);
    };


    const handleInputChange = (e) => {
        const currentContent = e.target.value;
        // Split the content into lines
        const contentLines = currentContent.split('\n');
        // Update the code and line numbers
        setCode(currentContent);
        setLineNumbers(generateLineNumbers(contentLines));
    };

    const handleDuplicateEntries = (type) => {
        const currentContent = code;

        const contentLines = currentContent.split('\n');

        const seenAddresses = {};

        let combinedLines = [];

        if (type === 'combineAmount') {
            contentLines.forEach((line) => {
                const parts = line.trim().split(/[=, ]+/);
                const address = parts[0];
                const amount = parseFloat(parts[1]);

                if (!isNaN(amount)) {
                    // If the address already exists, add the amount to the existing balance
                    if (seenAddresses.hasOwnProperty(address)) {
                        seenAddresses[address] += amount;
                    } else {
                        seenAddresses[address] = amount;
                    }
                }
            });
            // Generate new lines with combined balances
            combinedLines = Object.entries(seenAddresses).map(([address, balance]) => {
                return `${address}=${balance}`;
            });
        } else {
            combinedLines = contentLines.filter((line) => {
                const parts = line.trim().split(/[=, ]+/);
                const address = parts[0];

                if (!seenAddresses[address]) {
                    seenAddresses[address] = true;
                    return true;
                }

                return false;
            });
        }
        setCode(combinedLines.join('\n'));
        setLineNumbers(generateLineNumbers(combinedLines));
        if (isDuplicated) {
            const deduplicatedErrors = validateInput(combinedLines);
            setErrors(deduplicatedErrors);
            setIsDuplicated(false);
        }
    };

    return (
        <div className='container'>
            <div className='card'>
                <div className='outerCard'>
                    <div>
                        <p>Addresses With Amounts</p>
                    </div>
                    <div>
                        <p>Upload File</p>
                    </div>
                </div>
                <div className="code-editor">
                    <div className="editor">
                        <div className="line-numbers-container">
                            <pre className="line-numbers">{lineNumbers}</pre>
                        </div>
                        <textarea
                            rows="1"
                            value={code}
                            onChange={handleInputChange}
                            className="code-textarea"
                        />
                    </div>
                </div>
                <div className='exampleContainer'>
                    <div>
                        <p>Seperated by `,` or `` or `=`</p>
                    </div>
                    <div>
                        <p className='exampleText'>Show Example</p>
                    </div>
                </div>
                {
                    isDuplicated && (
                        <div className='duplicateContainer'>
                            <div>
                                <p>Duplicated</p>
                            </div>
                            <div className='duplicateTextContainer'>
                                <button onClick={() => handleDuplicateEntries('keepFirst')} className='duplicateText duplicateBtn'>Keep the first one</button>
                                <button onClick={() => handleDuplicateEntries('combineAmount')} className='duplicateBtn'>Combine Balance</button>
                            </div>
                        </div>
                    )
                }
                {
                    errors && errors?.length > 0 && (
                        <div className='errorContainer'>
                            <div>
                                <img className='errorIcon' src={errorSvg} alt="" />
                            </div>
                            <div className='errorContent'>
                                {errors.map((error, index) => (
                                    <p key={index} style={{ color: 'red' }}>{error}</p>
                                ))}
                            </div>
                        </div>
                    )
                }
                <div className='btnContainer'>
                    <button className='nextBtn' disabled={!code || errors?.length > 0} onClick={() => validateInput(code.split('\n'))}>Next</button>
                </div>
            </div>
        </div>
    );
}

export default Disperse;
