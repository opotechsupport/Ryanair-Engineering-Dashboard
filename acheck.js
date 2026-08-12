// ======================================================
// EDIT PERIOD
// ======================================================

let EDIT_YEAR = null;

let EDIT_MONTH = null;

// ======================================================
// IMPORT PERIOD
// ======================================================

let IMPORT_YEAR = null;

let IMPORT_MONTH = null;

// ======================================================
// FIREBASE
// ======================================================

const ACHECK_COLLECTION = "dashboardData/acheck";

// ======================================================
// CURRENT PERIOD
// ======================================================

let CURRENT_ACHECK_YEAR = new Date().getFullYear();

let CURRENT_ACHECK_MONTH = new Date().getMonth() + 1;

// ======================================================
// CURRENT SHIFT
// ======================================================

let currentShift = "Night";

// ======================================================
// PERIOD KEY
// ======================================================

function getACheckPeriodKey(year, month){

    return `${year}-${String(month).padStart(2,"0")}`;

}

// ======================================================
// LOAD AVAILABLE PERIODS
// ======================================================

async function loadAvailableACheckPeriods(){

    const selector =
        document.getElementById("analysis-period");

    if(!selector) return;

    selector.innerHTML = "";

    try{

        const snapshot =
            await firebaseGet(

                firebaseRef(

                    database,

                    ACHECK_COLLECTION

                )

            );

        // ==================================================
        // EXISTEM DADOS
        // ==================================================

        if(snapshot.exists()){

            const periods =
                Object.keys(snapshot.val()).sort();

            periods.forEach(period=>{

                const option =
                    document.createElement("option");

                option.value = period;

                const [year,month] =
                    period.split("-");

                option.textContent =
                    new Date(

                        year,

                        month-1

                    ).toLocaleDateString(

                        "en-GB",

                        {

                            month:"long",

                            year:"numeric"

                        }

                    );

                selector.appendChild(option);

            });

        }

        // ==================================================
        // SEM DADOS
        // ==================================================

        else{

            const today = new Date();

            const period =
                getACheckPeriodKey(

                    today.getFullYear(),

                    today.getMonth()+1

                );

            const option =
                document.createElement("option");

            option.value = period;

            option.textContent =
                today.toLocaleDateString(

                    "en-GB",

                    {

                        month:"long",

                        year:"numeric"

                    }

                );

            selector.appendChild(option);

        }

        const currentPeriod =
    getACheckPeriodKey(

        CURRENT_ACHECK_YEAR,

        CURRENT_ACHECK_MONTH

    );

if(

    [...selector.options].some(

        o=>o.value===currentPeriod

    )

){

    selector.value =
        currentPeriod;

}else{

    selector.selectedIndex =
        selector.options.length-1;

}

    }

    catch(error){

        console.error(

            "Unable to load A-Check periods:",

            error

        );

    }

}

// ======================================================
// CREATE NEW A-CHECK PERIOD
// ======================================================

async function createACheckPeriod(year, month){

    CURRENT_ACHECK_YEAR = year;

    CURRENT_ACHECK_MONTH = month;

    appStates.Day =
        createZeroState("Day");

    appStates.Night =
        createZeroState("Night");

    await saveACheckData();

}

// ======================================================
// SAVE A-CHECK DATA
// ======================================================

async function saveACheckData(){

    const period =
        getACheckPeriodKey(

            CURRENT_ACHECK_YEAR,

            CURRENT_ACHECK_MONTH

        );

    try{

        await firebaseSet(

            firebaseRef(

                database,

                `${ACHECK_COLLECTION}/${period}`

            ),

            {

                metadata:{

                    updatedAt: Date.now(),

                    updatedBy: getCurrentUsername(),

                    version: 1

                },

                Day: appStates.Day,

                Night: appStates.Night

            }

        );

        // ==========================================
        // REFRESH PERIOD SELECTOR
        // ==========================================

        await loadAvailableACheckPeriods();

        const selector =
            document.getElementById("analysis-period");

        if(selector){

            selector.value =
                getACheckPeriodKey(

                    CURRENT_ACHECK_YEAR,

                    CURRENT_ACHECK_MONTH

                );

        }

    }

    catch(error){

        console.error(

            "Unable to save A-Check data:",

            error

        );

    }

}

// ======================================================
// CHANGE PERIOD
// ======================================================

async function changeACheckPeriod(period){

    const [year,month] =

        period.split("-").map(Number);

    CURRENT_ACHECK_YEAR = year;
    CURRENT_ACHECK_MONTH = month;

    await loadACheckData(

        year,

        month

    );

}

// ======================================================
// LOAD A-CHECK DATA
// ======================================================

async function loadACheckData(year,month){

    CURRENT_ACHECK_YEAR = year;
    CURRENT_ACHECK_MONTH = month;

    const period =
        getACheckPeriodKey(year,month);

    try{

        const snapshot =
            await firebaseGet(

                firebaseRef(

                    database,

                    `${ACHECK_COLLECTION}/${period}`

                )

            );

        if(snapshot.exists()){

            const data = snapshot.val();

            appStates.Day = {

    ...createZeroState("DAY CHECK"),

    ...data.Day

};

appStates.Night = {

    ...createZeroState("NIGHT CHECK"),

    ...data.Night

};

        }else{

            await createACheckPeriod(year,month);

        }

        renderDOM();

    }

    catch(error){

        console.error(error);

    }

}

// ======================================================
// A-CHECK INITIALIZATION
// ======================================================

async function initializeACheck(){

    await loadAvailableACheckPeriods();

    const selector =
        document.getElementById("analysis-period");

    if(selector.value){

        const [year,month] =
            selector.value
                .split("-")
                .map(Number);

        await loadACheckData(

            year,

            month

        );

    }

}

