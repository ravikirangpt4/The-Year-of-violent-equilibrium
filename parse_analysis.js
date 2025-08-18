const fs = require('fs');
const path = require('path');

function parseAnalysisFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');

    const theme = lines[0];
    const periodMatch = path.basename(filePath).match(/_(\d{4})\.txt$/);
    const period = periodMatch ? parseInt(periodMatch[1], 10) : null;

    let annualReturn = null;
    const returnMatch = fileContent.match(/(\d+% return)/);
    if (returnMatch) {
        annualReturn = returnMatch[1];
    }

    const analysisSections = [];
    let currentSection = null;

    lines.forEach(line => {
        const phaseMatch = line.match(/^Phase \d+: (.*)/);
        if (phaseMatch) {
            if (currentSection) {
                analysisSections.push(currentSection);
            }
            currentSection = {
                phaseName: phaseMatch[1].trim(),
                sequence: [],
                narrative: ''
            };
        } else if (currentSection) {
            const sequenceMatch = line.match(/^Sequence: \[(.*)\]/);
            if (sequenceMatch) {
                currentSection.sequence = sequenceMatch[1].split(',').map(s => parseInt(s.trim(), 10));
            } else if (line.trim().length > 0 && !line.startsWith('Executive Summary:') && !line.startsWith('Conclusion:')) {
                if (currentSection.narrative.length > 0) {
                    currentSection.narrative += ' ';
                }
                currentSection.narrative += line.trim();
            }
        }
    });

    if (currentSection) {
        analysisSections.push(currentSection);
    }

    // The narrative for each phase is everything after the sequence line.
    // The current parsing logic is flawed. Let's try another way.

    const sections = fileContent.split(/Phase \d+:/);
    const executiveSummary = sections[0];

    const narrativeThemeMatch = executiveSummary.match(/(.*?)\nExecutive Summary:/);
    const narrativeTheme = narrativeThemeMatch ? narrativeThemeMatch[1].trim() : '';

    const annualReturnMatch = executiveSummary.match(/modest (\d+%) return/);
    const annualReturnResult = annualReturnMatch ? annualReturnMatch[1] : null;

    const analysisSectionsResult = [];
    for (let i = 1; i < sections.length; i++) {
        const sectionContent = sections[i];
        const lines = sectionContent.split('\n').filter(l => l.trim() !== '');

        const phaseName = lines[0].trim();

        const sequenceLine = lines.find(l => l.startsWith('Sequence:'));
        const sequenceMatch = sequenceLine.match(/\[(.*?)\]/);
        const sequence = sequenceMatch ? sequenceMatch[1].split(',').map(s => parseInt(s.trim(), 10)) : [];

        const narrative = lines.slice(lines.indexOf(sequenceLine) + 1).join(' ').trim();

        analysisSectionsResult.push({
            phaseName,
            sequence,
            narrative
        });
    }


    return {
        period: period,
        annualReturn: annualReturnResult,
        theme: narrativeTheme,
        analysisSections: analysisSectionsResult
    };
}

const inputFilePath = path.join(__dirname, 'analysis_2018.txt');
const outputFilePath = path.join(__dirname, 'analysis_2018.json');

const jsonData = parseAnalysisFile(inputFilePath);

fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 4));

console.log(`Successfully parsed ${inputFilePath} and created ${outputFilePath}`);
