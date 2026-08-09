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

            if(!wrapper) return;

            const canvas = await html2canvas(wrapper,{
                scale:3,
                useCORS:true,
                allowTaint:true,
                backgroundColor:"#FFFFFF",
                logging:false,
                scrollX:0,
                scrollY:-window.scrollY,
                windowWidth:document.documentElement.scrollWidth,
                windowHeight:document.documentElement.scrollHeight
            });

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

        window.handleExcelUpload = function(event) {
            const file = event.target.files[0];
            if (!file) return;
    // ==========================================
    // IMPORT PERIOD
    // ==========================================

    CURRENT_ACHECK_YEAR = IMPORT_YEAR;

    CURRENT_ACHECK_MONTH = IMPORT_MONTH;

            const reader = new FileReader();
            reader.onload = async function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                const getVal = (cell) => worksheet[cell] ? (worksheet[cell].w !== undefined ? worksheet[cell].w : worksheet[cell].v) : '';
                const getTimeVal = (cell) => {
                    if (!worksheet[cell]) return '';
                    let val = worksheet[cell].v;
                    if (typeof val === 'number' && val > 0 && val < 1) {
                        let totalMinutes = Math.round(val * 24 * 60);
                        let hours = Math.floor(totalMinutes / 60);
                        let mins = totalMinutes % 60;
                        return hours + ':' + (mins < 10 ? '0' : '') + mins;
                    }
                    return worksheet[cell].w || val; 
                };

                let s = appStates[currentShift]; 
                try {
                    s.shiftLabel = getVal('F3') || getVal('G3') || getVal('F4'); 
                    s.month1 = getVal('F4') || getVal('G4') || getVal('F5');
                    s.month2 = getVal('F5') || getVal('G5') || getVal('F6');

                    s.ngTot = getTimeVal('C7'); s.ngPrev = getTimeVal('C8'); s.ngCurr = getTimeVal('C9');
                    s.ngLTime = getTimeVal('C10'); s.ngLSup = getVal('C11'); s.ngLChk = getVal('C12');
                    s.ngSTime = getTimeVal('C13'); s.ngSSup = getVal('C14'); s.ngSChk = getVal('C15');
                    s.ngPairNum = parseInt(getVal('C16')) || 0; s.ngPairTime = getTimeVal('C17');
                    s.ngOddNum = parseInt(getVal('C18')) || 0; s.ngOddTime = getTimeVal('C19');
                    s.ngAX = [parseInt(getVal('C20'))||0, parseInt(getVal('C21'))||0, parseInt(getVal('C22'))||0, parseInt(getVal('C23'))||0, parseInt(getVal('C24'))||0, parseInt(getVal('C25'))||0];

                    s.maxTot = getTimeVal('H7') || getTimeVal('G7'); s.maxPrev = getTimeVal('H8') || getTimeVal('G8'); s.maxCurr = getTimeVal('H9') || getTimeVal('G9');
                    s.maxLTime = getTimeVal('H10') || getTimeVal('G10'); s.maxLSup = getVal('H11') || getVal('G11'); s.maxLChk = getVal('H12') || getVal('G12');
                    s.maxSTime = getTimeVal('H13') || getTimeVal('G13'); s.maxSSup = getVal('H14') || getVal('G14'); s.maxSChk = getVal('H15') || getVal('G15');
                    s.maxPairNum = parseInt(getVal('H16') || getVal('G16')) || 0; s.maxPairTime = getTimeVal('H17') || getTimeVal('G17');
                    s.maxOddNum = parseInt(getVal('H18') || getVal('G18')) || 0; s.maxOddTime = getTimeVal('H19') || getTimeVal('G19');
                    s.maxAX = [parseInt(getVal('H20')||getVal('G20'))||0, parseInt(getVal('H21')||getVal('G21'))||0, parseInt(getVal('H22')||getVal('G22'))||0, parseInt(getVal('H23')||getVal('G23'))||0, parseInt(getVal('H24')||getVal('G24'))||0, parseInt(getVal('H25')||getVal('G25'))||0];

                    appStates[currentShift] = s;

await saveACheckData();

await loadACheckData(

    CURRENT_ACHECK_YEAR,

    CURRENT_ACHECK_MONTH

);

showSuccess(

    "Import Completed",

    `Excel imported successfully for ${getACheckPeriodKey(

        CURRENT_ACHECK_YEAR,

        CURRENT_ACHECK_MONTH

    )}.`

);

// Permite voltar a importar o mesmo ficheiro
event.target.value = "";

                } catch (error) {
                    alert('Erro na leitura do Excel. Verifica o formato das c lulas.');
                }
                event.target.value = '';
            };
            reader.readAsArrayBuffer(file);
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
            safeChartInit(canvasId, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        { type: 'line', label: 'NG DURATION', data: ngData, borderColor: '#f1c40f', backgroundColor: '#f1c40f', borderWidth: 3, pointRadius: 4, fill: false, yAxisID: 'y' },
                        { type: 'line', label: 'MAX DURATION', data: maxData, borderColor: '#2980b9', backgroundColor: '#2980b9', borderWidth: 3, pointRadius: 4, fill: false, yAxisID: 'y' },
                        { type: 'bar', label: 'MECH', data: mechData, backgroundColor: 'rgba(0, 51, 153, 0.3)', yAxisID: 'y1', stacked: true, barPercentage: 0.5 },
                        { type: 'bar', label: 'MECH AVIO', data: avioData, backgroundColor: 'rgba(241, 196, 15, 0.3)', yAxisID: 'y1', stacked: true, barPercentage: 0.5 }
                    ]
                },
                plugins: [ChartDataLabels],
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'top', labels: { boxWidth: 15, font: {size: 13, weight: 'bold'} } },
                        datalabels: {
                            formatter: function(value, context) {
                                // Se o valor for nulo, n o mostra nada
                                if (value == null) return '';
                                
                                // ATUALIZA  O: Devolve diretamente o n mero (ex: 6.48) sem converter para rel gio
                                return value; 
                            },
                            color: function(context) { return context.dataset.type === 'line' ? '#2d3748' : '#ffffff'; },
                            font: { weight: 'bold', size: 12 }
                        }
                    },
                    scales: { x: { stacked: true, grid: { display: false } }, y: { type: 'linear', position: 'left', grid: { color: '#edf2f7' } }, y1: { type: 'linear', position: 'right', stacked: true, max: 20, grid: { display: false } } }
                }
            })
        }

