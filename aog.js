// =========================================================
// RYANAIR ENGINEERING DASHBOARD
// AIRCRAFT ON GROUND — AOG
// INITIAL STRUCTURE
// =========================================================


// =========================================================
// STATE
// =========================================================

let AOG_INITIALISED =
    false;


// =========================================================
// OPEN AOG
// =========================================================

async function openAOG(){

    // ==========================================
    // REPORT VISIBILITY
    // ==========================================

    if(
        typeof canOpenReport ===
        "function"
    ){

        if(
            !canOpenReport(
                "AOG",
                "Aircraft on Ground"
            )
        ){

            return;

        }

    }


    // ==========================================
    // HOME → DASHBOARD
    // ==========================================

    const homeScreen =
        document.getElementById(
            "homeScreen"
        );


    const dashboardContainer =
        document.getElementById(
            "dashboardContainer"
        );


    if(homeScreen){

        homeScreen.style.display =
            "none";

    }


    if(dashboardContainer){

        dashboardContainer.style.display =
            "block";

    }


    // ==========================================
    // HIDE OTHER REPORTS
    // ==========================================

    if(
        typeof hideNoInfo ===
        "function"
    ){

        hideNoInfo();

    }


    if(
        typeof hideFWD ===
        "function"
    ){

        hideFWD();

    }


    if(
        typeof hideACheck ===
        "function"
    ){

        hideACheck();

    }


    if(
        typeof hideAnnualReport ===
        "function"
    ){

        hideAnnualReport();

    }


    if(
        typeof hideFileStore ===
        "function"
    ){

        hideFileStore();

    }


    // ==========================================
    // SHOW AOG
    // ==========================================

    showAOG();


    // ==========================================
    // GLOBAL FOOTER
    // ==========================================

    if(
        typeof showGlobalFooter ===
        "function"
    ){

        showGlobalFooter();

    }


    // ==========================================
    // INITIALISE
    // ==========================================

    initializeAOG();

}


// =========================================================
// SHOW AOG
// =========================================================

function showAOG(){

    const container =
        document.getElementById(
            "aogDashboard"
        );


    if(!container){

        console.warn(
            "AOG — Dashboard container not found."
        );

        return;

    }


    container.style.display =
        "block";

}


// =========================================================
// HIDE AOG
// =========================================================

function hideAOG(){

    const container =
        document.getElementById(
            "aogDashboard"
        );


    if(!container){

        return;

    }


    container.style.display =
        "none";

}


// =========================================================
// CLOSE AOG
// =========================================================

function closeAOG(){

    // ==========================================
    // HIDE AOG
    // ==========================================

    hideAOG();


    // ==========================================
    // HIDE GLOBAL FOOTER
    // ==========================================

    if(
        typeof hideGlobalFooter ===
        "function"
    ){

        hideGlobalFooter();

    }


    // ==========================================
    // CLOSE DASHBOARD
    // ==========================================

    const dashboardContainer =
        document.getElementById(
            "dashboardContainer"
        );


    if(dashboardContainer){

        dashboardContainer.style.display =
            "none";

    }


    // ==========================================
    // RETURN HOME
    // ==========================================

    const homeScreen =
        document.getElementById(
            "homeScreen"
        );


    if(homeScreen){

        homeScreen.style.display =
            "block";

    }

}


// =========================================================
// INITIALISE AOG
// =========================================================
//
// Empty for now.
//
// This function exists so the AOG section already
// has its own lifecycle and can later receive:
//
// - Firebase loading
// - period selection
// - Excel/PDF import
// - calculations
// - charts
// - tables
// - PDF generation
// - manual editing
//
// =========================================================

function initializeAOG(){

initializeAOGDashboard();

    AOG_INITIALISED =
        true;


    // ------------------------------------------
    // Future AOG logic goes here.
    // ------------------------------------------

}


// =========================================================
// AOG — EXPORT PDF
// =========================================================

function exportAOGPDF(){

    showAOGDevelopmentMessage(
        "Export PDF"
    );

}


// =========================================================
// AOG — IMPORT DATA
// =========================================================

// =========================================================
// AOG — IMPORT DATA
// =========================================================

function openAOGImport(){

    if(
        typeof isAOGAdministrator ===
        "function" &&
        !isAOGAdministrator()
    ){

        return requireAOGAdministrator(
            openAOGImport
        );

    }


    closeAllAOGManagementModals();


    const existing =
        document.getElementById(
            "aogExcelImportModal"
        );


    if(existing){

        existing.remove();

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "aogExcelImportModal";


    modal.className =
        "aog-management-overlay";


    modal.innerHTML = `

        <div
            class="aog-management-modal"
            style="
                max-width:620px;
                width:calc(100% - 32px);
            "
        >

            <!-- HEADER -->

            <div
                class="aog-management-header"
            >

                <div
                    class="aog-management-header-left"
                >

                    <div
                        class="aog-management-heading"
                    >

                        <div
                            class="aog-management-eyebrow"
                        >
                            AIRCRAFT ON GROUND
                        </div>

                        <h2
                            class="aog-management-title"
                        >
                            Import AOG Data
                        </h2>

                        <div
                            class="aog-management-subtitle"
                        >
                            Import multiple AOG records from Excel
                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    class="aog-management-close"
                    onclick="
                        closeAOGExcelImport()
                    "
                >
                    ×
                </button>

            </div>


            <!-- BODY -->

            <div
                class="aog-management-body"
            >

                <div
                    class="aog-excel-import-zone"
                >

                    <div
                        class="aog-excel-import-icon"
                    >
                        ↑
                    </div>


                    <div
                        class="aog-excel-import-title"
                    >
                        Upload AOG Excel File
                    </div>


                    <div
                        class="aog-excel-import-description"
                    >
                        Select an Excel file containing
                        Aircraft on Ground records.
                    </div>


                    <label
                        class="aog-excel-import-upload"
                        for="aogExcelImportInput"
                    >

                        SELECT EXCEL FILE

                    </label>


                    <input
                        id="aogExcelImportInput"
                        type="file"
                        accept=".xlsx,.xls"
                        style="display:none;"
                        onchange="
                            handleAOGExcelImport(
                                event
                            )
                        "
                    />


                    <div
                        id="aogExcelImportFileName"
                        class="aog-excel-import-file"
                    >
                        No file selected
                    </div>

                </div>


                <!-- STATUS -->

                <div
                    id="aogExcelImportStatus"
                    style="
                        display:none;
                    "
                ></div>


                <!-- ACTIONS -->

                <div
                    id="aogExcelImportActions"
                    style="
                        display:none;
                        margin-top:22px;
                        justify-content:flex-end;
                        gap:12px;
                        flex-wrap:wrap;
                    "
                >

                    <button
                        type="button"
                        class="
                            aog-management-button
                            aog-management-button-grey
                        "
                        onclick="
                            cancelAOGExcelImport()
                        "
                    >
                        CANCEL
                    </button>


                    <button
                        type="button"
                        class="
                            aog-management-button
                            aog-management-button-blue
                        "
                        id="aogConfirmExcelImportButton"
                        onclick="
                            confirmAOGExcelImport()
                        "
                    >
                        CONFIRM IMPORT
                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    modal.addEventListener(
        "click",
        function(event){

            if(
                event.target ===
                modal
            ){

                closeAOGExcelImport();

            }

        }
    );

}


// =========================================================
// AOG — EDIT VISUALS
// =========================================================

function openAOGEditVisuals(){

    openAOGManagementCenter();

}


// =========================================================
// AOG — RESET DATA
// =========================================================

function resetAOGData(){

    /*
        RESET DATA IS ADMIN ONLY
    */

    if(
        !isAOGAdministrator()
    ){

        return requireAOGAdministrator(
            resetAOGData
        );

    }


    // =====================================================
    // GET CURRENT ANALYSIS PERIOD
    // =====================================================

    const periodSelect =
        document.getElementById(
            "aogDashboardPeriod"
        );


    const period =
        periodSelect?.value ||
        getAOGAnalysisPeriodKey(
            CURRENT_AOG_ANALYSIS_YEAR,
            CURRENT_AOG_ANALYSIS_MONTH
        );


    const periodLabel =
        periodSelect
            ?.selectedOptions?.[0]
            ?.textContent
            ?.trim()
        ||

        period

        ||

        "the selected period";


    if(
        !/^\d{4}-\d{2}$/.test(
            period
        )
    ){

        if(
            typeof showWarning ===
            "function"
        ){

            showWarning(
                "No Period Selected",
                "Please select a valid AOG reporting period first."
            );

        }

        else{

            aogShowError(
                "AOG Reset",
                "Please select a valid AOG reporting period first."
            );

        }

        return;

    }


    // =====================================================
    // FIRST CONFIRMATION
    // =====================================================

    showConfirmation(

        "Reset AOG Data",

        `You are about to permanently delete all Aircraft on Ground data for ${periodLabel}. This action cannot be undone.`,

        async ()=>{

            // =============================================
            // SECOND CONFIRMATION
            // =============================================

            showConfirmation(

                "Confirm Permanent Deletion",

                `Are you absolutely sure you want to delete ${periodLabel}? All AOG records for this period will be permanently removed.`,

                async ()=>{

                    await performAOGDataReset(
                        period,
                        periodLabel
                    );

                },

                "Delete Data"

            );

        },

        "Continue"

    );

}

// =========================================================
// PERFORM AOG DATA RESET
// =========================================================

async function performAOGDataReset(
    period,
    periodLabel
){

    try{

        // =================================================
        // LOADING
        // =================================================

        if(
            typeof showLoading ===
            "function"
        ){

            showLoading();

        }


        if(
            typeof updateLoading ===
            "function"
        ){

            updateLoading(
                "Resetting AOG Data...",
                20,
                `Deleting ${periodLabel}...`
            );

        }


        // =================================================
        // FIREBASE PATH
        // =================================================
        //
        // IMPORTANT:
        //
        // dashboardData/AOG
        //      └── YYYY-MM
        //          └── records
        //
        // We delete ONLY the selected month.
        //
        // Categories/config are untouched.
        // =================================================

        const aogPeriodPath =
            `${AOG_RECORDS_ROOT}/${period}`;


        await aogFirebaseRemove(
            aogPeriodPath
        );


        // =================================================
        // VERIFY DELETION
        // =================================================

        if(
            typeof updateLoading ===
            "function"
        ){

            updateLoading(
                "Resetting AOG Data...",
                45,
                "Verifying Firebase deletion..."
            );

        }


        const verification =
            await aogFirebaseGet(
                aogPeriodPath
            );


        if(
            verification &&
            typeof verification.exists ===
            "function" &&
            verification.exists()
        ){

            throw new Error(
                "Firebase deletion verification failed."
            );

        }


        // =================================================
        // RELOAD ALL AOG RECORDS
        // =================================================

        if(
            typeof updateLoading ===
            "function"
        ){

            updateLoading(
                "Resetting AOG Data...",
                60,
                "Reloading AOG records..."
            );

        }


        await loadAOGManagementRecords();


        // =================================================
        // RESET CURRENT PERIOD IF IT WAS DELETED
        // =================================================

        const availablePeriods =
            getAOGDashboardAvailablePeriods();


        const selector =
            document.getElementById(
                "aogDashboardPeriod"
            );


        /*
            -------------------------------------------------
            THERE ARE STILL PERIODS AVAILABLE
            -------------------------------------------------
        */

        if(
            availablePeriods.length
        ){

            /*
                Latest available period.
            */

            const selectedPeriod =
                availablePeriods[0];


            const [
                selectedYear,
                selectedMonth
            ] =
                selectedPeriod
                    .split("-")
                    .map(
                        Number
                    );


            CURRENT_AOG_ANALYSIS_YEAR =
                selectedYear;


            CURRENT_AOG_ANALYSIS_MONTH =
                selectedMonth;


            /*
                Rebuild selector.
            */

            populateAOGDashboardPeriods();


            if(
                selector
            ){

                selector.value =
                    selectedPeriod;

            }


        }


        /*
            -------------------------------------------------
            NO PERIODS LEFT
            -------------------------------------------------
        */

        else{

            /*
                Keep current month as an empty
                reporting period.
            */

            const today =
                new Date();


            CURRENT_AOG_ANALYSIS_YEAR =
                today.getFullYear();


            CURRENT_AOG_ANALYSIS_MONTH =
                today.getMonth() + 1;


            populateAOGDashboardPeriods();


            if(
                selector
            ){

                selector.value =
                    getAOGAnalysisPeriodKey(

                        CURRENT_AOG_ANALYSIS_YEAR,

                        CURRENT_AOG_ANALYSIS_MONTH

                    );

            }

        }


        // =================================================
        // REFRESH DASHBOARD
        // =================================================

        if(
            typeof updateLoading ===
            "function"
        ){

            updateLoading(
                "Refreshing Dashboard...",
                75,
                "Recalculating AOG analysis..."
            );

        }


        /*
            IMPORTANT:
            refreshAOGPortugalOverview()
            already reloads Firebase and updates
            the KPI layer.
        */

        if(
            typeof refreshAOGPortugalOverview ===
            "function"
        ){

            await refreshAOGPortugalOverview();

        }


        if(
            typeof refreshAOGDistributionAnalysis ===
            "function"
        ){

            await refreshAOGDistributionAnalysis();

        }


        if(
            typeof refreshAOGSection3 ===
            "function"
        ){

            await refreshAOGSection3();

        }


        /*
            Refresh Trend Analysis.
        */

        if(
            typeof AOG_TREND_STATE !==
            "undefined"
        ){

            AOG_TREND_STATE.rawData =
                null;

            AOG_TREND_STATE.periods =
                [];

        }


        if(
            typeof initializeAOGTrendAnalysis ===
            "function"
        ){

            await initializeAOGTrendAnalysis();

        }


        // =================================================
        // FINAL UI REPAINT
        // =================================================

        window.dispatchEvent(
            new Event(
                "resize"
            )
        );


        // =================================================
        // COMPLETE
        // =================================================

        if(
            typeof updateLoading ===
            "function"
        ){

            updateLoading(
                "Reset Complete",
                100,
                "AOG data successfully deleted."
            );

        }


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    400
                )
        );


        if(
            typeof hideLoading ===
            "function"
        ){

            hideLoading();

        }


        // =================================================
        // SUCCESS
        // =================================================

        if(
            typeof showSuccess ===
            "function"
        ){

            showSuccess(

                "AOG Data Reset",

                `${periodLabel} has been successfully deleted.`

            );

        }

        else{

            aogShowSuccess(

                "AOG Data Reset",

                `${periodLabel} has been successfully deleted.`

            );

        }

    }

    catch(error){

        console.error(
            "AOG RESET ERROR:",
            error
        );


        if(
            typeof hideLoading ===
            "function"
        ){

            hideLoading();

        }


        if(
            typeof showError ===
            "function"
        ){

            showError(

                "Reset Failed",

                "Unable to delete the selected AOG data."

            );

        }

        else{

            aogShowError(

                "Reset Failed",

                "Unable to delete the selected AOG data."

            );

        }

    }

}


// =========================================================
// AOG — DEVELOPMENT MESSAGE
// =========================================================
//
// Temporary only.
// Prevents the header buttons from producing
// JavaScript errors while the content is being built.
//
// =========================================================

function showAOGDevelopmentMessage(
    action
){

    if(
        typeof showNotification ===
        "function"
    ){

        showNotification(

            "Aircraft on Ground",

            `${action} functionality will be added when the AOG report content is developed.`,

            "info"

        );

        return;

    }


    console.log(
        `AOG — ${action} not implemented yet.`
    );

}

/* =========================================================
   ENGINEERING DASHBOARD
   AIRCRAFT ON GROUND - AOG MANAGEMENT
   COMPLETE MANAGEMENT SYSTEM
========================================================= */


/* =========================================================
   GLOBAL STATE
========================================================= */

let AOG_MANAGEMENT_RECORDS = [];

let AOG_MANAGEMENT_FILTERED_RECORDS = [];

let AOG_MANAGEMENT_CATEGORIES = [];

let AOG_MANAGEMENT_SEARCH_TYPE = null;

let AOG_MANAGEMENT_SEARCH_VALUE = "";

let AOG_MANAGEMENT_SELECTED_RECORD = null;

let AOG_MANAGEMENT_CURRENT_SCREEN = "CENTER";


/* =========================================================
   FIREBASE PATHS
========================================================= */

const AOG_RECORDS_ROOT =
    "dashboardData/AOG";

const AOG_CATEGORIES_PATH =
    "dashboardData/AOG/config/categories";


/* =========================================================
   PORTUGUESE BASES
========================================================= */

const AOG_PORTUGAL_BASES = [
    "OPO",
    "LIS",
    "FAO",
    "FNC"
];


/* =========================================================
   DEFAULT CATEGORIES
========================================================= */

const AOG_DEFAULT_CATEGORIES = [

    "PARTS",

    "T/S + REPAIRS",

    "REPAIR / REPLACEMENT IN WORK",

    "TROUBLESHOOTING / ASSESSMENT",

    "MANPOWER",

    "TOOLING",

    "AIRPORT CURFEW",

    "BOECOM",

    "OTHER"

];


/* =========================================================
   PUBLIC ENTRY
========================================================= */

function openAOGEditVisuals() {

    openAOGManagementCenter();

}


/* =========================================================
   OPEN MANAGEMENT CENTER
========================================================= */

async function openAOGManagementCenter() {

    AOG_MANAGEMENT_CURRENT_SCREEN =
        "CENTER";

    AOG_MANAGEMENT_SELECTED_RECORD =
        null;

    closeAllAOGManagementModals();

    document.body.style.overflow = "hidden";

    await loadAOGCategories();

    renderAOGManagementCenter();

}


/* =========================================================
   MANAGEMENT CENTER
========================================================= */

function renderAOGManagementCenter() {

    closeAllAOGManagementModals();

    AOG_MANAGEMENT_CURRENT_SCREEN =
        "CENTER";


    const modal =
        document.createElement("div");

    modal.id =
        "aogManagementCenter";

    modal.className =
        "aog-management-overlay";


    modal.innerHTML = `

        <div
            class="aog-management-modal"
            role="dialog"
            aria-modal="true"
        >

            <!-- HEADER -->

            <div
                class="aog-management-header"
            >

                <div
                    class="aog-management-header-left"
                >

                    <div
                        class="aog-management-heading"
                    >

                        <div
                            class="aog-management-eyebrow"
                        >
                            AIRCRAFT ON GROUND
                        </div>

                        <h2
                            class="aog-management-title"
                        >
                            Management Center
                        </h2>

                        <div
                            class="aog-management-subtitle"
                        >
                            Manage and review AOG records
                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    class="aog-management-close"
                    onclick="
                        closeAOGManagementCenter()
                    "
                    aria-label="Close"
                >
                    ×
                </button>

            </div>


            <!-- BODY -->

            <div
                class="aog-management-body"
            >

                <div
                    class="aog-management-options"
                >

                    <!-- ADD -->

                    <button
                        type="button"
                        class="aog-management-option"
                        onclick="
                            openAOGAddRecord()
                        "
                    >

                        <div
                            class="aog-management-option-icon"
                        >
                            +
                        </div>

                        <div
                            class="aog-management-option-title"
                        >
                            ADD AOG
                        </div>

                        <div
                            class="aog-management-option-text"
                        >
                            Create a new Aircraft on Ground
                            record manually.
                            <br><br>
                            Administrator access required.
                        </div>

                    </button>


                    <!-- VIEW -->

                    <button
                        type="button"
                        class="aog-management-option"
                        onclick="
                            openAOGRecordSearch()
                        "
                    >

                        <div
                            class="aog-management-option-icon"
                        >
                            ≡
                        </div>

                        <div
                            class="aog-management-option-title"
                        >
                            VIEW AOG RECORDS
                        </div>

                        <div
                            class="aog-management-option-text"
                        >
                            Search, review and manage
                            registered AOG records.
                        </div>

                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    modal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === modal
            ) {

                closeAOGManagementCenter();

            }

        }
    );

}


/* =========================================================
   CLOSE EVERYTHING
========================================================= */

function closeAllAOGManagementModals() {

    document
        .querySelectorAll(
            ".aog-management-overlay"
        )
        .forEach(
            modal => {

                try {

                    modal.remove();

                } catch (error) {

                    console.warn(
                        "AOG modal removal error:",
                        error
                    );

                }

            }
        );

}


/* =========================================================
   CLOSE MANAGEMENT
========================================================= */

function closeAOGManagementCenter() {

    closeAllAOGManagementModals();

    AOG_MANAGEMENT_CURRENT_SCREEN =
        "CENTER";

    AOG_MANAGEMENT_SELECTED_RECORD =
        null;

    document.body.style.overflow = "";

}


/* =========================================================
   CATEGORY LOADING
========================================================= */

async function loadAOGCategories() {

    try {

        if (
            typeof database ===
            "undefined"
        ) {

            throw new Error(
                "Firebase database is not available."
            );

        }


        const snapshot =
            await aogFirebaseGet(
                AOG_CATEGORIES_PATH
            );


        if (
            snapshot &&
            typeof snapshot.exists ===
            "function" &&
            snapshot.exists()
        ) {

            const data =
                snapshot.val();


            if (
                Array.isArray(data)
            ) {

                AOG_MANAGEMENT_CATEGORIES =
                    data;

            }

            else if (
                data &&
                typeof data === "object"
            ) {

                AOG_MANAGEMENT_CATEGORIES =
                    Object
                        .values(data)
                        .map(
                            item => {

                                if (
                                    typeof item ===
                                    "string"
                                ) {

                                    return item;

                                }

                                return (
                                    item?.name ||
                                    ""
                                );

                            }
                        );

            }

        }

    }

    catch (error) {

        console.warn(
            "AOG category loading:",
            error
        );

    }


    if (
        !Array.isArray(
            AOG_MANAGEMENT_CATEGORIES
        ) ||
        !AOG_MANAGEMENT_CATEGORIES.length
    ) {

        AOG_MANAGEMENT_CATEGORIES =
            [
                ...AOG_DEFAULT_CATEGORIES
            ];

    }


    AOG_MANAGEMENT_CATEGORIES =
        [
            ...new Set(

                AOG_MANAGEMENT_CATEGORIES

                    .map(
                        category =>
                            String(
                                category
                            ).trim()
                    )

                    .filter(
                        Boolean
                    )

            )
        ]

        .sort(
            (a, b) =>
                a.localeCompare(
                    b
                )
        );

}


/* =========================================================
   CATEGORY OPTIONS
========================================================= */

function getAOGCategoryOptions(
    selected = ""
) {

    const categories =
        Array.isArray(
            AOG_MANAGEMENT_CATEGORIES
        )
            ? AOG_MANAGEMENT_CATEGORIES
            : AOG_DEFAULT_CATEGORIES;


    return `

        <option value="">
            Select Category
        </option>

        ${
            categories
                .map(
                    category => `

                        <option
                            value="${escapeAOGHtml(category)}"
                            ${
                                String(
                                    category
                                ) ===
                                String(
                                    selected
                                )
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${escapeAOGHtml(
                                category
                            )}
                        </option>

                    `
                )
                .join("")
        }

    `;

}


/* =========================================================
   ADMIN ACCESS
========================================================= */

function isAOGAdministrator() {

    try {

        if (
            typeof authSystem !==
            "undefined" &&
            typeof authSystem.isAdmin ===
            "function"
        ) {

            return Boolean(
                authSystem.isAdmin()
            );

        }

    }

    catch (error) {

        console.warn(
            "AOG authSystem check:",
            error
        );

    }


    try {

        if (
            typeof CURRENT_USER !==
            "undefined" &&
            CURRENT_USER
        ) {

            return (
                CURRENT_USER.profile?.role ===
                "admin"
            );

        }

    }

    catch (error) {

        console.warn(
            "AOG CURRENT_USER check:",
            error
        );

    }


    return false;

}


/* =========================================================
   ADMIN REQUIRE
========================================================= */

function requireAOGAdministrator(
    callback
) {

    if (
        typeof requireAdministrator ===
        "function"
    ) {

        return requireAdministrator(
            callback
        );

    }


    if (
        isAOGAdministrator()
    ) {

        if (
            typeof callback ===
            "function"
        ) {

            callback();

        }

        return true;

    }


    aogShowError(
        "Administrator Access",
        "Administrator privileges are required for this action."
    );

    return false;

}


/* =========================================================
   ADD AOG
========================================================= */

function openAOGAddRecord() {

    requireAOGAdministrator(
        function() {

            createAOGAddModal();

        }
    );

}


/* =========================================================
   ADD MODAL
========================================================= */

function createAOGAddModal() {

    /*
        IMPORTANT:
        The previous modal is completely removed.
        BACK explicitly returns to the CENTER.
    */

    closeAllAOGManagementModals();

    AOG_MANAGEMENT_CURRENT_SCREEN =
        "ADD";


    const modal =
        document.createElement("div");

    modal.id =
        "aogAddRecordModal";

    modal.className =
        "aog-management-overlay";


    modal.innerHTML = `

        <div
            class="aog-management-modal"
            style="max-width:900px;"
        >

            <!-- HEADER -->

            <div
                class="aog-management-header"
            >

                <div
                    class="aog-management-header-left"
                >

                    <button
                        type="button"
                        class="aog-management-back"
                        onclick="
                            requestCloseAOGAddModal()
                        "
                        title="Back to AOG Management Center"
                    >

                        <span
                            class="aog-management-back-arrow"
                        >
                            ←
                        </span>

                        <span
                            class="aog-management-back-text"
                        >
                            BACK
                        </span>

                    </button>


                    <div
                        class="aog-management-heading"
                    >

                        <div
                            class="aog-management-eyebrow"
                        >
                            AIRCRAFT ON GROUND
                        </div>

                        <h2
                            class="aog-management-title"
                        >
                            Add AOG Record
                        </h2>

                        <div
                            class="aog-management-subtitle"
                        >
                            Create a new AOG record
                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    class="aog-management-close"
                    onclick="
                        requestCloseAOGAddModal()
                    "
                    aria-label="Close"
                >
                    ×
                </button>

            </div>


            <!-- BODY -->

            <div
                class="aog-management-body"
            >

                <div
                    class="aog-detail-grid"
                >

                    ${aogEditField(
                        "Registration",
                        "aogAddReg",
                        ""
                    )}


                    ${aogEditField(
                        "Aircraft Type",
                        "aogAddType",
                        ""
                    )}


                    <div
                        class="aog-management-field"
                    >

                        <label>
                            Base
                        </label>

                        <select
                            id="aogAddBase"
                        >

                            <option value="">
                                Select Base
                            </option>

                            ${
                                AOG_PORTUGAL_BASES
                                    .map(
                                        base => `
                                            <option
                                                value="${base}"
                                            >
                                                ${base}
                                            </option>
                                        `
                                    )
                                    .join("")
                            }

                        </select>

                    </div>


                    <div
                        class="aog-management-field"
                    >

                        <label>
                            Category
                        </label>

                        <select
                            id="aogAddCategory"
                        >

                            ${getAOGCategoryOptions()}

                        </select>

                    </div>


                    ${aogEditField(
                        "Start Date",
                        "aogAddStartDate",
                        "",
                        "date"
                    )}


                    ${aogEditField(
                        "Start Time",
                        "aogAddStartTime",
                        "",
                        "time"
                    )}


                    ${aogEditField(
                        "Finish Date",
                        "aogAddFinishDate",
                        "",
                        "date"
                    )}


                    ${aogEditField(
                        "Expected Finish",
                        "aogAddExpectedTime",
                        "",
                        "time"
                    )}


                    ${aogEditField(
                        "Actual Finish",
                        "aogAddActualTime",
                        "",
                        "time"
                    )}


                    <div
                        class="aog-management-field"
                    >

                        <label>
                            AOG Time
                        </label>

                        <input
                            id="aogAddDuration"
                            type="text"
                            value="Calculated automatically"
                            disabled
                        >

                    </div>


                    ${aogEditTextarea(
                        "Defect",
                        "aogAddDefect",
                        ""
                    )}


                    ${aogEditTextarea(
                        "Action",
                        "aogAddAction",
                        ""
                    )}


                    ${aogEditTextarea(
                        "Comments",
                        "aogAddComments",
                        ""
                    )}

                </div>

            </div>


            <!-- FOOTER -->

            <div
                class="aog-management-footer"
            >

                <button
                    type="button"
                    class="
                        aog-management-button
                        aog-management-button-white
                    "
                    onclick="
                        requestCloseAOGAddModal()
                    "
                >
                    CANCEL
                </button>


                <button
                    type="button"
                    class="
                        aog-management-button
                        aog-management-button-green
                    "
                    onclick="
                        saveNewAOGRecord()
                    "
                >
                    SAVE AOG
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    [
        "aogAddStartDate",
        "aogAddStartTime",
        "aogAddFinishDate",
        "aogAddActualTime"
    ]
    .forEach(
        id => {

            const field =
                document.getElementById(
                    id
                );


            if (field) {

                field.addEventListener(
                    "input",
                    updateAOGAddDuration
                );

            }

        }
    );

}


/* =========================================================
   ADD BACK / CLOSE
========================================================= */

function requestCloseAOGAddModal() {

    const hasData =
        hasAOGFormData(
            "aogAdd"
        );


    if (!hasData) {

        return returnToAOGManagementCenter();

    }


    openAOGCloseConfirmation(
        "add"
    );

}


/* =========================================================
   RETURN TO CENTER
========================================================= */

function returnToAOGManagementCenter() {

    closeAllAOGManagementModals();

    AOG_MANAGEMENT_CURRENT_SCREEN =
        "CENTER";

    openAOGManagementCenter();

}


/* =========================================================
   CONFIRM CLOSE
========================================================= */

function openAOGCloseConfirmation(
    mode
) {

    closeAOGConfirmationModal();


    const title =
        mode === "add"
            ? "Close AOG Addition"
            : "Close AOG Editing";


    const message =
        mode === "add"

            ? "Are you sure you want to close this AOG addition? Any information entered will be lost."

            : "Are you sure you want to close this AOG editing session? Any unsaved changes will be lost.";


    const modal =
        document.createElement("div");


    modal.id =
        "aogCloseConfirmationModal";


    modal.className =
        "aog-management-overlay";


    modal.style.zIndex =
        "1000005";


    modal.innerHTML = `

        <div
            class="aog-management-modal"
            style="max-width:500px;"
        >

            <div
                class="aog-management-header"
            >

                <div
                    class="aog-management-heading"
                >

                    <div
                        class="aog-management-eyebrow"
                    >
                        CONFIRMATION
                    </div>

                    <h2
                        class="aog-management-title"
                    >
                        ${escapeAOGHtml(
                            title
                        )}
                    </h2>

                </div>


                <button
                    type="button"
                    class="aog-management-close"
                    onclick="
                        closeAOGConfirmationModal()
                    "
                >
                    ×
                </button>

            </div>


            <div
                class="aog-management-body"
            >

                <div
                    style="
                        color:#526174;
                        font-size:13px;
                        line-height:1.65;
                    "
                >

                    ${escapeAOGHtml(
                        message
                    )}

                </div>

            </div>


            <div
                class="aog-management-footer"
            >

                <button
                    type="button"
                    class="
                        aog-management-button
                        aog-management-button-white
                    "
                    onclick="
                        closeAOGConfirmationModal()
                    "
                >
                    CANCEL
                </button>


                <button
                    type="button"
                    class="
                        aog-management-button
                        aog-management-button-red
                    "
                    onclick="
                        resolveAOGClose('${mode}')
                    "
                >
                    RESOLVE
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );

}


/* =========================================================
   RESOLVE CLOSE
========================================================= */

function resolveAOGClose(
    mode
) {

    closeAOGConfirmationModal();


    if (
        mode === "add"
    ) {

        returnToAOGManagementCenter();

        return;

    }


    if (
        mode === "edit"
    ) {

        openAOGRecordDetails(
            AOG_MANAGEMENT_SELECTED_RECORD?.id
        );

    }

}


/* =========================================================
   CLOSE CONFIRMATION
========================================================= */

function closeAOGConfirmationModal() {

    const modal =
        document.getElementById(
            "aogCloseConfirmationModal"
        );


    if (modal) {

        modal.remove();

    }

}


/* =========================================================
   ADD DURATION
========================================================= */

function updateAOGAddDuration() {

    const duration =
        calculateAOGDurationFromFields(
            "aogAddStartDate",
            "aogAddStartTime",
            "aogAddFinishDate",
            "aogAddActualTime"
        );


    const field =
        document.getElementById(
            "aogAddDuration"
        );


    if (!field) {
        return;
    }


    field.value =
        duration !== null

            ? formatAOGDuration(
                duration
            )

            : "Calculated automatically";

}


/* =========================================================
   SAVE NEW AOG
========================================================= */

