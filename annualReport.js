// =====================================================
// RYANAIR ENGINEERING DASHBOARD
// ANNUAL REPORT
// =====================================================


// =====================================================
// CONFIGURATION
// =====================================================

const ANNUAL_REPORT_COLLECTION =
    "dashboardData/annualReports";


// =====================================================
// CURRENT ANNUAL REPORT STATE
// =====================================================

let CURRENT_ANNUAL_YEAR =
    null;


let CURRENT_ANNUAL_REPORT =
    null;


let AVAILABLE_ANNUAL_YEARS =
    [];


// =====================================================
// ANNUAL REPORT SECTIONS
// =====================================================

const ANNUAL_REPORT_SECTIONS = [

    {
        key:
            "aircraftOnGround",

        title:
            "Aircraft on Ground"

    },

    {
        key:
            "aCheck",

        title:
            "A-Check"

    },

    {
        key:
            "fwd",

        title:
            "FWD"

    },

    {
        key:
            "noInfo",

        title:
            "No Info"

    },

    {
        key:
            "esr",

        title:
            "ESR"

    },

    {
        key:
            "hils",

        title:
            "HILs"

    },

    {
        key:
            "workOrders",

        title:
            "Work Orders"

    }

];

// =====================================================
// ANNUAL REPORT — CHART DATA LABELS
// =====================================================

function annualChartDataLabels() {

    return {

        display: true,

        anchor: "end",

        align: "top",

        offset: 8,

        clamp: true,

        clip: false,

        color: function(context) {

            return (
                context.dataset.borderColor ||
                "#082D70"
            );

        },

        font: {

            size: 11,

            weight: "700"

        },

        formatter: function(value) {

            if (
                typeof value === "number"
            ) {

                return Number.isInteger(value)
                    ? value
                    : value.toFixed(1);

            }

            return value;

        }

    };

}

// =====================================================
// GET ANNUAL REPORT PATH
// =====================================================

function getAnnualReportPath(
    year
){

    return (

        ANNUAL_REPORT_COLLECTION +
        "/" +
        year

    );

}


// =====================================================
// LOAD YEARS ALREADY CREATED IN ANNUAL REPORT
// =====================================================

async function loadAvailableAnnualYears(){

    try{

        if(
            !window.database ||
            !window.firebaseRef ||
            !window.firebaseGet
        ){

            return [];

        }


        const snapshot =
            await window.firebaseGet(

                window.firebaseRef(

                    window.database,

                    ANNUAL_REPORT_COLLECTION

                )

            );


        if(
            !snapshot ||
            !snapshot.exists()
        ){

            AVAILABLE_ANNUAL_YEARS = [];

            return [];

        }


        const data =
            snapshot.val() ||
            {};


        AVAILABLE_ANNUAL_YEARS =

            Object.keys(data)

                .filter(
                    year =>
                        /^\d{4}$/.test(year)
                )

                .map(
                    Number
                )

                .sort(
                    (a,b) =>
                        a - b
                );


        return AVAILABLE_ANNUAL_YEARS;

    }

    catch(error){

        console.error(
            "ANNUAL REPORT — LOAD YEARS ERROR:",
            error
        );

        AVAILABLE_ANNUAL_YEARS = [];

        return [];

    }

}

// =====================================================
// DISCOVER YEARS FROM FWD
// =====================================================

async function getAnnualYearsFromFWD(){

    try{

        if(
            !window.database ||
            !window.firebaseRef ||
            !window.firebaseGet
        ){

            return [];

        }


        const snapshot =
            await window.firebaseGet(

                window.firebaseRef(

                    window.database,

                    "dashboardData/FWD"

                )

            );


        if(
            !snapshot ||
            !snapshot.exists()
        ){

            return [];

        }


        const data =
            snapshot.val() ||
            {};


        return Object.keys(data)

            .filter(
                year =>
                    /^\d{4}$/.test(
                        String(year)
                    )
            )

            .map(
                Number
            )

            .sort(
                (a,b) =>
                    a - b
            );

    }

    catch(error){

        console.error(
            "ANNUAL REPORT — FWD YEARS ERROR:",
            error
        );

        return [];

    }

}

// =====================================================
// DISCOVER YEARS FROM NO INFO
// =====================================================

async function getAnnualYearsFromNoInfo(){

    try{

        if(
            !window.database ||
            !window.firebaseRef ||
            !window.firebaseGet
        ){

            return [];

        }


        const snapshot =
            await window.firebaseGet(

                window.firebaseRef(

                    window.database,

                    "dashboardData/noInfo"

                )

            );


        if(
            !snapshot ||
            !snapshot.exists()
        ){

            return [];

        }


        const data =
            snapshot.val() ||
            {};


        const years =
            new Set();


        Object.keys(data).forEach(
            period => {

                const match =
                    String(
                        period
                    ).match(
                        /^(\d{4})/
                    );


                if(match){

                    years.add(
                        Number(
                            match[1]
                        )
                    );

                }

            }
        );


        return Array.from(
            years
        ).sort(
            (a,b) =>
                a - b
        );

    }

    catch(error){

        console.error(
            "ANNUAL REPORT — NO INFO YEARS ERROR:",
            error
        );

        return [];

    }

}

// =====================================================
// DISCOVER ANNUAL REPORT YEARS FROM ALL SOURCES
// =====================================================

async function discoverAnnualReportYears(){

    const [

        existingYears,

        fwdYears,

        noInfoYears

    ] = await Promise.all([

        loadAvailableAnnualYears(),

        getAnnualYearsFromFWD(),

        getAnnualYearsFromNoInfo()

    ]);


    AVAILABLE_ANNUAL_YEARS = [

        ...new Set([

            ...existingYears,

            ...fwdYears,

            ...noInfoYears

        ])

    ]

    .sort(
        (a,b) =>
            a - b
    );


    console.log(
        "ANNUAL REPORT — ALL DISCOVERED YEARS:",
        AVAILABLE_ANNUAL_YEARS
    );


    return AVAILABLE_ANNUAL_YEARS;

}

async function ensureAnnualReportYear(year){

    try{

        year = Number(year);

        if(!year){

            return null;

        }

        if(
            !window.database ||
            !window.firebaseRef ||
            !window.firebaseGet ||
            !window.firebaseSet
        ){

            console.error(
                "ANNUAL REPORT — Firebase functions not available."
            );

            return null;

        }


        const ref =
            window.firebaseRef(

                window.database,

                getAnnualReportPath(year)

            );


        const snapshot =
            await window.firebaseGet(ref);


        // ==========================================
        // ALREADY EXISTS
        // ==========================================

        if(
            snapshot &&
            snapshot.exists()
        ){

            return snapshot.val() || {};

        }


        // ==========================================
        // CREATE EMPTY REPORT
        // ==========================================

        const emptyReport = {

            year: year,

            aircraftOnGround: null,

            aCheck: null,

            fwd: null,

            noInfo: null,

            esr: null,

            hils: null,

            workOrders: null,

            createdAt: Date.now(),

            createdBy:
                CURRENT_USER?.profile?.username ||
                CURRENT_USER?.profile?.fullName ||
                "system"

        };


        await window.firebaseSet(

            ref,

            emptyReport

        );


        console.log(
            "ANNUAL REPORT — CREATED:",
            year
        );


        if(
            !AVAILABLE_ANNUAL_YEARS.includes(year)
        ){

            AVAILABLE_ANNUAL_YEARS.push(year);

            AVAILABLE_ANNUAL_YEARS.sort(
                (a,b) => a-b
            );

        }


        return emptyReport;

    }

    catch(error){

        console.error(
            "ANNUAL REPORT — ENSURE YEAR ERROR:",
            error
        );

        return null;

    }

}

// =====================================================
// ANNUAL REPORT — HYDRATE MANUAL METRICS
// Firebase → Runtime
// =====================================================

function hydrateAnnualManualMetrics(report){

    const manual =
        report?.manualMetrics ||
        {};


    const esr =
        manual.esr ||
        {};

    const hils =
        manual.hils ||
        {};

    const wo =
        manual.workOrders ||
        {};


    // =================================================
    // ESR
    // =================================================

    if(
        typeof annualESRData !==
        "undefined"
    ){

        annualESRData.opo.open =
            Number(
                esr.opoOpen
            ) || 0;


        annualESRData.portugal.lis =
            Number(
                esr.lisOpen
            ) || 0;


        annualESRData.portugal.fao =
            Number(
                esr.faoOpen
            ) || 0;


        annualESRData.portugal.fnc =
            Number(
                esr.fncOpen
            ) || 0;


        annualESRData.spmfb.open =
            Number(
                esr.regionOpen
            ) || 0;


        calculateAnnualESRRates();

    }


    // =================================================
    // HILs
    // =================================================

    if(
        typeof annualHilsData !==
        "undefined"
    ){

        annualHilsData.opo.open =
            Number(
                hils.opoOpen
            ) || 0;


        annualHilsData.opo.closed =
            Number(
                hils.opoClosed
            ) || 0;


        annualHilsData.portugal.lisOpen =
            Number(
                hils.lisOpen
            ) || 0;


        annualHilsData.portugal.lisClosed =
            Number(
                hils.lisClosed
            ) || 0;


        annualHilsData.portugal.faoOpen =
            Number(
                hils.faoOpen
            ) || 0;


        annualHilsData.portugal.faoClosed =
            Number(
                hils.faoClosed
            ) || 0;


        annualHilsData.portugal.fncOpen =
            Number(
                hils.fncOpen
            ) || 0;


        annualHilsData.portugal.fncClosed =
            Number(
                hils.fncClosed
            ) || 0;


        annualHilsData.spmfb.open =
            Number(
                hils.regionOpen
            ) || 0;


        annualHilsData.spmfb.closed =
            Number(
                hils.regionClosed
            ) || 0;


        calculateAnnualHils();

    }


    // =================================================
    // WORK ORDERS
    // =================================================

    if(
        typeof annualWOData !==
        "undefined"
    ){

        annualWOData.opo.open =
            Number(
                wo.opoOpen
            ) || 0;


        annualWOData.opo.closed =
            Number(
                wo.opoClosed
            ) || 0;


        annualWOData.portugal.lisOpen =
            Number(
                wo.lisOpen
            ) || 0;


        annualWOData.portugal.lisClosed =
            Number(
                wo.lisClosed
            ) || 0;


        annualWOData.portugal.faoOpen =
            Number(
                wo.faoOpen
            ) || 0;


        annualWOData.portugal.faoClosed =
            Number(
                wo.faoClosed
            ) || 0;


        annualWOData.portugal.fncOpen =
            Number(
                wo.fncOpen
            ) || 0;


        annualWOData.portugal.fncClosed =
            Number(
                wo.fncClosed
            ) || 0;


        annualWOData.spmfb.open =
            Number(
                wo.regionOpen
            ) || 0;


        annualWOData.spmfb.closed =
            Number(
                wo.regionClosed
            ) || 0;


        calculateAnnualWO();

    }


    return manual;

}

// =====================================================
// LOAD ANNUAL REPORT
// =====================================================

async function loadAnnualReport(
    year
){

    try{

        year =
            Number(year);


        if(
            !year
        ){

            console.warn(
                "ANNUAL REPORT — No year supplied."
            );

            return null;

        }


        // ==========================================
        // CHECK EXISTING REPORT
        // ==========================================

        const snapshot =
            await window.firebaseGet(

                window.firebaseRef(

                    window.database,

                    getAnnualReportPath(
                        year
                    )

                )

            );


        // ==========================================
        // DOES NOT EXIST
        // ==========================================

        if(
            !snapshot ||
            !snapshot.exists()
        ){

            console.log(
                "ANNUAL REPORT — Creating empty year:",
                year
            );


            const created =
                await ensureAnnualReportYear(
                    year
                );


            CURRENT_ANNUAL_YEAR =
                year;


            CURRENT_ANNUAL_REPORT =
                created ||
                null;


            populateAnnualYearSelector();


            renderAnnualReport();


            return CURRENT_ANNUAL_REPORT;

        }


        // ==========================================
        // EXISTS
        // ==========================================

        CURRENT_ANNUAL_YEAR =
            year;


        CURRENT_ANNUAL_REPORT =
            snapshot.val() ||
            {};

hydrateAnnualManualMetrics(
    CURRENT_ANNUAL_REPORT
);

// =====================================================
// RENDER MANUAL ANNUAL SECTIONS AFTER FIREBASE LOAD
// =====================================================

if (
    typeof renderAnnualESRSection ===
    "function"
) {

    renderAnnualESRSection();

}


if (
    typeof renderAnnualHilsSection ===
    "function"
) {

    renderAnnualHilsSection();

}


if (
    typeof renderAnnualWorkOrdersSection ===
    "function"
) {

    renderAnnualWorkOrdersSection();

}

        console.log(
            "ANNUAL REPORT — Loaded:",
            year,
            CURRENT_ANNUAL_REPORT
        );


        if(
            !AVAILABLE_ANNUAL_YEARS.includes(
                year
            )
        ){

            AVAILABLE_ANNUAL_YEARS.push(
                year
            );

            AVAILABLE_ANNUAL_YEARS.sort(
                (a,b) =>
                    a - b
            );

        }


        populateAnnualYearSelector();


        renderAnnualReport();


        return CURRENT_ANNUAL_REPORT;

    }

    catch(error){

        console.error(
            "ANNUAL REPORT — LOAD ERROR:",
            error
        );

        return null;

    }

}

// =====================================================
// SAVE ANNUAL REPORT
// =====================================================

async function saveAnnualReport(
    year,
    data
){

    try{

        if(
            !year
        ){

            throw new Error(
                "ANNUAL_REPORT_YEAR_REQUIRED"
            );

        }


        if(
            !window.database ||
            !window.firebaseRef ||
            !window.firebaseSet
        ){

            throw new Error(
                "FIREBASE_NOT_READY"
            );

        }


        const reportData =
            data ||
            {};


        await window.firebaseSet(

            window.firebaseRef(

                window.database,

                getAnnualReportPath(
                    year
                )

            ),

            {

                ...reportData,

                updatedAt:
                    Date.now(),

                updatedBy:
                    CURRENT_USER?.profile?.username ||
                    CURRENT_USER?.profile?.fullName ||
                    "admin"

            }

        );


        console.log(
            "ANNUAL REPORT — Saved:",
            year
        );


        CURRENT_ANNUAL_YEAR =
            Number(year);


        CURRENT_ANNUAL_REPORT =
            reportData;

hydrateAnnualManualMetrics(
    CURRENT_ANNUAL_REPORT
);

        return true;

    }
    catch(error){

        console.error(
            "ANNUAL REPORT — SAVE ERROR:",
            error
        );


        if(
            typeof showError ===
            "function"
        ){

            showError(

                "Annual Report",

                "Unable to save the Annual Report."

            );

        }

        return false;

    }

}


// =====================================================
// INITIALISE ANNUAL REPORT
// =====================================================

async function initializeAnnualReport(){

    console.log(
        "ANNUAL REPORT — Initialising..."
    );

    if(
        !window.database ||
        !window.firebaseRef ||
        !window.firebaseGet ||
        !window.firebaseSet
    ){

        console.error(
            "ANNUAL REPORT — Firebase is not ready."
        );

        return;

    }

    // ==========================================
    // DISCOVER YEARS
    // ==========================================

    await discoverAnnualReportYears();


    // ==========================================
    // SELECT LATEST AVAILABLE YEAR
    // ==========================================

    if(
        AVAILABLE_ANNUAL_YEARS.length
    ){

        CURRENT_ANNUAL_YEAR =

            AVAILABLE_ANNUAL_YEARS[
                AVAILABLE_ANNUAL_YEARS.length - 1
            ];

    }

    else{

        /*
         * No automatic source exists yet.
         *
         * We still keep the current calendar year
         * available for manual creation through
         * Edit Visuals.
         */

        CURRENT_ANNUAL_YEAR =
            new Date().getFullYear();

    }


    // ==========================================
    // LOAD / CREATE SELECTED YEAR
    // ==========================================

    await loadAnnualReport(
        CURRENT_ANNUAL_YEAR
    );


    // ==========================================
    // FINAL SELECTOR REFRESH
    // ==========================================

    populateAnnualYearSelector();


    console.log(
        "ANNUAL REPORT — Initialised:",
        CURRENT_ANNUAL_YEAR
    );

}

// =====================================================
// POPULATE ANNUAL YEAR SELECTOR
// =====================================================

function populateAnnualYearSelector(){

    const selector =
        document.getElementById(
            "annualReportPeriod"
        );


    if(
        !selector
    ){

        return;

    }


    selector.innerHTML =
        "";


    const years = [

        ...new Set(

            AVAILABLE_ANNUAL_YEARS

                .map(Number)

                .filter(
                    year =>
                        /^\d{4}$/.test(
                            String(year)
                        )
                )

        )

    ]

    .sort(
        (a,b) =>
            b - a
    );


    // ==========================================
    // CREATE OPTIONS
    // ==========================================

    years.forEach(
        year => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                year;


            option.textContent =
                year;


            selector.appendChild(
                option
            );

        }
    );


    // ==========================================
    // SELECT CURRENT YEAR
    // ==========================================

    if(
        CURRENT_ANNUAL_YEAR &&
        years.includes(
            Number(
                CURRENT_ANNUAL_YEAR
            )
        )
    ){

        selector.value =
            CURRENT_ANNUAL_YEAR;

    }

}

// =====================================================
// CHANGE ANNUAL PERIOD
// =====================================================

async function changeAnnualReportPeriod(){

    const selector =
        document.getElementById(
            "annualReportPeriod"
        );


    if(
        !selector
    ){

        return;

    }


    const year =
        Number(
            selector.value
        );


    if(
        !year
    ){

        return;

    }


    await loadAnnualReport(
        year
    );

}


// =====================================================
// ANNUAL REPORT — MAIN RENDER
// =====================================================

async function renderAnnualReport(){

    // ==========================================
    // ANNUAL REPORT CONTENT
    // ==========================================

    const container =
        document.getElementById("annualReportContent");

    if(!container){

        console.warn(
            "ANNUAL REPORT — #annualReportContent not found."
        );

        return;

    }

    // ==========================================
    // ENSURE CURRENT YEAR EXISTS
    // ==========================================

    if(!CURRENT_ANNUAL_YEAR){

        CURRENT_ANNUAL_YEAR =
            new Date().getFullYear();

    }

    // ==========================================
    // UPDATE YEAR SELECTOR
    // ==========================================

    populateAnnualYearSelector();

    // ==========================================
    // LOAD ALL ANNUAL MODULES IN PARALLEL
    // ==========================================

    const modules = [];

    if(typeof refreshAnnualFWD === "function"){

        modules.push(refreshAnnualFWD());

    }else{

        console.error(
            "ANNUAL REPORT — refreshAnnualFWD is not available."
        );

    }

    if(typeof refreshAnnualNoInfo === "function"){

        modules.push(refreshAnnualNoInfo());

    }else{

        console.error(
            "ANNUAL REPORT — refreshAnnualNoInfo is not available."
        );

    }

    if(typeof refreshAnnualAOG === "function"){

        modules.push(refreshAnnualAOG());

    }else{

        console.error(
            "ANNUAL REPORT — refreshAnnualAOG is not available."
        );

    }

    if(typeof refreshAnnualACheck === "function"){

        modules.push(refreshAnnualACheck());

    }else{

        console.error(
            "ANNUAL REPORT — refreshAnnualACheck is not available."
        );

    }

    try{

    if(typeof refreshAnnualFWD === "function")
        await refreshAnnualFWD();

    if(typeof refreshAnnualNoInfo === "function")
        await refreshAnnualNoInfo();

    if(typeof refreshAnnualAOG === "function")
        await refreshAnnualAOG();

    if(typeof refreshAnnualACheck === "function")
        await refreshAnnualACheck();

        console.log(
            `ANNUAL REPORT — ${CURRENT_ANNUAL_YEAR} fully loaded.`
        );

    }catch(error){

        console.error(
            "ANNUAL REPORT — Error loading modules:",
            error
        );

    }

    // ==========================================
    // PRELOAD A-CHECK NEXT / PREVIOUS YEAR
    // (Performance improvement)
    // ==========================================

    if(typeof preloadAnnualACheck === "function"){

        preloadAnnualACheck(CURRENT_ANNUAL_YEAR + 1);
        preloadAnnualACheck(CURRENT_ANNUAL_YEAR - 1);

    }

}

// =====================================================
// ANNUAL REPORT — RESET CURRENT YEAR
// =====================================================

async function openAnnualReportReset(){

    executeProtectedAction(

        PERMISSIONS.RESET_DASHBOARD,

        ()=>{

            const year =
                CURRENT_ANNUAL_YEAR ||
                new Date().getFullYear();


            showConfirmation(

                "Delete Current Year",

                `You are about to permanently delete all Annual Report data for ${year}.\n\nThis action cannot be undone.`,

                async ()=>{

                    try{

                        await deleteAnnualReportYear(
                            year
                        );


                        await initializeAnnualReport();


                        showSuccess(

                            "Annual Report Deleted",

                            `All Annual Report data for ${year} has been permanently deleted.`

                        );

                    }
                    catch(error){

                        console.error(

                            "ANNUAL REPORT RESET ERROR:",

                            error

                        );


                        showError(

                            "Reset Failed",

                            "Unable to delete the selected Annual Report."

                        );

                    }

                },

                "Delete Current Year"

            );

        },

        {

            action:
                "RESET_ANNUAL_REPORT",

            details:
                "Delete Annual Report Current Year"

        }

    );

}

