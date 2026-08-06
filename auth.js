// ======================================================
// RYANAIR ENGINEERING DASHBOARD
// AUTHENTICATION SYSTEM
// Version 1.0
// ======================================================

const USER_ROLES={

    ADMIN:"admin",

    SUPERVISOR:"supervisor",

    VIEWER:"viewer"

};

// ======================================================
// FIREBASE COLLECTIONS
// ======================================================

const AUTH_COLLECTION = "users";

const LOGS_COLLECTION = "logs";



// ======================================================
// LOCAL SESSION
// ======================================================

const SESSION_STORAGE_KEY =
    "RYANAIR_ENGINEERING_SESSION";



// ======================================================
// USER PERMISSIONS
// ======================================================

const PERMISSIONS = {

    IMPORT_DATA:      "importData",

    EDIT_VISUALS:     "editVisuals",

    RESET_DASHBOARD:  "resetDashboard",

    MANAGE_USERS:     "manageUsers",

    EXPORT_PDF:       "exportPdf"

};



// ======================================================
// CURRENT USER
// ======================================================

let CURRENT_USER = null;



// ======================================================
// AUTH STATUS
// ======================================================

let AUTH_READY = false;


// ======================================================
// APPLICATION LOADER
// ======================================================

function showLoading(){

    const overlay =
        document.getElementById("app-loading");

    if(!overlay)
        return;

    overlay.classList.remove("hidden");

}

function updateLoading(message, progress, subMessage=""){

    const status =
        document.getElementById("loading-status");

    const percent =
        document.getElementById("loading-percent");

    const subStatus =
        document.getElementById("loading-substatus");

    const bar =
        document.getElementById("loading-progress");

    if(status){

        status.textContent = message;

    }

    if(percent){

        percent.textContent = progress + "%";

    }

    if(subStatus){

        subStatus.textContent = subMessage;

    }

    if(bar){

        bar.style.width = progress + "%";

    }

}

function hideLoading(){

    const overlay =
        document.getElementById("app-loading");

    if(!overlay)
        return;

    overlay.classList.add("hidden");

}

// ======================================================
// APPLICATION STARTUP
// ======================================================

async function startApplication(){

    try{

        showLoading();

        // ----------------------------------

        updateLoading(

    "Connecting to Firebase...",

    15,

    "Establishing secure connection..."

);

        await new Promise(resolve=>setTimeout(resolve,300));

        // ----------------------------------

        updateLoading(

    "Loading Configuration...",

    35,

    "Loading dashboard settings..."

);

        await new Promise(resolve=>setTimeout(resolve,250));

        // ----------------------------------

        updateLoading(

    "Checking User Database...",

    55,

    "Searching for registered users..."

);

        const usersSnapshot = await firebaseGet(

    firebaseRef(

        database,

        AUTH_COLLECTION

    )

);

const hasUsers = usersSnapshot.exists();

        // ----------------------------------

        updateLoading(

    "Restoring Session...",

    75,

    "Checking previous authentication..."

);
        await restoreSession();

        // ----------------------------------

        updateLoading(

    "Preparing Dashboard...",

    90,

    "Loading interface..."

);

await new Promise(resolve=>setTimeout(resolve,250));

updateLoading(

    "Ready",

    100,

    "Dashboard successfully loaded."

);

await new Promise(resolve=>setTimeout(resolve,300));

document
    .getElementById("app-loading")
    .classList.add("hidden");

await new Promise(r=>setTimeout(r,500));

document
    .getElementById("app-loading")
    .remove();

// ======================================
// FIRST INSTALL
// ======================================

if(!hasUsers){

    startSystemSetup();

    return;

}

// ======================================
// NORMAL START
// ======================================

updateUserInterface();

    }catch(error){

        console.error(error);

        hideLoading();

        showError(

            "Startup Error",

            "An unexpected error occurred while starting the application."

        );

    }

}

// ======================================================
// RESTORE SESSION
// ======================================================

async function restoreSession(){

    try{

        const savedSession = localStorage.getItem(

            SESSION_STORAGE_KEY

        );

        if(!savedSession)
            return false;

        const session = JSON.parse(savedSession);

        if(

            !session ||

            !session.username

        ){

            localStorage.removeItem(

                SESSION_STORAGE_KEY

            );

            return false;

        }

        const loaded = await loadCurrentUser(

            session.username

        );

        if(!loaded){

            localStorage.removeItem(

                SESSION_STORAGE_KEY

            );

            return false;

        }

        return true;

    }catch(error){

        console.error(error);

        localStorage.removeItem(

            SESSION_STORAGE_KEY

        );

        return false;

    }

}

// ======================================================
// INITIALISE AUTHENTICATION
// ======================================================

async function initialiseAuthentication(){

    try{

        const savedSession =
            localStorage.getItem(SESSION_STORAGE_KEY);

        if(savedSession){

            const session =
                JSON.parse(savedSession);

            await loadCurrentUser(
                session.username
            );

        }else{

            CURRENT_USER = null;

        }

    }catch(error){

        console.error(
            "Authentication initialisation failed:",
            error
        );

        CURRENT_USER = null;

    }

    AUTH_READY = true;

    updateUserInterface();

}

// ======================================================
// LOAD CURRENT USER
// ======================================================

async function loadCurrentUser(username){

    try{

        const snapshot = await firebaseGet(

            firebaseRef(

                database,

                `${AUTH_COLLECTION}/${username}`

            )

        );

        if(!snapshot.exists()){

            CURRENT_USER = null;

            localStorage.removeItem(
                SESSION_STORAGE_KEY
            );

            return false;

        }

        const user = snapshot.val();

        CURRENT_USER = {

            profile: user.profile,

            credentials: user.credentials,

            permissions: user.permissions || {},

            metadata: user.metadata || {}

        };

        return true;

    }catch(error){

        console.error(error);

        CURRENT_USER = null;

        return false;

    }

}
// ======================================================
// AUTHENTICATION HELPERS
// ======================================================