window.exportPDFReport = window.generatePDF =async function () {

    showPDFLoading();

const pdfHeader = document.getElementById("pdfReportHeader");

const periodLabel =
    document.getElementById("analysis-period")?.selectedOptions[0]?.text ||
    "Unknown Period";

document.getElementById("pdfReportPeriod").textContent = periodLabel;

document.getElementById("pdfGeneratedDate").textContent =
    new Date().toLocaleString("en-GB");

pdfHeader.style.display = "block";

    const { jsPDF } = window.jspdf;

    try{

        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const margin = 4;

        const usableWidth = pageWidth - margin * 2;
        const usableHeight = pageHeight - margin * 2;

        const controls = document.getElementById("controls-panel");
        const filters = document.getElementById("ui-filters");

        if (controls) controls.style.display = "none";
        if (filters) filters.style.display = "none";

        await new Promise(r => setTimeout(r,600));

        async function capture(wrapper){

    if(!wrapper){

        return null;

    }


    // =====================================================
    // FORCE CHARTS TO FINISH THEIR CURRENT RENDER
    // =====================================================

    if(
        window.activeCharts &&
        typeof window.activeCharts === "object"
    ){

        Object.values(
            window.activeCharts
        )
        .forEach(
            chart => {

                if(
                    chart &&
                    typeof chart.resize === "function"
                ){

                    chart.resize();

                }

                if(
                    chart &&
                    typeof chart.update === "function"
                ){

                    chart.update("none");

                }

            }
        );

    }


    // =====================================================
    // GIVE CHART.JS ONE FRAME TO FINISH
    // =====================================================

    await new Promise(
        resolve =>
            requestAnimationFrame(
                () => {

                    requestAnimationFrame(
                        resolve
                    );

                }
            )
    );


    // =====================================================
    // CAPTURE
    // =====================================================

    const canvas =
        await html2canvas(
            wrapper,
            {

                scale: 3,

                useCORS: true,

                allowTaint: true,

                backgroundColor:
                    "#FFFFFF",

                logging: false,

                scrollX: 0,

                scrollY: -window.scrollY,

                windowWidth:
                    document.documentElement
                        .scrollWidth,

                windowHeight:
                    document.documentElement
                        .scrollHeight,


                // =================================================
                // IMPORTANT:
                // Replace every Chart.js canvas in the CLONED DOM
                // with the actual rendered chart image.
                // =================================================

                onclone: function(
                    clonedDocument
                ){

                    const clonedCanvases =
                        clonedDocument
                            .querySelectorAll(
                                "canvas"
                            );


                    clonedCanvases.forEach(
                        clonedCanvas => {

                            const chartId =
                                clonedCanvas.id;


                            if(
                                !chartId
                            ){

                                return;

                            }


                            const chart =
                                window.activeCharts &&
                                window.activeCharts[
                                    chartId
                                ];


                            if(
                                !chart ||
                                typeof chart
                                    .toBase64Image
                                    !== "function"
                            ){

                                return;

                            }


                            try{

                                const image =
                                    clonedDocument
                                        .createElement(
                                            "img"
                                        );


                                image.src =
                                    chart.toBase64Image(
                                        "image/png",
                                        1
                                    );


                                image.style.width =
                                    clonedCanvas
                                        .style
                                        .width ||
                                    "100%";


                                image.style.height =
                                    clonedCanvas
                                        .style
                                        .height ||
                                    "100%";


                                image.style.display =
                                    "block";


                                image.style.objectFit =
                                    "contain";


                                image.width =
                                    clonedCanvas.width;


                                image.height =
                                    clonedCanvas.height;


                                clonedCanvas
                                    .parentNode
                                    .replaceChild(
                                        image,
                                        clonedCanvas
                                    );

                            }

                            catch(error){

                                console.warn(
                                    "PDF chart conversion failed:",
                                    chartId,
                                    error
                                );

                            }

                        }
                    );

                }

            }
        );


    return canvas;

}

        async function addWrapper(wrapper){

    const exportContainer = document.createElement("div");

    exportContainer.style.background = "#FFFFFF";
    exportContainer.style.padding = "0";
    exportContainer.style.width = wrapper.offsetWidth + "px";

    exportContainer.appendChild(
        document.getElementById("pdfReportHeader").cloneNode(true)
    );

    exportContainer.appendChild(
        wrapper.cloneNode(true)
    );

    exportContainer.style.position = "absolute";
    exportContainer.style.left = "-99999px";
    exportContainer.style.top = "0";

    document.body.appendChild(exportContainer);

    const canvas = await capture(exportContainer);

    document.body.removeChild(exportContainer);

    const img = canvas.toDataURL("image/png");

    const currentPageWidth = pdf.internal.pageSize.getWidth();
    const currentPageHeight = pdf.internal.pageSize.getHeight();

    const currentUsableWidth = currentPageWidth - margin * 2;
    const currentUsableHeight = currentPageHeight - margin * 2;

    let w = currentUsableWidth;
    let h = canvas.height * w / canvas.width;

    if(h > currentUsableHeight){

        const ratio = currentUsableHeight / h;

        h *= ratio;
        w *= ratio;

    }

    const x = (currentPageWidth - w) / 2;
    const y = (currentPageHeight - h) / 2;

    pdf.addImage(
        img,
        "PNG",
        x,
        y,
        w,
        h,
        "",
        "FAST"
    );

}

        const wrappers = [

            document.getElementById("ax-duration-wrapper"),
            document.getElementById("ax-variation-wrapper"),
            document.getElementById("manpower-wrapper"),
            document.getElementById("perf-wrapper"),
            document.getElementById("deferred-wrapper"),
            document.getElementById("hils-wrapper"),
document.getElementById("pn-wrapper")

        ];

        for(let i = 0; i < wrappers.length; i++){

            updatePDFLoading(i + 1, wrappers.length);

            if(i > 0){

                if(i < 4){
                    pdf.addPage("a4", "landscape");
                }else{
                    pdf.addPage("a4", "portrait");
                }

            }

            await addWrapper(wrappers[i]);

        }

        const periodName =
    document.getElementById("analysis-period")
    ?.selectedOptions[0]
    ?.text
    ?.replace(/[\/\\:*?"<>|]/g, "")
    ?.replace(/\s+/g, "_") || "Unknown_Period";

pdf.save(`Ryanair_A-Check_Report_${periodName}.pdf`);

        if (controls) controls.style.display = "";
        if (filters) filters.style.display = "";

    }
    finally{

    document.getElementById("pdfReportHeader").style.display = "none";

    hidePDFLoading();

}

};
        function createEmptyState(badgeName) {
            return {
                shiftLabel: badgeName, month1: "APRIL", month2: "MAY",
                ngTot: "7:09", ngPrev: "6:20", ngCurr: "6:43", ngLTime: "7:55", ngLSup: "Vitor Pinto", ngLChk: "AX03", ngSTime: "5:00", ngSSup: "Alex Kunz", ngSChk: "AX04",
                maxTot: "6:31", maxPrev: "6:00", maxCurr: "6:20", maxLTime: "9:30", maxLSup: "Vitor Pinto", maxLChk: "AX02", maxSTime: "4:30", maxSSup: "Carlos Silva", maxSChk: "AX02",
                
                ngPairNum: 10, ngPairTime: "06:32", ngOddNum: 8, ngOddTime: "06:41",
                maxPairNum: 6, maxPairTime: "06:09", maxOddNum: 5, maxOddTime: "06:20",

                ngAX: [5, 4, 3, 2, 2, 1],
                maxAX: [2, 3, 4, 1, 1, 0],

                chartPoints: [
                    { label: "M1", ng: 7.2, max: 6.5, mp: 12 },
                    { label: "M2", ng: 6.8, max: 6.2, mp: 14 },
                    { label: "M3", ng: 7.5, max: 7.0, mp: 11 },
                    { label: "M4", ng: 6.4, max: 6.0, mp: 15 },
                    { label: "M5", ng: 6.9, max: 6.1, mp: 13 },
                    { label: "M6", ng: 6.7, max: 6.3, mp: 14 }
                ],
                defLabels: ['FEB', 'MAR', 'APR', 'MAY'],
                ngDefParts: [4, 6, 3, 5], ngDefTime: [2, 3, 1, 4],
                maxDefParts: [3, 4, 2, 6], maxDefTime: [1, 2, 2, 3],

                flow: [
                    { id: 'late', label: 'LATE ARR.', ngV: '1', ngA: 'N', ngR: 'N/A', mxV: '0', mxA: 'N', mxR: 'N/A' },
                    { id: 'ops', label: 'OPS.', ngV: '0', ngA: 'N', ngR: 'N/A', mxV: '1', mxA: 'N', mxR: 'N/A' },
                    { id: 'early', label: 'EARLY DEP.', ngV: '2', ngA: 'N', ngR: 'N/A', mxV: '0', mxA: 'N', mxR: 'N/A' },
                    { id: 'eng', label: 'ENG. (FR)', ngV: '0', ngA: 'N', ngR: 'N/A', mxV: '0', mxA: 'N', mxR: 'N/A' },
                    { id: 'prt', label: 'NO PARTS', ngV: '4', ngA: 'Y', ngR: 'EPD-10/05', mxV: '2', mxA: 'N', mxR: 'N/A' },
                    { id: 'tol', label: 'NO TOOLS', ngV: '0', ngA: 'Y', ngR: '-', mxV: '0', mxA: 'Y', mxR: '-' }
                ],
                
                def3mNG: [{label: "Task 1", count: 5}, {label: "Task 2", count: 3}], 
                def3mMAX: [{label: "Task A", count: 4}, {label: "Task B", count: 2}], 
                stockNG: [{day: "10", pn: "PN-123", spa: "Suave", stock: "0", obs: "A aguardar"}], 
                stockMAX: [{day: "12", pn: "PN-999", spa: "Urgente", stock: "2", obs: "Ok"}], 
                tasksNG: [{ax: "AX01", task: "Task-55", pn1: "P1", pn2: "P2", day: "05"}], 
                tasksMAX: [{ax: "AX03", task: "Task-99", pn1: "P3", pn2: "-", day: "14"}],

                hilsNGAvg: 34, hilsNGPrev: 50, hilsNGCurr: 12, hilsNGCurrColor: 'green',
                hilsMAXAvg: 17, hilsMAXPrev: 0, hilsMAXCurr: 27, hilsMAXCurrColor: 'red',
                hilsLabels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY'],
                hilsNGData: [30, 40, 35, 50, 12], hilsMAXData: [10, 15, 20, 0, 27],

                hilsSuperLabels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
                hilsSuperNG: [
                    { name: 'Vitor Pinto', data: [5, 4, 6, 5, 3, 4] },
                    { name: 'Alex Kunz', data: [3, 3, 4, 2, 5, 3] }
                ],
                hilsSuperMAX: [
                    { name: 'Carlos Silva', data: [2, 4, 3, 5, 2, 3] },
                    { name: 'Vitor Pinto', data: [4, 2, 5, 3, 4, 2] }
                ],

                pnOutNG: 7, pnOutMAX: 28,
                hilsCurrLabels: ['V. Pinto', 'A. Kunz', 'C. Silva'], hilsCurrData: [12, 8, 15],
                topPnNG: [{pn: "PN-A", mat: "Class 1", hils: "5", stock: "0"}], 
                topPnMAX: [{pn: "PN-B", mat: "Class 2", hils: "8", stock: "1"}], 
                topPn3mNG: [{pn: "PN-A", count: 15}], 
                topPn3mMAX: [{pn: "PN-B", count: 22}], 
                axVariationData: [
                    { month: '2025-10', mech: 14, avio: 4, ngDur: 7.83, maxDur: 6.28 },
                    { month: '2025-11', mech: 12, avio: 3, ngDur: 8.15, maxDur: 7.11 },
                    { month: '2025-12', mech: 11, avio: 2, ngDur: 7.88, maxDur: 7.00 },
                    { month: '2026-01', mech: 12, avio: 4, ngDur: 7.11, maxDur: 6.00 },
                    { month: '2026-02', mech: 13, avio: 4, ngDur: 6.36, maxDur: 7.03 },
                    { month: '2026-03', mech: 14, avio: 3, ngDur: 6.85, maxDur: 6.41 },
                    { month: '2026-04', mech: 15, avio: 3, ngDur: 6.33, maxDur: 6.00 },
                    { month: '2026-05', mech: 15, avio: 4, ngDur: 6.71, maxDur: 6.33 }
                ],
                manpowerAnalysisData: [
                    { mp: 11, ng: '8:28', max: 'N/A' }, { mp: 12, ng: '8:00', max: 'N/A' }, { mp: 13, ng: '7:16', max: '6:41' },
                    { mp: 14, ng: '8:07', max: '7:22' }, { mp: 15, ng: '7:24', max: '6:38' }, { mp: 16, ng: '7:18', max: '6:47' },
                    { mp: 17, ng: '6:28', max: '6:16' }, { mp: 18, ng: '6:34', max: '6:03' }, { mp: 19, ng: '7:02', max: '7:00' },
                    { mp: 20, ng: '7:01', max: '5:57' }, { mp: 21, ng: '6:28', max: '6:31' }
                ]
            };
        }

        let appStates = {
            'ALL': createEmptyState('ALL SHIFTS'),
            'Night': createEmptyState('NIGHT SHIFT'),
            'Day': createEmptyState('DAY SHIFT')
        };

        const dropShadowPlugin = {
            id: 'dropShadow',
            beforeDraw: (chart) => {
                if (chart.config.type !== 'pie') return; 
                const ctx = chart.ctx;
                ctx.save();
                ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
                ctx.shadowBlur = 15;
                ctx.shadowOffsetX = 5;
                ctx.shadowOffsetY = 10;
            },
            afterDraw: (chart) => {
                if (chart.config.type !== 'pie') return;
                chart.ctx.restore();
            }
        };

        function createZeroState(badgeName) {

    return {

        shiftLabel: badgeName,
        month1: "",
        month2: "",

        //==========================
        // AX DURATION
        //==========================

        ngTot:"0:00",
        ngPrev:"0:00",
        ngCurr:"0:00",
        ngLTime:"0:00",
        ngLSup:"",
        ngLChk:"",
        ngSTime:"0:00",
        ngSSup:"",
        ngSChk:"",

        maxTot:"0:00",
        maxPrev:"0:00",
        maxCurr:"0:00",
        maxLTime:"0:00",
        maxLSup:"",
        maxLChk:"",
        maxSTime:"0:00",
        maxSSup:"",
        maxSChk:"",

        ngPairNum:0,
        ngPairTime:"0:00",
        ngOddNum:0,
        ngOddTime:"0:00",

        maxPairNum:0,
        maxPairTime:"0:00",
        maxOddNum:0,
        maxOddTime:"0:00",

        ngAX:[0,0,0,0,0,0],
        maxAX:[0,0,0,0,0,0],

        //==========================
        // AX VARIATION
        //==========================

        chartPoints:[
            {label:"",ng:0,max:0,mp:0},
            {label:"",ng:0,max:0,mp:0},
            {label:"",ng:0,max:0,mp:0},
            {label:"",ng:0,max:0,mp:0},
            {label:"",ng:0,max:0,mp:0},
            {label:"",ng:0,max:0,mp:0}
        ],

        defLabels:["","","",""],

        ngDefParts:[0,0,0,0],
        ngDefTime:[0,0,0,0],

        maxDefParts:[0,0,0,0],
        maxDefTime:[0,0,0,0],

        //==========================
        // FLOW
        //==========================

        flow:[
            {id:'late',label:'LATE ARR.',ngV:'0',ngA:'N',ngR:'',mxV:'0',mxA:'N',mxR:''},
            {id:'ops',label:'OPS.',ngV:'0',ngA:'N',ngR:'',mxV:'0',mxA:'N',mxR:''},
            {id:'early',label:'EARLY DEP.',ngV:'0',ngA:'N',ngR:'',mxV:'0',mxA:'N',mxR:''},
            {id:'eng',label:'ENG. (FR)',ngV:'0',ngA:'N',ngR:'',mxV:'0',mxA:'N',mxR:''},
            {id:'prt',label:'NO PARTS',ngV:'0',ngA:'N',ngR:'',mxV:'0',mxA:'N',mxR:''},
            {id:'tol',label:'NO TOOLS',ngV:'0',ngA:'N',ngR:'',mxV:'0',mxA:'N',mxR:''}
        ],

        def3mNG:[
            {label:"",count:0}
        ],

        def3mMAX:[
            {label:"",count:0}
        ],

                //==========================
        // STOCK / TABLES
        //==========================

        stockNG:[],
        stockMAX:[],

        tasksNG:[],
        tasksMAX:[],

        //==========================
        // HIL'S
        //==========================

        hilsNGAvg:0,
        hilsNGPrev:0,
        hilsNGCurr:0,
        hilsNGCurrColor:"green",

        hilsMAXAvg:0,
        hilsMAXPrev:0,
        hilsMAXCurr:0,
        hilsMAXCurrColor:"green",

        hilsLabels:["","","","",""],

        hilsNGData:[0,0,0,0,0],
        hilsMAXData:[0,0,0,0,0],

        hilsSuperLabels:["","","","","",""],

        hilsSuperNG:[
            {
                name:"",
                data:[0,0,0,0,0,0]
            }
        ],

        hilsSuperMAX:[
            {
                name:"",
                data:[0,0,0,0,0,0]
            }
        ],

        pnOutNG:0,
        pnOutMAX:0,

        hilsCurrLabels:["","",""],
        hilsCurrData:[0,0,0],

        //==========================
        // TOP P/N
        //==========================

        topPnNG:[
            {
                pn:"",
                mat:"",
                hils:0,
                stock:0
            }
        ],

        topPnMAX:[
            {
                pn:"",
                mat:"",
                hils:0,
                stock:0
            }
        ],

        topPn3mNG:[
            {
                pn:"",
                count:0
            }
        ],

        topPn3mMAX:[
            {
                pn:"",
                count:0
            }
        ],

                //==========================
        // AX VARIATION TABLE
        //==========================

        axVariationData:[
            {month:"",mech:0,avio:0,ngDur:0,maxDur:0},
            {month:"",mech:0,avio:0,ngDur:0,maxDur:0},
            {month:"",mech:0,avio:0,ngDur:0,maxDur:0},
            {month:"",mech:0,avio:0,ngDur:0,maxDur:0},
            {month:"",mech:0,avio:0,ngDur:0,maxDur:0},
            {month:"",mech:0,avio:0,ngDur:0,maxDur:0},
            {month:"",mech:0,avio:0,ngDur:0,maxDur:0},
            {month:"",mech:0,avio:0,ngDur:0,maxDur:0}
        ],

        //==========================
        // MANPOWER ANALYSIS
        //==========================

        manpowerAnalysisData:[
            {mp:11,ng:"0:00",max:"0:00"},
            {mp:12,ng:"0:00",max:"0:00"},
            {mp:13,ng:"0:00",max:"0:00"},
            {mp:14,ng:"0:00",max:"0:00"},
            {mp:15,ng:"0:00",max:"0:00"},
            {mp:16,ng:"0:00",max:"0:00"},
            {mp:17,ng:"0:00",max:"0:00"},
            {mp:18,ng:"0:00",max:"0:00"},
            {mp:19,ng:"0:00",max:"0:00"},
            {mp:20,ng:"0:00",max:"0:00"},
            {mp:21,ng:"0:00",max:"0:00"}
        ]

    };

}

        function sanitizeState(state, defaultLabel) {
            if (!state) return createEmptyState(defaultLabel);
            let def = createEmptyState(state.shiftLabel || defaultLabel);
            for (let key in def) {
                if (state[key] === undefined || state[key] === null) {
                    state[key] = def[key];
                } else if (Array.isArray(def[key])) {
                    if (!Array.isArray(state[key])) {
                        state[key] = Object.values(state[key]);
                    }
                    if (key === 'hilsSuperNG' || key === 'hilsSuperMAX') {
                        state[key] = state[key].map(item => {
                            if (item.data && !Array.isArray(item.data)) {
                                item.data = Object.values(item.data);
                            }
                            return item;
                        });
                    }
                }
            }
            return state;
        }

        window.setDisplay = function(type) {
            ['All', 'MAX', 'NG'].forEach(x => {
                let el = document.getElementById('btnType'+x);
                if(el) el.classList.remove('active');
            });
            let act = document.getElementById('btnType'+ (type==='ALL'?'All':type));
            if(act) act.classList.add('active');
            
            let showNG = (type === 'ALL' || type === 'NG') ? 'flex' : 'none';
            let showMAX = (type === 'ALL' || type === 'MAX') ? 'flex' : 'none';

            document.querySelectorAll('.ax-col.ng').forEach(el => el.style.display = showNG);
            document.querySelectorAll('.ax-col.max').forEach(el => el.style.display = showMAX);
        };

        window.changeActiveShift = function(shiftName) {
            ['Night', 'Day'].forEach(x => {
                let el = document.getElementById('btnShift' + x);
                if(el) el.classList.remove('active');
            });
            let activeEl = document.getElementById('btnShift' + shiftName);
            if(activeEl) activeEl.classList.add('active');
            currentShift = shiftName;
            renderDOM();
        };

        function renderDOM() {
            let s = appStates[currentShift];

            document.getElementById('disp-shift').innerText = s.shiftLabel;
            document.getElementById('disp-shift-perf').innerText = s.shiftLabel;
            document.getElementById('disp-shift-def').innerText = s.shiftLabel; 
            document.getElementById('disp-shift-hils').innerText = s.shiftLabel; 
            
            document.querySelectorAll('.disp-month1').forEach(el => el.innerText = s.month1);
            document.querySelectorAll('.disp-month2').forEach(el => el.innerText = s.month2);
            document.querySelectorAll('.month2-disp').forEach(el => el.innerText = s.month2);

            document.getElementById('disp-ng-tot').innerText = s.ngTot; document.getElementById('disp-ng-prev').innerText = s.ngPrev; document.getElementById('disp-ng-curr').innerText = s.ngCurr;
            document.getElementById('disp-ng-long-time').innerText = s.ngLTime; document.getElementById('disp-ng-long-super').innerText = s.ngLSup; document.getElementById('disp-ng-long-check').innerText = s.ngLChk;
            document.getElementById('disp-ng-short-time').innerText = s.ngSTime; document.getElementById('disp-ng-short-super').innerText = s.ngSSup; document.getElementById('disp-ng-short-check').innerText = s.ngSChk;
            
            document.getElementById('disp-max-tot').innerText = s.maxTot; document.getElementById('disp-max-prev').innerText = s.maxPrev; document.getElementById('disp-max-curr').innerText = s.maxCurr;
            document.getElementById('disp-max-long-time').innerText = s.maxLTime; document.getElementById('disp-max-long-super').innerText = s.maxLSup; document.getElementById('disp-max-long-check').innerText = s.maxLChk;
            document.getElementById('disp-max-short-time').innerText = s.maxSTime; document.getElementById('disp-max-short-super').innerText = s.maxSSup; document.getElementById('disp-max-short-check').innerText = s.maxSChk;
            
            document.getElementById('disp-ng-pair-num').innerText = s.ngPairNum; document.getElementById('disp-ng-pair-time').innerText = s.ngPairTime;
            document.getElementById('disp-ng-odd-num').innerText = s.ngOddNum; document.getElementById('disp-ng-odd-time').innerText = s.ngOddTime;
            document.getElementById('disp-max-pair-num').innerText = s.maxPairNum; document.getElementById('disp-max-pair-time').innerText = s.maxPairTime;
            document.getElementById('disp-max-odd-num').innerText = s.maxOddNum; document.getElementById('disp-max-odd-time').innerText = s.maxOddTime;

            let labels = s.chartPoints.map(p => p.label);
            let ngData = s.chartPoints.map(p => p.ng);
            let maxData = s.chartPoints.map(p => p.max);
            let mpData = s.chartPoints.map(p => p.mp || 0);

            drawMixedDurationChart('chart-ng', labels, ngData, mpData, '#d4ac0d', '737 NG - 3 MONTH MOBIL AVERAGE CHART', 'NG');
            drawMixedDurationChart('chart-max', labels, maxData, mpData, '#003399', '737 MAX - 3 MONTH MOBIL AVERAGE CHART', 'MAX');

            let varLabels = s.axVariationData.map(p => p.month);
            let varMech = s.axVariationData.map(p => p.mech);
            let varAvio = s.axVariationData.map(p => p.avio);
            let varNgDur = s.axVariationData.map(p => p.ngDur);
            let varMaxDur = s.axVariationData.map(p => p.maxDur);
            
            drawAxVariationChart('chart-ax-variation', varLabels, varMech, varAvio, varNgDur, varMaxDur);
            renderManpowerAnalysisTable(s.manpowerAnalysisData);

            drawPieChart('chart-ng-perf', s.ngAX, 'A-CHECKS PERFORMED (NG)', true);
            drawPieChart('chart-max-perf', s.maxAX, 'A-CHECKS PERFORMED (MAX)', false);

            populateDeferredTable('table-ng-def', s.defLabels, s.ngDefParts, s.ngDefTime);
            populateDeferredTable('table-max-def', s.defLabels, s.maxDefParts, s.maxDefTime);
            drawDeferredChart('chart-ng-def', s.defLabels, s.ngDefParts, s.ngDefTime);
            drawDeferredChart('chart-max-def', s.defLabels, s.maxDefParts, s.maxDefTime);

            ['ng', 'max'].forEach(fleet => {
                s.flow.forEach(row => {
                    let valEl = document.getElementById(`${fleet}-fl-${row.id}-v`);
                    let regEl = document.getElementById(`${fleet}-fl-${row.id}-r`);
                    if(valEl) valEl.innerText = row[`${fleet==='ng' ? 'ngV' : 'mxV'}`];
                    if(regEl) regEl.innerText = row[`${fleet==='ng' ? 'ngR' : 'mxR'}`] || '-';
                    
                    let aogEl = document.getElementById(`${fleet}-fl-${row.id}-a`);
                    if(aogEl) {
                        let isYes = row[`${fleet==='ng' ? 'ngA' : 'mxA'}`] === 'Y';
                        aogEl.className = 'aog-icon ' + (isYes ? 'yes' : 'no');
                        aogEl.innerHTML = isYes ? '✓' : '✕';
                    }
                });
            });
            
            drawDef3MChart('chart-ng-3m', s.def3mNG.map(x=>x.label), s.def3mNG.map(x=>x.count), '#4a6da7', 'DEFERRED TASKS IN THE LAST 3 MONTHS');
            drawDef3MChart('chart-max-3m', s.def3mMAX.map(x=>x.label), s.def3mMAX.map(x=>x.count), '#4a6da7', 'DEFERRED TASKS IN THE LAST 3 MONTHS');

            document.getElementById('tb-stock-ng').innerHTML = `<thead><tr><th>DAY</th><th>P/N</th><th>SPA</th><th>STOCK</th><th>OBS.</th></tr></thead>`;
            renderDataTable('tb-stock-ng', s.stockNG, true);

            document.getElementById('tb-stock-max').innerHTML = `<thead><tr><th>DAY</th><th>P/N</th><th>SPA</th><th>STOCK</th><th>OBS.</th></tr></thead>`;
            renderDataTable('tb-stock-max', s.stockMAX, true);

            document.getElementById('tb-tasks-ng').innerHTML = `<thead><tr><th>AX</th><th>TASK</th><th>PN #1</th><th>PN #2</th><th>DAY</th></tr></thead>`;
            renderDataTable('tb-tasks-ng', s.tasksNG, false);

            document.getElementById('tb-tasks-max').innerHTML = `<thead><tr><th>AX</th><th>TASK</th><th>PN #1</th><th>PN #2</th><th>DAY</th></tr></thead>`;
            renderDataTable('tb-tasks-max', s.tasksMAX, false);

            document.getElementById('disp-ng-hils-avg').innerText = s.hilsNGAvg;
            document.getElementById('disp-ng-hils-prev').innerText = s.hilsNGPrev;
            let ngHilsCurr = document.getElementById('disp-ng-hils-curr');
            ngHilsCurr.innerText = s.hilsNGCurr;
            ngHilsCurr.className = s.hilsNGCurrColor === 'green' ? 'bg-green' : (s.hilsNGCurrColor === 'red' ? 'bg-red' : 'bg-none');

            document.getElementById('disp-max-hils-avg').innerText = s.hilsMAXAvg;
            document.getElementById('disp-max-hils-prev').innerText = s.hilsMAXPrev;
            let maxHilsCurr = document.getElementById('disp-max-hils-curr');
            maxHilsCurr.innerText = s.hilsMAXCurr;
            maxHilsCurr.className = s.hilsMAXCurrColor === 'green' ? 'bg-green' : (s.hilsMAXCurrColor === 'red' ? 'bg-red' : 'bg-none');

            drawDef3MChart('chart-ng-hils', s.hilsLabels, s.hilsNGData, '#4a6da7', "Open HIL's Not Closed at A-Check");
            drawDef3MChart('chart-max-hils', s.hilsLabels, s.hilsMAXData, '#4a6da7', "Open HIL's Not Closed at A-Check");

            drawMultiLineChart('chart-ng-hils-super', s.hilsSuperLabels, s.hilsSuperNG, '3 MONTH MOBIL AVERAGE');
            drawMultiLineChart('chart-max-hils-super', s.hilsSuperLabels, s.hilsSuperMAX, '3 MONTH MOBIL AVERAGE');

            document.getElementById('disp-ng-pn-out').innerText = s.pnOutNG;
            document.getElementById('disp-max-pn-out').innerText = s.pnOutMAX;

            let currMonthLabels = s.hilsCurrLabels.length > 0 ? s.hilsCurrLabels : ['F. Montenegro', 'D. Correia', 'H. Basto', 'H. Dias', 'V. Pinto', 'J. Louro', 'A. Oliveira', 'A. Kunz', 'C. Silva', 'H. Carneiro'];
            drawCurrMonthBarChart('chart-curr-month', currMonthLabels, s.hilsCurrData, '#4a6da7');

            renderTopPnTable('tb-top-pn-ng', s.topPnNG);
            renderTopPnTable('tb-top-pn-max', s.topPnMAX);

            let ngTopPnLabels = s.topPn3mNG.map(x => x.pn);
            let ngTopPnData = s.topPn3mNG.map(x => parseInt(x.count) || 0);
            let maxTopPnLabels = s.topPn3mMAX.map(x => x.pn);
            let maxTopPnData = s.topPn3mMAX.map(x => parseInt(x.count) || 0);

            drawSimpleBarChart('chart-ng-top-pn-3m', ngTopPnLabels, ngTopPnData, '#196f92', 'TOP REQUESTED P/N IN THE LAST 3M');
            drawSimpleBarChart('chart-max-top-pn-3m', maxTopPnLabels, maxTopPnData, '#4a6da7', 'TOP REQUESTED P/N IN THE LAST 3M');
        }

        window.addDynamicRow = function(tableBodyId, type) {
            let tbody = document.getElementById(tableBodyId);
            let tr = document.createElement('tr');
            if (type === 'chartPoints') {
                tr.innerHTML = `<td style="text-align:center; font-weight:bold;">-</td><td><input type="text"></td><td><input type="number" step="0.01"></td><td><input type="number" step="0.01"></td><td><input type="number"></td>`;
            } else if (type === 'defPoints') {
                tr.innerHTML = `<td><input type="text" style="font-weight:bold;"></td><td><input type="number"></td><td><input type="number"></td><td><input type="number"></td><td><input type="number"></td>`;
            } else if (type === 'def3m') {
                tr.innerHTML = `<td><input type="text"></td><td><input type="number"></td>`;
            } else if (type === 'hilsPoints') {
                tr.innerHTML = `<td><input type="text" style="font-weight:bold;"></td><td><input type="number"></td><td><input type="number"></td>`;
            } else if (type === 'hilsSuper') {
                tr.innerHTML = `<td><input type="text"></td><td><input type="number" step="0.1"></td><td><input type="number" step="0.1"></td><td><input type="number" step="0.1"></td><td><input type="number" step="0.1"></td><td><input type="number" step="0.1"></td><td><input type="number" step="0.1"></td>`;
            } else if (type === 'stock') {
                tr.innerHTML = `<td><input type="text"></td><td><input type="text"></td><td><input type="text"></td><td><input type="text"></td><td><input type="text"></td>`;
            } else if (type === 'tasks') {
                tr.innerHTML = `<td><input type="text"></td><td><input type="text"></td><td><input type="text"></td><td><input type="text"></td><td><input type="text"></td>`;
            } else if (type === 'topPn') {
                tr.innerHTML = `<td><input type="text"></td><td><input type="text"></td><td><input type="text"></td><td><input type="text"></td>`;
            } else if (type === 'axVariation') {
                tr.innerHTML = `<td><input type="text" style="font-weight:bold;"></td><td><input type="number"></td><td><input type="number"></td><td><input type="number" step="0.01"></td><td><input type="number" step="0.01"></td>`;
            } else if (type === 'manpowerAnalysis') {
                tr.innerHTML = `<td><input type="number"></td><td><input type="text"></td><td><input type="text"></td>`;
            } 
            tbody.appendChild(tr);
        };

        window.removeDynamicRow = function(tableBodyId) {
            let tbody = document.getElementById(tableBodyId);
            if (tbody && tbody.children.length > 0) {
                tbody.removeChild(tbody.lastElementChild);
            }
        };

        function readTableData(tbodyId, keys) {
            let tbody = document.getElementById(tbodyId);
            let data = [];
            if(!tbody) return data;
            for (let tr of tbody.children) {
                let inputs = tr.querySelectorAll('input');
                let rowObj = {};
                keys.forEach((key, index) => {
                    if(inputs[index]) rowObj[key] = inputs[index].value;
                });
                data.push(rowObj);
            }
            return data;
        }

        function renderTopPnTable(tableId, dataArray) {
            let table = document.getElementById(tableId);
            if(!table) return;
            table.innerHTML = `
                <thead>
                    <tr>
                        <th style="font-size:11px;">PN</th>
                        <th style="font-size:11px;">MATERIAL<br>CLASS</th>
                        <th style="line-height: 1.2; font-size:11px;">NUMBER OF HIL'S<br><span style="font-size:9px;text-transform:none;font-weight:normal;">(in which the PN was requested)</span></th>
                        <th style="font-size:11px;">STOCK</th>
                    </tr>
                </thead>
                <tbody>
                    ${dataArray.map(row => {
                        let stockClass = (row.stock === '0') ? 'stock-zero-badge' : 'stock-ok-badge';
                        return `<tr><td style="font-weight: 600; font-size:13px;">${row.pn}</td><td style="font-size:13px;">${row.mat}</td><td style="font-size:13px;">${row.hils}</td><td style="font-size:13px;"><span class="${stockClass}">${row.stock}</span></td></tr>`;
                    }).join('')}
                </tbody>
            `;
        }

        function renderDataTable(tableId, dataArray, isStock) {

    let table = document.getElementById(tableId);

    if(!table) return;

    if(!Array.isArray(dataArray)){

        console.warn(

            "Invalid dataArray for",

            tableId,

            dataArray

        );

        return;

    }

    let tbody = table.querySelector('tbody');

    if (!tbody) {

        tbody = document.createElement('tbody');

        table.appendChild(tbody);

    }
            tbody.innerHTML = '';
            dataArray.forEach(row => {
                let html = '';
                if (isStock) {
                    let stockClass = (row.stock === '0' || row.stock === 0) ? 'stock-zero-badge' : 'stock-ok-badge';
                    html = `<tr><td style="font-weight: 600;">${row.day}</td><td>${row.pn}</td><td>${row.spa}</td><td><span class="${stockClass}">${row.stock}</span></td><td style="font-size: 10px; text-align: left;">${row.obs}</td></tr>`;
                } else {
                    html = `<tr><td style="font-weight: 600;">${row.ax}</td><td>${row.task}</td><td>${row.pn1}</td><td>${row.pn2}</td><td>${row.day}</td></tr>`;
                }
                tbody.innerHTML += html;
            });
        }

        window.openACheckEditModal = function() {
            let s = appStates[currentShift];
            document.getElementById('modal-shift-indicator').innerText = `Editing: ${currentShift} Data`;
            
            document.getElementById('in-shift').value = s.shiftLabel;
            document.getElementById('in-month1').value = s.month1; document.getElementById('in-month2').value = s.month2;
            
            document.getElementById('in-ng-tot').value = s.ngTot; document.getElementById('in-ng-prev').value = s.ngPrev; document.getElementById('in-ng-curr').value = s.ngCurr;
            document.getElementById('in-ng-l-time').value = s.ngLTime; document.getElementById('in-ng-l-sup').value = s.ngLSup; document.getElementById('in-ng-l-chk').value = s.ngLChk;
            document.getElementById('in-ng-s-time').value = s.ngSTime; document.getElementById('in-ng-s-sup').value = s.ngSSup; document.getElementById('in-ng-s-chk').value = s.ngSChk;
            document.getElementById('in-ng-pair-num').value = s.ngPairNum; document.getElementById('in-ng-pair-time').value = s.ngPairTime;
            document.getElementById('in-ng-odd-num').value = s.ngOddNum; document.getElementById('in-ng-odd-time').value = s.ngOddTime;
            for(let i=0; i<6; i++) document.getElementById(`in-ng-ax${i+1}`).value = s.ngAX[i];

            document.getElementById('in-max-tot').value = s.maxTot; document.getElementById('in-max-prev').value = s.maxPrev; document.getElementById('in-max-curr').value = s.maxCurr;
            document.getElementById('in-max-l-time').value = s.maxLTime; document.getElementById('in-max-l-sup').value = s.maxLSup; document.getElementById('in-max-l-chk').value = s.maxLChk;
            document.getElementById('in-max-s-time').value = s.maxSTime; document.getElementById('in-max-s-sup').value = s.maxSSup; document.getElementById('in-max-s-chk').value = s.maxSChk;
            document.getElementById('in-max-pair-num').value = s.maxPairNum; document.getElementById('in-max-pair-time').value = s.maxPairTime;
            document.getElementById('in-max-odd-num').value = s.maxOddNum; document.getElementById('in-max-odd-time').value = s.maxOddTime;
            for(let i=0; i<6; i++) document.getElementById(`in-max-ax${i+1}`).value = s.maxAX[i];

            let tbodyChart = document.getElementById('chart-inputs-body');
            tbodyChart.innerHTML = '';
            s.chartPoints.forEach((p, i) => {
                tbodyChart.innerHTML += `<tr><td style="font-weight:bold; text-align:center;">${i+1}</td><td><input type="text" value="${p.label}"></td><td><input type="number" step="0.01" value="${p.ng !== null ? p.ng : ''}"></td><td><input type="number" step="0.01" value="${p.max !== null ? p.max : ''}"></td><td><input type="number" value="${p.mp !== undefined ? p.mp : ''}"></td></tr>`;
            });

            let axVarTbody = document.getElementById('ax-variation-inputs-body');
            axVarTbody.innerHTML = '';
            s.axVariationData.forEach(row => {
                axVarTbody.innerHTML += `<tr><td><input type="text" value="${row.month}" style="font-weight:bold;"></td><td><input type="number" value="${row.mech}"></td><td><input type="number" value="${row.avio}"></td><td><input type="number" step="0.01" value="${row.ngDur}"></td><td><input type="number" step="0.01" value="${row.maxDur}"></td></tr>`;
            });
            let mpAnalysisTbody = document.getElementById('manpower-analysis-inputs-body');
            mpAnalysisTbody.innerHTML = '';
            s.manpowerAnalysisData.forEach(row => {
                mpAnalysisTbody.innerHTML += `<tr><td><input type="number" value="${row.mp}"></td><td><input type="text" value="${row.ng}"></td><td><input type="text" value="${row.max}"></td></tr>`;
            });

            let defTbody = document.getElementById('deferred-inputs-body');
            defTbody.innerHTML = '';
            s.defLabels.forEach((lbl, i) => {
                defTbody.innerHTML += `<tr><td><input type="text" value="${lbl}" style="font-weight:bold;"></td><td><input type="number" value="${s.ngDefParts[i] !== undefined ? s.ngDefParts[i] : 0}"></td><td><input type="number" value="${s.ngDefTime[i] !== undefined ? s.ngDefTime[i] : 0}"></td><td><input type="number" value="${s.maxDefParts[i] !== undefined ? s.maxDefParts[i] : 0}"></td><td><input type="number" value="${s.maxDefTime[i] !== undefined ? s.maxDefTime[i] : 0}"></td></tr>`;
            });

            let flowTbody = document.getElementById('flow-inputs-body');
            flowTbody.innerHTML = '';
            s.flow.forEach((row, i) => {
                flowTbody.innerHTML += `<tr><td style="font-weight:bold; font-size:11px;">${row.label}</td><td><input type="text" id="fl-ngV-${i}" value="${row.ngV}"></td><td><select id="fl-ngA-${i}"><option value="Y" ${row.ngA==='Y'?'selected':''}>Y (Check)</option><option value="N" ${row.ngA==='N'?'selected':''}>N (Cross)</option></select></td><td><input type="text" id="fl-ngR-${i}" value="${row.ngR}"></td><td><input type="text" id="fl-mxV-${i}" value="${row.mxV}"></td><td><select id="fl-mxA-${i}"><option value="Y" ${row.mxA==='Y'?'selected':''}>Y (Check)</option><option value="N" ${row.mxA==='N'?'selected':''}>N (Cross)</option></select></td><td><input type="text" id="fl-mxR-${i}" value="${row.mxR}"></td></tr>`;
            });
            
            let d3NgBody = document.getElementById('def3m-ng-inputs-body');
            d3NgBody.innerHTML = '';
            s.def3mNG.forEach(row => { d3NgBody.innerHTML += `<tr><td><input type="text" value="${row.label}"></td><td><input type="number" value="${row.count}"></td></tr>`; });

            let d3MaxBody = document.getElementById('def3m-max-inputs-body');
            d3MaxBody.innerHTML = '';
            s.def3mMAX.forEach(row => { d3MaxBody.innerHTML += `<tr><td><input type="text" value="${row.label}"></td><td><input type="number" value="${row.count}"></td></tr>`; });

            let tbStockNg = document.getElementById('stock-ng-inputs-body');
            tbStockNg.innerHTML = '';
            s.stockNG.forEach(row => { tbStockNg.innerHTML += `<tr><td><input type="text" value="${row.day}"></td><td><input type="text" value="${row.pn}"></td><td><input type="text" value="${row.spa}"></td><td><input type="text" value="${row.stock}"></td><td><input type="text" value="${row.obs}"></td></tr>`; });

            let tbStockMax = document.getElementById('stock-max-inputs-body');
            tbStockMax.innerHTML = '';
            s.stockMAX.forEach(row => { tbStockMax.innerHTML += `<tr><td><input type="text" value="${row.day}"></td><td><input type="text" value="${row.pn}"></td><td><input type="text" value="${row.spa}"></td><td><input type="text" value="${row.stock}"></td><td><input type="text" value="${row.obs}"></td></tr>`; });

            let tbTaskNg = document.getElementById('tasks-ng-inputs-body');
            tbTaskNg.innerHTML = '';
            s.tasksNG.forEach(row => { tbTaskNg.innerHTML += `<tr><td><input type="text" value="${row.ax}"></td><td><input type="text" value="${row.task}"></td><td><input type="text" value="${row.pn1}"></td><td><input type="text" value="${row.pn2}"></td><td><input type="text" value="${row.day}"></td></tr>`; });

            let tbTaskMax = document.getElementById('tasks-max-inputs-body');
            tbTaskMax.innerHTML = '';
            s.tasksMAX.forEach(row => { tbTaskMax.innerHTML += `<tr><td><input type="text" value="${row.ax}"></td><td><input type="text" value="${row.task}"></td><td><input type="text" value="${row.pn1}"></td><td><input type="text" value="${row.pn2}"></td><td><input type="text" value="${row.day}"></td></tr>`; });

            let tbTopPnNg = document.getElementById('top-pn-ng-inputs');
            tbTopPnNg.innerHTML = '';
            s.topPnNG.forEach(row => { tbTopPnNg.innerHTML += `<tr><td><input type="text" value="${row.pn}"></td><td><input type="text" value="${row.mat}"></td><td><input type="text" value="${row.hils}"></td><td><input type="text" value="${row.stock}"></td></tr>`; });

            let tbTopPnMax = document.getElementById('top-pn-max-inputs');
            tbTopPnMax.innerHTML = '';
            s.topPnMAX.forEach(row => { tbTopPnMax.innerHTML += `<tr><td><input type="text" value="${row.pn}"></td><td><input type="text" value="${row.mat}"></td><td><input type="text" value="${row.hils}"></td><td><input type="text" value="${row.stock}"></td></tr>`; });

            let tbTopPn3mNg = document.getElementById('top-pn-3m-ng-inputs');
            tbTopPn3mNg.innerHTML = '';
            s.topPn3mNG.forEach(row => { tbTopPn3mNg.innerHTML += `<tr><td><input type="text" value="${row.pn}"></td><td><input type="number" value="${row.count}"></td></tr>`; });

            let tbTopPn3mMax = document.getElementById('top-pn-3m-max-inputs');
            tbTopPn3mMax.innerHTML = '';
            s.topPn3mMAX.forEach(row => { tbTopPn3mMax.innerHTML += `<tr><td><input type="text" value="${row.pn}"></td><td><input type="number" value="${row.count}"></td></tr>`; });

            document.getElementById('in-ng-hils-avg').value = s.hilsNGAvg;
            document.getElementById('in-ng-hils-prev').value = s.hilsNGPrev;
            document.getElementById('in-ng-hils-curr').value = s.hilsNGCurr;
            document.getElementById('in-ng-hils-color').value = s.hilsNGCurrColor;

            document.getElementById('in-max-hils-avg').value = s.hilsMAXAvg;
            document.getElementById('in-max-hils-prev').value = s.hilsMAXPrev;
            document.getElementById('in-max-hils-curr').value = s.hilsMAXCurr;
            document.getElementById('in-max-hils-color').value = s.hilsMAXCurrColor;

            let hilsTbody = document.getElementById('hils-inputs-body');
            hilsTbody.innerHTML = '';
            s.hilsLabels.forEach((lbl, i) => {
                hilsTbody.innerHTML += `<tr><td><input type="text" value="${lbl}" style="font-weight:bold;"></td><td><input type="number" value="${s.hilsNGData[i]}"></td><td><input type="number" value="${s.hilsMAXData[i]}"></td></tr>`;
            });

            let hilsSupNgTbody = document.getElementById('hils-super-ng-inputs');
            hilsSupNgTbody.innerHTML = '';
            s.hilsSuperNG.forEach(row => {

    const data = Array.isArray(row.data)
        ? row.data
        : [0,0,0,0,0,0];
                hilsSupNgTbody.innerHTML += `<tr><td><input type="text" value="${row.name}"></td><td><input type="number" step="0.1" value="${data[0] !== null ? data[0] : ''}"></td><td><input type="number" step="0.1" value="${data[1] !== null ? data[1] : ''}"></td><td><input type="number" step="0.1" value="${data[2] !== null ? data[2] : ''}"></td><td><input type="number" step="0.1" value="${data[3] !== null ? data[3] : ''}"></td><td><input type="number" step="0.1" value="${data[4] !== null ? data[4] : ''}"></td><td><input type="number" step="0.1" value="${data[5] !== null ? data[5] : ''}"></td></tr>`;
            });

            let hilsSupMaxTbody = document.getElementById('hils-super-max-inputs');
            hilsSupMaxTbody.innerHTML = '';
            s.hilsSuperMAX.forEach(row => {

    const data = Array.isArray(row.data)
        ? row.data
        : [0,0,0,0,0,0];
                hilsSupMaxTbody.innerHTML += `<tr><td><input type="text" value="${row.name}"></td><td><input type="number" step="0.1" value="${data[0] !== null ? data[0] : ''}"></td><td><input type="number" step="0.1" value="${data[1] !== null ? data[1] : ''}"></td><td><input type="number" step="0.1" value="${data[2] !== null ? data[2] : ''}"></td><td><input type="number" step="0.1" value="${data[3] !== null ? data[3] : ''}"></td><td><input type="number" step="0.1" value="${data[4] !== null ? data[4] : ''}"></td><td><input type="number" step="0.1" value="${data[5] !== null ? data[5] : ''}"></td></tr>`;
            });

            document.getElementById('in-pnout-ng').value = s.pnOutNG;
            document.getElementById('in-pnout-max').value = s.pnOutMAX;

            let hilsCurrMonthBody = document.getElementById('hils-curr-month-inputs');
            hilsCurrMonthBody.innerHTML = '';
            s.hilsCurrLabels.forEach((label, i) => {
                hilsCurrMonthBody.innerHTML += `<tr><td><input type="text" value="${label}"></td><td><input type="number" value="${s.hilsCurrData[i]}"></td></tr>`;
            });

            document.getElementById('aCheckEditModal').style.display = 'flex';
            // --- ATUALIZA  O: Preencher os inputs dos meses ao abrir o modal ---
            const hilsInputs = document.querySelectorAll('#hils-super-labels-inputs .hils-month-input');
            hilsInputs.forEach((input, index) => {
              // Se o array s.hilsSuperLabels existir e tiver este  ndice, usa-o. Caso contr rio, deixa o padr o M1, M2...
              if (s.hilsSuperLabels && s.hilsSuperLabels[index]) {
                input.value = s.hilsSuperLabels[index];
              } else {
                input.value = `M${index + 1}`;
              }
            });
        };
        



        window.closeACheckEditModal = async function(){ 
            document.getElementById('aCheckEditModal').style.display = 'none';
        };

        window.saveACheckVisualData = async function(){
            let s = appStates[currentShift];

            // --- ATUALIZA  O: Recolher os novos nomes dos meses ao gravar ---
            const hilsInputsAoGravar = document.querySelectorAll('#hils-super-labels-inputs .hils-month-input');
            s.hilsSuperLabels = []; // Limpa o array antigo para meter os novos valores
            
            hilsInputsAoGravar.forEach((input) => {
              // Guarda o valor inserido. Se estiver vazio, coloca um tra o ou o placeholder por seguran a
              s.hilsSuperLabels.push(input.value.trim() || '---');
            });
            
            // A partir daqui, o teu c digo original j  deve chamar a fun  o:
            // drawMultiLineChart('chart-ng-hils-super', s.hilsSuperLabels, ...);
        
            
            s.shiftLabel = document.getElementById('in-shift').value;
            s.month1 = document.getElementById('in-month1').value; s.month2 = document.getElementById('in-month2').value;
            
            s.ngTot = document.getElementById('in-ng-tot').value; s.ngPrev = document.getElementById('in-ng-prev').value; s.ngCurr = document.getElementById('in-ng-curr').value;
            s.ngLTime = document.getElementById('in-ng-l-time').value; s.ngLSup = document.getElementById('in-ng-l-sup').value; s.ngLChk = document.getElementById('in-ng-l-chk').value;
            s.ngSTime = document.getElementById('in-ng-s-time').value; s.ngSSup = document.getElementById('in-ng-s-sup').value; s.ngSChk = document.getElementById('in-ng-s-chk').value;
            s.ngPairNum = parseInt(document.getElementById('in-ng-pair-num').value) || 0; s.ngPairTime = document.getElementById('in-ng-pair-time').value;
            s.ngOddNum = parseInt(document.getElementById('in-ng-odd-num').value) || 0; s.ngOddTime = document.getElementById('in-ng-odd-time').value;
            for(let i=0; i<6; i++) s.ngAX[i] = parseInt(document.getElementById(`in-ng-ax${i+1}`).value) || 0;

            s.maxTot = document.getElementById('in-max-tot').value; s.maxPrev = document.getElementById('in-max-prev').value; s.maxCurr = document.getElementById('in-max-curr').value;
            s.maxLTime = document.getElementById('in-max-l-time').value; s.maxLSup = document.getElementById('in-max-l-sup').value; s.maxLChk = document.getElementById('in-max-l-chk').value;
            s.maxSTime = document.getElementById('in-max-s-time').value; s.maxSSup = document.getElementById('in-max-s-sup').value; s.maxSChk = document.getElementById('in-max-s-chk').value;
            s.maxPairNum = parseInt(document.getElementById('in-max-pair-num').value) || 0; s.maxPairTime = document.getElementById('in-max-pair-time').value;
            s.maxOddNum = parseInt(document.getElementById('in-max-odd-num').value) || 0; s.maxOddTime = document.getElementById('in-max-odd-time').value;
            for(let i=0; i<6; i++) s.maxAX[i] = parseInt(document.getElementById(`in-max-ax${i+1}`).value) || 0;

            s.chartPoints = [];
            for (let tr of document.getElementById('chart-inputs-body').children) {
                let ins = tr.querySelectorAll('input');
                if(ins.length >= 4) {
                    let ngV = parseFloat(ins[1].value); let mxV = parseFloat(ins[2].value); let mpV = parseInt(ins[3].value);
                    s.chartPoints.push({ label: ins[0].value, ng: isNaN(ngV)?null:ngV, max: isNaN(mxV)?null:mxV, mp: isNaN(mpV)?0:mpV });
                }
            }

            s.defLabels = []; s.ngDefParts = []; s.ngDefTime = []; s.maxDefParts = []; s.maxDefTime = [];
            for (let tr of document.getElementById('deferred-inputs-body').children) {
                let ins = tr.querySelectorAll('input');
                s.defLabels.push(ins[0].value);
                s.ngDefParts.push(parseInt(ins[1].value)||0); s.ngDefTime.push(parseInt(ins[2].value)||0);
                s.maxDefParts.push(parseInt(ins[3].value)||0); s.maxDefTime.push(parseInt(ins[4].value)||0);
            }

            s.flow.forEach((row, i) => {
                row.ngV = document.getElementById(`fl-ngV-${i}`).value; row.ngA = document.getElementById(`fl-ngA-${i}`).value; row.ngR = document.getElementById(`fl-ngR-${i}`).value;
                row.mxV = document.getElementById(`fl-mxV-${i}`).value; row.mxA = document.getElementById(`fl-mxA-${i}`).value; row.mxR = document.getElementById(`fl-mxR-${i}`).value;
            });
            
            s.def3mNG = readTableData('def3m-ng-inputs-body', ['label', 'count']); s.def3mMAX = readTableData('def3m-max-inputs-body', ['label', 'count']);
            s.stockNG = readTableData('stock-ng-inputs-body', ['day', 'pn', 'spa', 'stock', 'obs']); s.stockMAX = readTableData('stock-max-inputs-body', ['day', 'pn', 'spa', 'stock', 'obs']);
            s.tasksNG = readTableData('tasks-ng-inputs-body', ['ax', 'task', 'pn1', 'pn2', 'day']); s.tasksMAX = readTableData('tasks-max-inputs-body', ['ax', 'task', 'pn1', 'pn2', 'day']);
            s.topPnNG = readTableData('top-pn-ng-inputs', ['pn', 'mat', 'hils', 'stock']); s.topPnMAX = readTableData('top-pn-max-inputs', ['pn', 'mat', 'hils', 'stock']);
            s.topPn3mNG = readTableData('top-pn-3m-ng-inputs', ['pn', 'count']); s.topPn3mMAX = readTableData('top-pn-3m-max-inputs', ['pn', 'count']);

            s.hilsNGAvg = document.getElementById('in-ng-hils-avg').value; s.hilsNGPrev = document.getElementById('in-ng-hils-prev').value;
            s.hilsNGCurr = document.getElementById('in-ng-hils-curr').value; s.hilsNGCurrColor = document.getElementById('in-ng-hils-color').value;
            s.hilsMAXAvg = document.getElementById('in-max-hils-avg').value; s.hilsMAXPrev = document.getElementById('in-max-hils-prev').value;
            s.hilsMAXCurr = document.getElementById('in-max-hils-curr').value; s.hilsMAXCurrColor = document.getElementById('in-max-hils-color').value;

            s.hilsLabels = []; s.hilsNGData = []; s.hilsMAXData = [];
            for (let tr of document.getElementById('hils-inputs-body').children) {
                let ins = tr.querySelectorAll('input');
                s.hilsLabels.push(ins[0].value);
                s.hilsNGData.push(parseInt(ins[1].value)||0); s.hilsMAXData.push(parseInt(ins[2].value)||0);
            }

            s.hilsSuperNG = [];
            for (let tr of document.getElementById('hils-super-ng-inputs').children) {
                let ins = tr.querySelectorAll('input'); let dataArr = [];
                for(let k=1; k<=6; k++) { let val = parseFloat(ins[k].value); dataArr.push(isNaN(val) ? null : val); }
                s.hilsSuperNG.push({name: ins[0].value, data: dataArr});
            }

            s.hilsSuperMAX = [];
            for (let tr of document.getElementById('hils-super-max-inputs').children) {
                let ins = tr.querySelectorAll('input'); let dataArr = [];
                for(let k=1; k<=6; k++) { let val = parseFloat(ins[k].value); dataArr.push(isNaN(val) ? null : val); }
                s.hilsSuperMAX.push({name: ins[0].value, data: dataArr});
            }

            s.pnOutNG = document.getElementById('in-pnout-ng').value; s.pnOutMAX = document.getElementById('in-pnout-max').value;

            s.hilsCurrLabels = []; s.hilsCurrData = [];
            for (let tr of document.getElementById('hils-curr-month-inputs').children) {
                let ins = tr.querySelectorAll('input');
                s.hilsCurrLabels.push(ins[0].value); s.hilsCurrData.push(parseInt(ins[1].value)||0);
            }
            s.axVariationData = [];
            for (let tr of document.getElementById('ax-variation-inputs-body').children) {
                let ins = tr.querySelectorAll('input');
                s.axVariationData.push({
                    month: ins[0].value,
                    mech: parseInt(ins[1].value) || 0,
                    avio: parseInt(ins[2].value) || 0,
                    ngDur: parseFloat(ins[3].value) || 0,
                    maxDur: parseFloat(ins[4].value) || 0
                });
            }
            s.manpowerAnalysisData = [];
            for (let tr of document.getElementById('manpower-analysis-inputs-body').children) {
                let ins = tr.querySelectorAll('input');
                s.manpowerAnalysisData.push({ mp: parseInt(ins[0].value) || 0, ng: ins[1].value, max: ins[2].value });
            }

            appStates[currentShift] = s;

// ==========================================
// REFRESH DASHBOARD
// ==========================================

renderDOM();

// ==========================================
// SAVE TO FIREBASE
// ==========================================

await saveACheckData();

// ==========================================
// CLOSE MODAL
// ==========================================

closeACheckEditModal();

// ==========================================
// RELOAD CURRENT PERIOD
// ==========================================

await loadACheckData(

    CURRENT_ACHECK_YEAR,

    CURRENT_ACHECK_MONTH

);

showSuccess(

    "Dashboard Updated",

    `A-Check dashboard successfully updated for ${getACheckPeriodKey(

        CURRENT_ACHECK_YEAR,

        CURRENT_ACHECK_MONTH

    )}.`

);

        }

        // ======================================================
// A-CHECK — EXCEL IMPORT
// ======================================================
//
// IMPORTANTE:
// Este é apenas o ponto de entrada do Excel.
//
// O parsing/mapping dos dados será feito por:
//     parseACheckExcel(workbook)
//
// A aplicação ao Edit Visuals será feita por:
//     applyACheckExcelToEditState(importedData)
//
// NÃO fazemos mappings de células aqui.
// NÃO assumimos posições fixas.
// NÃO preenchemos dados desconhecidos.
//
// ======================================================

window.handleExcelUpload = function(event){

    const file =
        event?.target?.files?.[0];

    if(!file){

        return;

    }


    // ==============================================
    // IMPORT PERIOD
    // ==============================================

    if(
        IMPORT_YEAR !== null &&
        IMPORT_YEAR !== undefined
    ){

        CURRENT_ACHECK_YEAR =
            Number(
                IMPORT_YEAR
            );

    }


    if(
        IMPORT_MONTH !== null &&
        IMPORT_MONTH !== undefined
    ){

        CURRENT_ACHECK_MONTH =
            Number(
                IMPORT_MONTH
            );

    }


    // ==============================================
    // READ EXCEL
    // ==============================================

    const reader =
        new FileReader();


    reader.onload =
        async function(e){

            try{

                // ======================================
                // READ WORKBOOK
                // ======================================

                const data =
                    new Uint8Array(
                        e.target.result
                    );


                const workbook =
                    XLSX.read(

                        data,

                        {
                            type:"array"
                        }

                    );


                // ======================================
                // SAFETY
                // ======================================

                if(
                    !workbook ||
                    !Array.isArray(
                        workbook.SheetNames
                    ) ||
                    workbook.SheetNames.length === 0
                ){

                    throw new Error(
                        "NO_EXCEL_SHEET_FOUND"
                    );

                }


                // ======================================
                // PARSE
                // ======================================
                //
                // IMPORTANT:
                // parseACheckExcel() is deliberately
                // separate from this function.
                //
                // It will only parse the sections
                // that we explicitly mapped.
                //

                const importedData =
                    parseACheckExcel(
                        workbook
                    );


                // ======================================
                // SAFETY
                // ======================================

                if(
                    !importedData ||
                    typeof importedData !== "object"
                ){

                    throw new Error(
                        "INVALID_ACHECK_EXCEL_DATA"
                    );

                }


                // ======================================
                // LOAD SELECTED PERIOD
                // ======================================
                //
                // This keeps the Excel import aligned
                // with the selected reporting period.
                //

                await loadACheckData(

                    CURRENT_ACHECK_YEAR,

                    CURRENT_ACHECK_MONTH

                );


                // ======================================
                // APPLY IMPORTED DATA
                // ======================================
                //
                // This function will only write values
                // that the parser identified with
                // sufficient confidence.
                //
                // Unknown / ambiguous fields remain
                // null / empty for manual completion.
                //

                applyACheckExcelToEditState(

                    importedData

                );


                // ======================================
                // OPEN EDIT VISUALS
                // ======================================

                window.openACheckEditModal();


                // ======================================
                // DEBUG
                // ======================================

                console.log(

                    "A-CHECK EXCEL IMPORT:",
                    importedData

                );


            }

            catch(error){

                console.error(

                    "A-CHECK EXCEL IMPORT ERROR:",
                    error

                );


                showError(

                    "Excel Import",

                    "Unable to analyse the selected A-Check Excel file."

                );

            }

        };


    // ==============================================
    // START FILE READER
    // ==============================================

    reader.readAsArrayBuffer(
        file
    );


    // ==============================================
    // RESET INPUT
    // ==============================================

    event.target.value = "";

};

        function renderManpowerAnalysisTable(data) {
            const tbody = document.getElementById('tb-manpower-body');
            if(tbody) tbody.innerHTML = (data || []).map(row => `<tr><td style="font-weight: 700;">${row.mp}</td><td>${row.ng}</td><td>${row.max}</td></tr>`).join('');
        }

        window.clearCurrentShiftData = function () {

    showConfirmation(

    "Clear Current Shift",

    `Are you sure you want to clear ALL ${currentShift} Check Form?\n\nThis action cannot be undone.`,

    async () => {

        // Repor os dados desse turno para os valores por defeito
        appStates[currentShift] = createZeroState(
            currentShift === "Night"
                ? "NIGHT SHIFT"
                : "DAY SHIFT"
        );

        // Manter apenas o nome do turno
        appStates[currentShift].shiftLabel =
            currentShift === "Night"
                ? "NIGHT CHECK"
                : "DAY CHECK";

        renderDOM();

        showSuccess(
            "Current Shift Cleared",
            "The current report has been cleared. Data stored in Firebase has not been modified."
        );

    }

);

return;

        }
        // ==========================================
        // --- FUN  ES DE DESENHO E GERENCIAMENTO ---
        // ==========================================

        function safeChartInit(canvasId, config){

    if(!window.activeCharts){

        window.activeCharts = {};

    }

    if(window.activeCharts[canvasId]){

        window.activeCharts[canvasId].destroy();

    }

    const el = document.getElementById(canvasId);

    if(!el){

        console.warn("Canvas not found:", canvasId);

        return;

    }

    window.activeCharts[canvasId] =
        new Chart(

            el.getContext("2d"),

            config

        );

}
        
        function drawMixedDurationChart(canvasId, labels, lineData, barData, lineColor, titleText, fleetName) {
            safeChartInit(canvasId, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        { type: 'line', label: fleetName, data: lineData, borderColor: lineColor, backgroundColor: lineColor, borderWidth: 3, pointRadius: 4, fill: false, tension: 0.3, yAxisID: 'y' },
                        { type: 'bar', label: 'MANPOWER', data: barData, backgroundColor: 'rgba(113, 128, 150, 0.6)', borderColor: 'rgba(113, 128, 150, 0.8)', borderWidth: 1, barPercentage: 0.5, yAxisID: 'y1' }
                    ]
                },
                plugins: [ChartDataLabels],
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        title: { display: true, text: titleText, font: {size: 14, weight: 'bold'}, color: '#2d3748', padding: {bottom: 16} },
                        legend: { display: true, position: 'top', align: 'end', labels: { usePointStyle: false, boxWidth: 12, font: {size: 11} } },
                        datalabels: {
                            display: true,
                            formatter: function(value, context) {
                                // Se o valor for nulo, n o mostra nada no gr fico
                                if (value == null) return '';
                                
                                // Retorna o valor exato que foi inserido na tabela (sem converter para horas/minutos)
                                return value;
                            },
                            align: function(context) { return context.dataset.type === 'line' ? 'top' : 'center'; },
                            anchor: function(context) { return context.dataset.type === 'line' ? 'bottom' : 'center'; },
                            color: function(context) { return context.dataset.type === 'line' ? '#2d3748' : '#ffffff'; },
                            font: { weight: 'bold', size: 11 }
                        }
                    },
                    scales: {
                        y: { type: 'linear', position: 'left', grid: { color: '#edf2f7' } },
                        y1: { type: 'linear', position: 'right', beginAtZero: true, max: 20, grid: { display: false } }
                    }
                }
            });
        }

        function drawPieChart(canvasId, axDataArray, titleText, isNg) {
            let colors = isNg ? ['#fef5d0', '#f9e79f', '#f4d03f', '#f1c40f', '#d4ac0d', '#9a7d0a'] : ['#e6ecf7', '#aed6f1', '#5dade2', '#2980b9', '#003399', '#001f66'];
            safeChartInit(canvasId, {
                type: 'pie',
                data: { labels: ['AX01', 'AX02', 'AX03', 'AX04', 'AX05', 'AX06'], datasets: [{ data: axDataArray, backgroundColor: colors, borderWidth: 3, borderColor: '#ffffff', hoverOffset: 12 }] },
                plugins: [ChartDataLabels, dropShadowPlugin],
                options: {
                    responsive: true, maintainAspectRatio: false,
                    layout: { padding: { left: 10, right: 10, top: 10, bottom: 10 } },
                    plugins: {
                        title: { display: true, text: titleText, font: { size: 14, weight: 'bold' }, color: '#2d3748', padding: {bottom: 16} },
                        legend: { display: true, position: 'right', align: 'center', labels: { font: { size: 12, weight: 'bold' }, color: '#2d3748', padding: 12, usePointStyle: true, boxWidth: 10 } },
                        datalabels: {
                            color: '#ffffff', font: { weight: 'bold', size: 14 },
                            formatter: (value, ctx) => { if (value === 0) return null; let sum = ctx.chart._metasets[ctx.datasetIndex].total; return ((value / sum) * 100).toFixed(1) + '%'; },
                            textShadowBlur: 6, textShadowColor: 'rgba(0,0,0,0.8)', anchor: 'center', align: 'center'
                        },
                        tooltip: { callbacks: { label: function(context) { let sum = context.dataset.data.reduce((a, b) => a + b, 0); return context.label + ': ' + context.raw + ' (' + (sum > 0 ? ((context.raw / sum) * 100).toFixed(1) + '%' : '0%') + ')'; } } }
                    }
                }
            });
        }

        function populateDeferredTable(tableId, labels, partsData, timeData) {
            let table = document.getElementById(tableId);
            if (!table) return;
            let isNG = tableId.includes('ng');
            let colorParts = isNG ? '#d4ac0d' : '#4a6da7';
            let colorTime = isNG ? '#f4d03f' : '#6baed6';
            let html = '<thead><tr><th></th>' + labels.map(l => `<th>${l}</th>`).join('') + '</tr></thead><tbody>';
            html += `<tr><td class="series-lbl"><span class="color-box" style="background:${colorParts};"></span> NO PARTS</td>` + partsData.map(d => `<td>${d || 0}</td>`).join('') + '</tr>';
            html += `<tr><td class="series-lbl"><span class="color-box" style="background:${colorTime};"></span> NO TIME</td>` + timeData.map(d => `<td>${d || 0}</td>`).join('') + '</tr></tbody>';
            table.innerHTML = html;
        }

        function drawDeferredChart(canvasId, labels, partsData, timeData) {
            let isNG = canvasId.includes('ng');
            let colorParts = isNG ? '#d4ac0d' : '#4a6da7';
            let colorTime = isNG ? '#f4d03f' : '#6baed6';
            safeChartInit(canvasId, {
                type: 'bar',
                data: { labels: labels, datasets: [ { label: 'NO PARTS', data: partsData, backgroundColor: colorParts, barPercentage: 0.8, categoryPercentage: 0.6 }, { label: 'NO TIME', data: timeData, backgroundColor: colorTime, barPercentage: 0.8, categoryPercentage: 0.6 } ] },
                options: { responsive: true, maintainAspectRatio: false, layout: { padding: { left: 0, right: 0, top: 15, bottom: 0 } }, plugins: { legend: { display: false }, datalabels: { display: false }, title: { display: false } }, scales: { x: { display: false, offset: true }, y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false }, afterFit: function(scale) { scale.width = 100; } } } }
            });
        }

        function drawDef3MChart(canvasId, labels, data, color, title) {
            safeChartInit(canvasId, {
                type: 'bar',
                data: { labels: labels, datasets: [{ label: 'Tasks', data: data, backgroundColor: color, barPercentage: 0.5, categoryPercentage: 0.8 }] },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        datalabels: { display: false },
                        title: { display: true, text: title, font: {size: 14, weight: 'bold'}, color: '#2d3748', padding: {bottom: 16} }
                    },
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: canvasId.includes('hils') ? undefined : 1 }, grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false } },
                        x: { ticks: { maxRotation: 45, minRotation: 45, font: {size: 10} }, grid: { display: false } }
                    }
                }
            });
        }

        function drawMultiLineChart(canvasId, labels, dataSetsArray, title) {
            const distinctColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
            let datasets = dataSetsArray.map((ds, i) => ({
                label: ds.name, data: ds.data,
                borderColor: distinctColors[i % distinctColors.length],
                backgroundColor: distinctColors[i % distinctColors.length],
                borderWidth: 2, pointRadius: 0, pointHoverRadius: 5, fill: false, tension: 0.1
            }));
            safeChartInit(canvasId, {
                type: 'line',
                data: { labels: labels, datasets: datasets },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        title: { display: true, text: title, font: {size: 14, weight: 'bold'}, color: '#2d3748', padding: {bottom: 16} },
                        legend: { display: true, position: 'right', labels: { boxWidth: 12, font: {size: 11} } },
                        datalabels: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#edf2f7' } },
                        x: { grid: { display: false }, ticks: { maxRotation: 45, minRotation: 45, font: {size: 10} } }
                    }
                }
            });
        }

        function drawCurrMonthBarChart(canvasId, labels, data, color) {
            safeChartInit(canvasId, {
                type: 'bar',
                data: { labels: labels, datasets: [{ label: "HIL's", data: data, backgroundColor: color, barPercentage: 0.5 }] },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, datalabels: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 2 }, grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false } },
                        x: { ticks: { maxRotation: 45, minRotation: 45, font: {size: 11} }, grid: { display: false } }
                    }
                }
            });
        }

        function drawSimpleBarChart(canvasId, labels, data, color, title) {
            safeChartInit(canvasId, {
                type: 'bar',
                data: { labels: labels, datasets: [{ data: data, backgroundColor: color, barPercentage: 0.5 }] },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        datalabels: { display: false },
                        title: { display: true, text: title, font: {size: 14, weight: 'bold'}, color: '#2d3748', padding: {bottom: 16} }
                    },
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false } },
                        x: { ticks: { maxRotation: 45, minRotation: 45, font: {size: 10} }, grid: { display: false } }
                    }
                }
            });
        }

        function drawAxVariationChart(canvasId, labels, mechData, avioData, ngData, maxData) {

    // ======================================================
    // DYNAMIC RIGHT AXIS SCALE
    // ======================================================

    const maxStackValue = Math.max(
        ...mechData.map(
            (value, index) =>
                Number(value || 0) +
                Number(avioData[index] || 0)
        )
    );

    // Round upwards to the next multiple of 5
    // Example:
    // 23 -> 25
    // 25 -> 25
    // 27 -> 30
    const chartMax =
        Math.max(
            5,
            Math.ceil(maxStackValue / 5) * 5
        );

    safeChartInit(canvasId, {

        type: 'bar',

        data: {

            labels: labels,

            datasets: [

                // ==================================================
                // NG DURATION
                // ==================================================

                {
                    type: 'line',
                    label: 'NG DURATION',
                    data: ngData,

                    borderColor: '#f1c40f',
                    backgroundColor: '#f1c40f',

                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6,

                    fill: false,
                    tension: 0.2,

                    yAxisID: 'y'
                },

                // ==================================================
                // MAX DURATION
                // ==================================================

                {
                    type: 'line',
                    label: 'MAX DURATION',
                    data: maxData,

                    borderColor: '#2980b9',
                    backgroundColor: '#2980b9',

                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6,

                    fill: false,
                    tension: 0.2,

                    yAxisID: 'y'
                },

                // ==================================================
                // MECH
                // ==================================================

                {
                    type: 'bar',
                    label: 'MECH',
                    data: mechData,

                    backgroundColor: 'rgba(0, 51, 153, 0.3)',

                    yAxisID: 'y1',
                    stacked: true,

                    barPercentage: 0.5
                },

                // ==================================================
                // MECH AVIO
                // ==================================================

                {
                    type: 'bar',
                    label: 'MECH AVIO',
                    data: avioData,

                    backgroundColor: 'rgba(241, 196, 15, 0.3)',

                    yAxisID: 'y1',
                    stacked: true,

                    barPercentage: 0.5
                }

            ]

        },

        plugins: [ChartDataLabels],

        options: {

            responsive: true,
            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: true,
                    position: 'top',

                    labels: {
                        boxWidth: 15,
                        font: {
                            size: 13,
                            weight: 'bold'
                        }
                    }
                },

                datalabels: {

                    display: true,

                    formatter: function(value, context) {

                        if(value == null) return '';

                        return value;

                    },

                    // ==================================================
                    // POSITION OF LABELS
                    // ==================================================

                    anchor: function(context) {

                        // NG
                        if(context.datasetIndex === 0) {
                            return 'end';
                        }

                        // MAX
                        if(context.datasetIndex === 1) {
                            return 'start';
                        }

                        // BAR DATA
                        return 'center';

                    },

                    align: function(context) {

                        // NG → ABOVE POINT
                        if(context.datasetIndex === 0) {
                            return 'top';
                        }

                        // MAX → BELOW POINT
                        if(context.datasetIndex === 1) {
                            return 'bottom';
                        }

                        return 'center';

                    },

                    offset: function(context) {

                        // Give the two curves some breathing room
                        if(
                            context.datasetIndex === 0 ||
                            context.datasetIndex === 1
                        ) {
                            return 6;
                        }

                        return 0;

                    },

                    color: function(context) {

                        // Curve labels
                        if(context.datasetIndex === 0) {
                            return '#8a7200';
                        }

                        if(context.datasetIndex === 1) {
                            return '#1f5f8f';
                        }

                        // Bar labels
                        return '#ffffff';

                    },

                    font: function(context) {

                        if(
                            context.datasetIndex === 0 ||
                            context.datasetIndex === 1
                        ) {

                            return {
                                weight: 'bold',
                                size: 11
                            };

                        }

                        return {
                            weight: 'bold',
                            size: 12
                        };

                    }

                }

            },

            scales: {

                // ==================================================
                // LEFT AXIS — DURATIONS
                // ==================================================

                x: {
                    stacked: true,

                    grid: {
                        display: false
                    }
                },

                y: {

                    type: 'linear',
                    position: 'left',

                    grid: {
                        color: '#edf2f7'
                    }
                },

                // ==================================================
                // RIGHT AXIS — MANPOWER
                // ==================================================

                y1: {

                    type: 'linear',
                    position: 'right',

                    stacked: true,

                    beginAtZero: true,

                    max: chartMax,

                    ticks: {
                        stepSize: 5
                    },

                    grid: {
                        display: false
                    }

                }

            }

        }

    });

}