// =====================================================
// DELETE ANNUAL REPORT YEAR
// =====================================================

async function deleteAnnualReportYear(
    year
){

    if(
        !year
    ){

        return;

    }


    await window.firebaseRemove(

        window.firebaseRef(

            window.database,

            `${ANNUAL_REPORT_COLLECTION}/${year}`

        )

    );


    CURRENT_ANNUAL_REPORT =
        null;

}

// =====================================================
// ANNUAL REPORT — EDIT VISUALS
// =====================================================

function openAnnualReportEditVisuals(){

    executeProtectedAction(

        PERMISSIONS.EDIT_VISUALS,

        ()=>{

            openAnnualReportYearSelection(

                async year => {

                    await openAnnualReportEditModal(
                        year
                    );

                }

            );

        },

        {

            action:
                "OPEN_ANNUAL_REPORT_EDIT",

            details:
                "Annual Report Edit Visuals"

        }

    );

}

// =====================================================
// ANNUAL REPORT — YEAR SELECTION MODAL
// =====================================================

function openAnnualReportYearSelection(
    callback
){

    const existing =
        document.getElementById(
            "annualReportYearModal"
        );


    if(existing){

        existing.remove();

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "annualReportYearModal";


    modal.className =
        "notificationOverlay";


    modal.style.display =
        "flex";


    const currentYear =
        CURRENT_ANNUAL_YEAR ||
        new Date().getFullYear();


    let options =
        "";


    for(
        let year = 2024;
        year <= 2035;
        year++
    ){

        options += `

            <option
                value="${year}"
                ${
                    year === currentYear
                        ? "selected"
                        : ""
                }
            >

                ${year}

            </option>

        `;

    }


    modal.innerHTML = `

        <div
            class="notificationBox confirmationBox"
            style="
                max-width:520px;
                width:calc(100% - 40px);
            "
        >

            <div
                class="confirmationIcon"
            >

                📅

            </div>


            <div
                class="notificationTitle"
            >

                Annual Report

            </div>


            <div
                class="notificationMessage"
            >

                Which reporting year would you
                like to edit?

            </div>


            <div
                style="
                    margin-top:25px;
                    text-align:left;
                "
            >

                <label
                    style="
                        display:block;
                        margin-bottom:8px;
                        font-weight:700;
                        color:#07225B;
                    "
                >

                    Analysis Period

                </label>


                <select
                    id="annualEditYearSelector"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:12px 14px;
                        border-radius:8px;
                        border:1px solid #D6DEEA;
                        font-size:15px;
                        color:#07225B;
                        background:#FFFFFF;
                    "
                >

                    ${options}

                </select>

            </div>


            <div
                style="
                    display:flex;
                    justify-content:center;
                    gap:15px;
                    margin-top:28px;
                "
            >

                <button
                    type="button"
                    class="btn btn-white"
                    id="annualEditYearCancel"
                >

                    Cancel

                </button>


                <button
                    type="button"
                    class="btn btn-yellow"
                    id="annualEditYearContinue"
                >

                    Continue

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    // ==========================================
    // CANCEL
    // ==========================================

    document
        .getElementById(
            "annualEditYearCancel"
        )
        .addEventListener(
            "click",
            ()=>{

                modal.remove();

            }
        );


    // ==========================================
    // CONTINUE
    // ==========================================

    document
        .getElementById(
            "annualEditYearContinue"
        )
        .addEventListener(
            "click",
            async ()=>{

                const year =
                    Number(

                        document.getElementById(
                            "annualEditYearSelector"
                        ).value

                    );


                modal.remove();


                if(
                    typeof callback ===
                    "function"
                ){

                    await callback(
                        year
                    );

                }

            }
        );


    // ==========================================
    // CLICK OUTSIDE
    // ==========================================

    modal.addEventListener(
        "click",
        event => {

            if(
                event.target ===
                modal
            ){

                modal.remove();

            }

        }
    );

}

// =====================================================
// ANNUAL REPORT — EDIT VISUALS MODAL
// ESR + HILs + WORK ORDERS
// =====================================================

async function openAnnualReportEditModal(year){

    CURRENT_ANNUAL_YEAR =
        Number(year);


    await loadAnnualReport(
        CURRENT_ANNUAL_YEAR
    );


    const existing =
        document.getElementById(
            "annualReportEditModal"
        );


    if(existing){

        existing.remove();

    }


    // =================================================
    // CURRENT VALUES
    // =================================================

    const report =
        CURRENT_ANNUAL_REPORT ||
        {};


    const manual =
        report.manualMetrics ||
        {};


    const esr =
        manual.esr ||
        {};


    const hils =
        manual.hils ||
        {};


    const wo =
        manual.workOrders ||
        {};


    // =================================================
    // HELPERS
    // =================================================

    const value =
        (
            object,
            key
        ) => {

            const v =
                object?.[key];

            return (
                v === null ||
                v === undefined ||
                v === ""
            )
                ? ""
                : v;

        };


    const numberValue =
        (
            object,
            key
        ) => {

            const v =
                Number(
                    object?.[key]
                );

            return Number.isFinite(v)
                ? v
                : 0;

        };


    // =================================================
    // CREATE MODAL
    // =================================================

    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "annualReportEditModal";


    modal.className =
        "notificationOverlay";


    modal.style.display =
        "flex";


    modal.innerHTML = `

        <div
            class="
                notificationBox
                annual-edit-modal
            "
        >


            <!-- =====================================
                 HEADER
            ====================================== -->

            <div
                class="annual-edit-header"
            >

                <div>

                    <div
                        class="annual-edit-eyebrow"
                    >
                        ANNUAL REPORT
                    </div>


                    <h2>
                        Edit Visuals
                    </h2>


                    <div
                        class="annual-edit-subtitle"
                    >
                        Editing Annual Report —
                        ${year}
                    </div>

                </div>


                <button
                    type="button"
                    id="annualEditCloseButton"
                    class="annual-edit-close"
                >
                    ×
                </button>

            </div>


            <!-- =====================================
                 CONTENT
            ====================================== -->

            <div
                id="annualReportEditContent"
                class="annual-edit-content"
            >


                <!-- =================================
                     ESR
                ================================== -->

                <section
                    class="annual-edit-section"
                >

                    <div
                        class="annual-edit-section-header"
                    >

                        <div>

                            <span>
                                MANUAL INPUT
                            </span>

                            <h3>
                                ESR
                            </h3>

                        </div>

                        <div
                            class="annual-edit-section-badge"
                        >
                            5 inputs
                        </div>

                    </div>


                    <div
                        class="annual-edit-card"
                    >

                        <!-- OPO -->

                        <div
                            class="annual-edit-group"
                        >

                            <div
                                class="annual-edit-group-title"
                            >
                                OPO
                            </div>

                            <div
                                class="annual-edit-fields single"
                            >

                                <label>
                                    ESR Open

                                    <input
                                        id="annualESROpenOPO"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            esr,
                                            "opoOpen"
                                        )}"
                                    >

                                </label>

                            </div>

                        </div>


                        <!-- PORTUGAL -->

                        <div
                            class="annual-edit-group"
                        >

                            <div
                                class="annual-edit-group-title"
                            >
                                PORTUGAL
                            </div>

                            <div
                                class="annual-edit-fields"
                            >

                                <label>
                                    Lisbon

                                    <input
                                        id="annualESROpenLIS"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            esr,
                                            "lisOpen"
                                        )}"
                                    >

                                </label>


                                <label>
                                    Faro

                                    <input
                                        id="annualESROpenFAO"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            esr,
                                            "faoOpen"
                                        )}"
                                    >

                                </label>


                                <label>
                                    Funchal

                                    <input
                                        id="annualESROpenFNC"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            esr,
                                            "fncOpen"
                                        )}"
                                    >

                                </label>

                            </div>

                        </div>


                        <!-- REGION -->

                        <div
                            class="annual-edit-group region"
                        >

                            <div
                                class="annual-edit-group-title"
                            >
                                SPMFB REGION
                            </div>

                            <div
                                class="annual-edit-fields single"
                            >

                                <label>
                                    ESR Open

                                    <input
                                        id="annualESROpenRegion"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            esr,
                                            "regionOpen"
                                        )}"
                                    >

                                </label>

                            </div>

                        </div>

                    </div>

                </section>


                <!-- =================================
                     HILs
                ================================== -->

                <section
                    class="annual-edit-section"
                >

                    <div
                        class="annual-edit-section-header"
                    >

                        <div>

                            <span>
                                MANUAL INPUT
                            </span>

                            <h3>
                                HILs
                            </h3>

                        </div>

                        <div
                            class="annual-edit-section-badge"
                        >
                            10 inputs
                        </div>

                    </div>


                    <div
                        class="annual-edit-card"
                    >

                        <!-- OPO -->

                        <div
                            class="annual-edit-group"
                        >

                            <div
                                class="annual-edit-group-title"
                            >
                                OPO
                            </div>

                            <div
                                class="annual-edit-fields"
                            >

                                <label>
                                    HILs Open

                                    <input
                                        id="annualHilsOpenOPO"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            hils,
                                            "opoOpen"
                                        )}"
                                    >

                                </label>


                                <label>
                                    HILs Closed

                                    <input
                                        id="annualHilsClosedOPO"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            hils,
                                            "opoClosed"
                                        )}"
                                    >

                                </label>

                            </div>

                        </div>


                        <!-- PORTUGAL -->

                        <div
                            class="annual-edit-group"
                        >

                            <div
                                class="annual-edit-group-title"
                            >
                                PORTUGAL
                            </div>

                            <div
                                class="annual-edit-fields"
                            >

                                <label>
                                    Lisbon Open

                                    <input
                                        id="annualHilsOpenLIS"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            hils,
                                            "lisOpen"
                                        )}"
                                    >

                                </label>


                                <label>
                                    Lisbon Closed

                                    <input
                                        id="annualHilsClosedLIS"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            hils,
                                            "lisClosed"
                                        )}"
                                    >

                                </label>


                                <label>
                                    Faro Open

                                    <input
                                        id="annualHilsOpenFAO"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            hils,
                                            "faoOpen"
                                        )}"
                                    >

                                </label>


                                <label>
                                    Faro Closed

                                    <input
                                        id="annualHilsClosedFAO"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            hils,
                                            "faoClosed"
                                        )}"
                                    >

                                </label>


                                <label>
                                    Funchal Open

                                    <input
                                        id="annualHilsOpenFNC"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            hils,
                                            "fncOpen"
                                        )}"
                                    >

                                </label>


                                <label>
                                    Funchal Closed

                                    <input
                                        id="annualHilsClosedFNC"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            hils,
                                            "fncClosed"
                                        )}"
                                    >

                                </label>

                            </div>

                        </div>


                        <!-- REGION -->

                        <div
                            class="
                                annual-edit-group
                                region
                            "
                        >

                            <div
                                class="annual-edit-group-title"
                            >
                                SPMFB REGION
                            </div>

                            <div
                                class="annual-edit-fields"
                            >

                                <label>
                                    HILs Open

                                    <input
                                        id="annualHilsOpenRegion"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            hils,
                                            "regionOpen"
                                        )}"
                                    >

                                </label>


                                <label>
                                    HILs Closed

                                    <input
                                        id="annualHilsClosedRegion"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            hils,
                                            "regionClosed"
                                        )}"
                                    >

                                </label>

                            </div>

                        </div>

                    </div>

                </section>


                <!-- =================================
                     WORK ORDERS
                ================================== -->

                <section
                    class="annual-edit-section"
                >

                    <div
                        class="annual-edit-section-header"
                    >

                        <div>

                            <span>
                                MANUAL INPUT
                            </span>

                            <h3>
                                Work Orders
                            </h3>

                        </div>

                        <div
                            class="annual-edit-section-badge"
                        >
                            10 inputs
                        </div>

                    </div>


                    <div
                        class="annual-edit-card"
                    >

                        <!-- OPO -->

                        <div
                            class="annual-edit-group"
                        >

                            <div
                                class="annual-edit-group-title"
                            >
                                OPO
                            </div>

                            <div
                                class="annual-edit-fields"
                            >

                                <label>
                                    WO Open

                                    <input
                                        id="annualWOOpenOPO"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            wo,
                                            "opoOpen"
                                        )}"
                                    >

                                </label>


                                <label>
                                    WO Closed

                                    <input
                                        id="annualWOClosedOPO"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            wo,
                                            "opoClosed"
                                        )}"
                                    >

                                </label>

                            </div>

                        </div>


                        <!-- PORTUGAL -->

                        <div
                            class="annual-edit-group"
                        >

                            <div
                                class="annual-edit-group-title"
                            >
                                PORTUGAL
                            </div>

                            <div
                                class="annual-edit-fields"
                            >

                                <label>
                                    Lisbon Open

                                    <input
                                        id="annualWOOpenLIS"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            wo,
                                            "lisOpen"
                                        )}"
                                    >

                                </label>


                                <label>
                                    Lisbon Closed

                                    <input
                                        id="annualWOClosedLIS"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            wo,
                                            "lisClosed"
                                        )}"
                                    >

                                </label>


                                <label>
                                    Faro Open

                                    <input
                                        id="annualWOOpenFAO"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            wo,
                                            "faoOpen"
                                        )}"
                                    >

                                </label>


                                <label>
                                    Faro Closed

                                    <input
                                        id="annualWOClosedFAO"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            wo,
                                            "faoClosed"
                                        )}"
                                    >

                                </label>


                                <label>
                                    Funchal Open

                                    <input
                                        id="annualWOOpenFNC"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            wo,
                                            "fncOpen"
                                        )}"
                                    >

                                </label>


                                <label>
                                    Funchal Closed

                                    <input
                                        id="annualWOClosedFNC"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            wo,
                                            "fncClosed"
                                        )}"
                                    >

                                </label>

                            </div>

                        </div>


                        <!-- REGION -->

                        <div
                            class="
                                annual-edit-group
                                region
                            "
                        >

                            <div
                                class="annual-edit-group-title"
                            >
                                SPMFB REGION
                            </div>

                            <div
                                class="annual-edit-fields"
                            >

                                <label>
                                    WO Open

                                    <input
                                        id="annualWOOpenRegion"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            wo,
                                            "regionOpen"
                                        )}"
                                    >

                                </label>


                                <label>
                                    WO Closed

                                    <input
                                        id="annualWOClosedRegion"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value="${value(
                                            wo,
                                            "regionClosed"
                                        )}"
                                    >

                                </label>

                            </div>

                        </div>

                    </div>

                </section>


                <!-- =================================
                     INFORMATION
                ================================== -->

                <div
                    class="annual-edit-info"
                >

                    <span>
                        ℹ
                    </span>

                    <div>

                        <strong>
                            Automatic calculations
                        </strong>

                        <p>
                            Portugal totals, rates and
                            performance ratios are calculated
                            automatically from these inputs.
                        </p>

                    </div>

                </div>


            </div>


            <!-- =====================================
                 FOOTER
            ====================================== -->

            <div
                class="annual-edit-footer"
            >

                <button
                    type="button"
                    class="btn btn-white"
                    id="annualEditCancelButton"
                >
                    Cancel
                </button>


                <button
                    type="button"
                    class="btn btn-yellow"
                    id="annualEditSaveButton"
                >
                    Save Changes
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    // =================================================
    // CLOSE
    // =================================================

    document
        .getElementById(
            "annualEditCloseButton"
        )
        .addEventListener(
            "click",
            () => {

                modal.remove();

            }
        );


    document
        .getElementById(
            "annualEditCancelButton"
        )
        .addEventListener(
            "click",
            () => {

                modal.remove();

            }
        );


    // =================================================
    // SAVE
    // =================================================

    document
        .getElementById(
            "annualEditSaveButton"
        )
        .addEventListener(
            "click",
            async () => {


                // =====================================
                // READ ESR
                // =====================================

                const newESR = {

                    opoOpen:
                        numberValue(
                            {
                                v:
                                    document
                                        .getElementById(
                                            "annualESROpenOPO"
                                        )?.value
                            },
                            "v"
                        ),

                    lisOpen:
                        numberValue(
                            {
                                v:
                                    document
                                        .getElementById(
                                            "annualESROpenLIS"
                                        )?.value
                            },
                            "v"
                        ),

                    faoOpen:
                        numberValue(
                            {
                                v:
                                    document
                                        .getElementById(
                                            "annualESROpenFAO"
                                        )?.value
                            },
                            "v"
                        ),

                    fncOpen:
                        numberValue(
                            {
                                v:
                                    document
                                        .getElementById(
                                            "annualESROpenFNC"
                                        )?.value
                            },
                            "v"
                        ),

                    regionOpen:
                        numberValue(
                            {
                                v:
                                    document
                                        .getElementById(
                                            "annualESROpenRegion"
                                        )?.value
                            },
                            "v"
                        )

                };


                // =====================================
                // READ HILs
                // =====================================

                const newHils = {

                    opoOpen:
                        Number(
                            document
                                .getElementById(
                                    "annualHilsOpenOPO"
                                )?.value
                        ) || 0,

                    opoClosed:
                        Number(
                            document
                                .getElementById(
                                    "annualHilsClosedOPO"
                                )?.value
                        ) || 0,

                    lisOpen:
                        Number(
                            document
                                .getElementById(
                                    "annualHilsOpenLIS"
                                )?.value
                        ) || 0,

                    lisClosed:
                        Number(
                            document
                                .getElementById(
                                    "annualHilsClosedLIS"
                                )?.value
                        ) || 0,

                    faoOpen:
                        Number(
                            document
                                .getElementById(
                                    "annualHilsOpenFAO"
                                )?.value
                        ) || 0,

                    faoClosed:
                        Number(
                            document
                                .getElementById(
                                    "annualHilsClosedFAO"
                                )?.value
                        ) || 0,

                    fncOpen:
                        Number(
                            document
                                .getElementById(
                                    "annualHilsOpenFNC"
                                )?.value
                        ) || 0,

                    fncClosed:
                        Number(
                            document
                                .getElementById(
                                    "annualHilsClosedFNC"
                                )?.value
                        ) || 0,

                    regionOpen:
                        Number(
                            document
                                .getElementById(
                                    "annualHilsOpenRegion"
                                )?.value
                        ) || 0,

                    regionClosed:
                        Number(
                            document
                                .getElementById(
                                    "annualHilsClosedRegion"
                                )?.value
                        ) || 0

                };


                // =====================================
                // READ WORK ORDERS
                // =====================================

                const newWO = {

                    opoOpen:
                        Number(
                            document
                                .getElementById(
                                    "annualWOOpenOPO"
                                )?.value
                        ) || 0,

                    opoClosed:
                        Number(
                            document
                                .getElementById(
                                    "annualWOClosedOPO"
                                )?.value
                        ) || 0,

                    lisOpen:
                        Number(
                            document
                                .getElementById(
                                    "annualWOOpenLIS"
                                )?.value
                        ) || 0,

                    lisClosed:
                        Number(
                            document
                                .getElementById(
                                    "annualWOClosedLIS"
                                )?.value
                        ) || 0,

                    faoOpen:
                        Number(
                            document
                                .getElementById(
                                    "annualWOOpenFAO"
                                )?.value
                        ) || 0,

                    faoClosed:
                        Number(
                            document
                                .getElementById(
                                    "annualWOClosedFAO"
                                )?.value
                        ) || 0,

                    fncOpen:
                        Number(
                            document
                                .getElementById(
                                    "annualWOOpenFNC"
                                )?.value
                        ) || 0,

                    fncClosed:
                        Number(
                            document
                                .getElementById(
                                    "annualWOClosedFNC"
                                )?.value
                        ) || 0,

                    regionOpen:
                        Number(
                            document
                                .getElementById(
                                    "annualWOOpenRegion"
                                )?.value
                        ) || 0,

                    regionClosed:
                        Number(
                            document
                                .getElementById(
                                    "annualWOClosedRegion"
                                )?.value
                        ) || 0

                };


                // =====================================
                // UPDATE RUNTIME DATA
                // =====================================

                if(
                    typeof annualESRData !==
                    "undefined"
                ){

                    annualESRData.opo.open =
                        newESR.opoOpen;

                    annualESRData.portugal.lis =
                        newESR.lisOpen;

                    annualESRData.portugal.fao =
                        newESR.faoOpen;

                    annualESRData.portugal.fnc =
                        newESR.fncOpen;

                    annualESRData.spmfb.open =
                        newESR.regionOpen;

                }


                if(
                    typeof annualHilsData !==
                    "undefined"
                ){

                    annualHilsData.opo.open =
                        newHils.opoOpen;

                    annualHilsData.opo.closed =
                        newHils.opoClosed;

                    annualHilsData.portugal.lisOpen =
                        newHils.lisOpen;

                    annualHilsData.portugal.lisClosed =
                        newHils.lisClosed;

                    annualHilsData.portugal.faoOpen =
                        newHils.faoOpen;

                    annualHilsData.portugal.faoClosed =
                        newHils.faoClosed;

                    annualHilsData.portugal.fncOpen =
                        newHils.fncOpen;

                    annualHilsData.portugal.fncClosed =
                        newHils.fncClosed;

                    annualHilsData.spmfb.open =
                        newHils.regionOpen;

                    annualHilsData.spmfb.closed =
                        newHils.regionClosed;

                }


                if(
                    typeof annualWOData !==
                    "undefined"
                ){

                    annualWOData.opo.open =
                        newWO.opoOpen;

                    annualWOData.opo.closed =
                        newWO.opoClosed;

                    annualWOData.portugal.lisOpen =
                        newWO.lisOpen;

                    annualWOData.portugal.lisClosed =
                        newWO.lisClosed;

                    annualWOData.portugal.faoOpen =
                        newWO.faoOpen;

                    annualWOData.portugal.faoClosed =
                        newWO.faoClosed;

                    annualWOData.portugal.fncOpen =
                        newWO.fncOpen;

                    annualWOData.portugal.fncClosed =
                        newWO.fncClosed;

                    annualWOData.spmfb.open =
                        newWO.regionOpen;

                    annualWOData.spmfb.closed =
                        newWO.regionClosed;

                }


                // =====================================
                // SAVE TO ANNUAL REPORT
                // =====================================

                const updatedReport = {

                    ...CURRENT_ANNUAL_REPORT,

                    manualMetrics: {

                        ...(CURRENT_ANNUAL_REPORT?.manualMetrics || {}),

                        esr:
                            newESR,

                        hils:
                            newHils,

                        workOrders:
                            newWO

                    }

                };


                const saved =
                    await saveAnnualReport(
                        year,
                        updatedReport
                    );


                if(!saved){

                    return;

                }


                // =====================================
                // RECALCULATE SECTIONS
                // =====================================

                if(
                    typeof calculateAnnualESRRates ===
                    "function"
                ){

                    calculateAnnualESRRates();

                }


                if(
                    typeof calculateAnnualHils ===
                    "function"
                ){

                    calculateAnnualHils();

                }


                if(
                    typeof calculateAnnualWO ===
                    "function"
                ){

                    calculateAnnualWO();

                }


                if(
                    typeof renderAnnualESRSection ===
                    "function"
                ){

                    renderAnnualESRSection();

                }


                if(
                    typeof renderAnnualHilsSection ===
                    "function"
                ){

                    renderAnnualHilsSection();

                }


                if(
                    typeof renderAnnualWorkOrdersSection ===
                    "function"
                ){

                    renderAnnualWorkOrdersSection();

                }


                modal.remove();


                showSuccess(

                    "Annual Report Updated",

                    `Annual Report ${year} has been successfully updated.`

                );

            }
        );


    // =================================================
    // CLICK OUTSIDE
    // =================================================

    modal.addEventListener(
        "click",
        event => {

            if(
                event.target === modal
            ){

                modal.remove();

            }

        }
    );

}