function isLogged(){

    return CURRENT_USER !== null;

}



function isGuest(){

    return CURRENT_USER === null;

}



function hasPermission(permission){

    if(!CURRENT_USER)
        return false;

    if(!CURRENT_USER.permissions)
        return false;

    return CURRENT_USER.permissions[permission] === true;

}



function requirePermission(permission){

    if(hasPermission(permission))
        return true;

    showAccessDenied(permission);

    return false;

}

// ======================================================
// ACCESS DENIED
// ======================================================

let PENDING_ACTION = null;


// ======================================================
// ACCESS DENIED MODAL
// ======================================================

function openAccessDeniedModal(){

    document
        .getElementById("accessDeniedModal")
        .style.display="flex";

}



function closeAccessDeniedModal(){

    document
        .getElementById("accessDeniedModal")
        .style.display="none";

}



function loginFromAccessDenied(){

    closeAccessDeniedModal();

    openLoginModal();

}

// ======================================================
// LOGIN
// ======================================================

async function loginUser(){

    const username =
        document
            .getElementById("loginUsername")
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById("loginPassword")
            .value;

    if(username==="" || password===""){

        showError(

            "Missing Information",

            "Please enter both username and password."

        );

        return;

    }

    try{

        const snapshot =
            await firebaseGet(

                firebaseRef(

                    database,

                    `${AUTH_COLLECTION}/${username}`

                )

            );

        if(!snapshot.exists()){

            showError(

                "Login Failed",

                "Invalid username or password."

            );

            return;

        }

const user = snapshot.val();

        if(user.profile.active === false){

    showError(

        "Account Disabled",

        "This account has been disabled."

    );

    return;

}

        const passwordHash =
            await hashPassword(

                password,

                user.credentials.salt

            );

        if(

            passwordHash !==

            user.credentials.passwordHash

        ){

            showError(

                "Login Failed",

                "Invalid username or password."

            );

            return;

        }

        // =====================================
        // UPDATE LAST LOGIN
        // =====================================

        user.metadata =
            user.metadata || {};

        user.metadata.lastLogin =
            Date.now();

        await firebaseUpdate(

            firebaseRef(

                database,

                `${AUTH_COLLECTION}/${username}`

            ),

            {

                metadata:user.metadata

            }

        );

        // =====================================
        // CURRENT USER
        // =====================================

        CURRENT_USER = {

            profile:user.profile,

            credentials:user.credentials,

            permissions:user.permissions || {},

            metadata:user.metadata || {}

        };

        // =====================================
        // SAVE SESSION
        // =====================================

        localStorage.setItem(

            SESSION_STORAGE_KEY,

            JSON.stringify({

                username

            })

        );

        // =====================================
        // LOGIN SUCCESS
        // =====================================

        await writeAuditLog(

            "LOGIN",

            "User logged into the dashboard."

        );

        closeLoginModal();

        updateUserInterface();

        showSuccess(

            "Welcome",

            `Welcome back ${getCurrentFullName()}.`

        );

        // =====================================
        // CONTINUE ACTION
        // =====================================

        if(PENDING_ACTION){

            const action =
                PENDING_ACTION;

            PENDING_ACTION = null;

            action();

        }

        if(pendingProtectedAction){

            const action =
                pendingProtectedAction;

            pendingProtectedAction = null;

            action();

        }

    }catch(error){

        console.error(error);

        showError(

            "Login Error",

            "Unexpected authentication error."

        );

    }

}

// ======================================================
// SECURITY
// ======================================================



async function hashPassword(password,salt){

    const encoder = new TextEncoder();

    const data =
        encoder.encode(password + salt);

    const hashBuffer =
        await crypto.subtle.digest(

            "SHA-256",

            data

        );

    const hashArray =
        Array.from(

            new Uint8Array(hashBuffer)

        );

    return hashArray

        .map(b=>b.toString(16).padStart(2,"0"))

        .join("");

}



function generateSalt(length=24){

    const chars =

        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let salt="";

    for(let i=0;i<length;i++){

        salt +=

            chars.charAt(

                Math.floor(

                    Math.random()*chars.length

                )

            );

    }

    return salt;

}

// ======================================================
// SYSTEM INITIALISATION
// ======================================================
// LEGACY - Replaced by startApplication()
async function initialiseSystem(){

    try{

        const snapshot =
            await firebaseGet(

                firebaseRef(

                    database,

                    AUTH_COLLECTION

                )

            );

        // Ainda não existem utilizadores
        if(!snapshot.exists()){

            startSystemSetup();

            return;

        }

        // Sistema já inicializado
        await initialiseAuthentication();

    }catch(error){

        console.error(

            "System initialisation failed:",

            error

        );

        showError(

            "System Error",

            "Unable to initialise authentication."

        );

    }

}

// ======================================================
// SYSTEM SETUP
// ======================================================

function startSystemSetup(){

    document
        .getElementById("systemSetupModal")
        .style.display="flex";

    showSetupStep(1);

}



function closeSystemSetup(){

    document

        .getElementById("systemSetupModal")

        .style.display="none";

}

// ======================================================
// SYSTEM SETUP WIZARD
// ======================================================

function openCreateAdministrator(){

    document
        .getElementById("systemSetupWelcome")
        .style.display = "none";

    document
        .getElementById("systemSetupContent")
        .style.display = "block";

}

// ======================================================
// CREATE USER ENGINE
// ======================================================

