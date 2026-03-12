document.querySelectorAll(".gradeHeader").forEach((gradeHeader) => {
    gradeHeader.addEventListener("click", () => {
        let grade = gradeHeader.parentElement;
        let gradeContent = gradeHeader.nextElementSibling;

        if (grade.classList.contains("active")) {
            gradeContent.style.height = "0";
            grade.classList.remove("active");
        }
        else {
            // hacky expanding
            gradeContent.style.height = gradeContent.scrollHeight + "px";
            grade.classList.add("active");
        }
    });
});

function addCourse(name, slots) {
    let courses = JSON.parse(localStorage.courses);
    courses[name] = {
        slots: slots,
        restrictions: Array(9).fill(true)
    };
    let replacing = JSON.parse(localStorage.replacing);
    if (replacing) delete courses[replacing];

    localStorage.courses = JSON.stringify(courses);
    location.href = "index.html";
}

async function loadCSV(path) {
    let response = await fetch(path);
    if (response.ok) {
        let text = await response.text();
        // ignore first row
        let rows = text.trim().split("\n");
        rows.shift()
        let items = {};
        rows.map(r => {
            let i = r.split(",");
            // first column is the name
            items[i.shift()] = i.map(i => i === "Y");
        });
        return items;
    }

    return null;
}

function createElements(containerName, data) {
    let gradeContent = document.getElementById(containerName);
    if (!data) return;

    for (let [key, value] of Object.entries(data)) {
        gradeContent.insertAdjacentHTML("beforeend", `
            <button class="gradeButton" onclick="addCourse('${key}', [${value}])">${key}</button>
        `)
    }
}

async function initPage() {
    await window.appDataReady;

    for (let i of ["grade9", "grade10", "grade11", "grade12", "dualcredit"]) {
        loadCSV(`data/${localStorage.version}/${i}.csv`).then(r => createElements(i, r));
    }
    for (let i of ["core9", "core10"]) {
        loadCSV(`data/${i}.csv`).then(r =>
            document.getElementById(i).addEventListener("click", () => {
                if (!r) return;

                let courses = JSON.parse(localStorage.courses);

                for (let [name, slots] of Object.entries(r)) {
                    courses[name] = {
                        slots: slots,
                        restrictions: Array(9).fill(true)
                    };
                }

                let replacing = JSON.parse(localStorage.replacing);
                if (replacing) delete courses[replacing];

                localStorage.courses = JSON.stringify(courses);
                location.href = "index.html";
            })
        );
    }
}

initPage();