async function saveNewAOGRecord() {

    if (
        !isAOGAdministrator()
    ) {

        return requireAOGAdministrator(
            saveNewAOGRecord
        );

    }


    const record =
        collectAOGFormValues(
            "aogAdd"
        );


    const validation =
        validateAOGRecord(
            record
        );


    if (
        !validation.valid
    ) {

        aogShowError(
            "AOG Record",
            validation.message
        );

        return;

    }


    const durationMinutes =
        calculateAOGRecordDuration(
            record
        );


    if (
        durationMinutes === null
    ) {

        aogShowError(
            "AOG Record",
            "Unable to calculate the AOG duration."
        );

        return;

    }


    const id =
        createAOGRecordId();


    const period =
        getAOGMonthKey(
            record.startDate
        );


    if (
        !/^\d{4}-\d{2}$/.test(
            period
        )
    ) {

        aogShowError(
            "AOG Record",
            "Invalid AOG start date."
        );

        return;

    }


    const now =
        Date.now();


    const username =
        getAOGCurrentUsername();


    const finalRecord = {

        id:

            id,


        reg:

            record.reg,


        aircraftType:

            record.aircraftType,


        base:

            record.base,


        category:

            record.category,


        startDate:

            record.startDate,


        startTime:

            record.startTime,


        finishDate:

            record.finishDate,


        expectedFinishTime:

            record.expectedFinishTime,


        actualFinishTime:

            record.actualFinishTime,


        durationMinutes:

            durationMinutes,


        defect:

            record.defect,


        action:

            record.action,


        comments:

            record.comments,


        createdAt:

            now,


        createdBy:

            username,


        updatedAt:

            now,


        updatedBy:

            username

    };


    try {

        /*
            Firebase write:
            dashboardData
                └── AOG
                    └── YYYY-MM
                        └── records
                            └── AOG-ID
        */

        await aogFirebaseSet(
            `${AOG_RECORDS_ROOT}/${period}/records/${id}`,
            finalRecord
        );


        /*
            Verify immediately after writing.
            This prevents us from telling the user
            that it saved when Firebase rejected it.
        */

        const verification =
            await aogFirebaseGet(
                `${AOG_RECORDS_ROOT}/${period}/records/${id}`
            );


        if (
            !verification ||
            typeof verification.exists !==
            "function" ||
            !verification.exists()
        ) {

            throw new Error(
                "Firebase verification failed after save."
            );

        }


        const savedRecord =
            verification.val();


        if (
            !savedRecord ||
            String(
                savedRecord.id
            ) !==
            String(id)
        ) {

            throw new Error(
                "Firebase returned an invalid saved AOG record."
            );

        }


        closeAllAOGManagementModals();


        await reloadAOGDashboardAfterImport();


        AOG_MANAGEMENT_SELECTED_RECORD =
            savedRecord;


        aogShowSuccess(
            "AOG Added",
            `The AOG record for ${record.reg} was successfully saved.`
        );


        /*
            Return to CENTER after successful save.
        */

        await openAOGManagementCenter();


    }

    catch (error) {

        console.error(
            "AOG SAVE ERROR:",
            error
        );


        aogShowError(
            "AOG Save",
            "The AOG could not be saved to Firebase. Please check your connection and try again."
        );

    }

}


/* =========================================================
   LOAD ALL AOG RECORDS
========================================================= */

async function loadAOGManagementRecords() {

    AOG_MANAGEMENT_RECORDS =
        [];


    try {

        const snapshot =
            await aogFirebaseGet(
                AOG_RECORDS_ROOT
            );


        if (
            !snapshot ||
            typeof snapshot.exists !==
            "function" ||
            !snapshot.exists()
        ) {

            return;

        }


        const root =
            snapshot.val();


        if (
            !root ||
            typeof root !==
            "object"
        ) {

            return;

        }


        const records =
            [];


        Object.entries(
            root
        )
        .forEach(
            (
                [
                    period,
                    periodData
                ]
            ) => {

                /*
                    Ignore configuration nodes.
                */

                if (
                    period ===
                    "config"
                ) {

                    return;

                }


                if (
                    !periodData ||
                    typeof periodData !==
                    "object"
                ) {

                    return;

                }


                const periodRecords =
                    periodData.records ||
                    {};


                Object.entries(
                    periodRecords
                )
                .forEach(
                    (
                        [
                            id,
                            record
                        ]
                    ) => {

                        if (
                            !record ||
                            typeof record !==
                            "object"
                        ) {

                            return;

                        }


                        records.push({

                            ...record,

                            id:
                                record.id ||
                                id,

                            period:
                                period

                        });

                    }
                );

            }
        );


        AOG_MANAGEMENT_RECORDS =
            records.sort(
                (
                    a,
                    b
                ) =>
                    getAOGDateTimeValue(
                        b
                    )
                    -
                    getAOGDateTimeValue(
                        a
                    )
            );


    }

    catch (error) {

        console.error(
            "AOG LOAD ERROR:",
            error
        );


        aogShowError(
            "AOG Records",
            "Unable to load AOG records from Firebase."
        );

    }

}


/* =========================================================
   VIEW RECORDS
========================================================= */

async function openAOGRecordSearch() {

    closeAllAOGManagementModals();

    AOG_MANAGEMENT_CURRENT_SCREEN =
        "SEARCH";


    await loadAOGManagementRecords();


    createAOGRecordSearchModal();

}


/* =========================================================
   SEARCH TYPE SELECTION
========================================================= */

function createAOGRecordSearchModal() {

    closeAllAOGManagementModals();


    const modal =
        document.createElement("div");


    modal.id =
        "aogRecordSearchModal";


    modal.className =
        "aog-management-overlay";


    modal.innerHTML = `

        <div
            class="aog-management-modal"
            style="max-width:1100px;"
        >

            <div
                class="aog-management-header"
            >

                <div
                    class="aog-management-header-left"
                >

                    <button
                        type="button"
                        class="aog-management-back"
                        onclick="
                            openAOGManagementCenter()
                        "
                    >

                        <span
                            class="aog-management-back-arrow"
                        >
                            ←
                        </span>

                        <span
                            class="aog-management-back-text"
                        >
                            BACK
                        </span>

                    </button>


                    <div
                        class="aog-management-heading"
                    >

                        <div
                            class="aog-management-eyebrow"
                        >
                            AIRCRAFT ON GROUND
                        </div>

                        <h2
                            class="aog-management-title"
                        >
                            View AOG Records
                        </h2>

                        <div
                            class="aog-management-subtitle"
                        >
                            Search registered AOG records
                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    class="aog-management-close"
                    onclick="
                        closeAOGManagementCenter()
                    "
                >
                    ×
                </button>

            </div>


            <div
                class="aog-management-body"
            >

                <!-- PERIOD -->

                <div
                    class="aog-period-panel"
                >

                    <div
                        class="aog-period-grid"
                    >

                        <div
                            class="aog-management-field"
                        >

                            <label>
                                Period
                            </label>

                            <select
                                id="aogManagementPeriodType"
                                onchange="
                                    changeAOGManagementPeriodType(
                                        this.value
                                    )
                                "
                            >

                                <option value="ALL">
                                    All Data
                                </option>

                                <option value="YEAR">
                                    Year
                                </option>

                                <option value="MONTH">
                                    Month
                                </option>

                            </select>

                        </div>


                        <div
                            class="aog-management-field"
                            id="aogManagementYearWrapper"
                            style="display:none;"
                        >

                            <label>
                                Year
                            </label>

                            <select
                                id="aogManagementYear"
                                onchange="
                                    changeAOGManagementYear()
                                "
                            ></select>

                        </div>


                        <div
                            class="aog-management-field"
                            id="aogManagementMonthWrapper"
                            style="display:none;"
                        >

                            <label>
                                Month
                            </label>

                            <select
                                id="aogManagementMonth"
                            ></select>

                        </div>


                        <div
                            style="
                                display:flex;
                                align-items:flex-end;
                                justify-content:flex-end;
                            "
                        >

                            <button
                                type="button"
                                class="
                                    aog-management-button
                                    aog-management-button-white
                                "
                                onclick="
                                    resetAOGManagementFilters()
                                "
                            >
                                RESET
                            </button>

                        </div>

                    </div>

                </div>


                <!-- SEARCH OPTIONS -->

                <div
                    class="aog-search-options"
                >

                    ${createAOGSearchOption(
                        "REG",
                        "AIRCRAFT REGISTRATION",
                        "Search by aircraft registration."
                    )}


                    ${createAOGSearchOption(
                        "TYPE",
                        "AIRCRAFT TYPE",
                        "Search by aircraft type."
                    )}


                    ${createAOGSearchOption(
                        "BASE",
                        "BASE",
                        "Search by Portuguese base."
                    )}


                    ${createAOGSearchOption(
                        "CATEGORY",
                        "CATEGORY",
                        "Select a configured AOG category."
                    )}

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    populateAOGManagementPeriods();

}


/* =========================================================
   SEARCH OPTION
========================================================= */

function createAOGSearchOption(
    type,
    title,
    text
) {

    return `

        <button
            type="button"
            class="aog-search-option"
            onclick="
                openAOGSearchType('${type}')
            "
        >

            <div
                class="aog-search-option-title"
            >
                ${escapeAOGHtml(
                    title
                )}
            </div>

            <div
                class="aog-search-option-text"
            >
                ${escapeAOGHtml(
                    text
                )}
            </div>

        </button>

    `;

}


/* =========================================================
   SEARCH PLACEHOLDER
   BUG FIX: THIS FUNCTION WAS MISSING
========================================================= */

function getAOGSearchPlaceholder(
    type
) {

    switch (
        type
    ) {

        case "REG":

            return "Enter aircraft registration...";


        case "TYPE":

            return "Enter aircraft type...";


        case "BASE":

            return "Enter base...";


        case "CATEGORY":

            return "Select category...";


        default:

            return "Search AOG records...";

    }

}


/* =========================================================
   OPEN SEARCH TYPE
========================================================= */

function openAOGSearchType(
    type
) {

    AOG_MANAGEMENT_SEARCH_TYPE =
        type;


    AOG_MANAGEMENT_SEARCH_VALUE =
        "";


    createAOGSearchResultsModal(
        type
    );

}


/* =========================================================
   SEARCH RESULTS MODAL
========================================================= */

function createAOGSearchResultsModal(
    type
) {

    closeAllAOGManagementModals();


    AOG_MANAGEMENT_CURRENT_SCREEN =
        "RESULTS";


    const labels = {

        REG:
            "Aircraft Registration",

        TYPE:
            "Aircraft Type",

        BASE:
            "Base",

        CATEGORY:
            "Category"

    };


    const modal =
        document.createElement("div");


    modal.id =
        "aogSearchResultsModal";


    modal.className =
        "aog-management-overlay";


    modal.innerHTML = `

        <div
            class="aog-management-modal"
            style="max-width:1150px;"
        >

            <div
                class="aog-management-header"
            >

                <div
                    class="aog-management-header-left"
                >

                    <button
                        type="button"
                        class="aog-management-back"
                        onclick="
                            openAOGRecordSearch()
                        "
                    >

                        <span
                            class="aog-management-back-arrow"
                        >
                            ←
                        </span>

                        <span
                            class="aog-management-back-text"
                        >
                            BACK
                        </span>

                    </button>


                    <div
                        class="aog-management-heading"
                    >

                        <div
                            class="aog-management-eyebrow"
                        >
                            AOG RECORD SEARCH
                        </div>

                        <h2
                            class="aog-management-title"
                        >
                            ${escapeAOGHtml(
                                labels[type] ||
                                "AOG Records"
                            )}
                        </h2>

                        <div
                            class="aog-management-subtitle"
                        >
                            Search and review matching records
                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    class="aog-management-close"
                    onclick="
                        closeAOGManagementCenter()
                    "
                >
                    ×
                </button>

            </div>


            <div
                class="aog-management-body"
            >

                <!-- FILTERS -->

                <div
                    class="aog-period-panel"
                >

                    <div
                        class="aog-period-grid"
                    >

                        <div
                            class="aog-management-field"
                        >

                            <label>
                                Period
                            </label>

                            <select
                                id="aogResultsPeriodType"
                                onchange="
                                    changeAOGResultsPeriod(
                                        this.value
                                    )
                                "
                            >

                                <option value="ALL">
                                    All Data
                                </option>

                                <option value="YEAR">
                                    Year
                                </option>

                                <option value="MONTH">
                                    Month
                                </option>

                            </select>

                        </div>


                        <div
                            class="aog-management-field"
                            id="aogResultsYearWrapper"
                            style="display:none;"
                        >

                            <label>
                                Year
                            </label>

                            <select
                                id="aogResultsYear"
                                onchange="
                                    refreshAOGSearchResults()
                                "
                            ></select>

                        </div>


                        <div
                            class="aog-management-field"
                            id="aogResultsMonthWrapper"
                            style="display:none;"
                        >

                            <label>
                                Month
                            </label>

                            <select
                                id="aogResultsMonth"
                                onchange="
                                    refreshAOGSearchResults()
                                "
                            ></select>

                        </div>


                        <div
                            class="aog-management-field"
                        >

                            <label>
                                Search
                            </label>

                            ${
                                type ===
                                "CATEGORY"

                                    ?

                                    `

                                        <select
                                            id="aogResultsSearch"
                                            onchange="
                                                AOG_MANAGEMENT_SEARCH_VALUE =
                                                    this.value;

                                                refreshAOGSearchResults();
                                            "
                                        >

                                            ${getAOGCategoryOptions()}

                                        </select>

                                    `

                                    :

                                    `

                                        <input
                                            id="aogResultsSearch"
                                            type="text"
                                            placeholder="${escapeAOGHtml(
                                                getAOGSearchPlaceholder(
                                                    type
                                                )
                                            )}"
                                            oninput="
                                                AOG_MANAGEMENT_SEARCH_VALUE =
                                                    this.value;

                                                refreshAOGSearchResults();
                                            "
                                        >

                                    `
                            }

                        </div>

                    </div>

                </div>


                <!-- TOOLBAR -->

                <div
                    class="aog-results-toolbar"
                >

                    <div
                        id="aogResultsCount"
                        class="aog-results-count"
                    >
                        0 AOG records
                    </div>


                    <button
                        type="button"
                        class="
                            aog-management-button
                            aog-management-button-yellow
                        "
                        onclick="
                            exportAOGSearchPDF()
                        "
                    >
                        EXTRACT PDF
                    </button>

                </div>


                <!-- TABLE -->

                <div
                    class="aog-results-table-wrapper"
                >

                    <table
                        class="aog-results-table"
                    >

                        <thead>

                            <tr>

                                <th>
                                    Registration
                                </th>

                                <th>
                                    Aircraft Type
                                </th>

                                <th>
                                    Base
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Category
                                </th>

                                <th>
                                    AOG Time
                                </th>

                            </tr>

                        </thead>


                        <tbody
                            id="aogResultsTableBody"
                        ></tbody>

                    </table>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    populateAOGResultsPeriods();


    refreshAOGSearchResults();

}


/* =========================================================
   PERIOD - MANAGEMENT
========================================================= */

function populateAOGManagementPeriods() {

    const years =
        getAOGAvailableYears();


    const yearSelect =
        document.getElementById(
            "aogManagementYear"
        );


    if (
        yearSelect
    ) {

        yearSelect.innerHTML =
            years.length

                ?

                years
                    .map(
                        year => `

                            <option
                                value="${escapeAOGHtml(
                                    year
                                )}"
                            >
                                ${escapeAOGHtml(
                                    year
                                )}
                            </option>

                        `
                    )
                    .join("")

                :

                `

                    <option value="">
                        No years available
                    </option>

                `;

    }


    populateAOGManagementMonths();

}


/* =========================================================
   MANAGEMENT MONTHS
========================================================= */

function populateAOGManagementMonths() {

    const year =
        document.getElementById(
            "aogManagementYear"
        )?.value ||
        "";


    const monthSelect =
        document.getElementById(
            "aogManagementMonth"
        );


    if (
        !monthSelect
    ) {
        return;
    }


    const months =
        getAOGAvailableMonths(
            year
        );


    monthSelect.innerHTML =
        months.length

            ?

            months
                .map(
                    month => `

                        <option
                            value="${escapeAOGHtml(
                                month
                            )}"
                        >
                            ${escapeAOGHtml(
                                formatAOGMonthLabel(
                                    month
                                )
                            )}
                        </option>

                    `
                )
                .join("")

            :

            `

                <option value="">
                    No months available
                </option>

            `;

}


/* =========================================================
   PERIOD TYPE - MANAGEMENT
========================================================= */

function changeAOGManagementPeriodType(
    type
) {

    const yearWrapper =
        document.getElementById(
            "aogManagementYearWrapper"
        );


    const monthWrapper =
        document.getElementById(
            "aogManagementMonthWrapper"
        );


    if (
        yearWrapper
    ) {

        yearWrapper.style.display =
            (
                type === "YEAR" ||
                type === "MONTH"
            )
                ? "flex"
                : "none";

    }


    if (
        monthWrapper
    ) {

        monthWrapper.style.display =
            type === "MONTH"
                ? "flex"
                : "none";

    }


    if (
        type === "MONTH"
    ) {

        populateAOGManagementMonths();

    }

}


/* =========================================================
   MANAGEMENT YEAR
========================================================= */

function changeAOGManagementYear() {

    populateAOGManagementMonths();

}


/* =========================================================
   RESULTS PERIOD
========================================================= */

function populateAOGResultsPeriods() {

    const years =
        getAOGAvailableYears();


    const yearSelect =
        document.getElementById(
            "aogResultsYear"
        );


    if (
        yearSelect
    ) {

        yearSelect.innerHTML =
            years
                .map(
                    year => `

                        <option
                            value="${escapeAOGHtml(
                                year
                            )}"
                        >
                            ${escapeAOGHtml(
                                year
                            )}
                        </option>

                    `
                )
                .join("");

    }


    const monthSelect =
        document.getElementById(
            "aogResultsMonth"
        );


    if (
        monthSelect
    ) {

        const months =
            getAOGAvailableMonths(
                ""
            );


        monthSelect.innerHTML =
            months
                .map(
                    month => `

                        <option
                            value="${escapeAOGHtml(
                                month
                            )}"
                        >
                            ${escapeAOGHtml(
                                formatAOGMonthLabel(
                                    month
                                )
                            )}
                        </option>

                    `
                )
                .join("");

    }

}


/* =========================================================
   RESULT PERIOD TYPE
========================================================= */

function changeAOGResultsPeriod(
    type
) {

    const yearWrapper =
        document.getElementById(
            "aogResultsYearWrapper"
        );


    const monthWrapper =
        document.getElementById(
            "aogResultsMonthWrapper"
        );


    if (
        yearWrapper
    ) {

        yearWrapper.style.display =
            (
                type === "YEAR" ||
                type === "MONTH"
            )
                ? "flex"
                : "none";

    }


    if (
        monthWrapper
    ) {

        monthWrapper.style.display =
            type === "MONTH"
                ? "flex"
                : "none";

    }


    if (
        type === "MONTH"
    ) {

        populateAOGResultsMonths();

    }


    refreshAOGSearchResults();

}


/* =========================================================
   RESULT MONTHS
========================================================= */

function populateAOGResultsMonths() {

    const year =
        document.getElementById(
            "aogResultsYear"
        )?.value ||
        "";


    const monthSelect =
        document.getElementById(
            "aogResultsMonth"
        );


    if (
        !monthSelect
    ) {
        return;
    }


    const months =
        getAOGAvailableMonths(
            year
        );


    monthSelect.innerHTML =
        months
            .map(
                month => `

                    <option
                        value="${escapeAOGHtml(
                            month
                        )}"
                    >
                        ${escapeAOGHtml(
                            formatAOGMonthLabel(
                                month
                            )
                        )}
                    </option>

                `
            )
            .join("");

}


/* =========================================================
   AVAILABLE YEARS
========================================================= */

function getAOGAvailableYears() {

    return [

        ...new Set(

            AOG_MANAGEMENT_RECORDS

                .map(
                    record =>
                        String(
                            record.startDate ||
                            ""
                        )
                        .slice(
                            0,
                            4
                        )
                )

                .filter(
                    year =>
                        /^\d{4}$/.test(
                            year
                        )
                )

        )

    ]
    .sort()
    .reverse();

}


/* =========================================================
   AVAILABLE MONTHS
========================================================= */

function getAOGAvailableMonths(
    year = ""
) {

    return [

        ...new Set(

            AOG_MANAGEMENT_RECORDS

                .map(
                    record =>
                        String(
                            record.startDate ||
                            ""
                        )
                        .slice(
                            0,
                            7
                        )
                )

                .filter(
                    month => {

                        if (
                            !/^\d{4}-\d{2}$/.test(
                                month
                            )
                        ) {

                            return false;

                        }


                        if (
                            year
                        ) {

                            return month.startsWith(
                                `${year}-`
                            );

                        }


                        return true;

                    }
                )

        )

    ]
    .sort()
    .reverse();

}


/* =========================================================
   SEARCH RESULTS
========================================================= */

function refreshAOGSearchResults() {

    const type =
        AOG_MANAGEMENT_SEARCH_TYPE;


    if (
        !type
    ) {
        return;
    }


    const periodType =
        document.getElementById(
            "aogResultsPeriodType"
        )?.value ||
        "ALL";


    const year =
        document.getElementById(
            "aogResultsYear"
        )?.value ||
        "";


    const month =
        document.getElementById(
            "aogResultsMonth"
        )?.value ||
        "";


    const searchElement =
        document.getElementById(
            "aogResultsSearch"
        );


    const search =
        String(
            searchElement?.value ||
            ""
        )
        .trim()
        .toUpperCase();


    AOG_MANAGEMENT_SEARCH_VALUE =
        search;


    let records =
        [
            ...AOG_MANAGEMENT_RECORDS
        ];


    /*
        PERIOD FILTER
    */

    if (
        periodType === "YEAR" &&
        year
    ) {

        records =
            records.filter(
                record =>
                    String(
                        record.startDate ||
                        ""
                    )
                    .startsWith(
                        `${year}-`
                    )
            );

    }


    if (
        periodType === "MONTH" &&
        month
    ) {

        records =
            records.filter(
                record =>
                    String(
                        record.startDate ||
                        ""
                    )
                    .startsWith(
                        month
                    )
            );

    }


    /*
        SEARCH FILTER
    */

    if (
        search
    ) {

        records =
            records.filter(
                record => {

                    let value =
                        "";


                    switch (
                        type
                    ) {

                        case "REG":

                            value =
                                record.reg ||
                                "";

                            break;


                        case "TYPE":

                            value =
                                record.aircraftType ||
                                "";

                            break;


                        case "BASE":

                            value =
                                record.base ||
                                "";

                            break;


                        case "CATEGORY":

                            value =
                                record.category ||
                                "";

                            break;

                    }


                    return String(
                        value
                    )
                    .toUpperCase()
                    .includes(
                        search
                    );

                }
            );

    }


    AOG_MANAGEMENT_FILTERED_RECORDS =
        records;


    renderAOGSearchResults(
        records
    );

}


/* =========================================================
   RENDER RESULTS
========================================================= */

function renderAOGSearchResults(
    records
) {

    const body =
        document.getElementById(
            "aogResultsTableBody"
        );


    const count =
        document.getElementById(
            "aogResultsCount"
        );


    if (
        count
    ) {

        count.textContent =
            `${records.length} AOG ${
                records.length === 1
                    ? "record"
                    : "records"
            }`;

    }


    if (
        !body
    ) {
        return;
    }


    if (
        !records.length
    ) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="6"
                >

                    <div
                        class="aog-management-empty"
                    >
                        No AOG records match
                        the selected criteria.
                    </div>

                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        records
            .map(
                record => `

                    <tr
                        onclick="
                            openAOGRecordDetails(
                                '${escapeAOGJS(
                                    record.id
                                )}'
                            )
                        "
                    >

                        <td
                            class="aog-table-reg"
                        >
                            ${escapeAOGHtml(
                                record.reg ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${escapeAOGHtml(
                                record.aircraftType ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${escapeAOGHtml(
                                record.base ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${escapeAOGHtml(
                                formatAOGDate(
                                    record.startDate
                                )
                            )}
                        </td>


                        <td>
                            ${escapeAOGHtml(
                                record.category ||
                                "-"
                            )}
                        </td>


                        <td
                            class="aog-table-duration"
                        >
                            ${escapeAOGHtml(
                                formatAOGDuration(
                                    calculateAOGRecordDuration(
                                        record
                                    ) || 0
                                )
                            )}
                        </td>

                    </tr>

                `
            )
            .join("");

}


/* =========================================================
   DETAILS
========================================================= */

function openAOGRecordDetails(
    recordId
) {

    const record =
        AOG_MANAGEMENT_RECORDS.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    recordId
                )
        );


    if (
        !record
    ) {

        aogShowError(
            "AOG Record",
            "The selected AOG record could not be found."
        );

        return;

    }


    AOG_MANAGEMENT_SELECTED_RECORD =
        record;


    createAOGDetailsModal(
        record
    );

}


/* =========================================================
   DETAILS MODAL
========================================================= */

function createAOGDetailsModal(
    record
) {

    closeAllAOGManagementModals();


    AOG_MANAGEMENT_CURRENT_SCREEN =
        "DETAILS";


    const duration =
        calculateAOGRecordDuration(
            record
        );


    const modal =
        document.createElement("div");


    modal.id =
        "aogRecordDetailsModal";


    modal.className =
        "aog-management-overlay";


    modal.innerHTML = `

        <div
            class="aog-management-modal"
            style="max-width:850px;"
        >

            <div
                class="aog-management-header"
            >

                <div
                    class="aog-management-header-left"
                >

                    <button
                        type="button"
                        class="aog-management-back"
                        onclick="
                            backFromAOGDetails()
                        "
                    >

                        <span
                            class="aog-management-back-arrow"
                        >
                            ←
                        </span>

                        <span
                            class="aog-management-back-text"
                        >
                            BACK
                        </span>

                    </button>


                    <div
                        class="aog-management-heading"
                    >

                        <div
                            class="aog-management-eyebrow"
                        >
                            AOG RECORD
                        </div>

                        <h2
                            class="aog-management-title"
                        >
                            ${escapeAOGHtml(
                                record.reg ||
                                "Aircraft"
                            )}
                        </h2>

                        <div
                            class="aog-management-subtitle"
                        >
                            ${escapeAOGHtml(
                                record.aircraftType ||
                                "Aircraft on Ground"
                            )}
                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    class="aog-management-close"
                    onclick="
                        closeAOGManagementCenter()
                    "
                >
                    ×
                </button>

            </div>


            <div
                class="aog-management-body"
            >

                <div
                    class="aog-detail-grid"
                >

                    ${aogDetail(
                        "Registration",
                        record.reg
                    )}


                    ${aogDetail(
                        "Aircraft Type",
                        record.aircraftType
                    )}


                    ${aogDetail(
                        "Base",
                        record.base
                    )}


                    ${aogDetail(
                        "Category",
                        record.category
                    )}


                    ${aogDetail(
                        "Start Date",
                        formatAOGDate(
                            record.startDate
                        )
                    )}


                    ${aogDetail(
                        "Start Time",
                        record.startTime
                    )}


                    ${aogDetail(
                        "Finish Date",
                        formatAOGDate(
                            record.finishDate
                        )
                    )}


                    ${aogDetail(
                        "Expected Finish",
                        record.expectedFinishTime
                    )}


                    ${aogDetail(
                        "Actual Finish",
                        record.actualFinishTime
                    )}


                    ${aogDetail(
                        "AOG Time",
                        duration !== null
                            ? formatAOGDuration(
                                duration
                            )
                            : "-"
                    )}


                    ${aogDetail(
                        "Defect",
                        record.defect,
                        true
                    )}


                    ${aogDetail(
                        "Action",
                        record.action,
                        true
                    )}


                    ${aogDetail(
                        "Comments",
                        record.comments,
                        true
                    )}

                </div>

            </div>


            <div
                class="aog-management-footer"
            >

                <button
                    type="button"
                    class="
                        aog-management-button
                        aog-management-button-red
                    "
                    onclick="
                        deleteAOGRecordFromDetails()
                    "
                >
                    DELETE
                </button>


                <button
                    type="button"
                    class="
                        aog-management-button
                        aog-management-button-blue
                    "
                    onclick="
                        openAOGEditRecord()
                    "
                >
                    EDIT
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );

}


/* =========================================================
   BACK FROM DETAILS
========================================================= */

function backFromAOGDetails() {

    createAOGSearchResultsModal(
        AOG_MANAGEMENT_SEARCH_TYPE
    );

}


/* =========================================================
   DETAIL ITEM
========================================================= */

function aogDetail(
    label,
    value,
    full = false
) {

    return `

        <div
            class="
                aog-detail-item
                ${
                    full
                        ? "aog-detail-full"
                        : ""
                }
            "
        >

            <div
                class="aog-detail-label"
            >
                ${escapeAOGHtml(
                    label
                )}
            </div>


            <div
                class="aog-detail-value"
            >
                ${escapeAOGHtml(
                    value ||
                    "-"
                )}
            </div>

        </div>

    `;

}


/* =========================================================
   EDIT ACCESS
========================================================= */

function openAOGEditRecord() {

    requireAOGAdministrator(
        function() {

            if (
                !AOG_MANAGEMENT_SELECTED_RECORD
            ) {
                return;
            }


            createAOGEditModal(
                AOG_MANAGEMENT_SELECTED_RECORD
            );

        }
    );

}


/* =========================================================
   EDIT MODAL
========================================================= */

function createAOGEditModal(
    record
) {

    closeAllAOGManagementModals();


    AOG_MANAGEMENT_CURRENT_SCREEN =
        "EDIT";


    const modal =
        document.createElement("div");


    modal.id =
        "aogEditRecordModal";


    modal.className =
        "aog-management-overlay";


    modal.innerHTML = `

        <div
            class="aog-management-modal"
            style="max-width:900px;"
        >

            <div
                class="aog-management-header"
            >

                <div
                    class="aog-management-header-left"
                >

                    <button
                        type="button"
                        class="aog-management-back"
                        onclick="
                            requestCloseAOGEditModal()
                        "
                    >

                        <span
                            class="aog-management-back-arrow"
                        >
                            ←
                        </span>

                        <span
                            class="aog-management-back-text"
                        >
                            BACK
                        </span>

                    </button>


                    <div
                        class="aog-management-heading"
                    >

                        <div
                            class="aog-management-eyebrow"
                        >
                            AIRCRAFT ON GROUND
                        </div>

                        <h2
                            class="aog-management-title"
                        >
                            Edit AOG Record
                        </h2>

                        <div
                            class="aog-management-subtitle"
                        >
                            ${escapeAOGHtml(
                                record.reg ||
                                ""
                            )}
                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    class="aog-management-close"
                    onclick="
                        requestCloseAOGEditModal()
                    "
                >
                    ×
                </button>

            </div>


            <div
                class="aog-management-body"
            >

                <div
                    class="aog-detail-grid"
                >

                    ${aogEditField(
                        "Registration",
                        "aogEditReg",
                        record.reg
                    )}


                    ${aogEditField(
                        "Aircraft Type",
                        "aogEditType",
                        record.aircraftType
                    )}


                    <div
                        class="aog-management-field"
                    >

                        <label>
                            Base
                        </label>

                        <select
                            id="aogEditBase"
                        >

                            <option value="">
                                Select Base
                            </option>

                            ${
                                AOG_PORTUGAL_BASES
                                    .map(
                                        base => `

                                            <option
                                                value="${escapeAOGHtml(
                                                    base
                                                )}"
                                                ${
                                                    base ===
                                                    record.base
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                ${escapeAOGHtml(
                                                    base
                                                )}
                                            </option>

                                        `
                                    )
                                    .join("")
                            }

                        </select>

                    </div>


                    <div
                        class="aog-management-field"
                    >

                        <label>
                            Category
                        </label>

                        <select
                            id="aogEditCategory"
                        >

                            ${getAOGCategoryOptions(
                                record.category
                            )}

                        </select>

                    </div>


                    ${aogEditField(
                        "Start Date",
                        "aogEditStartDate",
                        record.startDate,
                        "date"
                    )}


                    ${aogEditField(
                        "Start Time",
                        "aogEditStartTime",
                        record.startTime,
                        "time"
                    )}


                    ${aogEditField(
                        "Finish Date",
                        "aogEditFinishDate",
                        record.finishDate,
                        "date"
                    )}


                    ${aogEditField(
                        "Expected Finish",
                        "aogEditExpectedTime",
                        record.expectedFinishTime,
                        "time"
                    )}


                    ${aogEditField(
                        "Actual Finish",
                        "aogEditActualTime",
                        record.actualFinishTime,
                        "time"
                    )}


                    <div
                        class="aog-management-field"
                    >

                        <label>
                            AOG Time
                        </label>

                        <input
                            id="aogEditDuration"
                            type="text"
                            disabled
                            value="${escapeAOGHtml(
                                formatAOGDuration(
                                    calculateAOGRecordDuration(
                                        record
                                    ) || 0
                                )
                            )}"
                        >

                    </div>


                    ${aogEditTextarea(
                        "Defect",
                        "aogEditDefect",
                        record.defect
                    )}


                    ${aogEditTextarea(
                        "Action",
                        "aogEditAction",
                        record.action
                    )}


                    ${aogEditTextarea(
                        "Comments",
                        "aogEditComments",
                        record.comments
                    )}

                </div>

            </div>


            <div
                class="aog-management-footer"
            >

                <button
                    type="button"
                    class="
                        aog-management-button
                        aog-management-button-white
                    "
                    onclick="
                        requestCloseAOGEditModal()
                    "
                >
                    CANCEL
                </button>


                <button
                    type="button"
                    class="
                        aog-management-button
                        aog-management-button-green
                    "
                    onclick="
                        saveAOGEditedRecord()
                    "
                >
                    SAVE CHANGES
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    [
        "aogEditStartDate",
        "aogEditStartTime",
        "aogEditFinishDate",
        "aogEditActualTime"
    ]
    .forEach(
        id => {

            const field =
                document.getElementById(
                    id
                );


            if (
                field
            ) {

                field.addEventListener(
                    "input",
                    updateAOGEditDuration
                );

            }

        }
    );

}


/* =========================================================
   EDIT FIELD
========================================================= */

function aogEditField(
    label,
    id,
    value,
    type = "text"
) {

    return `

        <div
            class="aog-management-field"
        >

            <label>
                ${escapeAOGHtml(
                    label
                )}
            </label>

            <input
                id="${escapeAOGHtml(
                    id
                )}"
                type="${escapeAOGHtml(
                    type
                )}"
                value="${escapeAOGHtml(
                    value ||
                    ""
                )}"
            >

        </div>

    `;

}


/* =========================================================
   EDIT TEXTAREA
========================================================= */

function aogEditTextarea(
    label,
    id,
    value
) {

    return `

        <div
            class="
                aog-management-field
                aog-detail-full
            "
        >

            <label>
                ${escapeAOGHtml(
                    label
                )}
            </label>

            <textarea
                id="${escapeAOGHtml(
                    id
                )}"
            >${escapeAOGHtml(
                value ||
                ""
            )}</textarea>

        </div>

    `;

}


