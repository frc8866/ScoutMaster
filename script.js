let totalScore = 0;
let importedCSVContent = "";


document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("inputSection").classList.add("hidden");
    document.getElementById("fileInput").addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file && file.name === "MasterSheet.csv") {
            const reader = new FileReader();
            reader.onload = function(e) {
                importedCSVContent = e.target.result;
                document.getElementById("inputSection").classList.remove("hidden");
                document.getElementById("uploadSection").classList.add("hidden");
            };
            reader.readAsText(file);
        } else {
            alert("Please upload a file named MasterSheet.csv");
        }
    });
});

function restart() {
    // Reset global variables
    totalScore = 0;
    importedCSVContent = "";

    // Reset UI elements
    document.getElementById("dataInput").value = "";
    document.getElementById("output").innerHTML = "";
    
    // Reset file input
    document.getElementById("fileInput").value = "";
    
    // Reset visibility of sections
    document.getElementById("inputSection").classList.add("hidden");
    document.getElementById("uploadSection").classList.remove("hidden");
    
    // Reset QR scanner if it exists
    const qrReader = document.getElementById("qr-reader");
    if (qrReader) {
        qrReader.innerHTML = "";
        qrReader.classList.add("hidden");
    }
    
    // Reset scanner button
    const startScannerButton = document.getElementById("startScannerButton");
    if (startScannerButton) {
        startScannerButton.style.display = "block";
    }
}

function exportToCSV() {
    let csvContent = importedCSVContent.trim();

    const inputData = document.getElementById("dataInput").value;
    const values = inputData.split(",");

    if (values.length < 23) { 
        document.getElementById("output").innerHTML = "Invalid data format.";
        return;
    }

    function calculateCount(value, points) {
        return value == 0 ? "0 times (0 points)" : `${value / points} times (${value} points)`;
    }

    totalScore = 0;
    const autonomousPoints = [
        { value: values[0], points: 3 },
        { value: values[1], points: 4 },
        { value: values[2], points: 6 },
        { value: values[3], points: 7 },
        { value: values[4], points: 6 },
        { value: values[5], points: 4 },
        { value: values[6] == 3 ? 3 : 0, points: 1 }
    ];

    const teleopPoints = [
        { value: values[7], points: 2 },
        { value: values[8], points: 3 },
        { value: values[9], points: 4 },
        { value: values[10], points: 5 },
        { value: values[11], points: 6 },
        { value: values[12], points: 4 }
    ];

    const endGamePoints = [
        { value: values[13] == 2 ? 2 : 0, points: 1 },
        { value: values[14] == 12 ? 12 : (values[14] == 88 ? 0 : 0), points: 1 },
        { value: values[15] == 6 ? 6 : (values[15] == 66 ? 0 : 0), points: 1 }
    ];

    autonomousPoints.forEach(item => totalScore += parseInt(item.value));
    teleopPoints.forEach(item => totalScore += parseInt(item.value));
    endGamePoints.forEach(item => totalScore += parseInt(item.value));
    const wonMatch = values[16] == 1 ? "Yes" : "No";
    const lostMatch = values[17] == 1 ? "Yes" : "No";
    const tiedMatch = values[18] == 1 ? "Yes" : "No";
    const matchNumber = values[19];
    const teamNumber = values[20];
    const allianceColor = values[21] == 0 ? "Red" : "Blue";
    const matchType = values[22] == "qualification" ? "Qualification" : "Playoffs";
    const scouterName = values[23];
    const driverAbility = values[24];
    const robotAbility = values[25];
    const consistentGamePiece = values[26];
    const rolePlayed = values[27];
    const comments = values[28];
    const allianceScore = values[29];
    const deadRobot = values[30];
    const brokenRobot = values[31] == "1" ? "Yes" : "No";
    const missedAutoPieces = values[32];
    const missedTeleopPieces = values[33];
    const cycleTimes = values[34];
    
    const averageCycleTime = calculateAverageCycleTime(cycleTimes);
    const scoreContribution = calculateScoreContribution(allianceScore, totalScore);
    const autonomousPercentage = calculateAutonomousPercentage(values, missedAutoPieces);
    const teleopPercentage = calculateTeleopPercentage(values, missedTeleopPieces);
    
    csvContent += `\nMatch ${matchNumber},${scouterName},${matchType},${teamNumber},${allianceColor},,${values[6] == 3 ? "Yes" : "No"},${values[0] / 3},${values[1] / 4},${values[2] / 6},${values[3] / 7},${values[4] / 6},${values[5] / 4},${autonomousPercentage.toFixed(2)}%,,${values[7] / 2},${values[8] / 3},${values[9] / 4},${values[10] / 5},${values[4] / 6},${values[5] / 4},${teleopPercentage.toFixed(2)}%,,${values[13] == 2 ? "Yes" : "No"},${values[14] == 12 ? "Yes" : (values[14] == 88 ? "FAILED" : "No")},${values[15] == 6 ? "Yes" : (values[15] == 66 ? "FAILED" : "No")},${totalScore},${allianceScore},${scoreContribution.toFixed(2)}%,${rolePlayed},${averageCycleTime.toFixed(2)},${consistentGamePiece},${driverAbility},${robotAbility},${deadRobot},${brokenRobot},${comments}`;

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "MasterSheet.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function calculateAutonomousPercentage(values, missedAutoPieces) {
    const autonomousPoints = [
        { value: parseInt(values[0]), points: 3 },
        { value: parseInt(values[1]), points: 4 },
        { value: parseInt(values[2]), points: 6 },
        { value: parseInt(values[3]), points: 7 },
        { value: parseInt(values[4]), points: 6 },
        { value: parseInt(values[5]), points: 4 }
    ];
    console.log(`Missed Auto Pieces:${missedAutoPieces}`)
    const totalMadePieces = autonomousPoints.reduce((acc, item) => acc + (item.value / item.points), 0);
    const totalPieces = totalMadePieces + parseInt(missedAutoPieces);

    if (totalPieces === 0) {
        return 0;
    }

    return (totalMadePieces / totalPieces) * 100;
}