// =====================================================
// ANNUAL REPORT — FWD DATA SOURCE
// =====================================================

const ANNUAL_FWD_COLLECTION =
    "dashboardData/FWD";


async function loadAnnualFWDData(year){

    try{

        if(
            !window.database ||
            !window.firebaseRef ||
            !window.firebaseGet
        ){

            console.error(
                "ANNUAL FWD — Firebase not ready."
            );

            return {

                year: year,

                months: {},

                availableMonths: []

            };

        }


        const snapshot =
            await window.firebaseGet(

                window.firebaseRef(

                    window.database,

                    `${ANNUAL_FWD_COLLECTION}/${year}`

                )

            );


        if(
            !snapshot ||
            !snapshot.exists()
        ){

            console.log(
                "ANNUAL FWD — No data for:",
                year
            );

            return {

                year: year,

                months: {},

                availableMonths: []

            };

        }


        const yearData =
            snapshot.val() || {};


        const availableMonths =

            Object.keys(yearData)

                .filter(
                    month =>
                        /^\d{1,2}$/.test(
                            String(month)
                        )
                )

                .map(Number)

                .sort(
                    (a,b) => a-b
                );


        console.log(
            "ANNUAL FWD — Months:",
            availableMonths
        );


        return {

            year: year,

            months: yearData,

            availableMonths:
                availableMonths

        };

    }

    catch(error){

        console.error(
            "ANNUAL FWD — LOAD ERROR:",
            error
        );

        return {

            year: year,

            months: {},

            availableMonths: []

        };

    }

}

// =====================================================
// ANNUAL FWD — BUILD YEARLY ANALYSIS (PORTUGAL VERSION)
// =====================================================

function buildAnnualFWDAnalysis(yearData){

    const result = {

        year: yearData.year,

        months: [],

        totals:{

            opo:{ fwd:0, nightStops:0, rate:0 },
            lis:{ fwd:0, nightStops:0, rate:0 },
            fao:{ fwd:0, nightStops:0, rate:0 },
            fnc:{ fwd:0, nightStops:0, rate:0 },

            portugal:{ fwd:0, nightStops:0, rate:0 },
            spmfb:{ fwd:0, nightStops:0, rate:0 }

        },

        monthly:{

            opo:[],
            lis:[],
            fao:[],
            fnc:[],

            portugal:[],
            spmfb:[]

        },

        delayCodes:{

            opo:{},
            lis:{},
            fao:{},
            fnc:{}

        }

    };


    // =================================================
    // LOOP MONTHS
    // =================================================

    yearData.availableMonths.forEach(month=>{

        const monthKey =
            String(month).padStart(2,"0");

        const monthData =
            yearData.months[monthKey] ||
            yearData.months[month];

        if(!monthData || typeof monthData !== "object"){
            return;
        }

        const monthStats = {

            opo:{ fwd:0, nightStops:0 },
            lis:{ fwd:0, nightStops:0 },
            fao:{ fwd:0, nightStops:0 },
            fnc:{ fwd:0, nightStops:0 },

            portugal:{ fwd:0, nightStops:0 },
            spmfb:{ fwd:0, nightStops:0 }

        };


        // =============================================
        // LOOP DAYS
        // =============================================

        Object.keys(monthData).forEach(day=>{

            const dayData = monthData[day];

            if(!dayData || typeof dayData !== "object"){
                return;
            }


            // =========================================
            // LOOP BASES
            // =========================================

            Object.keys(dayData).forEach(base=>{

                const data = dayData[base];

                if(!data || typeof data !== "object"){
                    return;
                }

                const fwd =
                    Number(data.fwd) || 0;

                const nightStop =
                    Number(data.nightStop) || 0;

                const country =
                    BASE_COUNTRIES?.[base];


                // =====================================
                // INDIVIDUAL BASE TOTALS
                // =====================================

                switch(base){

                    case "OPO":
                        monthStats.opo.fwd += fwd;
                        monthStats.opo.nightStops += nightStop;
                        break;

                    case "LIS":
                        monthStats.lis.fwd += fwd;
                        monthStats.lis.nightStops += nightStop;
                        break;

                    case "FAO":
                        monthStats.fao.fwd += fwd;
                        monthStats.fao.nightStops += nightStop;
                        break;

                    case "FNC":
                        monthStats.fnc.fwd += fwd;
                        monthStats.fnc.nightStops += nightStop;
                        break;

                }


                // =====================================
                // PORTUGAL TOTAL
                // =====================================

                if(country === "Portugal"){

                    monthStats.portugal.fwd += fwd;
                    monthStats.portugal.nightStops += nightStop;

                }


                // =====================================
                // SPMFB REGION TOTAL
                // =====================================

                monthStats.spmfb.fwd += fwd;
                monthStats.spmfb.nightStops += nightStop;


                // =====================================
                // DELAY EVENTS (CORRIGIDO)
                // =====================================

                if(["OPO","LIS","FAO","FNC"].includes(base)){

                    const key = base.toLowerCase();

                    const delayEvents =
                        Array.isArray(data.delayEvents)
                            ? data.delayEvents
                            : [];

                    delayEvents.forEach(event=>{

                        const code =
                            String(event.code || "").trim();

                        if(!code) return;

                        const description =
                            String(event.description || "").trim();

                        if(!result.delayCodes[key][code]){

                            result.delayCodes[key][code] = {

                                count:0,
                                description: description || "Delay Code"

                            };

                        }

                        result.delayCodes[key][code].count++;

                    });

                }

            });

        });


        // =============================================
        // SAVE MONTHLY TOTALS
        // =============================================

        result.months.push(month);

        ["opo","lis","fao","fnc","portugal","spmfb"].forEach(base=>{

            result.monthly[base].push({

                month,

                fwd: monthStats[base].fwd,

                nightStops: monthStats[base].nightStops

            });

            result.totals[base].fwd += monthStats[base].fwd;
            result.totals[base].nightStops += monthStats[base].nightStops;

        });

    });


    // =================================================
    // CALCULATE RATES
    // =================================================

    ["opo","lis","fao","fnc","portugal","spmfb"].forEach(base=>{

        const total = result.totals[base];

        total.rate =
            total.nightStops > 0
                ? Number(
                    ((total.fwd / total.nightStops) * 100).toFixed(1)
                )
                : 0;

    });


    // =================================================
    // MOST FREQUENT DELAY CODE BY BASE
    // =================================================

    ["opo","lis","fao","fnc"].forEach(base=>{

        const codes = result.delayCodes[base];

        let top = {

            code:"—",
            description:"No Delay Events",
            count:0,
            percentage:0

        };

        Object.entries(codes).forEach(([code,info])=>{

            if(info.count > top.count){

                top = {

                    code,

                    description: info.description,

                    count: info.count,

                    percentage:
                        result.totals[base].fwd > 0
                            ? Number(
                                (
                                    (info.count / result.totals[base].fwd) * 100
                                ).toFixed(1)
                            )
                            : 0

                };

            }

        });

        result.delayCodes[base] = top;

    });


    return result;

}

// =====================================================
// ANNUAL FWD — RENDER SECTION
// =====================================================

function renderAnnualFWDSection(analysis){

    const container =
        document.getElementById("annualFWDContent");

    if(!container) return;

    if(!analysis){
        container.innerHTML = "";
        return;
    }

    // =================================================
    // ANNUAL DATA
    // =================================================

    const totals = analysis.totals || {};

    const opo = totals.opo || {};
    const lis = totals.lis || {};
    const fao = totals.fao || {};
    const fnc = totals.fnc || {};

    const portugal = totals.portugal || {};
    const spmfb = totals.spmfb || {};

    // =================================================
    // MONTHLY DATA
    // =================================================

    const months = analysis.months || [];

    const opoMonthly = analysis.monthly?.opo || [];
    const lisMonthly = analysis.monthly?.lis || [];
    const faoMonthly = analysis.monthly?.fao || [];
    const fncMonthly = analysis.monthly?.fnc || [];

    const portugalMonthly = analysis.monthly?.portugal || [];
    const spmfbMonthly = analysis.monthly?.spmfb || [];

    // =================================================
    // MONTH NAMES
    // =================================================

    const monthNames = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    // =================================================
    // PEAK (PORTUGAL ONLY)
    // =================================================

    function getPeak(data){

        if(!Array.isArray(data) || !data.length){
            return null;
        }

        return data.reduce((max,current)=>
            Number(current.fwd||0) > Number(max.fwd||0)
                ? current
                : max
        );

    }

    const portugalPeak = getPeak(portugalMonthly);

    const peakMonth =
        portugalPeak
            ? monthNames[Number(portugalPeak.month)-1] || "—"
            : "—";

    const peakValue =
        portugalPeak
            ? Number(portugalPeak.fwd || 0)
            : 0;

    // =================================================
    // COMPARISON
    // =================================================

    function compareRates(baseRate,referenceRate){

        const baseValue = Number(baseRate||0);
        const refValue = Number(referenceRate||0);

        if(baseValue < refValue){
            return { text:"BETTER", className:"positive" };
        }

        if(baseValue > refValue){
            return { text:"WORSE", className:"negative" };
        }

        return { text:"IN LINE", className:"neutral" };

    }

    // =================================================
    // HTML
    // =================================================

    container.innerHTML = `

        <div class="annual-fwd-wrapper">

            <!-- =========================================
                 KPI CARDS
            ========================================== -->

            <div class="annual-fwd-kpis">

                <!-- =====================================
                     PORTUGAL BASE PERFORMANCE
                ====================================== -->

                <div class="annual-fwd-kpi annual-fwd-portugal-bases">

                    <div class="annual-fwd-kpi-title">
                        PORTUGAL BASE PERFORMANCE
                    </div>

                    <div class="annual-fwd-portugal-grid">

                        ${[
                            ["OPO","Porto",opo],
                            ["LIS","Lisbon",lis],
                            ["FAO","Faro",fao],
                            ["FNC","Funchal",fnc]
                        ].map(([code,city,data])=>`

                            <div class="annual-fwd-base-column">

                                <div class="annual-fwd-base-code">
                                    ${code}
                                </div>

                                <div class="annual-fwd-base-city">
                                    ${city}
                                </div>

                                <div class="annual-fwd-base-metric">
                                    <span>FWD</span>
                                    <strong>${Number(data.fwd||0)}</strong>
                                </div>

                                <div class="annual-fwd-base-metric">
                                    <span>RATE</span>
                                    <strong>${Number(data.rate||0).toFixed(1)}%</strong>
                                </div>

                                <div class="annual-fwd-base-metric">
                                    <span>NS</span>
                                    <strong>${Number(data.nightStops||0)}</strong>
                                </div>

                            </div>

                        `).join("")}

                    </div>

                </div>

                <!-- =====================================
                     PORTUGAL
                ====================================== -->

                <div class="annual-fwd-kpi">

                    <div class="annual-fwd-kpi-title">
                        PORTUGAL
                    </div>

                    <div class="annual-fwd-kpi-row">

                        <div>
                            <span>FWD</span>
                            <strong>${Number(portugal.fwd||0)}</strong>
                        </div>

                        <div>
                            <span>RATE</span>
                            <strong>${Number(portugal.rate||0).toFixed(1)}%</strong>
                        </div>

                        <div>
                            <span>NS</span>
                            <strong>${Number(portugal.nightStops||0)}</strong>
                        </div>

                    </div>

                </div>

                <!-- =====================================
                     SPMFB REGION
                ====================================== -->

                <div class="annual-fwd-kpi">

                    <div class="annual-fwd-kpi-title">
                        SPMFB REGION
                    </div>

                    <div class="annual-fwd-kpi-row">

                        <div>
                            <span>FWD</span>
                            <strong>${Number(spmfb.fwd||0)}</strong>
                        </div>

                        <div>
                            <span>RATE</span>
                            <strong>${Number(spmfb.rate||0).toFixed(1)}%</strong>
                        </div>

                        <div>
                            <span>NS</span>
                            <strong>${Number(spmfb.nightStops||0)}</strong>
                        </div>

                    </div>

                </div>

                <!-- =====================================
                     PORTUGAL COMPARISON
                ====================================== -->

                <div class="annual-fwd-kpi annual-fwd-comparison">

                    <div class="annual-fwd-kpi-title">
                        PORTUGAL PERFORMANCE
                    </div>

                    <div class="annual-fwd-comparison-heading">
                        PERFORMANCE VS PORTUGAL & SPMFB REGION
                    </div>

                    ${[
                        ["OPO","Porto",opo],
                        ["LIS","Lisbon",lis],
                        ["FAO","Faro",fao],
                        ["FNC","Funchal",fnc]
                    ].map(([code,city,data])=>{

                        const vsPT = compareRates(data.rate, portugal.rate);
                        const vsSP = compareRates(data.rate, spmfb.rate);

                        return `

                            <div class="annual-fwd-base-comparison-block">

                                <div class="annual-fwd-base-comparison-title">
                                    ${code} (${city})
                                </div>

                                <div class="annual-fwd-comparison-item ${vsPT.className}">
                                    <span class="comparison-indicator"></span>

                                    <div>
                                        <small>Portugal Average</small>
                                        <strong>${vsPT.text}</strong>
                                    </div>

                                </div>

                                <div class="annual-fwd-comparison-item ${vsSP.className}">
                                    <span class="comparison-indicator"></span>

                                    <div>
                                        <small>SPMFB Region Average</small>
                                        <strong>${vsSP.text}</strong>
                                    </div>

                                </div>

                            </div>

                        `;

                    }).join("")}

                </div>

<!-- =====================================
     PORTUGAL DELAY CODES PERFORMANCE
===================================== -->

<div class="annual-fwd-kpi annual-fwd-delaycodes">

    <div class="annual-fwd-kpi-title">
        DELAY CODES PERFORMANCE
    </div>

    <div class="annual-fwd-comparison-heading">
        MOST FREQUENT FIRST WAVE DELAY CODE BY BASE
    </div>

    <div class="annual-fwd-delay-grid">

        ${[
            ["OPO","Porto",analysis.delayCodes?.opo || {}],
            ["LIS","Lisbon",analysis.delayCodes?.lis || {}],
            ["FAO","Faro",analysis.delayCodes?.fao || {}],
            ["FNC","Funchal",analysis.delayCodes?.fnc || {}]
        ].map(([base,city,delay]) => `

            <div class="annual-delay-card">

                <div class="annual-delay-card-header">

                    <div>

                        <div class="annual-delay-base-code">
                            ${base}
                        </div>

                        <div class="annual-delay-base-city">
                            ${city}
                        </div>

                    </div>

                    <div class="annual-delay-code-badge">
                        ${delay.code || "—"}
                    </div>

                </div>

                <div class="annual-delay-description">
                    ${delay.description || "No delay events recorded"}
                </div>

                <div class="annual-delay-footer">

                    <div class="annual-delay-percentage">
                        ${Number(delay.percentage || 0).toFixed(1)}%
                    </div>

                    <div class="annual-delay-count">
                        ${delay.count || 0} event${Number(delay.count || 0) === 1 ? "" : "s"}
                    </div>

                </div>

            </div>

        `).join("")}

    </div>

</div>

</div>
            <!-- =========================================
                 MONTHLY CHART
            ========================================== -->

            <div class="annual-fwd-chart-card">

                <div class="annual-fwd-chart-header">

                    <div>

                        <h3>
                            Monthly FWD Performance
                        </h3>

                        <span>
                            FWD Rate (%) evolution across Portuguese bases and SPMFB Region
                        </span>

                    </div>

                    <div class="annual-fwd-peak">

                        Peak:

                        <strong>${peakMonth}</strong>

                        <span>(${peakValue} FWD)</span>

                    </div>

                </div>

                <div class="annual-fwd-chart-wrap">
                    <canvas id="annualFWDMonthlyChart"></canvas>
                </div>

            </div>

        </div>

    `;

    // =================================================
    // CHART.JS CHECK
    // =================================================

    if(typeof Chart === "undefined"){
        console.warn("Chart.js is not available.");
        return;
    }

    const canvas = document.getElementById("annualFWDMonthlyChart");
    if(!canvas) return;

    // Destroy previous chart
    if(
        window.annualFWDMonthlyChart &&
        typeof window.annualFWDMonthlyChart.destroy === "function"
    ){
        window.annualFWDMonthlyChart.destroy();
    }

    window.annualFWDMonthlyChart = null;

    // =================================================
    // LABELS
    // =================================================

    const labels = months.map(
        month => monthNames[Number(month)-1] || String(month)
    );

// =================================================
// CHART DATA (FWD RATE %)
// =================================================

function buildSeries(monthlyArray){
    return months.map(month=>{

        const row = monthlyArray.find(
            item => Number(item.month) === Number(month)
        );

        const fwd = Number(row?.fwd || 0);
        const ns  = Number(row?.nightStops || 0);

        // FWD Rate (%) = FWD / Night Stops × 100
        return ns > 0
            ? Number(((fwd / ns) * 100).toFixed(2))
            : 0;

    });
}

const opoChartData      = buildSeries(opoMonthly);
const lisChartData      = buildSeries(lisMonthly);
const faoChartData      = buildSeries(faoMonthly);
const fncChartData      = buildSeries(fncMonthly);
const portugalChartData = buildSeries(portugalMonthly);
const spmfbChartData    = buildSeries(spmfbMonthly);

// =================================================
// CREATE CHART
// =================================================

window.annualFWDMonthlyChart = new Chart(
    canvas.getContext("2d"),
    {

        type:"line",

        data:{

            labels,

            datasets:[

                {
                    label:"OPO",
                    data:opoChartData,
                    borderColor:"#003399",
                    backgroundColor:"rgba(0,51,153,0.08)",
                    borderWidth:3,
                    pointRadius:4,
                    pointHoverRadius:6,
                    pointBackgroundColor:"#003399",
                    pointBorderColor:"#FFFFFF",
                    pointBorderWidth:2,
                    tension:0.35,
                    fill:false
                },

                {
                    label:"LIS",
                    data:lisChartData,
                    borderColor:"#F5C400",
                    backgroundColor:"rgba(245,196,0,0.10)",
                    borderWidth:3,
                    pointRadius:4,
                    pointHoverRadius:6,
                    pointBackgroundColor:"#F5C400",
                    pointBorderColor:"#FFFFFF",
                    pointBorderWidth:2,
                    tension:0.35,
                    fill:false
                },

                {
                    label:"FAO",
                    data:faoChartData,
                    borderColor:"#16A34A",
                    backgroundColor:"rgba(22,163,74,0.08)",
                    borderWidth:3,
                    pointRadius:4,
                    pointHoverRadius:6,
                    pointBackgroundColor:"#16A34A",
                    pointBorderColor:"#FFFFFF",
                    pointBorderWidth:2,
                    tension:0.35,
                    fill:false
                },

                {
                    label:"FNC",
                    data:fncChartData,
                    borderColor:"#8B5CF6",
                    backgroundColor:"rgba(139,92,246,0.08)",
                    borderWidth:3,
                    pointRadius:4,
                    pointHoverRadius:6,
                    pointBackgroundColor:"#8B5CF6",
                    pointBorderColor:"#FFFFFF",
                    pointBorderWidth:2,
                    tension:0.35,
                    fill:false
                },

                {
                    label:"Portugal",
                    data:portugalChartData,
                    borderColor:"#E67E22",
                    backgroundColor:"rgba(230,126,34,0.10)",
                    borderWidth:4,
                    pointRadius:5,
                    pointHoverRadius:7,
                    pointBackgroundColor:"#E67E22",
                    pointBorderColor:"#FFFFFF",
                    pointBorderWidth:2,
                    borderDash:[8,5],
                    tension:0.35,
                    fill:false
                },

                {
                    label:"SPMFB Region",
                    data:spmfbChartData,
                    borderColor:"#64748B",
                    backgroundColor:"rgba(100,116,139,0.08)",
                    borderWidth:3,
                    pointRadius:4,
                    pointHoverRadius:6,
                    pointBackgroundColor:"#64748B",
                    pointBorderColor:"#FFFFFF",
                    pointBorderWidth:2,
                    tension:0.35,
                    fill:false
                }

            ]

        },

        options:{

            responsive:true,
            maintainAspectRatio:false,

            interaction:{
                mode:"index",
                intersect:false
            },

            plugins:{

                datalabels: annualChartDataLabels({
                    formatter:value =>
                        value > 0
                            ? `${Number(value).toFixed(1)}%`
                            : ""
                }),

                legend:{
                    display:true,
                    position:"top",
                    align:"center",

                    labels:{
                        usePointStyle:true,
                        pointStyle:"circle",
                        padding:20,
                        boxWidth:10,
                        color:"#17326B",

                        font:{
                            size:12,
                            weight:"700"
                        }
                    }
                },

                tooltip:{
                    backgroundColor:"#082D70",
                    titleColor:"#FFFFFF",
                    bodyColor:"#FFFFFF",
                    padding:12,
                    cornerRadius:8,
                    displayColors:true,

                    callbacks:{
                        label:context =>
                            `${context.dataset.label}: ${Number(context.raw).toFixed(1)}%`
                    }
                },
callbacks:{
    label:context =>
        `${context.dataset.label}: ${context.raw.toFixed(2)}%`
}

            },

            scales:{

                x:{
                    grid:{
                        display:false
                    },

                    ticks:{
                        color:"#71829A",
                        font:{
                            size:11,
                            weight:"600"
                        }
                    }
                },

                y:{
                    beginAtZero:true,

                    suggestedMax:3,

                    grid:{
                        color:"#EDF1F6"
                    },

ticks:{
    color:"#71829A",
    callback:value => `${value}%`
}
                }

            }

        }

    }

);

}

