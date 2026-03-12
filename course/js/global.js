const storageDefaults = {
    courses: {},
    spareRestrictions: Array(9).fill(true),
    replacing: null,
    versionOverride: false
};

async function loadVer() {
    let res = await fetch("data/version.txt");
    return (await res.text()).trim();
}

function getStoredJSON(key, fallback) {
    try {
        let value = localStorage.getItem(key);
        if (value === null) throw new Error("missing storage key");
        return JSON.parse(value);
    }
    catch {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
    }
}

function ensureStorageDefaults() {
    for (let [key, value] of Object.entries(storageDefaults)) {
        getStoredJSON(key, value);
    }
}

async function initData() {
    ensureStorageDefaults();

    let version = await loadVer();
    let versionOverride = getStoredJSON("versionOverride", false);

    if (localStorage.version !== version && !versionOverride) {
        console.log("replacing localStorage with default");
        localStorage.clear();
        localStorage.version = version;
        localStorage.courses = JSON.stringify(storageDefaults.courses);
        localStorage.spareRestrictions = JSON.stringify(storageDefaults.spareRestrictions);
        localStorage.replacing = JSON.stringify(storageDefaults.replacing);
        localStorage.versionOverride = JSON.stringify(storageDefaults.versionOverride);
        location.href = "index.html";
        return;
    }

    document.dispatchEvent(new CustomEvent("app-data-ready", {
        detail: { version: localStorage.version }
    }));
}

window.appDataReady = initData();

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "`") {
        if (getStoredJSON("versionOverride", false)) {
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