function calculateTeleopPercentage(values, missedTeleopPieces) {
    const teleopPoints = [
        { value: parseInt(values[7]), points: 2 },
        { value: parseInt(values[8]), points: 3 },
        { value: parseInt(values[9]), points: 4 },
        { value: parseInt(values[10]), points: 5 },
        { value: parseInt(values[11]), points: 6 },
        { value: parseInt(values[12]), points: 4 }
    ];
    console.log(`Missed Teleop Pieces:${missedTeleopPieces}`)
    const totalMadePieces = teleopPoints.reduce((acc, item) => acc + (item.value / item.points), 0);
    const totalPieces = totalMadePieces + parseInt(missedTeleopPieces);

    if (totalPieces === 0) {
        return 0;
    }

    return (totalMadePieces / totalPieces) * 100;
}

function calculateScoreContribution(allianceScore, totalScore) {
    if (totalScore === 0) {
        return 0;
    }
    return (totalScore / allianceScore) * 100;
}

function calculateAverageCycleTime(cycleTimes) {
    const times = cycleTimes.split("+").map(time => parseFloat(time));
    const total = times.reduce((acc, time) => acc + time, 0);
    return total / times.length;
}

function interpretData() {
    const inputData = document.getElementById("dataInput").value;
    const values = inputData.split(",");

    if (values.length < 23) { 
        document.getElementById("output").innerHTML = "Invalid data format.";
        return;
    }

    function calculateCount(value, points) {
        return value == 0 ? "0 times (0 points)" : `${value / points} times (${value} points)`;
    }

    totalScore = 0;
    const autonomousPoints = [
        { value: values[0], points: 3 },
        { value: values[1], points: 4 },
        { value: values[2], points: 6 },
        { value: values[3], points: 7 },
        { value: values[4], points: 6 },
        { value: values[5], points: 4 },
        { value: values[6] == 3 ? 3 : 0, points: 1 }
    ];

    const teleopPoints = [
        { value: values[7], points: 2 },
        { value: values[8], points: 3 },
        { value: values[9], points: 4 },
        { value: values[10], points: 5 },
        { value: values[11], points: 6 },
        { value: values[12], points: 4 }
    ];

    const endGamePoints = [
        { value: values[13] == 2 ? 2 : 0, points: 1 },
        { value: values[14] == 12 ? 12 : (values[14] == 88 ? 0 : 0), points: 1 },
        { value: values[15] == 6 ? 6 : (values[15] == 66 ? 0 : 0), points: 1 }
    ];

    autonomousPoints.forEach(item => totalScore += parseInt(item.value));
    teleopPoints.forEach(item => totalScore += parseInt(item.value));
    endGamePoints.forEach(item => totalScore += parseInt(item.value));
    const wonMatch = values[16] == 1 ? "Yes" : "No";
    const lostMatch = values[17] == 1 ? "Yes" : "No";
    const tiedMatch = values[18] == 1 ? "Yes" : "No";
    const matchNumber = values[19];
    const teamNumber = values[20];
    const allianceColor = values[21] == 0 ? "Red" : "Blue";
    const matchType = values[22] == "qualification" ? "Qualification" : "Playoffs";
    const scouterName = values[23];
    const driverAbility = values[24];
    const robotAbility = values[25];
    const consistentGamePiece = values[26];
    const rolePlayed = values[27];
    const comments = values[28];
    const allianceScore = values[29];
    const deadRobot = values[30] == "1" ? "Yes" : "No";
    const brokenRobot = values[31] == "1" ? "Yes" : "No";
    const missedAutoPieces = values[34];
    const missedTeleopPieces = values[35];
    const cycleTimes = values[36];

    const averageCycleTime = calculateAverageCycleTime(cycleTimes);
    const scoreContribution = calculateScoreContribution(allianceScore, totalScore);
    const autonomousPercentage = calculateAutonomousPercentage(values, missedAutoPieces);
    const teleopPercentage = calculateTeleopPercentage(values, missedTeleopPieces);

    const outputText = `
    <div class="section">
        <p><strong>Scouter Name:</strong> ${scouterName}</p>
        <p><strong>Match Type:</strong> ${matchType}</p>
        <p><strong>Autonomous Phase:</strong></p>
        <p>Coral L1: ${calculateCount(values[0], 3)}</p>
        <p>Coral L2: ${calculateCount(values[1], 4)}</p>
        <p>Coral L3: ${calculateCount(values[2], 6)}</p>
        <p>Coral L4: ${calculateCount(values[3], 7)}</p>
        <p>Algae Processor: ${calculateCount(values[4], 6)}</p>
        <p>Algae Net: ${calculateCount(values[5], 4)}</p>
        <p>Left During Autonomous: ${values[6] == 3 ? "Yes" : "No"}</p>
        <p><strong>Autonomous Percentage:</strong> ${autonomousPercentage.toFixed(2)}%</p>
    </div>
    <div class="section">
        <p><strong>Teleoperated Phase:</strong></p>
        <p>Coral L1: ${calculateCount(values[7], 2)}</p>
        <p>Coral L2: ${calculateCount(values[8], 3)}</p>
        <p>Coral L3: ${calculateCount(values[9], 4)}</p>
        <p>Coral L4: ${calculateCount(values[10], 5)}</p>
        <p>Algae Processor: ${calculateCount(values[11], 6)}</p>
        <p>Algae Net: ${calculateCount(values[12], 4)}</p>
        <p><strong>Teleop Percentage:</strong> ${teleopPercentage.toFixed(2)}%</p>
    </div>
    <div class="section">
        <p><strong>End Game:</strong></p>
        <p>Parked: ${values[13] == 2 ? "Yes" : "No"}</p>
        <p>Deep: ${values[14] == 12 ? "Yes" : (values[14] == 88 ? "FAILED" : "No")}</p>
        <p>Shallow: ${values[15] == 6 ? "Yes" : (values[15] == 66 ? "FAILED" : "No")}</p>
        <p><strong>Total Score:</strong> ${totalScore} points</p>
        <p><strong>Alliance Score:</strong> ${allianceScore} points</p>
        <p><strong>Score Contribution:</strong> ${scoreContribution.toFixed(2)}%</p>
    </div>
    <div class="section">
        <p><strong>Match Details:</strong></p>
        <p>Won Match: ${wonMatch}</p>
        <p>Lost Match: ${lostMatch}</p>
        <p>Tied Match: ${tiedMatch}</p>
        <p>Match Number: ${matchNumber}</p>
        <p>Team Number: ${teamNumber}</p>
        <p>Alliance Color: ${allianceColor}</p>
        <p><strong>Gamepiece Most Scored: </strong>${values[26]}</p>
        <p><strong>Role Played: </strong>${values[27]}</p>
        <p><strong>Average Cycle Time: </strong>${averageCycleTime.toFixed(2)} seconds</p>
        <p><strong>Comments: </strong>${values[28]}</p>
        <p><strong>Did Robot Die?: </strong>${deadRobot} </p>
        <p><strong>Robot Died: </strong>${values[32]} Time(s)</p>
        <p><strong>Did Robot Break?: </strong>${brokenRobot} </p>
        <p><strong>Robot Broke: </strong>${values[33]} Time(s)</p>
    </div>
    `;
    document.getElementById("output").innerHTML = outputText;
    exportToCSV();
}