async function refreshAnnualFWD(){

    if(
        !CURRENT_ANNUAL_YEAR
    ){

        console.warn(
            "ANNUAL FWD — No current year."
        );

        return;

    }


    console.log(
        "ANNUAL FWD — Refreshing:",
        CURRENT_ANNUAL_YEAR
    );


    const data =
        await loadAnnualFWDData(
            CURRENT_ANNUAL_YEAR
        );


    console.log(
        "ANNUAL FWD — Firebase data:",
        data
    );


    const analysis =
        buildAnnualFWDAnalysis(
            data
        );


    console.log(
        "ANNUAL FWD — Analysis:",
        analysis
    );


    renderAnnualFWDSection(
        analysis
    );

}

// =====================================================
// ANNUAL REPORT — NO INFO DATA SOURCE
// =====================================================

const ANNUAL_NOINFO_COLLECTION =
    "dashboardData/noInfo";


// =====================================================
// LOAD ALL NO INFO DATA FOR A YEAR
// =====================================================

async function loadAnnualNoInfoData(
    year
){

    try{

        if(
            !window.database ||
            !window.firebaseRef ||
            !window.firebaseGet
        ){

            console.error(
                "ANNUAL NO INFO — Firebase not available."
            );

            return {

                year,
                months:{},
                availableMonths:[]

            };

        }


        const snapshot =
            await window.firebaseGet(

                window.firebaseRef(

                    window.database,

                    ANNUAL_NOINFO_COLLECTION

                )

            );


        if(
            !snapshot ||
            !snapshot.exists()
        ){

            return {

                year,

                months:{},

                availableMonths:[]

            };

        }


        const allData =
            snapshot.val() || {};


        const yearMonths = {};


        Object.keys(
            allData
        ).forEach(
            period => {

                const match =
                    String(
                        period
                    ).match(
                        /^(\d{4})-(\d{1,2})$/
                    );


                if(!match){

                    return;

                }


                const periodYear =
                    Number(
                        match[1]
                    );


                const month =
                    Number(
                        match[2]
                    );


                if(
                    periodYear !==
                    Number(year)
                ){

                    return;

                }


                yearMonths[
                    String(month)
                        .padStart(
                            2,
                            "0"
                        )
                ] =
                    allData[
                        period
                    ];

            }
        );


        const availableMonths =
            Object.keys(
                yearMonths
            )
            .map(Number)
            .sort(
                (a,b) =>
                    a - b
            );


        console.log(
            "ANNUAL NO INFO — Firebase:",
            {
                year,
                months:yearMonths,
                availableMonths
            }
        );


        return {

            year,

            months:
                yearMonths,

            availableMonths

        };

    }

    catch(error){

        console.error(
            "ANNUAL NO INFO — LOAD ERROR:",
            error
        );


        return {

            year,

            months:{},

            availableMonths:[]

        };

    }

}


// =====================================================
// ANNUAL NO INFO — BUILD YEARLY ANALYSIS (PORTUGAL VERSION)
// =====================================================

function buildAnnualNoInfoAnalysis(yearData){

    const result = {

        year: yearData?.year,

        months:[],

        totals:{
            opo:{ noInfo:0, rate:0 },
            lis:{ noInfo:0, rate:0 },
            fao:{ noInfo:0, rate:0 },
            fnc:{ noInfo:0, rate:0 },

            portugal:{ noInfo:0, rate:0 },
            spmfb:{ noInfo:0, rate:100 }
        },

        monthly:{
            opo:[],
            lis:[],
            fao:[],
            fnc:[],

            portugal:[],
            spmfb:[]
        }

    };

    if(!yearData || !Array.isArray(yearData.availableMonths)){
        return result;
    }

    yearData.availableMonths.forEach(month=>{

        const monthKey = String(month).padStart(2,"0");

        const monthData =
            yearData.months[monthKey] ||
            yearData.months[month];

        if(!monthData) return;

        const baseChart =
            Array.isArray(monthData.chart)
                ? monthData.chart
                : [];

        const getBaseValue = code=>{

            const base =
                baseChart.find(item =>
                    String(item.base || "").toUpperCase() === code
                );

            return Number(base?.val || 0);

        };

        const opoNoInfo = getBaseValue("OPO");
        const lisNoInfo = getBaseValue("LIS");
        const faoNoInfo = getBaseValue("FAO");
        const fncNoInfo = getBaseValue("FNC");

        const portugalNoInfo =
            opoNoInfo + lisNoInfo + faoNoInfo + fncNoInfo;

        const spmfbNoInfo =
            Number(monthData.total || 0);

        const calcRate = value =>
            portugalNoInfo > 0
                ? Number(((value / portugalNoInfo) * 100).toFixed(1))
                : 0;

        const portugalRate =
            spmfbNoInfo > 0
                ? Number(((portugalNoInfo / spmfbNoInfo) * 100).toFixed(1))
                : 0;

        result.months.push(month);

        result.monthly.opo.push({
            month,
            noInfo:opoNoInfo,
            rate:calcRate(opoNoInfo)
        });

        result.monthly.lis.push({
            month,
            noInfo:lisNoInfo,
            rate:calcRate(lisNoInfo)
        });

        result.monthly.fao.push({
            month,
            noInfo:faoNoInfo,
            rate:calcRate(faoNoInfo)
        });

        result.monthly.fnc.push({
            month,
            noInfo:fncNoInfo,
            rate:calcRate(fncNoInfo)
        });

        result.monthly.portugal.push({
            month,
            noInfo:portugalNoInfo,
            rate:portugalRate
        });

        result.monthly.spmfb.push({
            month,
            noInfo:spmfbNoInfo,
            rate:100
        });

        result.totals.opo.noInfo += opoNoInfo;
        result.totals.lis.noInfo += lisNoInfo;
        result.totals.fao.noInfo += faoNoInfo;
        result.totals.fnc.noInfo += fncNoInfo;

        result.totals.portugal.noInfo += portugalNoInfo;
        result.totals.spmfb.noInfo += spmfbNoInfo;

    });

    const totalPortugal = result.totals.portugal.noInfo;
    const totalSPMFB = result.totals.spmfb.noInfo;

    const calcAnnualRate = value =>
        totalPortugal > 0
            ? Number(((value / totalPortugal) * 100).toFixed(1))
            : 0;

    result.totals.opo.rate = calcAnnualRate(result.totals.opo.noInfo);
    result.totals.lis.rate = calcAnnualRate(result.totals.lis.noInfo);
    result.totals.fao.rate = calcAnnualRate(result.totals.fao.noInfo);
    result.totals.fnc.rate = calcAnnualRate(result.totals.fnc.noInfo);

    result.totals.portugal.rate =
        totalSPMFB > 0
            ? Number(((totalPortugal / totalSPMFB) * 100).toFixed(1))
            : 0;

    result.totals.spmfb.rate = 100;

    return result;

}

// =====================================================
// ANNUAL NO INFO — RATE COMPARISON
// =====================================================

function compareAnnualNoInfoRates(
    opoRate,
    referenceRate
){

    const opo =
        Number(
            opoRate || 0
        );


    const reference =
        Number(
            referenceRate || 0
        );


    // Lower No Info share = better
    if(
        opo <
        reference
    ){

        return {

            text:
                "BETTER",

            className:
                "positive"

        };

    }


    if(
        opo >
        reference
    ){

        return {

            text:
                "WORSE",

            className:
                "negative"

        };

    }


    return {

        text:
            "IN LINE",

        className:
            "neutral"

    };

}


// =====================================================
// ANNUAL NO INFO — RENDER SECTION (PORTUGAL VERSION)
// =====================================================

function renderAnnualNoInfoSection(analysis){

    const container =
        document.getElementById("annualNoInfoContent");

    if(!container){
        console.warn("ANNUAL NO INFO — Content container not found.");
        return;
    }

    if(!analysis){
        container.innerHTML = "";
        return;
    }

    // =================================================
    // TOTALS
    // =================================================

    const totals = analysis.totals || {};

    const opo = totals.opo || {};
    const lis = totals.lis || {};
    const fao = totals.fao || {};
    const fnc = totals.fnc || {};

    const portugal = totals.portugal || {};
    const spmfb = totals.spmfb || {};

    // =================================================
    // MONTHLY DATA
    // =================================================

    const months = analysis.months || [];

    const opoMonthly = analysis.monthly?.opo || [];
    const lisMonthly = analysis.monthly?.lis || [];
    const faoMonthly = analysis.monthly?.fao || [];
    const fncMonthly = analysis.monthly?.fnc || [];

    const portugalMonthly = analysis.monthly?.portugal || [];
    const spmfbMonthly = analysis.monthly?.spmfb || [];

    // =================================================
    // MONTH NAMES
    // =================================================

    const monthNames = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    // =================================================
    // PEAK MONTH (PORTUGAL)
    // =================================================

    const peak =
        portugalMonthly.reduce((max,item)=>
            !max || item.noInfo > max.noInfo
                ? item
                : max,
            null
        );

    const peakMonth =
        peak
            ? monthNames[Number(peak.month)-1]
            : "—";

    const peakValue =
        peak
            ? Number(peak.noInfo || 0)
            : 0;

    // =================================================
    // HTML
    // =================================================

    container.innerHTML = `

        <div class="annual-fwd-wrapper annual-noinfo-wrapper">

            <!-- =====================================
                 KPI CARDS
            ====================================== -->

            <div class="annual-fwd-kpis">

                <!-- PORTUGAL BASE PERFORMANCE -->

                <div class="annual-fwd-kpi annual-fwd-portugal-bases">

                    <div class="annual-fwd-kpi-title">
                        PORTUGAL BASE PERFORMANCE
                    </div>

                    <div class="annual-fwd-portugal-grid">

                        ${[
                            ["OPO","Porto",opo],
                            ["LIS","Lisbon",lis],
                            ["FAO","Faro",fao],
                            ["FNC","Funchal",fnc]
                        ].map(([code,city,data])=>`

                            <div class="annual-fwd-base-column">

                                <div class="annual-fwd-base-code">
                                    ${code}
                                </div>

                                <div class="annual-fwd-base-city">
                                    ${city}
                                </div>

                                <div class="annual-fwd-base-metric">
                                    <span>NO INFO</span>
                                    <strong>${Math.round(Number(data.noInfo || 0))}</strong>
                                </div>

                                <div class="annual-fwd-base-metric">
                                    <span>RATE</span>
                                    <strong>${Number(data.rate || 0).toFixed(1)}%</strong>
                                </div>

                            </div>

                        `).join("")}

                    </div>

                </div>

                <!-- PORTUGAL + SPMFB REGION -->

<div class="annual-fwd-kpi annual-noinfo-portugal-region">

    <div class="annual-fwd-kpi-title">
        PORTUGAL & SPMFB REGION
    </div>

    <div class="annual-noinfo-region-grid">

        <!-- Portugal -->

        <div class="annual-noinfo-region-card">

            <div class="annual-noinfo-region-heading">
                PORTUGAL
            </div>

            <div class="annual-noinfo-region-value">
                <span>NO INFO</span>
                <strong>${Math.round(Number(portugal.noInfo || 0))}</strong>
            </div>

            <div class="annual-noinfo-region-value">
                <span>RATE vs SPMFB</span>
                <strong>${Number(portugal.rate || 0).toFixed(1)}%</strong>
            </div>

        </div>

        <!-- SPMFB -->

        <div class="annual-noinfo-region-card">

            <div class="annual-noinfo-region-heading">
                SPMFB REGION
            </div>

            <div class="annual-noinfo-region-value annual-noinfo-region-only">

                <span>NO INFO</span>

                <strong>${Math.round(Number(spmfb.noInfo || 0))}</strong>

            </div>

        </div>

    </div>

</div>

            <!-- =====================================
                 MONTHLY NO INFO CHART
            ====================================== -->

            <div class="annual-fwd-chart-card">

                <div class="annual-fwd-chart-header">

                    <div>

                        <h3>
                            Monthly No Info Performance
                        </h3>

                        <span>
                            Number of No Info events across Portuguese bases
                        </span>

                    </div>

                    <div class="annual-fwd-peak">

                        Peak:

                        <strong>${peakMonth}</strong>

                        <span>(${peakValue} No Info)</span>

                    </div>

                </div>

                <div class="annual-fwd-chart-wrap">

                    <canvas id="annualNoInfoMonthlyChart"></canvas>

                </div>

            </div>

        </div>

    `;

    // =================================================
    // CHART.JS CHECK
    // =================================================

    if(typeof Chart === "undefined"){
        console.warn("ANNUAL NO INFO — Chart.js not available.");
        return;
    }

    const canvas =
        document.getElementById("annualNoInfoMonthlyChart");

    if(!canvas){
        return;
    }

    // Destroy previous chart

    if(
        window.annualNoInfoMonthlyChart &&
        typeof window.annualNoInfoMonthlyChart.destroy === "function"
    ){
        window.annualNoInfoMonthlyChart.destroy();
    }

    window.annualNoInfoMonthlyChart = null;

    // =================================================
    // LABELS
    // =================================================

    const labels =
        months.map(month =>
            monthNames[Number(month)-1] || String(month)
        );

    // =================================================
    // MONTHLY VALUES (NUMBER OF NO INFOS)
    // =================================================

    function monthlyValues(data){

        return months.map(month=>{

            const row =
                data.find(item =>
                    Number(item.month) === Number(month)
                );

            return Number(row?.noInfo || 0);

        });

    }

    const opoData = monthlyValues(opoMonthly);
    const lisData = monthlyValues(lisMonthly);
    const faoData = monthlyValues(faoMonthly);
    const fncData = monthlyValues(fncMonthly);

    const portugalData = monthlyValues(portugalMonthly);
    const spmfbData = monthlyValues(spmfbMonthly);

    // =================================================
    // CREATE CHART
    // =================================================

    window.annualNoInfoMonthlyChart = new Chart(

        canvas.getContext("2d"),

        {

            type:"line",

            data:{

                labels,

                datasets:[

                    {
                        label:"OPO",
                        data:opoData,
                        borderColor:"#003399",
                        backgroundColor:"rgba(0,51,153,0.08)",
                        borderWidth:3,
                        pointRadius:4,
                        pointHoverRadius:6,
                        pointBackgroundColor:"#003399",
                        pointBorderColor:"#FFFFFF",
                        pointBorderWidth:2,
                        tension:0.35,
                        fill:false
                    },

                    {
                        label:"LIS",
                        data:lisData,
                        borderColor:"#F5C400",
                        backgroundColor:"rgba(245,196,0,0.10)",
                        borderWidth:3,
                        pointRadius:4,
                        pointHoverRadius:6,
                        pointBackgroundColor:"#F5C400",
                        pointBorderColor:"#FFFFFF",
                        pointBorderWidth:2,
                        tension:0.35,
                        fill:false
                    },

                    {
                        label:"FAO",
                        data:faoData,
                        borderColor:"#16A34A",
                        backgroundColor:"rgba(22,163,74,0.08)",
                        borderWidth:3,
                        pointRadius:4,
                        pointHoverRadius:6,
                        pointBackgroundColor:"#16A34A",
                        pointBorderColor:"#FFFFFF",
                        pointBorderWidth:2,
                        tension:0.35,
                        fill:false
                    },

                    {
                        label:"FNC",
                        data:fncData,
                        borderColor:"#8B5CF6",
                        backgroundColor:"rgba(139,92,246,0.08)",
                        borderWidth:3,
                        pointRadius:4,
                        pointHoverRadius:6,
                        pointBackgroundColor:"#8B5CF6",
                        pointBorderColor:"#FFFFFF",
                        pointBorderWidth:2,
                        tension:0.35,
                        fill:false
                    },

                    {
                        label:"Portugal",
                        data:portugalData,
                        borderColor:"#E67E22",
                        backgroundColor:"rgba(230,126,34,0.10)",
                        borderWidth:4,
                        borderDash:[8,5],
                        pointRadius:5,
                        pointHoverRadius:7,
                        pointBackgroundColor:"#E67E22",
                        pointBorderColor:"#FFFFFF",
                        pointBorderWidth:2,
                        tension:0.35,
                        fill:false
                    },

                    {
                        label:"SPMFB Region",
                        data:spmfbData,
                        borderColor:"#64748B",
                        backgroundColor:"rgba(100,116,139,0.08)",
                        borderWidth:3,
                        pointRadius:4,
                        pointHoverRadius:6,
                        pointBackgroundColor:"#64748B",
                        pointBorderColor:"#FFFFFF",
                        pointBorderWidth:2,
                        tension:0.35,
                        fill:false
                    }

                ]

            },

            options:{

                responsive:true,
                maintainAspectRatio:false,

                interaction:{
                    mode:"index",
                    intersect:false
                },

                plugins:{

                    datalabels: annualChartDataLabels(),

                    legend:{
                        display:true,
                        position:"top",
                        align:"center",

                        labels:{
                            usePointStyle:true,
                            pointStyle:"circle",
                            padding:20,
                            boxWidth:10,
                            color:"#17326B",

                            font:{
                                size:12,
                                weight:"700"
                            }
                        }
                    },

                    tooltip:{
                        backgroundColor:"#082D70",
                        titleColor:"#FFFFFF",
                        bodyColor:"#FFFFFF",
                        padding:12,
                        cornerRadius:8,

                        callbacks:{
                            label:context =>
                                `${context.dataset.label}: ${context.raw} No Info`
                        }

                    }

                },

                scales:{

                    x:{
                        grid:{
                            display:false
                        },

                        ticks:{
                            color:"#71829A",

                            font:{
                                size:11,
                                weight:"600"
                            }

                        }

                    },

                    y:{

                        beginAtZero:true,

                        grid:{
                            color:"#EDF1F6"
                        },

                        ticks:{
                            color:"#71829A",
                            precision:0
                        }

                    }

                }

            }

        }

    );

}

// =====================================================
// ANNUAL NO INFO — REFRESH
// =====================================================

async function refreshAnnualNoInfo(){

    if(
        !CURRENT_ANNUAL_YEAR
    ){

        console.warn(
            "ANNUAL NO INFO — No current year."
        );

        return;

    }


    console.log(
        "ANNUAL NO INFO — Refreshing:",
        CURRENT_ANNUAL_YEAR
    );


    const data =
        await loadAnnualNoInfoData(
            CURRENT_ANNUAL_YEAR
        );


    const analysis =
        buildAnnualNoInfoAnalysis(
            data
        );


    renderAnnualNoInfoSection(
        analysis
    );

}

// =====================================================
// ANNUAL REPORT — ESR
// MANUAL KPI DATA
// =====================================================

const annualESRData = {

    opo:{
        open:0,
        rate:0
    },

    portugal:{
        lis:0,
        fao:0,
        fnc:0,
        open:0,
        rate:0
    },

    spmfb:{
        open:0
    }

};

// =====================================================
// ESR RATE CALCULATION
// =====================================================

