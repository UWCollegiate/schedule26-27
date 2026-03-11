async function loadVer() {
    let res = await fetch("data/version.txt");
    return await res.text();
}

function initData() {
    loadVer().then(version => {
        if (localStorage.version !== version && !JSON.parse(localStorage.versionOverride)) {
            console.log("replacing localStorage with default");
            localStorage.clear();
            localStorage.version = version;
            localStorage.courses = JSON.stringify({});
            localStorage.spareRestrictions = JSON.stringify(Array(9).fill(true));
            localStorage.replacing = JSON.stringify(null);
            localStorage.versionOverride = JSON.stringify(false);
            location.href = "index.html";
        }
    });
}

initData();

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "`") {
        if (JSON.parse(localStorage.versionOverride)) {
            localStorage.versionOverride = JSON.stringify(false);
            alert("version override turned off");
            initData();
        }
        else {
            localStorage.versionOverride = JSON.stringify(true);
            localStorage.version = prompt("input the new version:");
            alert(`version override turned on, testing version ${localStorage.version}`);
        }
    }
});