/* =========================================================
   EDIT DURATION
========================================================= */

function updateAOGEditDuration() {

    const duration =
        calculateAOGDurationFromFields(
            "aogEditStartDate",
            "aogEditStartTime",
            "aogEditFinishDate",
            "aogEditActualTime"
        );


    const field =
        document.getElementById(
            "aogEditDuration"
        );


    if (
        !field
    ) {
        return;
    }


    field.value =
        duration !== null

            ? formatAOGDuration(
                duration
            )

            : "-";

}


/* =========================================================
   EDIT BACK / CLOSE
========================================================= */

function requestCloseAOGEditModal() {

    const hasData =
        hasAOGFormData(
            "aogEdit"
        );


    if (
        !hasData
    ) {

        return backFromAOGEdit();

    }


    openAOGCloseConfirmation(
        "edit"
    );

}


/* =========================================================
   BACK FROM EDIT
========================================================= */

function backFromAOGEdit() {

    if (
        AOG_MANAGEMENT_SELECTED_RECORD
    ) {

        createAOGDetailsModal(
            AOG_MANAGEMENT_SELECTED_RECORD
        );

    }

    else {

        openAOGRecordSearch();

    }

}


/* =========================================================
   SAVE EDIT
========================================================= */

async function saveAOGEditedRecord() {

    if (
        !isAOGAdministrator()
    ) {

        return requireAOGAdministrator(
            saveAOGEditedRecord
        );

    }


    const original =
        AOG_MANAGEMENT_SELECTED_RECORD;


    if (
        !original
    ) {

        aogShowError(
            "AOG Update",
            "No AOG record is currently selected."
        );

        return;

    }


    const updated =
        collectAOGFormValues(
            "aogEdit"
        );


    const validation =
        validateAOGRecord(
            updated
        );


    if (
        !validation.valid
    ) {

        aogShowError(
            "AOG Record",
            validation.message
        );

        return;

    }


    const durationMinutes =
        calculateAOGRecordDuration(
            updated
        );


    if (
        durationMinutes === null
    ) {

        aogShowError(
            "AOG Update",
            "Unable to calculate the AOG duration."
        );

        return;

    }


    const oldPeriod =
        original.period ||
        getAOGMonthKey(
            original.startDate
        );


    const newPeriod =
        getAOGMonthKey(
            updated.startDate
        );


    if (
        !/^\d{4}-\d{2}$/.test(
            newPeriod
        )
    ) {

        aogShowError(
            "AOG Update",
            "Invalid AOG start date."
        );

        return;

    }


    const finalRecord = {

        ...original,

        ...updated,

        id:
            original.id,

        durationMinutes:
            durationMinutes,

        updatedAt:
            Date.now(),

        updatedBy:
            getAOGCurrentUsername()

    };


    try {

        /*
            Same month:
            update the existing node.
        */

        if (
            oldPeriod ===
            newPeriod
        ) {

            await aogFirebaseUpdate(
                `${AOG_RECORDS_ROOT}/${oldPeriod}/records/${original.id}`,
                finalRecord
            );

        }

        /*
            Start date moved to another month:
            create in new month first,
            verify it,
            then delete old record.
        */

        else {

            await aogFirebaseSet(
                `${AOG_RECORDS_ROOT}/${newPeriod}/records/${original.id}`,
                finalRecord
            );


            const verification =
                await aogFirebaseGet(
                    `${AOG_RECORDS_ROOT}/${newPeriod}/records/${original.id}`
                );


            if (
                !verification ||
                !verification.exists()
            ) {

                throw new Error(
                    "Firebase verification failed after moving AOG record."
                );

            }


            await aogFirebaseRemove(
                `${AOG_RECORDS_ROOT}/${oldPeriod}/records/${original.id}`
            );

        }


        /*
            Verify final data.
        */

        const verification =
            await aogFirebaseGet(
                `${AOG_RECORDS_ROOT}/${newPeriod}/records/${original.id}`
            );


        if (
            !verification ||
            !verification.exists()
        ) {

            throw new Error(
                "Firebase verification failed after update."
            );

        }


        const savedRecord =
            verification.val();


        AOG_MANAGEMENT_SELECTED_RECORD =
            {
                ...savedRecord,

                id:
                    savedRecord.id ||
                    original.id,

                period:
                    newPeriod

            };


        await reloadAOGDashboardAfterImport();


        const refreshedRecord =
            AOG_MANAGEMENT_RECORDS.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        original.id
                    )
            );


        if (
            refreshedRecord
        ) {

            AOG_MANAGEMENT_SELECTED_RECORD =
                refreshedRecord;

        }


        aogShowSuccess(
            "AOG Updated",
            `The AOG record for ${updated.reg} was successfully updated.`
        );


        createAOGDetailsModal(
            AOG_MANAGEMENT_SELECTED_RECORD
        );

    }

    catch (error) {

        console.error(
            "AOG UPDATE ERROR:",
            error
        );


        aogShowError(
            "AOG Update",
            "The AOG could not be updated in Firebase."
        );

    }

}

/* =========================================================
   DELETE AOG RECORD
   FIXED CONFIRMATION MODAL
========================================================= */

function deleteAOGRecordFromDetails() {

    requireAOGAdministrator(
        function() {

            const record =
                AOG_MANAGEMENT_SELECTED_RECORD;


            if (!record) {

                aogShowError(
                    "AOG Record",
                    "No AOG record is currently selected."
                );

                return;

            }


            /*
                IMPORTANT:
                Close the Details modal first.

                This guarantees that the confirmation
                is the only active AOG modal on screen.
            */

            closeAllAOGManagementModals();


            const modal =
                document.createElement("div");


            modal.id =
                "aogDeleteConfirmationModal";


            modal.className =
                "aog-management-overlay";


            /*
                Force this confirmation to be above
                every other dashboard/modal layer.
            */

            modal.style.zIndex =
                "2147483647";


            modal.innerHTML = `

                <div
                    class="aog-management-modal"
                    style="
                        max-width:500px;
                        width:calc(100% - 32px);
                    "
                >

                    <!-- HEADER -->

                    <div
                        class="aog-management-header"
                    >

                        <div
                            class="aog-management-heading"
                        >

                            <div
                                class="aog-management-eyebrow"
                            >
                                AOG RECORD
                            </div>


                            <h2
                                class="aog-management-title"
                            >
                                Delete AOG Record
                            </h2>


                            <div
                                class="aog-management-subtitle"
                            >
                                ${escapeAOGHtml(
                                    record.reg ||
                                    "Aircraft"
                                )}
                            </div>

                        </div>


                        <button
                            type="button"
                            class="aog-management-close"
                            onclick="
                                cancelAOGDelete()
                            "
                            aria-label="Close"
                        >
                            ×
                        </button>

                    </div>


                    <!-- BODY -->

                    <div
                        class="aog-management-body"
                    >

                        <div
                            style="
                                text-align:center;
                                padding:10px 4px 4px;
                            "
                        >

                            <div
                                style="
                                    width:58px;
                                    height:58px;
                                    margin:0 auto 18px;
                                    border-radius:50%;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    background:rgba(220,38,38,0.10);
                                    color:#dc2626;
                                    font-size:28px;
                                    font-weight:900;
                                "
                            >
                                !
                            </div>


                            <div
                                style="
                                    color:#16233f;
                                    font-size:18px;
                                    font-weight:800;
                                    margin-bottom:10px;
                                "
                            >
                                Are you sure?
                            </div>


                            <div
                                style="
                                    color:#667085;
                                    font-size:13px;
                                    line-height:1.65;
                                    max-width:390px;
                                    margin:0 auto;
                                "
                            >

                                You are about to permanently
                                delete the AOG record for

                                <strong
                                    style="color:#16233f;"
                                >
                                    ${escapeAOGHtml(
                                        record.reg ||
                                        "this aircraft"
                                    )}
                                </strong>.

                                <br><br>

                                This action cannot be undone.

                            </div>

                        </div>

                    </div>


                    <!-- FOOTER -->

                    <div
                        class="aog-management-footer"
                    >

                        <button
                            type="button"
                            class="
                                aog-management-button
                                aog-management-button-white
                            "
                            onclick="
                                cancelAOGDelete()
                            "
                        >
                            CANCEL
                        </button>


                        <button
                            type="button"
                            class="
                                aog-management-button
                                aog-management-button-red
                            "
                            onclick="
                                confirmAOGDelete()
                            "
                        >
                            DELETE AOG
                        </button>

                    </div>

                </div>

            `;


            document.body.appendChild(
                modal
            );


            /*
                Clicking the background also cancels.
            */

            modal.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target ===
                        modal
                    ) {

                        cancelAOGDelete();

                    }

                }
            );

        }
    );

}


/* =========================================================
   CANCEL DELETE
========================================================= */

function cancelAOGDelete() {

    const modal =
        document.getElementById(
            "aogDeleteConfirmationModal"
        );


    if (modal) {

        modal.remove();

    }


    /*
        Restore the AOG Details modal.
    */

    if (
        AOG_MANAGEMENT_SELECTED_RECORD
    ) {

        createAOGDetailsModal(
            AOG_MANAGEMENT_SELECTED_RECORD
        );

    }

}


/* =========================================================
   CONFIRM DELETE
========================================================= */

async function confirmAOGDelete() {

    const record =
        AOG_MANAGEMENT_SELECTED_RECORD;


    if (!record) {

        cancelAOGDelete();

        return;

    }


    const modal =
        document.getElementById(
            "aogDeleteConfirmationModal"
        );


    /*
        Prevent double-click / double-delete.
    */

    if (modal) {

        const buttons =
            modal.querySelectorAll(
                "button"
            );


        buttons.forEach(
            button => {

                button.disabled =
                    true;

                button.style.opacity =
                    "0.55";

                button.style.pointerEvents =
                    "none";

            }
        );

    }


    try {

        const period =
            record.period ||
            getAOGMonthKey(
                record.startDate
            );


        if (
            !/^\d{4}-\d{2}$/.test(
                period
            )
        ) {

            throw new Error(
                "Invalid AOG period."
            );

        }


        /*
            DELETE FROM FIREBASE
        */

        await aogFirebaseRemove(
            `${AOG_RECORDS_ROOT}/${period}/records/${record.id}`
        );


        /*
            VERIFY DELETION
        */

        const verification =
            await aogFirebaseGet(
                `${AOG_RECORDS_ROOT}/${period}/records/${record.id}`
            );


        if (
            verification &&
            verification.exists()
        ) {

            throw new Error(
                "Firebase deletion verification failed."
            );

        }


        /*
            Refresh local records.
        */

        await reloadAOGDashboardAfterImport();


        AOG_MANAGEMENT_SELECTED_RECORD =
            null;


        /*
            Close confirmation.
        */

        const confirmation =
            document.getElementById(
                "aogDeleteConfirmationModal"
            );


        if (
            confirmation
        ) {

            confirmation.remove();

        }


        /*
            Success message.
        */

        aogShowSuccess(
            "AOG Deleted",
            `The AOG record for ${record.reg} was permanently deleted.`
        );


        /*
            Return to the previous search/results
            screen instead of leaving the user stranded.
        */

        if (
            AOG_MANAGEMENT_SEARCH_TYPE
        ) {

            createAOGSearchResultsModal(
                AOG_MANAGEMENT_SEARCH_TYPE
            );

        }

        else {

            openAOGRecordSearch();

        }

    }

    catch (error) {

        console.error(
            "AOG DELETE ERROR:",
            error
        );


        /*
            Re-enable buttons if something failed.
        */

        if (modal) {

            const buttons =
                modal.querySelectorAll(
                    "button"
                );


            buttons.forEach(
                button => {

                    button.disabled =
                        false;

                    button.style.opacity =
                        "";

                    button.style.pointerEvents =
                        "";

                }
            );

        }


        aogShowError(
            "AOG Delete",
            "Unable to delete the selected AOG record from Firebase."
        );

    }

}


/* =========================================================
   GLOBAL EXPORTS
========================================================= */

window.deleteAOGRecordFromDetails =
    deleteAOGRecordFromDetails;

window.cancelAOGDelete =
    cancelAOGDelete;

window.confirmAOGDelete =
    confirmAOGDelete;


/* =========================================================
   FORM COLLECTION
========================================================= */

function collectAOGFormValues(
    prefix
) {

    return {

        reg:
            getAOGFieldValue(
                `${prefix}Reg`
            )
            .toUpperCase(),


        aircraftType:
            getAOGFieldValue(
                `${prefix}Type`
            ),


        base:
            getAOGFieldValue(
                `${prefix}Base`
            ),


        category:
            getAOGFieldValue(
                `${prefix}Category`
            ),


        startDate:
            getAOGFieldValue(
                `${prefix}StartDate`
            ),


        startTime:
            getAOGFieldValue(
                `${prefix}StartTime`
            ),


        finishDate:
            getAOGFieldValue(
                `${prefix}FinishDate`
            ),


        expectedFinishTime:
            getAOGFieldValue(
                `${prefix}ExpectedTime`
            ),


        actualFinishTime:
            getAOGFieldValue(
                `${prefix}ActualTime`
            ),


        defect:
            getAOGFieldValue(
                `${prefix}Defect`
            ),


        action:
            getAOGFieldValue(
                `${prefix}Action`
            ),


        comments:
            getAOGFieldValue(
                `${prefix}Comments`
            )

    };

}


/* =========================================================
   FIELD VALUE
========================================================= */

function getAOGFieldValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (
        !element
    ) {
        return "";
    }


    return String(
        element.value ||
        ""
    )
    .trim();

}


/* =========================================================
   FORM DATA CHECK
========================================================= */

function hasAOGFormData(
    prefix
) {

    const ids = [

        `${prefix}Reg`,
        `${prefix}Type`,
        `${prefix}Base`,
        `${prefix}Category`,
        `${prefix}StartDate`,
        `${prefix}StartTime`,
        `${prefix}FinishDate`,
        `${prefix}ExpectedTime`,
        `${prefix}ActualTime`,
        `${prefix}Defect`,
        `${prefix}Action`,
        `${prefix}Comments`

    ];


    return ids.some(
        id =>
            getAOGFieldValue(
                id
            ) !== ""
    );

}


/* =========================================================
   VALIDATION
========================================================= */

function validateAOGRecord(
    record
) {

    if (
        !record.reg
    ) {

        return {

            valid:
                false,

            message:
                "Please enter the aircraft registration."

        };

    }


    if (
        !record.aircraftType
    ) {

        return {

            valid:
                false,

            message:
                "Please enter the aircraft type."

        };

    }


    if (
        !AOG_PORTUGAL_BASES.includes(
            record.base
        )
    ) {

        return {

            valid:
                false,

            message:
                "Please select a valid Portuguese base."

        };

    }


    if (
        !record.category
    ) {

        return {

            valid:
                false,

            message:
                "Please select an AOG category."

        };

    }


    if (
        !record.startDate ||
        !record.startTime
    ) {

        return {

            valid:
                false,

            message:
                "Please enter the AOG start date and time."

        };

    }


    if (
        !record.finishDate ||
        !record.actualFinishTime
    ) {

        return {

            valid:
                false,

            message:
                "Please enter the actual finish date and time."

        };

    }


    const duration =
        calculateAOGRecordDuration(
            record
        );


    if (
        duration === null
    ) {

        return {

            valid:
                false,

            message:
                "The AOG start and actual finish times are invalid."

        };

    }


    if (
        duration < 0
    ) {

        return {

            valid:
                false,

            message:
                "Actual finish cannot be earlier than the AOG start."

        };

    }


    return {

        valid:
            true

    };

}


/* =========================================================
   DURATION
========================================================= */

function calculateAOGDurationFromFields(
    startDateId,
    startTimeId,
    finishDateId,
    finishTimeId
) {

    return calculateAOGDurationFromValues(

        getAOGFieldValue(
            startDateId
        ),

        getAOGFieldValue(
            startTimeId
        ),

        getAOGFieldValue(
            finishDateId
        ),

        getAOGFieldValue(
            finishTimeId
        )

    );

}


/* =========================================================
   DURATION FROM VALUES
========================================================= */

function calculateAOGDurationFromValues(
    startDate,
    startTime,
    finishDate,
    finishTime
) {

    if (
        !startDate ||
        !startTime ||
        !finishDate ||
        !finishTime
    ) {

        return null;

    }


    const start =
        new Date(
            `${startDate}T${startTime}`
        );


    const finish =
        new Date(
            `${finishDate}T${finishTime}`
        );


    if (
        Number.isNaN(
            start.getTime()
        ) ||
        Number.isNaN(
            finish.getTime()
        )
    ) {

        return null;

    }


    return (
        finish.getTime() -
        start.getTime()
    ) / 60000;

}


/* =========================================================
   RECORD DURATION
========================================================= */

function calculateAOGRecordDuration(
    record
) {

    if (
        !record
    ) {

        return null;

    }


    /*
        Prefer stored duration only if the
        date/time fields are unavailable.

        Otherwise recalculate so edits are
        always reflected correctly.
    */

    const calculated =
        calculateAOGDurationFromValues(

            record.startDate,
            record.startTime,
            record.finishDate,
            record.actualFinishTime

        );


    if (
        calculated !== null
    ) {

        return calculated;

    }


    if (
        Number.isFinite(
            Number(
                record.durationMinutes
            )
        )
    ) {

        return Number(
            record.durationMinutes
        );

    }


    return null;

}


/* =========================================================
   FORMAT DURATION
========================================================= */

function formatAOGDuration(
    minutes
) {

    if (
        minutes === null ||
        minutes === undefined ||
        !Number.isFinite(
            Number(
                minutes
            )
        )
    ) {

        return "-";

    }


    const total =
        Math.max(
            0,
            Math.round(
                Number(
                    minutes
                )
            )
        );


    const hours =
        Math.floor(
            total / 60
        );


    const mins =
        total % 60;


    if (
        hours === 0
    ) {

        return `${mins}m`;

    }


    if (
        mins === 0
    ) {

        return `${hours}h`;

    }


    return `${hours}h ${mins}m`;

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatAOGDate(
    value
) {

    if (
        !value
    ) {

        return "-";

    }


    const date =
        new Date(
            `${value}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );

    }


    return date.toLocaleDateString(
        "en-GB"
    );

}


/* =========================================================
   DATE TIME SORT
========================================================= */

function getAOGDateTimeValue(
    record
) {

    if (
        !record
    ) {

        return 0;

    }


    const value =
        new Date(
            `${record.startDate || "1970-01-01"}T${
                record.startTime || "00:00"
            }`
        )
        .getTime();


    return Number.isFinite(
        value
    )
        ? value
        : 0;

}


/* =========================================================
   MONTH KEY
========================================================= */

function getAOGMonthKey(
    date
) {

    return String(
        date ||
        ""
    )
    .slice(
        0,
        7
    );

}


/* =========================================================
   MONTH LABEL
========================================================= */

function formatAOGMonthLabel(
    value
) {

    if (
        !/^\d{4}-\d{2}$/.test(
            String(
                value
            )
        )
    ) {

        return value;

    }


    const [
        year,
        month
    ] =
        String(
            value
        )
        .split("-");


    const date =
        new Date(
            Number(
                year
            ),
            Number(
                month
            ) - 1,
            1
        );


    return date.toLocaleString(
        "en-GB",
        {
            month:
                "long",

            year:
                "numeric"
        }
    );

}


/* =========================================================
   AOG RECORD ID
   UNIQUE + SAFE FOR BULK IMPORT
========================================================= */

let AOG_RECORD_ID_COUNTER = 0;


function createAOGRecordId(){

    AOG_RECORD_ID_COUNTER++;


    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const timestamp =
        Date.now()
            .toString(
                36
            )
            .toUpperCase();


    const counter =
        String(
            AOG_RECORD_ID_COUNTER
        )
        .padStart(
            4,
            "0"
        );


    const random =
        Math.random()
            .toString(
                36
            )
            .substring(
                2,
                8
            )
            .toUpperCase();


    return (

        `AOG-${year}${month}-` +
        `${timestamp}-` +
        `${counter}-` +
        `${random}`

    );

}

/* =========================================================
   CURRENT USER
========================================================= */

function getAOGCurrentUsername() {

    try {

        if (
            typeof authSystem !==
            "undefined" &&
            typeof authSystem.getCurrentUsername ===
            "function"
        ) {

            return (
                authSystem.getCurrentUsername() ||
                "system"
            );

        }

    }

    catch (error) {

        console.warn(
            "AOG username:",
            error
        );

    }


    try {

        if (
            typeof CURRENT_USER !==
            "undefined" &&
            CURRENT_USER
        ) {

            return (
                CURRENT_USER.profile?.username ||
                CURRENT_USER.profile?.name ||
                "system"
            );

        }

    }

    catch (error) {

        console.warn(
            "AOG CURRENT_USER username:",
            error
        );

    }


    return "system";

}


/* =========================================================
   FIREBASE GET
   Uses existing project helper when available.
========================================================= */

async function aogFirebaseGet(
    path
) {

    if (
        typeof firebaseGet ===
        "function"
    ) {

        return firebaseGet(
            firebaseRef(
                database,
                path
            )
        );

    }


    if (
        typeof firebase !==
        "undefined" &&
        firebase.database
    ) {

        return firebase
            .database()
            .ref(path)
            .once(
                "value"
            );

    }


    throw new Error(
        "Firebase GET helper is not available."
    );

}


/* =========================================================
   FIREBASE SET
========================================================= */

async function aogFirebaseSet(
    path,
    data
) {

    if (
        typeof firebaseSet ===
        "function"
    ) {

        return firebaseSet(

            firebaseRef(
                database,
                path
            ),

            data

        );

    }


    if (
        typeof firebase !==
        "undefined" &&
        firebase.database
    ) {

        return firebase
            .database()
            .ref(path)
            .set(
                data
            );

    }


    throw new Error(
        "Firebase SET helper is not available."
    );

}


/* =========================================================
   FIREBASE UPDATE
========================================================= */

async function aogFirebaseUpdate(
    path,
    data
) {

    if (
        typeof firebaseUpdate ===
        "function"
    ) {

        return firebaseUpdate(

            firebaseRef(
                database,
                path
            ),

            data

        );

    }


    if (
        typeof firebase !==
        "undefined" &&
        firebase.database
    ) {

        return firebase
            .database()
            .ref(path)
            .update(
                data
            );

    }


    throw new Error(
        "Firebase UPDATE helper is not available."
    );

}


/* =========================================================
   FIREBASE REMOVE
========================================================= */

async function aogFirebaseRemove(
    path
) {

    if (
        typeof firebaseRemove ===
        "function"
    ) {

        return firebaseRemove(

            firebaseRef(
                database,
                path
            )

        );

    }


    if (
        typeof firebase !==
        "undefined" &&
        firebase.database
    ) {

        return firebase
            .database()
            .ref(path)
            .remove();

    }


    throw new Error(
        "Firebase REMOVE helper is not available."
    );

}


/* =========================================================
   PDF PLACEHOLDER
========================================================= */

function exportAOGSearchPDF() {

    /*
        FUTURE PDF ENGINE

        IMPORTANT:
        Only the records currently shown by
        the search are exported.

        AOG_MANAGEMENT_FILTERED_RECORDS
        already contains exactly that dataset.
    */

    console.log(
        "AOG PDF export data:",
        AOG_MANAGEMENT_FILTERED_RECORDS
    );


    aogShowSuccess(
        "AOG PDF",
        "PDF extraction will be configured for this section next."
    );

}


/* =========================================================
   RESET SEARCH FILTERS
========================================================= */

function resetAOGManagementFilters() {

    const period =
        document.getElementById(
            "aogManagementPeriodType"
        );


    if (
        period
    ) {

        period.value =
            "ALL";

    }


    changeAOGManagementPeriodType(
        "ALL"
    );

}


/* =========================================================
   SUCCESS
========================================================= */

function aogShowSuccess(
    title,
    message
) {

    if (
        typeof showSuccess ===
        "function"
    ) {

        showSuccess(
            title,
            message
        );

        return;

    }


    if (
        typeof showAlert ===
        "function"
    ) {

        showAlert(
            "success",
            title,
            message
        );

        return;

    }


    console.log(
        `${title}: ${message}`
    );

}


/* =========================================================
   ERROR
========================================================= */

function aogShowError(
    title,
    message
) {

    if (
        typeof showError ===
        "function"
    ) {

        showError(
            title,
            message
        );

        return;

    }


    if (
        typeof showAlert ===
        "function"
    ) {

        showAlert(
            "error",
            title,
            message
        );

        return;

    }


    console.error(
        `${title}: ${message}`
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeAOGHtml(
    value
) {

    return String(
        value ??
        ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}


/* =========================================================
   ESCAPE JS
========================================================= */

function escapeAOGJS(
    value
) {

    return String(
        value ??
        ""
    )

    .replace(
        /\\/g,
        "\\\\"
    )

    .replace(
        /'/g,
        "\\'"
    )

    .replace(
        /"/g,
        '\\"'
    )

    .replace(
        /\n/g,
        "\\n"
    )

    .replace(
        /\r/g,
        "\\r"
    );

}


/* =========================================================
   AOG — PORTUGAL MONTHLY ANALYSIS
========================================================= */


/* =========================================================
   CURRENT ANALYSIS PERIOD
========================================================= */

let CURRENT_AOG_ANALYSIS_YEAR =
    new Date().getFullYear();


let CURRENT_AOG_ANALYSIS_MONTH =
    new Date().getMonth() + 1;


let CURRENT_AOG_ANALYSIS_RECORDS =
    [];


let CURRENT_AOG_ANALYSIS_DATA =
    null;


/* =========================================================
   PORTUGAL BASES
========================================================= */

const AOG_PORTUGAL_ANALYSIS_BASES = [

    "OPO",

    "LIS",

    "FAO",

    "FNC"

];


/* =========================================================
   INITIALISE AOG DASHBOARD
========================================================= */

async function initializeAOGDashboard(){

    console.log(
        "AOG — Initialising Portugal Overview."
    );


    try{

        /*
            Load all AOG records from Firebase.

            We reuse the same loader already used
            by the Management Center.
        */

        await loadAOGManagementRecords();


        /*
            Build available monthly periods.
        */

        populateAOGDashboardPeriods();


        /*
            Select the latest available period.
        */

        const periods =
            getAOGDashboardAvailablePeriods();


        const selector =
            document.getElementById(
                "aogDashboardPeriod"
            );


        if(
            selector &&
            periods.length
        ){

            /*
                Latest period first.
            */

            const latest =
                periods[0];


            selector.value =
                latest;


            const [
                year,
                month
            ] =
                latest
                    .split("-")
                    .map(
                        Number
                    );


            CURRENT_AOG_ANALYSIS_YEAR =
                year;


            CURRENT_AOG_ANALYSIS_MONTH =
                month;

        }


        /*
            If there are no records yet,
            use current month.
        */

        else if(
            selector
        ){

            selector.value =
                getAOGAnalysisPeriodKey(
                    CURRENT_AOG_ANALYSIS_YEAR,
                    CURRENT_AOG_ANALYSIS_MONTH
                );

        }


        /*
            Calculate current period.
        */

        await refreshAOGPortugalOverview();

        await refreshAOGDistributionAnalysis();

        initializeAOGSection3();

await refreshAOGSection3();

await initializeAOGTrendAnalysis();

    }

    catch(error){

        console.error(
            "AOG DASHBOARD INITIALISATION ERROR:",
            error
        );

    }

}


/* =========================================================
   PERIOD KEY
========================================================= */

function getAOGAnalysisPeriodKey(
    year,
    month
){

    return (

        String(
            year
        ) +

        "-" +

        String(
            month
        )
        .padStart(
            2,
            "0"
        )

    );

}


/* =========================================================
   AVAILABLE MONTHS
========================================================= */

function getAOGDashboardAvailablePeriods(){

    const periods = [

        ...new Set(

            AOG_MANAGEMENT_RECORDS

                .map(
                    record =>
                        getAOGAnalysisPeriodKey(

                            String(
                                record.startDate ||
                                ""
                            ).slice(
                                0,
                                4
                            ),

                            Number(
                                String(
                                    record.startDate ||
                                    ""
                                ).slice(
                                    5,
                                    7
                                )
                            )

                        )
                )

                .filter(
                    period =>
                        /^\d{4}-\d{2}$/.test(
                            period
                        )
                )

        )

    ];


    return periods.sort(
        (
            a,
            b
        ) =>
            b.localeCompare(
                a
            )
    );

}


/* =========================================================
   POPULATE ANALYSIS PERIOD
========================================================= */

function populateAOGDashboardPeriods(){

    const selector =
        document.getElementById(
            "aogDashboardPeriod"
        );


    if(
        !selector
    ){

        console.warn(
            "AOG — #aogDashboardPeriod not found."
        );

        return;

    }


    const periods =
        getAOGDashboardAvailablePeriods();


    selector.innerHTML =
        "";


    /*
        Real periods from Firebase.
    */

    periods.forEach(
        period => {

            const [
                year,
                month
            ] =
                period
                    .split("-")
                    .map(
                        Number
                    );


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                period;


            option.textContent =
                new Date(
                    year,
                    month - 1,
                    1
                )
                .toLocaleDateString(
                    "en-GB",
                    {
                        month:
                            "long",

                        year:
                            "numeric"
                    }
                );


            selector.appendChild(
                option
            );

        }
    );


    /*
        No records yet.
    */

    if(
        !periods.length
    ){

        const current =
            getAOGAnalysisPeriodKey(

                CURRENT_AOG_ANALYSIS_YEAR,

                CURRENT_AOG_ANALYSIS_MONTH

            );


        const option =
            document.createElement(
                "option"
            );


        option.value =
            current;


        option.textContent =
            new Date(
                CURRENT_AOG_ANALYSIS_YEAR,
                CURRENT_AOG_ANALYSIS_MONTH - 1,
                1
            )
            .toLocaleDateString(
                "en-GB",
                {
                    month:
                        "long",

                    year:
                        "numeric"
                }
            );


        selector.appendChild(
            option
        );

    }

}


/* =========================================================
   CHANGE PERIOD
========================================================= */

async function changeAOGDashboardPeriod(
    period
){

    if(
        !period
    ){

        return;

    }


    const [
        year,
        month
    ] =
        period
            .split("-")
            .map(
                Number
            );


    if(
        !year ||
        !month
    ){

        console.warn(
            "AOG — Invalid analysis period:",
            period
        );

        return;

    }


    CURRENT_AOG_ANALYSIS_YEAR =
        year;


    CURRENT_AOG_ANALYSIS_MONTH =
        month;


    await refreshAOGPortugalOverview();

    await refreshAOGDistributionAnalysis();

    await refreshAOGSection3();

    await initializeAOGTrendAnalysis();


}


/* =========================================================
   REFRESH PORTUGAL OVERVIEW
========================================================= */

async function refreshAOGPortugalOverview(){

    try{

        /*
            Always reload from Firebase.

            This means that if an administrator
            edits/deletes/adds an AOG, the KPI layer
            never relies on stale local data.
        */

        await loadAOGManagementRecords();


        /*
            Refresh period selector because a new
            month may have appeared.
        */

        populateAOGDashboardPeriods();


        const selectedPeriod =
            getAOGAnalysisPeriodKey(

                CURRENT_AOG_ANALYSIS_YEAR,

                CURRENT_AOG_ANALYSIS_MONTH

            );


        const selector =
            document.getElementById(
                "aogDashboardPeriod"
            );


        if(
            selector
        ){

            /*
                Preserve selected month whenever
                it still exists.
            */

            if(
                [
                    ...selector.options
                ]
                .some(
                    option =>
                        option.value ===
                        selectedPeriod
                )
            ){

                selector.value =
                    selectedPeriod;

            }

        }


        /*
            Filter Portugal + selected month.
        */

        CURRENT_AOG_ANALYSIS_RECORDS =

            AOG_MANAGEMENT_RECORDS.filter(

                record => {

                    const base =
                        String(
                            record.base ||
                            ""
                        )
                        .trim()
                        .toUpperCase();


                    const period =
                        String(
                            record.startDate ||
                            ""
                        )
                        .slice(
                            0,
                            7
                        );


                    return (

                        AOG_PORTUGAL_ANALYSIS_BASES
                            .includes(
                                base
                            )

                        &&

                        period ===
                        selectedPeriod

                    );

                }

            );


        /*
            Build calculations.
        */

        CURRENT_AOG_ANALYSIS_DATA =
            buildAOGPortugalAnalysis(
                CURRENT_AOG_ANALYSIS_RECORDS
            );


        /*
            Render.
        */

        renderAOGPortugalOverview(
            CURRENT_AOG_ANALYSIS_DATA
        );


        console.log(
            "AOG — Portugal Overview:",
            CURRENT_AOG_ANALYSIS_DATA
        );

    }

    catch(error){

        console.error(
            "AOG — Portugal Overview refresh error:",
            error
        );

    }

}


/* =========================================================
   BUILD AOG ANALYSIS
========================================================= */

function buildAOGPortugalAnalysis(
    records
){

    const safeRecords =
        Array.isArray(
            records
        )
            ? records
            : [];


    const result = {

        total:
            safeRecords.length,


        baseMost:{

            base:
                "-",

            count:
                0

        },


        averageAOGMinutes:
            null,


        mostAffected:{

            reg:
                "-",

            count:
                0,

            percentage:
                0

        },


        onTimePercentage:
            null,


        categoryMost:{

            category:
                "-",

            count:
                0

        },


        categories:[],


        longestAOG:
            null

    };


    /*
        =====================================================
        BASE ANALYSIS
        =====================================================
    */

    const baseCounts = {};


    safeRecords.forEach(
        record => {

            const base =
                String(
                    record.base ||
                    ""
                )
                .trim()
                .toUpperCase();


            if(
                !base
            ){

                return;

            }


            baseCounts[base] =
                (
                    baseCounts[base] ||
                    0
                ) + 1;

        }
    );


    const baseEntries =
        Object.entries(
            baseCounts
        )
        .sort(
            (
                a,
                b
            ) =>
                b[1] - a[1] ||
                a[0].localeCompare(
                    b[0]
                )
        );


    if(
        baseEntries.length
    ){

        result.baseMost = {

            base:
                baseEntries[0][0],

            count:
                baseEntries[0][1]

        };

    }


    /*
        =====================================================
        AOG TIME
        =====================================================
    */

    const durations = [];


    safeRecords.forEach(
        record => {

            const minutes =
                getAOGAnalysisDuration(
                    record
                );


            if(
                Number.isFinite(
                    minutes
                ) &&
                minutes >= 0
            ){

                durations.push(
                    minutes
                );

            }

        }
    );


    if(
        durations.length
    ){

        result.averageAOGMinutes =

            durations.reduce(
                (
                    sum,
                    value
                ) =>
                    sum + value,
                0
            ) /
            durations.length;

    }


    /*
        =====================================================
        MOST AFFECTED AIRCRAFT
        =====================================================
    */

    const regCounts = {};


    safeRecords.forEach(
        record => {

            const reg =
                String(
                    record.reg ||
                    ""
                )
                .trim()
                .toUpperCase();


            if(
                !reg
            ){

                return;

            }


            regCounts[reg] =
                (
                    regCounts[reg] ||
                    0
                ) + 1;

        }
    );


    const regEntries =
        Object.entries(
            regCounts
        )
        .sort(
            (
                a,
                b
            ) =>
                b[1] - a[1] ||
                a[0].localeCompare(
                    b[0]
                )
        );


    if(
        regEntries.length
    ){

        const count =
            regEntries[0][1];


        result.mostAffected = {

            reg:
                regEntries[0][0],

            count:
                count,

            percentage:
                result.total > 0

                    ?

                    (
                        count /
                        result.total
                    ) *
                    100

                    :

                    0

        };

    }


    /*
        =====================================================
        ON TIME
        =====================================================

        Definition:

        Actual Finish <= Expected Finish

        No Yes/No field is stored.

        We reconstruct the expected finish timestamp
        from the AOG start date/time.

        If expected finish is earlier than start time,
        it is interpreted as the following day.
    */

    let onTimeCount =
        0;


    let onTimeEligible =
        0;


    safeRecords.forEach(
        record => {

            const status =
                getAOGOnTimeStatus(
                    record
                );


            if(
                status ===
                true
            ){

                onTimeCount++;

                onTimeEligible++;

            }

            else if(
                status ===
                false
            ){

                onTimeEligible++;

            }

        }
    );


    if(
        onTimeEligible > 0
    ){

        result.onTimePercentage =

            (
                onTimeCount /
                onTimeEligible
            ) *
            100;

    }


    /*
        =====================================================
        CATEGORY ANALYSIS
        =====================================================
    */

    const categoryCounts = {};


    safeRecords.forEach(
        record => {

            const category =
                String(
                    record.category ||
                    ""
                )
                .trim();


            if(
                !category
            ){

                return;

            }


            categoryCounts[category] =
                (
                    categoryCounts[category] ||
                    0
                ) + 1;

        }
    );


    const categoryEntries =
        Object.entries(
            categoryCounts
        )
        .sort(
            (
                a,
                b
            ) =>
                b[1] - a[1] ||
                a[0].localeCompare(
                    b[0]
                )
        );


    result.categories =
        categoryEntries.map(
            (
                [
                    category,
                    count
                ]
            ) => ({

                category,
                count

            })
        );


    if(
        categoryEntries.length
    ){

        result.categoryMost = {

            category:
                categoryEntries[0][0],

            count:
                categoryEntries[0][1]

        };

    }


    /*
        =====================================================
        LONGEST AOG
        =====================================================
    */

    safeRecords.forEach(
        record => {

            const duration =
                getAOGAnalysisDuration(
                    record
                );


            if(
                !Number.isFinite(
                    duration
                )
            ){

                return;

            }


            if(
                !result.longestAOG ||
                duration >
                result.longestAOG.durationMinutes
            ){

                result.longestAOG = {

                    ...record,

                    durationMinutes:
                        duration

                };

            }

        }
    );


    return result;

}


/* =========================================================
   AOG DURATION
========================================================= */

function getAOGAnalysisDuration(
    record
){

    if(
        !record
    ){

        return null;

    }


    /*
        Prefer the same calculation used
        by the Management Center.
    */

    if(
        typeof calculateAOGRecordDuration ===
        "function"
    ){

        const calculated =
            calculateAOGRecordDuration(
                record
            );


        if(
            Number.isFinite(
                calculated
            )
        ){

            return Number(
                calculated
            );

        }

    }


    /*
        Fallback.
    */

    if(
        typeof calculateAOGDurationFromValues ===
        "function"
    ){

        const calculated =
            calculateAOGDurationFromValues(

                record.startDate,
                record.startTime,
                record.finishDate,
                record.actualFinishTime

            );


        if(
            Number.isFinite(
                calculated
            )
        ){

            return Number(
                calculated
            );

        }

    }


    return null;

}


/* =========================================================
   ON TIME STATUS
========================================================= */

function getAOGOnTimeStatus(
    record
){

    if(
        !record ||
        !record.startDate ||
        !record.startTime ||
        !record.finishDate ||
        !record.actualFinishTime ||
        !record.expectedFinishTime
    ){

        return null;

    }


    const actualFinish =
        new Date(
            `${record.finishDate}T${record.actualFinishTime}`
        );


    if(
        Number.isNaN(
            actualFinish.getTime()
        )
    ){

        return null;

    }


    /*
        Expected finish has no date in the current
        AOG data model.

        Start date is therefore the reference date.

        If expected time is earlier than start time,
        expected finish belongs to the next day.

        For multi-day AOGs, we advance the expected
        date until it is not before the start.
    */

    const start =
        new Date(
            `${record.startDate}T${record.startTime}`
        );


    if(
        Number.isNaN(
            start.getTime()
        )
    ){

        return null;

    }


    let expected =
        new Date(
            `${record.startDate}T${record.expectedFinishTime}`
        );


    if(
        Number.isNaN(
            expected.getTime()
        )
    ){

        return null;

    }


    while(
        expected <
        start
    ){

        expected.setDate(
            expected.getDate() + 1
        );

    }


    /*
        If the actual finish is several days later,
        keep the expected timestamp on the most
        logical occurrence relative to the actual
        finish.

        We only move it forward by whole days.
    */

    while(
        expected <
        actualFinish &&
        (
            actualFinish -
            expected
        ) >
        24 * 60 * 60 * 1000
    ){

        expected.setDate(
            expected.getDate() + 1
        );

    }


    return (
        actualFinish <=
        expected
    );

}


/* =========================================================
   RENDER PORTUGAL OVERVIEW
========================================================= */

function renderAOGPortugalOverview(
    analysis
){

    if(
        !analysis
    ){

        return;

    }


    /*
        KPI 1
    */

    setAOGElementText(
        "aogKPITotal",
        analysis.total
    );


    /*
        KPI 2
    */

    setAOGElementText(
        "aogKPIBaseMost",
        analysis.baseMost.base
    );


    setAOGElementText(

        "aogKPIBaseMostCount",

        analysis.baseMost.count > 0

            ?

            `${analysis.baseMost.count} AOG`

            :

            "No AOG recorded"

    );


    /*
        KPI 3
    */

    setAOGElementText(

        "aogKPIAverageTime",

        analysis.averageAOGMinutes !== null

            ?

            formatAOGDuration(
                analysis.averageAOGMinutes
            )

            :

            "-"

    );


    /*
        KPI 4
    */

    setAOGElementText(

        "aogKPIMostAffected",

        analysis.mostAffected.reg

    );


    setAOGElementText(

        "aogKPIMostAffectedDetails",

        analysis.mostAffected.count > 0

            ?

            `${analysis.mostAffected.count} AOG · ${
                analysis.mostAffected.percentage.toFixed(1)
            }% of monthly AOG`

            :

            "No AOG recorded"

    );


    /*
        KPI 5
    */

    setAOGElementText(

        "aogKPIOnTime",

        analysis.onTimePercentage !== null

            ?

            `${analysis.onTimePercentage.toFixed(1)}%`

            :

            "-%"

    );


    /*
        KPI 6
    */

    setAOGElementText(

        "aogKPIDominantCategory",

        analysis.categoryMost.category

    );


    setAOGElementText(

        "aogKPIDominantCategoryCount",

        analysis.categoryMost.count > 0

            ?

            `${analysis.categoryMost.count} AOG`

            :

            "No AOG recorded"

    );


    /*
        KPI 7
    */

    if(
        analysis.longestAOG
    ){

        const longest =
            analysis.longestAOG;


        setAOGElementText(

            "aogKPILongestReg",

            longest.reg ||
            "-"

        );


        setAOGElementText(

            "aogKPILongestDetails",

            [

                longest.aircraftType ||
                    "-",

                longest.category ||
                    "-",

                formatAOGDuration(
                    longest.durationMinutes
                )

            ]
            .join(
                " · "
            )

        );

    }

    else{

        setAOGElementText(
            "aogKPILongestReg",
            "-"
        );


        setAOGElementText(
            "aogKPILongestDetails",
            "No AOG recorded"
        );

    }

}


/* =========================================================
   SAFE TEXT UPDATE
========================================================= */

function setAOGElementText(
    id,
    value
){

    const element =
        document.getElementById(
            id
        );


    if(
        !element
    ){

        return;

    }


    element.textContent =
        value ??
        "-";

}


/* =========================================================
   LONGEST AOG → DETAILS
========================================================= */

function openAOGLongestRecord(){

    const record =
        CURRENT_AOG_ANALYSIS_DATA
            ?.longestAOG;


    if(
        !record
    ){

        aogShowError(
            "Longest AOG",
            "There are no AOG records available for the selected month."
        );

        return;

    }


    /*
        Reuse the exact AOG Details modal
        already used by Management Center.
    */

    AOG_MANAGEMENT_SELECTED_RECORD =
        record;


    createAOGDetailsModal(
        record
    );

}

/* =========================================================
   AOG — CATEGORY BREAKDOWN
========================================================= */

function openAOGCategoryBreakdown(){

    const analysis =
        CURRENT_AOG_ANALYSIS_DATA;


    if(
        !analysis
    ){

        return;

    }


    closeAllAOGManagementModals();


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "aogCategoryBreakdownModal";


    modal.className =
        "aog-management-overlay";


    modal.style.zIndex =
        "2147483000";


    const isAdmin =
        isAOGAdministrator();


    modal.innerHTML = `

        <div
            class="aog-management-modal"
            style="
                max-width:720px;
                width:calc(100% - 32px);
            "
        >

            <!-- ===================================== -->
            <!-- HEADER -->
            <!-- ===================================== -->

            <div
                class="aog-management-header"
            >

                <div
                    class="aog-management-header-left"
                >

                    <button
                        type="button"
                        class="aog-management-back"
                        onclick="
                            closeAOGCategoryBreakdown()
                        "
                    >

                        <span
                            class="aog-management-back-arrow"
                        >
                            ←
                        </span>

                        <span
                            class="aog-management-back-text"
                        >
                            BACK
                        </span>

                    </button>


                    <div
                        class="aog-management-heading"
                    >

                        <div
                            class="aog-management-eyebrow"
                        >
                            AIRCRAFT ON GROUND
                        </div>


                        <h2
                            class="aog-management-title"
                        >
                            AOG Categories
                        </h2>


                        <div
                            class="aog-management-subtitle"
                        >

                            ${
                                getAOGCurrentPeriodLabel()
                            }

                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    class="aog-management-close"
                    onclick="
                        closeAOGCategoryBreakdown()
                    "
                >
                    ×
                </button>

            </div>


            <!-- ===================================== -->
            <!-- BODY -->
            <!-- ===================================== -->

            <div
                class="aog-management-body"
            >

                <div
                    id="aogCategoryBreakdownList"
                >

                    ${renderAOGCategoryBreakdownRows(
                        analysis.categories,
                        isAdmin
                    )}

                </div>


                ${
                    isAdmin

                        ?

                        `

                            <div
                                style="
                                    margin-top:20px;
                                    display:flex;
                                    justify-content:flex-end;
                                "
                            >

                                <button
                                    type="button"
                                    class="
                                        aog-management-button
                                        aog-management-button-yellow
                                    "
                                    onclick="
                                        openAOGAddCategory()
                                    "
                                >

                                    + ADD CATEGORY

                                </button>

                            </div>

                        `

                        :

                        ""

                }

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    modal.addEventListener(
        "click",
        function(event){

            if(
                event.target ===
                modal
            ){

                closeAOGCategoryBreakdown();

            }

        }
    );

}


/* =========================================================
   CATEGORY ROWS
========================================================= */

function renderAOGCategoryBreakdownRows(
    categories,
    isAdmin
){

    if(
        !Array.isArray(
            categories
        ) ||
        !categories.length
    ){

        return `

            <div
                class="aog-management-empty"
            >

                No AOG categories recorded
                for this month.

            </div>

        `;

    }


    return categories
        .map(
            item => `

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:16px;
                        padding:14px 4px;
                        border-bottom:1px solid #E7ECF3;
                    "
                >

                    <div
                        style="
                            min-width:0;
                        "
                    >

                        <div
                            style="
                                color:#172B4D;
                                font-size:14px;
                                font-weight:700;
                            "
                        >

                            ${escapeAOGHtml(
                                item.category
                            )}

                        </div>

                    </div>


                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:12px;
                            flex-shrink:0;
                        "
                    >

                        <strong
                            style="
                                color:#073590;
                                font-size:16px;
                            "
                        >

                            ${Number(
                                item.count ||
                                0
                            )}

                        </strong>


                        ${
                            isAdmin

                                ?

                                `

                                    <button
                                        type="button"
                                        class="
                                            aog-management-small-button
                                            aog-management-small-edit
                                        "
                                        onclick="
                                            openAOGEditCategory(
                                                '${escapeAOGJS(
                                                    item.category
                                                )}'
                                            )
                                        "
                                    >
                                        EDIT
                                    </button>


                                    <button
                                        type="button"
                                        class="
                                            aog-management-small-button
                                            aog-management-small-delete
                                        "
                                        onclick="
                                            removeAOGCategory(
                                                '${escapeAOGJS(
                                                    item.category
                                                )}'
                                            )
                                        "
                                    >
                                        REMOVE
                                    </button>

                                `

                                :

                                ""

                        }

                    </div>

                </div>

            `
        )
        .join("");

}