// ======================================================
// ANALYSIS PERIOD MODAL
// ======================================================

let ANALYSIS_PERIOD_CALLBACK = null;

function openAnalysisPeriodModal(callback){

    ANALYSIS_PERIOD_CALLBACK =
        callback;


    const input =
        document.getElementById(
            "analysisPeriodInput"
        );


    if(!input){

        console.error(
            "Analysis period input not found."
        );

        return;

    }


    // ==================================================
    // DEFAULT — CURRENT MONTH
    // ==================================================

    const now =
        new Date();


    const currentYear =
        now.getFullYear();


    const currentMonth =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    // ==================================================
    // USE CURRENT DASHBOARD PERIOD IF AVAILABLE
    // OTHERWISE USE CURRENT MONTH
    // ==================================================

    const selectedYear =
        Number(
            CURRENT_ACHECK_YEAR
        ) || currentYear;


    const selectedMonth =
        Number(
            CURRENT_ACHECK_MONTH
        ) || Number(
            currentMonth
        );


    input.value =
        `${selectedYear}-${String(
            selectedMonth
        ).padStart(
            2,
            "0"
        )}`;


    document
        .getElementById(
            "analysisPeriodModal"
        )
        .style.display =
            "flex";

}

function closeAnalysisPeriodModal(){

    document.getElementById(

        "analysisPeriodModal"

    ).style.display = "none";

}

