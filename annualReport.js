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
// RENDER ANNUAL REPORT
// =====================================================

function renderAnnualReport(){

    // ==========================================
    // ANNUAL REPORT CONTENT
    // ==========================================

    const container =
        document.getElementById(
            "annualReportContent"
        );


    if(
        !container
    ){

        console.warn(
            "ANNUAL REPORT — #annualReportContent not found."
        );

        return;

    }


    // ==========================================
    // ENSURE CURRENT YEAR EXISTS
    // ==========================================

    if(
        !CURRENT_ANNUAL_YEAR
    ){

        CURRENT_ANNUAL_YEAR =
            new Date().getFullYear();

    }


    // ==========================================
    // UPDATE YEAR SELECTOR
    // ==========================================

    populateAnnualYearSelector();


    // ==========================================
    // DO NOT CLEAR THE SECTIONS
    // ==========================================
    //
    // The sections already exist in index.html.
    // FWD will render dynamically into
    // #annualFWDContent.
    //
    // ==========================================


    // ==========================================
    // REFRESH FWD
    // ==========================================

    if(
        typeof refreshAnnualFWD ===
        "function"
    ){

        refreshAnnualFWD();

    }
    else{

        console.error(
            "ANNUAL REPORT — refreshAnnualFWD is not available."
        );

    }

// ==========================================
// REFRESH NO INFO
// ==========================================

if(
    typeof refreshAnnualNoInfo ===
    "function"
){

    refreshAnnualNoInfo();

}
else{

    console.error(
        "ANNUAL REPORT — refreshAnnualNoInfo is not available."
    );

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
// ANNUAL FWD — BUILD YEARLY ANALYSIS
// =====================================================

function buildAnnualFWDAnalysis(
    yearData
){

    const result = {

        year:
            yearData.year,

        months:
            [],

        totals:{

    opo:{
        fwd:0,
        nightStops:0,
        rate:0
    },

    portugal:{
        fwd:0,
        nightStops:0,
        rate:0
    },

    spmfb:{
        fwd:0,
        nightStops:0,
        rate:0
    }

},

        monthly:{

            opo:[],
            portugal:[],
            spmfb:[]

        }

    };


    // =================================================
    // LOOP MONTHS
    // =================================================

    yearData.availableMonths.forEach(
        month => {

            const monthKey =
                String(month)
                    .padStart(
                        2,
                        "0"
                    );


            const monthData =
                yearData.months[
                    monthKey
                ] ||
                yearData.months[
                    month
                ];


            if(
                !monthData ||
                typeof monthData !==
                    "object"
            ){

                return;

            }


            const monthStats = {

                opo:{
                    fwd:0,
                    nightStops:0,
                    flights:0
                },

                portugal:{
                    fwd:0,
                    nightStops:0,
                    flights:0
                },

                spmfb:{
                    fwd:0,
                    nightStops:0,
                    flights:0
                }

            };


            // =================================================
            // LOOP DAYS
            // =================================================

            Object.keys(
                monthData
            ).forEach(
                day => {

                    const dayData =
                        monthData[
                            day
                        ];


                    if(
                        !dayData ||
                        typeof dayData !==
                            "object"
                    ){

                        return;

                    }


                    // ==========================================
                    // LOOP BASES
                    // ==========================================

                    Object.keys(
                        dayData
                    ).forEach(
                        base => {

                            const data =
                                dayData[
                                    base
                                ];


                            if(
                                !data ||
                                typeof data !==
                                    "object"
                            ){

                                return;

                            }


                            const fwd =
                                Number(
                                    data.fwd
                                ) ||
                                0;


                            const nightStop =
                                Number(
                                    data.nightStop
                                ) ||
                                0;


                            /*
                             * IMPORTANT
                             *
                             * We do NOT invent a flight count.
                             *
                             * FWD data currently stores:
                             *
                             *   nightStop
                             *   fwd
                             *   delayEvents
                             *
                             * Therefore flights/rate will be
                             * calculated only where the existing
                             * FWD dataset provides the required
                             * denominator.
                             */


                            const country =
                                BASE_COUNTRIES[
                                    base
                                ];


                            const isSPMFB = true;


                            // =================================
                            // BASE / OPO
                            // =================================

                            if(
                                base ===
                                "OPO"
                            ){

                                monthStats.opo.fwd +=
                                    fwd;

                                monthStats.opo.nightStops +=
                                    nightStop;

                            }


                            // =================================
                            // COUNTRY
                            // =================================

                            if(
                                country ===
                                "Portugal"
                            ){

                                monthStats.portugal.fwd +=
                                    fwd;

                                monthStats.portugal.nightStops +=
                                    nightStop;

                            }


                            // =================================
                            // SPMFB REGION
                            // =================================

                            if(
                                isSPMFB
                            ){

                                monthStats.spmfb.fwd +=
                                    fwd;

                                monthStats.spmfb.nightStops +=
                                    nightStop;

                            }

                        }
                    );

                }
            );


            // =================================================
            // SAVE MONTH
            // =================================================

            result.months.push(
                month
            );


            result.monthly.opo.push({

                month:
                    month,

                fwd:
                    monthStats.opo.fwd,

                nightStops:
                    monthStats.opo.nightStops

            });


            result.monthly.portugal.push({

                month:
                    month,

                fwd:
                    monthStats.portugal.fwd,

                nightStops:
                    monthStats.portugal.nightStops

            });


            result.monthly.spmfb.push({

                month:
                    month,

                fwd:
                    monthStats.spmfb.fwd,

                nightStops:
                    monthStats.spmfb.nightStops

            });


            // =================================================
            // YEAR TOTALS
            // =================================================

            result.totals.opo.fwd +=
                monthStats.opo.fwd;

            result.totals.opo.nightStops +=
                monthStats.opo.nightStops;


            result.totals.portugal.fwd +=
                monthStats.portugal.fwd;

            result.totals.portugal.nightStops +=
                monthStats.portugal.nightStops;


            result.totals.spmfb.fwd +=
                monthStats.spmfb.fwd;

            result.totals.spmfb.nightStops +=
                monthStats.spmfb.nightStops;

        }
    );


// =================================================
// ANNUAL FWD RATE
// SAME FORMULA AS MAIN FWD DASHBOARD
// FWD / NIGHT STOPS × 100
// =================================================

result.totals.opo.rate =

    result.totals.opo.nightStops

        ? Number(

            (
                (
                    result.totals.opo.fwd /
                    result.totals.opo.nightStops
                ) * 100

            ).toFixed(1)

        )

        : 0;


result.totals.portugal.rate =

    result.totals.portugal.nightStops

        ? Number(

            (
                (
                    result.totals.portugal.fwd /
                    result.totals.portugal.nightStops
                ) * 100

            ).toFixed(1)

        )

        : 0;


result.totals.spmfb.rate =

    result.totals.spmfb.nightStops

        ? Number(

            (
                (
                    result.totals.spmfb.fwd /
                    result.totals.spmfb.nightStops
                ) * 100

            ).toFixed(1)

        )

        : 0;

    return result;

}

// =====================================================
// ANNUAL FWD — RENDER SECTION
// =====================================================

function renderAnnualFWDSection(
    analysis
){

    const container =
        document.getElementById(
            "annualFWDContent"
        );


    if(!container){

        return;

    }


    if(!analysis){

        container.innerHTML = "";

        return;

    }


    // =================================================
    // ANNUAL DATA
    // =================================================

    const totals =
        analysis.totals || {};


    const opo =
        totals.opo || {};


    const portugal =
        totals.portugal || {};


    const spmfb =
        totals.spmfb || {};


    // =================================================
    // MONTHLY DATA
    // =================================================

    const months =
        analysis.months || [];


    const opoMonthly =
        analysis.monthly?.opo || [];


    const portugalMonthly =
        analysis.monthly?.portugal || [];


    const spmfbMonthly =
        analysis.monthly?.spmfb || [];


    // =================================================
    // MONTH NAMES
    // =================================================

    const monthNames = [

        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"

    ];


    // =================================================
    // PEAK MONTH
    // =================================================

    function getPeak(
        data
    ){

        if(
            !Array.isArray(data) ||
            !data.length
        ){

            return null;

        }


        return data.reduce(

            (
                max,
                current
            ) =>

                Number(
                    current.fwd || 0
                ) >

                Number(
                    max.fwd || 0
                )

                    ? current
                    : max

        );

    }


    const opoPeak =
        getPeak(
            opoMonthly
        );


    const portugalPeak =
        getPeak(
            portugalMonthly
        );


    const spmfbPeak =
        getPeak(
            spmfbMonthly
        );


    const peakCandidates = [

        {
            source: "OPO",
            data: opoPeak
        },

        {
            source: "Portugal",
            data: portugalPeak
        },

        {
            source: "SPMFB Region",
            data: spmfbPeak
        }

    ].filter(
        item =>
            item.data
    );


    let peakSource = null;


    peakCandidates.forEach(
        item => {

            if(
                !peakSource ||
                Number(
                    item.data.fwd || 0
                ) >

                Number(
                    peakSource.data.fwd || 0
                )
            ){

                peakSource =
                    item;

            }

        }
    );


    const peakMonth =
        peakSource?.data
            ? monthNames[
                Number(
                    peakSource.data.month
                ) - 1
            ] || "—"
            : "—";


    const peakValue =
        peakSource?.data
            ? Number(
                peakSource.data.fwd || 0
            )
            : 0;


    // =================================================
    // COMPARISON
    // Lower FWD RATE = BETTER
    // =================================================

    function compareRates(
        opoRate,
        referenceRate
    ){

        const opoValue =
            Number(
                opoRate || 0
            );


        const referenceValue =
            Number(
                referenceRate || 0
            );


        if(
            opoValue <
            referenceValue
        ){

            return {

                text:
                    "BETTER",

                className:
                    "positive"

            };

        }


        if(
            opoValue >
            referenceValue
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


    const opoVsPortugal =
        compareRates(
            opo.rate,
            portugal.rate
        );


    const opoVsSPMFB =
        compareRates(
            opo.rate,
            spmfb.rate
        );


    // =================================================
    // HTML
    // =================================================

    container.innerHTML = `

        <div
            class="annual-fwd-wrapper"
        >


            <!-- =========================================
                 FOUR KPI CARDS
            ========================================== -->

            <div
                class="annual-fwd-kpis"
            >


                <!-- =====================================
                     OPO
                ====================================== -->

                <div
                    class="annual-fwd-kpi"
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >

                        OPO

                    </div>


                    <div
                        class="annual-fwd-kpi-row"
                    >


                        <div>

                            <span>
                                FWD
                            </span>

                            <strong>
                                ${Number(
                                    opo.fwd || 0
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                RATE
                            </span>

                            <strong>
                                ${Number(
                                    opo.rate || 0
                                ).toFixed(1)}%
                            </strong>

                        </div>


                        <div>

                            <span>
                                NS
                            </span>

                            <strong>
                                ${Number(
                                    opo.nightStops || 0
                                )}
                            </strong>

                        </div>


                    </div>

                </div>


                <!-- =====================================
                     PORTUGAL
                ====================================== -->

                <div
                    class="annual-fwd-kpi"
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >

                        PORTUGAL

                    </div>


                    <div
                        class="annual-fwd-kpi-row"
                    >


                        <div>

                            <span>
                                FWD
                            </span>

                            <strong>
                                ${Number(
                                    portugal.fwd || 0
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                RATE
                            </span>

                            <strong>
                                ${Number(
                                    portugal.rate || 0
                                ).toFixed(1)}%
                            </strong>

                        </div>


                        <div>

                            <span>
                                NS
                            </span>

                            <strong>
                                ${Number(
                                    portugal.nightStops || 0
                                )}
                            </strong>

                        </div>


                    </div>

                </div>


                <!-- =====================================
                     SPMFB REGION
                ====================================== -->

                <div
                    class="annual-fwd-kpi"
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >

                        SPMFB REGION

                    </div>


                    <div
                        class="annual-fwd-kpi-row"
                    >


                        <div>

                            <span>
                                FWD
                            </span>

                            <strong>
                                ${Number(
                                    spmfb.fwd || 0
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                RATE
                            </span>

                            <strong>
                                ${Number(
                                    spmfb.rate || 0
                                ).toFixed(1)}%
                            </strong>

                        </div>


                        <div>

                            <span>
                                NS
                            </span>

                            <strong>
                                ${Number(
                                    spmfb.nightStops || 0
                                )}
                            </strong>

                        </div>


                    </div>

                </div>


                <!-- =====================================
                     OPO COMPARISON
                ====================================== -->

                <div
                    class="
                        annual-fwd-kpi
                        annual-fwd-comparison
                    "
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >

                        OPO PERFORMANCE

                    </div>


                    <div
                        class="annual-fwd-comparison-heading"
                    >

                        OPO COMPARISON

                    </div>


                    <!-- PORTUGAL -->

                    <div
                        class="
                            annual-fwd-comparison-item
                            ${opoVsPortugal.className}
                        "
                    >

                        <span
                            class="comparison-indicator"
                        ></span>


                        <div>

                            <small>
                                Portugal Average
                            </small>

                            <strong>
                                ${opoVsPortugal.text}
                            </strong>

                        </div>

                    </div>


                    <!-- SPMFB -->

                    <div
                        class="
                            annual-fwd-comparison-item
                            ${opoVsSPMFB.className}
                        "
                    >

                        <span
                            class="comparison-indicator"
                        ></span>


                        <div>

                            <small>
                                SPMFB Region Average
                            </small>

                            <strong>
                                ${opoVsSPMFB.text}
                            </strong>

                        </div>

                    </div>


                </div>


            </div>


            <!-- =========================================
                 MONTHLY CHART
            ========================================== -->

            <div
                class="annual-fwd-chart-card"
            >


                <div
                    class="annual-fwd-chart-header"
                >

                    <div>

                        <h3>
                            Monthly FWD Performance
                        </h3>

                        <span>
                            FWD evolution across available months
                        </span>

                    </div>


                    <div
                        class="annual-fwd-peak"
                    >

                        Peak:

                        <strong>
                            ${peakMonth}
                        </strong>

                        <span>
                            (${peakValue} FWD)
                        </span>

                    </div>

                </div>


                <div
                    class="annual-fwd-chart-wrap"
                >

                    <canvas
                        id="annualFWDMonthlyChart"
                    ></canvas>

                </div>


            </div>


        </div>

    `;


    // =================================================
    // CHART.JS CHECK
    // =================================================

    if(
        typeof Chart ===
        "undefined"
    ){

        console.warn(
            "Chart.js is not available."
        );

        return;

    }


    // =================================================
    // CANVAS
    // =================================================

    const canvas =
        document.getElementById(
            "annualFWDMonthlyChart"
        );


    if(!canvas){

        return;

    }


    // =================================================
    // DESTROY PREVIOUS CHART
    // =================================================

    if(
        window.annualFWDMonthlyChart &&
        typeof
        window.annualFWDMonthlyChart.destroy ===
        "function"
    ){

        window
            .annualFWDMonthlyChart
            .destroy();

    }


    window.annualFWDMonthlyChart =
        null;


    // =================================================
    // LABELS
    // =================================================

    const labels =
        months.map(

            month =>

                monthNames[
                    Number(month) - 1
                ] || String(month)

        );


    // =================================================
    // DATA
    // =================================================

    const opoChartData =
        months.map(

            month => {

                const row =
                    opoMonthly.find(
                        item =>
                            Number(
                                item.month
                            ) ===
                            Number(month)
                    );

                return Number(
                    row?.fwd || 0
                );

            }

        );


    const portugalChartData =
        months.map(

            month => {

                const row =
                    portugalMonthly.find(
                        item =>
                            Number(
                                item.month
                            ) ===
                            Number(month)
                    );

                return Number(
                    row?.fwd || 0
                );

            }

        );


    const spmfbChartData =
        months.map(

            month => {

                const row =
                    spmfbMonthly.find(
                        item =>
                            Number(
                                item.month
                            ) ===
                            Number(month)
                    );

                return Number(
                    row?.fwd || 0
                );

            }

        );


    // =================================================
    // CREATE CHART
    // =================================================

    window.annualFWDMonthlyChart =

        new Chart(

            canvas.getContext(
                "2d"
            ),

            {

                type:
                    "line",


                data:{

                    labels:
                        labels,


                    datasets:[


                        // OPO
                        {

                            label:
                                "OPO",

                            data:
                                opoChartData,

                            borderColor:
                                "#003399",

                            backgroundColor:
                                "rgba(0,51,153,0.08)",

                            borderWidth:
                                3,

                            pointRadius:
                                4,

                            pointHoverRadius:
                                6,

                            pointBackgroundColor:
                                "#003399",

                            pointBorderColor:
                                "#ffffff",

                            pointBorderWidth:
                                2,

                            tension:
                                0.3,

                            fill:
                                false

                        },


                        // PORTUGAL
                        {

                            label:
                                "Portugal",

                            data:
                                portugalChartData,

                            borderColor:
                                "#f5c400",

                            backgroundColor:
                                "rgba(245,196,0,0.10)",

                            borderWidth:
                                3,

                            pointRadius:
                                4,

                            pointHoverRadius:
                                6,

                            pointBackgroundColor:
                                "#f5c400",

                            pointBorderColor:
                                "#ffffff",

                            pointBorderWidth:
                                2,

                            tension:
                                0.3,

                            fill:
                                false

                        },


                        // SPMFB
                        {

                            label:
                                "SPMFB Region",

                            data:
                                spmfbChartData,

                            borderColor:
                                "#4f6fae",

                            backgroundColor:
                                "rgba(79,111,174,0.08)",

                            borderWidth:
                                3,

                            pointRadius:
                                4,

                            pointHoverRadius:
                                6,

                            pointBackgroundColor:
                                "#4f6fae",

                            pointBorderColor:
                                "#ffffff",

                            pointBorderWidth:
                                2,

                            tension:
                                0.3,

                            fill:
                                false

                        }

                    ]

                },


                options:{

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    interaction:{

                        mode:
                            "index",

                        intersect:
                            false

                    },


                    plugins:{

                        datalabels: annualChartDataLabels(),

                        legend:{

                            display:
                                true,

                            position:
                                "top",

                            align:
                                "end",

                            labels:{

                                usePointStyle:
                                    true,

                                pointStyle:
                                    "circle",

                                padding:
                                    18,

                                boxWidth:
                                    9,

                                font:{

                                    size:
                                        12,

                                    weight:
                                        "700"

                                }

                            }

                        },


                        tooltip:{

                            backgroundColor:
                                "#082d70",

                            titleColor:
                                "#ffffff",

                            bodyColor:
                                "#ffffff",

                            padding:
                                12,

                            cornerRadius:
                                8

                        }

                    },


                    scales:{

                        x:{

                            grid:{

                                display:
                                    false

                            },

                            ticks:{

                                color:
                                    "#71829a",

                                font:{

                                    size:
                                        11,

                                    weight:
                                        "600"

                                }

                            }

                        },


                        y:{

                            beginAtZero:
                                true,

                            grid:{

                                color:
                                    "#edf1f6"

                            },

                            ticks:{

                                color:
                                    "#71829a",

                                precision:
                                    0

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
// ANNUAL NO INFO — BUILD YEARLY ANALYSIS
// =====================================================

function buildAnnualNoInfoAnalysis(
    yearData
){

    const result = {

        year:
            yearData?.year,

        months:[],


        totals:{

            opo:{

                noInfo:0,

                rate:0

            },


            portugal:{

                noInfo:0,

                rate:0

            },


            spmfb:{

                noInfo:0,

                rate:0

            }

        },


        monthly:{

            opo:[],

            portugal:[],

            spmfb:[]

        }

    };


    if(
        !yearData ||
        !Array.isArray(
            yearData.availableMonths
        )
    ){

        return result;

    }


    // =================================================
    // MONTH LOOP
    // =================================================

    yearData.availableMonths.forEach(
        month => {

            const monthKey =
                String(month)
                    .padStart(
                        2,
                        "0"
                    );


            const monthData =
                yearData.months[
                    monthKey
                ] ||
                yearData.months[
                    month
                ];


            if(
                !monthData ||
                typeof monthData !==
                    "object"
            ){

                return;

            }


            // =========================================
            // TOTAL NO INFO
            // =========================================

            const total =
                Number(
                    monthData.total || 0
                );


            // =========================================
            // ALL BASE PERCENTAGES
            // =========================================

            const baseChart =
                Array.isArray(
                    monthData.chart
                )
                    ? monthData.chart
                    : [];


            // =========================================
            // FIND OPO SHARE
            // =========================================

            const opoBase =
                baseChart.find(
                    item =>
                        String(
                            item?.base || ""
                        )
                        .trim()
                        .toUpperCase()
                        ===
                        "OPO"
                );


            const opoShare =
                Number(
                    opoBase?.val || 0
                );


            // =========================================
            // OPO NUMBER
            // =========================================
            //
            // Base chart percentages represent
            // the distribution of total No Info.
            //
            // Therefore:
            //
            // OPO events =
            // total × OPO percentage
            //
            // =========================================

            const opoNoInfo =
                total > 0

                    ?

                    (
                        total *
                        opoShare /
                        100
                    )

                    : 0;


            // =========================================
            // PORTUGAL TOTAL
            // =========================================

            const portugalNoInfo =
                Number(
                    monthData.portugalTotal ||
                    0
                );


            // =========================================
            // MONTHLY RATES
            // =========================================
            //
            // No Info does not have a flight
            // denominator like FWD.
            //
            // The available and validated metric
            // is the percentage share of total
            // No Info events.
            //
            // =========================================

            const portugalRate =
                total > 0

                    ?

                    (
                        portugalNoInfo /
                        total *
                        100
                    )

                    : 0;


            const opoRate =
                total > 0

                    ?

                    (
                        opoNoInfo /
                        total *
                        100
                    )

                    : 0;


            const spmfbRate =
                total > 0
                    ? 100
                    : 0;


            // =========================================
            // ANNUAL TOTALS
            // =========================================

            result.totals.opo.noInfo +=
                opoNoInfo;


            result.totals.portugal.noInfo +=
                portugalNoInfo;


            result.totals.spmfb.noInfo +=
                total;


            // =========================================
            // MONTHS
            // =========================================

            result.months.push(
                month
            );


            // =========================================
            // MONTHLY DATA
            // =========================================

            result.monthly.opo.push({

                month,

                noInfo:
                    opoNoInfo,

                rate:
                    opoRate

            });


            result.monthly.portugal.push({

                month,

                noInfo:
                    portugalNoInfo,

                rate:
                    portugalRate

            });


            result.monthly.spmfb.push({

                month,

                noInfo:
                    total,

                rate:
                    spmfbRate

            });

        }
    );


    // =================================================
    // ANNUAL RATES
    // =================================================

    const annualTotal =
        result.totals.spmfb.noInfo;


    if(
        annualTotal > 0
    ){

        result.totals.opo.rate =
            (
                result.totals.opo.noInfo /
                annualTotal *
                100
            );


        result.totals.portugal.rate =
            (
                result.totals.portugal.noInfo /
                annualTotal *
                100
            );


        result.totals.spmfb.rate =
            100;

    }


    // =================================================
    // ROUND TOTAL COUNTS
    // =================================================

    result.totals.opo.noInfo =
        Math.round(
            result.totals.opo.noInfo
        );


    result.totals.portugal.noInfo =
        Math.round(
            result.totals.portugal.noInfo
        );


    result.totals.spmfb.noInfo =
        Math.round(
            result.totals.spmfb.noInfo
        );


    console.log(
        "ANNUAL NO INFO — Analysis:",
        result
    );


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
// ANNUAL NO INFO — RENDER SECTION
// =====================================================

function renderAnnualNoInfoSection(
    analysis
){

    const container =
        document.getElementById(
            "annualNoInfoContent"
        );


    if(!container){

        console.warn(
            "ANNUAL NO INFO — Content container not found."
        );

        return;

    }


    if(!analysis){

        container.innerHTML =
            "";

        return;

    }


    const totals =
        analysis.totals || {};


    const opo =
        totals.opo || {};


    const portugal =
        totals.portugal || {};


    const spmfb =
        totals.spmfb || {};


    const months =
        analysis.months || [];


    const opoMonthly =
        analysis.monthly?.opo || [];


    const portugalMonthly =
        analysis.monthly?.portugal || [];


    const spmfbMonthly =
        analysis.monthly?.spmfb || [];


    // =================================================
    // MONTH NAMES
    // =================================================

    const monthNames = [

        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"

    ];


    // =================================================
    // PEAK MONTH
    // =================================================

    const peakCandidates = [

        ...opoMonthly.map(
            item => ({

                source:
                    "OPO",

                ...item

            })
        ),

        ...portugalMonthly.map(
            item => ({

                source:
                    "Portugal",

                ...item

            })
        ),

        ...spmfbMonthly.map(
            item => ({

                source:
                    "SPMFB Region",

                ...item

            })
        )

    ];


    const peak =
        peakCandidates.reduce(

            (
                max,
                item
            ) =>

                !max ||
                Number(
                    item.rate || 0
                ) >
                Number(
                    max.rate || 0
                )

                    ? item
                    : max,

            null

        );


    const peakMonth =
        peak
            ? monthNames[
                Number(
                    peak.month
                ) - 1
            ] || "—"
            : "—";


    const peakRate =
        peak
            ? Number(
                peak.rate || 0
            )
            : 0;



    // =================================================
    // HTML
    // =================================================

    container.innerHTML = `

        <div
            class="annual-fwd-wrapper annual-noinfo-wrapper"
        >


            <!-- =====================================
                 KPI CARDS
            ====================================== -->

            <div
                class="annual-fwd-kpis"
            >


                <!-- OPO -->

                <div
                    class="annual-fwd-kpi"
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >

                        OPO

                    </div>


                    <div
                        class="annual-fwd-kpi-row"
                    >

                        <div>

                            <span>
                                NO INFO
                            </span>

                            <strong>
                                ${Number(
                                    opo.noInfo || 0
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                RATE
                            </span>

                            <strong>
                                ${Number(
                                    opo.rate || 0
                                ).toFixed(1)}%
                            </strong>

                        </div>


                    </div>

                </div>


                <!-- PORTUGAL -->

                <div
                    class="annual-fwd-kpi"
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >

                        PORTUGAL

                    </div>


                    <div
                        class="annual-fwd-kpi-row
                               annual-noinfo-two-metrics"
                    >

                        <div>

                            <span>
                                NO INFO
                            </span>

                            <strong>
                                ${Number(
                                    portugal.noInfo || 0
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                RATE
                            </span>

                            <strong>
                                ${Number(
                                    portugal.rate || 0
                                ).toFixed(1)}%
                            </strong>

                        </div>

                    </div>

                </div>


                <!-- SPMFB REGION -->

                <div
                    class="annual-fwd-kpi"
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >

                        SPMFB REGION

                    </div>


                    <div
                        class="annual-fwd-kpi-row
                               annual-noinfo-two-metrics"
                    >

                        <div>

                            <span>
                                NO INFO
                            </span>

                            <strong>
                                ${Number(
                                    spmfb.noInfo || 0
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                RATE
                            </span>

                            <strong>
                                ${Number(
                                    spmfb.rate || 0
                                ).toFixed(1)}%
                            </strong>

                        </div>

                    </div>

                </div>


            <!-- =====================================
                 MONTHLY RATE CHART
            ====================================== -->

            <div
                class="annual-fwd-chart-card"
            >

                <div
                    class="annual-fwd-chart-header"
                >

                    <div>

                        <h3>
                            Monthly No Info Performance
                        </h3>

                        <span>
                            No Info rate evolution across available months
                        </span>

                    </div>


                    <div
                        class="annual-fwd-peak"
                    >

                        Peak:

                        <strong>
                            ${peakMonth}
                        </strong>

                        <span>
                            (${peakRate.toFixed(1)}%)
                        </span>

                    </div>

                </div>


                <div
                    class="annual-fwd-chart-wrap"
                >

                    <canvas
                        id="annualNoInfoMonthlyChart"
                    ></canvas>

                </div>

            </div>


        </div>

    `;


    // =================================================
    // CHART
    // =================================================

    if(
        typeof Chart ===
        "undefined"
    ){

        console.warn(
            "ANNUAL NO INFO — Chart.js not available."
        );

        return;

    }


    const canvas =
        document.getElementById(
            "annualNoInfoMonthlyChart"
        );


    if(!canvas){

        return;

    }


    // =================================================
    // DESTROY PREVIOUS CHART
    // =================================================

    if(
        window.annualNoInfoMonthlyChart &&
        typeof
        window.annualNoInfoMonthlyChart.destroy ===
        "function"
    ){

        window
            .annualNoInfoMonthlyChart
            .destroy();

    }


    const labels =
        months.map(
            month =>
                monthNames[
                    Number(month) - 1
                ] || String(month)
        );


    // =================================================
    // ALIGN MONTHLY DATA
    // =================================================

    function monthlyValues(
        data
    ){

        return months.map(

            month => {

                const row =
                    data.find(
                        item =>
                            Number(
                                item.month
                            ) ===
                            Number(month)
                    );


                return Number(
                    row?.rate || 0
                );

            }

        );

    }


    const opoRateData =
        monthlyValues(
            opoMonthly
        );


    const portugalRateData =
        monthlyValues(
            portugalMonthly
        );


    const spmfbRateData =
        monthlyValues(
            spmfbMonthly
        );


    // =================================================
    // CREATE CHART
    // =================================================

    window.annualNoInfoMonthlyChart =

        new Chart(

            canvas.getContext(
                "2d"
            ),

            {

                type:
                    "line",


                data:{

                    labels,


                    datasets:[


                        {

                            label:
                                "OPO",

                            data:
                                opoRateData,

                            borderColor:
                                "#003399",

                            backgroundColor:
                                "rgba(0,51,153,0.08)",

                            borderWidth:
                                3,

                            pointRadius:
                                4,

                            pointHoverRadius:
                                6,

                            pointBackgroundColor:
                                "#003399",

                            pointBorderColor:
                                "#ffffff",

                            pointBorderWidth:
                                2,

                            tension:
                                0.3,

                            fill:
                                false

                        },


                        {

                            label:
                                "Portugal",

                            data:
                                portugalRateData,

                            borderColor:
                                "#f5c400",

                            backgroundColor:
                                "rgba(245,196,0,0.10)",

                            borderWidth:
                                3,

                            pointRadius:
                                4,

                            pointHoverRadius:
                                6,

                            pointBackgroundColor:
                                "#f5c400",

                            pointBorderColor:
                                "#ffffff",

                            pointBorderWidth:
                                2,

                            tension:
                                0.3,

                            fill:
                                false

                        },


                        {

                            label:
                                "SPMFB Region",

                            data:
                                spmfbRateData,

                            borderColor:
                                "#4f6fae",

                            backgroundColor:
                                "rgba(79,111,174,0.08)",

                            borderWidth:
                                3,

                            pointRadius:
                                4,

                            pointHoverRadius:
                                6,

                            pointBackgroundColor:
                                "#4f6fae",

                            pointBorderColor:
                                "#ffffff",

                            pointBorderWidth:
                                2,

                            tension:
                                0.3,

                            fill:
                                false

                        }

                    ]

                },


                options:{

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    interaction:{

                        mode:
                            "index",

                        intersect:
                            false

                    },


                    plugins:{
                        datalabels: annualChartDataLabels(),
                        legend:{

                            display:
                                true,

                            position:
                                "top",

                            align:
                                "end",

                            labels:{

                                usePointStyle:
                                    true,

                                pointStyle:
                                    "circle",

                                padding:
                                    18,

                                boxWidth:
                                    9,

                                font:{

                                    size:
                                        12,

                                    weight:
                                        "700"

                                }

                            }

                        },


                        tooltip:{

                            backgroundColor:
                                "#082d70",

                            titleColor:
                                "#ffffff",

                            bodyColor:
                                "#ffffff",

                            padding:
                                12,

                            cornerRadius:
                                8,

                            callbacks:{

                                label:
                                    context =>
                                        `${context.dataset.label}: ${Number(
                                            context.raw || 0
                                        ).toFixed(1)}%`

                            }

                        }

                    },


                    scales:{

                        x:{

                            grid:{

                                display:
                                    false

                            },

                            ticks:{

                                color:
                                    "#71829a",

                                font:{

                                    size:
                                        11,

                                    weight:
                                        "600"

                                }

                            }

                        },


                        y:{

                            beginAtZero:
                                true,

                            grid:{

                                color:
                                    "#edf1f6"

                            },

                            ticks:{

                                color:
                                    "#71829a",

                                callback:
                                    value =>
                                        `${value}%`

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

    opo: {
        open: 0,
        rate: 0
    },

    portugal: {
        lis: 0,
        fao: 0,
        fnc: 0,
        open: 0,
        rate: 0
    },

    spmfb: {
        open: 0
    }

};


// =====================================================
// ESR RATE CALCULATION
// =====================================================

function calculateAnnualESRRates(){

    const opoOpen =
        Number(
            annualESRData.opo.open || 0
        );

    const lisOpen =
        Number(
            annualESRData.portugal.lis || 0
        );

    const faoOpen =
        Number(
            annualESRData.portugal.fao || 0
        );

    const fncOpen =
        Number(
            annualESRData.portugal.fnc || 0
        );

    const spmfbOpen =
        Number(
            annualESRData.spmfb.open || 0
        );


    // OPO is already part of Portugal

    annualESRData.portugal.open =
        opoOpen +
        lisOpen +
        faoOpen +
        fncOpen;


    // =============================================
    // RATE
    // =============================================

    if(
        spmfbOpen > 0
    ){

        annualESRData.opo.rate =
            (
                opoOpen /
                spmfbOpen
            ) * 100;


        annualESRData.portugal.rate =
            (
                annualESRData.portugal.open /
                spmfbOpen
            ) * 100;

    }
    else{

        annualESRData.opo.rate =
            0;

        annualESRData.portugal.rate =
            0;

    }


    return annualESRData;

}

// =====================================================
// ESR COMPARISON
// Lower RATE = BETTER
// =====================================================

function compareAnnualESR(
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


    if(
        opo < reference
    ){

        return {

            text:
                "BETTER",

            className:
                "positive"

        };

    }


    if(
        opo > reference
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
// ESR KPI RENDER
// =====================================================

function renderAnnualESRSection(){

    const container =
        document.getElementById(
            "annualESRContent"
        );


    if(!container){

        console.warn(
            "ANNUAL ESR — container not found."
        );

        return;

    }


    calculateAnnualESRRates();


    const opo =
        annualESRData.opo;


    const portugal =
        annualESRData.portugal;


    const spmfb =
        annualESRData.spmfb;


    // =================================================
    // COMPARISON
    // =================================================

    const opoVsPortugal =
        compareAnnualESR(
            opo.rate,
            portugal.rate
        );




    // =================================================
    // HTML
    // =================================================

    container.innerHTML = `

        <div
            class="annual-fwd-wrapper annual-esr-wrapper"
        >


            <div
                class="annual-fwd-kpis"
            >


                <!-- =================================
                     OPO
                ================================== -->

                <div
                    class="annual-fwd-kpi"
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >
                        OPO
                    </div>


                    <div
                        class="
                            annual-fwd-kpi-row
                            annual-esr-two-metrics
                        "
                    >

                        <div>

                            <span>
                                ESR OPEN
                            </span>

                            <strong>
                                ${opo.open}
                            </strong>

                        </div>


                        <div>

                            <span>
                                RATE
                            </span>

                            <strong>
                                ${opo.rate.toFixed(1)}%
                            </strong>

                        </div>

                    </div>

                </div>


                <!-- =================================
                     PORTUGAL
                ================================== -->

                <div
                    class="annual-fwd-kpi"
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >
                        PORTUGAL
                    </div>


                    <div
                        class="
                            annual-fwd-kpi-row
                            annual-esr-two-metrics
                        "
                    >

                        <div>

                            <span>
                                ESR OPEN
                            </span>

                            <strong>
                                ${portugal.open}
                            </strong>

                        </div>


                        <div>

                            <span>
                                RATE
                            </span>

                            <strong>
                                ${portugal.rate.toFixed(1)}%
                            </strong>

                        </div>

                    </div>


                    <div class="annual-esr-breakdown">

    <div class="annual-base-chip">
        <span>LIS</span>
        <strong>${portugal.lis}</strong>
    </div>

    <div class="annual-base-chip">
        <span>FAO</span>
        <strong>${portugal.fao}</strong>
    </div>

    <div class="annual-base-chip">
        <span>FNC</span>
        <strong>${portugal.fnc}</strong>
    </div>

</div>

                </div>


                <!-- =================================
                     SPMFB REGION
                ================================== -->

                <div
                    class="annual-fwd-kpi"
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >
                        SPMFB REGION
                    </div>


                    <div
                        class="
                            annual-fwd-kpi-row
                            annual-esr-region
                        "
                    >

                        <div>

                            <span>
                                ESR OPEN
                            </span>

                            <strong>
                                ${spmfb.open}
                            </strong>

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

    const opoOpen =
        Number(
            annualHilsData.opo.open || 0
        );


    const opoClosed =
        Number(
            annualHilsData.opo.closed || 0
        );


    // =========================================
    // PORTUGAL
    // OPO IS ALREADY INCLUDED
    // =========================================

    annualHilsData.portugal.open =

        opoOpen +

        Number(
            annualHilsData.portugal.lisOpen || 0
        ) +

        Number(
            annualHilsData.portugal.faoOpen || 0
        ) +

        Number(
            annualHilsData.portugal.fncOpen || 0
        );


    annualHilsData.portugal.closed =

        opoClosed +

        Number(
            annualHilsData.portugal.lisClosed || 0
        ) +

        Number(
            annualHilsData.portugal.fncClosed || 0
        ) +

        Number(
            annualHilsData.portugal.faoClosed || 0
        );


    // =========================================
    // SPMFB
    // =========================================

    const regionOpen =
        Number(
            annualHilsData.spmfb.open || 0
        );


    const regionClosed =
        Number(
            annualHilsData.spmfb.closed || 0
        );


    // =========================================
    // OPEN RATE
    // =========================================

    if(
        regionOpen > 0
    ){

        annualHilsData.opo.openRate =

            (
                opoOpen /
                regionOpen
            ) * 100;


        annualHilsData.portugal.openRate =

            (
                annualHilsData.portugal.open /
                regionOpen
            ) * 100;

    }
    else{

        annualHilsData.opo.openRate = 0;

        annualHilsData.portugal.openRate = 0;

    }


    // =========================================
    // CLOSED RATE
    // =========================================

    if(
        regionClosed > 0
    ){

        annualHilsData.opo.closedRate =

            (
                opoClosed /
                regionClosed
            ) * 100;


        annualHilsData.portugal.closedRate =

            (
                annualHilsData.portugal.closed /
                regionClosed
            ) * 100;

    }
    else{

        annualHilsData.opo.closedRate = 0;

        annualHilsData.portugal.closedRate = 0;

    }


    // =========================================
    // CLOSED / OPEN RATIO
    // =========================================

    annualHilsData.opo.ratio =

        opoOpen > 0

            ? opoClosed / opoOpen

            : 0;


    annualHilsData.portugal.ratio =

        annualHilsData.portugal.open > 0

            ?

            annualHilsData.portugal.closed /
            annualHilsData.portugal.open

            : 0;


    annualHilsData.spmfb.ratio =

        regionOpen > 0

            ?

            regionClosed /
            regionOpen

            : 0;


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
        document.getElementById(
            "annualHilsContent"
        );


    if(!container){

        console.warn(
            "ANNUAL HILs — container not found."
        );

        return;

    }


    calculateAnnualHils();


    const opo =
        annualHilsData.opo;


    const portugal =
        annualHilsData.portugal;


    const spmfb =
        annualHilsData.spmfb;


    // =========================================
    // COMPARISON
    // =========================================

    const opoVsPortugal =
        compareAnnualHilsRatio(

            opo.ratio,

            portugal.ratio

        );


    // =========================================
    // HTML
    // =========================================

    container.innerHTML = `

        <div
            class="
                annual-fwd-wrapper
                annual-hils-wrapper
            "
        >


            <div
                class="annual-fwd-kpis"
            >


                <!-- =================================
                     OPO
                ================================== -->

                <div
                    class="annual-fwd-kpi"
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >
                        OPO
                    </div>


                    <div
                        class="
                            annual-fwd-kpi-row
                            annual-hils-five-metrics
                        "
                    >

                        <div>

                            <span>
                                HILs OPEN
                            </span>

                            <strong>
                                ${opo.open}
                            </strong>

                        </div>


                        <div>

                            <span>
                                OPEN RATE
                            </span>

                            <strong>
                                ${opo.openRate.toFixed(1)}%
                            </strong>

                        </div>


                        <div>

                            <span>
                                HILs CLOSED
                            </span>

                            <strong>
                                ${opo.closed}
                            </strong>

                        </div>


                        <div>

                            <span>
                                CLOSED RATE
                            </span>

                            <strong>
                                ${opo.closedRate.toFixed(1)}%
                            </strong>

                        </div>


                        <div
                            class="
                                annual-hils-ratio
                            "
                        >

                            <span>
                                CLOSED / OPEN
                            </span>

                            <strong>
                                ${opo.ratio.toFixed(2)}
                            </strong>

                        </div>

                    </div>

                </div>


                <!-- =================================
                     PORTUGAL
                ================================== -->

                <div
                    class="annual-fwd-kpi"
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >
                        PORTUGAL
                    </div>


                    <div
                        class="
                            annual-fwd-kpi-row
                            annual-hils-five-metrics
                        "
                    >

                        <div>

                            <span>
                                HILs OPEN
                            </span>

                            <strong>
                                ${portugal.open}
                            </strong>

                        </div>


                        <div>

                            <span>
                                OPEN RATE
                            </span>

                            <strong>
                                ${portugal.openRate.toFixed(1)}%
                            </strong>

                        </div>


                        <div>

                            <span>
                                HILs CLOSED
                            </span>

                            <strong>
                                ${portugal.closed}
                            </strong>

                        </div>


                        <div>

                            <span>
                                CLOSED RATE
                            </span>

                            <strong>
                                ${portugal.closedRate.toFixed(1)}%
                            </strong>

                        </div>


                        <div
                            class="
                                annual-hils-ratio
                            "
                        >

                            <span>
                                CLOSED / OPEN
                            </span>

                            <strong>
                                ${portugal.ratio.toFixed(2)}
                            </strong>

                        </div>

                    </div>


                    <div class="annual-esr-breakdown">

    <div class="annual-base-chip">
        <span>LIS</span>
        <strong>${portugal.lisOpen}</strong>
    </div>

    <div class="annual-base-chip">
        <span>FAO</span>
        <strong>${portugal.faoOpen}</strong>
    </div>

    <div class="annual-base-chip">
        <span>FNC</span>
        <strong>${portugal.fncOpen}</strong>
    </div>

</div>

                </div>


                <!-- =================================
                     SPMFB REGION
                ================================== -->

                <div
                    class="annual-fwd-kpi"
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >
                        SPMFB REGION
                    </div>


                    <div
                        class="
                            annual-fwd-kpi-row
                            annual-hils-region-metrics
                        "
                    >

                        <div>

                            <span>
                                HILs OPEN
                            </span>

                            <strong>
                                ${spmfb.open}
                            </strong>

                        </div>


                        <div>

                            <span>
                                HILs CLOSED
                            </span>

                            <strong>
                                ${spmfb.closed}
                            </strong>

                        </div>


                        <div
                            class="
                                annual-hils-ratio
                            "
                        >

                            <span>
                                CLOSED / OPEN
                            </span>

                            <strong>
                                ${spmfb.ratio.toFixed(2)}
                            </strong>

                        </div>

                    </div>

                </div>


                <!-- =================================
                     OPO PERFORMANCE
                ================================== -->

                <div
                    class="
                        annual-fwd-kpi
                        annual-fwd-comparison
                    "
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >
                        OPO PERFORMANCE
                    </div>


                    <div
                        class="annual-fwd-comparison-heading"
                    >
                        CLOSED / OPEN RATIO
                    </div>


                    <div
                        class="
                            annual-hils-comparison-values
                        "
                    >

                        <div>

                            <small>
                                OPO
                            </small>

                            <strong>
                                ${opo.ratio.toFixed(2)}
                            </strong>

                        </div>


                        <div>

                            <small>
                                Portugal
                            </small>

                            <strong>
                                ${portugal.ratio.toFixed(2)}
                            </strong>

                        </div>

                    </div>


                    <div
                        class="
                            annual-fwd-comparison-item
                            ${opoVsPortugal.className}
                        "
                    >

                        <span
                            class="comparison-indicator"
                        ></span>


                        <div>

                            <small>
                                OPO vs Portugal
                            </small>

                            <strong>
                                ${opoVsPortugal.text}
                            </strong>

                        </div>

                    </div>

                </div>


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

    const opoOpen =
        Number(annualWOData.opo.open || 0);

    const opoClosed =
        Number(annualWOData.opo.closed || 0);


    // =================================================
    // PORTUGAL
    // OPO IS ALREADY PART OF PORTUGAL
    // =================================================

    annualWOData.portugal.open =

        opoOpen +

        Number(
            annualWOData.portugal.lisOpen || 0
        ) +

        Number(
            annualWOData.portugal.faoOpen || 0
        ) +

        Number(
            annualWOData.portugal.fncOpen || 0
        );


    annualWOData.portugal.closed =

        opoClosed +

        Number(
            annualWOData.portugal.lisClosed || 0
        ) +

        Number(
            annualWOData.portugal.faoClosed || 0
        ) +

        Number(
            annualWOData.portugal.fncClosed || 0
        );


    const regionOpen =
        Number(
            annualWOData.spmfb.open || 0
        );

    const regionClosed =
        Number(
            annualWOData.spmfb.closed || 0
        );


    // =================================================
    // OPEN RATE
    // =================================================

    if(regionOpen > 0){

        annualWOData.opo.openRate =
            (
                opoOpen /
                regionOpen
            ) * 100;

        annualWOData.portugal.openRate =
            (
                annualWOData.portugal.open /
                regionOpen
            ) * 100;

    }
    else{

        annualWOData.opo.openRate = 0;
        annualWOData.portugal.openRate = 0;

    }


    // =================================================
    // CLOSED RATE
    // =================================================

    if(regionClosed > 0){

        annualWOData.opo.closedRate =
            (
                opoClosed /
                regionClosed
            ) * 100;

        annualWOData.portugal.closedRate =
            (
                annualWOData.portugal.closed /
                regionClosed
            ) * 100;

    }
    else{

        annualWOData.opo.closedRate = 0;
        annualWOData.portugal.closedRate = 0;

    }


    // =================================================
    // CLOSED / OPEN RATIO
    // =================================================

    annualWOData.opo.ratio =

        opoOpen > 0
            ? opoClosed / opoOpen
            : 0;


    annualWOData.portugal.ratio =

        annualWOData.portugal.open > 0
            ?
            annualWOData.portugal.closed /
            annualWOData.portugal.open
            : 0;


    annualWOData.spmfb.ratio =

        regionOpen > 0
            ?
            regionClosed /
            regionOpen
            : 0;


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
        document.getElementById(
            "annualWorkOrdersContent"
        );


    if(!container){

        console.warn(
            "ANNUAL WO — container not found."
        );

        return;

    }


    calculateAnnualWO();


    const opo =
        annualWOData.opo;

    const portugal =
        annualWOData.portugal;

    const spmfb =
        annualWOData.spmfb;


    // =================================================
    // COMPARISON
    // =================================================

    const opoVsPortugal =
        compareAnnualWORatio(
            opo.ratio,
            portugal.ratio
        );


    // =================================================
    // HTML
    // =================================================

    container.innerHTML = `

        <div
            class="
                annual-fwd-wrapper
                annual-wo-wrapper
            "
        >

            <div
                class="annual-fwd-kpis"
            >


                <!-- =================================
                     OPO
                ================================== -->

                <div
                    class="annual-fwd-kpi"
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >
                        OPO
                    </div>


                    <div
                        class="
                            annual-fwd-kpi-row
                            annual-wo-five-metrics
                        "
                    >

                        <div>

                            <span>
                                WO OPEN
                            </span>

                            <strong>
                                ${opo.open}
                            </strong>

                        </div>


                        <div>

                            <span>
                                OPEN RATE
                            </span>

                            <strong>
                                ${opo.openRate.toFixed(1)}%
                            </strong>

                        </div>


                        <div>

                            <span>
                                WO CLOSED
                            </span>

                            <strong>
                                ${opo.closed}
                            </strong>

                        </div>


                        <div>

                            <span>
                                CLOSED RATE
                            </span>

                            <strong>
                                ${opo.closedRate.toFixed(1)}%
                            </strong>

                        </div>


                        <div
                            class="annual-wo-ratio"
                        >

                            <span>
                                CLOSED / OPEN
                            </span>

                            <strong>
                                ${opo.ratio.toFixed(2)}
                            </strong>

                        </div>

                    </div>

                </div>


                <!-- =================================
                     PORTUGAL
                ================================== -->

                <div
                    class="annual-fwd-kpi"
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >
                        PORTUGAL
                    </div>


                    <div
                        class="
                            annual-fwd-kpi-row
                            annual-wo-five-metrics
                        "
                    >

                        <div>

                            <span>
                                WO OPEN
                            </span>

                            <strong>
                                ${portugal.open}
                            </strong>

                        </div>


                        <div>

                            <span>
                                OPEN RATE
                            </span>

                            <strong>
                                ${portugal.openRate.toFixed(1)}%
                            </strong>

                        </div>


                        <div>

                            <span>
                                WO CLOSED
                            </span>

                            <strong>
                                ${portugal.closed}
                            </strong>

                        </div>


                        <div>

                            <span>
                                CLOSED RATE
                            </span>

                            <strong>
                                ${portugal.closedRate.toFixed(1)}%
                            </strong>

                        </div>


                        <div
                            class="annual-wo-ratio"
                        >

                            <span>
                                CLOSED / OPEN
                            </span>

                            <strong>
                                ${portugal.ratio.toFixed(2)}
                            </strong>

                        </div>

                    </div>


                    <div class="annual-esr-breakdown">

    <div class="annual-base-chip">
        <span>LIS</span>
        <strong>${portugal.lisOpen}</strong>
    </div>

    <div class="annual-base-chip">
        <span>FAO</span>
        <strong>${portugal.faoOpen}</strong>
    </div>

    <div class="annual-base-chip">
        <span>FNC</span>
        <strong>${portugal.fncOpen}</strong>
    </div>

</div>

                </div>


                <!-- =================================
                     SPMFB REGION
                ================================== -->

                <div
                    class="annual-fwd-kpi"
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >
                        SPMFB REGION
                    </div>


                    <div
                        class="
                            annual-fwd-kpi-row
                            annual-wo-region-metrics
                        "
                    >

                        <div>

                            <span>
                                WO OPEN
                            </span>

                            <strong>
                                ${spmfb.open}
                            </strong>

                        </div>


                        <div>

                            <span>
                                WO CLOSED
                            </span>

                            <strong>
                                ${spmfb.closed}
                            </strong>

                        </div>


                        <div
                            class="annual-wo-ratio"
                        >

                            <span>
                                CLOSED / OPEN
                            </span>

                            <strong>
                                ${spmfb.ratio.toFixed(2)}
                            </strong>

                        </div>

                    </div>

                </div>


                <!-- =================================
                     OPO PERFORMANCE
                ================================== -->

                <div
                    class="
                        annual-fwd-kpi
                        annual-fwd-comparison
                    "
                >

                    <div
                        class="annual-fwd-kpi-title"
                    >
                        OPO PERFORMANCE
                    </div>


                    <div
                        class="annual-fwd-comparison-heading"
                    >
                        CLOSED / OPEN RATIO
                    </div>


                    <div
                        class="
                            annual-wo-comparison-values
                        "
                    >

                        <div>

                            <small>
                                OPO
                            </small>

                            <strong>
                                ${opo.ratio.toFixed(2)}
                            </strong>

                        </div>


                        <div>

                            <small>
                                PORTUGAL
                            </small>

                            <strong>
                                ${portugal.ratio.toFixed(2)}
                            </strong>

                        </div>

                    </div>


                    <div
                        class="
                            annual-fwd-comparison-item
                            ${opoVsPortugal.className}
                        "
                    >

                        <span
                            class="comparison-indicator"
                        ></span>


                        <div>

                            <small>
                                OPO vs Portugal
                            </small>

                            <strong>
                                ${opoVsPortugal.text}
                            </strong>

                        </div>

                    </div>

                </div>


            </div>

        </div>

    `;

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
