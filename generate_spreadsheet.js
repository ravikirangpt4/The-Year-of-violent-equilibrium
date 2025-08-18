const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

/**
 * Main function to generate a single, detailed analytical CSV spreadsheet from multiple JSON analysis files.
 */
function generateAnalyticalSpreadsheet() {
    const directoryPath = __dirname;
    const allRows = [];

    try {
        // Find all files that match the analysis_YYYY.json pattern
        const files = fs.readdirSync(directoryPath).filter(file =>
            /^analysis_\d{4}\.json$/.test(file)
        );

        if (files.length === 0) {
            console.log("No analysis JSON files found. Please run the first script to generate them.");
            return;
        }

        console.log(`Found ${files.length} analysis files to process for the analytical view.`);

        // Process each JSON file
        files.forEach(file => {
            const filePath = path.join(directoryPath, file);
            try {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const data = JSON.parse(fileContent);

                if (data.analysisSections && data.analysisSections.length > 0) {

                    // --- START: Your New Logic for the "Analytical View" ---
                    data.analysisSections.forEach(section => {
                        // Loop through each individual number in the sequence array
                        section.sequence.forEach((value, index) => {
                            const newRow = {
                                'Year': data.period,
                                'Annual Return': data.annualReturn,
                                'Theme': data.theme,
                                'Phase Name': section.phaseName,
                                'Step': index + 1, // Add a step counter (1, 2, 3...)
                                'Sequence Value': value, // The individual number from the sequence
                                'Narrative': section.narrative // This will be repeated for each step in the phase
                            };
                            allRows.push(newRow);
                        });
                    });
                    // --- END: Your New Logic ---

                }
            } catch (parseError) {
                console.error(`Error parsing ${file}:`, parseError.message);
            }
        });

        if (allRows.length > 0) {
            // Convert the array of row objects into a CSV string
            const csv = Papa.unparse(allRows);

            // Define the output file path with a new name to avoid confusion
            const outputFilePath = path.join(directoryPath, 'market_narratives_analytical.csv');

            // Write the CSV string to a file
            fs.writeFileSync(outputFilePath, csv);

            console.log(`✅ Successfully generated analytical spreadsheet: ${outputFilePath}`);
        } else {
            console.log("No data was processed to generate a spreadsheet.");
        }

    } catch (error) {
        console.error("An error occurred during the spreadsheet generation process:", error.message);
    }
}

// Run the script
generateAnalyticalSpreadsheet();
