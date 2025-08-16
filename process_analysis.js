const fs = require('fs');
const path = require('path');

// Define the path to the input file
const inputFilePath = path.join(__dirname, 'five years');

// Read the content of the file
const fileContent = fs.readFileSync(inputFilePath, 'utf-8');

// Split the content by the delimiter ". . ."
const analyses = fileContent.split(/\s*\. \. \.\s*/);

analyses.forEach(analysisText => {
    if (analysisText.trim() === '') return;

    // Extract the title
    const titleMatch = analysisText.match(/A Narrative Analysis of Market Dynamics in (\d{4}): Deconstructing the Path to a (.*?%?) Annual Return|Anatomy of a Bull Market: Deconstructing the (.*?%?) Return of (\d{4})|The Unraveling of a Bull Market: Anatomy of the (.*?%?) Return in (\d{4})|A Market Shocked into Action: Deconstructing the (.*?%?) Return of (\d{4})|The Anatomy of a Mature Bull Market: Deconstructing the (.*?%?) Return of (\d{4})/);

    let year, annualReturn, theme;
    let themePrefix = '';

    if (titleMatch) {
        if (titleMatch[1]) { // 2013
            year = titleMatch[1];
            annualReturn = titleMatch[2];
            themePrefix = 'Deconstructing the Path to a'
            theme = `A Narrative Analysis of Market Dynamics in ${year}: ${themePrefix} ${annualReturn} Annual Return`;
        } else if (titleMatch[4]) { // 2014
            year = titleMatch[4];
            annualReturn = titleMatch[3];
            theme = 'Anatomy of a Bull Market';
        } else if (titleMatch[6]) { // 2015
            year = titleMatch[6];
            annualReturn = titleMatch[5];
            theme = 'The Unraveling of a Bull Market';
        } else if (titleMatch[8]) { // 2016
            year = titleMatch[8];
            annualReturn = titleMatch[7];
            theme = 'A Market Shocked into Action';
        } else if (titleMatch[10]) { // 2017
            year = titleMatch[10];
            annualReturn = titleMatch[9];
            theme = 'The Anatomy of a Mature Bull Market';
        }
    } else {
        return;
    }

    // Extract Executive Summary
    const executiveSummaryMatch = analysisText.match(/Executive Summary:\n([\s\S]*?)\n\n/);
    const executiveSummary = executiveSummaryMatch ? executiveSummaryMatch[1].trim() : '';

    // Extract Analysis Sections
    const analysisSections = [];
    const phaseRegex = /Phase \d+: (.*?)\nSequence: \[ (.*?) \]\n([\s\S]*?)(?=Phase \d+:|Conclusion:|$)/g;
    let phaseMatch;
    while ((phaseMatch = phaseRegex.exec(analysisText)) !== null) {
        const phaseName = phaseMatch[1].trim();
        const sequence = JSON.parse(`[${phaseMatch[2]}]`);
        const narrative = phaseMatch[3].trim();
        analysisSections.push({
            phaseName,
            sequence,
            narrative
        });
    }

    // Extract Conclusion
    const conclusionMatch = analysisText.match(/Conclusion:\n([\s\S]*)/);
    let conclusion = conclusionMatch ? conclusionMatch[1].trim() : '';
    if (conclusion.endsWith('.')) {
        conclusion = conclusion.slice(0, -1);
    }


    // Construct the JSON object
    const jsonData = {
        period: year,
        annualReturn,
        theme,
        executiveSummary,
        analysisSections,
        conclusion
    };

    // Define the output file path
    const outputFilePath = path.join(__dirname, `analysis_${year}.json`);

    // Write the JSON data to the file
    fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2));

    console.log(`Generated ${outputFilePath}`);
});