function calculateAnnualESRRates(){

    const opoOpen = Number(annualESRData.opo.open || 0);
    const lisOpen = Number(annualESRData.portugal.lis || 0);
    const faoOpen = Number(annualESRData.portugal.fao || 0);
    const fncOpen = Number(annualESRData.portugal.fnc || 0);

    const spmfbOpen = Number(annualESRData.spmfb.open || 0);

    // Portugal total
    annualESRData.portugal.open =
        opoOpen +
        lisOpen +
        faoOpen +
        fncOpen;

    const portugalOpen =
        annualESRData.portugal.open;

    // ==============================
    // BASES VS PORTUGAL
    // ==============================

    annualESRData.opo.rate =
        portugalOpen > 0
            ? (opoOpen / portugalOpen) * 100
            : 0;

    annualESRData.portugal.lisRate =
        portugalOpen > 0
            ? (lisOpen / portugalOpen) * 100
            : 0;

    annualESRData.portugal.faoRate =
        portugalOpen > 0
            ? (faoOpen / portugalOpen) * 100
            : 0;

    annualESRData.portugal.fncRate =
        portugalOpen > 0
            ? (fncOpen / portugalOpen) * 100
            : 0;

    // ==============================
    // PORTUGAL VS SPMFB
    // ==============================

    annualESRData.portugal.rate =
        spmfbOpen > 0
            ? (portugalOpen / spmfbOpen) * 100
            : 0;

    return annualESRData;

}

// =====================================================
// ESR COMPARISON
// Lower RATE = BETTER
// =====================================================

function compareAnnualESR(baseRate,referenceRate){

    const base = Number(baseRate || 0);
    const reference = Number(referenceRate || 0);

    if(base < reference){
        return {
            text:"BETTER",
            className:"positive"
        };
    }

    if(base > reference){
        return {
            text:"WORSE",
            className:"negative"
        };
    }

    return {
        text:"IN LINE",
        className:"neutral"
    };

}

// =====================================================
// ESR KPI RENDER
// =====================================================

function renderAnnualESRSection(){

    const container =
        document.getElementById("annualESRContent");

    if(!container){
        console.warn("ANNUAL ESR — container not found.");
        return;
    }

    calculateAnnualESRRates();

    const opo = annualESRData.opo;
    const portugal = annualESRData.portugal;
    const spmfb = annualESRData.spmfb;

    container.innerHTML = `

        <div class="annual-fwd-wrapper annual-esr-wrapper">

            <div class="annual-fwd-kpis">

                <!-- =================================
                     PORTUGAL BASE PERFORMANCE
                ================================== -->

                <div class="annual-fwd-kpi annual-fwd-portugal-bases">

                    <div class="annual-fwd-kpi-title">
                        PORTUGAL BASE PERFORMANCE
                    </div>

                    <div class="annual-fwd-portugal-grid">

                        ${[
                            ["OPO","Porto",opo.open,opo.rate],
                            ["LIS","Lisbon",portugal.lis,portugal.lisRate],
                            ["FAO","Faro",portugal.fao,portugal.faoRate],
                            ["FNC","Funchal",portugal.fnc,portugal.fncRate]
                        ].map(([code,city,open,rate])=>`

                            <div class="annual-fwd-base-column">

                                <div class="annual-fwd-base-code">
                                    ${code}
                                </div>

                                <div class="annual-fwd-base-city">
                                    ${city}
                                </div>

                                <div class="annual-fwd-base-metric">
                                    <span>OPEN</span>
                                    <strong>${open}</strong>
                                </div>

                                <div class="annual-fwd-base-metric">
                                    <span>RATE</span>
                                    <strong>${Number(rate || 0).toFixed(1)}%</strong>
                                </div>

                            </div>

                        `).join("")}

                    </div>

                </div>

                <!-- =================================
                     PORTUGAL + SPMFB REGION
                ================================== -->

                <div class="annual-fwd-kpi annual-noinfo-portugal-region">

                    <div class="annual-fwd-kpi-title">
                        PORTUGAL & SPMFB REGION
                    </div>

                    <div class="annual-noinfo-region-grid">

                        <!-- Portugal -->

                        <div class="annual-noinfo-region-card">

                            <div class="annual-noinfo-region-heading">
                                PORTUGAL
                            </div>

                            <div class="annual-noinfo-region-value">
                                <span>OPEN</span>
                                <strong>${portugal.open}</strong>
                            </div>

                            <div class="annual-noinfo-region-value">
                                <span>RATE vs SPMFB</span>
                                <strong>${Number(portugal.rate || 0).toFixed(1)}%</strong>
                            </div>

                        </div>

                        <!-- SPMFB -->

                        <div class="annual-noinfo-region-card">

                            <div class="annual-noinfo-region-heading">
                                SPMFB REGION
                            </div>

                            <div class="annual-noinfo-region-value annual-noinfo-region-only">

                                <span>OPEN</span>

                                <strong>${spmfb.open}</strong>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    `;

}

// =====================================================
// ANNUAL REPORT — HILs
// MANUAL KPI DATA
// =====================================================

const annualHilsData = {

    opo: {
        open: 0,
        closed: 0,
        openRate: 0,
        closedRate: 0,
        ratio: 0
    },

    portugal: {

        lisOpen: 0,
        faoOpen: 0,
        fncOpen: 0,

        lisClosed: 0,
        faoClosed: 0,
        fncClosed: 0,

        open: 0,
        closed: 0,

        openRate: 0,
        closedRate: 0,

        ratio: 0

    },

    spmfb: {

        open: 0,
        closed: 0,

        ratio: 0

    }

};


// =====================================================
// HILs — CALCULATIONS
// =====================================================

function calculateAnnualHils(){

    const opoOpen = Number(annualHilsData.opo.open || 0);
    const opoClosed = Number(annualHilsData.opo.closed || 0);

    const lisOpen = Number(annualHilsData.portugal.lisOpen || 0);
    const lisClosed = Number(annualHilsData.portugal.lisClosed || 0);

    const faoOpen = Number(annualHilsData.portugal.faoOpen || 0);
    const faoClosed = Number(annualHilsData.portugal.faoClosed || 0);

    const fncOpen = Number(annualHilsData.portugal.fncOpen || 0);
    const fncClosed = Number(annualHilsData.portugal.fncClosed || 0);

    // =========================================
    // PORTUGAL TOTALS
    // =========================================

    annualHilsData.portugal.open =
        opoOpen + lisOpen + faoOpen + fncOpen;

    annualHilsData.portugal.closed =
        opoClosed + lisClosed + faoClosed + fncClosed;

    const portugalOpen = annualHilsData.portugal.open;
    const portugalClosed = annualHilsData.portugal.closed;

    // =========================================
    // REGION
    // =========================================

    const regionOpen = Number(annualHilsData.spmfb.open || 0);
    const regionClosed = Number(annualHilsData.spmfb.closed || 0);

    // =========================================
    // BASE OPEN RATES (vs Portugal)
    // =========================================

    annualHilsData.opo.openRate =
        portugalOpen > 0 ? (opoOpen / portugalOpen) * 100 : 0;

    annualHilsData.portugal.lisOpenRate =
        portugalOpen > 0 ? (lisOpen / portugalOpen) * 100 : 0;

    annualHilsData.portugal.faoOpenRate =
        portugalOpen > 0 ? (faoOpen / portugalOpen) * 100 : 0;

    annualHilsData.portugal.fncOpenRate =
        portugalOpen > 0 ? (fncOpen / portugalOpen) * 100 : 0;

    // =========================================
    // PORTUGAL OPEN RATE (vs Region)
    // =========================================

    annualHilsData.portugal.openRate =
        regionOpen > 0 ? (portugalOpen / regionOpen) * 100 : 0;

    // =========================================
    // BASE CLOSED RATES (vs Portugal)
    // =========================================

    annualHilsData.opo.closedRate =
        portugalClosed > 0 ? (opoClosed / portugalClosed) * 100 : 0;

    annualHilsData.portugal.lisClosedRate =
        portugalClosed > 0 ? (lisClosed / portugalClosed) * 100 : 0;

    annualHilsData.portugal.faoClosedRate =
        portugalClosed > 0 ? (faoClosed / portugalClosed) * 100 : 0;

    annualHilsData.portugal.fncClosedRate =
        portugalClosed > 0 ? (fncClosed / portugalClosed) * 100 : 0;

    // =========================================
    // PORTUGAL CLOSED RATE (vs Region)
    // =========================================

    annualHilsData.portugal.closedRate =
        regionClosed > 0 ? (portugalClosed / regionClosed) * 100 : 0;

    // =========================================
    // CLOSED / OPEN RATIO
    // =========================================

    annualHilsData.opo.ratio =
        opoOpen > 0 ? opoClosed / opoOpen : 0;

    annualHilsData.portugal.lisRatio =
        lisOpen > 0 ? lisClosed / lisOpen : 0;

    annualHilsData.portugal.faoRatio =
        faoOpen > 0 ? faoClosed / faoOpen : 0;

    annualHilsData.portugal.fncRatio =
        fncOpen > 0 ? fncClosed / fncOpen : 0;

    annualHilsData.portugal.ratio =
        portugalOpen > 0 ? portugalClosed / portugalOpen : 0;

    annualHilsData.spmfb.ratio =
        regionOpen > 0 ? regionClosed / regionOpen : 0;

    return annualHilsData;

}


// =====================================================
// HILs — RATIO COMPARISON
// HIGHER CLOSED / OPEN = BETTER
// =====================================================

function compareAnnualHilsRatio(
    opoRatio,
    portugalRatio
){

    const opo =
        Number(
            opoRatio || 0
        );


    const portugal =
        Number(
            portugalRatio || 0
        );


    if(
        opo > portugal
    ){

        return {

            text:
                "BETTER",

            className:
                "positive"

        };

    }


    if(
        opo < portugal
    ){

        return {

            text:
                "WORSE",

            className:
                "negative"

        };

    }


    return {

        text:
            "IN LINE",

        className:
            "neutral"

    };

}


// =====================================================
// HILs — RENDER
// =====================================================

function renderAnnualHilsSection(){

    const container =
        document.getElementById("annualHilsContent");

    if(!container){

        console.warn("ANNUAL HILs — container not found.");
        return;

    }

    calculateAnnualHils();

    const opo = annualHilsData.opo;
    const portugal = annualHilsData.portugal;
    const spmfb = annualHilsData.spmfb;

    container.innerHTML = `

        <div class="annual-fwd-wrapper annual-hils-wrapper">

            <div class="annual-fwd-kpis">

                <!-- =================================
     PORTUGAL BASE PERFORMANCE
================================== -->

<div class="annual-fwd-kpi annual-hils-portugal-bases">

    <div class="annual-fwd-kpi-title">
        PORTUGAL BASE PERFORMANCE
    </div>

    <div class="annual-hils-base-grid">

        ${[
            ["OPO","Porto",opo.open,opo.openRate,opo.closed,opo.closedRate,opo.ratio],
            ["LIS","Lisbon",portugal.lisOpen,portugal.lisOpenRate,portugal.lisClosed,portugal.lisClosedRate,portugal.lisRatio],
            ["FAO","Faro",portugal.faoOpen,portugal.faoOpenRate,portugal.faoClosed,portugal.faoClosedRate,portugal.faoRatio],
            ["FNC","Funchal",portugal.fncOpen,portugal.fncOpenRate,portugal.fncClosed,portugal.fncClosedRate,portugal.fncRatio]
        ].map(([code,city,open,openRate,closed,closedRate,ratio])=>`

            <div class="annual-hils-base-column">

                <div class="annual-hils-base-header">

                    <div class="annual-fwd-base-code">${code}</div>

                    <div class="annual-fwd-base-city">${city}</div>

                </div>

                <div class="annual-hils-base-row">
                    <span>HILs OPEN</span>
                    <strong>${open}</strong>
                </div>

                <div class="annual-hils-base-row">
                    <span>OPEN RATE</span>
                    <strong>${Number(openRate).toFixed(1)}%</strong>
                </div>

                <div class="annual-hils-base-row">
                    <span>HILs CLOSED</span>
                    <strong>${closed}</strong>
                </div>

                <div class="annual-hils-base-row">
                    <span>CLOSED RATE</span>
                    <strong>${Number(closedRate).toFixed(1)}%</strong>
                </div>

                <div class="annual-hils-ratio-card">

                    <span>CLOSED / OPEN</span>

                    <strong>${Number(ratio).toFixed(2)}</strong>

                </div>

            </div>

        `).join("")}

    </div>

</div>

                <!-- =========================================
     SECOND ROW
========================================= -->

<div class="annual-hils-bottom-grid">

    <!-- PORTUGAL + SPMFB -->

    <div class="annual-fwd-kpi">

        <div class="annual-fwd-kpi-title">
            PORTUGAL & SPMFB REGION
        </div>

        <div class="annual-hils-region-grid">

            <div class="annual-hils-region-card">

                <div class="annual-hils-region-heading">
                    PORTUGAL
                </div>

                <div class="annual-hils-region-row">
                    <span>HILs OPEN</span>
                    <strong>${portugal.open}</strong>
                </div>

                <div class="annual-hils-region-row">
                    <span>OPEN RATE</span>
                    <strong>${portugal.openRate.toFixed(1)}%</strong>
                </div>

                <div class="annual-hils-region-row">
                    <span>HILs CLOSED</span>
                    <strong>${portugal.closed}</strong>
                </div>

                <div class="annual-hils-region-row">
                    <span>CLOSED RATE</span>
                    <strong>${portugal.closedRate.toFixed(1)}%</strong>
                </div>

                <div class="annual-hils-ratio-card">
                    <span>CLOSED / OPEN</span>
                    <strong>${portugal.ratio.toFixed(2)}</strong>
                </div>

            </div>

            <div class="annual-hils-region-card">

                <div class="annual-hils-region-heading">
                    SPMFB REGION
                </div>

                <div class="annual-hils-region-row">
                    <span>HILs OPEN</span>
                    <strong>${spmfb.open}</strong>
                </div>

                <div class="annual-hils-region-row">
                    <span>HILs CLOSED</span>
                    <strong>${spmfb.closed}</strong>
                </div>

                <div class="annual-hils-ratio-card">
                    <span>CLOSED / OPEN</span>
                    <strong>${spmfb.ratio.toFixed(2)}</strong>
                </div>

            </div>

        </div>

        </div>

    <!-- PERFORMANCE -->

    <div class="annual-fwd-kpi annual-fwd-comparison">

        <div class="annual-fwd-kpi-title">
            BASE PERFORMANCE
        </div>

        <div class="annual-fwd-comparison-heading">
            CLOSED / OPEN RATIO (BASE VS PORTUGAL)
        </div>

        ${[
            ["OPO","Porto",opo.ratio,compareAnnualHilsRatio(opo.ratio,portugal.ratio)],
            ["LIS","Lisbon",portugal.lisRatio,compareAnnualHilsRatio(portugal.lisRatio,portugal.ratio)],
            ["FAO","Faro",portugal.faoRatio,compareAnnualHilsRatio(portugal.faoRatio,portugal.ratio)],
            ["FNC","Funchal",portugal.fncRatio,compareAnnualHilsRatio(portugal.fncRatio,portugal.ratio)]
        ].map(([code,city,ratio,comparison])=>`

            <div class="annual-hils-performance-row">

                <div class="annual-hils-performance-base">
                    ${code} (${city})
                </div>

                <div class="annual-hils-performance-values">

                    <div class="annual-hils-performance-box">
                        <small>${code}</small>
                        <strong>${Number(ratio).toFixed(2)}</strong>
                    </div>

                    <div class="annual-hils-performance-box">
                        <small>Portugal</small>
                        <strong>${Number(portugal.ratio).toFixed(2)}</strong>
                    </div>

                </div>

                <div class="annual-fwd-comparison-item ${comparison.className}">

                    <span class="comparison-indicator"></span>

                    <div>
                        <small>${code} vs Portugal</small>
                        <strong>${comparison.text}</strong>
                    </div>

                </div>

            </div>

        `).join("")}

    </div>

</div>

    `;

}


// =====================================================
// ANNUAL REPORT — WORK ORDERS
// MANUAL KPI DATA
// =====================================================

const annualWOData = {

    opo: {
        open: 0,
        closed: 0,
        openRate: 0,
        closedRate: 0,
        ratio: 0
    },

    portugal: {

        lisOpen: 0,
        faoOpen: 0,
        fncOpen: 0,

        lisClosed: 0,
        faoClosed: 0,
        fncClosed: 0,

        open: 0,
        closed: 0,

        openRate: 0,
        closedRate: 0,

        ratio: 0
    },

    spmfb: {

        open: 0,
        closed: 0,

        openRate: 100,
        closedRate: 100,

        ratio: 0
    }

};


// =====================================================
// WORK ORDERS — CALCULATIONS
// =====================================================

function calculateAnnualWO(){

    const opoOpen = Number(annualWOData.opo.open || 0);
    const opoClosed = Number(annualWOData.opo.closed || 0);

    const lisOpen = Number(annualWOData.portugal.lisOpen || 0);
    const lisClosed = Number(annualWOData.portugal.lisClosed || 0);

    const faoOpen = Number(annualWOData.portugal.faoOpen || 0);
    const faoClosed = Number(annualWOData.portugal.faoClosed || 0);

    const fncOpen = Number(annualWOData.portugal.fncOpen || 0);
    const fncClosed = Number(annualWOData.portugal.fncClosed || 0);

    // =========================================
    // PORTUGAL TOTALS
    // =========================================

    annualWOData.portugal.open =
        opoOpen + lisOpen + faoOpen + fncOpen;

    annualWOData.portugal.closed =
        opoClosed + lisClosed + faoClosed + fncClosed;

    const portugalOpen = annualWOData.portugal.open;
    const portugalClosed = annualWOData.portugal.closed;

    // =========================================
    // REGION TOTALS
    // =========================================

    const regionOpen = Number(annualWOData.spmfb.open || 0);
    const regionClosed = Number(annualWOData.spmfb.closed || 0);

    // =========================================
    // BASE OPEN RATE (vs Portugal)
    // =========================================

    annualWOData.opo.openRate =
        portugalOpen > 0 ? (opoOpen / portugalOpen) * 100 : 0;

    annualWOData.portugal.lisOpenRate =
        portugalOpen > 0 ? (lisOpen / portugalOpen) * 100 : 0;

    annualWOData.portugal.faoOpenRate =
        portugalOpen > 0 ? (faoOpen / portugalOpen) * 100 : 0;

    annualWOData.portugal.fncOpenRate =
        portugalOpen > 0 ? (fncOpen / portugalOpen) * 100 : 0;

    // =========================================
    // PORTUGAL OPEN RATE (vs Region)
    // =========================================

    annualWOData.portugal.openRate =
        regionOpen > 0 ? (portugalOpen / regionOpen) * 100 : 0;

    // =========================================
    // BASE CLOSED RATE (vs Portugal)
    // =========================================

    annualWOData.opo.closedRate =
        portugalClosed > 0 ? (opoClosed / portugalClosed) * 100 : 0;

    annualWOData.portugal.lisClosedRate =
        portugalClosed > 0 ? (lisClosed / portugalClosed) * 100 : 0;

    annualWOData.portugal.faoClosedRate =
        portugalClosed > 0 ? (faoClosed / portugalClosed) * 100 : 0;

    annualWOData.portugal.fncClosedRate =
        portugalClosed > 0 ? (fncClosed / portugalClosed) * 100 : 0;

    // =========================================
    // PORTUGAL CLOSED RATE (vs Region)
    // =========================================

    annualWOData.portugal.closedRate =
        regionClosed > 0 ? (portugalClosed / regionClosed) * 100 : 0;

    // =========================================
    // CLOSED / OPEN RATIOS
    // =========================================

    annualWOData.opo.ratio =
        opoOpen > 0 ? opoClosed / opoOpen : 0;

    annualWOData.portugal.lisRatio =
        lisOpen > 0 ? lisClosed / lisOpen : 0;

    annualWOData.portugal.faoRatio =
        faoOpen > 0 ? faoClosed / faoOpen : 0;

    annualWOData.portugal.fncRatio =
        fncOpen > 0 ? fncClosed / fncOpen : 0;

    annualWOData.portugal.ratio =
        portugalOpen > 0 ? portugalClosed / portugalOpen : 0;

    annualWOData.spmfb.ratio =
        regionOpen > 0 ? regionClosed / regionOpen : 0;

    return annualWOData;

}


// =====================================================
// WORK ORDERS — RATIO COMPARISON
// HIGHER CLOSED / OPEN = BETTER
// =====================================================

function compareAnnualWORatio(
    opoRatio,
    portugalRatio
){

    const opo =
        Number(opoRatio || 0);

    const portugal =
        Number(portugalRatio || 0);


    if(opo > portugal){

        return {
            text: "BETTER",
            className: "positive"
        };

    }


    if(opo < portugal){

        return {
            text: "WORSE",
            className: "negative"
        };

    }


    return {
        text: "IN LINE",
        className: "neutral"
    };

}


// =====================================================
// WORK ORDERS — RENDER
// =====================================================