function continueAnalysisPeriod(){

    const input =
        document.getElementById(
            "analysisPeriodInput"
        );


    if(
        !input ||
        !input.value
    ){

        return;

    }


    const parts =
        input.value.split(
            "-"
        );


    const year =
        Number(
            parts[0]
        );


    const month =
        Number(
            parts[1]
        );


    if(
        !year ||
        !month
    ){

        return;

    }


    closeAnalysisPeriodModal();


    if(
        ANALYSIS_PERIOD_CALLBACK
    ){

        ANALYSIS_PERIOD_CALLBACK(

            year,

            month

        );

    }

}

// ======================================================
// IMPORT EXCEL
// ======================================================

// ======================================================
// IMPORT PERIOD — EXCEL UNDER DEVELOPMENT
// ======================================================

function openImportExcelPeriod(){

    executeProtectedAction(

        PERMISSIONS.IMPORT_DATA,

        ()=>{

            // ==========================================
            // REMOVE EXISTING MODAL
            // ==========================================

            const existing =
                document.getElementById(
                    "aCheckExcelDevelopmentModal"
                );

            if(existing){

                existing.remove();

            }


            // ==========================================
            // CREATE MODAL
            // SAME STYLE AS FWD INFORMATION MODAL
            // ==========================================

            const modal =
                document.createElement("div");


            modal.id =
                "aCheckExcelDevelopmentModal";


            modal.className =
                "notificationOverlay";


            modal.style.display =
                "flex";


            modal.innerHTML = `

                <div
    class="notificationBox confirmationBox pdf-import-functional-modal"
    style="
        max-width:560px;
        width:calc(100% - 40px);
    "
>

    <div class="import-info-icon">
        ✓
    </div>


    <h2>
        PDF Import — Functional
    </h2>


    <p>
        The A-Check PDF data has been imported successfully.
    </p>


    <p>
        Please review the imported information and complete any
        missing or unclear data before finalising the A-Check.
    </p>


    <h3>
        What would you like to do?
    </h3>


    <div class="import-info-actions">

        <button
            type="button"
            class="btn btn-white"
            id="aCheckExcelManualButton"
        >
            ←&nbsp; Cancel
        </button>


        <button
            type="button"
            class="btn btn-yellow"
            id="aCheckExcelContinueButton"
        >
            Excel Import&nbsp; →
        </button>

    </div>

</div>

            `;


            document.body.appendChild(
                modal
            );


            // ==========================================
            // EDIT VISUALS
            // ==========================================

            // ==========================================
// CANCEL
// ==========================================

document
    .getElementById(
        "aCheckExcelManualButton"
    )
    .addEventListener(
        "click",
        () => {

            modal.remove();

        }
    );

            // ==========================================
            // TRY EXCEL IMPORT
            // ==========================================

            document
                .getElementById(
                    "aCheckExcelContinueButton"
                )
                .addEventListener(
                    "click",
                    () => {

                        modal.remove();

                        openAnalysisPeriodModal(

                            (year,month)=>{

                                openACheckImport(
                                    year,
                                    month
                                );

                            }

                        );

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

        },

        {

            action:"OPEN_ACHECK_IMPORT",

            details:"A-Check Import Excel"

        }

    );

}

// ======================================================
// OPEN EDIT VISUALS
// ======================================================

async function openEditVisualsPeriod(){

    executeProtectedAction(

        PERMISSIONS.EDIT_VISUALS,

        ()=>{

            openAnalysisPeriodModal(

                async (year,month)=>{

                    EDIT_YEAR = year;
                    EDIT_MONTH = month;

                    CURRENT_ACHECK_YEAR = year;
                    CURRENT_ACHECK_MONTH = month;

                    await openACheckEdit(year,month);

                }

            );

        },

        {

            action:"OPEN_ACHECK_EDIT",

            details:"A-Check Edit Visuals"

        }

    );

}

async function openACheckEdit(year,month){

    await loadACheckData(year,month);

    window.openACheckEditModal();

}

function openACheckImport(year,month){

    IMPORT_YEAR = year;
    IMPORT_MONTH = month;

    CURRENT_ACHECK_YEAR = year;
    CURRENT_ACHECK_MONTH = month;

    document.getElementById("excel-upload").click();

}

async function openACheckClearCurrentShift(){

    executeProtectedAction(

        PERMISSIONS.RESET_DASHBOARD,

        ()=>{

            showConfirmation(

                "Delete Current Period",

                "You are about to permanently delete all A-Check data for the selected reporting period.\n\nThis action cannot be undone.",

                async ()=>{

                    await deleteACheckCurrentPeriod();

                    await initializeACheck();

                    showSuccess(

                        "Current Period Deleted",

                        "All A-Check data for the selected reporting period has been permanently deleted."

                    );

                },

                "Delete Current Period"

            );

        },

        {

            action: "CLEAR_ACHECK_DATA",

            details: "Delete A-Check Current Period"

        }

    );

}

async function deleteACheckCurrentPeriod(){

    const period = getACheckPeriodKey(

        CURRENT_ACHECK_YEAR,

        CURRENT_ACHECK_MONTH

    );

    await firebaseRemove(

        firebaseRef(

            database,

            `${ACHECK_COLLECTION}/${period}`

        )

    );

}

// ======================================================
// A-CHECK — PDF IMPORT ENGINE
// BLOCK 1 — PDF FILE READER
// ======================================================
//
// Este bloco cria o mecanismo base para:
//
// A-Check Import
//      ↓
// seleccionar PDF
//      ↓
// ler PDF
//      ↓
// extrair texto página a página
//
// Ainda NÃO interpreta os dados.
//
// O PDF utilizado é o modelo específico de A-Check
// que estamos a usar como referência.
//
// ======================================================


// ======================================================
// A-CHECK — PDF IMPORT
// BLOCK 11 — COMPLETE IMPORT FLOW
// ======================================================

async function handleACheckPDFUpload(
    file
){

    try{

        // ==================================================
        // FILE CHECK
        // ==================================================

        if(!file){

            return;

        }


        const fileName =
            String(
                file.name || ""
            ).toLowerCase();


        if(
            !fileName.endsWith(".pdf")
        ){

            showError(

                "Invalid File",

                "Please select the A-Check PDF report."

            );

            return;

        }


        // ==================================================
        // LOADING
        // ==================================================

        showLoading();


        updateLoading(

            "Reading A-Check PDF...",

            5,

            file.name

        );


        // ==================================================
        // STEP 1 — EXTRACT
        // ==================================================

        const pdfData =
            await extractACheckPDFText(
                file
            );


        if(
            !pdfData ||
            !Array.isArray(
                pdfData.pages
            )
        ){

            throw new Error(
                "INVALID_PDF_DATA"
            );

        }


        // ==================================================
        // STEP 2 — VALIDATE FORMAT
        // ==================================================

        if(
            pdfData.pageCount !== 5
        ){

            throw new Error(
                "INVALID_ACHECK_PDF_FORMAT"
            );

        }


        updateLoading(

            "Analysing A-Check report...",

            50,

            "Processing 5 pages"

        );


        // ==================================================
        // STEP 3 — PARSE
        // ==================================================

        const imported =
            parseACheckPDF(
                pdfData
            );


        if(!imported){

            throw new Error(
                "PDF_PARSE_FAILED"
            );

        }


        updateLoading(

            "Applying A-Check data...",

            80,

            currentShift === "Night"
                ? "Night"
                : "Day"

        );


        // ==================================================
        // STEP 4 — APPLY
        // ==================================================

        applyACheckPDFToEditState(
            imported
        );


        // ==================================================
        // STEP 5 — CLOSE LOADING
        // ==================================================

        updateLoading(

            "A-Check imported",

            100,

            "Opening Edit Visuals..."

        );


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    400
                )
        );


        hideLoading();


        // ==================================================
        // STEP 6 — OPEN EDIT VISUALS
        // ==================================================

        window.openACheckEditModal();


    }

    catch(error){

        console.error(

            "A-CHECK PDF IMPORT ERROR:",

            error

        );


        hideLoading();


        // ==================================================
        // USER FRIENDLY ERRORS
        // ==================================================

        if(
            error.message ===
            "INVALID_ACHECK_PDF_FORMAT"
        ){

            showError(

                "Invalid A-Check PDF",

                "The selected file does not match the A-Check PDF format."

            );

            return;

        }


        if(
            error.message ===
            "PDF_JS_NOT_LOADED"
        ){

            showError(

                "PDF Reader",

                "The PDF reader is not available."

            );

            return;

        }


        showError(

            "PDF Import",

            "Unable to import the A-Check PDF."

        );

    }

}