async function createUser({

    fullName,

    username,

    password,

    role,

    createdBy

}){

    username = username.trim().toLowerCase();

    const userRef = firebaseRef(

        database,

        `${AUTH_COLLECTION}/${username}`

    );

    const existingUser =

        await firebaseGet(userRef);

    if(existingUser.exists()){

        throw new Error(

            "USERNAME_ALREADY_EXISTS"

        );

    }

    const salt =

        generateSalt();

    const passwordHash =

        await hashPassword(

            password,

            salt

        );

    const user = {

        profile:{

            username,

            fullName,

            role,

            active:true

        },

        credentials:{

            salt,

            passwordHash

        },

        permissions:

            createPermissions(role),

        metadata:{

            createdAt:Date.now(),

            createdBy,

            lastLogin:null

        }

    };

    await firebaseSet(

        userRef,

        user

    );

    return user;

}

// ======================================================
// CREATE FIRST ADMINISTRATOR
// ======================================================

async function createFirstAdministrator(){

console.log("CREATE ADMIN CLICKED");

    console.log("Username valid:", validateSetupUsername());
    console.log("Password valid:", validateSetupPassword());
    console.log("Match valid:", validateSetupPasswordMatch());

    const fullName =
        document.getElementById("setupFullName").value.trim();

    const username =
        document.getElementById("setupUsername").value.trim().toLowerCase();

    const password =
        document.getElementById("setupPassword").value;

    const confirmPassword =
        document.getElementById("setupPassword2").value;

    // ======================================
    // VALIDATION
    // ======================================

    if(fullName===""){

        showError(
            "Invalid Name",
            "Please enter the administrator's full name."
        );

        return;

    }

    if(!validateSetupUsername()) return;

    if(!validateSetupPassword()) return;

    if(!validateSetupPasswordMatch()) return;



    // ======================================
    // SHOW LOADING SCREEN
    // ======================================

    showSetupStep(3);

    await new Promise(resolve=>setTimeout(resolve,400));



    // ======================================
    // PROGRESS
    // ======================================

    const bar =
        document.getElementById("setupProgressBar");

    const text =
        document.getElementById("setupProgressText");



    function progress(percent,message){

        bar.style.width =
            percent + "%";

        text.innerHTML =
            message;

    }



    progress(
        20,
        "Creating administrator..."
    );

    await new Promise(r=>setTimeout(r,350));



    // ======================================
    // CHECK USERNAME
    // ======================================

    const userRef = firebaseRef(

        database,

        `${AUTH_COLLECTION}/${username}`

    );

    const snapshot =
        await firebaseGet(userRef);

    if(snapshot.exists()){

        showSetupStep(2);

        showError(

            "Username Exists",

            "That username is already in use."

        );

        return;

    }



    progress(
        45,
        "Saving user..."
    );

    await new Promise(r=>setTimeout(r,350));



    // ======================================
    // CREATE USER
    // ======================================


    const user = await createUser({

    fullName,

    username,

    password,

    role: USER_ROLES.ADMIN,

    createdBy: "SYSTEM"

});


    progress(
        75,
        "Configuring permissions..."
    );

    await new Promise(r=>setTimeout(r,350));



    CURRENT_USER = user;



    localStorage.setItem(

    SESSION_STORAGE_KEY,

    JSON.stringify({

        username

    })

);



    progress(
        100,
        "Finalising setup..."
    );

    await new Promise(r=>setTimeout(r,500));



    updateUserInterface();

    showSetupStep(4);

}

// ======================================================
// PERMISSION FACTORY
// ======================================================

function createPermissions(role){

    switch(role){

        case "admin":

            return{

                importData:true,

                editVisuals:true,

                resetDashboard:true,

                manageUsers:true,

                exportPdf:true

            };



        case "supervisor":

            return{

                importData:true,

                editVisuals:false,

                resetDashboard:false,

                manageUsers:false,

                exportPdf:true

            };



        case "viewer":

            return{

                importData:false,

                editVisuals:false,

                resetDashboard:false,

                manageUsers:false,

                exportPdf:true

            };



        default:

            return{};

    }

}

// ======================================================
// CURRENT USER
// ======================================================

function getCurrentUser(){

    return CURRENT_USER;

}



function getCurrentUsername(){

    if(!CURRENT_USER)
        return "";

    return CURRENT_USER.profile.username;

}



function getCurrentFullName(){

    if(!CURRENT_USER)
        return "Guest";

    return CURRENT_USER.profile.fullName;

}



function isAdministrator(){

    if(!CURRENT_USER)
        return false;

    return (

        CURRENT_USER.profile.role === USER_ROLES.ADMIN

    );

}

// ======================================================
// UPDATE USER INTERFACE
// ======================================================

function updateUserInterface(){

    updateHeaderUser();

    const logged =
        isLogged();

    // ===============================
    // MENU BUTTONS
    // ===============================

    document.getElementById("menuLoginButton").style.display =
        logged
            ? "none"
            : "block";

    document.getElementById("menuLogoutButton").style.display =
        logged
            ? "block"
            : "none";

    document.getElementById("menuUsersButton").style.display =
        hasPermission(
            PERMISSIONS.MANAGE_USERS
        )
            ? "block"
            : "none";

    document.getElementById("menuLogsButton").style.display =
        hasPermission(
            PERMISSIONS.MANAGE_USERS
        )
            ? "block"
            : "none";

    document.getElementById("menuSettingsButton").style.display =
        logged
            ? "block"
            : "none";

}

// ======================================================
// USER MENU
// ======================================================

function toggleUserMenu(){

    const menu =
        document.getElementById("userMenu");

    if(menu.style.display === "block"){

        closeUserMenu();

        return;

    }

    menu.style.display = "block";

}



function closeUserMenu(){

    document
        .getElementById("userMenu")
        .style.display = "none";

}



// ======================================
// CLICK OUTSIDE
// ======================================