function renderAnnualWorkOrdersSection(){

    const container =
        document.getElementById("annualWorkOrdersContent");

    if(!container){

        console.warn("ANNUAL WO — container not found.");
        return;

    }

    calculateAnnualWO();

    const opo = annualWOData.opo;
    const portugal = annualWOData.portugal;
    const spmfb = annualWOData.spmfb;

    container.innerHTML = `

        <div class="annual-fwd-wrapper annual-wo-wrapper">

            <div class="annual-fwd-kpis">

                <!-- =================================
                     PORTUGAL BASE PERFORMANCE
                ================================== -->

                <div class="annual-fwd-kpi annual-hils-portugal-bases">

                    <div class="annual-fwd-kpi-title">
                        PORTUGAL BASE PERFORMANCE
                    </div>

                    <div class="annual-hils-base-grid">

                        ${[
                            ["OPO","Porto",opo.open,opo.openRate,opo.closed,opo.closedRate,opo.ratio],
                            ["LIS","Lisbon",portugal.lisOpen,portugal.lisOpenRate,portugal.lisClosed,portugal.lisClosedRate,portugal.lisRatio],
                            ["FAO","Faro",portugal.faoOpen,portugal.faoOpenRate,portugal.faoClosed,portugal.faoClosedRate,portugal.faoRatio],
                            ["FNC","Funchal",portugal.fncOpen,portugal.fncOpenRate,portugal.fncClosed,portugal.fncClosedRate,portugal.fncRatio]
                        ].map(([code,city,open,openRate,closed,closedRate,ratio])=>`

                            <div class="annual-hils-base-column">

                                <div class="annual-hils-base-header">

                                    <div class="annual-fwd-base-code">
                                        ${code}
                                    </div>

                                    <div class="annual-fwd-base-city">
                                        ${city}
                                    </div>

                                </div>

                                <div class="annual-hils-base-row">
                                    <span>WO OPEN</span>
                                    <strong>${open}</strong>
                                </div>

                                <div class="annual-hils-base-row">
                                    <span>OPEN RATE</span>
                                    <strong>${Number(openRate).toFixed(1)}%</strong>
                                </div>

                                <div class="annual-hils-base-row">
                                    <span>WO CLOSED</span>
                                    <strong>${closed}</strong>
                                </div>

                                <div class="annual-hils-base-row">
                                    <span>CLOSED RATE</span>
                                    <strong>${Number(closedRate).toFixed(1)}%</strong>
                                </div>

                                <div class="annual-hils-ratio-card">

                                    <span>CLOSED / OPEN</span>

                                    <strong>${Number(ratio).toFixed(2)}</strong>

                                </div>

                            </div>

                        `).join("")}

                    </div>

                </div>

<!-- =========================================
     SECOND ROW
========================================= -->

<div class="annual-wo-bottom-grid">

    <!-- PORTUGAL + SPMFB -->

    <div class="annual-fwd-kpi annual-wo-portugal-region">

        <div class="annual-fwd-kpi-title">
            PORTUGAL & SPMFB REGION
        </div>

        <div class="annual-hils-region-grid">

            <!-- Portugal -->

            <div class="annual-hils-region-card">

                <div class="annual-hils-region-heading">
                    PORTUGAL
                </div>

                <div class="annual-hils-region-row">
                    <span>WO OPEN</span>
                    <strong>${portugal.open}</strong>
                </div>

                <div class="annual-hils-region-row">
                    <span>OPEN RATE</span>
                    <strong>${Number(portugal.openRate).toFixed(1)}%</strong>
                </div>

                <div class="annual-hils-region-row">
                    <span>WO CLOSED</span>
                    <strong>${portugal.closed}</strong>
                </div>

                <div class="annual-hils-region-row">
                    <span>CLOSED RATE</span>
                    <strong>${Number(portugal.closedRate).toFixed(1)}%</strong>
                </div>

                <div class="annual-hils-ratio-card">
                    <span>CLOSED / OPEN</span>
                    <strong>${Number(portugal.ratio).toFixed(2)}</strong>
                </div>

            </div>

            <!-- SPMFB -->

            <div class="annual-hils-region-card">

                <div class="annual-hils-region-heading">
                    SPMFB REGION
                </div>

                <div class="annual-hils-region-row">
                    <span>WO OPEN</span>
                    <strong>${spmfb.open}</strong>
                </div>

                <div class="annual-hils-region-row">
                    <span>WO CLOSED</span>
                    <strong>${spmfb.closed}</strong>
                </div>

                <div class="annual-hils-ratio-card">
                    <span>CLOSED / OPEN</span>
                    <strong>${Number(spmfb.ratio).toFixed(2)}</strong>
                </div>

            </div>

        </div>

    </div>

                <!-- =================================
                     BASE PERFORMANCE
                ================================== -->

                                <div class="annual-fwd-kpi annual-fwd-comparison">

                    <div class="annual-fwd-kpi-title">
                        BASE PERFORMANCE
                    </div>

                    <div class="annual-fwd-comparison-heading">
                        CLOSED / OPEN RATIO (BASE VS PORTUGAL)
                    </div>

                    ${[
                        [
                            "OPO",
                            "Porto",
                            opo.ratio,
                            compareAnnualWORatio(
                                opo.ratio,
                                portugal.ratio
                            )
                        ],
                        [
                            "LIS",
                            "Lisbon",
                            portugal.lisRatio,
                            compareAnnualWORatio(
                                portugal.lisRatio,
                                portugal.ratio
                            )
                        ],
                        [
                            "FAO",
                            "Faro",
                            portugal.faoRatio,
                            compareAnnualWORatio(
                                portugal.faoRatio,
                                portugal.ratio
                            )
                        ],
                        [
                            "FNC",
                            "Funchal",
                            portugal.fncRatio,
                            compareAnnualWORatio(
                                portugal.fncRatio,
                                portugal.ratio
                            )
                        ]
                    ].map(([code,city,ratio,comparison])=>`

                        <div class="annual-hils-performance-row">

                            <div class="annual-hils-performance-base">
                                ${code} (${city})
                            </div>

                            <div class="annual-hils-performance-values">

                                <div class="annual-hils-performance-box">

                                    <small>${code}</small>

                                    <strong>
                                        ${Number(ratio).toFixed(2)}
                                    </strong>

                                </div>

                                <div class="annual-hils-performance-box">

                                    <small>Portugal</small>

                                    <strong>
                                        ${Number(portugal.ratio).toFixed(2)}
                                    </strong>

                                </div>

                            </div>

                            <div class="annual-fwd-comparison-item ${comparison.className}">

                                <span class="comparison-indicator"></span>

                                <div>

                                    <small>${code} vs Portugal</small>

                                    <strong>${comparison.text}</strong>

                                </div>

                            </div>

                        </div>

                    `).join("")}

                </div>

            </div>

        </div>

    `;

}

// =====================================================
// LOAD ANNUAL AOG DATA
// FIREBASE
// dashboardData/AOG/YYYY-MM/records
// =====================================================

async function loadAnnualAOGData(year){

    try{

        console.log("ANNUAL AOG — Loading:", year);

        const events = [];

        for(let month = 1; month <= 12; month++){

            const monthKey =
                `${year}-${String(month).padStart(2,"0")}`;

            const snapshot =
                await window.firebaseGet(

                    window.firebaseRef(

                        window.database,

                        `dashboardData/AOG/${monthKey}/records`

                    )

                );

            if(!snapshot.exists()) continue;

            const records =
                snapshot.val() || {};

            Object.entries(records).forEach(([id,aog])=>{

                events.push({

                    id,

                    month,

                    base:
                        String(aog.base || "")
                            .toUpperCase(),

                    registration:
                        String(
                            aog.registration ||
                            aog.aircraftRegistration ||
                            "-"
                        ).toUpperCase(),

                    category:
                        aog.category || "UNKNOWN",

                    minutes:
                        Number(
                            aog.durationMinutes ||
                            aog.aogMinutes ||
                            0
                        ),

                    duration:
                        aog.duration || "",

                    ...aog

                });

            });

        }

        console.log(
            "✅ ANNUAL AOG EVENTS:",
            events.length
        );

        return events;

    }

    catch(error){

        console.error(
            "ANNUAL AOG LOAD ERROR:",
            error
        );

        return [];

    }

}

// =====================================================
// FORMAT MINUTES TO "Xh Ym"
// =====================================================

function formatMinutes(minutes){

    const total =
        Math.round(Number(minutes) || 0);

    const hours =
        Math.floor(total / 60);

    const mins =
        total % 60;

    if(hours === 0){
        return `${mins}m`;
    }

    if(mins === 0){
        return `${hours}h`;
    }

    return `${hours}h ${mins}m`;

}



// =====================================================
// REFRESH ANNUAL AOG
// =====================================================

async function refreshAnnualAOG(){

    if(
        !CURRENT_ANNUAL_YEAR
    ){

        console.warn(
            "ANNUAL AOG — No current year."
        );

        return;

    }

    console.log(
        "ANNUAL AOG — Refreshing:",
        CURRENT_ANNUAL_YEAR
    );

    const data =
        await loadAnnualAOGData(
            CURRENT_ANNUAL_YEAR
        );

    console.log(
        "ANNUAL AOG — Firebase data:",
        data
    );

    const analysis =
        buildAnnualAOGAnalysis(
            data
        );

    console.log(
        "ANNUAL AOG — Analysis:",
        analysis
    );

    renderAnnualAOGSection(
        analysis
    );

}

// =====================================================
// RENDER ANNUAL AOG SECTION
// =====================================================

function renderAnnualAOGSection(analysis){

    const container =
        document.getElementById(
            "annualAircraftOnGroundContent"
        );

    if(!container){

        console.warn(
            "ANNUAL AOG — container not found."
        );

        return;

    }

    const opo = analysis.opo;
    const lis = analysis.lis;
    const fao = analysis.fao;
    const fnc = analysis.fnc;
    const portugal = analysis.portugal;

    container.innerHTML = `

<div class="annual-fwd-wrapper annual-aog-wrapper">

    <!-- ===========================================================
         LINE 1 — PORTUGAL BASE PERFORMANCE + PORTUGAL OVERVIEW
    ============================================================ -->

    <div class="annual-aog-top-grid">

        <!-- ================= PORTUGAL BASE PERFORMANCE ================= -->

        <div class="annual-fwd-kpi annual-aog-portugal-bases">

            <div class="annual-fwd-kpi-title">
                PORTUGAL BASE PERFORMANCE
            </div>

            <div class="annual-aog-base-grid">

                ${[
                    ["OPO","Porto",opo,"#FDB515"],
                    ["LIS","Lisbon",lis,"#2196F3"],
                    ["FAO","Faro",fao,"#22C55E"],
                    ["FNC","Funchal",fnc,"#8B5CF6"]
                ].map(([code,city,base,color])=>`

                    <div class="annual-aog-base-card">

                        <div class="annual-aog-base-header">

                            <div class="annual-aog-base-icon"
                                 style="background:${color}20;border-color:${color};color:${color};">

                                ${code}

                            </div>

                            <div>

                                <div class="annual-aog-base-code">${code}</div>
                                <div class="annual-aog-base-city">${city}</div>

                            </div>

                        </div>

                        <div class="annual-aog-base-kpis">

                            <div class="annual-aog-mini-kpi">
                                <span>AOG</span>
                                <strong>${base.totalAOG}</strong>
                            </div>

                            <div class="annual-aog-mini-kpi">
                                <span>AVG</span>
                                <strong>${formatMinutes(base.avgMinutes)}</strong>
                            </div>

                            <div class="annual-aog-mini-kpi">
                                <span>LONGEST</span>
                                <strong>${base.longestAOG}</strong>
                            </div>

                        </div>

                        <div class="annual-aog-share">

                            <span>% PORTUGAL</span>

                            <strong>${base.sharePortugal.toFixed(1)}%</strong>

                        </div>

                        <div class="annual-aog-share-bar">

                            <div
                                class="annual-aog-share-fill"
                                style="width:${base.sharePortugal}%;background:${color};"
                            ></div>

                        </div>

                        <div class="annual-aog-category-card"
                             style="border-color:${color};">

                            <span>DOMINANT CATEGORY</span>

                            <strong>${base.dominantCategory}</strong>

                            <small>
                                ${base.dominantCategoryCount}
                                occurrence${base.dominantCategoryCount===1?"":"s"}
                            </small>

                        </div>

                    </div>

                `).join("")}

            </div>

        </div>

        <!-- ================= PORTUGAL OVERVIEW ================= -->

        <div class="annual-fwd-kpi annual-aog-overview-card-large">

            <div class="annual-fwd-kpi-title">
                PORTUGAL OVERVIEW
            </div>

            <div class="annual-aog-overview-grid">

                <div class="annual-aog-overview-kpi">
                    <span>TOTAL AOG</span>
                    <strong>${portugal.totalAOG}</strong>
                </div>

                <div class="annual-aog-overview-kpi">
                    <span>AVG DURATION</span>
                    <strong>${formatMinutes(portugal.avgMinutes)}</strong>
                </div>

                <div class="annual-aog-overview-kpi">
                    <span>LONGEST AOG</span>
                    <strong>${portugal.longestAOG}</strong>
                </div>

                <div class="annual-aog-overview-kpi">
                    <span>MOST AFFECTED ACFT</span>
                    <strong>${portugal.mostAffectedAircraft}</strong>
                    <small>${portugal.aircraftOccurrences} occurrences</small>
                </div>

            </div>

            <div class="annual-aog-portugal-category">

                <span>DOMINANT CATEGORY</span>

                <strong>${portugal.dominantCategory}</strong>

                <small>${portugal.dominantCategoryCount} occurrences</small>

            </div>

            <div class="annual-aog-distribution">

                <div class="annual-aog-distribution-title">
                    AOG TIME DISTRIBUTION
                </div>

                ${[
                    ["< 2 HOURS",analysis.timeDistribution.under2],
                    ["2 – 4 HOURS",analysis.timeDistribution.between2and4],
                    ["4 – 8 HOURS",analysis.timeDistribution.between4and8],
                    ["8 – 12 HOURS",analysis.timeDistribution.between8and12],
                    ["12 – 24 HOURS",analysis.timeDistribution.between12and24],
                    ["> 24 HOURS",analysis.timeDistribution.over24]
                ].map(([label,value])=>`

                    <div class="annual-aog-distribution-row">

                        <span>${label}</span>

                        <div class="annual-aog-distribution-progress">

                            <div
                                class="annual-aog-distribution-fill"
                                style="width:${(value/portugal.totalAOG)*100}%;"
                            ></div>

                        </div>

                        <strong>${value}</strong>

                    </div>

                `).join("")}

            </div>

        </div>

    </div>

    <!-- ===========================================================
         LINE 2 — MATRIX + CHART
    ============================================================ -->

    <div class="annual-aog-bottom-grid">

        <div class="annual-fwd-kpi annual-aog-matrix">

            <div class="annual-fwd-kpi-title">
                AOG IMPACT MATRIX
            </div>

            <div class="annual-aog-matrix-table">

                ${analysis.matrix.map(category=>`

                    <div class="annual-aog-matrix-row">

                        <div class="annual-aog-category-name">
                            ${category.label}
                        </div>

                        <div class="annual-aog-matrix-percentage">

                            <div class="annual-aog-progress">

                                <div
                                    class="annual-aog-progress-fill"
                                    style="width:${category.percentage}%;"
                                ></div>

                            </div>

                            <strong>${category.percentage.toFixed(1)}%</strong>

                        </div>

                        <div class="annual-aog-matrix-count">
                            ${category.count}
                        </div>

                        <div class="annual-aog-matrix-average">
                            ${formatMinutes(category.avgMinutes)}
                        </div>

                        <div class="annual-aog-base-distribution">

${category.opo ? `<span class="base-opo" data-base="OPO">${category.opo}</span>` : ""}
${category.lis ? `<span class="base-lis" data-base="LIS">${category.lis}</span>` : ""}
${category.fao ? `<span class="base-fao" data-base="FAO">${category.fao}</span>` : ""}
${category.fnc ? `<span class="base-fnc" data-base="FNC">${category.fnc}</span>` : ""}

                        </div>

                    </div>

                `).join("")}

            </div>

        </div>

        <div class="annual-fwd-kpi annual-aog-chart-card">

            <div class="annual-fwd-kpi-title">
                MONTHLY AIRCRAFT ON GROUND TREND
            </div>

            <div class="annual-aog-chart-header">

                <div class="annual-aog-badge peak">
                    <span>PEAK MONTH</span>
                    <strong>${analysis.monthlyInsights.peakMonth}</strong>
                    <small>${analysis.monthlyInsights.peakValue} AOG</small>
                </div>

                <div class="annual-aog-badge lowest">
                    <span>LOWEST MONTH</span>
                    <strong>${analysis.monthlyInsights.lowestMonth}</strong>
                    <small>${analysis.monthlyInsights.lowestValue} AOG</small>
                </div>

            </div>

            <div class="annual-aog-chart-container">

                <canvas id="annualAOGChart"></canvas>

            </div>

        </div>

    </div>

</div>

`;

    // =====================================================
    // MONTHLY CHART
    // =====================================================

    const chartCanvas =
        document.getElementById(
            "annualAOGChart"
        );

    if(chartCanvas){

        if(window.annualAOGChartInstance){

            window.annualAOGChartInstance.destroy();

        }

        window.annualAOGChartInstance =
            new Chart(chartCanvas,{

                type:"line",

                data:{

                    labels:[
                        "Jan","Feb","Mar","Apr","May","Jun",
                        "Jul","Aug","Sep","Oct","Nov","Dec"
                    ],

                    datasets:[

                        {
                            label:"Portugal",
                            data:analysis.chart.portugal,
                            borderColor:"#003C88",
                            backgroundColor:"rgba(0,60,136,.10)",
                            borderWidth:4,
                            tension:.35,
                            pointRadius:4,
                            pointHoverRadius:6,
                            fill:false
                        },

                        {
                            label:"OPO",
                            data:analysis.chart.opo,
                            borderColor:"#FDB515",
                            borderWidth:2.5,
                            tension:.35,
                            pointRadius:3,
                            fill:false
                        },

                        {
                            label:"LIS",
                            data:analysis.chart.lis,
                            borderColor:"#0099E5",
                            borderWidth:2.5,
                            tension:.35,
                            pointRadius:3,
                            fill:false
                        },

                        {
                            label:"FAO",
                            data:analysis.chart.fao,
                            borderColor:"#34A853",
                            borderWidth:2.5,
                            tension:.35,
                            pointRadius:3,
                            fill:false
                        },

                        {
                            label:"FNC",
                            data:analysis.chart.fnc,
                            borderColor:"#EA4335",
                            borderWidth:2.5,
                            tension:.35,
                            pointRadius:3,
                            fill:false
                        }

                    ]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false,

                    interaction:{
                        mode:"index",
                        intersect:false
                    },

                    plugins:{

                        legend:{
                            position:"bottom",
                            labels:{
                                usePointStyle:true,
                                pointStyle:"circle",
                                padding:20,
                                font:{
                                    size:11,
                                    weight:"600"
                                }
                            }
                        },

                        tooltip:{
                            backgroundColor:"#003C88",
                            padding:12,
                            cornerRadius:10
                        }

                    },

                    scales:{

                        y:{
                            beginAtZero:true,
                            ticks:{
                                precision:0,
                                color:"#64748B"
                            },
                            title:{
                                display:true,
                                text:"NUMBER OF AOG EVENTS",
                                color:"#64748B",
                                font:{
                                    size:11,
                                    weight:"700"
                                }
                            },
                            grid:{
                                color:"#EEF3F8"
                            }
                        },

                        x:{
                            ticks:{
                                color:"#64748B"
                            },
                            grid:{
                                display:false
                            }
                        }

                    }

                }

            });

    }

}

// =====================================================
// ANNUAL REPORT — A-CHECK (RYANAIR EXECUTIVE DASHBOARD)
// =====================================================

// Firebase Collection

const ANNUAL_ACHECK_COLLECTION = "dashboardData/acheck";

// Cache

let ANNUAL_ACHECK_CACHE = {};

// Loading Lock

let ANNUAL_ACHECK_LOADING = false;

// Months

const ANNUAL_ACHECK_MONTHS = [
    "JAN","FEB","MAR","APR","MAY","JUN",
    "JUL","AUG","SEP","OCT","NOV","DEC"
];

// =====================================================
// HELPERS
// =====================================================

function annualTimeToMinutes(value){

    if(!value) return 0;

    if(typeof value === "number") return value;

    const text = String(value).trim();

    if(!text.includes(":")) return Number(text) || 0;

    const [h,m] = text.split(":").map(Number);

    return h*60 + m;

}

function annualTimeToHours(value){

    return Number((annualTimeToMinutes(value)/60).toFixed(2));

}

function annualAverage(array){

    const valid =
        array.filter(v=>Number(v)>0);

    if(!valid.length) return 0;

    return valid.reduce((a,b)=>a+b,0)/valid.length;

}

// =====================================================
// NORMALISE MONTH LABELS (Firebase -> Dashboard)
// =====================================================

function annualMonthIndex(label){

    const month = String(label || "")
        .trim()
        .toUpperCase();

    const map = {

        JAN:0,
        JANUARY:0,

        FEB:1,
        FEBRUARY:1,

        MAR:2,
        MARCH:2,

        APR:3,
        APRIL:3,

        MAY:4,

        JUN:5,
        JUNE:5,

        JUL:6,
        JULY:6,

        AUG:7,
        AUGUST:7,

        SEP:8,
        SEPT:8,
        SEPTEMBER:8,

        OCT:9,
        OCTOBER:9,

        NOV:10,
        NOVEMBER:10,

        DEC:11,
        DECEMBER:11

    };

    return map.hasOwnProperty(month)
        ? map[month]
        : -1;

}

function annualTimeToHours(time){

    if(!time) return 0;

    if(typeof time === "number") return time;

    const parts = String(time).split(":");

    if(parts.length !== 2) return Number(time) || 0;

    const h = Number(parts[0]);
    const m = Number(parts[1]);

    return Number((h + m / 60).toFixed(2));

}

// =====================================================
// CLEAR CACHE
// =====================================================

function clearAnnualACheckCache(year=null){

    if(year){

        delete ANNUAL_ACHECK_CACHE[year];

        return;

    }

    ANNUAL_ACHECK_CACHE = {};

}