// ======================================================
// ANALYSIS PERIOD MODAL
// ======================================================

let ANALYSIS_PERIOD_CALLBACK = null;

function openAnalysisPeriodModal(callback){

    ANALYSIS_PERIOD_CALLBACK = callback;

    const month =
        document.getElementById("analysisMonth");

    const year =
        document.getElementById("analysisYear");

    month.innerHTML = "";
    year.innerHTML = "";

    // ==========================================
    // MONTHS
    // ==========================================

    const months = [

        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"

    ];

    months.forEach((name,index)=>{

        const option =
            document.createElement("option");

        option.value = index + 1;

        option.textContent = name;

        month.appendChild(option);

    });

    // ==========================================
    // YEARS
    // ==========================================

    for(let y = 2024; y <= 2035; y++){

        const option =
            document.createElement("option");

        option.value = y;

        option.textContent = y;

        year.appendChild(option);

    }

    // ==========================================
    // DEFAULT VALUES
    // ==========================================

    month.value = CURRENT_ACHECK_MONTH;

    year.value = CURRENT_ACHECK_YEAR;

    document.getElementById(

        "analysisPeriodModal"

    ).style.display = "flex";

}

function closeAnalysisPeriodModal(){

    document.getElementById(

        "analysisPeriodModal"

    ).style.display = "none";

}

function continueAnalysisPeriod(){

    const month =
        Number(

            document.getElementById(

                "analysisMonth"

            ).value

        );

    const year =
        Number(

            document.getElementById(

                "analysisYear"

            ).value

        );

    closeAnalysisPeriodModal();

    if(ANALYSIS_PERIOD_CALLBACK){

        ANALYSIS_PERIOD_CALLBACK(

            year,

            month

        );

    }

}

// ======================================================
// IMPORT EXCEL
// ======================================================

function openImportExcelPeriod(){

    executeProtectedAction(

        PERMISSIONS.IMPORT_DATA,

        ()=>{

            openAnalysisPeriodModal(

                (year,month)=>{

                    openACheckImport(year,month);

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