document.addEventListener("click",(event)=>{

    const profile =
        document.getElementById("userProfile");

    const menu =
        document.getElementById("userMenu");

    if(

        !profile.contains(event.target)

        &&

        !menu.contains(event.target)

    ){

        closeUserMenu();

    }

});



// ======================================
// ESC CLOSE
// ======================================

document.addEventListener("keydown",(event)=>{

    if(event.key==="Escape"){

        closeUserMenu();

    }

});

// ======================================================
// NOTIFICATION ENGINE
// ======================================================

function showNotification(title,message,type="info"){

    const modal =
        document.getElementById("notificationModal");

    document.getElementById("notificationTitle").textContent =
        title;

    document.getElementById("notificationMessage").textContent =
        message;

    const icon =
        document.getElementById("notificationIcon");

    switch(type){

        case "success":

            icon.innerHTML="✅";

            break;

        case "error":

            icon.innerHTML="❌";

            break;

        case "warning":

            icon.innerHTML="⚠️";

            break;

        default:

            icon.innerHTML="ℹ️";

    }

    modal.style.display="flex";

}



function closeNotification(){

    document

        .getElementById("notificationModal")

        .style.display="none";

}



function showSuccess(title,message){

    showNotification(

        title,

        message,

        "success"

    );

}



function showError(title,message){

    showNotification(

        title,

        message,

        "error"

    );

}



function showWarning(title,message){

    showNotification(

        title,

        message,

        "warning"

    );

}

// ======================================================
// LOGIN MODAL
// ======================================================

function openLoginModal(){

    closeUserMenu();

    document.getElementById("loginUsername").value = "";

    document.getElementById("loginPassword").value = "";

    document.getElementById("loginModal").style.display = "flex";

    setTimeout(()=>{

        document
            .getElementById("loginUsername")
            .focus();

    },100);

}



function closeLoginModal(){

    document
        .getElementById("loginModal")
        .style.display = "none";

}

// ======================================================
// RESTRICTED ACCESS
// ======================================================

let pendingProtectedAction = null;



function openRestrictedAccessModal(callback){

    pendingProtectedAction = callback;

    document
        .getElementById("restrictedAccessModal")
        .style.display = "flex";

}



function closeRestrictedAccessModal(){

    document
        .getElementById("restrictedAccessModal")
        .style.display = "none";

}



function loginFromRestrictedArea(){

    closeRestrictedAccessModal();

    openLoginModal();

}

// ======================================
// ENTER KEY
// ======================================

document.addEventListener("keydown",(event)=>{

    const modal =
        document.getElementById("loginModal");

    if(

        modal.style.display==="flex"

        &&

        event.key==="Enter"

    ){

        loginUser();

    }

});

// ======================================================
// LOGOUT
// ======================================================

async function logoutUser(){

    if(isLogged()){

        await writeAuditLog(

            "LOGOUT",

            "User logged out."

        );

    }

    CURRENT_USER = null;

    localStorage.removeItem(

        SESSION_STORAGE_KEY

    );

    closeUserMenu();

    closeLoginModal();

    updateUserInterface();

    showSuccess(

        "Logged Out",

        "You have been successfully logged out."

    );

}

// ======================================================
// AUDIT LOGS
// ======================================================

async function writeAuditLog(action,details=""){

    if(!CURRENT_USER)
        return;

    try{

        const logId =
            Date.now().toString();

        const log = {

    username:
        getCurrentUsername(),

    fullName:
        getCurrentFullName(),

    role:
        CURRENT_USER.profile.role,

    permissions:
        CURRENT_USER.permissions,

    action,

    details,

    timestamp:
        Date.now()

};

        await firebaseSet(

            firebaseRef(

                database,

                `${LOGS_COLLECTION}/${logId}`

            ),

            log

        );

    }catch(error){

        console.error(

            "Audit Log Error:",

            error

        );

    }

}

// ======================================================
// PROTECTED ACTION ENGINE
// ======================================================

function executeProtectedAction(

    permission,

    callback,

    log = null

){

    requestPermission(

        permission,

        async ()=>{

            try{

                await callback();

                if(log){

                    await writeAuditLog(

                        log.action,

                        log.details

                    );

                }

            }catch(error){

                console.error(error);

                showError(

                    "Unexpected Error",

                    "The requested operation could not be completed."

                );

            }

        }

    );

}

// ======================================================
// IMPORT DATA
// ======================================================

function openImportData(){

    executeProtectedAction(

        PERMISSIONS.IMPORT_DATA,

        async ()=>{

            openManualInput();

        },

        {

            action:"OPEN_IMPORT_DATA",

            details:"Manual Import"

        }

    );

}

// ======================================================
// REQUEST PERMISSION
// ======================================================

function requestPermission(permission, callback){

    // Utilizador autenticado e autorizado
    if(

        isLogged()

        &&

        hasPermission(permission)

    ){

        callback();

        return;

    }

    // Não autenticado
    if(!isLogged()){

        openRestrictedAccessModal(callback);

        return;

    }

    // Autenticado mas sem permissões

    showError(

        "Access Denied",

        "Your account does not have permission to perform this action."

    );

}

// ======================================================
// EDIT VISUALS
// ======================================================

function openVisualEditorProtected(){

    executeProtectedAction(

        PERMISSIONS.EDIT_VISUALS,

        async ()=>{

    showWarning(

        "Coming Soon",

        "Visual Editor is currently under development."

    );
        },

        {

            action:"OPEN_VISUAL_EDITOR",

            details:"Manual Visual Editor"

        }

    );

}

// ======================================================
// RESET DASHBOARD
// ======================================================

function resetDashboardProtected(){

    executeProtectedAction(

        PERMISSIONS.RESET_DASHBOARD,

        async ()=>{

    showWarning(

        "Coming Soon",

        "Reset Dashboard is under development."

    );

},

        {

            action:"RESET_DASHBOARD",

            details:"Manual dashboard reset"

        }

    );

}