// ==========================================
// HH:MM  →  Decimal Hours
// ==========================================

function annualDurationToDecimal(value){

    if(value == null) return null;

    if(typeof value === "number") return value;

    const text = String(value).trim();

    if(!text.includes(":")){
        const n = Number(text);
        return Number.isFinite(n) ? n : null;
    }

    const [h,m] = text.split(":").map(Number);

    if(Number.isNaN(h) || Number.isNaN(m)) return null;

    return Number((h + m / 60).toFixed(2));

}

// =====================================================
// LOAD FIREBASE DATA
// =====================================================

async function loadAnnualACheckData(year){

    if(ANNUAL_ACHECK_CACHE[year]){

        console.log("A-CHECK CACHE:",year);

        return ANNUAL_ACHECK_CACHE[year];

    }

    console.log("====================================");
    console.log("A-CHECK ANNUAL LOAD:",year);
    console.log("====================================");

    const output = {

        Night:{},
        Day:{}

    };

    // January -> December

    for(let month=1; month<=12; month++){

        const monthKey =
            `${year}-${String(month).padStart(2,"0")}`;

        try{

            const snapshot =
                await window.firebaseGet(

                    window.firebaseRef(
                        window.database,
                        `${ANNUAL_ACHECK_COLLECTION}/${monthKey}`
                    )

                );

            if(!snapshot.exists()){

                continue;

            }

            const firebaseMonth =
                snapshot.val();

            if(firebaseMonth.Night){

                output.Night[month] =
                    firebaseMonth.Night;

            }

            if(firebaseMonth.Day){

                output.Day[month] =
                    firebaseMonth.Day;

            }

            console.log(
                monthKey,
                firebaseMonth
            );

        }
        catch(error){

            console.error(
                "A-CHECK LOAD ERROR",
                monthKey,
                error
            );

        }

    }

    ANNUAL_ACHECK_CACHE[year] = output;

    console.log("ANNUAL FIREBASE READY",output);

    return output;

}



// =====================================================
// RENDER ANNUAL A-CHECK EXECUTIVE DASHBOARD
// =====================================================

function renderAnnualACheckSection(analysis){

    const container =
        document.getElementById("annualACheckContent");

    if(!container) return;

    function renderShift(title, chip, shift, type){

        return `

        <section class="annual-acheck-shift">

            <!-- ===================================== -->
            <!-- HEADER -->
            <!-- ===================================== -->

            <div class="annual-acheck-header">

                <div class="annual-acheck-header-left">

                    <div class="annual-acheck-chip ${type}">
                        ${chip}
                    </div>

                    <div>

                        <h2>${title}</h2>

                        <p>
                            January – December ${CURRENT_ANNUAL_YEAR}
                            • Ryanair Engineering Portugal Base
                        </p>

                    </div>

                </div>

                <div class="annual-acheck-header-right">

                    <span>Total A-Checks</span>

                    <h1>${shift.kpis.totalChecks}</h1>

                </div>

            </div>

            <!-- ===================================== -->
            <!-- KPI GRID -->
            <!-- ===================================== -->

            <div class="annual-acheck-kpi-grid">

                <!-- NG -->

                <div class="annual-acheck-kpi-card ng">

                    <div class="annual-kpi-title">

                        <div class="annual-kpi-badge ng">NG</div>

                        <div>

                            <h3>B737-800 NG</h3>

                            <span>Total Annual Checks</span>

                        </div>

                    </div>

                    <div class="annual-kpi-number">
                        ${shift.ng.totalChecks}
                    </div>

                    <div class="annual-kpi-divider"></div>

                    <div class="annual-kpi-breakdown">

                        <div><span>AX-01</span><strong>${shift.ng.ax01}</strong></div>

                        <div><span>AX-02</span><strong>${shift.ng.ax02}</strong></div>

                        <div><span>AX-03</span><strong>${shift.ng.ax03}</strong></div>

                        <div><span>AX-04</span><strong>${shift.ng.ax04}</strong></div>

                    </div>

                </div>

                <!-- MAX -->

                <div class="annual-acheck-kpi-card max">

                    <div class="annual-kpi-title">

                        <div class="annual-kpi-badge max">MAX</div>

                        <div>

                            <h3>B737 MAX 8-200</h3>

                            <span>Total Annual Checks</span>

                        </div>

                    </div>

                    <div class="annual-kpi-number">
                        ${shift.max.totalChecks}
                    </div>

                    <div class="annual-kpi-divider"></div>

                    <div class="annual-kpi-breakdown">

                        <div><span>AX-01</span><strong>${shift.max.ax01}</strong></div>

                        <div><span>AX-02</span><strong>${shift.max.ax02}</strong></div>

                        <div><span>AX-03</span><strong>${shift.max.ax03}</strong></div>

                        <div><span>AX-04</span><strong>${shift.max.ax04}</strong></div>

                    </div>

                </div>

                <!-- AVG DURATION -->

                <div class="annual-acheck-kpi-card duration">

                    <div class="annual-kpi-title">

                        <div class="annual-kpi-badge duration">AVG</div>

                        <div>

                            <h3>Average Duration</h3>

                            <span>NG + MAX Average</span>

                        </div>

                    </div>

                    <div class="annual-kpi-number duration">

                        ${formatMinutes(shift.kpis.avgDurationMinutes)}

                    </div>

                    <div class="annual-kpi-divider"></div>

                    <div class="annual-kpi-stats">

                        <div>

                            <span>NG</span>

                            <strong>${shift.kpis.avgDurationNG.toFixed(2)} h</strong>

                        </div>

                        <div>

                            <span>MAX</span>

                            <strong>${shift.kpis.avgDurationMAX.toFixed(2)} h</strong>

                        </div>

                    </div>

                </div>

                <!-- LONGEST / SHORTEST -->

                <div class="annual-acheck-kpi-card longest">

                    <div class="annual-kpi-title">

                        <div class="annual-kpi-badge longest">REC</div>

                        <div>

                            <h3>Annual Records</h3>

                            <span>Longest & Shortest Check</span>

                        </div>

                    </div>

                    <div class="annual-longest-shortest">

                        <div class="annual-record longest">

                            <small>LONGEST</small>

                            <h2>${shift.kpis.longest.time}</h2>

                            <p>${shift.kpis.longest.check}</p>

                            

                        </div>

                        <div class="annual-record shortest">

                            <small>SHORTEST</small>

                            <h2>${shift.kpis.shortest.time}</h2>

                            <p>${shift.kpis.shortest.check}</p>

                            

                        </div>

                    </div>

                </div>

            </div>

            <!-- ===================================== -->
            <!-- AX VARIATION -->
            <!-- ===================================== -->

            <div class="annual-section-card">

                <div class="annual-section-header">

                    <div>

                        <h3>AX Duration Variation with Manpower Levels</h3>

                        <span>NG vs MAX • MECH vs AVIO</span>

                    </div>

                </div>

                <div class="annual-chart-large">

                    <canvas id="${type}DurationChart"></canvas>

                </div>

            </div>

            <!-- ===================================== -->
            <!-- DEFERRED TASKS -->
            <!-- ===================================== -->

            <div class="annual-two-columns">

                <!-- NG -->

                <div class="annual-section-card">

                    <div class="annual-section-header">

                        <div>

                            <h3>B737-800 NG Deferred Tasks</h3>

                            <span>No Parts vs No Time</span>

                        </div>

                    </div>

                    <div class="annual-deferred-summary">

                        <div class="annual-summary-card parts">

                            <span>No Parts</span>

                            <strong>${shift.ng.deferredParts}</strong>

                        </div>

                        <div class="annual-summary-card time">

                            <span>No Time</span>

                            <strong>${shift.ng.deferredTime}</strong>

                        </div>

                    </div>

                    <div class="annual-chart-medium">

                        <canvas id="${type}DeferredNGChart"></canvas>

                    </div>

                </div>

                <!-- MAX -->

                <div class="annual-section-card">

                    <div class="annual-section-header">

                        <div>

                            <h3>B737 MAX Deferred Tasks</h3>

                            <span>No Parts vs No Time</span>

                        </div>

                    </div>

                    <div class="annual-deferred-summary">

                        <div class="annual-summary-card parts">

                            <span>No Parts</span>

                            <strong>${shift.max.deferredParts}</strong>

                        </div>

                        <div class="annual-summary-card time">

                            <span>No Time</span>

                            <strong>${shift.max.deferredTime}</strong>

                        </div>

                    </div>

                    <div class="annual-chart-medium">

                        <canvas id="${type}DeferredMAXChart"></canvas>

                    </div>

                </div>

            </div>

            <!-- ===================================== -->
            <!-- OPEN HILS -->
            <!-- ===================================== -->

            <div class="annual-two-columns">

                <div class="annual-section-card">

                    <div class="annual-section-header">

                        <div>

                            <h3>B737-800 NG Open HIL's</h3>

                            <span>Outstanding Items after A-Check</span>

                        </div>

                    </div>

                    <div class="annual-chart-medium">

                        <canvas id="${type}HilsNGChart"></canvas>

                    </div>

                </div>

                <div class="annual-section-card">

                    <div class="annual-section-header">

                        <div>

                            <h3>B737 MAX Open HIL's</h3>

                            <span>Outstanding Items after A-Check</span>

                        </div>

                    </div>

                    <div class="annual-chart-medium">

                        <canvas id="${type}HilsMAXChart"></canvas>

                    </div>

                </div>

            </div>

        </section>

        `;

    }

    // =====================================================
    // HTML
    // =====================================================

    container.innerHTML = `

        <div class="annual-acheck-wrapper">

            ${renderShift(
                "Night Shift Executive Performance",
                "🌙 NIGHT SHIFT",
                analysis.night,
                "night"
            )}

            ${renderShift(
                "Day Shift Executive Performance",
                "☀️ DAY SHIFT",
                analysis.day,
                "day"
            )}

        </div>

    `;

    // =====================================================
    // RENDER CHARTS
    // =====================================================

    requestAnimationFrame(()=>{

        renderAnnualDurationChart(
            "nightDurationChart",
            analysis.night.charts.manpower
        );

        renderAnnualDurationChart(
            "dayDurationChart",
            analysis.day.charts.manpower
        );

        renderAnnualDeferredChart(
            "nightDeferredNGChart",
            analysis.night.charts.deferredNG
        );

        renderAnnualDeferredChart(
            "nightDeferredMAXChart",
            analysis.night.charts.deferredMAX
        );

        renderAnnualDeferredChart(
            "dayDeferredNGChart",
            analysis.day.charts.deferredNG
        );

        renderAnnualDeferredChart(
            "dayDeferredMAXChart",
            analysis.day.charts.deferredMAX
        );

        renderAnnualHilChart(
            "nightHilsNGChart",
            analysis.night.charts.hilsNG,
            "#F59E0B"
        );

        renderAnnualHilChart(
            "nightHilsMAXChart",
            analysis.night.charts.hilsMAX,
            "#2563EB"
        );

        renderAnnualHilChart(
            "dayHilsNGChart",
            analysis.day.charts.hilsNG,
            "#F59E0B"
        );

        renderAnnualHilChart(
            "dayHilsMAXChart",
            analysis.day.charts.hilsMAX,
            "#2563EB"
        );

    });

}

// =====================================================
// ANNUAL A-CHECK CHARTS (RYANAIR EXECUTIVE DASHBOARD)
// =====================================================

const annualACheckCharts = {};

// -----------------------------------------------------
// Destroy chart if already exists
// -----------------------------------------------------

function destroyAnnualChart(id){

    if(annualACheckCharts[id]){

        annualACheckCharts[id].destroy();
        delete annualACheckCharts[id];

    }

}

// -----------------------------------------------------
// Common options
// -----------------------------------------------------

// ======================================================
// A-CHECK — GLOBAL CHART OPTIONS (RYANAIR EXECUTIVE STYLE)
// ======================================================

function annualChartOptions(yTitle = "", beginZero = false){

    return{

        responsive:true,
        maintainAspectRatio:false,

        animation:{
            duration:900,
            easing:"easeOutQuart"
        },

        interaction:{
            mode:"index",
            intersect:false
        },

        layout:{
            padding:{
                top:12,
                bottom:6,
                left:6,
                right:12
            }
        },

        plugins:{

            legend:{

                position:"top",
                align:"center",

                labels:{

                    usePointStyle:true,
                    pointStyle:"circle",

                    boxWidth:10,
                    boxHeight:10,

                    padding:22,

                    color:"#16355D",

                    font:{
                        family:"Inter",
                        size:12,
                        weight:"700"
                    }

                }

            },

            tooltip:{

                backgroundColor:"#16355D",
                titleColor:"#FFFFFF",
                bodyColor:"#FFFFFF",

                borderColor:"#2563EB",
                borderWidth:1,

                cornerRadius:14,

                padding:14,

                displayColors:true,

                titleFont:{
                    family:"Inter",
                    size:13,
                    weight:"700"
                },

                bodyFont:{
                    family:"Inter",
                    size:12,
                    weight:"600"
                }

            }

        },

        scales:{

            x:{

                offset:true,

                grid:{
                    display:false,
                    drawBorder:false
                },

                border:{
                    display:false
                },

                ticks:{

                    color:"#64748B",

                    padding:12,

                    maxRotation:0,
                    minRotation:0,

                    font:{
                        family:"Inter",
                        size:11,
                        weight:"700"
                    }

                }

            },

            y:{

                beginAtZero:beginZero,

                grace:"10%",

                grid:{
                    color:"rgba(148,163,184,.10)",
                    drawBorder:false
                },

                border:{
                    display:false
                },

                title:{

                    display:yTitle !== "",
                    text:yTitle,

                    color:"#16355D",

                    font:{
                        family:"Inter",
                        size:12,
                        weight:"700"
                    }

                },

                ticks:{

                    color:"#64748B",

                    padding:8,

                    font:{
                        family:"Inter",
                        size:11,
                        weight:"600"
                    }

                }

            }

        },

        elements:{

            line:{
                borderWidth:3,
                tension:.35
            },

            point:{
                radius:4,
                hoverRadius:7,
                hitRadius:12,
                borderWidth:2
            },

            bar:{
                borderRadius:10,
                borderSkipped:false
            }

        }

    };

}

function renderAnnualDurationChart(canvasId,data){

    const canvas =
        document.getElementById(canvasId);

    if(!canvas) return;

    destroyAnnualChart(canvasId);

    annualACheckCharts[canvasId] = new Chart(canvas,{

        type:"line",

        data:{

            labels:ANNUAL_ACHECK_MONTHS,

            datasets:[

                {
                    label:"NG Duration (h)",
                    data:data.ng,
                    borderColor:"#F59E0B",
                    backgroundColor:"#F59E0B",
                    borderWidth:3,
                    pointRadius:5,
                    pointHoverRadius:7,
                    tension:.35,
                    spanGaps:true
                },

                {
                    label:"MAX Duration (h)",
                    data:data.max,
                    borderColor:"#2563EB",
                    backgroundColor:"#2563EB",
                    borderWidth:3,
                    pointRadius:5,
                    pointHoverRadius:7,
                    tension:.35,
                    spanGaps:true
                },

                {
                    label:"MECH",
                    data:data.mech,
                    borderColor:"#10B981",
                    backgroundColor:"#10B981",
                    borderWidth:2,
                    borderDash:[6,4],
                    pointRadius:4,
                    tension:.35,
                    spanGaps:true,
                    yAxisID:"y1"
                },

                {
                    label:"MECH AVIO",
                    data:data.avio,
                    borderColor:"#8B5CF6",
                    backgroundColor:"#8B5CF6",
                    borderWidth:2,
                    borderDash:[6,4],
                    pointRadius:4,
                    tension:.35,
                    spanGaps:true,
                    yAxisID:"y1"
                }

            ]

        },

options:{

    ...annualChartOptions("Duration (Hours)", false),

    interaction:{
        mode:"index",
        intersect:false
    },

    scales:{

        x:{
            ...annualChartOptions().scales.x
        },

        // LEFT AXIS → NG / MAX DURATIONS
        y:{
            beginAtZero:false,
            min:4,
            max:8,

            grid:{
                color:"rgba(148,163,184,.12)"
            },

            ticks:{
                stepSize:0.5,
                color:"#64748B",
                callback:value => value.toFixed(1) + " h"
            },

            title:{
                display:true,
                text:"Duration (Hours)",
                color:"#16355D",
                font:{
                    family:"Inter",
                    size:12,
                    weight:"700"
                }
            }

        },

        // RIGHT AXIS → MANPOWER
        y1:{
            position:"right",
            beginAtZero:true,
            min:0,
            max:25,

            grid:{
                drawOnChartArea:false
            },

            ticks:{
                stepSize:5,
                color:"#64748B"
            },

            title:{
                display:true,
                text:"Manpower",
                color:"#16355D",
                font:{
                    family:"Inter",
                    size:12,
                    weight:"700"
                }
            }

        }

    }

}

    });

}

// =====================================================
// DEFERRED TASKS
// =====================================================

function renderAnnualDeferredChart(canvasId,data){

    const canvas =
        document.getElementById(canvasId);

    if(!canvas) return;

    destroyAnnualChart(canvasId);

    annualACheckCharts[canvasId] = new Chart(canvas,{

        type:"bar",

        data:{

            labels:data.labels,

            datasets:[

                {
                    label:"No Parts",
                    data:data.parts,
                    backgroundColor:"#F59E0B",
                    borderRadius:8,
                    maxBarThickness:28
                },

                {
                    label:"No Time",
                    data:data.time,
                    backgroundColor:"#EF4444",
                    borderRadius:8,
                    maxBarThickness:28
                }

            ]

        },

options: annualChartOptions("Number of Deferred Tasks", true)

    });

}

// =====================================================
// OPEN HILS
// =====================================================

function renderAnnualHilChart(canvasId,data,color){

    const canvas =
        document.getElementById(canvasId);

    if(!canvas) return;

    destroyAnnualChart(canvasId);

    annualACheckCharts[canvasId] = new Chart(canvas,{

        type:"bar",

        data:{

            labels:data.labels,

            datasets:[

                {
                    label:"Open HIL's",
                    data:data.values,
                    backgroundColor:color,
                    borderRadius:8,
                    maxBarThickness:28
                }

            ]

        },

options: annualChartOptions("Open HIL Items", true)

    });

}

// =====================================================
// CLEANUP
// =====================================================

function destroyAnnualACheckCharts(){

    Object.values(annualACheckCharts).forEach(chart=>{

        if(chart) chart.destroy();

    });

    Object.keys(annualACheckCharts).forEach(key=>{

        delete annualACheckCharts[key];

    });

}

// =====================================================
// ANNUAL REPORT — REFRESH A-CHECK
// =====================================================

async function refreshAnnualACheck(forceReload = false){

    if(!CURRENT_ANNUAL_YEAR){

        console.warn("ANNUAL A-CHECK — No year selected.");
        return;

    }

    if(ANNUAL_ACHECK_LOADING){

        console.warn("ANNUAL A-CHECK — Already loading.");
        return;

    }

    ANNUAL_ACHECK_LOADING = true;

    try{

        if(forceReload){

            clearAnnualACheckCache(CURRENT_ANNUAL_YEAR);

        }

        console.log("==========================================");
        console.log("ANNUAL A-CHECK REFRESH");
        console.log("YEAR:", CURRENT_ANNUAL_YEAR);
        console.log("==========================================");

        const firebaseData =
            await loadAnnualACheckData(CURRENT_ANNUAL_YEAR);

        console.log(
            "MONTHS AVAILABLE (Night):",
            Object.keys(firebaseData.Night)
        );

        console.log(
            "MONTHS AVAILABLE (Day):",
            Object.keys(firebaseData.Day)
        );

        const analysis =
            buildAnnualACheckAnalysis(firebaseData);

        console.log("A-CHECK ANALYSIS", analysis);

        renderAnnualACheckSection(analysis);

        console.log("ANNUAL A-CHECK — Render completed.");

    }
    catch(error){

        console.error("ANNUAL A-CHECK ERROR", error);

    }
    finally{

        ANNUAL_ACHECK_LOADING = false;

    }

}

// =====================================================
// BUILD ANNUAL A-CHECK ANALYSIS
// FINAL V5 — PART 1
// =====================================================

