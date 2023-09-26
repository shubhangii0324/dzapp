
export const generateLineNumbers = (lines) => {
    return lines
        .map((_, index) => {
            const lineNumber = index + 1;
            return `${lineNumber}`;
        })
        .join('\n');
};