// ======================================================
// HEADER USER
// ======================================================

function updateHeaderUser(){

    const logged = isLogged();

    const fullName =

        logged

            ? CURRENT_USER.profile.fullName

            : "Guest";

    const role =

        logged

            ? CURRENT_USER.profile.role

            : "Viewer";

    document.getElementById(

        "currentUserName"

    ).textContent = fullName;

    document.getElementById(

        "currentUserRole"

    ).textContent = role;

    document.getElementById(

        "menuFullName"

    ).textContent = fullName;

    document.getElementById(

        "menuRole"

    ).textContent = role;

}



// ======================================================
// SYSTEM SETUP WIZARD
// ======================================================

function showSetupStep(step){

    const body = document.getElementById("setupBody");

    switch(step){

        case 1:

            body.innerHTML = getSetupWelcome();

            break;

        case 2:

            body.innerHTML = getSetupAdministrator();

            break;

        case 3:

            body.innerHTML = getSetupLoading();

            break;

        case 4:

            body.innerHTML = getSetupFinished();

            break;

    }

}

// ======================================================
// SETUP STEP 1
// ======================================================

function getSetupWelcome(){

    return `

        <div class="setupIcon">

            🚀

        </div>

        <div class="setupTitle">

            Welcome

        </div>

        <div class="setupText">

            This dashboard is being configured for the first time.

            <br><br>

            Before using the application, an Administrator account must be created.

            <br><br>

            This account will have full access to:

            <br><br>

            • Import operational data<br>
            • Reset dashboard information<br>
            • Edit dashboard visuals<br>
            • Manage users and permissions<br>
            • View activity logs

        </div>

        <div class="setupButtons">

            <button
                class="btn btn-yellow"
                onclick="showSetupStep(2)">

                Start Setup →

            </button>

        </div>

    `;

}

// ======================================================
// SETUP STEP 2
// ======================================================

function getSetupAdministrator(){

    return `

        <div class="setupTitle">

            Create Administrator

        </div>

        <div class="setupText" style="margin-bottom:35px;">

            Create the first Administrator account for the dashboard.

        </div>

        <label class="input-label">

            Full Name

        </label>

        <input
            id="setupFullName"
            class="auth-input"
            type="text"
            placeholder="John Smith"
            autocomplete="name"
        >

        <label
            class="input-label"
            style="margin-top:18px;">

            Username

        </label>

        <input
            id="setupUsername"
            class="auth-input"
            type="text"
            placeholder="jsmith"
            autocomplete="username"
            oninput="validateSetupUsername()"
        >

        <div
            id="setupUsernameStatus"
            class="authHint">

        </div>

        <label
            class="input-label"
            style="margin-top:18px;">

            Password

        </label>

        <input
            id="setupPassword"
            class="auth-input"
            type="password"
            autocomplete="new-password"
            oninput="validateSetupPassword()"
        >

        <div
            id="setupPasswordStrength"
            class="authHint">

        </div>

        <label
            class="input-label"
            style="margin-top:18px;">

            Confirm Password

        </label>

        <input
            id="setupPassword2"
            class="auth-input"
            type="password"
            autocomplete="new-password"
            oninput="validateSetupPasswordMatch()"
        >

        <div
            id="setupPasswordMatch"
            class="authHint">

        </div>

        <div class="setupButtonsRight">

            <button
                class="btn btn-white"
                onclick="showSetupStep(1)">

                ← Back

            </button>

            <button
                class="btn btn-yellow"
                onclick="createFirstAdministrator()">

                Create Administrator →

            </button>

        </div>

    `;

}

// ======================================================
// SETUP VALIDATION
// ======================================================

function validateSetupUsername(){

    const username =
        document.getElementById("setupUsername").value.trim();

    const status =
        document.getElementById("setupUsernameStatus");

    if(username.length < 3){

        status.style.color = "#e74c3c";

        status.innerHTML =
            "❌ Username must contain at least 3 characters.";

        return false;

    }

    status.style.color = "#2E8B57";

    status.innerHTML =
        "✅ Username accepted.";

    return true;

}



function validateSetupPassword(){

    const password =
        document.getElementById("setupPassword").value;

    const status =
        document.getElementById("setupPasswordStrength");

    if(password.trim().length < 4){

        status.style.color = "#e74c3c";

        status.innerHTML =
            "❌ Password must contain at least 4 characters.";

        return false;

    }

    status.style.color = "#2E8B57";

    status.innerHTML =
        "✅ Password accepted.";

    return true;

}



function validateSetupPasswordMatch(){

    const password =
        document.getElementById("setupPassword").value;

    const confirm =
        document.getElementById("setupPassword2").value;

    const status =
        document.getElementById("setupPasswordMatch");

    if(confirm === ""){

        status.innerHTML = "";

        return false;

    }

    if(password !== confirm){

        status.style.color = "#e74c3c";

        status.innerHTML =
            "❌ Passwords do not match.";

        return false;

    }

    status.style.color = "#2E8B57";

    status.innerHTML =
        "✅ Password confirmed.";

    return true;

}

// ======================================================
// SETUP STEP 3
// ======================================================

function getSetupLoading(){

    return `

        <div class="setupIcon">

            ⚙️

        </div>

        <div class="setupTitle">

            Creating Administrator

        </div>

        <div class="setupText">

            Please wait while the system is being configured.

        </div>

        <div style="
            margin:50px auto 25px;
            width:100%;
            max-width:420px;
            height:14px;
            background:#E8EDF5;
            border-radius:30px;
            overflow:hidden;
        ">

            <div
                id="setupProgressBar"
                style="
                width:0%;
                height:100%;
                background:linear-gradient(
                    90deg,
                    #F1C400,
                    #FFD84D
                );
                transition:width .4s;
                ">
            </div>

        </div>

        <div
            id="setupProgressText"
            style="
            text-align:center;
            color:#6B778C;
            font-weight:600;
            font-size:15px;
            ">

            Preparing...

        </div>

    `;

}