/* =========================================================
   CLOSE CATEGORY MODAL
========================================================= */

function closeAOGCategoryBreakdown(){

    const modal =
        document.getElementById(
            "aogCategoryBreakdownModal"
        );


    if(
        modal
    ){

        modal.remove();

    }

}


/* =========================================================
   CURRENT PERIOD LABEL
========================================================= */

function getAOGCurrentPeriodLabel(){

    return new Date(

        CURRENT_AOG_ANALYSIS_YEAR,

        CURRENT_AOG_ANALYSIS_MONTH - 1,
        1

    )
    .toLocaleDateString(
        "en-GB",
        {
            month:
                "long",

            year:
                "numeric"
        }
    );

}


/* =========================================================
   ADD CATEGORY
========================================================= */

function openAOGAddCategory(){

    if(
        !isAOGAdministrator()
    ){

        aogShowError(
            "Administrator Access",
            "Administrator privileges are required to manage AOG categories."
        );

        return;

    }


    closeAOGCategoryBreakdown();


    const name =
        window.prompt(
            "Enter the new AOG category name:"
        );


    if(
        name === null
    ){

        openAOGCategoryBreakdown();

        return;

    }


    const cleanName =
        String(
            name
        )
        .trim();


    if(
        !cleanName
    ){

        aogShowError(
            "AOG Category",
            "Category name cannot be empty."
        );


        openAOGCategoryBreakdown();

        return;

    }


    saveAOGCategoryChange(
        "ADD",
        cleanName
    );

}


/* =========================================================
   EDIT CATEGORY
========================================================= */

function openAOGEditCategory(
    oldName
){

    if(
        !isAOGAdministrator()
    ){

        return;

    }


    closeAOGCategoryBreakdown();


    const newName =
        window.prompt(
            "Edit AOG category:",
            oldName
        );


    if(
        newName === null
    ){

        openAOGCategoryBreakdown();

        return;

    }


    const cleanName =
        String(
            newName
        )
        .trim();


    if(
        !cleanName
    ){

        aogShowError(
            "AOG Category",
            "Category name cannot be empty."
        );


        openAOGCategoryBreakdown();

        return;

    }


    saveAOGCategoryChange(
        "EDIT",
        cleanName,
        oldName
    );

}


/* =========================================================
   REMOVE CATEGORY
========================================================= */

function removeAOGCategory(
    category
){

    if(
        !isAOGAdministrator()
    ){

        return;

    }


    closeAOGCategoryBreakdown();


    const confirmed =
        window.confirm(

            `Remove the category "${category}" from the AOG category list?`

        );


    if(
        !confirmed
    ){

        openAOGCategoryBreakdown();

        return;

    }


    saveAOGCategoryChange(
        "REMOVE",
        category
    );

}


/* =========================================================
   SAVE CATEGORY CONFIGURATION
========================================================= */

async function saveAOGCategoryChange(
    action,
    value,
    oldValue = null
){

    if(
        !isAOGAdministrator()
    ){

        return;

    }


    try{

        await loadAOGCategories();


        let categories =
            [
                ...AOG_MANAGEMENT_CATEGORIES
            ];


        /*
            ADD
        */

        if(
            action ===
            "ADD"
        ){

            const exists =
                categories.some(
                    category =>
                        category
                            .toLowerCase()
                        ===
                        value
                            .toLowerCase()
                );


            if(
                exists
            ){

                throw new Error(
                    "A category with this name already exists."
                );

            }


            categories.push(
                value
            );

        }


        /*
            EDIT
        */

        if(
            action ===
            "EDIT"
        ){

            const index =
                categories.findIndex(
                    category =>
                        category ===
                        oldValue
                );


            if(
                index ===
                -1
            ){

                throw new Error(
                    "The original category could not be found."
                );

            }


            const duplicate =
                categories.some(
                    (
                        category,
                        categoryIndex
                    ) =>

                        categoryIndex !==
                        index &&

                        category
                            .toLowerCase()
                        ===
                        value
                            .toLowerCase()

                );


            if(
                duplicate
            ){

                throw new Error(
                    "A category with this name already exists."
                );

            }


            categories[index] =
                value;

        }


        /*
            REMOVE
        */

        if(
            action ===
            "REMOVE"
        ){

            categories =
                categories.filter(
                    category =>
                        category !==
                        value
                );

        }


        /*
            Clean + unique.
        */

        categories =
            [
                ...new Set(

                    categories

                        .map(
                            category =>
                                String(
                                    category
                                )
                                .trim()
                        )

                        .filter(
                            Boolean
                        )

                )
            ]
            .sort(
                (
                    a,
                    b
                ) =>
                    a.localeCompare(
                        b
                    )
            );


        /*
            Save to Firebase.
        */

        await aogFirebaseSet(
            AOG_CATEGORIES_PATH,
            categories
        );


        /*
            Verify.
        */

        const verification =
            await aogFirebaseGet(
                AOG_CATEGORIES_PATH
            );


        if(
            !verification ||
            !verification.exists()
        ){

            throw new Error(
                "Category configuration verification failed."
            );

        }


        AOG_MANAGEMENT_CATEGORIES =
            categories;


        aogShowSuccess(
            "AOG Categories",
            "AOG category configuration was successfully updated."
        );


        openAOGCategoryBreakdown();

    }

    catch(error){

        console.error(
            "AOG CATEGORY SAVE ERROR:",
            error
        );


        aogShowError(
            "AOG Categories",
            error?.message ||
            "Unable to update the AOG category configuration."
        );


        openAOGCategoryBreakdown();

    }

}

/* =========================================================
   AOG SECTION 2
   DISTRIBUTION & BASE ANALYSIS
========================================================= */


/* =========================================================
   STATE
========================================================= */

let CURRENT_AOG_ANALYSIS_SCOPE =
    "ALL";


let CURRENT_AOG_ANALYSIS_BASE =
    "";


let CURRENT_AOG_DAILY_VIEW =
    "TOTAL";


let CURRENT_AOG_DAILY_SUB_SELECTION =
    "";


let AOG_DAILY_HISTORY_CHART =
    null;


/* =========================================================
   PORTUGAL BASES
========================================================= */

const AOG_ANALYSIS_PT_BASES = [

    "OPO",
    "LIS",
    "FAO",
    "FNC"

];


/* =========================================================
   CHANGE ANALYSIS SCOPE
========================================================= */

function changeAOGAnalysisScope(
    scope
){

    CURRENT_AOG_ANALYSIS_SCOPE =
        scope === "BASE"
            ? "BASE"
            : "ALL";


    const wrapper =
        document.getElementById(
            "aogAnalysisBaseWrapper"
        );


    if(
        wrapper
    ){

        wrapper.style.display =
            CURRENT_AOG_ANALYSIS_SCOPE ===
            "BASE"

                ?

                "flex"

                :

                "none";

    }


    /*
        If switching to base mode and no base
        is selected, use OPO as the first
        available Portuguese base.
    */

    if(
        CURRENT_AOG_ANALYSIS_SCOPE ===
        "BASE" &&
        !CURRENT_AOG_ANALYSIS_BASE
    ){

        CURRENT_AOG_ANALYSIS_BASE =
            "OPO";


        const selector =
            document.getElementById(
                "aogAnalysisBase"
            );


        if(
            selector
        ){

            selector.value =
                "OPO";

        }

    }


    refreshAOGDistributionAnalysis();

}


/* =========================================================
   CHANGE BASE
========================================================= */

function changeAOGAnalysisBase(
    base
){

    CURRENT_AOG_ANALYSIS_BASE =
        AOG_ANALYSIS_PT_BASES.includes(
            String(
                base
            )
            .toUpperCase()
        )

            ?

            String(
                base
            )
            .toUpperCase()

            :

            "";


    refreshAOGDistributionAnalysis();

}


/* =========================================================
   GET SECTION 2 RECORDS
========================================================= */

function getAOGDistributionRecords(){

    const records =
        Array.isArray(
            AOG_MANAGEMENT_RECORDS
        )

            ?

            AOG_MANAGEMENT_RECORDS

            :

            [];


    return records.filter(
        record => {

            const base =
                String(
                    record.base ||
                    ""
                )
                .trim()
                .toUpperCase();


            /*
                Portugal only.
            */

            if(
                !AOG_ANALYSIS_PT_BASES.includes(
                    base
                )
            ){

                return false;

            }


            /*
                Selected monthly period.
            */

            const period =
                String(
                    record.startDate ||
                    ""
                )
                .slice(
                    0,
                    7
                );


            const selectedPeriod =
                getAOGAnalysisPeriodKey(

                    CURRENT_AOG_ANALYSIS_YEAR,

                    CURRENT_AOG_ANALYSIS_MONTH

                );


            if(
                period !==
                selectedPeriod
            ){

                return false;

            }


            /*
                Base filter.
            */

            if(
                CURRENT_AOG_ANALYSIS_SCOPE ===
                "BASE"
            ){

                return (
                    base ===
                    CURRENT_AOG_ANALYSIS_BASE
                );

            }


            return true;

        }
    );

}


/* =========================================================
   REFRESH SECTION 2
========================================================= */

async function refreshAOGDistributionAnalysis(){

    try{

        /*
            Always use the current Firebase/local
            record collection already loaded by
            the Management Center.
        */

        if(
            typeof loadAOGManagementRecords ===
            "function"
        ){

            await loadAOGManagementRecords();

        }


        const records =
            getAOGDistributionRecords();


        renderAOGDistributionSummary(
            records
        );


        populateAOGDailySubFilter(
            records
        );


        renderAOGDailyHistoryChart(
            records
        );


    }

    catch(error){

        console.error(
            "AOG DISTRIBUTION — REFRESH ERROR:",
            error
        );

    }

}


/* =========================================================
   BUILD DISTRIBUTION DATA
========================================================= */

function buildAOGDistributionData(
    records
){

    const aircraftTypes = {};
    const categories = {};

    const timeBuckets = {

        "< 2h":
            0,

        "2h – 4h":
            0,

        "4h – 8h":
            0,

        "8h – 12h":
            0,

        "12h – 24h":
            0,

        "> 24h":
            0

    };


    records.forEach(
        record => {

            const aircraftType =
                String(
                    record.aircraftType ||
                    record.type ||
                    "Unknown"
                )
                .trim();


            const category =
                String(
                    record.category ||
                    "Uncategorised"
                )
                .trim();


            aircraftTypes[
                aircraftType
            ] =
                (
                    aircraftTypes[
                        aircraftType
                    ] ||
                    0
                ) + 1;


            categories[
                category
            ] =
                (
                    categories[
                        category
                    ] ||
                    0
                ) + 1;


            const duration =
                getAOGAnalysisDuration(
                    record
                );


            if(
                !Number.isFinite(
                    duration
                )
            ){

                return;

            }


            const hours =
                duration / 60;


            if(
                hours < 2
            ){

                timeBuckets["< 2h"]++;

            }

            else if(
                hours < 4
            ){

                timeBuckets["2h – 4h"]++;

            }

            else if(
                hours < 8
            ){

                timeBuckets["4h – 8h"]++;

            }

            else if(
                hours < 12
            ){

                timeBuckets["8h – 12h"]++;

            }

            else if(
                hours <= 24
            ){

                timeBuckets["12h – 24h"]++;

            }

            else{

                timeBuckets["> 24h"]++;

            }

        }
    );


    return {

        aircraftTypes:
            sortAOGDistributionEntries(
                aircraftTypes
            ),

        categories:
            sortAOGDistributionEntries(
                categories
            ),

        timeBuckets:
            Object.entries(
                timeBuckets
            )
            .map(
                (
                    [
                        label,
                        count
                    ]
                ) => ({

                    label,
                    count

                })
            )

    };

}


/* =========================================================
   SORT DISTRIBUTION
========================================================= */

function sortAOGDistributionEntries(
    object
){

    return Object.entries(
        object
    )

    .map(
        (
            [
                label,
                count
            ]
        ) => ({

            label,
            count

        })
    )

    .sort(
        (
            a,
            b
        ) =>

            b.count -
            a.count

            ||

            a.label.localeCompare(
                b.label
            )

    );

}


/* =========================================================
   RENDER SUMMARY
========================================================= */