function buildAnnualACheckAnalysis(firebaseData){

    function createShift(){

        return{

            availableMonths:0,

            kpis:{
                totalChecks:0,

                avgDurationMinutes:0,
                avgDurationNG:0,
                avgDurationMAX:0,

                avgManpower:0,
                avgMech:0,
                avgAvio:0,
                avgDelay:0,

                longest:{
                    minutes:0,
                    time:"0:00",
                    supervisor:"-",
                    check:"-",
                    month:"-"
                },

                shortest:{
                    minutes:999999,
                    time:"0:00",
                    supervisor:"-",
                    check:"-",
                    month:"-"
                }

            },

            ng:{
                totalChecks:0,
                ax01:0,
                ax02:0,
                ax03:0,
                ax04:0,

                deferredParts:0,
                deferredTime:0
            },

            max:{
                totalChecks:0,
                ax01:0,
                ax02:0,
                ax03:0,
                ax04:0,

                deferredParts:0,
                deferredTime:0
            },

            charts:{

                manpower:{
                    labels:[...ANNUAL_ACHECK_MONTHS],
                    ng:new Array(12).fill(null),
                    max:new Array(12).fill(null),
                    mech:new Array(12).fill(null),
                    avio:new Array(12).fill(null)
                },

                deferredNG:{
                    labels:[...ANNUAL_ACHECK_MONTHS],
                    parts:new Array(12).fill(null),
                    time:new Array(12).fill(null)
                },

                deferredMAX:{
                    labels:[...ANNUAL_ACHECK_MONTHS],
                    parts:new Array(12).fill(null),
                    time:new Array(12).fill(null)
                },

                hilsNG:{
                    labels:[...ANNUAL_ACHECK_MONTHS],
                    values:new Array(12).fill(null)
                },

                hilsMAX:{
                    labels:[...ANNUAL_ACHECK_MONTHS],
                    values:new Array(12).fill(null)
                }

            }

        };

    }

    const analysis = {
        night:createShift(),
        day:createShift()
    };

    // =====================================================
    // PROCESS ONE SHIFT
    // =====================================================

    function processShift(source,target){

        Object.entries(source || {})
            .sort((a,b)=>Number(a[0])-Number(b[0]))
            .forEach(([monthKey,data])=>{

                const reportMonth = Number(monthKey)-1;

                if(reportMonth<0 || reportMonth>11) return;

                target.availableMonths++;

                // =============================================
                // AX COUNTS
                // =============================================

                const ngAX = data.ngAX || [];
                const maxAX = data.maxAX || [];

                target.ng.ax01 += Number(ngAX[0]||0);
                target.ng.ax02 += Number(ngAX[1]||0);
                target.ng.ax03 += Number(ngAX[2]||0);
                target.ng.ax04 += Number(ngAX[3]||0);

                target.max.ax01 += Number(maxAX[0]||0);
                target.max.ax02 += Number(maxAX[1]||0);
                target.max.ax03 += Number(maxAX[2]||0);
                target.max.ax04 += Number(maxAX[3]||0);

                target.ng.totalChecks +=
                    ngAX.reduce((a,b)=>a+Number(b||0),0);

                target.max.totalChecks +=
                    maxAX.reduce((a,b)=>a+Number(b||0),0);

                target.kpis.totalChecks =
                    target.ng.totalChecks +
                    target.max.totalChecks;

                // =============================================
                // KPI DURATIONS (CURRENT REPORT ONLY)
                // =============================================

                const ngHours =
                    annualTimeToHours(data.ngCurr);

                const maxHours =
                    annualTimeToHours(data.maxCurr);

                target.kpis.avgDurationNG += ngHours;
                target.kpis.avgDurationMAX += maxHours;

                target.kpis.avgDurationMinutes +=
                    (
                        annualTimeToMinutes(data.ngCurr)+
                        annualTimeToMinutes(data.maxCurr)
                    )/2;

                            // =============================================
                // LONGEST / SHORTEST CHECKS (CURRENT REPORT)
                // =============================================

                const ngLongest =
                    annualTimeToMinutes(data.ngLTime);

                if(ngLongest > target.kpis.longest.minutes){

                    target.kpis.longest = {
                        minutes:ngLongest,
                        time:data.ngLTime,
                        supervisor:data.ngLsup,
                        check:data.ngLChk,
                        month:ANNUAL_ACHECK_MONTHS[reportMonth]
                    };

                }

                const ngShortest =
                    annualTimeToMinutes(data.ngSTime);

                if(
                    ngShortest &&
                    ngShortest < target.kpis.shortest.minutes
                ){

                    target.kpis.shortest = {
                        minutes:ngShortest,
                        time:data.ngSTime,
                        supervisor:data.ngSSup,
                        check:data.ngSChk,
                        month:ANNUAL_ACHECK_MONTHS[reportMonth]
                    };

                }

                const maxLongest =
                    annualTimeToMinutes(data.maxLTime);

                if(maxLongest > target.kpis.longest.minutes){

                    target.kpis.longest = {
                        minutes:maxLongest,
                        time:data.maxLTime,
                        supervisor:data.maxLsup,
                        check:data.maxLChk,
                        month:ANNUAL_ACHECK_MONTHS[reportMonth]
                    };

                }

                const maxShortest =
                    annualTimeToMinutes(data.maxSTime);

                if(
                    maxShortest &&
                    maxShortest < target.kpis.shortest.minutes
                ){

                    target.kpis.shortest = {
                        minutes:maxShortest,
                        time:data.maxSTime,
                        supervisor:data.maxSSup,
                        check:data.maxSChk,
                        month:ANNUAL_ACHECK_MONTHS[reportMonth]
                    };

                }

// =============================================
// MANPOWER GRAPH (JAN -> CURRENT MONTH)
// =============================================

// 1. DURAÇÕES NG / MAX (arrays do report)
// =============================================
// NG / MAX DURATION LINES
// ngAX/maxAX start in JAN (no DEC entry)
// =============================================

const durationLabels =
    (data.hilsSuperLabels || data.defLabels || []).slice(1); // remove DEC

durationLabels.forEach((label,index)=>{

    const graphMonth = annualMonthIndex(label);

    if(graphMonth === -1) return;

    target.charts.manpower.ng[graphMonth] =
        Number(data.ngAX?.[index] ?? null);

    target.charts.manpower.max[graphMonth] =
        Number(data.maxAX?.[index] ?? null);

});

// 2. MANPOWER (MECH / AVIO) vem do axVariationData
(data.axVariationData || []).forEach(item=>{

    const graphMonth =
        annualMonthIndex(item.label || item.month);

    if(graphMonth === -1 || graphMonth === 11) return;

    target.charts.manpower.mech[graphMonth] =
        Number(item.mech ?? 0);

    target.charts.manpower.avio[graphMonth] =
        Number(item.mechAvio ?? item.avio ?? 0);

});

// KPI do mês atual
const currentManpower =
    (data.axVariationData || []).find(item =>
        annualMonthIndex(item.label || item.month) === reportMonth
    );

if(currentManpower){

    target.kpis.avgMech += Number(currentManpower.mech ?? 0);
    target.kpis.avgAvio += Number(currentManpower.mechAvio ?? currentManpower.avio ?? 0);

}

// Guarantee report month values (JUL, AUG, SEP...)

target.charts.manpower.ng[reportMonth] =
    Number(data.ngCurr ?? target.charts.manpower.ng[reportMonth] ?? 0);

target.charts.manpower.max[reportMonth] =
    Number(data.maxCurr ?? target.charts.manpower.max[reportMonth] ?? 0);

// =============================================
// DEFERRED TASKS NG
// Uses JAN -> CURRENT MONTH history from report
// =============================================

(data.defLabels || []).forEach((label,index)=>{

    const graphMonth = annualMonthIndex(label);

    if(graphMonth === -1 || graphMonth === 11) return;

    const parts = Number(data.ngDefParts?.[index] ?? 0);
    const time  = Number(data.ngDefTime?.[index] ?? 0);

    // gráfico JAN -> JUL
    target.charts.deferredNG.parts[graphMonth] = parts;
    target.charts.deferredNG.time[graphMonth] = time;

    // CARD = soma anual
    target.ng.deferredParts += parts;
    target.ng.deferredTime += time;

});


// =============================================
// DEFERRED TASKS MAX
// =============================================

(data.defLabels || []).forEach((label,index)=>{

    const graphMonth = annualMonthIndex(label);

    if(graphMonth === -1 || graphMonth === 11) return;

    const parts = Number(data.maxDefParts?.[index] ?? 0);
    const time  = Number(data.maxDefTime?.[index] ?? 0);

    target.charts.deferredMAX.parts[graphMonth] = parts;
    target.charts.deferredMAX.time[graphMonth] = time;

    // CARD = soma anual
    target.max.deferredParts += parts;
    target.max.deferredTime += time;

});


// =============================================
// OPEN HILS NG
// Uses JAN -> CURRENT MONTH history from report
// =============================================

(data.hilsLabels || []).forEach((label,index)=>{

    const graphMonth =
        annualMonthIndex(label);

    if(graphMonth === -1 || graphMonth === 11) return;

    target.charts.hilsNG.values[graphMonth] =
        Number(data.hilsNGData?.[index] ?? 0);

});

// =============================================
// OPEN HILS MAX
// Uses JAN -> CURRENT MONTH history from report
// =============================================

(data.hilsLabels || []).forEach((label,index)=>{

    const graphMonth =
        annualMonthIndex(label);

    if(graphMonth === -1 || graphMonth === 11) return;

    target.charts.hilsMAX.values[graphMonth] =
        Number(data.hilsMAXData?.[index] ?? 0);

});

});

        // =====================================================
        // FINAL KPI CALCULATIONS
        // =====================================================

        if(target.availableMonths){

            target.kpis.avgDurationMinutes =
                Math.round(
                    target.kpis.avgDurationMinutes /
                    target.availableMonths
                );

            target.kpis.avgDurationNG =
                Number(
                    (
                        target.kpis.avgDurationNG /
                        target.availableMonths
                    ).toFixed(2)
                );

            target.kpis.avgDurationMAX =
                Number(
                    (
                        target.kpis.avgDurationMAX /
                        target.availableMonths
                    ).toFixed(2)
                );

            target.kpis.avgMech =
                Number(
                    (
                        target.kpis.avgMech /
                        target.availableMonths
                    ).toFixed(1)
                );

            target.kpis.avgAvio =
                Number(
                    (
                        target.kpis.avgAvio /
                        target.availableMonths
                    ).toFixed(1)
                );

            target.kpis.avgManpower =
                Number(
                    (
                        target.kpis.avgMech +
                        target.kpis.avgAvio
                    ).toFixed(1)
                );

        }

        if(target.kpis.shortest.minutes === 999999){

            target.kpis.shortest.minutes = 0;
            target.kpis.shortest.time = "0:00";

        }

        if(target.kpis.longest.minutes > 0 && !target.kpis.longest.time){

            target.kpis.longest.time =
                annualMinutesToTime(target.kpis.longest.minutes);

        }

    }

    // =====================================================
    // BUILD NIGHT SHIFT
    // =====================================================

    processShift(firebaseData.Night || {}, analysis.night);

    // =====================================================
    // BUILD DAY SHIFT
    // =====================================================

    processShift(firebaseData.Day || {}, analysis.day);

    console.log("ANNUAL A-CHECK ANALYSIS READY");
    console.log(analysis);

    return analysis;

}



function convertHour(time){

    if(!time || !time.includes(":")) return 0;

    const [h,m] = time.split(":").map(Number);

    return h + m/60;

}

// ======================================================
// HH:MM -> DECIMAL HOURS
// ======================================================

function convertHourToDecimal(value){

    if(!value) return 0;

    const parts = value.split(":");

    return Number(parts[0]) + Number(parts[1])/60;

}

// =====================================================
// PRELOAD PREVIOUS / NEXT YEAR
// =====================================================

async function preloadAnnualACheck(year){

    if(ANNUAL_ACHECK_CACHE[year]) return;

    try{

        await loadAnnualACheckData(year);

    }
    catch(error){

        console.warn("A-CHECK PRELOAD FAILED:", year);

    }

}

// =====================================================
// OPTIONAL MANUAL RELOAD
// =====================================================

async function reloadAnnualACheck(){

    clearAnnualACheckCache(CURRENT_ANNUAL_YEAR);

    await refreshAnnualACheck(true);

}
// =====================================================
// BUILD ANNUAL AOG ANALYSIS
// =====================================================

function buildAnnualAOGAnalysis(data){

    const monthOrder = [
        "JAN","FEB","MAR","APR","MAY","JUN",
        "JUL","AUG","SEP","OCT","NOV","DEC"
    ];

    const analysis = {

        opo:{ totalAOG:0, totalMinutes:0, avgMinutes:0, longestMinutes:0, longestAOG:"-", sharePortugal:0, dominantCategory:"-", dominantCategoryCount:0 },
        lis:{ totalAOG:0, totalMinutes:0, avgMinutes:0, longestMinutes:0, longestAOG:"-", sharePortugal:0, dominantCategory:"-", dominantCategoryCount:0 },
        fao:{ totalAOG:0, totalMinutes:0, avgMinutes:0, longestMinutes:0, longestAOG:"-", sharePortugal:0, dominantCategory:"-", dominantCategoryCount:0 },
        fnc:{ totalAOG:0, totalMinutes:0, avgMinutes:0, longestMinutes:0, longestAOG:"-", sharePortugal:0, dominantCategory:"-", dominantCategoryCount:0 },

        portugal:{
            totalAOG:0,
            totalMinutes:0,
            avgMinutes:0,
            longestMinutes:0,
            longestAOG:"-",
            dominantCategory:"-",
            dominantCategoryCount:0,
            mostAffectedAircraft:"-",
            aircraftOccurrences:0
        },

        timeDistribution:{
            under2:0,
            between2and4:0,
            between4and8:0,
            between8and12:0,
            between12and24:0,
            over24:0
        },

        matrix:[],

        chart:{
            portugal:new Array(12).fill(0),
            opo:new Array(12).fill(0),
            lis:new Array(12).fill(0),
            fao:new Array(12).fill(0),
            fnc:new Array(12).fill(0)
        },

        monthlyInsights:{
            peakMonth:"-",
            peakValue:0,
            lowestMonth:"-",
            lowestValue:0
        }

    };

    const categoryTotals = {};

    // ALTERAÇÃO: agora conta por TIPO (MAX NG / MAX / NG...)
    const aircraftTypeTotals = {};

    const baseCategoryTotals = {
        opo:{},
        lis:{},
        fao:{},
        fnc:{}
    };

    const matrixMap = {};

    data.forEach(event=>{

        const base =
            (event.base || "").toLowerCase();

        if(!analysis[base]) return;

        const minutes =
            Number(event.minutes || 0);

        const category =
            event.category || "UNKNOWN";

        const monthIndex =
            Number(event.month) - 1;

        // =====================================
        // BASE
        // =====================================

        analysis[base].totalAOG++;
        analysis[base].totalMinutes += minutes;

        if(minutes > analysis[base].longestMinutes){

            analysis[base].longestMinutes = minutes;

            analysis[base].longestAOG =
                event.duration && event.duration !== "-"
                    ? event.duration
                    : formatMinutes(minutes);

        }

        // =====================================
        // PORTUGAL
        // =====================================

        analysis.portugal.totalAOG++;
        analysis.portugal.totalMinutes += minutes;

        if(minutes > analysis.portugal.longestMinutes){

            analysis.portugal.longestMinutes = minutes;

            analysis.portugal.longestAOG =
                event.duration && event.duration !== "-"
                    ? event.duration
                    : formatMinutes(minutes);

        }

        // =====================================
        // CATEGORY
        // =====================================

        categoryTotals[category] =
            (categoryTotals[category] || 0) + 1;

        baseCategoryTotals[base][category] =
            (baseCategoryTotals[base][category] || 0) + 1;

        // =====================================
        // AIRCRAFT TYPE (NOVO)
        // =====================================

        const aircraftType =
            event.aircraftType ||
            event.type ||
            event.aircraft_family ||
            event.aircraftFamily ||
            event.fleet ||
            "UNKNOWN";

        if(
            aircraftType !== "UNKNOWN" &&
            aircraftType !== "-" &&
            aircraftType !== ""
        ){

            aircraftTypeTotals[aircraftType] =
                (aircraftTypeTotals[aircraftType] || 0) + 1;

        }

        // =====================================
        // TIME DISTRIBUTION
        // =====================================

        if(minutes < 120)
            analysis.timeDistribution.under2++;

        else if(minutes < 240)
            analysis.timeDistribution.between2and4++;

        else if(minutes < 480)
            analysis.timeDistribution.between4and8++;

        else if(minutes < 720)
            analysis.timeDistribution.between8and12++;

        else if(minutes < 1440)
            analysis.timeDistribution.between12and24++;

        else
            analysis.timeDistribution.over24++;

        // =====================================
        // MONTHLY CHART
        // =====================================

        if(monthIndex >= 0 && monthIndex < 12){

            analysis.chart.portugal[monthIndex]++;
            analysis.chart[base][monthIndex]++;

        }

        // =====================================
        // MATRIX
        // =====================================

        if(!matrixMap[category]){

            matrixMap[category] = {
                label:category,
                count:0,
                totalMinutes:0,
                avgMinutes:0,
                percentage:0,
                opo:0,
                lis:0,
                fao:0,
                fnc:0
            };

        }

        matrixMap[category].count++;
        matrixMap[category].totalMinutes += minutes;
        matrixMap[category][base]++;

    });

    // =================================================
    // BASE CALCULATIONS
    // =================================================

    ["opo","lis","fao","fnc"].forEach(base=>{

        const b = analysis[base];

        b.avgMinutes =
            b.totalAOG > 0
                ? b.totalMinutes / b.totalAOG
                : 0;

        b.sharePortugal =
            analysis.portugal.totalAOG > 0
                ? (b.totalAOG / analysis.portugal.totalAOG) * 100
                : 0;

        let topCat = "-";
        let topCount = 0;

        Object.entries(baseCategoryTotals[base]).forEach(([cat,count])=>{

            if(count > topCount){

                topCat = cat;
                topCount = count;

            }

        });

        b.dominantCategory = topCat;
        b.dominantCategoryCount = topCount;

    });

    // =================================================
    // PORTUGAL
    // =================================================

    analysis.portugal.avgMinutes =
        analysis.portugal.totalAOG > 0
            ? analysis.portugal.totalMinutes / analysis.portugal.totalAOG
            : 0;

    let dominant = "-";
    let dominantCount = 0;

    Object.entries(categoryTotals).forEach(([cat,count])=>{

        if(count > dominantCount){

            dominant = cat;
            dominantCount = count;

        }

    });

    analysis.portugal.dominantCategory = dominant;
    analysis.portugal.dominantCategoryCount = dominantCount;

    // =================================================
    // MOST AFFECTED AIRCRAFT TYPE (NOVO)
    // =================================================

    let aircraftType = "-";
    let aircraftCount = 0;

    Object.entries(aircraftTypeTotals).forEach(([type,count])=>{

        if(count > aircraftCount){

            aircraftType = type;
            aircraftCount = count;

        }

    });

    analysis.portugal.mostAffectedAircraft = aircraftType;
    analysis.portugal.aircraftOccurrences = aircraftCount;

    // =================================================
    // MATRIX
    // =================================================

    analysis.matrix =
        Object.values(matrixMap)
            .map(item=>{

                item.avgMinutes =
                    item.count > 0
                        ? item.totalMinutes / item.count
                        : 0;

                item.percentage =
                    analysis.portugal.totalAOG > 0
                        ? (item.count / analysis.portugal.totalAOG) * 100
                        : 0;

                return item;

            })
            .sort((a,b)=>b.count-a.count);

    // =================================================
    // MONTHLY INSIGHTS
    // =================================================

    const peakValue =
        Math.max(...analysis.chart.portugal);

    const lowestValue =
        Math.min(...analysis.chart.portugal);

    analysis.monthlyInsights.peakValue = peakValue;
    analysis.monthlyInsights.lowestValue = lowestValue;

    analysis.monthlyInsights.peakMonth =
        monthOrder[
            analysis.chart.portugal.indexOf(peakValue)
        ];

    analysis.monthlyInsights.lowestMonth =
        monthOrder[
            analysis.chart.portugal.indexOf(lowestValue)
        ];

    return analysis;

}

// =====================================================
// EXPORTS
// =====================================================

window.loadAvailableAnnualYears =
    loadAvailableAnnualYears;


window.loadAnnualReport =
    loadAnnualReport;


window.saveAnnualReport =
    saveAnnualReport;


window.initializeAnnualReport =
    initializeAnnualReport;


window.changeAnnualReportPeriod =
    changeAnnualReportPeriod;


window.renderAnnualReport =
    renderAnnualReport;

window.openAnnualReportReset =
    openAnnualReportReset;


window.openAnnualReportEditVisuals =
    openAnnualReportEditVisuals;


window.openAnnualReportYearSelection =
    openAnnualReportYearSelection;


window.openAnnualReportEditModal =
    openAnnualReportEditModal;


window.deleteAnnualReportYear =
    deleteAnnualReportYear;

window.refreshAnnualFWD =
    refreshAnnualFWD;

window.loadAnnualFWDData =
    loadAnnualFWDData;

window.buildAnnualFWDAnalysis =
    buildAnnualFWDAnalysis;

window.renderAnnualFWDSection =
    renderAnnualFWDSection;

window.discoverAnnualReportYears =
    discoverAnnualReportYears;


window.getAnnualYearsFromFWD =
    getAnnualYearsFromFWD;


window.getAnnualYearsFromNoInfo =
    getAnnualYearsFromNoInfo;


window.ensureAnnualReportYear =
    ensureAnnualReportYear;

window.loadAnnualNoInfoData =
    loadAnnualNoInfoData;


window.buildAnnualNoInfoAnalysis =
    buildAnnualNoInfoAnalysis;


window.renderAnnualNoInfoSection =
    renderAnnualNoInfoSection;


window.refreshAnnualNoInfo =
    refreshAnnualNoInfo;

window.calculateAnnualESRRates =
    calculateAnnualESRRates;

window.renderAnnualESRSection =
    renderAnnualESRSection;


window.calculateAnnualHils =
    calculateAnnualHils;

window.renderAnnualHilsSection =
    renderAnnualHilsSection;


window.calculateAnnualWO =
    calculateAnnualWO;

window.renderAnnualWorkOrdersSection =
    renderAnnualWorkOrdersSection;

window.hydrateAnnualManualMetrics =
    hydrateAnnualManualMetrics;

window.loadAnnualAOGData =
    loadAnnualAOGData;

window.buildAnnualAOGAnalysis =
    buildAnnualAOGAnalysis;

window.refreshAnnualAOG =
    refreshAnnualAOG;

window.renderAnnualAOGSection =
    renderAnnualAOGSection;