// ======================================================
// SETUP STEP 4
// ======================================================

function getSetupFinished(){

    return `

        <div class="setupIcon">

            🎉

        </div>

        <div class="setupTitle">

            Dashboard Ready

        </div>

        <div
            style="
            text-align:center;
            margin-top:25px;
            ">

            <div
                style="
                font-size:28px;
                font-weight:800;
                color:#07225B;
                ">

                Welcome,

            </div>

            <div
                style="
                font-size:34px;
                font-weight:800;
                color:#073590;
                margin-top:8px;
                ">

                ${getCurrentFullName()}

            </div>

            <div
                style="
                margin-top:12px;
                color:#F1C400;
                font-weight:700;
                font-size:18px;
                ">

                Administrator

            </div>

        </div>

        <div class="setupText" style="margin-top:35px;">

            The Engineering Dashboard has been successfully configured.

            <br><br>

            You now have full administrator privileges.

        </div>

        <div class="setupButtons">

            <button
                class="btn btn-green"
                onclick="finishSystemSetup()">

                Open Dashboard →

            </button>

        </div>

    `;

}

// ======================================================
// FINISH SETUP
// ======================================================

function finishSystemSetup(){

    document
        .getElementById("systemSetupModal")
        .style.display = "none";

    updateUserInterface();

    closeUserMenu();

    showSuccess(

        "Welcome!",

        "The dashboard has been successfully configured."

    );

}

// ======================================================
// USER MANAGEMENT
// ======================================================

let USERS_CACHE = [];

async function loadAllUsers(){

    const snapshot = await firebaseGet(

        firebaseRef(

            database,

            AUTH_COLLECTION

        )

    );

    USERS_CACHE = [];

    if(!snapshot.exists()){

        return USERS_CACHE;

    }

    snapshot.forEach(child=>{

        USERS_CACHE.push({

            id: child.key,

            ...child.val()

        });

    });

    USERS_CACHE.sort((a,b)=>

        a.profile.fullName.localeCompare(

            b.profile.fullName

        )

    );

    return USERS_CACHE;

}



async function openUserManagement(){

    try{

        showLoading();

        updateLoading(

            "Loading Users...",

            30,

            "Reading user database..."

        );

        await loadAllUsers();

        updateLoading(

            "Preparing User Management...",

            80,

            "Building interface..."

        );

        await new Promise(resolve=>setTimeout(resolve,300));

        hideLoading();

        renderUserManagement();

    }

    catch(error){

        console.error(error);

        hideLoading();

        showError(

            "User Management",

            "Unable to load users."

        );

    }

}

function renderUserManagement(){

    const modal =
    document.getElementById(
        "userManagementModal"
    );

modal.style.display="flex";

    renderUserStats();

renderUsersTable();
}

function closeUserManagement(){

    document
        .getElementById("userManagementModal")
        .style.display="none";

}

// ======================================================
// RENDER USERS TABLE
// ======================================================

function renderUsersTable(){

    const container =
        document.getElementById(
            "usersTableContainer"
        );

    const search =
        document
            .getElementById("userSearchInput")
            .value
            .trim()
            .toLowerCase();

    let users =
        USERS_CACHE;

    if(search !== ""){

        users = users.filter(user =>

            user.profile.fullName
                .toLowerCase()
                .includes(search)

            ||

            user.profile.username
                .toLowerCase()
                .includes(search)

        );

    }

    let html = `

        <table class="usersTable">

            <thead>

                <tr>

                    <th>Name</th>

                    <th>Username</th>

                    <th>Role</th>

                    <th>Status</th>

                    <th>Actions</th>

                </tr>

            </thead>

            <tbody>

    `;

    users.forEach(user=>{

    html += createUserRow(user);

});

    html += `

            </tbody>

        </table>

    `;

    container.innerHTML = html;

}

function createUserRow(user){

    return `

        <tr>

            <td>

                👤 ${user.profile.fullName}

            </td>

            <td>

                ${user.profile.username}

            </td>

            <td>

                ${getRoleBadge(user.profile.role)}

            </td>

            <td>

                ${

                    user.profile.active

                    ?

                    '<span class="statusActive">🟢 Active</span>'

                    :

                    '<span class="statusInactive">🔴 Disabled</span>'

                }

            </td>

            <td>

    <div class="userActions">

        <button
        class="btn btn-white"
        onclick="editUser('${user.profile.username}')">

            ✏️ Edit

        </button>

        <button
        class="btn btn-white"
        onclick="toggleUserStatus('${user.profile.username}')">

            ${
                user.profile.active
                ?
                "🔒 Disable"
                :
                "🟢 Enable"
            }

        </button>

        <button
        class="btn btn-white"
        onclick="resetUserPassword('${user.profile.username}')">

            🔑 Reset Password

        </button>

    </div>

</td>

        </tr>

    `;

}

// ======================================================
// USER ACTIONS
// ======================================================