// ======================================================
// A-CHECK — FILE IMPORT BRIDGE
// BLOCK 12
// ======================================================
//
// .xlsx / .xls → Excel importer existente
// .pdf         → novo PDF importer
//
// NÃO mexer no HTML.
// NÃO mexer no openACheckImport().
// ======================================================

window.handleACheckFileUpload =
    function(event){

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


        // ==================================================
        // EXCEL
        // ==================================================

        if(
            extension === "xlsx" ||
            extension === "xls"
        ){

            window.handleExcelUpload(
                event
            );

            return;

        }


        // ==================================================
        // PDF
        // ==================================================

        if(
            extension === "pdf"
        ){

            handleACheckPDFUpload(
                file
            );

            return;

        }


        // ==================================================
        // INVALID
        // ==================================================

        showError(

            "Invalid File",

            "Please select an Excel or PDF A-Check report."

        );

    };

// ======================================================
// PDF TEXT + LAYOUT EXTRACTION
// ======================================================

async function extractACheckPDFText(file){

    if(!window.pdfjsLib){

        throw new Error(
            "PDF_JS_NOT_LOADED"
        );

    }


    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


    const arrayBuffer =
        await file.arrayBuffer();


    const pdf =
        await window.pdfjsLib.getDocument({
            data: arrayBuffer
        }).promise;


    if(
        !pdf ||
        !pdf.numPages
    ){

        throw new Error(
            "INVALID_PDF"
        );

    }


    const pages = [];


    for(
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
    ){

        updateLoading(

            "Reading A-Check PDF...",

            Math.round(
                (
                    pageNumber /
                    pdf.numPages
                ) * 90
            ),

            `Reading page ${pageNumber} of ${pdf.numPages}`

        );


        console.log(
            `Reading A-Check PDF page ${pageNumber}/${pdf.numPages}...`
        );


        const page =
            await pdf.getPage(
                pageNumber
            );


        const content =
            await page.getTextContent();


        const viewport =
            page.getViewport({
                scale:1
            });


        // ==================================================
        // ORIGINAL TEXT
        // ==================================================

        const text =
            content.items
                .map(
                    item =>
                        item.str || ""
                )
                .join(" ");


        // ==================================================
        // BUILD VISUAL LINES
        // ==================================================

        const rawItems =
            content.items
                .filter(
                    item =>
                        String(
                            item.str || ""
                        ).trim() !== ""
                )
                .map(
                    item => ({

                        text:
                            String(
                                item.str || ""
                            ).trim(),

                        x:
                            Number(
                                item.transform?.[4] || 0
                            ),

                        y:
                            Number(
                                item.transform?.[5] || 0
                            ),

                        width:
                            Number(
                                item.width || 0
                            )

                    })
                );


        const lines = [];


        // --------------------------------------------------
        // Group items by Y position
        // --------------------------------------------------

        rawItems.forEach(
            item => {

                let line =
                    lines.find(
                        candidate =>
                            Math.abs(
                                candidate.y -
                                item.y
                            ) <= 3
                    );


                if(!line){

                    line = {

                        y:
                            item.y,

                        items:[]

                    };


                    lines.push(
                        line
                    );

                }


                line.items.push(
                    item
                );

            }
        );


        // --------------------------------------------------
        // Sort top → bottom
        // --------------------------------------------------

        lines.sort(
            (a,b) =>
                b.y - a.y
        );


        const middle =
            viewport.width / 2;


        const layoutLines =
            lines.map(
                line => {

                    line.items.sort(
                        (a,b) =>
                            a.x - b.x
                    );


                    const left =
                        line.items
                            .filter(
                                item =>
                                    item.x <
                                    middle
                            )
                            .map(
                                item =>
                                    item.text
                            )
                            .join(" ")
                            .trim();


                    const right =
                        line.items
                            .filter(
                                item =>
                                    item.x >=
                                    middle
                            )
                            .map(
                                item =>
                                    item.text
                            )
                            .join(" ")
                            .trim();


                    return {

                        y:
                            line.y,

                        text:
                            line.items
                                .map(
                                    item =>
                                        item.text
                                )
                                .join(" ")
                                .trim(),

                        left,

                        right

                    };

                }
            );


        pages.push({

            page:
                pageNumber,

            text:
                text,

            layout:{

                width:
                    viewport.width,

                lines:
                    layoutLines

            }

        });

    }


    return {

        pageCount:
            pdf.numPages,

        pages:
            pages

    };

}


// ======================================================
// A-CHECK — PDF IMPORT
// BLOCK 2 — IMPORT DATA STRUCTURE
// ======================================================
//
// Estrutura intermédia do relatório.
//
// IMPORTANTE:
// - Não pertence a DAY.
// - Não pertence a NIGHT.
// - Não escreve em appStates.
// - Apenas guarda aquilo que o parser encontrar.
//
// ======================================================

function createACheckPDFImportData(){

    return {

        // ==================================================
        // COMMON
        // ==================================================

        common:{

            month1:null,

            month2:null

        },


        // ==================================================
        // PAGE 1
        // ==================================================

        page1:{

            // ----------------------------------------------
            // 3 MONTH MOBILE AVERAGE
            // ----------------------------------------------

            mobileAverage:[],


            // ----------------------------------------------
            // AX DURATION VARIATION
            // ----------------------------------------------

            axDurationVariation:[],


            // ----------------------------------------------
            // ANALYSES PER MANPOWER
            // ----------------------------------------------

            manpowerAnalysis:[]

        },


        // ==================================================
        // PAGE 2
        // ==================================================

        page2:{

            // ----------------------------------------------
            // NG
            // ----------------------------------------------

            ng:{

                totalAverage:null,

                month1Average:null,

                month2Average:null,


                longest:{

                    time:null,

                    supervisor:null,

                    ax:null

                },


                shortest:{

                    time:null,

                    supervisor:null,

                    ax:null

                },


                pair:{

                    number:null,

                    averageTime:null

                },


                odd:{

                    number:null,

                    averageTime:null

                },


                performed:{

                    ax01:null,

                    ax02:null,

                    ax03:null,

                    ax04:null,

                    ax05:null,

                    ax06:null

                }

            },


            // ----------------------------------------------
            // MAX
            // ----------------------------------------------

            max:{

                totalAverage:null,

                month1Average:null,

                month2Average:null,


                longest:{

                    time:null,

                    supervisor:null,

                    ax:null

                },


                shortest:{

                    time:null,

                    supervisor:null,

                    ax:null

                },


                pair:{

                    number:null,

                    averageTime:null

                },


                odd:{

                    number:null,

                    averageTime:null

                },


                performed:{

                    ax01:null,

                    ax02:null,

                    ax03:null,

                    ax04:null,

                    ax05:null,

                    ax06:null

                }

            },


            // ----------------------------------------------
            // DEFERRED TASKS — MONTHLY TREND
            // ----------------------------------------------

            deferredMonthly:[]

        },


        // ==================================================
        // PAGE 3
        // ==================================================

        page3:{

            // ----------------------------------------------
            // FLOWCHART
            // ----------------------------------------------

            flowchart:{

                ng:[],

                max:[]

            },


            // ----------------------------------------------
            // STOCK STUDY
            // ----------------------------------------------

            stockStudy:{

                ng:[],

                max:[]

            },


            // ----------------------------------------------
            // LAST DEFERRED TASKCARDS
            // ----------------------------------------------

            lastTaskcards:{

                ng:[],

                max:[]

            },


            // ----------------------------------------------
            // DEFERRED TASKS — LAST 3 MONTHS
            // ----------------------------------------------

            last3Months:{

                ng:[],

                max:[]

            }

        },


        // ==================================================
        // PAGE 4
        // ==================================================

        page4:{

            // ----------------------------------------------
            // HIL STATISTICS
            // ----------------------------------------------

            hils:{

                ng:{

                    average:null,

                    month1:null,

                    month2:null

                },

                max:{

                    average:null,

                    month1:null,

                    month2:null

                }

            },


            // ----------------------------------------------
            // HILS PER A-CHECK SUPER
            // ----------------------------------------------

            hilsPerSuper:{

                ng:[],

                max:[]

            }

        },


        // ==================================================
        // PAGE 5
        // ==================================================

        page5:{

            // ----------------------------------------------
            // P/N OUT OF STOCK
            // ----------------------------------------------

            pnOutOfStock:{

                ng:null,

                max:null

            },


            // ----------------------------------------------
            // CURRENT HILS PER SUPER
            // ----------------------------------------------

            currentHilsPerSuper:{

                ng:[],

                max:[]

            },


            // ----------------------------------------------
            // TOP REQUESTED P/N
            // ----------------------------------------------

            topRequestedPN:{

                ng:[],

                max:[]

            },


            // ----------------------------------------------
            // TOP REQUESTED P/N — LAST 3 MONTHS
            // ----------------------------------------------

            topPN3M:{

                ng:[],

                max:[]

            }

        },


        // ==================================================
        // RAW SOURCE
        // ==================================================
        //
        // Guardamos o texto original para podermos
        // verificar qualquer problema sem voltar a ler
        // o ficheiro.
        //
        // ==================================================

        raw:{

            page1:"",

            page2:"",

            page3:"",

            page4:"",

            page5:""

        }

    };

}

// ======================================================
// A-CHECK — PDF IMPORT
// BLOCK 8 — MAIN PDF PARSER
// ======================================================
//
// Fluxo:
//
// PDF
//  ↓
// extractACheckPDFText()
//  ↓
// parseACheckPDF()
//  ├── Page 1
//  ├── Page 2
//  ├── Page 3
//  ├── Page 4
//  └── Page 5
//  ↓
// importedData
//
// Ainda NÃO aplica a Day/Night.
// ======================================================

function parseACheckPDF(
    pdfData
){

    // ==================================================
    // CREATE EMPTY IMPORT
    // ==================================================

    const imported =
        createACheckPDFImportData();


    // ==================================================
    // SAFETY
    // ==================================================

    if(
        !pdfData ||
        !Array.isArray(
            pdfData.pages
        )
    ){

        console.warn(
            "A-CHECK PDF PARSER: invalid PDF data."
        );

        return imported;

    }


    // ==================================================
    // CHECK PAGE COUNT
    // ==================================================
    //
    // O relatório de referência tem 5 páginas.
    //
    // Não tentamos interpretar outros formatos.
    //

    if(
        Number(
            pdfData.pageCount
        ) !== 5
    ){

        console.warn(

            "A-CHECK PDF PARSER: unexpected page count.",

            pdfData.pageCount

        );

        return imported;

    }


    // ==================================================
    // RAW PAGE TEXT
    // ==================================================

    imported.raw.page1 =
        pdfData.pages[0]?.text ||
        "";

    imported.raw.page2 =
        pdfData.pages[1]?.text ||
        "";

    imported.raw.page3 =
        pdfData.pages[2]?.text ||
        "";

    // ==================================================
// PAGE 3 VISUAL LAYOUT
// ==================================================

imported.raw.page3Layout =
    pdfData.pages[2]?.layout ||
    null;

    imported.raw.page4 =
        pdfData.pages[3]?.text ||
        "";

    imported.raw.page5 =
        pdfData.pages[4]?.text ||
        "";


    // ==================================================
    // PAGE 1
    // ==================================================

    parseACheckPDFPage1(
        imported
    );


    // ==================================================
    // PAGE 2
    // ==================================================

    parseACheckPDFPage2(
        imported
    );


    // ==================================================
    // PAGE 3
    // ==================================================

    parseACheckPDFPage3(
        imported
    );


    // ==================================================
    // PAGE 4
    // ==================================================

    parseACheckPDFPage4(
        imported
    );


    // ==================================================
    // PAGE 5
    // ==================================================

    parseACheckPDFPage5(
        imported
    );


    // ==================================================
    // FINAL DEBUG
    // ==================================================

    console.log(
        "A-CHECK PDF — COMPLETE IMPORT:",
        imported
    );


    return imported;

}


// ======================================================
// PAGE 1 — NORMALIZED TEXT
// ======================================================

function parseACheckPDFPage1(
    imported
){

    const text =
        imported.raw.page1 || "";


    if(!text){

        return;

    }


    // ==================================================
    // 1. 3 MONTH MOBILE AVERAGE
    // ==================================================
    //
    // Procuramos a secção pelo título.
    //
    // A estrutura esperada é:
    //
    // MONTH/YEAR
    // NG VALUE
    // MAX VALUE
    // MANPOWER
    //
    // ==================================================

    const mobileSection =
        acPDFExtractSection(
            text,
            [
                "3 Month Mobile Average",
                "3 MONTH MOBILE AVERAGE"
            ],
            [
                "AX Duration Variation",
                "AX DURATION VARIATION"
            ]
        );


    if(mobileSection){

        const rows =
            acPDFExtractRows(
                mobileSection
            );


        rows.forEach(
            row => {

                const month =
                    acPDFExtractMonth(
                        row
                    );


                if(month === null){

                    return;

                }


                imported.page1.mobileAverage.push({

                    label:
                        month.label,

                    month:
                        month.value,

                    ng:
                        acPDFExtractTime(
                            row,
                            [
                                "NG VALUE",
                                "NG"
                            ]
                        ),

                    max:
                        acPDFExtractTime(
                            row,
                            [
                                "MAX VALUE",
                                "MAX"
                            ]
                        ),

                    mp:
                        acPDFExtractNumber(
                            row,
                            [
                                "MANPOWER",
                                "MP"
                            ]
                        )

                });

            }
        );

    }


    // ==================================================
    // 2. AX DURATION VARIATION
    // ==================================================
    //
    // Estrutura:
    //
    // MONTH/YEAR
    // MECH
    // MECH AVIO
    // NG DURATION (H)
    // MAX DURATION (H)
    //
    // ==================================================

    const axSection =
        acPDFExtractSection(
            text,
            [
                "AX Duration Variation with Manpower Levels",
                "AX DURATION VARIATION WITH MANPOWER LEVELS"
            ],
            [
                "Analyses per Manpower",
                "ANALYSES PER MANPOWER"
            ]
        );


    if(axSection){

        const rows =
            acPDFExtractRows(
                axSection
            );


        rows.forEach(
            row => {

                const month =
                    acPDFExtractMonth(
                        row
                    );


                if(month === null){

                    return;

                }


                imported.page1.axDurationVariation.push({

                    month:
                        month.label,

                    mech:
                        acPDFExtractNumber(
                            row,
                            [
                                "MECH"
                            ]
                        ),

                    avio:
                        acPDFExtractNumber(
                            row,
                            [
                                "MECH AVIO"
                            ]
                        ),

                    ngDur:
                        acPDFExtractTime(
                            row,
                            [
                                "NG DURATION (H)",
                                "NG DURATION"
                            ]
                        ),

                    maxDur:
                        acPDFExtractTime(
                            row,
                            [
                                "MAX DURATION (H)",
                                "MAX DURATION"
                            ]
                        )

                });

            }
        );

    }


    // ==================================================
// 3. ANALYSES PER MANPOWER
// ==================================================
//
// O PDF específico usa:
//
// MANPOWER | NG DURATION | MAX DURATION
//
// Os níveis desta tabela são 13 → 21.
//
// NÃO usamos acPDFExtractRows() aqui porque
// esta tabela não possui YYYY-MM.
// ==================================================

const manpowerSection =
    acPDFExtractSection(
        text,
        [
            "Analyses per Manpower",
            "ANALYSES PER MANPOWER"
        ],
        [
            "737 NG - 3 MONTH",
            "737 NG - 3 MONTH MOBIL",
            "737 MAX - 3 MONTH",
            "737 MAX - 3 MONTH MOBIL"
        ]
    );


if(manpowerSection){

    const result = [];


    // --------------------------------------------------
    // Procurar linhas reais:
    //
    // 13 7:16 -
    // 14 7:45 -
    // 15 7:24
    // 16 7:14 6:47
    // ...
    // --------------------------------------------------

    const regex =
        /\b(1[3-9]|20|21)\s+(\d{1,2}:\d{2})(?:\s+(-|\d{1,2}:\d{2}))?/g;


    let match;


    while(
        (match =
            regex.exec(manpowerSection))
        !== null
    ){

        const mp =
            Number(
                match[1]
            );


        const ng =
            match[2] ||
            null;


        const max =
            match[3] !== undefined
                ? match[3]
                : null;


        result.push({

            mp,

            ng,

            max

        });

    }


    // --------------------------------------------------
    // Remover duplicados
    // --------------------------------------------------

    const unique = [];


    result.forEach(
        row => {

            if(
                !unique.some(
                    item =>
                        item.mp === row.mp
                )
            ){

                unique.push(row);

            }

        }
    );


    // --------------------------------------------------
    // Ordenar pelo manpower
    // --------------------------------------------------

    unique.sort(
        (a,b) =>
            a.mp - b.mp
    );


    imported.page1.manpowerAnalysis =
        unique;

}


    // ==================================================
    // DEBUG
    // ==================================================

    console.log(
        "A-CHECK PDF — PAGE 1 PARSED:",
        imported.page1
    );

}

// ======================================================
// PDF NORMALISATION / VALUE HELPERS
// ======================================================

function acPDFNormalizeText(value){

    if(
        value === null ||
        value === undefined
    ){

        return "";
    }

    return String(value)
        .replace(/\u00A0/g," ")
        .replace(/\s+/g," ")
        .trim();

}