function downloadMasterSheet() {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "Scout Data,Name,Match Type,Team,Alliance,Autonomous,Leave,Coral L1,Coral L2,Coral L3,Coral L4,Algae Processor,Algae Net,Scoring Consistency Auto,Teleoperated,Coral L1,Coral L2,Coral L3,Coral L4,Algae Processor,Algae Net,Scoring Consistency Teleop,End Game,Parked,Deep,Shallow,Total Score,Alliance Score,Score Contribution,Role Played,Average Cycle Time, Gamepiece Most Scored, Driver Ability, Robot Ability,Times Robot Died, Times Robot Broke, Comments";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MasterSheet.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


document.addEventListener('DOMContentLoaded', function () {
    const startScannerButton = document.getElementById('startScannerButton');
    let qrScanner;

    startScannerButton.addEventListener('click', function() {
        document.getElementById('qr-reader').classList.remove('hidden');
        this.style.display = 'none';

        function onScanSuccess(decodedText, decodedResult) {

            qrScanner.clear();
            document.getElementById('qr-reader').classList.add('hidden');
            console.log(`Code matched = ${decodedText}`, decodedResult);
            document.getElementById('dataInput').value = decodedText;
            interpretData();
        }


        qrScanner = new Html5QrcodeScanner(
            "qr-reader", { fps: 10, qrbox: 300 });

  
        qrScanner.render(onScanSuccess);
    });
});