async function toggleUserStatus(username){

    try{

        const user = USERS_CACHE.find(

            u => u.profile.username === username

        );

        if(!user){

            showError(

                "User Management",

                "User not found."

            );

            return;

        }

        // Não permitir desativar o próprio utilizador

        if(

            CURRENT_USER &&

            CURRENT_USER.profile.username === username

        ){

            showWarning(

                "Operation Not Allowed",

                "You cannot disable your own account."

            );

            return;

        }

        const active = !user.profile.active;

        await firebaseUpdate(

            firebaseRef(

                database,

                `${AUTH_COLLECTION}/${username}`

            ),

            {

                profile:{

                    ...user.profile,

                    active

                }

            }

        );

        user.profile.active = active;

        await writeAuditLog(

            active

                ? "ENABLE_USER"

                : "DISABLE_USER",

            `${username}`

        );

        renderUsersTable();
renderUserStats();
        showSuccess(

            "User Updated",

            active

                ? "User enabled successfully."

                : "User disabled successfully."

        );

    }

    catch(error){

        console.error(error);

        showError(

            "User Management",

            "Unable to update user."

        );

    }

}

function resetUserPassword(username){

    showWarning(

        "Coming Soon",

        `Reset password for ${username}`

    );

}

let EDITING_USER = null

// ======================================================
// EDIT USER
// ======================================================

function editUser(username){

    const user = USERS_CACHE.find(

        u => u.profile.username === username

    );

    if(!user){

        showError(

            "User Management",

            "User not found."

        );

        return;

    }

    EDITING_USER = user;

    document.getElementById(

        "editUserFullName"

    ).value = user.profile.fullName;

    document.getElementById(

        "editUserUsername"

    ).value = user.profile.username;

    document.getElementById(

        "editUserRole"

    ).value = user.profile.role;

    document.getElementById(

        "editUserModal"

    ).style.display = "flex";

}

function closeEditUser(){

    EDITING_USER = null;

    document.getElementById(

        "editUserModal"

    ).style.display = "none";

}

// ======================================================
// SAVE USER
// ======================================================

async function saveUser(){

    if(!EDITING_USER)
        return;

    try{

        const fullName =
            document
                .getElementById("editUserFullName")
                .value
                .trim();

        const role =
            document
                .getElementById("editUserRole")
                .value;

        if(fullName===""){

            showError(

                "Invalid Name",

                "Please enter the user's full name."

            );

            return;

        }

        const username =
            EDITING_USER.profile.username;

        await firebaseUpdate(

            firebaseRef(

                database,

                `${AUTH_COLLECTION}/${username}`

            ),

            {

                profile:{

                    ...EDITING_USER.profile,

                    fullName,

                    role

                },

                permissions:

                    createPermissions(role)

            }

        );

        // =====================================
        // UPDATE CACHE
        // =====================================

        EDITING_USER.profile.fullName =
            fullName;

        EDITING_USER.profile.role =
            role;

        EDITING_USER.permissions =
            createPermissions(role);

        // =====================================
        // UPDATE CURRENT USER
        // =====================================

        if(

            CURRENT_USER &&

            CURRENT_USER.profile.username === username

        ){

            CURRENT_USER.profile.fullName =
                fullName;

            CURRENT_USER.profile.role =
                role;

            CURRENT_USER.permissions =
                createPermissions(role);

            updateUserInterface();

        }

        // =====================================
        // AUDIT
        // =====================================

        await writeAuditLog(

            "UPDATE_USER",

            `Updated user ${username}`

        );

        renderUsersTable();
renderUserStats();
        closeEditUser();

        showSuccess(

            "User Updated",

            "The user has been updated successfully."

        );

    }

    catch(error){

        console.error(error);

        showError(

            "User Management",

            "Unable to update user."

        );

    }

}

// ======================================================
// CREATE USER MODAL
// ======================================================

function openCreateUserModal(){

    document.getElementById("newUserFullName").value="";

    document.getElementById("newUserUsername").value="";

    document.getElementById("newUserPassword").value="";

    document.getElementById("newUserRole").value="viewer";

    document.getElementById(

        "createUserModal"

    ).style.display="flex";

}

function closeCreateUserModal(){

    document.getElementById(

        "createUserModal"

    ).style.display="none";

}

// ======================================================
// CREATE USER FROM DASHBOARD
// ======================================================

async function createDashboardUser(){

    try{

        const fullName =
            document.getElementById("newUserFullName").value.trim();

        const username =
            document.getElementById("newUserUsername").value.trim().toLowerCase();

        const password =
            document.getElementById("newUserPassword").value;

        const role =
            document.getElementById("newUserRole").value;

        if(

            fullName==="" ||

            username==="" ||

            password===""

        ){

            showError(

                "Missing Information",

                "Please complete every field."

            );

            return;

        }

        await createUser({

            fullName,

            username,

            password,

            role,

            createdBy:getCurrentUsername()

        });

        await writeAuditLog(

            "CREATE_USER",

            username

        );

        await loadAllUsers();

        renderUsersTable();

renderUserStats();

        closeCreateUserModal();

        showSuccess(

            "User Created",

            `${fullName} has been created successfully.`

        );

    }

    catch(error){

        if(

            error.message==="USERNAME_ALREADY_EXISTS"

        ){

            showError(

                "Username Exists",

                "Choose another username."

            );

            return;

        }

        console.error(error);

        showError(

            "User Management",

            "Unable to create user."

        );

    }

}

// ======================================================
// USER MANAGEMENT STATS
// ======================================================

function renderUserStats(){

    const total =
        USERS_CACHE.length;

    const admins =
        USERS_CACHE.filter(u=>u.profile.role==="admin").length;

    const supervisors =
        USERS_CACHE.filter(u=>u.profile.role==="supervisor").length;

    const viewers =
        USERS_CACHE.filter(u=>u.profile.role==="viewer").length;

    const active =
        USERS_CACHE.filter(u=>u.profile.active).length;

    document.getElementById(

        "userManagementStats"

    ).innerHTML = `

        ${createStatCard("Users",total)}

        ${createStatCard("Admins",admins)}

        ${createStatCard("Supervisors",supervisors)}

        ${createStatCard("Viewers",viewers)}

        ${createStatCard("Active",active)}

    `;

}