function renderAOGDistributionSummary(
    records
){

    const data =
        buildAOGDistributionData(
            records
        );


    renderAOGDistributionTable(
        "aogAircraftTypeAnalysis",
        data.aircraftTypes
    );


    renderAOGDistributionTable(
        "aogCategoryAnalysis",
        data.categories
    );


    renderAOGDistributionTable(
        "aogTimeDistributionAnalysis",
        data.timeBuckets
    );

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderAOGDistributionTable(
    elementId,
    entries
){

    const container =
        document.getElementById(
            elementId
        );


    if(
        !container
    ){

        return;

    }


    if(
        !entries.length
    ){

        container.innerHTML = `

            <div
                class="aog-analysis-empty"
            >

                No AOG recorded for
                the selected period.

            </div>

        `;

        return;

    }


    container.innerHTML =

        entries
            .map(
                item => `

                    <div
                        class="aog-analysis-row"
                    >

                        <div
                            class="
                                aog-analysis-row-name
                            "
                        >

                            ${escapeAOGHtml(
                                item.label
                            )}

                        </div>


                        <div
                            class="
                                aog-analysis-row-value
                            "
                        >

                            ${Number(
                                item.count
                            )}

                        </div>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   DAILY VIEW CHANGE
========================================================= */

function changeAOGDailyView(
    view
){

    CURRENT_AOG_DAILY_VIEW =
        [

            "TOTAL",
            "AIRCRAFT_TYPE",
            "CATEGORY",
            "TIME"

        ]
        .includes(
            view
        )

            ?

            view

            :

            "TOTAL";


    populateAOGDailySubFilter(
        getAOGDistributionRecords()
    );


    renderAOGDailyHistoryChart(
        getAOGDistributionRecords()
    );

}


/* =========================================================
   DAILY SUB SELECTION
========================================================= */

function changeAOGDailySubSelection(
    value
){

    CURRENT_AOG_DAILY_SUB_SELECTION =
        String(
            value ||
            ""
        );


    renderAOGDailyHistoryChart(
        getAOGDistributionRecords()
    );

}


function populateAOGDailySubFilter(records){

    const wrapper =
        document.getElementById(
            "aogDailySubFilter"
        );

    const label =
        document.getElementById(
            "aogDailySubFilterLabel"
        );

    const selector =
        document.getElementById(
            "aogDailySubSelector"
        );

    if(
        !wrapper ||
        !label ||
        !selector
    ){
        return;
    }


    let values = [];


    /* =====================================================
       AIRCRAFT TYPE
    ===================================================== */

    if(
        CURRENT_AOG_DAILY_VIEW ===
        "AIRCRAFT_TYPE"
    ){

        values =
            [
                ...new Set(

                    records
                        .map(
                            record => String(
                                record.aircraftType ||
                                record.type ||
                                ""
                            ).trim()
                        )
                        .filter(
                            Boolean
                        )

                )
            ]
            .sort(
                (
                    a,
                    b
                ) =>
                    a.localeCompare(
                        b
                    )
            );


        label.textContent =
            "Aircraft Type";

    }


    /* =====================================================
       CATEGORY
    ===================================================== */

    else if(
        CURRENT_AOG_DAILY_VIEW ===
        "CATEGORY"
    ){

        values =
            [
                ...new Set(

                    records
                        .map(
                            record => String(
                                record.category ||
                                ""
                            ).trim()
                        )
                        .filter(
                            Boolean
                        )

                )
            ]
            .sort(
                (
                    a,
                    b
                ) =>
                    a.localeCompare(
                        b
                    )
            );


        label.textContent =
            "Category";

    }


    /* =====================================================
       TIME DISTRIBUTION
    ===================================================== */

    else if(
        CURRENT_AOG_DAILY_VIEW ===
        "TIME"
    ){

        values = [

            "< 2h",
            "2h – 4h",
            "4h – 8h",
            "8h – 12h",
            "12h – 24h",
            "> 24h"

        ];


        label.textContent =
            "AOG Time";

    }


    /* =====================================================
       TOTAL
    ===================================================== */

    else{

        wrapper.style.display =
            "none";

        CURRENT_AOG_DAILY_SUB_SELECTION =
            "";

        return;

    }


    wrapper.style.display =
        values.length
            ? "flex"
            : "none";


    selector.innerHTML = "";


    /* =====================================================
       ALL OPTION
    ===================================================== */

    const allOption =
        document.createElement(
            "option"
        );

    allOption.value =
        "ALL";

    allOption.textContent =
        "All";

    selector.appendChild(
        allOption
    );


    /* =====================================================
       DYNAMIC OPTIONS
    ===================================================== */

    values.forEach(
        value => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                value;

            option.textContent =
                value;

            selector.appendChild(
                option
            );

        }
    );


    /*
       Preserve selection when possible.
    */

    if(
        CURRENT_AOG_DAILY_SUB_SELECTION ===
        "ALL"
    ){

        selector.value =
            "ALL";

    }

    else if(
        values.includes(
            CURRENT_AOG_DAILY_SUB_SELECTION
        )
    ){

        selector.value =
            CURRENT_AOG_DAILY_SUB_SELECTION;

    }

    else{

        CURRENT_AOG_DAILY_SUB_SELECTION =
            "ALL";

        selector.value =
            "ALL";

    }

}

/* =========================================================
   GET MONTH DAYS
========================================================= */

function getAOGDaysInSelectedMonth(){

    return new Date(

        CURRENT_AOG_ANALYSIS_YEAR,

        CURRENT_AOG_ANALYSIS_MONTH,
        0

    ).getDate();

}


/* =========================================================
   BUILD DAILY AOG SERIES
========================================================= */

function buildAOGDailySeries(
    records
){

    const days =
        getAOGDaysInSelectedMonth();


    /* =====================================================
       DAY LABELS
    ===================================================== */

    const labels =
        Array.from(
            {
                length:
                    days
            },
            (
                _,
                index
            ) =>
                String(
                    index + 1
                )
        );


    /* =====================================================
       INITIAL VALUES
    ===================================================== */

    const values =
        labels.map(
            () => 0
        );


    /* =====================================================
       PROCESS RECORDS
    ===================================================== */

    records.forEach(
        record => {

            const date =
                String(
                    record.startDate ||
                    ""
                )
                .trim();


            /*
                Expected format:

                YYYY-MM-DD

                Example:

                2026-08-15
            */

            const day =
                Number(
                    date.slice(
                        8,
                        10
                    )
                );


            /*
                Ignore invalid dates.
            */

            if(
                !day ||
                day < 1 ||
                day > days
            ){

                return;

            }


            const index =
                day - 1;


            /* =================================================
               TOTAL AOG
            ================================================= */

            if(
                CURRENT_AOG_DAILY_VIEW ===
                "TOTAL"
            ){

                values[index]++;

                return;

            }


            /* =================================================
               AIRCRAFT TYPE
            ================================================= */

            if(
                CURRENT_AOG_DAILY_VIEW ===
                "AIRCRAFT_TYPE"
            ){

                const aircraftType =
                    String(
                        record.aircraftType ||
                        record.type ||
                        ""
                    )
                    .trim();


                /*
                    ALL AIRCRAFT TYPES
                */

                if(
                    CURRENT_AOG_DAILY_SUB_SELECTION ===
                    "ALL"
                ){

                    values[index]++;

                    return;

                }


                /*
                    SPECIFIC AIRCRAFT TYPE
                */

                if(
                    aircraftType ===
                    CURRENT_AOG_DAILY_SUB_SELECTION
                ){

                    values[index]++;

                }


                return;

            }


            /* =================================================
               CATEGORY
            ================================================= */

            if(
                CURRENT_AOG_DAILY_VIEW ===
                "CATEGORY"
            ){

                const category =
                    String(
                        record.category ||
                        ""
                    )
                    .trim();


                /*
                    ALL CATEGORIES
                */

                if(
                    CURRENT_AOG_DAILY_SUB_SELECTION ===
                    "ALL"
                ){

                    values[index]++;

                    return;

                }


                /*
                    SPECIFIC CATEGORY
                */

                if(
                    category ===
                    CURRENT_AOG_DAILY_SUB_SELECTION
                ){

                    values[index]++;

                }


                return;

            }


            /* =================================================
               AOG TIME DISTRIBUTION
            ================================================= */

            if(
                CURRENT_AOG_DAILY_VIEW ===
                "TIME"
            ){

                const duration =
                    getAOGAnalysisDuration(
                        record
                    );


                /*
                    Cannot classify an AOG
                    without a valid duration.
                */

                if(
                    !Number.isFinite(
                        duration
                    )
                ){

                    return;

                }


                const hours =
                    duration /
                    60;


                const bucket =
                    getAOGTimeBucket(
                        hours
                    );


                /*
                    Selected time bucket.
                */

                if(
                    bucket ===
                    CURRENT_AOG_DAILY_SUB_SELECTION
                ){

                    values[index]++;

                }


                return;

            }

        }
    );


    return {

        labels:
            labels,

        values:
            values

    };

}

/* =========================================================
   TIME BUCKET HELPER
========================================================= */

function getAOGTimeBucket(
    hours
){

    if(
        hours < 2
    ){

        return "< 2h";

    }


    if(
        hours < 4
    ){

        return "2h – 4h";

    }


    if(
        hours < 8
    ){

        return "4h – 8h";

    }


    if(
        hours < 12
    ){

        return "8h – 12h";

    }


    if(
        hours <= 24
    ){

        return "12h – 24h";

    }


    return "> 24h";

}


/* =========================================================
   DAILY CHART
========================================================= */

function renderAOGDailyHistoryChart(
    records
){

    const canvas =
        document.getElementById(
            "aogDailyHistoryChart"
        );


    if(
        !canvas
    ){

        return;

    }


    if(
        AOG_DAILY_HISTORY_CHART
    ){

        AOG_DAILY_HISTORY_CHART.destroy();

        AOG_DAILY_HISTORY_CHART =
            null;

    }


    const series =
        buildAOGDailySeries(
            records
        );


    const subtitle =
        document.getElementById(
            "aogDailyChartSubtitle"
        );


    if(
        subtitle
    ){

        let text =
            "Monthly AOG occurrence evolution";


        if(
            CURRENT_AOG_ANALYSIS_SCOPE ===
            "BASE"
        ){

            text =
                `${CURRENT_AOG_ANALYSIS_BASE} · ${getAOGCurrentPeriodLabel()}`;

        }

        else{

            text =
                `All PT Bases · ${getAOGCurrentPeriodLabel()}`;

        }


        if(
            CURRENT_AOG_DAILY_VIEW ===
            "AIRCRAFT_TYPE"
        ){

            text +=
                ` · Aircraft Type: ${CURRENT_AOG_DAILY_SUB_SELECTION}`;

        }


        if(
            CURRENT_AOG_DAILY_VIEW ===
            "CATEGORY"
        ){

            text +=
                ` · Category: ${CURRENT_AOG_DAILY_SUB_SELECTION}`;

        }


        if(
            CURRENT_AOG_DAILY_VIEW ===
            "TIME"
        ){

            text +=
                ` · Time: ${CURRENT_AOG_DAILY_SUB_SELECTION}`;

        }


        subtitle.textContent =
            text;

    }


    AOG_DAILY_HISTORY_CHART =
        new Chart(
            canvas,
            {

                type:
                    "bar",


                data:{

                    labels:
                        series.labels,


                    datasets:[

                        {

                            label:
                                "AOG",

                            data:
                                series.values,

                            backgroundColor:
                                "#073590",

                            borderColor:
                                "#073590",

                            borderRadius:
                                9,

                            borderSkipped:
                                false,

                            categoryPercentage:
                                0.72,

                            barPercentage:
                                0.82,

                            maxBarThickness:
                                34

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

                        legend:{

                            display:
                                false

                        },


                        tooltip:{

                            callbacks:{

                                label:
                                    function(
                                        context
                                    ){

                                        return (
                                            " AOG: " +
                                            Number(
                                                context.raw ||
                                                0
                                            )
                                        );

                                    }

                            }

                        }

                    },


                    scales:{

                        x:{

                            title:{

                                display:
                                    true,

                                text:
                                    "Day"

                            },

                            grid:{

                                display:
                                    false

                            }

                        },


                        y:{

                            beginAtZero:
                                true,

                            ticks:{

                                precision:
                                    0

                            },

                            title:{

                                display:
                                    true,

                                text:
                                    "AOG Occurrences"

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   PERIOD CHANGE HOOK
========================================================= */

function refreshAOGSection2AfterPeriodChange(){

    if(
        document.getElementById(
            "aogDistributionSection"
        )
    ){

        refreshAOGDistributionAnalysis();

    }

}

/* =========================================================
   AOG SECTION 3
   RECURRING & IMPACT ANALYSIS
========================================================= */


let CURRENT_AOG_SECTION3_BASE = "";

let CURRENT_AOG_IMPACT_MATRIX_VIEW =
    "COUNT";


let AOG_SECTION3_CHARTS = {

    portugalCategory:
        null,

    baseCategory:
        null,

    portugalTime:
        null,

    baseTime:
        null,

    portugalAircraft:
        null,

    baseAircraft:
        null

};


/* =========================================================
   INITIALIZE SECTION 3
========================================================= */

function initializeAOGSection3(){

    const section =
        document.getElementById(
            "aogRecurringImpactSection"
        );


    if(
        !section
    ){

        return;

    }


    populateAOGSection3Bases();

    refreshAOGSection3();

}


/* =========================================================
   POPULATE BASE SELECTOR
========================================================= */

function populateAOGSection3Bases(){

    const selector =
        document.getElementById(
            "aogSection3Base"
        );


    if(
        !selector
    ){

        return;

    }


    selector.innerHTML = `

        <option value="">
            Select a base...
        </option>

    `;


    AOG_ANALYSIS_PT_BASES.forEach(
        base => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                base;


            option.textContent =
                base;


            selector.appendChild(
                option
            );

        }
    );


    /*
        Use first Portuguese base
        as the initial comparison.
    */

    CURRENT_AOG_SECTION3_BASE =
        AOG_ANALYSIS_PT_BASES[0] ||
        "";


    selector.value =
        CURRENT_AOG_SECTION3_BASE;

}


/* =========================================================
   CHANGE SECTION 3 BASE
========================================================= */

function changeAOGSection3Base(
    base
){

    const normalizedBase =
        String(
            base ||
            ""
        )
        .trim()
        .toUpperCase();


    if(
        !AOG_ANALYSIS_PT_BASES.includes(
            normalizedBase
        )
    ){

        return;

    }


    CURRENT_AOG_SECTION3_BASE =
        normalizedBase;


    refreshAOGSection3();

}


/* =========================================================
   CHANGE MATRIX VIEW
========================================================= */

function changeAOGImpactMatrixView(
    view
){

    const validViews = [

        "COUNT",
        "TOTAL_TIME",
        "AVERAGE_TIME"

    ];


    CURRENT_AOG_IMPACT_MATRIX_VIEW =
        validViews.includes(
            view
        )

            ?

            view

            :

            "COUNT";


    refreshAOGSection3();

}


/* =========================================================
   GET SECTION 3 RECORDS
========================================================= */

function getAOGSection3Records(){

    const records =
        Array.isArray(
            AOG_MANAGEMENT_RECORDS
        )

            ?

            AOG_MANAGEMENT_RECORDS

            :

            [];


    return records.filter(
        record => {

            const base =
                String(
                    record.base ||
                    ""
                )
                .trim()
                .toUpperCase();


            /*
                Portugal only.
            */

            if(
                !AOG_ANALYSIS_PT_BASES.includes(
                    base
                )
            ){

                return false;

            }


            /*
                Same monthly period
                used by Section 1 and 2.
            */

            const period =
                String(
                    record.startDate ||
                    ""
                )
                .slice(
                    0,
                    7
                );


            const selectedPeriod =
                getAOGAnalysisPeriodKey(

                    CURRENT_AOG_ANALYSIS_YEAR,

                    CURRENT_AOG_ANALYSIS_MONTH

                );


            return (
                period ===
                selectedPeriod
            );

        }
    );

}


/* =========================================================
   REFRESH SECTION 3
========================================================= */

async function refreshAOGSection3(){

    try{

        const section =
            document.getElementById(
                "aogRecurringImpactSection"
            );


        if(
            !section
        ){

            return;

        }


        /*
            Ensure latest Firebase data.
        */

        if(
            typeof loadAOGManagementRecords ===
            "function"
        ){

            await loadAOGManagementRecords();

        }


        const portugalRecords =
            getAOGSection3Records();


        const baseRecords =
            portugalRecords.filter(
                record => {

                    const base =
                        String(
                            record.base ||
                            ""
                        )
                        .trim()
                        .toUpperCase();


                    return (
                        base ===
                        CURRENT_AOG_SECTION3_BASE
                    );

                }
            );


        renderAOGRecurringAircraft(
            portugalRecords
        );


        renderAOGTopImpact(
            portugalRecords
        );


        renderAOGRecurringCategories(
            portugalRecords
        );


        renderAOGBaseImpact(
            portugalRecords
        );


        renderAOGImpactMatrix(
            portugalRecords
        );


        renderAOGDistributionComparison(
            portugalRecords,
            baseRecords
        );

    }

    catch(error){

        console.error(
            "AOG SECTION 3 — REFRESH ERROR:",
            error
        );

    }

}


/* =========================================================
   RECURRING AIRCRAFT
========================================================= */

function renderAOGRecurringAircraft(
    records
){

    const container =
        document.getElementById(
            "aogRecurringAircraftTable"
        );


    if(!container){

        return;

    }


    const aircraft = {};


    (records || []).forEach(
        record => {

            const registration =
                String(
                    record.aircraftRegister ||
                    record.aircraftRegistration ||
                    record.registration ||
                    record.reg ||
                    "Unknown"
                )
                .trim();


            if(
                !aircraft[
                    registration
                ]
            ){

                aircraft[
                    registration
                ] = {

                    count:
                        0,

                    totalTime:
                        0,

                    records:
                        []

                };

            }


            const duration =
                getAOGAnalysisDuration(
                    record
                );


            aircraft[
                registration
            ].count++;


            if(
                Number.isFinite(
                    duration
                )
            ){

                aircraft[
                    registration
                ].totalTime +=
                    duration;

            }


            aircraft[
                registration
            ].records.push(
                record
            );

        }
    );


    const aircraftEntries =
        Object.entries(
            aircraft
        );


    /*
        =====================================================
        NO DATA AT ALL
        =====================================================
    */

    if(
        !aircraftEntries.length
    ){

        renderAOGImpactEmpty(

            container,

            "No AOG aircraft records are available for the selected period."

        );

        return;

    }


    /*
        =====================================================
        RECURRING = MORE THAN ONE AOG
        =====================================================
    */

    const recurring =
        aircraftEntries
            .filter(
                (
                    [
                        ,
                        item
                    ]
                ) =>
                    item.count > 1
            )
            .sort(
                (
                    a,
                    b
                ) =>

                    b[1].count -
                    a[1].count

                    ||

                    b[1].totalTime -
                    a[1].totalTime

            );


    /*
        =====================================================
        ALL AIRCRAFT ONLY HAD ONE AOG
        =====================================================
    */

    if(
        !recurring.length
    ){

        renderAOGImpactEmpty(

            container,

            "All aircraft recorded only one AOG occurrence during the selected period."

        );

        return;

    }


    /*
        =====================================================
        BUILD TABLE
        =====================================================
    */

    const rows =
        recurring
            .map(
                (
                    [
                        registration,
                        item
                    ]
                ) => {

                    const firstRecord =
                        item.records[0] ||
                        {};


                    const type =
                        String(
                            firstRecord.aircraftType ||
                            firstRecord.type ||
                            "—"
                        )
                        .trim();


                    const average =
                        item.totalTime /
                        item.count;


                    return `

                        <tr>

                            <td>
                                ${escapeAOGHtml(
                                    registration
                                )}
                            </td>

                            <td
                                class="aog-impact-number"
                            >
                                ${item.count}
                            </td>

                            <td>
                                ${formatAOGDuration(
                                    item.totalTime
                                )}
                            </td>

                            <td>
                                ${formatAOGDuration(
                                    average
                                )}
                            </td>

                            <td>
                                ${escapeAOGHtml(
                                    type
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    container.innerHTML = `

        <table
            class="aog-impact-table"
        >

            <thead>

                <tr>

                    <th>
                        Aircraft
                    </th>

                    <th>
                        AOG
                    </th>

                    <th>
                        Total AOG Time
                    </th>

                    <th>
                        Average AOG Time
                    </th>

                    <th>
                        Aircraft Type
                    </th>

                </tr>

            </thead>

            <tbody>

                ${rows}

            </tbody>

        </table>

    `;

}

/* =========================================================
   TOP AOG IMPACT
========================================================= */

function renderAOGTopImpact(
    records
){

    const container =
        document.getElementById(
            "aogTopImpactTable"
        );


    if(
        !container
    ){

        return;

    }


    const ranked =
        records
            .map(
                record => ({

                    record,

                    duration:
                        getAOGAnalysisDuration(
                            record
                        )

                })
            )
            .filter(
                item =>
                    Number.isFinite(
                        item.duration
                    )
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    b.duration -
                    a.duration
            )
            .slice(
                0,
                10
            );


    if(
        !ranked.length
    ){

        renderAOGImpactEmpty(
            container,
            "No AOG duration data available for the selected period."
        );

        return;

    }


    const rows =
        ranked
            .map(
                item => {

                    const record =
                        item.record;


                    const registration =
                        String(
                            record.aircraftRegister ||
                            record.aircraftRegistration ||
                            record.registration ||
                            record.reg ||
                            "—"
                        )
                        .trim();


                    const type =
                        String(
                            record.aircraftType ||
                            record.type ||
                            "—"
                        )
                        .trim();


                    const base =
                        String(
                            record.base ||
                            "—"
                        )
                        .trim();


                    const category =
                        String(
                            record.category ||
                            "Uncategorised"
                        )
                        .trim();


                    return `

                        <tr>

                            <td>
                                ${escapeAOGHtml(
                                    registration
                                )}
                            </td>

                            <td>
                                ${escapeAOGHtml(
                                    base
                                )}
                            </td>

                            <td>
                                ${escapeAOGHtml(
                                    type
                                )}
                            </td>

                            <td>
                                ${escapeAOGHtml(
                                    category
                                )}
                            </td>

                            <td
                                class="aog-impact-highlight"
                            >
                                ${formatAOGDuration(
                                    item.duration
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    container.innerHTML = `

        <table
            class="aog-impact-table"
        >

            <thead>

                <tr>

                    <th>
                        Aircraft
                    </th>

                    <th>
                        Base
                    </th>

                    <th>
                        Aircraft Type
                    </th>

                    <th>
                        Category
                    </th>

                    <th>
                        AOG Time
                    </th>

                </tr>

            </thead>

            <tbody>

                ${rows}

            </tbody>

        </table>

    `;

}


/* =========================================================
   RECURRING CATEGORIES
========================================================= */

function renderAOGRecurringCategories(
    records
){

    const container =
        document.getElementById(
            "aogRecurringCategoryTable"
        );


    if(
        !container
    ){

        return;

    }


    const categories = {};


    records.forEach(
        record => {

            const category =
                String(
                    record.category ||
                    "Uncategorised"
                )
                .trim();


            if(
                !categories[
                    category
                ]
            ){

                categories[
                    category
                ] = {

                    count:
                        0,

                    totalTime:
                        0

                };

            }


            categories[
                category
            ].count++;


            const duration =
                getAOGAnalysisDuration(
                    record
                );


            if(
                Number.isFinite(
                    duration
                )
            ){

                categories[
                    category
                ].totalTime +=
                    duration;

            }

        }
    );


    const rowsData =
        Object.entries(
            categories
        )
        .sort(
            (
                a,
                b
            ) =>

                b[1].count -
                a[1].count

        );


    if(
        !rowsData.length
    ){

        renderAOGImpactEmpty(
            container,
            "No category data available for the selected period."
        );

        return;

    }


    const rows =
        rowsData
            .map(
                (
                    [
                        category,
                        item
                    ]
                ) => {

                    const average =
                        item.count
                            ? item.totalTime /
                              item.count
                            : 0;


                    return `

                        <tr>

                            <td>
                                ${escapeAOGHtml(
                                    category
                                )}
                            </td>

                            <td
                                class="aog-impact-number"
                            >
                                ${item.count}
                            </td>

                            <td>
                                ${formatAOGDuration(
                                    item.totalTime
                                )}
                            </td>

                            <td>
                                ${formatAOGDuration(
                                    average
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    container.innerHTML = `

        <table
            class="aog-impact-table"
        >

            <thead>

                <tr>

                    <th>
                        Category
                    </th>

                    <th>
                        AOG
                    </th>

                    <th>
                        Total AOG Time
                    </th>

                    <th>
                        Average AOG Time
                    </th>

                </tr>

            </thead>

            <tbody>

                ${rows}

            </tbody>

        </table>

    `;

}


/* =========================================================
   BASE IMPACT
========================================================= */

function renderAOGBaseImpact(
    records
){

    const container =
        document.getElementById(
            "aogBaseImpactTable"
        );


    if(
        !container
    ){

        return;

    }


    const bases = {};


    records.forEach(
        record => {

            const base =
                String(
                    record.base ||
                    "Unknown"
                )
                .trim()
                .toUpperCase();


            if(
                !bases[
                    base
                ]
            ){

                bases[
                    base
                ] = {

                    count:
                        0,

                    totalTime:
                        0

                };

            }


            bases[
                base
            ].count++;


            const duration =
                getAOGAnalysisDuration(
                    record
                );


            if(
                Number.isFinite(
                    duration
                )
            ){

                bases[
                    base
                ].totalTime +=
                    duration;

            }

        }
    );


    const rowsData =
        Object.entries(
            bases
        )
        .sort(
            (
                a,
                b
            ) =>
                b[1].count -
                a[1].count
        );


    if(
        !rowsData.length
    ){

        renderAOGImpactEmpty(
            container,
            "No base data available for the selected period."
        );

        return;

    }


    const rows =
        rowsData
            .map(
                (
                    [
                        base,
                        item
                    ]
                ) => {

                    const average =
                        item.count
                            ? item.totalTime /
                              item.count
                            : 0;


                    return `

                        <tr>

                            <td>
                                ${escapeAOGHtml(
                                    base
                                )}
                            </td>

                            <td
                                class="aog-impact-number"
                            >
                                ${item.count}
                            </td>

                            <td>
                                ${formatAOGDuration(
                                    item.totalTime
                                )}
                            </td>

                            <td>
                                ${formatAOGDuration(
                                    average
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    container.innerHTML = `

        <table
            class="aog-impact-table"
        >

            <thead>

                <tr>

                    <th>
                        Base
                    </th>

                    <th>
                        AOG
                    </th>

                    <th>
                        Total AOG Time
                    </th>

                    <th>
                        Average AOG Time
                    </th>

                </tr>

            </thead>

            <tbody>

                ${rows}

            </tbody>

        </table>

    `;

}


/* =========================================================
   IMPACT MATRIX
========================================================= */

function renderAOGImpactMatrix(
    records
){

    const container =
        document.getElementById(
            "aogImpactMatrixTable"
        );


    if(
        !container
    ){

        return;

    }


    const categories =
        [
            ...new Set(

                records
                    .map(
                        record =>
                            String(
                                record.category ||
                                "Uncategorised"
                            )
                            .trim()
                    )

            )
        ]
        .sort(
            (
                a,
                b
            ) =>
                a.localeCompare(
                    b
                )
        );


    if(
        !categories.length
    ){

        renderAOGImpactEmpty(
            container,
            "No category data available for the selected period."
        );

        return;

    }


    const matrix = {};


    AOG_ANALYSIS_PT_BASES.forEach(
        base => {

            matrix[
                base
            ] = {};


            categories.forEach(
                category => {

                    matrix[
                        base
                    ][
                        category
                    ] = {

                        count:
                            0,

                        totalTime:
                            0

                    };

                }
            );

        }
    );


    records.forEach(
        record => {

            const base =
                String(
                    record.base ||
                    ""
                )
                .trim()
                .toUpperCase();


            const category =
                String(
                    record.category ||
                    "Uncategorised"
                )
                .trim();


            if(
                !matrix[
                    base
                ] ||
                !matrix[
                    base
                ][
                    category
                ]
            ){

                return;

            }


            matrix[
                base
            ][
                category
            ].count++;


            const duration =
                getAOGAnalysisDuration(
                    record
                );


            if(
                Number.isFinite(
                    duration
                )
            ){

                matrix[
                    base
                ][
                    category
                ].totalTime +=
                    duration;

            }

        }
    );


    const header =
        categories
            .map(
                category => `

                    <th>
                        ${escapeAOGHtml(
                            category
                        )}
                    </th>

                `
            )
            .join("");


    const rows =
        AOG_ANALYSIS_PT_BASES
            .map(
                base => {

                    const cells =
                        categories
                            .map(
                                category => {

                                    const item =
                                        matrix[
                                            base
                                        ][
                                            category
                                        ];


                                    let value =
                                        item.count;


                                    if(
                                        CURRENT_AOG_IMPACT_MATRIX_VIEW ===
                                        "TOTAL_TIME"
                                    ){

                                        value =
                                            formatAOGDuration(
                                                item.totalTime
                                            );

                                    }


                                    else if(
                                        CURRENT_AOG_IMPACT_MATRIX_VIEW ===
                                        "AVERAGE_TIME"
                                    ){

                                        value =
                                            formatAOGDuration(

                                                item.count
                                                    ? item.totalTime /
                                                      item.count
                                                    : 0

                                            );

                                    }


                                    return `

                                        <td
                                            class="
                                                aog-matrix-value
                                            "
                                        >
                                            ${value}
                                        </td>

                                    `;

                                }
                            )
                            .join("");


                    return `

                        <tr>

                            <td>
                                ${escapeAOGHtml(
                                    base
                                )}
                            </td>

                            ${cells}

                        </tr>

                    `;

                }
            )
            .join("");


    container.innerHTML = `

        <table
            class="aog-impact-matrix"
        >

            <thead>

                <tr>

                    <th>
                        Base
                    </th>

                    ${header}

                </tr>

            </thead>

            <tbody>

                ${rows}

            </tbody>

        </table>

    `;

}


/* =========================================================
   DISTRIBUTION COMPARISON
========================================================= */

function renderAOGDistributionComparison(
    portugalRecords,
    baseRecords
){

    renderAOGPieChart(
        "aogPortugalCategoryPie",
        "portugalCategory",
        buildAOGCategoryDistribution(
            portugalRecords
        )
    );


    renderAOGPieChart(
        "aogBaseCategoryPie",
        "baseCategory",
        buildAOGCategoryDistribution(
            baseRecords
        )
    );


    renderAOGPieChart(
        "aogPortugalTimePie",
        "portugalTime",
        buildAOGTimeDistribution(
            portugalRecords
        )
    );


    renderAOGPieChart(
        "aogBaseTimePie",
        "baseTime",
        buildAOGTimeDistribution(
            baseRecords
        )
    );


    renderAOGPieChart(
        "aogPortugalAircraftPie",
        "portugalAircraft",
        buildAOGAircraftDistribution(
            portugalRecords
        )
    );


    renderAOGPieChart(
        "aogBaseAircraftPie",
        "baseAircraft",
        buildAOGAircraftDistribution(
            baseRecords
        )
    );


    const base =
        CURRENT_AOG_SECTION3_BASE ||
        "SELECTED BASE";


    const titleIds = [

        "aogSelectedBaseCategoryTitle",
        "aogSelectedBaseTimeTitle",
        "aogSelectedBaseAircraftTitle"

    ];


    titleIds.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if(
                element
            ){

                element.textContent =
                    base;

            }

        }
    );

}


/* =========================================================
   CATEGORY DISTRIBUTION
========================================================= */

function buildAOGCategoryDistribution(
    records
){

    const counts = {};


    records.forEach(
        record => {

            const category =
                String(
                    record.category ||
                    "Uncategorised"
                )
                .trim();


            counts[
                category
            ] =
                (
                    counts[
                        category
                    ] ||
                    0
                ) + 1;

        }
    );


    return Object.entries(
        counts
    )
    .map(
        (
            [
                label,
                value
            ]
        ) => ({

            label,
            value

        })
    )
    .sort(
        (
            a,
            b
        ) =>
            b.value -
            a.value
    );

}


/* =========================================================
   AIRCRAFT DISTRIBUTION
========================================================= */

function buildAOGAircraftDistribution(
    records
){

    const counts = {};


    records.forEach(
        record => {

            const type =
                String(
                    record.aircraftType ||
                    record.type ||
                    "Unknown"
                )
                .trim();


            counts[
                type
            ] =
                (
                    counts[
                        type
                    ] ||
                    0
                ) + 1;

        }
    );


    return Object.entries(
        counts
    )
    .map(
        (
            [
                label,
                value
            ]
        ) => ({

            label,
            value

        })
    )
    .sort(
        (
            a,
            b
        ) =>
            b.value -
            a.value
    );

}


/* =========================================================
   TIME DISTRIBUTION
========================================================= */

function buildAOGTimeDistribution(
    records
){

    const buckets = {

        "< 2h":
            0,

        "2h – 4h":
            0,

        "4h – 8h":
            0,

        "8h – 12h":
            0,

        "12h – 24h":
            0,

        "> 24h":
            0

    };


    records.forEach(
        record => {

            const duration =
                getAOGAnalysisDuration(
                    record
                );


            if(
                !Number.isFinite(
                    duration
                )
            ){

                return;

            }


            const bucket =
                getAOGTimeBucket(
                    duration /
                    60
                );


            buckets[
                bucket
            ]++;

        }
    );


    return Object.entries(
        buckets
    )
    .map(
        (
            [
                label,
                value
            ]
        ) => ({

            label,
            value

        })
    )
    .filter(
        item =>
            item.value > 0
    );

}



/* =========================================================
   AOG — COLOURFUL DISTRIBUTION PIE
========================================================= */

function getAOGDistributionColor(
    label
){

    const palette = [

        "#0b3b91",
        "#f2c500",
        "#1d70b8",
        "#ef7d00",
        "#2ca58d",
        "#8e44ad",
        "#e74c3c",
        "#16a085",
        "#d4ac0d",
        "#34495e"

    ];


    const text =
        String(
            label ||
            ""
        );


    let hash =
        0;


    for(
        let i = 0;
        i < text.length;
        i++
    ){

        hash =
            (
                (
                    hash << 5
                ) -
                hash +
                text.charCodeAt(i)
            )
            |
            0;

    }


    return palette[
        Math.abs(hash) %
        palette.length
    ];

}


/* =========================================================
   PIE CHART
========================================================= */

function renderAOGPieChart(
    canvasId,
    chartKey,
    data
){

    if(
        typeof Chart ===
        "undefined"
    ){

        return;

    }


    const canvas =
        document.getElementById(
            canvasId
        );


    if(!canvas){

        return;

    }


    if(
        window.activeCharts &&
        window.activeCharts[
            canvasId
        ]
    ){

        try{

            window.activeCharts[
                canvasId
            ].destroy();

        }
        catch(error){

            console.warn(
                "AOG pie cleanup:",
                error
            );

        }

    }


    if(
        !window.activeCharts
    ){

        window.activeCharts = {};

    }


    const safeData =
        Array.isArray(data)
            ? data.filter(
                item =>
                    Number(
                        item?.value
                    ) > 0
            )
            : [];


    /*
        -----------------------------------------------------
        NO DATA
        -----------------------------------------------------
    */

    if(
        !safeData.length
    ){

        const context =
            canvas.getContext(
                "2d"
            );


        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        return;

    }


    const labels =
        safeData.map(
            item =>
                item.label
        );


    const values =
        safeData.map(
            item =>
                Number(
                    item.value
                )
        );


    const colors =
        labels.map(
            label =>
                getAOGDistributionColor(
                    label
                )
        );


    window.activeCharts[
        canvasId
    ] =

        new Chart(

            canvas.getContext(
                "2d"
            ),

            {

                type:
                    "doughnut",


                data:{

                    labels:
                        labels,

                    datasets:[

                        {

                            data:
                                values,

                            backgroundColor:
                                colors,

                            borderColor:
                                "#ffffff",

                            borderWidth:
                                3,

                            hoverOffset:
                                8

                        }

                    ]

                },


                plugins:
                    typeof ChartDataLabels !==
                    "undefined"

                        ?

                        [ChartDataLabels]

                        :

                        [],


                options:{

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    cutout:
                        "54%",


                    layout:{

                        padding:
                            12

                    },


                    plugins:{

                        legend:{

                            display:
                                true,

                            position:
                                "bottom",

                            labels:{

                                color:
                                    "#17365f",

                                font:{

                                    size:
                                        11,

                                    weight:
                                        "700"

                                },

                                usePointStyle:
                                    true,

                                pointStyle:
                                    "circle",

                                boxWidth:
                                    9,

                                padding:
                                    14

                            }

                        },


                        datalabels:{

                            display:
                                true,

                            color:
                                "#ffffff",

                            font:{

                                size:
                                    12,

                                weight:
                                    "900"

                            },

                            formatter:
                                function(
                                    value,
                                    context
                                ){

                                    const total =
                                        context
                                            .dataset
                                            .data
                                            .reduce(
                                                (
                                                    sum,
                                                    item
                                                ) =>
                                                    sum +
                                                    Number(
                                                        item ||
                                                        0
                                                    ),
                                                0
                                            );


                                    if(
                                        !total ||
                                        !value
                                    ){

                                        return "";

                                    }


                                    return (

                                        (
                                            Number(value) /
                                            total
                                        ) *
                                        100

                                    )
                                    .toFixed(
                                        1
                                    )
                                    +
                                    "%";

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
                                    function(
                                        context
                                    ){

                                        const total =
                                            context
                                                .dataset
                                                .data
                                                .reduce(
                                                    (
                                                        sum,
                                                        value
                                                    ) =>
                                                        sum +
                                                        Number(
                                                            value ||
                                                            0
                                                        ),
                                                    0
                                                );


                                        const value =
                                            Number(
                                                context.raw ||
                                                0
                                            );


                                        const percentage =
                                            total > 0

                                                ?

                                                (
                                                    value /
                                                    total
                                                )
                                                *
                                                100

                                                :

                                                0;


                                        return (

                                            `${context.label}: ${value} ` +
                                            `(${percentage.toFixed(1)}%)`

                                        );

                                    }

                            }

                        }

                    }

                }

            }

        );

}

/* =========================================================
   EMPTY STATE
========================================================= */

function renderAOGImpactEmpty(
    container,
    message
){

    container.innerHTML = `

        <div
            class="aog-impact-empty"
        >

            ${escapeAOGHtml(
                message
            )}

        </div>

    `;

}


/* =========================================================
   PERIOD CHANGE HOOK
========================================================= */

function refreshAOGSection3AfterPeriodChange(){

    if(
        document.getElementById(
            "aogRecurringImpactSection"
        )
    ){

        refreshAOGSection3();

    }

}

// =========================================================
// AOG — TREND ANALYSIS
// =========================================================

let AOG_TREND_STATE = {

    rawData: null,

    periods: [],

    chart: null

};


// =========================================================
// NORMALIZE NUMBER
// =========================================================

function aogTrendNumber(value){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return null;

    }


    if(
        typeof value === "number" &&
        Number.isFinite(value)
    ){

        return value;

    }


    const number =
        Number(
            String(value)
                .replace(
                    ",",
                    "."
                )
                .replace(
                    /[^0-9.-]/g,
                    ""
                )
        );


    return Number.isFinite(number)
        ? number
        : null;

}


// =========================================================
// MONTH LABEL
// =========================================================

function aogTrendMonthLabel(
    key
){

    if(!key){

        return "";

    }


    const value =
        String(key);


    let match =
        value.match(
            /^(\d{4})[-/](\d{1,2})$/
        );


    if(match){

        const year =
            Number(match[1]);

        const month =
            Number(match[2]);

        const date =
            new Date(
                year,
                month - 1,
                1
            );

        return date.toLocaleDateString(
            "en-GB",
            {
                month:"short",
                year:"2-digit"
            }
        );

    }


    return value;

}


// =========================================================
// MONTH SORT VALUE
// =========================================================

function aogTrendPeriodSortValue(
    key
){

    const value =
        String(key);


    let match =
        value.match(
            /^(\d{4})[-/](\d{1,2})$/
        );


    if(match){

        return (
            Number(match[1]) *
            100 +
            Number(match[2])
        );

    }


    return 0;

}


// =========================================================
// EXTRACT MONTHS
// =========================================================
//
// Aceita:
// 2026-01
// 2026/01
// January 2026
// 01/2026
// etc.
//
// =========================================================

function aogTrendIsPeriodKey(
    key
){

    const value =
        String(key)
            .trim();


    return (

        /^\d{4}[-/]\d{1,2}$/
            .test(value)

        ||

        /^\d{1,2}[-/]\d{4}$/
            .test(value)

    );

}


// =========================================================
// FIND MONTHLY OBJECT
// =========================================================

function aogTrendExtractMonthlyData(
    source
){

    const result = [];


    if(
        !source ||
        typeof source !== "object"
    ){

        return result;

    }


    Object.keys(source)
        .forEach(
            key => {

                if(
                    !aogTrendIsPeriodKey(
                        key
                    )
                ){

                    return;

                }


                result.push({

                    key:key,

                    label:
                        aogTrendMonthLabel(
                            key
                        ),

                    data:
                        source[key]

                });

            }
        );


    result.sort(
        (
            a,
            b
        ) =>
            aogTrendPeriodSortValue(
                a.key
            ) -
            aogTrendPeriodSortValue(
                b.key
            )
    );


    return result;

}


// =========================================================
// FIND COUNT VALUE
// =========================================================

function aogTrendGetCount(
    data
){

    if(
        data === null ||
        data === undefined
    ){

        return null;

    }


    const candidates = [

        data.totalAOG,

        data.totalAog,

        data.total,

        data.count,

        data.aog,

        data.aircraftOnGround,

        data.aircraftOnGroundCount,

        data.totalAircraftOnGround

    ];


    for(
        const candidate of candidates
    ){

        const value =
            aogTrendNumber(
                candidate
            );


        if(
            value !== null
        ){

            return value;

        }

    }


    /*
        Some existing AOG records may contain
        an array of occurrences.
    */

    const occurrenceArrays = [

        data.records,

        data.occurrences,

        data.events,

        data.aogRecords,

        data.aircraft

    ];


    for(
        const array of occurrenceArrays
    ){

        if(
            Array.isArray(array)
        ){

            return array.length;

        }

    }


    return null;

}


// =========================================================
// FIND AVERAGE TIME
// =========================================================

function aogTrendGetAverageTime(
    data
){

    if(
        !data ||
        typeof data !== "object"
    ){

        return null;

    }


    const candidates = [

        data.averageAOGTime,

        data.averageAogTime,

        data.avgAOGTime,

        data.averageTime,

        data.avgTime,

        data.meanAOGTime

    ];


    for(
        const candidate of candidates
    ){

        const value =
            aogTrendNumber(
                candidate
            );


        if(
            value !== null
        ){

            return value;

        }

    }


    return null;

}


// =========================================================
// FIND TOTAL TIME
// =========================================================

function aogTrendGetTotalTime(
    data
){

    if(
        !data ||
        typeof data !== "object"
    ){

        return null;

    }


    const candidates = [

        data.totalAOGTime,

        data.totalAogTime,

        data.totalTime,

        data.aogTotalTime,

        data.duration

    ];


    for(
        const candidate of candidates
    ){

        const value =
            aogTrendNumber(
                candidate
            );


        if(
            value !== null
        ){

            return value;

        }

    }


    return null;

}


// =========================================================
// GET METRIC
// =========================================================

function aogTrendGetMetricValue(
    data,
    metric
){

    if(
        metric === "averageTime"
    ){

        return aogTrendGetAverageTime(
            data
        );

    }


    if(
        metric === "totalTime"
    ){

        return aogTrendGetTotalTime(
            data
        );

    }


    return aogTrendGetCount(
        data
    );

}


// =========================================================
// BASE NAME
// =========================================================

function aogTrendGetBaseName(
    data
){

    if(
        !data ||
        typeof data !== "object"
    ){

        return null;

    }


    const candidates = [

        data.base,

        data.baseName,

        data.station,

        data.location,

        data.airport

    ];


    for(
        const candidate of candidates
    ){

        if(
            candidate !== null &&
            candidate !== undefined &&
            String(candidate).trim()
        ){

            return String(candidate)
                .trim()
                .toUpperCase();

        }

    }


    return null;

}


// =========================================================
// GET BASE DATA
// =========================================================

function aogTrendFindBaseData(
    data,
    base
){

    if(
        !data ||
        typeof data !== "object"
    ){

        return null;

    }


    const target =
        String(base || "")
            .trim()
            .toUpperCase();


    const containers = [

        data.bases,

        data.baseStats,

        data.byBase,

        data.baseData,

        data.locations

    ];


    for(
        const container of containers
    ){

        if(
            !container ||
            typeof container !== "object"
        ){

            continue;

        }


        const direct =
            container[target];


        if(direct){

            return direct;

        }


        const key =
            Object.keys(
                container
            )
            .find(
                item =>
                    String(item)
                        .trim()
                        .toUpperCase()
                    ===
                    target
            );


        if(key){

            return container[key];

        }

    }


    return null;

}




// =========================================================
// AOG TREND — POPULATE BASE SELECTOR
// =========================================================

function populateAOGTrendBases(){

    const select =
        document.getElementById(
            "aogTrendBase"
        );


    if(!select){

        return;

    }


    const current =
        String(
            select.value ||
            ""
        )
        .trim()
        .toUpperCase();


    /*
     * FIXED PORTUGUESE NETWORK
     */

    const bases = [

        "OPO",
        "LIS",
        "FAO",
        "FNC"

    ];


    select.innerHTML = `

        <option
            value=""
        >

            Select base...

        </option>

        ${
            bases
                .map(
                    base => `

                        <option
                            value="${base}"
                        >

                            ${base}

                        </option>

                    `
                )
                .join("")
        }

    `;


    if(
        bases.includes(
            current
        )
    ){

        select.value =
            current;

    }

}

// =========================================================
// AOG TREND — COLLECT PORTUGUESE BASES
// =========================================================

function aogTrendCollectBases(){

    /*
     * The AOG Trend is intentionally restricted
     * to the Portuguese network.
     *
     * This prevents Firebase metadata / future
     * locations from leaking into the Trend selector.
     */

    return [

        "OPO",
        "LIS",
        "FAO",
        "FNC"

    ];

}

// =========================================================
// AOG TREND — CONNECT CONTROLS
// =========================================================

function initializeAOGTrendControls(){

    const period =
        document.getElementById(
            "aogTrendPeriod"
        );


    const metric =
        document.getElementById(
            "aogTrendMetric"
        );


    const compare =
        document.getElementById(
            "aogTrendCompare"
        );


    const base =
        document.getElementById(
            "aogTrendBase"
        );


    /*
        -----------------------------------------------------
        PERIOD
        -----------------------------------------------------
    */

    if(
        period &&
        !period.dataset.aogBound
    ){

        period.addEventListener(
            "change",
            async function(){

                await updateAOGTrendAnalysis();

            }
        );


        period.dataset.aogBound =
            "true";

    }


    /*
        -----------------------------------------------------
        METRIC
        -----------------------------------------------------
    */

    if(
        metric &&
        !metric.dataset.aogBound
    ){

        metric.addEventListener(
            "change",
            async function(){

                await updateAOGTrendAnalysis();

            }
        );


        metric.dataset.aogBound =
            "true";

    }


    /*
        -----------------------------------------------------
        COMPARE
        -----------------------------------------------------
    */

    if(
        compare &&
        !compare.dataset.aogBound
    ){

        compare.addEventListener(
            "change",
            async function(){

                const baseControl =
                    document.getElementById(
                        "aogTrendBaseControl"
                    );


                if(
                    baseControl
                ){

                    baseControl.style.display =

                        this.value === "base"

                            ?

                            ""

                            :

                            "none";

                }


                await updateAOGTrendAnalysis();

            }
        );


        compare.dataset.aogBound =
            "true";

    }


    /*
        -----------------------------------------------------
        BASE
        -----------------------------------------------------
    */

    if(
        base &&
        !base.dataset.aogBound
    ){

        base.addEventListener(
            "change",
            async function(){

                await updateAOGTrendAnalysis();

            }
        );


        base.dataset.aogBound =
            "true";

    }

}

// =========================================================
// GET PERIODS FROM EXISTING AOG STATE
// =========================================================

function aogTrendFindSource(){

    /*
        We deliberately try the existing AOG
        globals first.

        This avoids creating a second Firebase
        data model just for the chart.
    */

    const candidates = [

        window.AOG_DATA,

        window.aogData,

        window.AOGData,

        window.currentAOGData,

        window.aogDashboardData,

        window.AOG_DASHBOARD_DATA,

        window.aogDataCache,

        window.AOG_CACHE

    ];


    for(
        const candidate of candidates
    ){

        if(
            candidate &&
            typeof candidate === "object"
        ){

            const monthly =
                aogTrendExtractMonthlyData(
                    candidate
                );


            if(
                monthly.length
            ){

                return {

                    source:
                        candidate,

                    periods:
                        monthly

                };

            }

        }

    }


    /*
        If the AOG module already exposes a
        Firebase-loaded period collection,
        try common structures.
    */

    const stateCandidates = [

        window.CURRENT_AOG_REPORT,

        window.CURRENT_AOG_DATA,

        window.AOG_REPORT,

        window.AOG_STATE

    ];


    for(
        const candidate of stateCandidates
    ){

        if(
            candidate &&
            typeof candidate === "object"
        ){

            const monthly =
                aogTrendExtractMonthlyData(
                    candidate
                );


            if(
                monthly.length
            ){

                return {

                    source:
                        candidate,

                    periods:
                        monthly

                };

            }

        }

    }


    return {

        source:null,

        periods:[]

    };

}


// =========================================================
// AOG TREND — LOAD REAL RECORD DATA
// =========================================================

async function loadAOGTrendData(){

    try{

        /*
            -------------------------------------------------
            FIREBASE CHECK
            -------------------------------------------------
        */

        if(
            !window.database ||
            !window.firebaseRef ||
            !window.firebaseGet
        ){

            console.error(
                "AOG TREND — Firebase is not available."
            );

            return [];

        }


        /*
            -------------------------------------------------
            OFFICIAL AOG ROOT
            -------------------------------------------------

            dashboardData/AOG
                YYYY-MM
                    records
                        AOG-ID
        */

        const snapshot =
            await window.firebaseGet(

                window.firebaseRef(

                    window.database,

                    "dashboardData/AOG"

                )

            );


        if(
            !snapshot ||
            !snapshot.exists()
        ){

            AOG_TREND_STATE.rawData =
                {};

            AOG_TREND_STATE.periods =
                [];

            return [];

        }


        const root =
            snapshot.val() ||
            {};


        const periods = [];


        /*
            -------------------------------------------------
            READ EVERY MONTH
            -------------------------------------------------
        */

        Object.entries(
            root
        )
        .forEach(
            (
                [
                    periodKey,
                    periodData
                ]
            ) => {

                if(
                    !/^\d{4}-\d{2}$/.test(
                        String(
                            periodKey
                        )
                    )
                ){

                    return;

                }


                if(
                    !periodData ||
                    typeof periodData !==
                    "object"
                ){

                    return;

                }


                const recordsObject =
                    periodData.records ||
                    {};


                const records =
                    Object.values(
                        recordsObject
                    )
                    .filter(
                        record =>
                            record &&
                            typeof record ===
                            "object"
                    );


                /*
                    -------------------------------------------------
                    CALCULATE MONTH METRICS
                    -------------------------------------------------
                */

                let totalTime =
                    0;


                let validTimeCount =
                    0;


                const bases = {};


                records.forEach(
                    record => {

                        /*
                            AOG duration
                        */

                        const duration =
                            Number(
                                record.durationMinutes
                            );


                        if(
                            Number.isFinite(
                                duration
                            )
                        ){

                            totalTime +=
                                duration;

                            validTimeCount++;

                        }


                        /*
                            BASE
                        */

                        const base =
                            String(
                                record.base ||
                                "UNKNOWN"
                            )
                            .trim()
                            .toUpperCase();


                        if(
                            !bases[
                                base
                            ]
                        ){

                            bases[
                                base
                            ] = {

                                records:
                                    [],

                                count:
                                    0,

                                totalTime:
                                    0

                            };

                        }


                        bases[
                            base
                        ].records.push(
                            record
                        );


                        bases[
                            base
                        ].count++;


                        if(
                            Number.isFinite(
                                duration
                            )
                        ){

                            bases[
                                base
                            ].totalTime +=
                                duration;

                        }

                    }
                );


                periods.push({

                    key:
                        periodKey,

                    label:
                        aogTrendMonthLabel(
                            periodKey
                        ),

                    data:{

                        records:
                            records,

                        totalAOG:
                            records.length,

                        totalAOGTime:
                            totalTime,

                        averageAOGTime:
                            validTimeCount
                                ?

                                totalTime /
                                validTimeCount

                                :

                                null,

                        bases:
                            bases

                    }

                });

            }
        );


        /*
            -------------------------------------------------
            SORT CHRONOLOGICALLY
            -------------------------------------------------
        */

        periods.sort(
            (
                a,
                b
            ) =>

                aogTrendPeriodSortValue(
                    a.key
                )
                -
                aogTrendPeriodSortValue(
                    b.key
                )
        );


        /*
            -------------------------------------------------
            SAVE STATE
            -------------------------------------------------
        */

        AOG_TREND_STATE.rawData =
            root;


        AOG_TREND_STATE.periods =
            periods;


        /*
            -------------------------------------------------
            REFRESH BASE SELECTOR
            -------------------------------------------------
        */

        populateAOGTrendBases();


        console.log(
            "AOG TREND — REAL MONTHLY DATA:",
            periods
        );


        return periods;

    }

    catch(error){

        console.error(
            "AOG TREND — LOAD ERROR:",
            error
        );


        AOG_TREND_STATE.rawData =
            {};

        AOG_TREND_STATE.periods =
            [];


        return [];

    }

}

// =========================================================
// AOG TREND — CALCULATE LINEAR REGRESSION
// =========================================================

function calculateAOGTrendLine(
    values
){

    const safeValues =
        Array.isArray(
            values
        )
            ? values
            : [];


    const valid =
        safeValues
            .map(
                (
                    value,
                    index
                ) => ({

                    x:
                        index,

                    y:
                        Number(
                            value
                        )

                })
            )
            .filter(
                point =>
                    Number.isFinite(
                        point.y
                    )
            );


    if(
        !valid.length
    ){

        return [];

    }


    /*
        One available month:
        horizontal baseline.
    */

    if(
        valid.length === 1
    ){

        return safeValues.map(
            () =>
                valid[0].y
        );

    }


    const n =
        valid.length;


    const sumX =
        valid.reduce(
            (
                sum,
                point
            ) =>
                sum +
                point.x,
            0
        );


    const sumY =
        valid.reduce(
            (
                sum,
                point
            ) =>
                sum +
                point.y,
            0
        );


    const sumXY =
        valid.reduce(
            (
                sum,
                point
            ) =>
                sum +
                (
                    point.x *
                    point.y
                ),
            0
        );


    const sumXX =
        valid.reduce(
            (
                sum,
                point
            ) =>
                sum +
                (
                    point.x *
                    point.x
                ),
            0
        );


    const denominator =
        (
            n *
            sumXX
        ) -
        (
            sumX *
            sumX
        );


    if(
        denominator === 0
    ){

        const average =
            sumY /
            n;


        return safeValues.map(
            () =>
                average
        );

    }


    const slope =
        (
            (
                n *
                sumXY
            ) -
            (
                sumX *
                sumY
            )
        )
        /
        denominator;


    const intercept =
        (
            sumY -
            (
                slope *
                sumX
            )
        )
        /
        n;


    return safeValues.map(
        (
            _value,
            index
        ) =>
            (
                slope *
                index
            ) +
            intercept
    );

}


// =========================================================
// AOG TREND — DRAW CHART
// =========================================================

function drawAOGTrendChart(
    periods,
    datasets,
    metric
){

    if(
        typeof Chart ===
        "undefined"
    ){

        console.error(
            "AOG TREND — Chart.js unavailable."
        );

        return;

    }


    const canvas =
        document.getElementById(
            "aogTrendChart"
        );


    if(!canvas){

        return;

    }


    /*
     * =====================================================
     * DESTROY PREVIOUS CHART
     * =====================================================
     */

    if(
        window.activeCharts &&
        window.activeCharts.aogTrendChart
    ){

        try{

            window.activeCharts
                .aogTrendChart
                .destroy();

        }
        catch(error){

            console.warn(
                "AOG TREND — chart destroy:",
                error
            );

        }

    }


    if(
        !window.activeCharts
    ){

        window.activeCharts = {};

    }


    /*
     * =====================================================
     * COLLECT ALL NUMERIC VALUES
     * =====================================================
     *
     * Portugal
     * Bases
     * Calculated Trend
     *
     * Everything contributes to the scale.
     *
     */

    const allValues = [];


    (
        Array.isArray(
            datasets
        )
            ?
            datasets
            :
            []
    )
    .forEach(
        dataset => {

            (
                Array.isArray(
                    dataset.data
                )
                    ?
                    dataset.data
                    :
                    []
            )
            .forEach(
                value => {

                    const number =
                        Number(
                            value
                        );


                    if(
                        Number.isFinite(
                            number
                        )
                    ){

                        allValues.push(
                            number
                        );

                    }

                }
            );

        }
    );


    /*
     * =====================================================
     * DYNAMIC Y SCALE
     * =====================================================
     */

    const highest =
        allValues.length
            ?
                Math.max(
                    ...allValues
                )
            :
                0;


    let chartMax;


    if(
        highest <= 0
    ){

        chartMax =
            1;

    }

    else if(
        highest <= 1
    ){

        /*
         * Prevent a 0 → 1 graph from looking glued
         * to the ceiling.
         */

        chartMax =
            2;

    }

    else{

        /*
         * 18% breathing room.
         */

        const padded =
            highest *
            1.18;


        /*
         * For integer/count metrics, round to a
         * useful integer scale.
         */

        if(
            metric === "count"
        ){

            chartMax =
                Math.max(
                    2,
                    Math.ceil(
                        padded
                    )
                );

        }
        else{

            chartMax =
                Math.max(
                    1,
                    Number(
                        padded.toFixed(
                            1
                        )
                    )
                );

        }

    }


    /*
     * =====================================================
     * BUILD CHART
     * =====================================================
     */

    window.activeCharts
        .aogTrendChart =

        new Chart(

            canvas.getContext(
                "2d"
            ),

            {

                type:
                    "line",


                data:{

                    labels:
                        (
                            Array.isArray(
                                periods
                            )
                                ?
                                periods
                                :
                                []
                        )
                        .map(
                            period =>
                                period.label
                        ),


                    datasets:
                        datasets

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


                    animation:{

                        duration:
                            450,

                        easing:
                            "easeOutQuart"

                    },


                    plugins:{

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

                                color:
                                    "#082d70",

                                font:{

                                    size:
                                        11,

                                    weight:
                                        "800"

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

                            borderColor:
                                "#f5c400",

                            borderWidth:
                                1,

                            padding:
                                12,

                            cornerRadius:
                                9,


                            callbacks:{

                                label:
                                    function(
                                        context
                                    ){

                                        const dataset =
                                            context.dataset;


                                        const value =
                                            Number(
                                                context.raw
                                            );


                                        let label =

                                            dataset.label +
                                            ": " +
                                            aogTrendFormatValue(
                                                value,
                                                metric
                                            );


                                        /*
                                         * Portugal is the reference.
                                         */

                                        if(
                                            dataset.role ===
                                            "base"
                                        ){

                                            const portugal =
                                                datasets.find(
                                                    item =>
                                                        item.id ===
                                                        "PORTUGAL"
                                                );


                                            const portugalValue =
                                                Number(
                                                    portugal
                                                        ?.data?.[
                                                            context.dataIndex
                                                        ]
                                                );


                                            if(
                                                Number.isFinite(
                                                    portugalValue
                                                ) &&
                                                portugalValue !==
                                                    0 &&
                                                Number.isFinite(
                                                    value
                                                )
                                            ){

                                                const difference =

                                                    (
                                                        (
                                                            value -
                                                            portugalValue
                                                        )
                                                        /
                                                        Math.abs(
                                                            portugalValue
                                                        )
                                                    )
                                                    *
                                                    100;


                                                label +=

                                                    "  |  " +

                                                    (
                                                        difference >=
                                                        0
                                                            ? "+"
                                                            : ""
                                                    ) +

                                                    difference.toFixed(
                                                        1
                                                    ) +

                                                    "% vs PT";

                                            }

                                        }


                                        return label;

                                    }

                            }

                        },


                        datalabels:{

                            display:
                                false

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

                                },

                                maxRotation:
                                    45,

                                minRotation:
                                    0

                            }

                        },


                        y:{

                            beginAtZero:
                                true,

                            min:
                                0,

                            max:
                                chartMax,


                            grid:{

                                color:
                                    "#edf1f6"

                            },


                            ticks:{

                                color:
                                    "#71829a",

                                font:{

                                    size:
                                        11,

                                    weight:
                                        "600"

                                },

                                precision:
                                    metric ===
                                    "count"
                                        ?
                                        0
                                        :
                                        undefined

                            },


                            title:{

                                display:
                                    true,

                                text:
                                    aogTrendMetricLabel(
                                        metric
                                    ),

                                color:
                                    "#082d70",

                                font:{

                                    size:
                                        12,

                                    weight:
                                        "800"

                                }

                            }

                        }

                    }

                }

            }

        );

}

// =========================================================
// AOG TREND — GET VISIBLE PERIODS
// =========================================================

function aogTrendGetVisiblePeriods(){

    const select =
        document.getElementById(
            "aogTrendPeriod"
        );


    const mode =
        select?.value ||
        "all";


    const periods =
        Array.isArray(
            AOG_TREND_STATE.periods
        )
            ?
                AOG_TREND_STATE.periods
                    .slice()
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            aogTrendPeriodSortValue(
                                a.key
                            )
                            -
                            aogTrendPeriodSortValue(
                                b.key
                            )
                    )
            :
                [];


    /*
     * ALL
     */

    if(
        mode === "all"
    ){

        return periods;

    }


    /*
     * LAST N MONTHS
     */

    const count =
        Number(
            mode
        );


    if(
        !Number.isFinite(
            count
        ) ||
        count <= 0
    ){

        return periods;

    }


    return periods.slice(
        -count
    );

}

// =========================================================
// BUILD DATASET — PORTUGAL
// =========================================================

function aogTrendBuildPortugalDataset(
    periods,
    metric
){

    return periods.map(
        period =>
            aogTrendGetMetricValue(
                period.data,
                metric
            )
    );

}


// =========================================================
// BUILD DATASET — BASE
// =========================================================

function aogTrendBuildBaseDataset(
    periods,
    base,
    metric
){

    return periods.map(
        period => {

            const baseData =
                aogTrendFindBaseData(
                    period.data,
                    base
                );


            return aogTrendGetMetricValue(
                baseData,
                metric
            );

        }
    );

}

// =========================================================
// AOG TREND — BUILD DATASETS
// =========================================================
//
// REGRAS:
//
// 1. Portugal aparece SEMPRE.
// 2. Portugal é sempre a referência.
// 3. "All Portuguese Bases" mostra até 5 bases.
// 4. Base específica mostra Portugal + essa base.
// 5. Calculated Trend é SEMPRE calculada sobre Portugal.
// 6. Bases sem dados num determinado mês ficam null,
//    nunca são transformadas artificialmente em 0.
//
// =========================================================

function buildAOGTrendDatasets(
    periods,
    metric,
    compare
){

    const datasets = [];


    const safePeriods =
        Array.isArray(periods)
            ? periods
            : [];


    /*
     * =====================================================
     * COLOUR SYSTEM
     * =====================================================
     */

    const COLORS = {

        portugal:
            "#003399",

        opo:
            "#f5c400",

        lis:
            "#16a3a8",

        fao:
            "#f97316",

        fnc:
            "#7c3aed",

        trend:
            "#e87500"

    };


    /*
     * =====================================================
     * PORTUGAL DATA
     * =====================================================
     */

    const portugalValues =
        aogTrendBuildPortugalDataset(
            safePeriods,
            metric
        );


    /*
     * =====================================================
     * PORTUGAL DATASET
     * =====================================================
     */

    datasets.push({

        id:
            "PORTUGAL",

        label:
            "Portugal",

        role:
            "reference",

        data:
            portugalValues,

        borderColor:
            COLORS.portugal,

        backgroundColor:
            "rgba(0,51,153,.08)",

        borderWidth:
            3.5,

        pointRadius:
            4.5,

        pointHoverRadius:
            7,

        pointBackgroundColor:
            COLORS.portugal,

        pointBorderColor:
            "#ffffff",

        pointBorderWidth:
            2,

        tension:
            .28,

        fill:
            false,

        spanGaps:
            false

    });


    /*
     * =====================================================
     * DETERMINE BASES TO DISPLAY
     * =====================================================
     *
     * We deliberately use the fixed Portuguese network:
     *
     * OPO
     * LIS
     * FAO
     * FNC
     *
     * This prevents accidental Firebase keys or future
     * locations from appearing in this Trend selector.
     *
     */

    const knownBases = [

        "OPO",
        "LIS",
        "FAO",
        "FNC"

    ];


    let selectedBases = [];


    /*
     * -----------------------------------------------------
     * ALL PORTUGUESE BASES
     * -----------------------------------------------------
     */

    if(
        compare === "allBases" ||
        compare === "all" ||
        compare === "bases"
    ){

        selectedBases =
            knownBases.slice(
                0,
                5
            );

    }


    /*
     * -----------------------------------------------------
     * SPECIFIC BASE
     * -----------------------------------------------------
     */

    else if(
        compare === "base"
    ){

        const selectedBase =
            String(
                document.getElementById(
                    "aogTrendBase"
                )?.value ||
                ""
            )
            .trim()
            .toUpperCase();


        if(
            knownBases.includes(
                selectedBase
            )
        ){

            selectedBases = [

                selectedBase

            ];

        }

    }


    /*
     * -----------------------------------------------------
     * PORTUGAL ONLY
     * -----------------------------------------------------
     */

    else{

        selectedBases = [];

    }


    /*
     * =====================================================
     * BASE COLOUR MAP
     * =====================================================
     */

    const baseColors = {

        OPO:
            COLORS.opo,

        LIS:
            COLORS.lis,

        FAO:
            COLORS.fao,

        FNC:
            COLORS.fnc

    };


    /*
     * =====================================================
     * ADD BASE DATASETS
     * =====================================================
     */

    selectedBases
        .forEach(
            base => {

                const values =
                    aogTrendBuildBaseDataset(
                        safePeriods,
                        base,
                        metric
                    );


                datasets.push({

                    id:
                        base,

                    label:
                        base,

                    role:
                        "base",

                    base:
                        base,

                    data:
                        values,

                    borderColor:
                        baseColors[
                            base
                        ] ||
                        "#71829a",

                    backgroundColor:
                        "transparent",

                    borderWidth:
                        2.7,

                    pointRadius:
                        3.5,

                    pointHoverRadius:
                        6,

                    pointBackgroundColor:
                        baseColors[
                            base
                        ] ||
                        "#71829a",

                    pointBorderColor:
                        "#ffffff",

                    pointBorderWidth:
                        1.5,

                    tension:
                        .28,

                    fill:
                        false,

                    spanGaps:
                        false

                });

            }
        );


    /*
     * =====================================================
     * CALCULATED PORTUGAL TREND
     * =====================================================
     *
     * This line is calculated from Portugal only.
     *
     */

    const trendValues =
        calculateAOGPortugalTrend(
            portugalValues
        );


    /*
     * We only add the calculated trend when
     * Portugal has at least one usable value.
     */

    const hasPortugalData =
        trendValues.some(
            value =>
                Number.isFinite(
                    Number(value)
                )
        );


    if(
        hasPortugalData
    ){

        datasets.push({

            id:
                "PORTUGAL_TREND",

            label:
                "Calculated Trend — Portugal",

            role:
                "trend",

            data:
                trendValues,

            borderColor:
                COLORS.trend,

            backgroundColor:
                "transparent",

            borderWidth:
                2.5,

            borderDash:
                [
                    8,
                    6
                ],

            pointRadius:
                0,

            pointHoverRadius:
                4,

            pointBackgroundColor:
                COLORS.trend,

            tension:
                0,

            fill:
                false,

            spanGaps:
                true

        });

    }


    return datasets;

}


// =========================================================
// AOG TREND — CALCULATE PORTUGAL LINE
// =========================================================
//
// Linear regression:
//
// y = a + bx
//
// x = month index
// y = Portugal metric
//
// With only one month:
// → horizontal baseline.
//
// Missing months:
// → ignored in regression but remain null in output.
//
// =========================================================

function calculateAOGPortugalTrend(
    values
){

    if(
        !Array.isArray(values) ||
        !values.length
    ){

        return [];

    }


    const points = [];


    values.forEach(
        (
            value,
            index
        ) => {

            const number =
                Number(
                    value
                );


            if(
                Number.isFinite(
                    number
                )
            ){

                points.push({

                    x:
                        index,

                    y:
                        number

                });

            }

        }
    );


    if(
        !points.length
    ){

        return values.map(
            () => null
        );

    }


    /*
     * -----------------------------------------------------
     * ONE DATA POINT
     * -----------------------------------------------------
     *
     * The operational baseline is simply that value.
     */

    if(
        points.length === 1
    ){

        return values.map(
            () =>
                points[0].y
        );

    }


    /*
     * -----------------------------------------------------
     * LINEAR REGRESSION
     * -----------------------------------------------------
     */

    const n =
        points.length;


    const sumX =
        points.reduce(
            (
                sum,
                point
            ) =>
                sum +
                point.x,
            0
        );


    const sumY =
        points.reduce(
            (
                sum,
                point
            ) =>
                sum +
                point.y,
            0
        );


    const sumXY =
        points.reduce(
            (
                sum,
                point
            ) =>
                sum +
                (
                    point.x *
                    point.y
                ),
            0
        );


    const sumXX =
        points.reduce(
            (
                sum,
                point
            ) =>
                sum +
                (
                    point.x *
                    point.x
                ),
            0
        );


    const denominator =
        (
            n *
            sumXX
        )
        -
        (
            sumX *
            sumX
        );


    /*
     * Safety fallback.
     */

    if(
        denominator === 0
    ){

        const average =
            sumY /
            n;


        return values.map(
            () =>
                average
        );

    }


    const slope =
        (
            (
                n *
                sumXY
            )
            -
            (
                sumX *
                sumY
            )
        )
        /
        denominator;


    const intercept =
        (
            sumY -
            (
                slope *
                sumX
            )
        )
        /
        n;


    return values.map(
        (
            value,
            index
        ) => {

            /*
             * We want the trend visible across
             * the complete chart.
             */

            return (
                intercept +
                (
                    slope *
                    index
                )
            );

        }
    );

}


// =========================================================
// METRIC LABEL
// =========================================================

function aogTrendMetricLabel(
    metric
){

    if(
        metric === "averageTime"
    ){

        return "Average AOG Time";

    }


    if(
        metric === "totalTime"
    ){

        return "Total AOG Time";

    }


    return "Aircraft on Ground occurrences";

}



// =========================================================
// AOG TREND — FORMAT VALUE
// =========================================================

function aogTrendFormatValue(
    value,
    metric
){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return "—";

    }


    const number =
        Number(
            value
        );


    if(
        !Number.isFinite(
            number
        )
    ){

        return "—";

    }


    /*
     * OCCURRENCES
     */

    if(
        metric === "count"
    ){

        return Number.isInteger(
            number
        )

            ?

            String(
                number
            )

            :

            number.toFixed(
                1
            );

    }


    /*
     * AVERAGE AOG TIME
     */

    if(
        metric === "averageTime"
    ){

        const hours =
            Math.floor(
                number
            );


        const minutes =
            Math.round(
                (
                    number -
                    hours
                )
                *
                60
            );


        /*
         * Handle rounding to 60 minutes.
         */

        if(
            minutes === 60
        ){

            return (

                String(
                    hours + 1
                ) +
                "h"

            );

        }


        if(
            hours > 0
        ){

            return (

                String(
                    hours
                ) +
                "h " +
                String(
                    minutes
                ) +
                "m"

            );

        }


        return (

            String(
                minutes
            ) +
            "m"

        );

    }


    /*
     * TOTAL TIME
     */

    if(
        metric === "totalTime"
    ){

        const totalMinutes =
            Math.round(
                number *
                60
            );


        const hours =
            Math.floor(
                totalMinutes /
                60
            );


        const minutes =
            totalMinutes %
            60;


        return (

            String(
                hours
            ) +
            "h " +
            String(
                minutes
            ) +
            "m"

        );

    }


    return number.toFixed(
        1
    );

}


// =========================================================
// AOG TREND — KPI ANALYSIS
// =========================================================

function updateAOGTrendKPIs(
    periods,
    datasets,
    metric
){

    const safePeriods =
        Array.isArray(periods)
            ? periods
            : [];


    const safeDatasets =
        Array.isArray(datasets)
            ? datasets
            : [];


    /*
     * =====================================================
     * FIND PORTUGAL
     * =====================================================
     */

    const portugalDataset =
        safeDatasets.find(
            dataset =>
                dataset.id ===
                "PORTUGAL"
        );


    const portugalValues =
        portugalDataset?.data ||
        [];


    /*
     * =====================================================
     * GENERIC HELPERS
     * =====================================================
     */

    function validValues(
        values
    ){

        return (
            Array.isArray(values)
                ? values
                : []
        )
        .map(
            Number
        )
        .filter(
            Number.isFinite
        );

    }


    function average(
        values
    ){

        const valid =
            validValues(
                values
            );


        if(
            !valid.length
        ){

            return null;

        }


        return (
            valid.reduce(
                (
                    sum,
                    value
                ) =>
                    sum +
                    value,
                0
            )
            /
            valid.length
        );

    }


    function peak(
        values
    ){

        const valid =
            validValues(
                values
            );


        return valid.length
            ?
                Math.max(
                    ...valid
                )
            :
                null;

    }


    function lowest(
        values
    ){

        const valid =
            validValues(
                values
            );


        return valid.length
            ?
                Math.min(
                    ...valid
                )
            :
                null;

    }


    function getLastValidIndex(
        values
    ){

        for(
            let index =
                values.length - 1;

            index >= 0;

            index--
        ){

            if(
                Number.isFinite(
                    Number(
                        values[index]
                    )
                )
            ){

                return index;

            }

        }


        return -1;

    }


    function getFirstValidIndex(
        values
    ){

        for(
            let index = 0;

            index <
            values.length;

            index++
        ){

            if(
                Number.isFinite(
                    Number(
                        values[index]
                    )
                )
            ){

                return index;

            }

        }


        return -1;

    }


    function getPercentageDifference(
        value,
        reference
    ){

        const current =
            Number(
                value
            );


        const benchmark =
            Number(
                reference
            );


        if(
            !Number.isFinite(
                current
            ) ||
            !Number.isFinite(
                benchmark
            ) ||
            benchmark === 0
        ){

            return null;

        }


        return (

            (
                (
                    current -
                    benchmark
                )
                /
                Math.abs(
                    benchmark
                )
            )
            *
            100

        );

    }


    /*
     * =====================================================
     * PORTUGAL KPI VALUES
     * =====================================================
     */

    const portugalAverage =
        average(
            portugalValues
        );


    const portugalPeak =
        peak(
            portugalValues
        );


    const portugalLowest =
        lowest(
            portugalValues
        );


    const portugalFirstIndex =
        getFirstValidIndex(
            portugalValues
        );


    const portugalLastIndex =
        getLastValidIndex(
            portugalValues
        );


    const portugalFirst =
        portugalFirstIndex >= 0
            ?
                Number(
                    portugalValues[
                        portugalFirstIndex
                    ]
                )
            :
                null;


    const portugalLast =
        portugalLastIndex >= 0
            ?
                Number(
                    portugalValues[
                        portugalLastIndex
                    ]
                )
            :
                null;


    /*
     * =====================================================
     * PORTUGAL OVERALL VARIATION
     * =====================================================
     */

    let portugalVariation =
        null;


    if(
        portugalFirst !== null &&
        portugalLast !== null
    ){

        if(
            portugalFirst !== 0
        ){

            portugalVariation =
                (
                    (
                        portugalLast -
                        portugalFirst
                    )
                    /
                    Math.abs(
                        portugalFirst
                    )
                )
                *
                100;

        }

    }


    /*
     * =====================================================
     * FIND KPI ELEMENTS
     * =====================================================
     */

    const averageElement =
        document.getElementById(
            "aogTrendAverage"
        );


    const peakElement =
        document.getElementById(
            "aogTrendPeak"
        );


    const lowestElement =
        document.getElementById(
            "aogTrendLowest"
        );


    const variationElement =
        document.getElementById(
            "aogTrendVariation"
        );


    /*
     * =====================================================
     * AVERAGE
     * =====================================================
     */

    if(
        averageElement
    ){

        averageElement.textContent =
            aogTrendFormatValue(
                portugalAverage,
                metric
            );

    }


    /*
     * =====================================================
     * PEAK
     * =====================================================
     */

    if(
        peakElement
    ){

        if(
            portugalPeak === null
        ){

            peakElement.textContent =
                "—";

        }
        else{

            const index =
                portugalValues.indexOf(
                    portugalPeak
                );


            const label =
                safePeriods[
                    index
                ]?.label ||
                "—";


            peakElement.textContent =

                label +
                " · " +
                aogTrendFormatValue(
                    portugalPeak,
                    metric
                );

        }

    }


    /*
     * =====================================================
     * LOWEST
     * =====================================================
     */

    if(
        lowestElement
    ){

        if(
            portugalLowest === null
        ){

            lowestElement.textContent =
                "—";

        }
        else{

            const index =
                portugalValues.indexOf(
                    portugalLowest
                );


            const label =
                safePeriods[
                    index
                ]?.label ||
                "—";


            lowestElement.textContent =

                label +
                " · " +
                aogTrendFormatValue(
                    portugalLowest,
                    metric
                );

        }

    }


    /*
     * =====================================================
     * TREND KPI
     * =====================================================
     */

    if(
        variationElement
    ){

        /*
         * One month = baseline.
         */

        if(
            validValues(
                portugalValues
            ).length === 1
        ){

            variationElement.innerHTML = `

                <span
                    class="aog-trend-kpi-status baseline"
                >
                    BASELINE
                </span>

            `;

        }


        else if(
            portugalVariation === null
        ){

            variationElement.textContent =
                "—";

        }


        else{

            let direction =
                "STABLE";


            if(
                portugalVariation >
                5
            ){

                direction =
                    "UP";

            }
            else if(
                portugalVariation <
                -5
            ){

                direction =
                    "DOWN";

            }


            const sign =
                portugalVariation >= 0
                    ? "+"
                    : "";


            variationElement.innerHTML = `

                <span
                    class="
                        aog-trend-kpi-status
                        ${
                            direction === "UP"
                                ? "up"
                                :
                            direction === "DOWN"
                                ? "down"
                                :
                                "stable"
                        }
                    "
                >

                    ${direction}

                </span>


                <strong>

                    ${
                        sign
                    }${
                        portugalVariation.toFixed(
                            1
                        )
                    }%

                </strong>

            `;

        }

    }


    /*
     * =====================================================
     * BASE COMPARISON BREAKDOWN
     * =====================================================
     *
     * Every base is compared against the SAME Portugal
     * reference.
     *
     */

    const baseDatasets =
        safeDatasets.filter(
            dataset =>
                dataset.role ===
                "base"
        );


    const kpiElements = [

        averageElement,

        peakElement,

        lowestElement,

        variationElement

    ];


    kpiElements.forEach(
        element => {

            if(!element){

                return;

            }


            const parent =
                element.parentElement;


            if(!parent){

                return;

            }


            const old =
                parent.querySelector(
                    ".aog-trend-kpi-breakdown"
                );


            if(old){

                old.remove();

            }

        }
    );


    /*
     * If there are no bases selected,
     * there is nothing else to display.
     */

    if(
        !baseDatasets.length
    ){

        return;

    }


    /*
     * =====================================================
     * BUILD COMPARISON HTML
     * =====================================================
     */

    const comparisonRows =
        baseDatasets
            .map(
                dataset => {

                    const values =
                        dataset.data ||
                        [];


                    const baseAverage =
                        average(
                            values
                        );


                    const baseLastIndex =
                        getLastValidIndex(
                            values
                        );


                    const baseLast =
                        baseLastIndex >= 0
                            ?
                                Number(
                                    values[
                                        baseLastIndex
                                    ]
                                )
                            :
                                null;


                    const averageVsPortugal =
                        getPercentageDifference(
                            baseAverage,
                            portugalAverage
                        );


                    const latestPortugal =
                        portugalLast;


                    const latestVsPortugal =
                        getPercentageDifference(
                            baseLast,
                            latestPortugal
                        );


                    let className =
                        "neutral";


                    if(
                        latestVsPortugal !==
                        null
                    ){

                        if(
                            latestVsPortugal >
                            5
                        ){

                            className =
                                "above";

                        }
                        else if(
                            latestVsPortugal <
                            -5
                        ){

                            className =
                                "below";

                        }

                    }


                    const signAverage =
                        averageVsPortugal !== null &&
                        averageVsPortugal >= 0
                            ? "+"
                            : "";


                    const signLatest =
                        latestVsPortugal !== null &&
                        latestVsPortugal >= 0
                            ? "+"
                            : "";


                    return `

                        <div
                            class="
                                aog-trend-kpi-base-row
                                ${className}
                            "
                        >

                            <div
                                class="aog-trend-kpi-base-name"
                            >

                                ${dataset.label}

                            </div>


                            <div
                                class="aog-trend-kpi-base-metric"
                            >

                                <span>

                                    AVG

                                </span>

                                <strong>

                                    ${aogTrendFormatValue(
                                        baseAverage,
                                        metric
                                    )}

                                </strong>

                                <small>

                                    ${
                                        averageVsPortugal !== null
                                            ?
                                            signAverage +
                                            averageVsPortugal.toFixed(
                                                1
                                            ) +
                                            "% vs PT"
                                            :
                                            "vs PT —"

                                    }

                                </small>

                            </div>


                            <div
                                class="aog-trend-kpi-base-metric"
                            >

                                <span>

                                    LATEST

                                </span>

                                <strong>

                                    ${aogTrendFormatValue(
                                        baseLast,
                                        metric
                                    )}

                                </strong>

                                <small>

                                    ${
                                        latestVsPortugal !== null
                                            ?
                                            signLatest +
                                            latestVsPortugal.toFixed(
                                                1
                                            ) +
                                            "% vs PT"
                                            :
                                            "vs PT —"

                                    }

                                </small>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    /*
     * =====================================================
     * ADD BREAKDOWN TO AVERAGE CARD
     * =====================================================
     *
     * One compact comparison panel is enough. It avoids
     * destroying the 4-card structure of the dashboard.
     */

    if(
        averageElement &&
        averageElement.parentElement
    ){

        const breakdown =
            document.createElement(
                "div"
            );


        breakdown.className =
            "aog-trend-kpi-breakdown";


        breakdown.innerHTML = `

            <div
                class="aog-trend-kpi-reference"
            >

                🇵🇹 Portugal Reference

            </div>

            ${comparisonRows}

        `;


        averageElement.parentElement
            .appendChild(
                breakdown
            );

    }


    /*
     * =====================================================
     * OPERATIONAL INSIGHT
     * =====================================================
     */

    const insight =
        document.getElementById(
            "aogTrendInsight"
        );


    if(
        insight
    ){

        let text = "";


        const availableMonths =
            validValues(
                portugalValues
            ).length;


        if(
            availableMonths === 0
        ){

            text =
                "No Portugal AOG data is currently available for the selected analysis period.";

        }


        else if(
            availableMonths === 1
        ){

            const onlyIndex =
                portugalFirstIndex;


            const onlyLabel =
                safePeriods[
                    onlyIndex
                ]?.label ||
                "the available month";


            text =

                `Only ${onlyLabel} is currently available. Portugal is being used as the operational baseline; additional months will be added automatically as AOG history becomes available.`;

        }


        else if(
            portugalVariation !== null
        ){

            if(
                portugalVariation >
                5
            ){

                text =

                    `Portugal AOG increased by ${portugalVariation.toFixed(1)}% from the first to the latest visible month. The selected bases are benchmarked against the same Portugal reference.`;

            }
            else if(
                portugalVariation <
                -5
            ){

                text =

                    `Portugal AOG decreased by ${Math.abs(portugalVariation).toFixed(1)}% from the first to the latest visible month. The selected bases are benchmarked against the same Portugal reference.`;

            }
            else{

                text =

                    `Portugal AOG remained broadly stable across the visible period (${portugalVariation >= 0 ? "+" : ""}${portugalVariation.toFixed(1)}%). The selected bases are benchmarked against the same Portugal reference.`;

            }

        }


        else{

            text =
                "Portugal is currently the operational reference baseline.";

        }


        insight.innerHTML = `

            <strong>

                Operational Insight

            </strong>


            <span>

                ${text}

            </span>

        `;

    }

}

/* =========================================================
   AOG TREND — LINEAR REGRESSION
========================================================= */

/* =========================================================
   AOG TREND — CALCULATE LINEAR REGRESSION
========================================================= */

function calculateAOGTrendLine(
    values
){

    const safeValues =
        Array.isArray(values)
            ? values
            : [];


    const valid =
        safeValues
            .map(
                (
                    value,
                    index
                ) => ({

                    x:
                        index,

                    y:
                        Number(
                            value
                        )

                })
            )
            .filter(
                point =>
                    Number.isFinite(
                        point.y
                    )
            );


    /*
        -----------------------------------------------------
        NO DATA
        -----------------------------------------------------
    */

    if(
        !valid.length
    ){

        return [];

    }


    /*
        -----------------------------------------------------
        ONLY ONE MONTH
        -----------------------------------------------------

        With only one available month there is no statistical
        slope to calculate.

        Therefore we simply draw a horizontal baseline through
        the available value.
    */

    if(
        valid.length === 1
    ){

        return safeValues.map(
            () =>
                valid[0].y
        );

    }


    /*
        -----------------------------------------------------
        LINEAR REGRESSION
        y = mx + b
        -----------------------------------------------------
    */

    const n =
        valid.length;


    const sumX =
        valid.reduce(
            (
                sum,
                point
            ) =>
                sum +
                point.x,
            0
        );


    const sumY =
        valid.reduce(
            (
                sum,
                point
            ) =>
                sum +
                point.y,
            0
        );


    const sumXY =
        valid.reduce(
            (
                sum,
                point
            ) =>
                sum +
                (
                    point.x *
                    point.y
                ),
            0
        );


    const sumXX =
        valid.reduce(
            (
                sum,
                point
            ) =>
                sum +
                (
                    point.x *
                    point.x
                ),
            0
        );


    const denominator =
        (
            n *
            sumXX
        ) -
        (
            sumX *
            sumX
        );


    /*
        -----------------------------------------------------
        FALLBACK
        -----------------------------------------------------
    */

    if(
        denominator === 0
    ){

        const average =
            sumY /
            n;


        return safeValues.map(
            () =>
                average
        );

    }


    const slope =
        (
            (
                n *
                sumXY
            ) -
            (
                sumX *
                sumY
            )
        )
        /
        denominator;


    const intercept =
        (
            sumY -
            (
                slope *
                sumX
            )
        )
        /
        n;


    /*
        -----------------------------------------------------
        RETURN TREND VALUES
        -----------------------------------------------------
    */

    return safeValues.map(
        (
            _value,
            index
        ) =>
            (
                slope *
                index
            ) +
            intercept
    );

}

// =========================================================
// AOG TREND — MAIN REFRESH
// =========================================================

async function updateAOGTrendAnalysis(){

    try{

        /*
         * =================================================
         * ENSURE DATA
         * =================================================
         */

        let periods =
            AOG_TREND_STATE.periods || [];


        if(
            !periods.length
        ){

            periods =
                await loadAOGTrendData();

        }


        /*
         * =================================================
         * VISIBLE PERIODS
         * =================================================
         */

        const visiblePeriods =
            aogTrendGetVisiblePeriods();


        /*
         * =================================================
         * CONTROLS
         * =================================================
         */

        const metric =
            document.getElementById(
                "aogTrendMetric"
            )?.value ||
            "count";


        const compare =
            document.getElementById(
                "aogTrendCompare"
            )?.value ||
            "allBases";


        /*
         * =================================================
         * BASE SELECTOR
         * =================================================
         *
         * Only visible when the user wants a specific base.
         *
         */

        const baseControl =
            document.getElementById(
                "aogTrendBaseControl"
            );


        if(
            baseControl
        ){

            baseControl.style.display =

                compare === "base"
                    ? ""
                    :
                    "none";

        }


        /*
         * =================================================
         * BUILD DATASETS
         * =================================================
         */

        const datasets =
            buildAOGTrendDatasets(
                visiblePeriods,
                metric,
                compare
            );


        /*
         * =================================================
         * CHART SUBTITLE
         * =================================================
         */

        const subtitle =
            document.getElementById(
                "aogTrendChartSubtitle"
            );


        if(
            subtitle
        ){

            subtitle.textContent =
                aogTrendMetricLabel(
                    metric
                );

        }


        /*
         * =================================================
         * PERIOD BADGE
         * =================================================
         */

        const badge =
            document.getElementById(
                "aogTrendPeriodBadge"
            );


        if(
            badge
        ){

            const period =
                document.getElementById(
                    "aogTrendPeriod"
                )?.value ||
                "all";


            if(
                period === "all"
            ){

                badge.textContent =
                    "ALL AVAILABLE DATA";

            }
            else{

                badge.textContent =
                    `LAST ${period} MONTHS`;

            }

        }


        /*
         * =================================================
         * EMPTY STATE
         * =================================================
         */

        if(
            !visiblePeriods.length
        ){

            drawAOGTrendChart(
                [],
                [],
                metric
            );


            updateAOGTrendKPIs(
                [],
                [],
                metric
            );


            return;

        }


        /*
         * =================================================
         * DRAW
         * =================================================
         */

        drawAOGTrendChart(
            visiblePeriods,
            datasets,
            metric
        );


        /*
         * =================================================
         * KPIs
         * =================================================
         */

        updateAOGTrendKPIs(
            visiblePeriods,
            datasets,
            metric
        );


        /*
         * =================================================
         * DEBUG
         * =================================================
         */

        console.log(
            "AOG TREND — refreshed:",
            {

                periods:
                    visiblePeriods.length,

                metric:
                    metric,

                compare:
                    compare,

                datasets:
                    datasets.map(
                        dataset => ({
                            id:
                                dataset.id,

                            label:
                                dataset.label,

                            values:
                                dataset.data
                        })
                    )

            }
        );

    }

    catch(error){

        console.error(
            "AOG TREND — refresh error:",
            error
        );

    }

}

// =========================================================
// AOG TREND — INITIALIZE
// =========================================================

async function initializeAOGTrendAnalysis(){

    const section =
        document.getElementById(
            "aogTrendAnalysis"
        );


    if(!section){

        return;

    }


    try{

        /*
         * =================================================
         * LOAD FRESH DATA
         * =================================================
         */

        AOG_TREND_STATE.rawData =
            null;

        AOG_TREND_STATE.periods =
            [];


        const periods =
            await loadAOGTrendData();


        /*
         * =================================================
         * POPULATE BASES
         * =================================================
         */

        populateAOGTrendBases();


        /*
         * =================================================
         * KEEP DASHBOARD FUNCTIONAL EVEN WITH
         * ONLY ONE MONTH
         * =================================================
         */

        if(
            periods.length === 0
        ){

            console.warn(
                "AOG TREND — No monthly data available."
            );


            /*
             * Still refresh UI so that the section
             * doesn't retain stale information.
             */

            await updateAOGTrendAnalysis();

            return;

        }


        /*
         * =================================================
         * REFRESH
         * =================================================
         */

        await updateAOGTrendAnalysis();


        console.log(
            "AOG TREND — initialized:",
            periods.length,
            "period(s)"
        );

    }

    catch(error){

        console.error(
            "AOG TREND — initialization error:",
            error
        );

    }

}

// =========================================================
// AOG EXCEL IMPORT ENGINE
// =========================================================

let AOG_EXCEL_IMPORT_STATE = {

    file:
        null,

    workbook:
        null,

    records:
        [],

    validRecords:
        [],

    warnings:
        [],

    errors:
        [],

    duplicates:
        [],

    firebaseDuplicates:
        [],

    existingRecords:
        [],

    importMode:
        "ADD_ONLY_NEW",

    analysed:
        false,

    importing:
        false

};


// =========================================================
// CLOSE IMPORT
// =========================================================

function closeAOGExcelImport(){

    const modal =
        document.getElementById(
            "aogExcelImportModal"
        );


    if(modal){

        modal.remove();

    }


    AOG_EXCEL_IMPORT_STATE = {

        file:null,
        workbook:null,
        records:[],
        validRecords:[],
        warnings:[],
        errors:[],
        duplicates:[],
        analysed:false,
        importing:false,
        firebaseDuplicates:[],
        existingRecords:[],
        importMode: "ADD_ONLY_NEW",
    };


    document.body.style.overflow =
        "";

}


// =========================================================
// CANCEL IMPORT
// =========================================================

function cancelAOGExcelImport(){

    closeAOGExcelImport();

}


// =========================================================
// HANDLE FILE
// =========================================================

async function handleAOGExcelImport(
    event
){

    const file =
        event?.target?.files?.[0];


    if(!file){

        return;

    }


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    if(
        extension !== "xlsx" &&
        extension !== "xls"
    ){

        aogShowError(
            "Excel Import",
            "Please select a valid Excel file."
        );

        event.target.value =
            "";

        return;

    }


    /*
        Store file.
    */

    AOG_EXCEL_IMPORT_STATE.file =
        file;


    const fileName =
        document.getElementById(
            "aogExcelImportFileName"
        );


    if(fileName){

        fileName.textContent =
            file.name;

    }


    /*
        Analyse.
    */

    await analyseAOGExcelFile(
        file
    );


    /*
        Reset input so the same file
        can be selected again.
    */

    event.target.value =
        "";

}


/* =========================================================
   ANALYSE EXCEL
========================================================= */

async function analyseAOGExcelFile(
    file
){

    const status =
        document.getElementById(
            "aogExcelImportStatus"
        );


    const actions =
        document.getElementById(
            "aogExcelImportActions"
        );


    if(status){

        status.style.display =
            "block";


        status.innerHTML = `

            <div
                class="aog-excel-import-loading"
            >
                Reading Excel file...
            </div>

        `;

    }


    if(actions){

        actions.style.display =
            "none";

    }


    try{

        if(
            typeof XLSX ===
            "undefined"
        ){

            throw new Error(
                "XLSX library is not loaded."
            );

        }


        const arrayBuffer =
            await file.arrayBuffer();


        const workbook =
            XLSX.read(
                arrayBuffer,
                {
                    type:
                        "array",

                    cellDates:
                        true
                }
            );


        if(
            !workbook ||
            !workbook.SheetNames ||
            !workbook.SheetNames.length
        ){

            throw new Error(
                "No worksheet was found."
            );

        }


        AOG_EXCEL_IMPORT_STATE.workbook =
            workbook;


        const sheetName =
            workbook.SheetNames[0];


        const sheet =
            workbook.Sheets[
                sheetName
            ];


        if(!sheet){

            throw new Error(
                "Unable to read the first worksheet."
            );

        }


        const rows =
            XLSX.utils.sheet_to_json(
                sheet,
                {
                    defval:
                        "",

                    raw:
                        true
                }
            );


        if(
            !Array.isArray(rows) ||
            !rows.length
        ){

            throw new Error(
                "The selected worksheet contains no records."
            );

        }


        /*
            Parse Excel.
        */

        const result =
            parseAOGExcelRows(
                rows
            );


        /*
            Load current Firebase records.
        */

        if(status){

            status.innerHTML = `

                <div
                    class="aog-excel-import-loading"
                >
                    Checking existing AOG records...
                </div>

            `;

        }


        const existingRecords =
            await loadExistingAOGRecordsForImport();


        /*
            Detect duplicates against Firebase.
        */

        const firebaseDuplicates =
            [];


        result.validRecords.forEach(
            record => {

                const existing =
                    findExistingAOGDuplicate(
                        record,
                        existingRecords
                    );


                if(existing){

                    firebaseDuplicates.push({

                        row:
                            record.sourceExcelRow,

                        message:
                            "AOG record already exists in Firebase.",

                        record:
                            record,

                        existingRecord:
                            existing,

                        period:
                            existing.period,

                        existingId:
                            existing.id

                    });

                }

            }
        );


        /*
            Keep Excel duplicates and
            Firebase duplicates together.
        */

        AOG_EXCEL_IMPORT_STATE.records =
            result.records;


        AOG_EXCEL_IMPORT_STATE.validRecords =
            result.validRecords;


        AOG_EXCEL_IMPORT_STATE.warnings =
            result.warnings;


        AOG_EXCEL_IMPORT_STATE.errors =
            result.errors;


        AOG_EXCEL_IMPORT_STATE.duplicates = [

            ...result.duplicates,

            ...firebaseDuplicates

        ];


        /*
            Store Firebase duplicates
            separately so the import engine
            knows which records to overwrite.
        */

        AOG_EXCEL_IMPORT_STATE.firebaseDuplicates =
            firebaseDuplicates;


        AOG_EXCEL_IMPORT_STATE.existingRecords =
            existingRecords;


        /*
            Default behaviour:
            ADD ONLY NEW.
        */

        AOG_EXCEL_IMPORT_STATE.importMode =
            "ADD_ONLY_NEW";


        AOG_EXCEL_IMPORT_STATE.analysed =
            true;


        renderAOGExcelImportSummary();

    }

    catch(error){

        console.error(
            "AOG EXCEL IMPORT ERROR:",
            error
        );


        AOG_EXCEL_IMPORT_STATE.analysed =
            false;


        if(status){

            status.innerHTML = `

                <div
                    class="
                        aog-excel-import-result
                        aog-excel-import-error
                    "
                >

                    <strong>
                        Import could not be analysed
                    </strong>

                    <span>
                        ${escapeAOGHtml(
                            error.message ||
                            "Unknown Excel error."
                        )}
                    </span>

                </div>

            `;

        }

    }

}

// =========================================================
// NORMALIZE HEADER
// =========================================================

function normalizeAOGExcelHeader(
    value
){

    return String(
        value ||
        ""
    )
    .trim()
    .toUpperCase()
    .replace(
        /\s+/g,
        " "
    );

}


// =========================================================
// GET COLUMN
// =========================================================

function getAOGExcelValue(
    row,
    aliases
){

    const keys =
        Object.keys(
            row
        );


    const normalized =
        {};


    keys.forEach(
        key => {

            normalized[
                normalizeAOGExcelHeader(
                    key
                )
            ] =
                row[key];

        }
    );


    for(
        const alias of aliases
    ){

        const key =
            normalizeAOGExcelHeader(
                alias
            );


        if(
            Object.prototype.hasOwnProperty.call(
                normalized,
                key
            )
        ){

            return normalized[
                key
            ];

        }

    }


    return "";

}


// =========================================================
// NORMALIZE TEXT
// =========================================================

function normalizeAOGExcelText(
    value
){

    if(
        value === null ||
        value === undefined
    ){

        return "";

    }


    return String(
        value
    )
    .trim();

}


// =========================================================
// NORMALIZE BASE
// =========================================================

function normalizeAOGExcelBase(
    value
){

    const base =
        normalizeAOGExcelText(
            value
        )
        .toUpperCase();


    return AOG_PORTUGAL_BASES.includes(
        base
    )
        ? base
        : base;

}


// =========================================================
// NORMALIZE TIME
// =========================================================

function normalizeAOGExcelTime(
    value
){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return "";

    }


    /*
        Excel may give a Date.
    */

    if(
        value instanceof Date &&
        !isNaN(
            value.getTime()
        )
    ){

        return (

            String(
                value.getHours()
            )
            .padStart(
                2,
                "0"
            )

            +

            ":" +

            String(
                value.getMinutes()
            )
            .padStart(
                2,
                "0"
            )

        );

    }


    /*
        Excel time can be a decimal
        between 0 and 1.
    */

    if(
        typeof value ===
        "number" &&
        value >= 0 &&
        value < 1
    ){

        const totalMinutes =
            Math.round(
                value *
                24 *
                60
            );


        const hours =
            Math.floor(
                totalMinutes /
                60
            );


        const minutes =
            totalMinutes %
            60;


        return (

            String(hours)
                .padStart(
                    2,
                    "0"
                )

            +

            ":" +

            String(minutes)
                .padStart(
                    2,
                    "0"
                )

        );

    }


    const text =
        String(
            value
        )
        .trim();


    /*
        HH:MM
    */

    const match =
        text.match(
            /(\d{1,2}):(\d{2})/
        );


    if(match){

        return (

            String(
                Math.min(
                    23,
                    Number(
                        match[1]
                    )
                )
            )
            .padStart(
                2,
                "0"
            )

            +

            ":" +

            String(
                Math.min(
                    59,
                    Number(
                        match[2]
                    )
                )
            )
            .padStart(
                2,
                "0"
            )

        );

    }


    return "";

}


// =========================================================
// NORMALIZE DATE
// =========================================================

function normalizeAOGExcelDate(
    value
){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return "";

    }


    let date = null;


    if(
        value instanceof Date &&
        !isNaN(
            value.getTime()
        )
    ){

        date =
            value;

    }


    else if(
        typeof value ===
        "number"
    ){

        /*
            Excel serial date.
        */

        const parsed =
            XLSX.SSF.parse_date_code(
                value
            );


        if(parsed){

            date =
                new Date(
                    parsed.y,
                    parsed.m - 1,
                    parsed.d
                );

            }

    }


    else{

        const text =
            String(
                value
            )
            .trim();


        /*
            ISO.
        */

        if(
            /^\d{4}-\d{1,2}-\d{1,2}$/
                .test(text)
        ){

            const parts =
                text.split("-");


            date =
                new Date(
                    Number(parts[0]),
                    Number(parts[1]) - 1,
                    Number(parts[2])
                );

        }


        /*
            DD/MM/YYYY
        */

        else if(
            /^\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}$/
                .test(text)
        ){

            const parts =
                text.split(
                    /[\/.-]/
                );


            date =
                new Date(
                    Number(parts[2]),
                    Number(parts[1]) - 1,
                    Number(parts[0])
                );

        }

    }


    if(
        !date ||
        isNaN(
            date.getTime()
        )
    ){

        return "";

    }


    return (

        String(
            date.getFullYear()
        )
        .padStart(
            4,
            "0"
        )

        +

        "-" +

        String(
            date.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        )

        +

        "-" +

        String(
            date.getDate()
        )
        .padStart(
            2,
            "0"
        )

    );

}


// =========================================================
// VALIDATE DATE
// =========================================================

function isValidAOGExcelDate(
    value
){

    return /^\d{4}-\d{2}-\d{2}$/
        .test(
            value
        );

}


// =========================================================
// VALIDATE TIME
// =========================================================

function isValidAOGExcelTime(
    value
){

    return /^\d{2}:\d{2}$/
        .test(
            value
        );

}


// =========================================================
// PARSE EXCEL ROWS
// =========================================================

function parseAOGExcelRows(
    rows
){

    const records =
        [];


    const validRecords =
        [];


    const warnings =
        [];


    const errors =
        [];


    const duplicates =
        [];


    const seen =
        new Set();


    rows.forEach(
        (
            row,
            index
        ) => {

            const excelRow =
                index + 2;


            /*
                Ignore completely empty rows.
            */

            const values =
                Object.values(
                    row
                );


            if(
                values.every(
                    value =>
                        String(
                            value ??
                            ""
                        )
                        .trim() ===
                        ""
                )
            ){

                return;

            }


            const reg =
                normalizeAOGExcelText(
                    getAOGExcelValue(
                        row,
                        [
                            "REG",
                            "REGISTRATION",
                            "AIRCRAFT REGISTER",
                            "AIRCRAFT REG"
                        ]
                    )
                )
                .toUpperCase();


            const aircraftType =
                normalizeAOGExcelText(
                    getAOGExcelValue(
                        row,
                        [
                            "A/C TYPE",
                            "AC TYPE",
                            "AIRCRAFT TYPE",
                            "TYPE"
                        ]
                    )
                )
                .toUpperCase();


            const base =
                normalizeAOGExcelBase(
                    getAOGExcelValue(
                        row,
                        [
                            "BASE",
                            "STATION",
                            "AIRPORT"
                        ]
                    )
                );


            const startDate =
                normalizeAOGExcelDate(
                    getAOGExcelValue(
                        row,
                        [
                            "START DATE",
                            "START DATE/TIME",
                            "AOG START DATE"
                        ]
                    )
                );


            const startTime =
                normalizeAOGExcelTime(
                    getAOGExcelValue(
                        row,
                        [
                            "START HOURS",
                            "START HOUR",
                            "START TIME",
                            "AOG START TIME"
                        ]
                    )
                );


            const finishDate =
                normalizeAOGExcelDate(
                    getAOGExcelValue(
                        row,
                        [
                            "FINISH DATE",
                            "ACTUAL FINISH DATE",
                            "AOG FINISH DATE"
                        ]
                    )
                );


            const expectedFinishTime =
                normalizeAOGExcelTime(
                    getAOGExcelValue(
                        row,
                        [
                            "EXP TIME SERV",
                            "EXPECTED TIME SERV",
                            "EXPECTED FINISH",
                            "EXPECTED FINISH TIME"
                        ]
                    )
                );


            const actualFinishTime =
                normalizeAOGExcelTime(
                    getAOGExcelValue(
                        row,
                        [
                            "ACT TIME SERV",
                            "ACTUAL TIME SERV",
                            "ACTUAL FINISH",
                            "ACTUAL FINISH TIME"
                        ]
                    )
                );


            const onTimeRaw =
                normalizeAOGExcelText(
                    getAOGExcelValue(
                        row,
                        [
                            "ON TIME?",
                            "ON TIME",
                            "ONTIME"
                        ]
                    )
                )
                .toUpperCase();


            const defect =
                normalizeAOGExcelText(
                    getAOGExcelValue(
                        row,
                        [
                            "DEFECT",
                            "DEFECT DESCRIPTION"
                        ]
                    )
                );


            const action =
                normalizeAOGExcelText(
                    getAOGExcelValue(
                        row,
                        [
                            "ACTION",
                            "RECTIFICATION",
                            "ACTION TAKEN"
                        ]
                    )
                );


            const category =
                normalizeAOGExcelText(
                    getAOGExcelValue(
                        row,
                        [
                            "CATEGORY",
                            "AOG CATEGORY"
                        ]
                    )
                );


            /*
                Column13 is intentionally ignored.
            */


            const record = {

                reg,

                aircraftType,

                base,

                category,

                startDate,

                startTime,

                finishDate,

                expectedFinishTime,

                actualFinishTime,

                defect,

                action,

                comments:
                    "",

                importedOnTime:
                    onTimeRaw,

                sourceExcelRow:
                    excelRow

            };


            records.push(
                record
            );


            /*
                HARD validation.
            */

            const rowErrors =
                [];


            if(!reg){

                rowErrors.push(
                    "Missing registration"
                );

            }


            if(!aircraftType){

                rowErrors.push(
                    "Missing aircraft type"
                );

            }


            if(
                !AOG_PORTUGAL_BASES.includes(
                    base
                )
            ){

                rowErrors.push(
                    `Invalid base: ${base || "empty"}`
                );

            }


            if(
                !isValidAOGExcelDate(
                    startDate
                )
            ){

                rowErrors.push(
                    "Invalid start date"
                );

            }


            if(
                !isValidAOGExcelTime(
                    startTime
                )
            ){

                rowErrors.push(
                    "Missing/invalid start time"
                );

            }


            if(
                !isValidAOGExcelDate(
                    finishDate
                )
            ){

                rowErrors.push(
                    "Invalid finish date"
                );

            }


            if(
                !isValidAOGExcelTime(
                    actualFinishTime
                )
            ){

                rowErrors.push(
                    "Missing/invalid actual finish time"
                );

            }


            /*
                Expected finish is useful but
                does not block import.
            */

            if(
                !isValidAOGExcelTime(
                    expectedFinishTime
                )
            ){

                warnings.push({

                    row:
                        excelRow,

                    message:
                        "Missing/invalid expected finish time"

                });

            }


            if(!category){

                warnings.push({

                    row:
                        excelRow,

                    message:
                        "Missing category"

                });

            }


            if(!defect){

                warnings.push({

                    row:
                        excelRow,

                    message:
                        "Missing defect"

                });

            }


            if(!action){

                warnings.push({

                    row:
                        excelRow,

                    message:
                        "Missing action"

                });

            }


            if(!onTimeRaw){

                warnings.push({

                    row:
                        excelRow,

                    message:
                        "Missing ON TIME value"

                });

            }


            /*
                Check duration.
            */

            if(
                !rowErrors.length
            ){

                const start =
                    new Date(
                        `${startDate}T${startTime}`
                    );


                const finish =
                    new Date(
                        `${finishDate}T${actualFinishTime}`
                    );


                const duration =
                    (
                        finish.getTime() -
                        start.getTime()
                    )
                    /
                    60000;


                if(
                    !Number.isFinite(
                        duration
                    ) ||
                    duration < 0
                ){

                    rowErrors.push(
                        "Invalid AOG duration"
                    );

                }

            }


            /*
                Duplicate fingerprint.

                This catches repeated rows inside
                the same Excel without deleting anything.
            */

            const fingerprint =
                [

                    reg,
                    aircraftType,
                    base,
                    startDate,
                    startTime,
                    finishDate,
                    actualFinishTime,
                    defect

                ]
                .join(
                    "|"
                )
                .toUpperCase();


            if(
                seen.has(
                    fingerprint
                )
            ){

                duplicates.push({

                    row:
                        excelRow,

                    message:
                        "Possible duplicate AOG record"

                });

            }


            else{

                seen.add(
                    fingerprint
                );

            }


            if(
                rowErrors.length
            ){

                errors.push({

                    row:
                        excelRow,

                    messages:
                        rowErrors,

                    record:
                        record

                });

                return;

            }


            validRecords.push(
                record
            );

        }
    );


    return {

        records,

        validRecords,

        warnings,

        errors,

        duplicates

    };

}

/* =========================================================
   RENDER IMPORT SUMMARY
========================================================= */

function renderAOGExcelImportSummary(){

    const status =
        document.getElementById(
            "aogExcelImportStatus"
        );


    const actions =
        document.getElementById(
            "aogExcelImportActions"
        );


    if(!status){

        return;

    }


    const state =
        AOG_EXCEL_IMPORT_STATE;


    const total =
        state.records.length;


    const valid =
        state.validRecords.length;


    const invalid =
        state.errors.length;


    const warnings =
        state.warnings.length;


    const duplicates =
        state.duplicates.length;


    const firebaseDuplicates =
        state.firebaseDuplicates.length;


    status.innerHTML = `

        <div
            class="aog-excel-import-result"
        >

            <div
                class="aog-excel-import-result-title"
            >
                Excel Analysis Complete
            </div>


            <div
                class="aog-excel-import-stat-grid"
            >

                <div
                    class="aog-excel-import-stat"
                >

                    <span>
                        Records Found
                    </span>

                    <strong>
                        ${total}
                    </strong>

                </div>


                <div
                    class="aog-excel-import-stat"
                >

                    <span>
                        Valid Records
                    </span>

                    <strong>
                        ${valid}
                    </strong>

                </div>


                <div
                    class="aog-excel-import-stat"
                >

                    <span>
                        Errors
                    </span>

                    <strong>
                        ${invalid}
                    </strong>

                </div>


                <div
                    class="aog-excel-import-stat"
                >

                    <span>
                        Duplicates
                    </span>

                    <strong>
                        ${duplicates}
                    </strong>

                </div>

            </div>


            ${
                firebaseDuplicates

                    ?

                    `

                        <div
                            style="
                                margin-top:18px;
                                padding:16px;
                                border:1px solid #f0c36d;
                                background:#fff8e6;
                                border-radius:12px;
                            "
                        >

                            <strong
                                style="
                                    display:block;
                                    color:#8a5a00;
                                    margin-bottom:6px;
                                "
                            >

                                ⚠ Duplicate AOG records found

                            </strong>


                            <span
                                style="
                                    display:block;
                                    color:#5f5f5f;
                                    line-height:1.5;
                                "
                            >

                                ${
                                    firebaseDuplicates
                                        .length
                                }
                                ${
                                    firebaseDuplicates.length === 1
                                        ? "record already exists"
                                        : "records already exist"
                                }
                                in Firebase.

                                <br>

                                Choose whether to overwrite the
                                existing records or import only
                                the new records.

                            </span>

                        </div>

                    `

                    :

                    `

                        <div
                            class="aog-import-success-line"
                        >

                            ✓ No existing AOG duplicates detected

                        </div>

                    `

            }


            ${
                duplicates

                    ?

                    `

                        <details
                            class="aog-import-details"
                            style="margin-top:14px;"
                        >

                            <summary>
                                View duplicate records
                            </summary>


                            <div>

                                ${
                                    state.duplicates
                                        .slice(
                                            0,
                                            50
                                        )
                                        .map(
                                            item => `

                                                <div
                                                    style="
                                                        padding:5px 0;
                                                    "
                                                >

                                                    <strong>
                                                        Row ${item.row}
                                                    </strong>

                                                    —
                                                    ${escapeAOGHtml(
                                                        item.message
                                                    )}

                                                </div>

                                            `
                                        )
                                        .join("")
                                }

                            </div>

                        </details>

                    `

                    :

                    ""

            }


            ${
                warnings

                    ?

                    `

                        <details
                            class="aog-import-details"
                            style="margin-top:10px;"
                        >

                            <summary>
                                View warnings
                            </summary>


                            <div>

                                ${
                                    state.warnings
                                        .slice(
                                            0,
                                            50
                                        )
                                        .map(
                                            item => `

                                                <div
                                                    style="
                                                        padding:5px 0;
                                                    "
                                                >

                                                    <strong>
                                                        Row ${item.row}
                                                    </strong>

                                                    —
                                                    ${escapeAOGHtml(
                                                        item.message
                                                    )}

                                                </div>

                                            `
                                        )
                                        .join("")
                                }

                            </div>

                        </details>

                    `

                    :

                    ""

            }

        </div>

    `;


    if(actions){

        actions.style.display =
            "flex";


        const confirm =
            document.getElementById(
                "aogConfirmExcelImportButton"
            );


        if(confirm){

            confirm.disabled =
                valid <= 0;

            confirm.style.opacity =
                valid > 0
                    ? "1"
                    : ".5";

            confirm.style.pointerEvents =
                valid > 0
                    ? "auto"
                    : "none";

        }

    }

}

/* =========================================================
   AOG DUPLICATE FINGERPRINT
========================================================= */

function getAOGDuplicateFingerprint(
    record
){

    if(!record){

        return "";

    }


    return [

        String(
            record.reg ||
            ""
        )
        .trim()
        .toUpperCase(),

        String(
            record.aircraftType ||
            ""
        )
        .trim()
        .toUpperCase(),

        String(
            record.base ||
            ""
        )
        .trim()
        .toUpperCase(),

        String(
            record.startDate ||
            ""
        )
        .trim(),

        String(
            record.startTime ||
            ""
        )
        .trim(),

        String(
            record.finishDate ||
            ""
        )
        .trim(),

        String(
            record.actualFinishTime ||
            ""
        )
        .trim(),

        String(
            record.defect ||
            ""
        )
        .trim()
        .toUpperCase()

    ]
    .join("|");

}


/* =========================================================
   LOAD EXISTING AOG RECORDS FOR IMPORT
========================================================= */

async function loadExistingAOGRecordsForImport(){

    const snapshot =
        await aogFirebaseGet(
            AOG_RECORDS_ROOT
        );


    if(
        !snapshot ||
        !snapshot.exists()
    ){

        return [];

    }


    const root =
        snapshot.val() ||
        {};


    const records =
        [];


    Object.entries(
        root
    )
    .forEach(
        (
            [
                period,
                periodData
            ]
        ) => {

            if(
                period ===
                "config"
            ){

                return;

            }


            if(
                !periodData ||
                typeof periodData !==
                "object"
            ){

                return;

            }


            const periodRecords =
                periodData.records ||
                {};


            Object.entries(
                periodRecords
            )
            .forEach(
                (
                    [
                        id,
                        record
                    ]
                ) => {

                    if(
                        !record ||
                        typeof record !==
                        "object"
                    ){

                        return;

                    }


                    records.push({

                        ...record,

                        id:
                            record.id ||
                            id,

                        period:
                            period

                    });

                }
            );

        }
    );


    return records;

}


/* =========================================================
   FIND EXISTING AOG DUPLICATE
========================================================= */

function findExistingAOGDuplicate(
    record,
    existingRecords
){

    const fingerprint =
        getAOGDuplicateFingerprint(
            record
        );


    if(!fingerprint){

        return null;

    }


    return (

        existingRecords.find(
            existing =>

                getAOGDuplicateFingerprint(
                    existing
                ) ===
                fingerprint
        )

        ||

        null

    );

}


/* =========================================================
   BUILD FIREBASE AOG RECORD
========================================================= */

function buildAOGImportedRecord(
    record,
    existingRecord = null
){

    const id =
        existingRecord?.id ||
        createAOGRecordId();


    const durationMinutes =
        calculateAOGRecordDuration(
            record
        );


    const now =
        Date.now();


    const username =
        getAOGCurrentUsername();


    return {

        id:

            id,


        reg:

            record.reg,


        aircraftType:

            record.aircraftType,


        base:

            record.base,


        category:

            record.category,


        startDate:

            record.startDate,


        startTime:

            record.startTime,


        finishDate:

            record.finishDate,


        expectedFinishTime:

            record.expectedFinishTime,


        actualFinishTime:

            record.actualFinishTime,


        durationMinutes:

            Number.isFinite(
                durationMinutes
            )

                ? durationMinutes

                : 0,


        defect:

            record.defect,


        action:

            record.action,


        comments:

            record.comments ||
            "",


        importedOnTime:

            record.importedOnTime ||
            "",


        source:

            "EXCEL_IMPORT",


        sourceExcelRow:

            record.sourceExcelRow ||
            null,


        /*
            Preserve original creation
            information when overwriting.
        */

        createdAt:

            existingRecord?.createdAt ||
            now,


        createdBy:

            existingRecord?.createdBy ||
            username,


        /*
            Always update modification
            information.
        */

        updatedAt:

            now,


        updatedBy:

            username

    };

}

/* =========================================================
   CONFIRM AOG EXCEL IMPORT
========================================================= */

async function confirmAOGExcelImport(){

    if(
        AOG_EXCEL_IMPORT_STATE.importing
    ){

        return;

    }


    if(
        !AOG_EXCEL_IMPORT_STATE.analysed
    ){

        return;

    }


    const records =
        AOG_EXCEL_IMPORT_STATE.validRecords;


    if(
        !records.length
    ){

        aogShowError(
            "AOG Import",
            "There are no valid records ready to import."
        );

        return;

    }


    /*
        If duplicates exist in Firebase,
        ask the user first.
    */

    if(
        AOG_EXCEL_IMPORT_STATE
            .firebaseDuplicates
            .length > 0
    ){

        openAOGImportDuplicateDecision();

        return;

    }


    /*
        No Firebase duplicates.
        Import directly.
    */

    AOG_EXCEL_IMPORT_STATE.importMode =
        "ADD_ONLY_NEW";


    await executeAOGExcelImport();

}

/* =========================================================
   EXECUTE AOG EXCEL IMPORT
========================================================= */

async function executeAOGExcelImport(){

    if(
        AOG_EXCEL_IMPORT_STATE.importing
    ){

        return;

    }


    const records =
        AOG_EXCEL_IMPORT_STATE.validRecords;


    if(
        !records.length
    ){

        return;

    }


    AOG_EXCEL_IMPORT_STATE.importing =
        true;


    const button =
        document.getElementById(
            "aogConfirmExcelImportButton"
        );


    if(button){

        button.disabled =
            true;

        button.textContent =
            "IMPORTING...";

        button.style.opacity =
            ".65";

    }


    const status =
        document.getElementById(
            "aogExcelImportStatus"
        );


    try{

        /*
            -------------------------------------------------
            LOAD FRESH FIREBASE DATA
            -------------------------------------------------
        */

        const existingRecords =
            await loadExistingAOGRecordsForImport();


        /*
            -------------------------------------------------
            CREATE LOOKUP
            -------------------------------------------------
        */

        const existingByFingerprint =
            new Map();


        existingRecords.forEach(
            existing => {

                const fingerprint =
                    getAOGDuplicateFingerprint(
                        existing
                    );


                if(
                    fingerprint
                ){

                    existingByFingerprint.set(
                        fingerprint,
                        existing
                    );

                }

            }
        );


        /*
            -------------------------------------------------
            MULTI-PATH UPDATE
            -------------------------------------------------
        */

        const updates =
            {};


        const generatedRecords =
            [];


        const skippedRecords =
            [];


        const overwrittenRecords =
            [];


        const importedFingerprints =
            new Set();


        records.forEach(
            record => {

                const fingerprint =
                    getAOGDuplicateFingerprint(
                        record
                    );


                /*
                    Prevent duplicate rows inside
                    the same Excel from generating
                    multiple Firebase writes.
                */

                if(
                    importedFingerprints.has(
                        fingerprint
                    )
                ){

                    skippedRecords.push({

                        row:
                            record.sourceExcelRow,

                        reason:
                            "Duplicate row inside Excel file."

                    });

                    return;

                }


                importedFingerprints.add(
                    fingerprint
                );


                const existing =
                    existingByFingerprint.get(
                        fingerprint
                    );


                /*
                    ADD ONLY NEW
                */

                if(
                    existing &&
                    AOG_EXCEL_IMPORT_STATE
                        .importMode ===
                    "ADD_ONLY_NEW"
                ){

                    skippedRecords.push({

                        row:
                            record.sourceExcelRow,

                        reason:
                            "AOG record already exists in Firebase.",

                        existingId:
                            existing.id

                    });

                    return;

                }


                /*
                    OVERWRITE
                */

                const finalRecord =
                    buildAOGImportedRecord(
                        record,
                        existing
                            ? existing
                            : null
                    );


                const period =
                    getAOGMonthKey(
                        finalRecord.startDate
                    );


                if(
                    !/^\d{4}-\d{2}$/.test(
                        period
                    )
                ){

                    throw new Error(
                        `Invalid period for Excel row ${record.sourceExcelRow}.`
                    );

                }


                /*
                    OFFICIAL AOG FIREBASE PATH
                */

                const firebasePath =
    `${period}/records/${finalRecord.id}`


                /*
                    HARD SAFETY CHECK
                */

                if(
                    Object.prototype.hasOwnProperty.call(
                        updates,
                        firebasePath
                    )
                ){

                    throw new Error(
                        `Import safety check failed: duplicate Firebase path ${firebasePath}`
                    );

                }


                updates[
                    firebasePath
                ] =
                    finalRecord;


                generatedRecords.push({

                    ...finalRecord,

                    period

                });


                if(existing){

                    overwrittenRecords.push({

                        row:
                            record.sourceExcelRow,

                        id:
                            existing.id,

                        period:
                            period

                    });

                }

            }
        );


        /*
            Nothing to write.
        */

        if(
            !Object.keys(
                updates
            ).length
        ){

            closeAOGExcelImport();


            aogShowSuccess(

                "AOG Import",

                "No new AOG records were imported. All selected records already exist."

            );


            return;

        }


        /*
            -------------------------------------------------
            ONE MULTI-PATH FIREBASE UPDATE
            -------------------------------------------------
        */

await aogFirebaseUpdate(
    AOG_RECORDS_ROOT,
    updates
);


        /*
            -------------------------------------------------
            VERIFY
            -------------------------------------------------
        */

        const verification =
            await aogFirebaseGet(
                AOG_RECORDS_ROOT
            );


        if(
            !verification ||
            !verification.exists()
        ){

            throw new Error(
                "Firebase verification failed after import."
            );

        }


        const root =
            verification.val() ||
            {};


        let verifiedCount =
            0;


        generatedRecords.forEach(
            record => {

                const saved =
                    root?.[
                        record.period
                    ]?.records?.[
                        record.id
                    ];


                if(saved){

                    verifiedCount++;

                }

            }
        );


        if(
            verifiedCount !==
            generatedRecords.length
        ){

            throw new Error(

                `Firebase verification failed: ${verifiedCount} of ${generatedRecords.length} records were found after import.`

            );

        }


        /*
            -------------------------------------------------
            CLOSE MODALS
            -------------------------------------------------
        */

       const completedImportMode =
    AOG_EXCEL_IMPORT_STATE.importMode;


closeAOGImportDuplicateDecision();

// =================================================
// DETERMINE IMPORTED PERIOD
// =================================================

const importedPeriods =
    [
        ...new Set(
            generatedRecords
                .map(
                    record =>
                        record.period
                )
                .filter(
                    period =>
                        /^\d{4}-\d{2}$/.test(
                            period
                        )
                )
        )
    ];


/*
    If the Excel contains one month,
    use that month directly.

    If it contains several months,
    use the latest imported month.
*/

const importedPeriod =
    importedPeriods.length
        ? importedPeriods.sort(
            (
                a,
                b
            ) =>
                b.localeCompare(
                    a
                )
        )[0]
        : null;


// =================================================
// FULL AOG DASHBOARD RELOAD
// =================================================

await reloadAOGDashboardAfterImport(
    importedPeriod
);


// =================================================
// ONLY CLOSE MODAL AFTER DASHBOARD IS READY
// =================================================

closeAOGExcelImport();


// =================================================
// SUCCESS
// =================================================


const modeText =
    completedImportMode ===
    "OVERWRITE"

        ?

        "Existing duplicates were overwritten."

        :

        "Only new AOG records were added.";


        aogShowSuccess(

            "AOG Import Complete",

            `${verifiedCount} AOG records were imported and verified. ${modeText}`

        );


        console.log(
            "AOG IMPORT COMPLETE:",
            {
                mode:
                    AOG_EXCEL_IMPORT_STATE.importMode,

                imported:
                    verifiedCount,

                skipped:
                    skippedRecords.length,

                overwritten:
                    overwrittenRecords.length
            }
        );

    }

    catch(error){

        console.error(
            "AOG EXCEL FIREBASE IMPORT ERROR:",
            error
        );


        if(status){

            status.style.display =
                "block";


            status.innerHTML = `

                <div
                    class="
                        aog-excel-import-result
                        aog-excel-import-error
                    "
                >

                    <strong>
                        Import failed
                    </strong>


                    <span>
                        ${escapeAOGHtml(
                            error.message ||
                            "Unable to import AOG records."
                        )}
                    </span>

                </div>

            `;

        }


        if(button){

            button.disabled =
                false;

            button.textContent =
                "CONFIRM IMPORT";

            button.style.opacity =
                "1";

        }

    }

    finally{

        AOG_EXCEL_IMPORT_STATE.importing =
            false;

    }

}

// =========================================================
// FULL AOG DASHBOARD RELOAD AFTER DATA CHANGE
// =========================================================

async function reloadAOGDashboardAfterImport(
    preferredPeriod = null
){

    console.log(
        "AOG → starting full dashboard refresh..."
    );


    try{

        // =================================================
        // 1. RELOAD FIREBASE DATA
        // =================================================

        await loadAOGManagementRecords();


        console.log(
            "AOG → Firebase records:",
            AOG_MANAGEMENT_RECORDS.length
        );


        // =================================================
        // 2. REBUILD AVAILABLE PERIODS
        // =================================================

        populateAOGDashboardPeriods();


        const availablePeriods =
            getAOGDashboardAvailablePeriods();


        // =================================================
        // 3. DETERMINE PERIOD TO DISPLAY
        // =================================================
        //
        // Priority:
        //
        // 1. Period explicitly passed by Import
        // 2. Current selected period if it exists
        // 3. Latest available period
        //
        // =================================================

        let targetPeriod =
            null;


        /*
            -------------------------------------------------
            IMPORTED PERIOD
            -------------------------------------------------
        */

        if(
            preferredPeriod &&
            availablePeriods.includes(
                preferredPeriod
            )
        ){

            targetPeriod =
                preferredPeriod;

        }


        /*
            -------------------------------------------------
            CURRENT PERIOD
            -------------------------------------------------
        */

        if(
            !targetPeriod
        ){

            const currentPeriod =
                getAOGAnalysisPeriodKey(

                    CURRENT_AOG_ANALYSIS_YEAR,

                    CURRENT_AOG_ANALYSIS_MONTH

                );


            if(
                availablePeriods.includes(
                    currentPeriod
                )
            ){

                targetPeriod =
                    currentPeriod;

            }

        }


        /*
            -------------------------------------------------
            LATEST AVAILABLE PERIOD
            -------------------------------------------------
        */

        if(
            !targetPeriod &&
            availablePeriods.length
        ){

            targetPeriod =
                availablePeriods[0];

        }


        /*
            -------------------------------------------------
            NO DATA
            -------------------------------------------------
        */

        if(
            !targetPeriod
        ){

            const today =
                new Date();


            targetPeriod =
                getAOGAnalysisPeriodKey(

                    today.getFullYear(),

                    today.getMonth() + 1

                );

        }


        // =================================================
        // 4. SYNCHRONISE INTERNAL PERIOD STATE
        // =================================================

        const [
            targetYear,
            targetMonth
        ] =
            targetPeriod
                .split("-")
                .map(
                    Number
                );


        CURRENT_AOG_ANALYSIS_YEAR =
            targetYear;


        CURRENT_AOG_ANALYSIS_MONTH =
            targetMonth;


        console.log(
            "AOG → analysis period:",
            targetPeriod
        );


        // =================================================
        // 5. SYNCHRONISE SELECTOR
        // =================================================

        const selector =
            document.getElementById(
                "aogDashboardPeriod"
            );


        if(selector){

            /*
                Rebuild once more so the selector
                contains the freshly imported period.
            */

            populateAOGDashboardPeriods();


            selector.value =
                targetPeriod;

        }


        // =================================================
        // 6. CLEAR AOG CHARTS
        // =================================================

        if(
            window.activeCharts
        ){

            Object.keys(
                window.activeCharts
            )
            .forEach(
                key => {

                    if(
                        key
                            .toLowerCase()
                            .includes("aog")
                    ){

                        try{

                            window.activeCharts[
                                key
                            ].destroy();

                        }
                        catch(error){

                            console.warn(
                                "AOG chart cleanup:",
                                error
                            );

                        }


                        delete window.activeCharts[
                            key
                        ];

                    }

                }
            );

        }


        // =================================================
        // 7. CLEAR TREND CACHE
        // =================================================

        if(
            typeof AOG_TREND_STATE !==
            "undefined"
        ){

            AOG_TREND_STATE.rawData =
                null;

            AOG_TREND_STATE.periods =
                [];

        }


        // =================================================
        // 8. REFRESH PORTUGAL OVERVIEW
        // =================================================
        //
        // IMPORTANT:
        // CURRENT_AOG_ANALYSIS_YEAR/MONTH were
        // synchronised BEFORE this call.
        //
        // Therefore the KPI calculation now uses
        // the correct imported month.
        //
        // =================================================

        await refreshAOGPortugalOverview();


        // =================================================
        // 9. REFRESH DISTRIBUTION / BASE ANALYSIS
        // =================================================

        if(
            typeof refreshAOGDistributionAnalysis ===
            "function"
        ){

            await refreshAOGDistributionAnalysis();

        }


        // =================================================
        // 10. REFRESH SECTION 3
        // =================================================

        if(
            typeof refreshAOGSection3 ===
            "function"
        ){

            await refreshAOGSection3();

        }


        // =================================================
        // 11. REFRESH TREND ANALYSIS
        // =================================================

        if(
            typeof initializeAOGTrendAnalysis ===
            "function"
        ){

            await initializeAOGTrendAnalysis();

        }


        // =================================================
        // 12. OPTIONAL GLOBAL AOG ANALYSIS REFRESH
        // =================================================

        if(
            typeof updateAOGAnalysis ===
            "function"
        ){

            await updateAOGAnalysis();

        }


        // =================================================
        // 13. FINAL UI REPAINT
        // =================================================

        window.dispatchEvent(
            new Event(
                "resize"
            )
        );


        console.log(
            "AOG → dashboard refresh complete:",
            targetPeriod
        );


        return targetPeriod;

    }

    catch(error){

        console.error(
            "AOG → dashboard refresh failed:",
            error
        );


        throw error;

    }

}

/* =========================================================
   DUPLICATE IMPORT DECISION
========================================================= */

function openAOGImportDuplicateDecision(){

    const existing =
        document.getElementById(
            "aogImportDuplicateDecisionModal"
        );


    if(existing){

        existing.remove();

    }


    const count =
        AOG_EXCEL_IMPORT_STATE
            .firebaseDuplicates
            .length;


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "aogImportDuplicateDecisionModal";


    modal.className =
        "aog-management-overlay";


    modal.style.zIndex =
        "10020";


    modal.innerHTML = `

        <div
            class="aog-management-modal"
            style="
                max-width:560px;
                width:calc(100% - 32px);
            "
        >

            <div
                class="aog-management-header"
            >

                <div
                    class="aog-management-heading"
                >

                    <div
                        class="aog-management-eyebrow"
                    >
                        AOG IMPORT
                    </div>


                    <h2
                        class="aog-management-title"
                    >
                        Duplicate Records Found
                    </h2>


                    <div
                        class="aog-management-subtitle"
                    >
                        ${count}
                        ${
                            count === 1
                                ? "record already exists"
                                : "records already exist"
                        }
                        in Firebase.
                    </div>

                </div>


                <button
                    type="button"
                    class="aog-management-close"
                    onclick="
                        closeAOGImportDuplicateDecision()
                    "
                >
                    ×
                </button>

            </div>


            <div
                style="
                    padding:26px;
                "
            >

                <div
                    style="
                        padding:18px;
                        background:#f7f9fc;
                        border:1px solid #dbe3ef;
                        border-radius:12px;
                        line-height:1.6;
                        color:#27364b;
                    "
                >

                    <strong>
                        What do you want to do?
                    </strong>

                    <br><br>

                    <strong>
                        OVERWRITE DUPLICATES
                    </strong>

                    <br>

                    Replace the existing Firebase records
                    with the Excel data.

                    <br><br>

                    <strong>
                        ADD ONLY NEW
                    </strong>

                    <br>

                    Keep the existing records and import
                    only AOG records that do not already exist.

                </div>


                <div
                    style="
                        display:flex;
                        gap:12px;
                        justify-content:flex-end;
                        flex-wrap:wrap;
                        margin-top:24px;
                    "
                >

                    <button
                        type="button"
                        class="
                            aog-management-button
                            aog-management-button-grey
                        "
                        onclick="
                            closeAOGImportDuplicateDecision()
                        "
                    >

                        CANCEL

                    </button>


                    <button
                        type="button"
                        class="
                            aog-management-button
                            aog-management-button-grey
                        "
                        onclick="
                            confirmAOGImportMode(
                                'ADD_ONLY_NEW'
                            )
                        "
                    >

                        ADD ONLY NEW

                    </button>


                    <button
                        type="button"
                        class="
                            aog-management-button
                            aog-management-button-blue
                        "
                        onclick="
                            confirmAOGImportMode(
                                'OVERWRITE'
                            )
                        "
                    >

                        OVERWRITE DUPLICATES

                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    modal.addEventListener(
        "click",
        function(event){

            if(
                event.target ===
                modal
            ){

                closeAOGImportDuplicateDecision();

            }

        }
    );

}


/* =========================================================
   CLOSE DUPLICATE DECISION
========================================================= */

function closeAOGImportDuplicateDecision(){

    const modal =
        document.getElementById(
            "aogImportDuplicateDecisionModal"
        );


    if(modal){

        modal.remove();

    }

}


/* =========================================================
   CONFIRM IMPORT MODE
========================================================= */

function confirmAOGImportMode(
    mode
){

    if(
        mode !==
        "OVERWRITE" &&
        mode !==
        "ADD_ONLY_NEW"
    ){

        return;

    }


    AOG_EXCEL_IMPORT_STATE.importMode =
        mode;


    closeAOGImportDuplicateDecision();


    executeAOGExcelImport();

}

// =========================================================
// AOG SECTION 2 — BASE VIEW SELECTOR
// =========================================================

function changeAOGAnalysisBaseView(
    value
){

    const selected =
        String(
            value ||
            "ALL"
        )
        .trim()
        .toUpperCase();


    /*
     * ALL PORTUGAL
     */

    if(
        selected === "ALL"
    ){

        CURRENT_AOG_ANALYSIS_SCOPE =
            "ALL";

        CURRENT_AOG_ANALYSIS_BASE =
            "";

    }


    /*
     * INDIVIDUAL BASE
     */

    else if(
        [
            "OPO",
            "LIS",
            "FAO",
            "FNC"
        ]
        .includes(
            selected
        )
    ){

        CURRENT_AOG_ANALYSIS_SCOPE =
            "BASE";

        CURRENT_AOG_ANALYSIS_BASE =
            selected;

    }


    /*
     * SAFETY FALLBACK
     */

    else{

        CURRENT_AOG_ANALYSIS_SCOPE =
            "ALL";

        CURRENT_AOG_ANALYSIS_BASE =
            "";

    }


    /*
     * Refresh Section 2 only.
     */

    refreshAOGDistributionAnalysis();

}

// =========================================================
// AOG TREND — CONTROL HANDLERS
// =========================================================

function changeAOGTrendPeriod(){

    updateAOGTrendAnalysis();

}


function changeAOGTrendMetric(){

    updateAOGTrendAnalysis();

}


function changeAOGTrendCompare(){

    updateAOGTrendAnalysis();

}


function changeAOGTrendBase(){

    updateAOGTrendAnalysis();

}


// =========================================================
// GLOBAL ACCESS
// =========================================================

window.changeAOGTrendPeriod =
    changeAOGTrendPeriod;


window.changeAOGTrendMetric =
    changeAOGTrendMetric;


window.changeAOGTrendCompare =
    changeAOGTrendCompare;


window.changeAOGTrendBase =
    changeAOGTrendBase;

// =========================================================
// GLOBAL ACCESS
// =========================================================

window.initializeAOGTrendAnalysis =
    initializeAOGTrendAnalysis;


window.updateAOGTrendAnalysis =
    updateAOGTrendAnalysis;

/* =========================================================
   GLOBAL EXPORTS
========================================================= */

window.openAOGEditVisuals =
    openAOGEditVisuals;

window.openAOGManagementCenter =
    openAOGManagementCenter;

window.closeAOGManagementCenter =
    closeAOGManagementCenter;

window.openAOGAddRecord =
    openAOGAddRecord;

window.createAOGAddModal =
    createAOGAddModal;

window.requestCloseAOGAddModal =
    requestCloseAOGAddModal;

window.saveNewAOGRecord =
    saveNewAOGRecord;

window.openAOGRecordSearch =
    openAOGRecordSearch;

window.createAOGRecordSearchModal =
    createAOGRecordSearchModal;

window.openAOGSearchType =
    openAOGSearchType;

window.createAOGSearchResultsModal =
    createAOGSearchResultsModal;

window.refreshAOGSearchResults =
    refreshAOGSearchResults;

window.openAOGRecordDetails =
    openAOGRecordDetails;

window.createAOGDetailsModal =
    createAOGDetailsModal;

window.openAOGEditRecord =
    openAOGEditRecord;

window.createAOGEditModal =
    createAOGEditModal;

window.requestCloseAOGEditModal =
    requestCloseAOGEditModal;

window.saveAOGEditedRecord =
    saveAOGEditedRecord;

window.deleteAOGRecordFromDetails =
    deleteAOGRecordFromDetails;

window.openAOGCloseConfirmation =
    openAOGCloseConfirmation;

window.closeAOGConfirmationModal =
    closeAOGConfirmationModal;

window.resolveAOGClose =
    resolveAOGClose;

window.changeAOGManagementPeriodType =
    changeAOGManagementPeriodType;

window.changeAOGManagementYear =
    changeAOGManagementYear;

window.changeAOGResultsPeriod =
    changeAOGResultsPeriod;

window.refreshAOGSearchResults =
    refreshAOGSearchResults;

window.exportAOGSearchPDF =
    exportAOGSearchPDF;

window.resetAOGManagementFilters =
    resetAOGManagementFilters;

window.getAOGSearchPlaceholder =
    getAOGSearchPlaceholder;

// =========================================================
// GLOBAL API
// =========================================================

window.openAOG =
    openAOG;


window.closeAOG =
    closeAOG;


window.showAOG =
    showAOG;


window.hideAOG =
    hideAOG;


window.initializeAOG =
    initializeAOG;


window.exportAOGPDF =
    exportAOGPDF;


window.openAOGImport =
    openAOGImport;


window.openAOGEditVisuals =
    openAOGEditVisuals;


window.resetAOGData =
    resetAOGData;

/* =========================================================
   AOG DASHBOARD GLOBAL EXPORTS
========================================================= */

window.initializeAOGDashboard =
    initializeAOGDashboard;


window.changeAOGDashboardPeriod =
    changeAOGDashboardPeriod;


window.refreshAOGPortugalOverview =
    refreshAOGPortugalOverview;


window.openAOGCategoryBreakdown =
    openAOGCategoryBreakdown;


window.closeAOGCategoryBreakdown =
    closeAOGCategoryBreakdown;


window.openAOGLongestRecord =
    openAOGLongestRecord;


window.openAOGAddCategory =
    openAOGAddCategory;


window.openAOGEditCategory =
    openAOGEditCategory;


window.removeAOGCategory =
    removeAOGCategory;