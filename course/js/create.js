import init, { js_solve_all } from './dlx.js';

const slotPlacements = [
    [[84, 1100], [334, 1100], [584, 1100]],
    [[84, 900], [334, 900], [584, 900]],
    [[84, 650], [334, 650], [584, 650]],
    [[84, 450], [334, 450], [584, 450]],
    [[84, 200], [334, 200], [584, 200]],
    [[209, 1050], [459, 1050]],
    [[209, 800], [459, 800]],
    [[209, 400], [459, 400]],
    [[209, 150], [459, 150]]
];

async function run() {
    await init();

    let courses = JSON.parse(localStorage.courses);
    let courseNames = Object.keys(courses);
    let courseData = Object.values(courses);
    let courseSlots = courseData.map(i => i.slots);
    let spareRestrictions = JSON.parse(localStorage.spareRestrictions);

    // initialize matrix and names with spares
    let matrix = Array.from({ length: 9 }, (_, i) =>
        Array.from({ length: 18 }, (_, j) => i + 9 === j)
    );
    let names = Array(9).fill("---Spare---");
    let times = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    // this is weird but it won't loop over spares
    for (let i = 0; i < courseSlots.length; i++) {
        let selectedName = courseNames[i];
        let selectedSlots = courseSlots[i];
        selectedSlots.forEach((slotAllowed, slotNumber) => {
            if (slotAllowed) {
                names.push(selectedName);
                times.push(slotNumber);
                matrix.push(Array.from({ length: 18 }, (_, j) => j === i || j === slotNumber + 9))
            }
        });
    }

    let solutions = js_solve_all(matrix);
    solutions = solutions.filter(s => s.every(i => names[i] === "---Spare---" ? spareRestrictions[times[i]] : courses[names[i]].restrictions[times[i]]));
    return solutions.map(s => s.sort((a, b) => times[a] - times[b]).map(i => names[i]));
}

run().then(solutions => {
    let selectionContainer = document.getElementById("selectionContainer");

    if (solutions.length === 0) {
        selectionContainer.innerHTML = "<b>No solutions found.</b>";
        return;
    }

    for (let i = 0; i < solutions.length; i++) {
        let sol = solutions[i];
        // it might give a solution with a length less than 9, make sure that all 9 slots are handled
        if (sol.length === 9) {
            selectionContainer.insertAdjacentHTML('beforeend', `
                <div class="selection">
                    <div class="selectedCourse"><b>Slot 1: </b>${sol[0]}</div>
                    <div class="selectedCourse"><b>Slot 2: </b>${sol[1]}</div>
                    <div class="selectedCourse"><b>Slot 3: </b>${sol[2]}</div>
                    <div class="selectedCourse"><b>Slot 4: </b>${sol[3]}</div>
                    <div class="selectedCourse"><b>Slot 5: </b>${sol[4]}</div>
                    <div class="selectedCourse"><b>Slot 6: </b>${sol[5]}</div>
                    <div class="selectedCourse"><b>Slot 7: </b>${sol[6]}</div>
                    <div class="selectedCourse"><b>Slot 8: </b>${sol[7]}</div>
                    <div class="selectedCourse"><b>Slot 9: </b>${sol[8]}</div>
                </div>
            `);
        }
    }

    let selections = document.querySelectorAll(".selection");
    let currentSelected = 0;
    document.getElementById("selectionText").innerHTML = `Schedule 1 / ${solutions.length}`;

    function show(i) {
        selections.forEach((sel, j) => sel.classList.toggle("active", i === j));
    }

    document.getElementById("left").addEventListener('click', () => {
        // modulo is goofy
        currentSelected = (currentSelected - 1 + solutions.length) % solutions.length;
        document.getElementById("selectionText").innerHTML = `Schedule ${currentSelected + 1} / ${solutions.length}`;
        show(currentSelected);
    });

    document.getElementById("right").addEventListener('click', () => {
        currentSelected = (currentSelected + 1) % solutions.length;
        document.getElementById("selectionText").innerHTML = `Schedule ${currentSelected + 1} / ${solutions.length}`;
        show(currentSelected);
    });

    show(currentSelected);

    document.getElementById("print").addEventListener('click', async () => {
        let defaultPDF = await fetch(uncachedPath("data/timetable.pdf"), { cache: "no-store" }).then((res) => res.arrayBuffer());
        let pdf = await PDFLib.PDFDocument.load(defaultPDF);
        let page = pdf.getPages()[0];
        let font = await pdf.embedFont(PDFLib.StandardFonts.TimesRoman);

        solutions[currentSelected].forEach((course, slot) => {
            for (let coord of slotPlacements[slot]) {
                page.drawText(course, {
                    x: coord[0],
                    y: coord[1],
                    size: 11,
                    font: font,
                    color: PDFLib.rgb(0,0,0)
                });
            }
        });

        let savedPDF = await pdf.save();
        let blob = new Blob([savedPDF], { type: "application/pdf" });
        window.open(URL.createObjectURL(blob), "_blank");
    });
});