function createStatCard(title,value){

    return `

        <div
        style="
        background:#F8FAFC;
        border-radius:14px;
        padding:18px;
        text-align:center;
        border:1px solid #E5E7EB;
        ">

            <div
            style="
            font-size:14px;
            color:#6B7280;
            ">

                ${title}

            </div>

            <div
            style="
            font-size:30px;
            font-weight:800;
            color:#07225B;
            margin-top:8px;
            ">

                ${value}

            </div>

        </div>

    `;

}

function getRoleBadge(role){

    switch(role){

        case "admin":

            return `
            <span class="roleAdmin">
                Administrator
            </span>`;

        case "supervisor":

            return `
            <span class="roleSupervisor">
                Supervisor
            </span>`;

        default:

            return `
            <span class="roleViewer">
                Viewer
            </span>`;

    }

}

let AUDIT_CACHE = [];

// ======================================================
// LOAD AUDIT LOGS
// ======================================================

async function loadAuditLogs(){

    const snapshot = await firebaseGet(

        firebaseRef(

            database,

            LOGS_COLLECTION

        )

    );

    AUDIT_CACHE = [];

    if(!snapshot.exists()){

        return AUDIT_CACHE;

    }

    snapshot.forEach(log=>{

        AUDIT_CACHE.push({

            id:log.key,

            ...log.val()

        });

    });

    AUDIT_CACHE.sort(

        (a,b)=>b.timestamp-a.timestamp

    );

    return AUDIT_CACHE;

}

async function openActivityLogs(){

    try{

        showLoading();

        updateLoading(

            "Loading Activity Logs...",

            40,

            "Reading audit history..."

        );

        await loadAuditLogs();

        hideLoading();

        document
            .getElementById("auditLogsModal")
            .style.display="flex";

        renderAuditTable();

    }

    catch(error){

        console.error(error);

        hideLoading();

        showError(

            "Activity Logs",

            "Unable to load audit history."

        );

    }

}

function closeActivityLogs(){

    document
        .getElementById("auditLogsModal")
        .style.display="none";

}

// ======================================================
// RENDER AUDIT TABLE
// ======================================================

function renderAuditTable(){

    const container =
        document.getElementById(
            "auditTableContainer"
        );

    const search =
        document.getElementById(
            "auditSearch"
        )
        .value
        .trim()
        .toLowerCase();

    let logs = [...AUDIT_CACHE];

    if(search !== ""){

        logs = logs.filter(log=>

            (log.fullName || "")
                .toLowerCase()
                .includes(search)

            ||

            (log.username || "")
                .toLowerCase()
                .includes(search)

            ||

            (log.action || "")
                .toLowerCase()
                .includes(search)

            ||

            (log.details || "")
                .toLowerCase()
                .includes(search)

        );

    }

    let html = `

    <table class="usersTable">

        <thead>

            <tr>

                <th>Date</th>

                <th>User</th>

                <th>Role</th>

                <th>Action</th>

                <th>Details</th>

            </tr>

        </thead>

        <tbody>

    `;

    logs.forEach(log=>{

        html += createAuditRow(log);

    });

    html += `

        </tbody>

    </table>

    `;

    container.innerHTML = html;

}

function createAuditRow(log){

    const date = new Date(log.timestamp);

    const formattedDate =

        date.toLocaleDateString()

        + " "

        +

        date.toLocaleTimeString();

    return `

        <tr>

            <td>

                ${formattedDate}

            </td>

            <td>

                👤 ${log.fullName}

                <br>

                <span style="font-size:12px;color:#7F8C8D;">

                    ${log.username}

                </span>

            </td>

            <td>

                ${getRoleBadge(log.role)}

            </td>

            <td>

                ${getActionBadge(log.action)}

            </td>

            <td>

                ${log.details || "-"}

            </td>

        </tr>

    `;

}

// ======================================================
// ACTION BADGES
// ======================================================

function getActionBadge(action){

    const colours={

        LOGIN:"#27AE60",

        LOGOUT:"#95A5A6",

        CREATE_USER:"#3498DB",

        UPDATE_USER:"#F39C12",

        ENABLE_USER:"#2ECC71",

        DISABLE_USER:"#E74C3C",

        OPEN_IMPORT_DATA:"#8E44AD",

        OPEN_VISUAL_EDITOR:"#2980B9",

        RESET_DASHBOARD:"#C0392B"

    };

    const colour =

        colours[action] ||

        "#6B7280";

    return `

        <span

        style="

        background:${colour};

        color:white;

        padding:5px 12px;

        border-radius:20px;

        font-size:12px;

        font-weight:700;

        ">

            ${action}

        </span>

    `;

}

// ======================================================
// EXPORT AUDIT LOGS
// ======================================================

function exportAuditLogs(){

    if(AUDIT_CACHE.length===0){

        showWarning(

            "No Data",

            "There are no activity logs to export."

        );

        return;

    }

    const data = AUDIT_CACHE.map(log=>({

        Date:
            new Date(log.timestamp).toLocaleDateString(),

        Time:
            new Date(log.timestamp).toLocaleTimeString(),

        User:
            log.fullName,

        Username:
            log.username,

        Role:
            log.role,

        Action:
            log.action,

        Details:
            log.details || ""

    }));

    const workbook =
        XLSX.utils.book_new();

    const worksheet =
        XLSX.utils.json_to_sheet(data);

worksheet["!cols"] = [

    {wch:14},

    {wch:12},

    {wch:26},

    {wch:18},

    {wch:16},

    {wch:22},

    {wch:45}

];

    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Activity Logs"

    );

    XLSX.writeFile(

        workbook,

        `Activity_Logs_${new Date().toISOString().slice(0,10)}.xlsx`

    );

    showSuccess(

        "Export Complete",

        "Activity Logs exported successfully."

    );

}