function acPDFNormalizeKey(value){

    return acPDFNormalizeText(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .toUpperCase()
        .replace(/[’']/g,"")
        .replace(/[^A-Z0-9%().\/#:+\- ]/g," ")
        .replace(/\s+/g," ")
        .trim();

}


function acPDFKeepValue(value){

    if(
        value === null ||
        value === undefined
    ){

        return null;
    }

    const text =
        acPDFNormalizeText(value);

    return text === ""
        ? null
        : text;

}


function acPDFNumber(value){

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

    const text =
        acPDFNormalizeText(value)
            .replace(/,/g,".");

    const match =
        text.match(/-?\d+(?:\.\d+)?/);

    if(!match){

        return null;
    }

    const number =
        Number(match[0]);

    return Number.isFinite(number)
        ? number
        : null;

}


function acPDFInteger(value){

    const number =
        acPDFNumber(value);

    return number === null
        ? null
        : Math.round(number);

}

// ======================================================
// EXTRACT ALL NUMBERS
// ======================================================

function acPDFExtractNumbers(
    text
){

    if(
        text === null ||
        text === undefined
    ){

        return [];

    }


    const source =
        acPDFNormalizeText(
            text
        );


    if(!source){

        return [];

    }


    const matches =
        source.match(
            /-?\d+(?:[.,]\d+)?/g
        );


    if(!matches){

        return [];

    }


    return matches
        .map(
            value =>
                acPDFNumber(
                    value
                )
        )
        .filter(
            value =>
                value !== null
        );

}

function acPDFTime(value){

    if(
        value === null ||
        value === undefined
    ){

        return null;
    }

    const text =
        acPDFNormalizeText(value);

    const match =
        text.match(/\b\d{1,2}:\d{2}\b/);

    return match
        ? match[0]
        : null;

}

// ======================================================
// GENERIC SECTION EXTRACTOR
// ======================================================

function acPDFExtractSection(
    text,
    startTitles,
    endTitles
){

    const normalizedText =
        acPDFNormalizeKey(
            text
        );


    let startIndex = -1;


    for(
        const title of startTitles
    ){

        const normalizedTitle =
            acPDFNormalizeKey(
                title
            );


        const index =
            normalizedText.indexOf(
                normalizedTitle
            );


        if(
            index !== -1 &&
            (
                startIndex === -1 ||
                index < startIndex
            )
        ){

            startIndex =
                index;

        }

    }


    if(startIndex === -1){

        return null;

    }


    let endIndex =
        normalizedText.length;


    for(
        const title of endTitles
    ){

        const normalizedTitle =
            acPDFNormalizeKey(
                title
            );


        const index =
            normalizedText.indexOf(
                normalizedTitle,
                startIndex + 1
            );


        if(
            index !== -1 &&
            index < endIndex
        ){

            endIndex =
                index;

        }

    }


    return text.substring(
        startIndex,
        endIndex
    );

}


// ======================================================
// EXTRACT ROWS
// ======================================================
//
// O PDF é texto corrido depois do PDF.js.
//
// Por isso criamos linhas lógicas a partir dos meses
// YYYY-MM.
//
// Cada ocorrência YYYY-MM inicia uma nova linha.
//
// ======================================================

function acPDFExtractRows(
    section
){

    if(!section){

        return [];

    }


    const normalized =
        acPDFNormalizeText(
            section
        );


    const monthRegex =
        /\b\d{4}-\d{2}\b/g;


    const matches =
        [
            ...normalized.matchAll(
                monthRegex
            )
        ];


    if(!matches.length){

        return [];

    }


    const rows = [];


    for(
        let i = 0;
        i < matches.length;
        i++
    ){

        const start =
            matches[i].index;


        const end =
            i + 1 < matches.length

                ? matches[i + 1].index

                : normalized.length;


        rows.push(
            normalized.substring(
                start,
                end
            )
        );

    }


    return rows;

}


// ======================================================
// EXTRACT MONTH
// ======================================================

function acPDFExtractMonth(
    row
){

    if(!row){

        return null;

    }


    const match =
        row.match(
            /\b(\d{4})-(\d{2})\b/
        );


    if(!match){

        return null;

    }


    const year =
        Number(
            match[1]
        );


    const month =
        Number(
            match[2]
        );


    if(
        month < 1 ||
        month > 12
    ){

        return null;

    }


    const labels = [

        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC"

    ];


    return {

        value:
            `${year}-${String(month).padStart(2,"0")}`,

        label:
            labels[
                month - 1
            ]

    };

}


// ======================================================
// EXTRACT NUMBER
// ======================================================

function acPDFExtractNumber(
    row,
    aliases
){

    if(!row){

        return null;

    }


    const normalized =
        acPDFNormalizeKey(
            row
        );


    for(
        const alias of aliases
    ){

        const target =
            acPDFNormalizeKey(
                alias
            );


        const index =
            normalized.indexOf(
                target
            );


        if(index === -1){

            continue;

        }


        const after =
            normalized.substring(
                index +
                target.length
            );


        const match =
            after.match(
                /-?\d+(?:[.,]\d+)?/
            );


        if(match){

            return acPDFNumber(
                match[0]
            );

        }

    }


    return null;

}


// ======================================================
// EXTRACT TIME
// ======================================================

function acPDFExtractTime(
    row,
    aliases
){

    if(!row){

        return null;

    }


    const normalized =
        acPDFNormalizeKey(
            row
        );


    for(
        const alias of aliases
    ){

        const target =
            acPDFNormalizeKey(
                alias
            );


        const index =
            normalized.indexOf(
                target
            );


        if(index === -1){

            continue;

        }


        const after =
            normalized.substring(
                index +
                target.length
            );


        const match =
            after.match(
                /\b\d{1,2}:\d{2}\b/
            );


        if(match){

            return acPDFTime(
                match[0]
            );

        }

    }


    return null;

}


// ======================================================
// EXTRACT RAW VALUE
// ======================================================

function acPDFExtractRaw(
    row,
    aliases
){

    if(!row){

        return null;

    }


    const normalized =
        acPDFNormalizeKey(
            row
        );


    for(
        const alias of aliases
    ){

        const target =
            acPDFNormalizeKey(
                alias
            );


        const index =
            normalized.indexOf(
                target
            );


        if(index === -1){

            continue;

        }


        const after =
            row.substring(
                index +
                alias.length
            );


        const cleaned =
            acPDFNormalizeText(
                after
            );


        if(cleaned){

            return cleaned;

        }

    }


    return null;

}

// ======================================================
// A-CHECK — PDF IMPORT
// BLOCK 4 — PAGE 2 PARSER
// ======================================================
//
// PAGE 2:
//
// 1. Longest / Shortest Check
// 2. PAIR / ODD
// 3. A-Checks Performed
// 4. Deferred Tasks Monthly Trend
//
// ======================================================

function parseACheckPDFPage2(
    imported
){

    const text =
        imported.raw.page2 || "";


    if(!text){

        return;

    }


    // ==================================================
    // 1. LONGEST / SHORTEST CHECK
    // ==================================================

    const longest =
        acPDFExtractCheckBlock(
            text,
            "LONGEST CHECK",
            "SHORTEST CHECK"
        );


    if(longest){

        imported.page2.ng.longest =
            acPDFExtractCheckInfo(
                longest
            );

        imported.page2.max.longest =
            acPDFExtractCheckInfo(
                longest,
                "MAX"
            );

    }


    const shortest =
        acPDFExtractCheckBlock(
            text,
            "SHORTEST CHECK",
            "PAIR"
        );


    if(shortest){

        imported.page2.ng.shortest =
            acPDFExtractCheckInfo(
                shortest
            );

        imported.page2.max.shortest =
            acPDFExtractCheckInfo(
                shortest,
                "MAX"
            );

    }


    // ==================================================
    // 2. PAIR
    // ==================================================

    const pairBlock =
        acPDFExtractCheckBlock(
            text,
            "PAIR",
            "ODD"
        );


    if(pairBlock){

        const pair =
            acPDFExtractPairOdd(
                pairBlock
            );


        imported.page2.ng.pair =
            pair.ng;

        imported.page2.max.pair =
            pair.max;

    }


    // ==================================================
    // 3. ODD
    // ==================================================

    const oddBlock =
        acPDFExtractCheckBlock(
            text,
            "ODD",
            "A-CHECKS PERFORMED"
        );


    if(oddBlock){

        const odd =
            acPDFExtractPairOdd(
                oddBlock
            );


        imported.page2.ng.odd =
            odd.ng;

        imported.page2.max.odd =
            odd.max;

    }


    // ==================================================
    // 4. A-CHECKS PERFORMED
    // ==================================================

    const performed =
        acPDFExtractAChecksPerformed(
            text
        );


    if(performed){

        imported.page2.ng.performed =
            performed.ng;

        imported.page2.max.performed =
            performed.max;

    }


    // ==================================================
    // 5. DEFERRED TASKS MONTHLY TREND
    // ==================================================

    const deferredSection =
        acPDFExtractSection(
            text,
            [
                "Deferred Tasks",
                "DEFERRED TASKS"
            ],
            [
                "Flowchart",
                "FLOWCHART"
            ]
        );


    if(deferredSection){

        const rows =
            acPDFExtractRows(
                deferredSection
            );


        rows.forEach(
            row => {

                const month =
                    acPDFExtractMonth(
                        row
                    );


                if(month === null){

                    return;

                }


                imported.page2.deferredMonthly.push({

                    month:
                        month.label,

                    ngNoParts:
                        acPDFExtractNumber(
                            row,
                            [
                                "NG NO PARTS",
                                "NO PARTS NG"
                            ]
                        ),

                    ngNoTime:
                        acPDFExtractNumber(
                            row,
                            [
                                "NG NO TIME",
                                "NO TIME NG"
                            ]
                        ),

                    maxNoParts:
                        acPDFExtractNumber(
                            row,
                            [
                                "MAX NO PARTS",
                                "NO PARTS MAX"
                            ]
                        ),

                    maxNoTime:
                        acPDFExtractNumber(
                            row,
                            [
                                "MAX NO TIME",
                                "NO TIME MAX"
                            ]
                        )

                });

            }
        );

    }


    console.log(
        "A-CHECK PDF — PAGE 2 PARSED:",
        imported.page2
    );

}


// ======================================================
// CHECK BLOCK
// ======================================================
//
// Exemplo visual:
//
// Longest Check    8:30
// Supervisor       Vitor Pinto
// AX               AX03
//
// O tempo está AO LADO da label.
// Supervisor e AX estão POR BAIXO.
//
// ======================================================

// ======================================================
// CHECK BLOCK — CORRECT PDF ORDER
// ======================================================

function acPDFExtractCheckBlock(
    text,
    startTitle,
    endTitle
){

    if(!text){

        return null;

    }


    const normalized =
        acPDFNormalizeKey(text);


    const isLongest =
        acPDFNormalizeKey(startTitle)
            .includes("LONGEST CHECK");


    const isShortest =
        acPDFNormalizeKey(startTitle)
            .includes("SHORTEST CHECK");


    // --------------------------------------------------
    // LONGEST / SHORTEST
    //
    // O PDF extrai os 4 tempos juntos:
    //
    // NG Longest
    // NG Shortest
    // MAX Longest
    // MAX Shortest
    //
    // E depois os 4 pares Supervisor + AX.
    // --------------------------------------------------

    if(
        isLongest ||
        isShortest
    ){

        const start =
            normalized.indexOf(
                "LONGEST CHECK"
            );


        const end =
            normalized.indexOf(
                "PAIR",
                start + 1
            );


        if(
            start === -1 ||
            end === -1
        ){

            return null;

        }


        const full =
            text.substring(
                start,
                end
            );


        return (

            isLongest
                ? "LONGEST CHECK | " + full
                : "SHORTEST CHECK | " + full

        );

    }


    // --------------------------------------------------
    // RESTO — comportamento normal
    // --------------------------------------------------

    const start =
        normalized.indexOf(
            acPDFNormalizeKey(
                startTitle
            )
        );


    if(start === -1){

        return null;

    }


    let end =
        normalized.length;


    if(endTitle){

        const found =
            normalized.indexOf(
                acPDFNormalizeKey(
                    endTitle
                ),
                start + 1
            );


        if(found !== -1){

            end = found;

        }

    }


    return text.substring(
        start,
        end
    );

}


// ======================================================
// CHECK INFORMATION
// ======================================================

function acPDFExtractCheckInfo(
    block,
    mode = "NG"
){

    if(!block){

        return {

            time:null,
            supervisor:null,
            ax:null

        };

    }


    const normalized =
        acPDFNormalizeKey(
            block
        );


    const isLongest =
        normalized.startsWith(
            "LONGEST CHECK"
        );


    const isShortest =
        normalized.startsWith(
            "SHORTEST CHECK"
        );


    // --------------------------------------------------
    // TIMES
    // --------------------------------------------------

    const times =
        block.match(
            /\b\d{1,2}:\d{2}\b/g
        ) || [];


    let timeIndex;


    if(isLongest){

        timeIndex =
            mode === "MAX"
                ? 2
                : 0;

    }
    else if(isShortest){

        timeIndex =
            mode === "MAX"
                ? 3
                : 1;

    }
    else{

        timeIndex = 0;

    }


    const time =
        times[timeIndex]
            ? acPDFTime(
                times[timeIndex]
            )
            : null;


    // --------------------------------------------------
    // SUPERVISOR + AX
    //
    // O PDF tem:
    //
    // Vitor Pinto AX03
    // Carlos Silva AX04
    // Vitor Pinto AX03
    // Antonio Oliveira AX01
    //
    // "Super AX" NÃO é um supervisor.
    // --------------------------------------------------

    const pairRegex =
        /([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){1,3})\s+(AX0?[1-6])\b/g;


    const pairs = [];


    let match;


    while(
        (match =
            pairRegex.exec(block))
        !== null
    ){

        const supervisor =
            acPDFNormalizeText(
                match[1]
            );


        const ax =
            match[2]
                .toUpperCase();


        if(
            supervisor === "Super"
        ){

            continue;

        }


        if(
            supervisor.includes(
                "Super AX"
            )
        ){

            continue;

        }


        pairs.push({

            supervisor,

            ax

        });

    }


    let pairIndex;


    if(isLongest){

        pairIndex =
            mode === "MAX"
                ? 2
                : 0;

    }
    else if(isShortest){

        pairIndex =
            mode === "MAX"
                ? 3
                : 1;

    }
    else{

        pairIndex = 0;

    }


    const selected =
        pairs[pairIndex] ||
        null;


    return {

        time,

        supervisor:
            selected
                ? selected.supervisor
                : null,

        ax:
            selected
                ? selected.ax
                : null

    };

}


// ======================================================
// LABEL VALUE
// ======================================================

function acPDFExtractLabelValue(
    block,
    label,
    stopLabels = []
){

    if(!block){

        return null;

    }


    const source =
        acPDFNormalizeText(
            block
        );


    const normalized =
        acPDFNormalizeKey(
            source
        );


    const target =
        acPDFNormalizeKey(
            label
        );


    const start =
        normalized.indexOf(
            target
        );


    if(start === -1){

        return null;

    }


    let end =
        source.length;


    for(
        const stopLabel of stopLabels
    ){

        const stop =
            acPDFNormalizeKey(
                stopLabel
            );


        const index =
            normalized.indexOf(
                stop,
                start + target.length
            );


        if(
            index !== -1 &&
            index < end
        ){

            end = index;

        }

    }


    const value =
        source.substring(
            start + label.length,
            end
        );


    return acPDFKeepValue(
        value
    );

}


// ======================================================
// PAIR / ODD
// ======================================================

function acPDFExtractPairOdd(
    block
){

    const numbers =
        acPDFExtractNumbers(
            block
        );


    const times =
        block.match(
            /\b\d{1,2}:\d{2}\b/g
        ) || [];


    const ngNumber =
        numbers.length
            ? acPDFInteger(
                numbers[0]
            )
            : null;


    const ngTime =
        times.length
            ? acPDFTime(
                times[0]
            )
            : null;


    const maxNumber =
        numbers.length > 1
            ? acPDFInteger(
                numbers[1]
            )
            : null;


    const maxTime =
        times.length > 1
            ? acPDFTime(
                times[1]
            )
            : null;


    return {

        ng:{

            number:
                ngNumber,

            averageTime:
                ngTime

        },

        max:{

            number:
                maxNumber,

            averageTime:
                maxTime

        }

    };

}


// ======================================================
// A-CHECKS PERFORMED
// ======================================================

function acPDFExtractAChecksPerformed(
    text
){

    const section =
        acPDFExtractSection(
            text,
            [
                "A-Checks Performed",
                "A CHECKS PERFORMED"
            ],
            [
                "Deferred Tasks",
                "DEFERRED TASKS"
            ]
        );


    if(!section){

        return null;

    }


    const result = {

        ng:{

            ax01:null,
            ax02:null,
            ax03:null,
            ax04:null,
            ax05:null,
            ax06:null

        },

        max:{

            ax01:null,
            ax02:null,
            ax03:null,
            ax04:null,
            ax05:null,
            ax06:null

        }

    };


    const rows =
        acPDFExtractRows(
            section
        );


    rows.forEach(
        row => {

            const normalized =
                acPDFNormalizeKey(
                    row
                );


            const axMatch =
                normalized.match(
                    /\bAX0?([1-6])\b/
                );


            if(!axMatch){

                return;

            }


            const axKey =
                `ax0${axMatch[1]}`;


            const numbers =
                acPDFExtractNumbers(
                    row
                );


            if(!numbers.length){

                return;

            }


            // Mantemos a ordem encontrada no relatório.
            //
            // O primeiro valor pertence ao NG
            // e o segundo ao MAX apenas quando
            // ambos existem explicitamente na mesma
            // estrutura.
            //
            // Se não conseguirmos determinar os dois,
            // deixamos null.

            if(numbers.length >= 2){

                result.ng[axKey] =
                    acPDFInteger(
                        numbers[0]
                    );

                result.max[axKey] =
                    acPDFInteger(
                        numbers[1]
                    );

            }
            else{

                result.ng[axKey] =
                    acPDFInteger(
                        numbers[0]
                    );

            }

        }
    );


    return result;

}

// ======================================================
// A-CHECK — PDF IMPORT
// BLOCK 5 — PAGE 3 PARSER
// ======================================================
//
// PAGE 3:
//
// 1. Deferred Tasks Flowchart
// 2. Stock Study
// 3. Last 5 Deferred Taskcards
// 4. Deferred Tasks — Last 3 Months
//
// ======================================================

function parseACheckPDFPage3(
    imported
){

    const text =
        imported.raw.page3 || "";

// ==================================================
// PAGE 3 VISUAL LAYOUT
// ==================================================

window.__acCheckPDFPage3Layout =
    imported.raw.page3Layout ||
    null;


    if(!text){

        return;

    }


    // ==================================================
    // 1. DEFERRED TASKS FLOWCHART
    // ==================================================

    const flowchartSection =
        acPDFExtractSection(
            text,
            [
                "Flowchart",
                "FLOWCHART"
            ],
            [
                "Stock Study",
                "STOCK STUDY"
            ]
        );


    if(flowchartSection){

        imported.page3.flowchart.ng =
            acPDFExtractFlowchart(
                flowchartSection,
                "NG"
            );


        imported.page3.flowchart.max =
            acPDFExtractFlowchart(
                flowchartSection,
                "MAX"
            );

    }


    // ==================================================
    // 2. STOCK STUDY
    // ==================================================

    const stockSection =
        acPDFExtractSection(
            text,
            [
                "Stock Study",
                "STOCK STUDY"
            ],
            [
                "Last 5 Deferred Taskcards",
                "LAST 5 DEFERRED TASKCARDS"
            ]
        );


    if(stockSection){

        imported.page3.stockStudy.ng =
            acPDFExtractStockStudy(
                stockSection,
                "NG"
            );


        imported.page3.stockStudy.max =
            acPDFExtractStockStudy(
                stockSection,
                "MAX"
            );

    }


    // ==================================================
    // 3. LAST 5 DEFERRED TASKCARDS
    // ==================================================

    const taskcardsSection =
        acPDFExtractSection(
            text,
            [
                "Last 5 Deferred Taskcards",
                "LAST 5 DEFERRED TASKCARDS"
            ],
            [
                "Deferred Tasks in Last 3 Months",
                "DEFERRED TASKS IN LAST 3 MONTHS"
            ]
        );


    if(taskcardsSection){

        imported.page3.lastTaskcards.ng =
            acPDFExtractTaskcards(
                taskcardsSection,
                "NG"
            );


        imported.page3.lastTaskcards.max =
            acPDFExtractTaskcards(
                taskcardsSection,
                "MAX"
            );

    }


    // ==================================================
    // 4. DEFERRED TASKS — LAST 3 MONTHS
    // ==================================================

    const last3MonthsSection =
        acPDFExtractSection(
            text,
            [
                "Deferred Tasks in Last 3 Months",
                "DEFERRED TASKS IN LAST 3 MONTHS"
            ],
            []
        );


    if(last3MonthsSection){

        imported.page3.last3Months.ng =
            acPDFExtractLast3Months(
                last3MonthsSection,
                "NG"
            );


        imported.page3.last3Months.max =
            acPDFExtractLast3Months(
                last3MonthsSection,
                "MAX"
            );

    }


    console.log(
        "A-CHECK PDF — PAGE 3 PARSED:",
        imported.page3
    );

}


// ======================================================
// FLOWCHART
// ======================================================
//
// Cada linha representa:
//
// TASK
// VAL
// AOG
// REG
//
// NG e MAX são tratados separadamente.
//
// ======================================================

function acPDFExtractFlowchart(
    section,
    type
){

    if(!section){

        return [];

    }


    const rows =
        acPDFExtractLogicalRows(
            section
        );


    const result = [];


    rows.forEach(
        row => {

            const task =
                acPDFFindTaskName(
                    row
                );


            if(!task){

                return;

            }


            const values =
                acPDFExtractFlowValues(
                    row
                );


            result.push({

                task:

                    task,

                val:

                    values.val,

                aog:

                    values.aog,

                reg:

                    values.reg

            });

        }
    );


    return result;

}


// ======================================================
// FLOWCHART VALUES
// ======================================================

function acPDFExtractFlowValues(
    row
){

    if(!row){

        return {

            val:null,

            aog:null,

            reg:null

        };

    }


    const source =
        acPDFNormalizeText(
            row
        );


    // --------------------------------------------------
    // AOG
    // --------------------------------------------------

    let aog = null;


    const aogMatch =
        source.match(
            /\bAOG\b\s*[:\-]?\s*([XY])\b/i
        );


    if(aogMatch){

        aog =
            aogMatch[1]
                .toUpperCase() === "X"
                    ? "N (Cross)"
                    : "Y";

    }
    else{

        // Se o PDF só tiver o carácter X/Y
        // sem a label explícita, não adivinhamos.
        aog = null;

    }


    // --------------------------------------------------
    // REG
    // --------------------------------------------------
    //
    // REG é texto.
    //
    // Não usamos acPDFNumber().
    //

    let reg = null;


    const regMatch =
        source.match(
            /\bREG\b\s*[:\-]?\s*([A-Z0-9][A-Z0-9 ./_-]*)/i
        );


    if(regMatch){

        reg =
            acPDFKeepValue(
                regMatch[1]
            );

    }


    // --------------------------------------------------
    // VAL
    // --------------------------------------------------

    let val = null;


    const valMatch =
        source.match(
            /\bVAL\b\s*[:\-]?\s*([A-Z0-9][A-Z0-9 ./_-]*)/i
        );


    if(valMatch){

        val =
            acPDFKeepValue(
                valMatch[1]
            );

    }


    return {

        val,

        aog,

        reg

    };

}


// ======================================================
// FIND TASK NAME
// ======================================================

function acPDFFindTaskName(
    row
){

    if(!row){

        return null;

    }


    const normalized =
        acPDFNormalizeKey(
            row
        );


    const tasks = [

        "LATE ARR",

        "LATE ARR.",

        "OPS",

        "EARLY DEP",

        "EARLY DEP.",

        "ENG FR",

        "ENG. FR",

        "NO PARTS",

        "NO TOOLS"

    ];


    for(
        const task of tasks
    ){

        if(
            normalized.includes(
                acPDFNormalizeKey(
                    task
                )
            )
        ){

            return task
                .replace(
                    "LATE ARR",
                    "LATE ARR."
                )
                .replace(
                    "EARLY DEP",
                    "EARLY DEP."
                )
                .replace(
                    "ENG FR",
                    "ENG. (FR)"
                );

        }

    }


    return null;

}


// ======================================================
// STOCK STUDY
// ======================================================
//
// Estrutura:
//
// DAY
// P/N
// SPA
// STOCK
// OBS.
//
// ======================================================

// ======================================================
// PAGE 3 — LAYOUT SECTION HELPER
// ======================================================

function acPDFGetLayoutSection(
    layout,
    startTitles,
    endTitles
){

    if(
        !layout ||
        !Array.isArray(layout.lines)
    ){

        return [];

    }


    const lines =
        layout.lines;


    let startIndex = -1;


    // --------------------------------------------------
    // FIND SECTION START
    // --------------------------------------------------

    for(
        let i = 0;
        i < lines.length;
        i++
    ){

        const normalized =
            acPDFNormalizeKey(
                lines[i].text
            );


        if(
            startTitles.some(
                title =>
                    normalized.includes(
                        acPDFNormalizeKey(
                            title
                        )
                    )
            )
        ){

            startIndex =
                i;

            break;

        }

    }


    if(
        startIndex === -1
    ){

        return [];

    }


    // --------------------------------------------------
    // FIND SECTION END
    // --------------------------------------------------

    let endIndex =
        lines.length;


    for(
        let i =
            startIndex + 1;

        i < lines.length;

        i++
    ){

        const normalized =
            acPDFNormalizeKey(
                lines[i].text
            );


        if(
            endTitles.some(
                title =>
                    normalized.includes(
                        acPDFNormalizeKey(
                            title
                        )
                    )
            )
        ){

            endIndex =
                i;

            break;

        }

    }


    return lines.slice(
        startIndex + 1,
        endIndex
    );

}


// ======================================================
// COLUMN ROW COLLECTOR
// ======================================================
//
// startRegex identifica o início REAL de uma linha.
//
// Não existe número fixo de linhas.
// ======================================================

function acPDFCollectColumnRows(
    lines,
    column,
    startRegex
){

    const rows = [];

    let current = null;


    lines.forEach(
        line => {

            const value =
                acPDFNormalizeText(
                    line[column]
                );


            if(!value){

                return;

            }


            // ------------------------------------------------
            // Novo registo
            // ------------------------------------------------

            if(
                startRegex.test(
                    value
                )
            ){

                if(current){

                    rows.push(
                        current
                    );

                }


                current =
                    value;

                return;

            }


            // ------------------------------------------------
            // Continuação da linha anterior
            // ------------------------------------------------

            if(current){

                current +=
                    " " +
                    value;

            }

        }
    );


    if(current){

        rows.push(
            current
        );

    }


    return rows;

}


// ======================================================
// STOCK STUDY
// ======================================================

function acPDFExtractStockStudy(
    section,
    type
){

    // --------------------------------------------------
    // ATENÇÃO:
    //
    // Esta função antiga recebe "section" em texto.
    //
    // Para o PDF usamos o layout global da PAGE 3.
    // --------------------------------------------------

    const layout =
        window.__acCheckPDFPage3Layout;


    if(
        !layout
    ){

        return [];

    }


    const lines =
        acPDFGetLayoutSection(

            layout,

            [
                "Stock Study",
                "STOCK STUDY"
            ],

            [
                "Last 5 Deferred Taskcards",
                "LAST 5 DEFERRED TASKCARDS"
            ]

        );


    if(!lines.length){

        return [];

    }


    const rows =
        acPDFCollectColumnRows(

            lines,

            type === "NG"
                ? "left"
                : "right",

            /^\d{1,2}-[A-Za-z]{3}\b/

        );


    return rows
        .map(
            row =>
                acPDFExtractStockRow(
                    row
                )
        )
        .filter(
            row =>
                row.day !== null ||
                row.pn !== null ||
                row.spa !== null ||
                row.stock !== null ||
                row.obs !== null
        );

}


// ======================================================
// STOCK ROW
// ======================================================

function acPDFExtractStockRow(
    row
){

    if(!row){

        return {

            day:null,
            pn:null,
            spa:null,
            stock:null,
            obs:null

        };

    }


    const source =
        acPDFNormalizeText(
            row
        );


    // --------------------------------------------------
    // DAY
    // --------------------------------------------------

    const dayMatch =
        source.match(
            /^(\d{1,2}-[A-Za-z]{3})\b/
        );


    const day =
        dayMatch
            ? acPDFKeepValue(
                dayMatch[1]
            )
            : null;


    // --------------------------------------------------
    // REST
    // --------------------------------------------------

    const rest =
        dayMatch
            ? source
                .substring(
                    dayMatch[0].length
                )
                .trim()
            : source;


    // --------------------------------------------------
    // DATA COLUMNS
    //
    // DAY | P/N | SPA | STOCK | OBS
    //
    // SPA and STOCK are numeric in the PDF.
    // P/N remains text.
    // OBS is whatever remains after STOCK.
    // --------------------------------------------------

    const match =
        rest.match(
            /^(\S+)\s+(\S+)\s+(\S+)(?:\s+(.*))?$/
        );


    if(!match){

        return {

            day,

            pn:null,

            spa:null,

            stock:null,

            obs:null

        };

    }


    return {

        day,

        pn:
            acPDFKeepValue(
                match[1]
            ),

        spa:
            acPDFKeepValue(
                match[2]
            ),

        stock:
            acPDFKeepValue(
                match[3]
            ),

        obs:
            match[4]
                ? acPDFKeepValue(
                    match[4]
                )
                : null

    };

}


// ======================================================
// LAST 5 TASKCARDS
// ======================================================

function acPDFExtractTaskcards(
    section,
    type
){

    const layout =
        window.__acCheckPDFPage3Layout;


    if(
        !layout
    ){

        return [];

    }


    const lines =
        acPDFGetLayoutSection(

            layout,

            [
                "Last 5 Deferred Taskcards",
                "LAST 5 DEFERRED TASKCARDS"
            ],

            [
                "Deferred Tasks in Last 3 Months",
                "DEFERRED TASKS IN LAST 3 MONTHS"
            ]

        );


    if(!lines.length){

        return [];

    }


    const rows =
        acPDFCollectColumnRows(

            lines,

            type === "NG"
                ? "left"
                : "right",

            /^AX0?[1-6]\b/i

        );


    return rows
        .map(
            row =>
                acPDFExtractTaskcardRow(
                    row
                )
        )
        .filter(
            row =>
                row.ax !== null ||
                row.task !== null ||
                row.pn1 !== null ||
                row.pn2 !== null ||
                row.day !== null
        );

}


// ======================================================
// TASKCARD ROW
// ======================================================

function acPDFExtractTaskcardRow(
    row
){

    if(!row){

        return {

            ax:null,

            task:null,

            pn1:null,

            pn2:null,

            day:null

        };

    }


    const source =
        acPDFNormalizeText(
            row
        );


    // --------------------------------------------------
    // AX
    // --------------------------------------------------

    const axMatch =
        source.match(
            /^AX0?([1-6])\b/i
        );


    const ax =
        axMatch
            ? `AX0${axMatch[1]}`
            : null;


    // --------------------------------------------------
    // DAY
    // --------------------------------------------------

    const dayMatch =
        source.match(
            /\b(\d{1,2}-[A-Za-z]{3})\b/
        );


    const day =
        dayMatch
            ? acPDFKeepValue(
                dayMatch[1]
            )
            : null;


    // --------------------------------------------------
    // CONTENT BETWEEN AX AND DAY
    // --------------------------------------------------

    let middle =
        source;


    if(axMatch){

        middle =
            source.substring(
                axMatch[0].length
            );

    }


    if(dayMatch){

        const dayIndex =
            middle.lastIndexOf(
                dayMatch[0]
            );


        if(dayIndex !== -1){

            middle =
                middle.substring(
                    0,
                    dayIndex
                );

        }

    }


    middle =
        acPDFNormalizeText(
            middle
        );


    // --------------------------------------------------
    // TASK / PN1 / PN2
    //
    // First token = TASK
    // Second token = PN #1
    // Third token = PN #2
    //
    // If something is missing, we leave it null.
    // --------------------------------------------------

    const tokens =
        middle
            ? middle.split(/\s+/)
            : [];


    const task =
        tokens[0]
            ? acPDFKeepValue(
                tokens[0]
            )
            : null;


    const pn1 =
        tokens[1]
            ? acPDFKeepValue(
                tokens[1]
            )
            : null;


    const pn2 =
        tokens[2]
            ? acPDFKeepValue(
                tokens[2]
            )
            : null;


    return {

        ax,

        task,

        pn1,

        pn2,

        day

    };

}

// ======================================================
// DEFERRED TASKS — LAST 3 MONTHS
// ======================================================
//
// Month labels seguem a mesma lógica dos gráficos
// anteriores:
//
// 2026-02 → FEB
// 2026-03 → MAR
// etc.
//
// ======================================================

function acPDFExtractLast3Months(
    section,
    type
){

    if(!section){

        return [];

    }


    const rows =
        acPDFExtractRows(
            section
        );


    const result = [];


    rows.forEach(
        row => {

            const month =
                acPDFExtractMonth(
                    row
                );


            if(month === null){

                return;

            }


            result.push({

                month:
                    month.label,

                noParts:
                    acPDFExtractNumber(
                        row,
                        [
                            "NO PARTS"
                        ]
                    ),

                noTime:
                    acPDFExtractNumber(
                        row,
                        [
                            "NO TIME"
                        ]
                    ),

                noTools:
                    acPDFExtractNumber(
                        row,
                        [
                            "NO TOOLS"
                        ]
                    ),

                lateArrival:
                    acPDFExtractNumber(
                        row,
                        [
                            "LATE ARR.",
                            "LATE ARR"
                        ]
                    ),

                ops:
                    acPDFExtractNumber(
                        row,
                        [
                            "OPS."
                        ]
                    ),

                earlyDeparture:
                    acPDFExtractNumber(
                        row,
                        [
                            "EARLY DEP.",
                            "EARLY DEP"
                        ]
                    ),

                engFR:
                    acPDFExtractNumber(
                        row,
                        [
                            "ENG. (FR)",
                            "ENG FR"
                        ]
                    )

            });

        }
    );


    return result;

}


// ======================================================
// LOGICAL ROWS
// ======================================================
//
// O texto extraído pelo PDF.js pode não preservar
// exactamente as linhas visuais.
//
// Aqui usamos linhas/tokens separados por múltiplos
// espaços ou quebras de estrutura.
//
// ======================================================

function acPDFExtractLogicalRows(
    section
){

    if(!section){

        return [];

    }


    const text =
        String(
            section
        )
        .replace(
            /\r/g,
            ""
        );


    const lines =
        text
            .split(
                /\n+/
            )
            .map(
                line =>
                    acPDFNormalizeText(
                        line
                    )
            )
            .filter(
                line =>
                    line !== ""
            );


    if(lines.length > 1){

        return lines;

    }


    // Fallback para PDFs onde o PDF.js devolve
    // tudo numa única linha.
    //
    // Não inventamos conteúdo; apenas tentamos
    // separar onde aparecem AX / dias / labels.

    const tokens =
        text
            .split(
                /(?=\bAX0?[1-6]\b)|(?=\b(?:MON|TUE|WED|THU|FRI|SAT|SUN)\b)/i
            )
            .map(
                value =>
                    acPDFNormalizeText(
                        value
                    )
            )
            .filter(
                value =>
                    value !== ""
            );


    return tokens.length
        ? tokens
        : [text];

}

// ======================================================
// A-CHECK — PDF IMPORT
// BLOCK 6 — PAGE 4 PARSER
// ======================================================
//
// PAGE 4:
//
// 1. HIL'S OPENED AND NOT PERFORMED
// 2. HIL'S PER A-CHECK SUPER
//
// Regras:
//
// - Só usamos informação efectivamente encontrada.
// - Os meses são obtidos do PDF.
// - Não fixamos nomes de Supervisores.
// - Não fixamos número de Supervisores.
// - Não inventamos valores.
// - "-" mantém-se "-".
//
// ======================================================

function parseACheckPDFPage4(
    imported
){

    const text =
        imported.raw.page4 || "";


    if(!text){

        return;

    }


    // ==================================================
    // 1. HIL AVERAGE / SUMMARY
    // ==================================================

    const hilSummary =
        acPDFExtractHILSummary(
            text
        );


    if(hilSummary){

        imported.page4.hils =
            hilSummary;

    }


    // ==================================================
    // 2. HIL HISTORY
    // ==================================================
    //
    // Gráfico:
    //
    // 2025-12
    // 2026-01
    // 2026-02
    // ...
    //
    // NG
    // MAX
    //
    // Guardamos apenas os meses que aparecem
    // realmente no PDF.
    //
    // ==================================================

    const hilHistory =
        acPDFExtractHILHistory(
            text
        );


    if(hilHistory.length){

        imported.page4.hils.history =
            hilHistory;

    }


    // ==================================================
    // 3. HILS PER A-CHECK SUPER
    // ==================================================

    const hilsPerSuper =
        acPDFExtractHILsPerSuper(
            text
        );


    if(
        hilsPerSuper.labels.length ||
        hilsPerSuper.ng.length ||
        hilsPerSuper.max.length
    ){

        imported.page4.hilsPerSuper =
            hilsPerSuper;

    }


    // ==================================================
    // DEBUG
    // ==================================================

    console.log(
        "A-CHECK PDF — PAGE 4 PARSED:",
        imported.page4
    );

}


// ======================================================
// HIL SUMMARY
// ======================================================
//
// O relatório apresenta:
//
// AVERAGE PER MONTH
// HIL'S OPENED AND NOT PERFORMED
// [mês actual]
// [mês anterior]
//
// E uma segunda série para MAX.
//
// Não assumimos que os números são sempre inteiros.
// ======================================================

function acPDFExtractHILSummary(
    text
){

    if(!text){

        return null;

    }


    const normalized =
        acPDFNormalizeKey(
            text
        );


    const marker =
        "AVERAGE PER MONTH";


    const index =
        normalized.indexOf(
            marker
        );


    if(index === -1){

        return null;

    }


    const source =
        text.substring(
            index,
            Math.min(
                text.length,
                index + 500
            )
        );


    // --------------------------------------------------
    // NUMBERS
    // --------------------------------------------------

    const numbers =
        acPDFExtractNumbers(
            source
        );


    if(
        numbers.length < 3
    ){

        return null;

    }


    const result = {

        ng:{

            average:null,

            month1:null,

            month2:null

        },

        max:{

            average:null,

            month1:null,

            month2:null

        }

    };


    // --------------------------------------------------
    // IMPORTANT
    // --------------------------------------------------
    //
    // Só atribuímos a sequência completa quando
    // conseguimos identificar 6 valores.
    //
    // Se o PDF extraction não os separar claramente,
    // deixamos os campos não identificados como null.
    //
    // --------------------------------------------------

    if(
        numbers.length >= 6
    ){

        result.ng.average =
            numbers[0];

        result.ng.month1 =
            numbers[1];

        result.ng.month2 =
            numbers[2];

        result.max.average =
            numbers[3];

        result.max.month1 =
            numbers[4];

        result.max.month2 =
            numbers[5];

    }
    else if(
        numbers.length >= 3
    ){

        result.ng.average =
            numbers[0];

        result.ng.month1 =
            numbers[1];

        result.ng.month2 =
            numbers[2];

    }


    return result;

}


// ======================================================
// HIL HISTORY
// ======================================================
//
// Procuramos pares:
//
// YYYY-MM VALUE
//
// E mantemos apenas ocorrências que aparecem
// efectivamente no PDF.
//
// ======================================================

function acPDFExtractHILHistory(
    text
){

    if(!text){

        return [];

    }


    const result = [];


    const regex =
        /\b(20\d{2}-(?:0[1-9]|1[0-2]))\b\s+(-?\d+(?:[.,]\d+)?)/g;


    let match;


    while(
        (match =
            regex.exec(text))
        !== null
    ){

        const month =
            match[1];


        const value =
            acPDFNumber(
                match[2]
            );


        if(
            !result.some(
                row =>
                    row.month === month
            )
        ){

            result.push({

                month,

                label:
                    acPDFMonthLabelFromYYYYMM(
                        month
                    ),

                ng:value,

                max:null

            });

        }

    }


    // --------------------------------------------------
    // Tentar preencher MAX quando o texto disponibiliza
    // uma segunda sequência para os mesmos meses.
    //
    // Se não for possível separar de forma segura,
    // MAX permanece null.
    // --------------------------------------------------

    return result;

}


// ======================================================
// YYYY-MM → MONTH LABEL
// ======================================================

function acPDFMonthLabelFromYYYYMM(
    value
){

    const match =
        String(
            value || ""
        ).match(
            /^(20\d{2})-(\d{2})$/
        );


    if(!match){

        return null;

    }


    const month =
        Number(
            match[2]
        );


    const labels = [

        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC"

    ];


    return labels[
        month - 1
    ] || null;

}


// ======================================================
// HILS PER A-CHECK SUPER
// ======================================================
//
// Estrutura visual:
//
// Supervisor
//
// F. Montenegro
// D. Correia
// H. Basto
// ...
//
// E várias labels de mês:
//
// 2026-02
// 2026-03
// ...
//
// O número de Supervisors e de meses é variável.
//
// ======================================================

function acPDFExtractHILsPerSuper(
    text
){

    const result = {

        labels:[],

        ng:[],

        max:[]

    };


    if(!text){

        return result;

    }


    // ==================================================
    // ENCONTRAR SECÇÃO
    // ==================================================

    const normalized =
        acPDFNormalizeKey(
            text
        );


    const marker =
        "HIL'S PER A-CHECK SUPER";


    const start =
        normalized.indexOf(
            marker
        );


    if(start === -1){

        return result;

    }


    const section =
        text.substring(
            start,
            Math.min(
                text.length,
                start + 3000
            )
        );


    // ==================================================
    // MONTH LABELS
    // ==================================================

    const monthMatches =
        [
            ...section.matchAll(
                /\b(20\d{2}-(?:0[1-9]|1[0-2]))\b/g
            )
        ];


    monthMatches.forEach(
        match => {

            if(
                !result.labels.includes(
                    match[1]
                )
            ){

                result.labels.push(
                    match[1]
                );

            }

        }
    );


    // ==================================================
    // SUPERVISOR NAMES
    // ==================================================
    //
    // Procuramos nomes que aparecem associados aos
    // gráficos.
    //
    // Não temos uma lista fechada de Supervisors.
    //
    // ==================================================

    const lines =
        section
            .split(
                /\n+/
            )
            .map(
                line =>
                    acPDFNormalizeText(
                        line
                    )
            )
            .filter(
                line =>
                    line !== ""
            );


    const excluded = [

        "HIL'S PER A-CHECK SUPER",

        "HILS PER A-CHECK SUPER",

        "3 MONTH MOBIL AVERAGE",

        "AVERAGE PER MONTH",

        "NUMBER OF HILS",

        "HIL'S OPENED AND NOT PERFORMED"

    ];


    const names = [];


    lines.forEach(
        line => {

            const normalizedLine =
                acPDFNormalizeKey(
                    line
                );


            if(
                excluded.some(
                    item =>
                        normalizedLine.includes(
                            acPDFNormalizeKey(
                                item
                            )
                        )
                )
            ){

                return;

            }


            // Ignorar linhas que são apenas números,
            // datas ou eixos.
            if(
                /^\d[\d\s:.,%-]*$/.test(
                    line
                )
            ){

                return;

            }


            if(
                /\b20\d{2}-\d{2}\b/.test(
                    line
                )
            ){

                return;

            }


            // Um nome de supervisor normalmente
            // contém letras e espaço.
            //
            // Não aceitamos linhas demasiado grandes,
            // para evitar capturar texto do título.
            if(
                line.length >= 2 &&
                line.length <= 60 &&
                /[A-Za-zÀ-ÿ]/.test(line) &&
                !/\d{2,}/.test(line)
            ){

                if(
                    !names.includes(
                        line
                    )
                ){

                    names.push(
                        line
                    );

                }

            }

        }
    );


    // ==================================================
    // BUILD SUPERVISOR STRUCTURES
    // ==================================================
    //
    // Sem uma separação inequívoca NG/MAX no texto
    // extraído, não vamos atribuir uma pessoa à série
    // errada.
    //
    // Primeiro guardamos os nomes conhecidos.
    //
    // Os valores serão preenchidos apenas quando
    // conseguirmos associá-los claramente.
    // ==================================================

    names.forEach(
        name => {

            result.ng.push({

                name,

                data:
                    result.labels.map(
                        () => null
                    )

            });

        }
    );


    // ==================================================
    // TENTAR ASSOCIAR VALORES
    // ==================================================
    //
    // Só fazemos isto quando existe uma linha que
    // contém claramente:
    //
    // NAME + valores
    //
    // Caso contrário, os valores permanecem null.
    //
    // ==================================================

    lines.forEach(
        line => {

            const nameIndex =
                names.findIndex(
                    name =>
                        line.includes(
                            name
                        )
                );


            if(nameIndex === -1){

                return;

            }


            const numbers =
                acPDFExtractNumbers(
                    line
                );


            if(
                !numbers.length
            ){

                return;

            }


            const target =
                result.ng[
                    nameIndex
                ];


            if(!target){

                return;

            }


            numbers
                .slice(
                    0,
                    result.labels.length
                )
                .forEach(
                    (
                        value,
                        index
                    ) => {

                        target.data[index] =
                            value;

                    }
                );

        }
    );


    return result;

}

// ======================================================
// A-CHECK — PDF IMPORT
// BLOCK 7 — PAGE 5 PARSER
// ======================================================
//
// PAGE 5:
//
// 1. P/N OUT OF STOCK
// 2. CURRENT HILs PER SUPER
// 3. TOP REQUESTED P/N
// 4. TOP REQUESTED P/N — LAST 3 MONTHS
//
// ======================================================

function parseACheckPDFPage5(
    imported
){

    const text =
        imported.raw.page5 || "";


    if(!text){

        return;

    }


    // ==================================================
    // 1. P/N OUT OF STOCK
    // ==================================================

    const stockSection =
        acPDFExtractSection(
            text,
            [
                "P/N Out of Stock",
                "PN OUT OF STOCK",
                "P/N OUT OF STOCK"
            ],
            [
                "Current HILs per Super",
                "CURRENT HILS PER SUPER",
                "Top Requested P/N",
                "TOP REQUESTED P/N"
            ]
        );


    if(stockSection){

        imported.page5.pnOutOfStock =
            acPDFExtractPNOutOfStock(
                stockSection
            );

    }


    // ==================================================
    // 2. CURRENT HILs PER SUPER
    // ==================================================

    const currentHilsSection =
        acPDFExtractSection(
            text,
            [
                "Current HILs per Super",
                "CURRENT HILs PER SUPER",
                "CURRENT HILS PER SUPER"
            ],
            [
                "Top Requested P/N",
                "TOP REQUESTED P/N"
            ]
        );


    if(currentHilsSection){

        imported.page5.currentHilsPerSuper =
            acPDFExtractCurrentHILs(
                currentHilsSection
            );

    }


    // ==================================================
    // 3. TOP REQUESTED P/N
    // ==================================================

    const topPNSection =
        acPDFExtractSection(
            text,
            [
                "Top Requested P/N",
                "TOP REQUESTED P/N"
            ],
            [
                "Top Requested P/N Last 3M",
                "TOP REQUESTED P/N LAST 3M",
                "Top Requested P/N Last 3 Months"
            ]
        );


    if(topPNSection){

        const topPN =
            acPDFExtractTopRequestedPN(
                topPNSection
            );


        imported.page5.topRequestedPN.ng =
            topPN.ng;


        imported.page5.topRequestedPN.max =
            topPN.max;

    }


    // ==================================================
    // 4. TOP REQUESTED P/N — LAST 3 MONTHS
    // ==================================================

    const topPN3MSection =
        acPDFExtractSection(
            text,
            [
                "Top Requested P/N Last 3M",
                "TOP REQUESTED P/N LAST 3M",
                "Top Requested P/N Last 3 Months"
            ],
            []
        );


    if(topPN3MSection){

        const topPN3M =
            acPDFExtractTopPN3M(
                topPN3MSection
            );


        imported.page5.topPN3M.ng =
            topPN3M.ng;


        imported.page5.topPN3M.max =
            topPN3M.max;

    }


    console.log(
        "A-CHECK PDF — PAGE 5 PARSED:",
        imported.page5
    );

}


// ======================================================
// P/N OUT OF STOCK
// ======================================================
//
// Esta secção pode apresentar um valor diferente
// para NG e MAX.
//
// Se a associação não for clara no texto extraído,
// mantemos null.
//
// ======================================================

function acPDFExtractPNOutOfStock(
    section
){

    const result = {

        ng:null,

        max:null

    };


    if(!section){

        return result;

    }


    const normalized =
        acPDFNormalizeKey(
            section
        );


    // --------------------------------------------------
    // NG
    // --------------------------------------------------

    const ngIndex =
        normalized.indexOf(
            "NG"
        );


    if(ngIndex !== -1){

        const ngText =
            section.substring(
                ngIndex,
                Math.min(
                    section.length,
                    ngIndex + 100
                )
            );


        result.ng =
            acPDFExtractFirstUsefulValue(
                ngText
            );

    }


    // --------------------------------------------------
    // MAX
    // --------------------------------------------------

    const maxIndex =
        normalized.indexOf(
            "MAX"
        );


    if(maxIndex !== -1){

        const maxText =
            section.substring(
                maxIndex,
                Math.min(
                    section.length,
                    maxIndex + 100
                )
            );


        result.max =
            acPDFExtractFirstUsefulValue(
                maxText
            );

    }


    return result;

}


// ======================================================
// CURRENT HILs PER SUPER
// ======================================================

function acPDFExtractCurrentHILs(
    section
){

    const result = {

        ng:[],

        max:[]

    };


    if(!section){

        return result;

    }


    const rows =
        acPDFExtractLogicalRows(
            section
        );


    rows.forEach(
        row => {

            const supervisor =
                acPDFExtractSupervisorName(
                    row
                );


            if(!supervisor){

                return;

            }


            const numbers =
                acPDFExtractNumbers(
                    row
                );


            result.ng.push({

                name:
                    supervisor,

                value:
                    numbers.length
                        ? numbers[0]
                        : null

            });


            result.max.push({

                name:
                    supervisor,

                value:
                    numbers.length > 1
                        ? numbers[1]
                        : null

            });

        }
    );


    return result;

}


// ======================================================
// SUPERVISOR NAME
// ======================================================

function acPDFExtractSupervisorName(
    row
){

    if(!row){

        return null;

    }


    const source =
        acPDFNormalizeText(
            row
        );


    const normalized =
        acPDFNormalizeKey(
            source
        );


    const labels = [

        "SUPERVISOR",

        "SUPER"

    ];


    let start = -1;

    let labelLength = 0;


    for(
        const label of labels
    ){

        const target =
            acPDFNormalizeKey(
                label
            );


        const index =
            normalized.indexOf(
                target
            );


        if(
            index !== -1
        ){

            start =
                index;

            labelLength =
                label.length;

            break;

        }

    }


    if(start !== -1){

        const after =
            source.substring(
                start +
                labelLength
            );


        const value =
            after
                .replace(
                    /^[:\-]\s*/,
                    ""
                )
                .trim();


        if(value){

            return value;

        }

    }


    // --------------------------------------------------
    // Se não existir a label, não adivinhamos.
    // --------------------------------------------------

    return null;

}


// ======================================================
// TOP REQUESTED P/N
// ======================================================
//
// Estrutura:
//
// P/N
// MATERIAL CLASS
// NUMBER OF HIL'S
// STOCK
//
// ======================================================

function acPDFExtractTopRequestedPN(
    section
){

    const result = {

        ng:[],

        max:[]

    };


    if(!section){

        return result;

    }


    const rows =
        acPDFExtractLogicalRows(
            section
        );


    rows.forEach(
        row => {

            const parsed =
                acPDFExtractTopPNRow(
                    row
                );


            if(
                !parsed.pn &&
                parsed.materialClass === null &&
                parsed.hils === null &&
                parsed.stock === null
            ){

                return;

            }


            // ------------------------------------------
            // Se a linha indicar explicitamente NG/MAX,
            // colocamos no lado correspondente.
            // ------------------------------------------

            const normalized =
                acPDFNormalizeKey(
                    row
                );


            if(
                normalized.includes(
                    "MAX"
                ) &&
                !normalized.includes(
                    "NG"
                )
            ){

                result.max.push(
                    parsed
                );

            }
            else if(
                normalized.includes(
                    "NG"
                )
            ){

                result.ng.push(
                    parsed
                );

            }
            else{

                // Não sabemos o grupo.
                //
                // Não inventamos.
                //
                // O valor não é descartado do parser
                // principal se for possível utilizá-lo
                // mais tarde, mas não o associamos
                // artificialmente a NG ou MAX.
            }

        }
    );


    return result;

}


// ======================================================
// TOP P/N ROW
// ======================================================

function acPDFExtractTopPNRow(
    row
){

    if(!row){

        return {

            pn:null,

            materialClass:null,

            hils:null,

            stock:null

        };

    }


    const source =
        acPDFNormalizeText(
            row
        );


    // --------------------------------------------------
    // P/N
    // --------------------------------------------------

    const pnMatch =
        source.match(
            /\b\d{5,}[A-Z0-9/-]*\b/
        );


    const pn =
        pnMatch
            ? acPDFKeepValue(
                pnMatch[0]
            )
            : null;


    // --------------------------------------------------
    // NUMBER OF HIL'S
    // --------------------------------------------------

    const hilMatch =
        source.match(
            /\b(?:NUMBER OF HIL'?S|HIL'?S)\b\s*[:\-]?\s*(\d+)/i
        );


    const hils =
        hilMatch
            ? acPDFInteger(
                hilMatch[1]
            )
            : null;


    // --------------------------------------------------
    // STOCK
    // --------------------------------------------------

    const stockMatch =
        source.match(
            /\bSTOCK\b\s*[:\-]?\s*([A-Z0-9./_-]+)/i
        );


    const stock =
        stockMatch
            ? acPDFKeepValue(
                stockMatch[1]
            )
            : null;


    // --------------------------------------------------
    // MATERIAL CLASS
    // --------------------------------------------------

    const materialMatch =
        source.match(
            /\b(?:MATERIAL CLASS|CLASS)\b\s*[:\-]?\s*([A-Z0-9 ./_-]+)/i
        );


    const materialClass =
        materialMatch
            ? acPDFKeepValue(
                materialMatch[1]
            )
            : null;


    return {

        pn,

        materialClass,

        hils,

        stock

    };

}


// ======================================================
// TOP REQUESTED P/N — LAST 3 MONTHS
// ======================================================
//
// Estrutura:
//
// P/N
// COUNT
//
// A quantidade de rows é determinada pelo PDF.
//
// ======================================================

function acPDFExtractTopPN3M(
    section
){

    const result = {

        ng:[],

        max:[]

    };


    if(!section){

        return result;

    }


    const rows =
        acPDFExtractLogicalRows(
            section
        );


    rows.forEach(
        row => {

            const parsed =
                acPDFExtractTopPN3MRow(
                    row
                );


            if(
                parsed.pn === null &&
                parsed.count === null
            ){

                return;

            }


            const normalized =
                acPDFNormalizeKey(
                    row
                );


            if(
                normalized.includes(
                    "MAX"
                ) &&
                !normalized.includes(
                    "NG"
                )
            ){

                result.max.push(
                    parsed
                );

            }
            else if(
                normalized.includes(
                    "NG"
                )
            ){

                result.ng.push(
                    parsed
                );

            }

        }
    );


    return result;

}


// ======================================================
// TOP P/N 3M ROW
// ======================================================

function acPDFExtractTopPN3MRow(
    row
){

    if(!row){

        return {

            pn:null,

            count:null

        };

    }


    const source =
        acPDFNormalizeText(
            row
        );


    const pnMatch =
        source.match(
            /\b\d{5,}[A-Z0-9/-]*\b/
        );


    const pn =
        pnMatch
            ? acPDFKeepValue(
                pnMatch[0]
            )
            : null;


    const countMatch =
        source.match(
            /\bCOUNT\b\s*[:\-]?\s*(\d+)/i
        );


    const count =
        countMatch
            ? acPDFInteger(
                countMatch[1]
            )
            : null;


    return {

        pn,

        count

    };

}


// ======================================================
// FIRST USEFUL VALUE
// ======================================================

function acPDFExtractFirstUsefulValue(
    text
){

    if(!text){

        return null;

    }


    const source =
        acPDFNormalizeText(
            text
        );


    // "-" é válido.
    if(source === "-"){

        return "-";

    }


    const time =
        source.match(
            /\b\d{1,2}:\d{2}\b/
        );


    if(time){

        return time[0];

    }


    const number =
        source.match(
            /\b-?\d+(?:[.,]\d+)?\b/
        );


    if(number){

        return acPDFNumber(
            number[0]
        );

    }


    return acPDFKeepValue(
        source
    );

}

// ======================================================
// A-CHECK — PDF IMPORT
// BLOCK 10 — APPLY TO REAL EDIT STATE
// ======================================================
//
// IMPORTANTE:
//
// O parser continua neutro.
//
// Aqui fazemos:
//
// PDF
//  ↓
// imported
//  ↓
// currentShift
//  ↓
// appStates[currentShift]
//
// DAY  → Day
// NIGHT → Night
//
// null / undefined → NÃO ALTERAR
// "-"               → ALTERAR PARA "-"
// ======================================================

function applyACheckPDFToEditState(
    imported
){

    if(!imported){

        return;

    }


    // ==================================================
    // TARGET SHIFT
    // ==================================================

    const targetShift =
        currentShift === "Night"
            ? "Night"
            : "Day";


    if(
        !appStates[targetShift]
    ){

        console.warn(
            "A-CHECK PDF APPLY: target shift not found.",
            targetShift
        );

        return;

    }


    const state =
        appStates[targetShift];


    // ==================================================
    // SAFE VALUE
    // ==================================================

    function setIfKnown(
        object,
        key,
        value
    ){

        if(
            value !== null &&
            value !== undefined
        ){

            object[key] =
                value;

        }

    }


    // ==================================================
    // SAFE ARRAY
    // ==================================================

    function setArrayIfKnown(
        object,
        key,
        value
    ){

        if(
            Array.isArray(value) &&
            value.length > 0
        ){

            object[key] =
                value;

        }

    }


    // ==================================================
    // GENERAL
    // ==================================================

    setIfKnown(
        state,
        "month1",
        imported.common?.month1
    );


    setIfKnown(
        state,
        "month2",
        imported.common?.month2
    );


    // ==================================================
    // PAGE 2 — NG
    // ==================================================

    const ng =
        imported.page2?.ng;


    if(ng){

        setIfKnown(
            state,
            "ngTot",
            ng.totalAverage
        );


        setIfKnown(
            state,
            "ngPrev",
            ng.month1Average
        );


        setIfKnown(
            state,
            "ngCurr",
            ng.month2Average
        );


        // ----------------------------------------------
        // LONGEST
        // ----------------------------------------------

        if(ng.longest){

            setIfKnown(
                state,
                "ngLTime",
                ng.longest.time
            );


            setIfKnown(
                state,
                "ngLSup",
                ng.longest.supervisor
            );


            setIfKnown(
                state,
                "ngLChk",
                ng.longest.ax
            );

        }


        // ----------------------------------------------
        // SHORTEST
        // ----------------------------------------------

        if(ng.shortest){

            setIfKnown(
                state,
                "ngSTime",
                ng.shortest.time
            );


            setIfKnown(
                state,
                "ngSSup",
                ng.shortest.supervisor
            );


            setIfKnown(
                state,
                "ngSChk",
                ng.shortest.ax
            );

        }


        // ----------------------------------------------
        // PAIR
        // ----------------------------------------------

        if(ng.pair){

            setIfKnown(
                state,
                "ngPairNum",
                ng.pair.number
            );


            setIfKnown(
                state,
                "ngPairTime",
                ng.pair.averageTime
            );

        }


        // ----------------------------------------------
        // ODD
        // ----------------------------------------------

        if(ng.odd){

            setIfKnown(
                state,
                "ngOddNum",
                ng.odd.number
            );


            setIfKnown(
                state,
                "ngOddTime",
                ng.odd.averageTime
            );

        }


        // ----------------------------------------------
        // AX01 → AX06
        // ----------------------------------------------

        if(
            ng.performed
        ){

            const ax =
                state.ngAX
                    ? [...state.ngAX]
                    : [0,0,0,0,0,0];


            for(
                let i = 1;
                i <= 6;
                i++
            ){

                const key =
                    `ax0${i}`;


                if(
                    ng.performed[key] !== null &&
                    ng.performed[key] !== undefined
                ){

                    ax[i - 1] =
                        ng.performed[key];

                }

            }


            state.ngAX =
                ax;

        }

    }


    // ==================================================
    // PAGE 2 — MAX
    // ==================================================

    const max =
        imported.page2?.max;


    if(max){

        setIfKnown(
            state,
            "maxTot",
            max.totalAverage
        );


        setIfKnown(
            state,
            "maxPrev",
            max.month1Average
        );


        setIfKnown(
            state,
            "maxCurr",
            max.month2Average
        );


        // ----------------------------------------------
        // LONGEST
        // ----------------------------------------------

        if(max.longest){

            setIfKnown(
                state,
                "maxLTime",
                max.longest.time
            );


            setIfKnown(
                state,
                "maxLSup",
                max.longest.supervisor
            );


            setIfKnown(
                state,
                "maxLChk",
                max.longest.ax
            );

        }


        // ----------------------------------------------
        // SHORTEST
        // ----------------------------------------------

        if(max.shortest){

            setIfKnown(
                state,
                "maxSTime",
                max.shortest.time
            );


            setIfKnown(
                state,
                "maxSSup",
                max.shortest.supervisor
            );


            setIfKnown(
                state,
                "maxSChk",
                max.shortest.ax
            );

        }


        // ----------------------------------------------
        // PAIR
        // ----------------------------------------------

        if(max.pair){

            setIfKnown(
                state,
                "maxPairNum",
                max.pair.number
            );


            setIfKnown(
                state,
                "maxPairTime",
                max.pair.averageTime
            );

        }


        // ----------------------------------------------
        // ODD
        // ----------------------------------------------

        if(max.odd){

            setIfKnown(
                state,
                "maxOddNum",
                max.odd.number
            );


            setIfKnown(
                state,
                "maxOddTime",
                max.odd.averageTime
            );

        }


        // ----------------------------------------------
        // AX01 → AX06
        // ----------------------------------------------

        if(
            max.performed
        ){

            const ax =
                state.maxAX
                    ? [...state.maxAX]
                    : [0,0,0,0,0,0];


            for(
                let i = 1;
                i <= 6;
                i++
            ){

                const key =
                    `ax0${i}`;


                if(
                    max.performed[key] !== null &&
                    max.performed[key] !== undefined
                ){

                    ax[i - 1] =
                        max.performed[key];

                }

            }


            state.maxAX =
                ax;

        }

    }


    // ==================================================
    // PAGE 1 — AX DURATION VARIATION
    // ==================================================

    if(
        Array.isArray(
            imported.page1?.axDurationVariation
        ) &&
        imported.page1.axDurationVariation.length
    ){

        state.axVariationData =
            imported.page1.axDurationVariation
                .map(
                    row => ({

                        month:
                            row.month ??
                            "",

                        mech:
                            row.mech ??
                            0,

                        avio:
                            row.avio ??
                            0,

                        ngDur:
                            row.ngDur ??
                            0,

                        maxDur:
                            row.maxDur ??
                            0

                    })
                );

    }


    // ==================================================
    // PAGE 1 — MANPOWER
    // ==================================================

    if(
        Array.isArray(
            imported.page1?.manpowerAnalysis
        ) &&
        imported.page1.manpowerAnalysis.length
    ){

        state.manpowerAnalysisData =
            imported.page1.manpowerAnalysis
                .map(
                    row => ({

                        mp:
                            row.mp ??
                            0,

                        ng:
                            row.ng ??
                            "",

                        max:
                            row.max ??
                            ""

                    })
                );

    }


    // ==================================================
    // PAGE 3 — FLOW
    // ==================================================

    if(
        imported.page3?.flowchart
    ){

        const currentFlow =
            Array.isArray(
                state.flow
            )
                ? [...state.flow]
                : [];


        function applyFlowSide(
            rows,
            side
        ){

            if(
                !Array.isArray(rows)
            ){

                return;

            }


            rows.forEach(
                row => {

                    if(!row?.task){

                        return;

                    }


                    const index =
                        currentFlow.findIndex(
                            item =>
                                item.label ===
                                row.task
                        );


                    if(index === -1){

                        return;

                    }


                    const item =
                        currentFlow[index];


                    if(
                        side === "NG"
                    ){

                        setIfKnown(
                            item,
                            "ngV",
                            row.val
                        );


                        setIfKnown(
                            item,
                            "ngA",
                            row.aog
                        );


                        setIfKnown(
                            item,
                            "ngR",
                            row.reg
                        );

                    }
                    else{

                        setIfKnown(
                            item,
                            "mxV",
                            row.val
                        );


                        setIfKnown(
                            item,
                            "mxA",
                            row.aog
                        );


                        setIfKnown(
                            item,
                            "mxR",
                            row.reg
                        );

                    }

                }
            );

        }


        applyFlowSide(
            imported.page3.flowchart.ng,
            "NG"
        );


        applyFlowSide(
            imported.page3.flowchart.max,
            "MAX"
        );


        if(
            currentFlow.length
        ){

            state.flow =
                currentFlow;

        }

    }


    // ==================================================
    // PAGE 3 — STOCK STUDY
    // ==================================================

    if(
        Array.isArray(
            imported.page3?.stockStudy?.ng
        ) &&
        imported.page3.stockStudy.ng.length
    ){

        state.stockNG =
            imported.page3.stockStudy.ng
                .map(
                    row => ({

                        day:
                            row.day ??
                            null,

                        pn:
                            row.pn ??
                            null,

                        spa:
                            row.spa ??
                            null,

                        stock:
                            row.stock ??
                            null,

                        obs:
                            row.obs ??
                            null

                    })
                );

    }


    if(
        Array.isArray(
            imported.page3?.stockStudy?.max
        ) &&
        imported.page3.stockStudy.max.length
    ){

        state.stockMAX =
            imported.page3.stockStudy.max
                .map(
                    row => ({

                        day:
                            row.day ??
                            null,

                        pn:
                            row.pn ??
                            null,

                        spa:
                            row.spa ??
                            null,

                        stock:
                            row.stock ??
                            null,

                        obs:
                            row.obs ??
                            null

                    })
                );

    }


    // ==================================================
    // PAGE 3 — LAST TASKCARDS
    // ==================================================

    if(
        Array.isArray(
            imported.page3?.lastTaskcards?.ng
        ) &&
        imported.page3.lastTaskcards.ng.length
    ){

        state.tasksNG =
            imported.page3.lastTaskcards.ng
                .map(
                    row => ({

                        ax:
                            row.ax ??
                            null,

                        task:
                            row.task ??
                            null,

                        pn1:
                            row.pn1 ??
                            null,

                        pn2:
                            row.pn2 ??
                            null,

                        day:
                            row.day ??
                            null

                    })
                );

    }


    if(
        Array.isArray(
            imported.page3?.lastTaskcards?.max
        ) &&
        imported.page3.lastTaskcards.max.length
    ){

        state.tasksMAX =
            imported.page3.lastTaskcards.max
                .map(
                    row => ({

                        ax:
                            row.ax ??
                            null,

                        task:
                            row.task ??
                            null,

                        pn1:
                            row.pn1 ??
                            null,

                        pn2:
                            row.pn2 ??
                            null,

                        day:
                            row.day ??
                            null

                    })
                );

    }


    // ==================================================
    // PAGE 3 — LAST 3 MONTHS
    // ==================================================

    if(
        Array.isArray(
            imported.page3?.last3Months?.ng
        ) &&
        imported.page3.last3Months.ng.length
    ){

        state.def3mNG =
            imported.page3.last3Months.ng
                .map(
                    row => ({

                        label:
                            row.month ??
                            "",

                        count:
                            row.noParts ??
                            null

                    })
                );

    }


    if(
        Array.isArray(
            imported.page3?.last3Months?.max
        ) &&
        imported.page3.last3Months.max.length
    ){

        state.def3mMAX =
            imported.page3.last3Months.max
                .map(
                    row => ({

                        label:
                            row.month ??
                            "",

                        count:
                            row.noParts ??
                            null

                    })
                );

    }


    // ==================================================
    // PAGE 4 — HILS
    // ==================================================

    const hils =
        imported.page4?.hils;


    if(hils){

        setIfKnown(
            state,
            "hilsNGAvg",
            hils.ng?.average
        );


        setIfKnown(
            state,
            "hilsNGPrev",
            hils.ng?.month1
        );


        setIfKnown(
            state,
            "hilsNGCurr",
            hils.ng?.month2
        );


        setIfKnown(
            state,
            "hilsMAXAvg",
            hils.max?.average
        );


        setIfKnown(
            state,
            "hilsMAXPrev",
            hils.max?.month1
        );


        setIfKnown(
            state,
            "hilsMAXCurr",
            hils.max?.month2
        );

    }


    // ==================================================
    // PAGE 4 — HIL HISTORY
    // ==================================================

    if(
        Array.isArray(
            imported.page4?.hils?.history
        ) &&
        imported.page4.hils.history.length
    ){

        const history =
            imported.page4.hils.history;


        state.hilsLabels =
            history.map(
                row =>
                    row.label ??
                    row.month ??
                    ""
            );


        state.hilsNGData =
            history.map(
                row =>
                    row.ng ??
                    null
            );


        state.hilsMAXData =
            history.map(
                row =>
                    row.max ??
                    null
            );

    }


    // ==================================================
    // PAGE 4 — HILS PER SUPER
    // ==================================================

    const hilsSuper =
        imported.page4?.hilsPerSuper;


    if(hilsSuper){

        if(
            Array.isArray(
                hilsSuper.labels
            ) &&
            hilsSuper.labels.length
        ){

            state.hilsSuperLabels =
                hilsSuper.labels.map(
                    value =>
                        acPDFMonthLabelFromYYYYMM(
                            value
                        ) ||
                        value
                );

        }


        if(
            Array.isArray(
                hilsSuper.ng
            ) &&
            hilsSuper.ng.length
        ){

            state.hilsSuperNG =
                hilsSuper.ng;

        }


        if(
            Array.isArray(
                hilsSuper.max
            ) &&
            hilsSuper.max.length
        ){

            state.hilsSuperMAX =
                hilsSuper.max;

        }

    }


    // ==================================================
    // PAGE 5 — P/N OUT OF STOCK
    // ==================================================

    setIfKnown(
        state,
        "pnOutNG",
        imported.page5?.pnOutOfStock?.ng
    );


    setIfKnown(
        state,
        "pnOutMAX",
        imported.page5?.pnOutOfStock?.max
    );


    // ==================================================
    // PAGE 5 — CURRENT HILS PER SUPER
    // ==================================================

    const currentHils =
        imported.page5?.currentHilsPerSuper;


    if(currentHils){

        if(
            Array.isArray(
                currentHils.ng
            ) &&
            currentHils.ng.length
        ){

            state.hilsCurrLabels =
                currentHils.ng.map(
                    row =>
                        row.name ??
                        ""
                );


            state.hilsCurrData =
                currentHils.ng.map(
                    row =>
                        row.value ??
                        null
                );

        }

    }


    // ==================================================
    // PAGE 5 — TOP REQUESTED P/N
    // ==================================================

    const topPN =
        imported.page5?.topRequestedPN;


    if(topPN){

        if(
            Array.isArray(
                topPN.ng
            ) &&
            topPN.ng.length
        ){

            state.topPnNG =
                topPN.ng.map(
                    row => ({

                        pn:
                            row.pn ??
                            "",

                        mat:
                            row.materialClass ??
                            "",

                        hils:
                            row.hils ??
                            null,

                        stock:
                            row.stock ??
                            null

                    })
                );

        }


        if(
            Array.isArray(
                topPN.max
            ) &&
            topPN.max.length
        ){

            state.topPnMAX =
                topPN.max.map(
                    row => ({

                        pn:
                            row.pn ??
                            "",

                        mat:
                            row.materialClass ??
                            "",

                        hils:
                            row.hils ??
                            null,

                        stock:
                            row.stock ??
                            null

                    })
                );

        }

    }


    // ==================================================
    // PAGE 5 — TOP P/N LAST 3 MONTHS
    // ==================================================

    const topPN3M =
        imported.page5?.topPN3M;


    if(topPN3M){

        if(
            Array.isArray(
                topPN3M.ng
            ) &&
            topPN3M.ng.length
        ){

            state.topPn3mNG =
                topPN3M.ng.map(
                    row => ({

                        pn:
                            row.pn ??
                            "",

                        count:
                            row.count ??
                            null

                    })
                );

        }


        if(
            Array.isArray(
                topPN3M.max
            ) &&
            topPN3M.max.length
        ){

            state.topPn3mMAX =
                topPN3M.max.map(
                    row => ({

                        pn:
                            row.pn ??
                            "",

                        count:
                            row.count ??
                            null

                    })
                );

        }

    }


    // ==================================================
    // SAVE TARGET SHIFT
    // ==================================================

    appStates[targetShift] =
        state;


    // ==================================================
    // REFRESH DASHBOARD
    // ==================================================

    renderDOM();


    console.log(

        "A-CHECK PDF APPLIED TO:",

        targetShift,

        state

    );

}