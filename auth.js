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

const FWD_DATA_COLLECTION = "dashboardData/FWD";

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
// STARTUP WELCOME
// ======================================================

function showStartupWelcome(){

    const modal =
        document.getElementById("welcomeModal");

    if(!modal)
        return;


    const avatar =
        document.getElementById("welcomeAvatar");

    const title =
        document.getElementById("welcomeTitle");

    const userName =
        document.getElementById("welcomeUserName");

    const userRole =
        document.getElementById("welcomeUserRole");

    const message =
        document.getElementById("welcomeMessage");

    const loginButton =
        document.getElementById("welcomeLoginButton");

    const createAccountButton =
    document.getElementById(
        "welcomeCreateAccountButton"
    );

    const continueButton =
        document.getElementById("welcomeContinueButton");


    // =====================================
    // LOGGED USER
    // =====================================

    if(CURRENT_USER){

        const fullName =
            CURRENT_USER.profile.fullName;

        const role =
            CURRENT_USER.profile.role;

        let roleText = "Viewer";

        switch(role){

            case "admin":
                roleText = "Administrator";
                break;

            case "supervisor":
                roleText = "Supervisor";
                break;

            default:
                roleText = "Viewer";

        }


        // Avatar

        // =====================================
// AVATAR
// =====================================

if(CURRENT_USER.profile.photo){

    avatar.innerHTML = `

        <img
            src="${CURRENT_USER.profile.photo}"
            alt="${fullName}"
            style="
                width:100%;
                height:100%;
                object-fit:cover;
                border-radius:50%;
                display:block;
            "
        >

    `;

}else{

    const initials =
        fullName
            .split(" ")
            .filter(word => word.length > 0)
            .map(word => word[0].toUpperCase());

    const avatarText =
        initials.length >= 2
            ? initials[0] + initials[initials.length - 1]
            : initials[0];

    avatar.textContent =
        avatarText;

}


        title.textContent =
            "Welcome back";


        userName.textContent =
            fullName;


        userRole.textContent =
            roleText;


        message.textContent =
            "Welcome back to the Ryanair Engineering Dashboard.";


        loginButton.style.display =
    "none";

createAccountButton.style.display =
    "none";

continueButton.style.display =
    "inline-flex";

    }


    // =====================================
    // GUEST
    // =====================================

    else{

        avatar.textContent =
            "👋";


        title.textContent =
            "Welcome";


        userName.textContent =
            "Ryanair Engineering Dashboard";


        userRole.textContent =
            "";


        message.textContent =
            "Please sign in to access your profile, or create a new account.";


        loginButton.style.display =
    "inline-flex";

createAccountButton.style.display =
    "inline-flex";

continueButton.style.display =
    "none";

    }


   // =====================================
// HIDE HOME WHILE WELCOME IS OPEN
// =====================================

const homeScreen =
    document.getElementById("homeScreen");

if(homeScreen){

    homeScreen.style.visibility =
        "hidden";

}


// =====================================
// SHOW WELCOME
// =====================================

modal.style.display =
    "flex";

modal.style.zIndex =
    "2000000";

}


// ======================================================
// STARTUP LOGIN
// ======================================================

function startupLogin(){

    restoreAppBackground();

    closeWelcomeModal();

    openLoginModal();

}


// ======================================================
// CLOSE STARTUP WELCOME
// ======================================================

function closeWelcomeModal(){

    const modal =
        document.getElementById("welcomeModal");

    if(modal){

        modal.style.display =
            "none";

    }


    // =====================================
    // SHOW HOME AGAIN
    // =====================================

    const homeScreen =
        document.getElementById("homeScreen");

    if(homeScreen){

        homeScreen.style.visibility =
            "visible";

    }

restoreAppBackground();

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

// ======================================
// FIRST INSTALL
// ======================================

if(!hasUsers){

    document
        .getElementById("app-loading")
        .classList.add("hidden");

    await new Promise(r=>setTimeout(r,500));

    document
        .getElementById("app-loading")
        .remove();

    startSystemSetup();

    return;
}


// ======================================
// NORMAL START
// ======================================

updateUserInterface();

showStartupWelcome();

}catch(error){

        console.error(error);

        showError(

            "Startup Error",

            "An unexpected error occurred while starting the application."

        );

    }

// ======================================
// REMOVE LOADING
// ======================================

document
    .getElementById("app-loading")
    .classList.add("hidden");

await new Promise(r=>setTimeout(r,500));

document
    .getElementById("app-loading")
    .remove();

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

        username,

        role: user.profile.role,

        fullName: user.profile.fullName

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

    createdBy,

    photo = null

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

    active:true,

    photo

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

    const masterKey =
    document
        .getElementById("setupMasterKey")
        .value
        .trim();

    const photoFile =
    document
        .getElementById("setupPhotoInput")
        ?.files?.[0];

let photo = null;

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

if(masterKey.length < 8){

    showError(

        "Invalid Master Key",

        "The Master Security Key must contain at least 8 characters."

    );

    return;

}


    if(photoFile){

    photo =
        await new Promise(
            (resolve,reject) => {

                const reader =
                    new FileReader();


                reader.onload =
                    function(event){

                        resolve(
                            event.target.result
                        );

                    };


                reader.onerror =
                    function(){

                        reject(
                            new Error(
                                "PHOTO_READ_FAILED"
                            )
                        );

                    };


                reader.readAsDataURL(
                    photoFile
                );

            }
        );

}


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

    const masterKeySalt =
    generateSalt();


const masterKeyHash =
    await hashPassword(
        masterKey,
        masterKeySalt
    );


    const user = await createUser({

    fullName,

    username,

    password,

    role:
        USER_ROLES.ADMIN,

    createdBy:
        "SYSTEM",

    photo

});


    progress(
        75,
        "Configuring permissions..."
    );

    await new Promise(r=>setTimeout(r,350));



    CURRENT_USER = user;

await firebaseSet(

    firebaseRef(
        database,
        "system/security"
    ),

    {

        masterKeyHash,

        masterKeySalt,

        createdAt:
            Date.now(),

        createdBy:
            username

    }

);

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

document.getElementById(
    "menuDataManagementButton"
).style.display =

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

function toggleUserMenu(event){

    event.stopPropagation();

    const menu =
        document.getElementById("userMenu");

    if(menu.style.display === "block"){

        closeUserMenu();
        return;

    }

    menu.style.display = "block";
    menu.style.position = "fixed";
    menu.style.zIndex = "999999999";

    if(event){

        const rect =
            event.currentTarget.getBoundingClientRect();

        menu.style.top =
            (rect.bottom + 12) + "px";

        menu.style.right =
            (window.innerWidth - rect.right) + "px";

        menu.style.left = "auto";

    }else{

        menu.style.top = "72px";
        menu.style.right = "25px";
        menu.style.left = "auto";

    }

}


function closeUserMenu(){

    const menu =
        document.getElementById("userMenu");

    if(menu){

        menu.style.display = "none";

    }

}

// ======================================
// CLICK OUTSIDE
// ======================================

document.addEventListener("click", function(event){

    const menu = document.getElementById("userMenu");

    const navbarProfile =
        document.getElementById("userProfile");

    const homeProfile =
        document.querySelector(".home-user-card");

    const clickedTrigger =

        (navbarProfile && navbarProfile.contains(event.target))

        ||

        (homeProfile && homeProfile.contains(event.target));

    if(

        !clickedTrigger &&

        menu &&

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
// SHOW NOTIFICATION
// ======================================================

function showNotification(title,message,type="info"){

    const modal =
        document.getElementById("notificationModal");

    const titleEl =
        document.getElementById("notificationTitle");

    const messageEl =
        document.getElementById("notificationMessage");

    const icon =
        document.getElementById("notificationIcon");

    if(

        !modal ||

        !titleEl ||

        !messageEl ||

        !icon

    ){

        alert(`${title}\n\n${message}`);

        return;

    }

    titleEl.textContent = title;

    messageEl.textContent = message;

    switch(type){

        case "success":

            icon.innerHTML = "✅";

            icon.style.color = "#2ECC71";

            break;

        case "error":

            icon.innerHTML = "❌";

            icon.style.color = "#E74C3C";

            break;

        case "warning":

            icon.innerHTML = "⚠️";

            icon.style.color = "#F39C12";

            break;

        default:

            icon.innerHTML = "ℹ️";

            icon.style.color = "#3498DB";

    }

    modal.style.display = "flex";
modal.style.zIndex = "1000000";

}

function showPasswordResetNotification(password){

    const modal =
        document.getElementById("notificationModal");

    const titleEl =
        document.getElementById("notificationTitle");

    const messageEl =
        document.getElementById("notificationMessage");

    const icon =
        document.getElementById("notificationIcon");

    if(

        !modal ||
        !titleEl ||
        !messageEl ||
        !icon

    ){

        alert(
            `Password Reset\n\nTemporary password: ${password}`
        );

        return;

    }

    titleEl.textContent =
        "Password Reset";

    icon.innerHTML =
        "✅";

    icon.style.color =
        "#2ECC71";


    messageEl.innerHTML = `

        <div class="passwordResetMessage">

            <div class="passwordResetInfo">

                A new temporary password has been generated.

            </div>

            <div class="passwordResetBox">

                <span id="temporaryPasswordValue">

                    ${password}

                </span>

                <button
                    type="button"
                    class="copyPasswordButton"
                    onclick="copyTemporaryPassword()">

                    📋 Copy

                </button>

            </div>

            <div class="passwordResetWarning">

                Make sure you save this password
                before closing this window.

            </div>

        </div>

    `;

    modal.style.display =
    "flex";

modal.style.zIndex =
    "1000000";

}

async function copyTemporaryPassword(){

    const passwordElement =
        document.getElementById(
            "temporaryPasswordValue"
        );

    if(!passwordElement)
        return;

    const password =
        passwordElement.textContent.trim();

    try{

        await navigator.clipboard.writeText(
            password
        );

        const button =
            document.querySelector(
                ".copyPasswordButton"
            );

        if(button){

            button.textContent =
                "✅ Copied";

            setTimeout(()=>{

                button.textContent =
                    "📋 Copy";

            },1500);

        }

    }

    catch(error){

        console.error(
            "Copy Password Error:",
            error
        );

    }

}


// ======================================================
// CLOSE NOTIFICATION
// ======================================================

function closeNotification(){

    document
        .getElementById("notificationModal")
        .style.display="none";

}

/* ======================================================
   CONFIRMATION MODAL
====================================================== */

let CONFIRM_CALLBACK = null;

function showConfirmation(
    title,
    message,
    callback,
    confirmText = "Confirm"
){

    document.getElementById("confirmationTitle").textContent = title;

    document.getElementById("confirmationMessage").textContent = message;

    document.getElementById("confirmationButton").textContent = confirmText;

    CONFIRM_CALLBACK = callback;

    document.getElementById("confirmationModal").style.display = "flex";

}

function closeConfirmation(){

    document.getElementById("confirmationModal").style.display = "none";

}

function confirmCancel(){

    CONFIRM_CALLBACK = null;

    closeConfirmation();

}

async function confirmYes(){

    closeConfirmation();


    const callback =
        CONFIRM_CALLBACK;


    CONFIRM_CALLBACK = null;


    if(
        typeof callback ===
        "function"
    ){

        await callback();

    }

}

function showPDFLoading(){

    document.getElementById("pdfProgressBar").style.width = "0%";

    document.getElementById("pdfProgressText").textContent =
        "Preparing...";

    document.getElementById("pdfLoadingMessage").textContent =
        "Please wait while the dashboard is being prepared.";

    document.getElementById("pdfLoadingModal").style.display = "flex";

}

function updatePDFLoading(current,total){

    const percent = Math.round((current/total)*100);

    document.getElementById("pdfProgressBar").style.width =
        percent + "%";

    document.getElementById("pdfProgressText").textContent =
        `Preparing page ${current} of ${total}...`;

}

function hidePDFLoading(){

    document.getElementById("pdfLoadingModal").style.display = "none";

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

            resetFwdData();

        },

    );

}

// ======================================================
// HEADER USER
// ======================================================

function updateHeaderUser(){

    const logged = isLogged();

    // =====================================
// GREETING
// =====================================

const hour = new Date().getHours();

let greeting = "Welcome,";

if(hour >= 5 && hour < 12){

    greeting = "Good Morning,";

}else if(hour >= 12 && hour < 18){

    greeting = "Good Afternoon,";

}else{

    greeting = "Good Evening,";

}

    const fullName =

        logged
            ? CURRENT_USER.profile.fullName
            : "Guest User";

    // =====================================
// USER INITIALS
// =====================================

const initials = fullName
    .split(" ")
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase());

const avatarText =
    initials.length >= 2
        ? initials[0] + initials[initials.length - 1]
        : initials[0];        

    const role =

        logged
            ? CURRENT_USER.profile.role
            : "Viewer";

    // =====================================
    // NAVBAR
    // =====================================

    document.getElementById("currentUserName").textContent =
        fullName;

    document.getElementById("currentUserRole").textContent =
        role;

    document.getElementById("menuFullName").textContent =
        fullName;

    document.getElementById("menuRole").textContent =
        role;

    const greetingElement =
    document.getElementById("homeUserGreeting");

if(greetingElement){

    greetingElement.textContent = greeting;

}

    // =====================================
    // HOME SCREEN
    // =====================================

    const homeName =
        document.getElementById("homeUserName");

    const homeRole =
        document.getElementById("homeUserRole");

    const homeStatus =
        document.getElementById("homeUserStatus");

    if(homeName)
        homeName.textContent = fullName;

    if(homeRole){

        switch(role){

            case "admin":
                homeRole.textContent = "Administrator";
                break;

            case "supervisor":
                homeRole.textContent = "Supervisor";
                break;

            default:
                homeRole.textContent = "Viewer";

        }

    }

    if(homeStatus){

        homeStatus.innerHTML =
            logged
            ? "🟢 Connected"
            : "🟡 Guest Session";

    }

// =====================================
// HOME LAST LOGIN
// =====================================

const lastLogin =
    document.getElementById("homeUserLastLogin");

if(lastLogin){

    if(logged){

        if(CURRENT_USER.metadata?.lastLogin){

            lastLogin.textContent =
                new Date(
                    CURRENT_USER.metadata.lastLogin
                ).toLocaleString(
                    "en-GB",
                    {
                        day:"2-digit",
                        month:"short",
                        year:"numeric",
                        hour:"2-digit",
                        minute:"2-digit"
                    }
                );

        }else{

            lastLogin.textContent = "First Login";

        }

    }else{

        lastLogin.textContent = "Guest Session";

    }

}

// =====================================
// HOME AVATAR
// =====================================

const avatar =
    document.getElementById("homeUserAvatar");

if(avatar){

    if(
        logged &&
        CURRENT_USER.profile.photo
    ){

        avatar.innerHTML = `

            <img
                src="${CURRENT_USER.profile.photo}"
                alt="${fullName}"
                class="homeUserAvatarImage">

        `;

    }else{

        avatar.textContent = avatarText;

    }

}

// =====================================
// NAVBAR AVATAR
// =====================================

const navbarAvatar =
    document.querySelector(
        "#userProfile .userAvatar"
    );

if(navbarAvatar){

    if(
        logged &&
        CURRENT_USER.profile.photo
    ){

        navbarAvatar.innerHTML = `

            <img
                src="${CURRENT_USER.profile.photo}"
                alt="${fullName}"
                class="currentUserAvatarImage">

        `;

    }else{

        navbarAvatar.textContent =
            avatarText;

    }

}

// =====================================
// USER MENU AVATAR
// =====================================

const menuAvatar =
    document.querySelector(
        "#userMenu .userMenuAvatar"
    );

if(menuAvatar){

    if(
        logged &&
        CURRENT_USER.profile.photo
    ){

        menuAvatar.innerHTML = `

            <img
                src="${CURRENT_USER.profile.photo}"
                alt="${fullName}"
                class="userMenuAvatarImage">

        `;

    }else{

        menuAvatar.textContent =
            avatarText;

    }

}

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


        <div
            class="setupText"
            style="margin-bottom:28px;"
        >

            Create the first Administrator account
            and configure the site's Master Security Key.

        </div>


        <!-- =====================================
             FULL NAME
        ====================================== -->

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


      <!-- =====================================
     PROFILE PHOTO
====================================== -->

<label
    class="input-label"
    style="margin-top:14px;"
>
    Profile Photo
</label>

<div
    style="
        display:flex;
        align-items:center;
        gap:18px;
        margin-top:8px;
        padding:4px 0 2px;
    "
>

    <!-- PHOTO -->

    <div
        id="setupPhotoPreviewContainer"
        style="
            width:82px;
            height:82px;
            min-width:82px;
            border-radius:50%;
            background:#EEF4FD;
            border:3px solid #F4C400;
            display:flex;
            align-items:center;
            justify-content:center;
            overflow:hidden;
            box-sizing:border-box;
            box-shadow:0 3px 10px rgba(8,43,115,.10);
            font-size:27px;
        "
    >
        👤
    </div>


    <!-- PHOTO CONTROLS -->

    <div
        style="
            display:flex;
            flex-direction:column;
            align-items:flex-start;
            gap:7px;
        "
    >

        <label
            for="setupPhotoInput"
            class="btn btn-white"
            style="
                display:inline-flex;
                align-items:center;
                justify-content:center;
                gap:7px;
                min-height:38px;
                padding:0 15px;
                cursor:pointer;
                box-sizing:border-box;
                font-size:13px;
            "
        >
            Choose Photo
        </label>

        <input
            id="setupPhotoInput"
            type="file"
            accept="image/*"
            onchange="previewSetupPhoto(this)"
            style="display:none;"
        >

        <span
            style="
                font-size:11px;
                line-height:1.3;
                color:#7A879A;
            "
        >
            JPG or PNG • Optional
        </span>

    </div>

</div>


        <!-- =====================================
             USERNAME
        ====================================== -->

        <label
            class="input-label"
            style="margin-top:12px;"
        >

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
            class="authHint"
        ></div>


        <!-- =====================================
             PASSWORD
        ====================================== -->

        <label
            class="input-label"
            style="margin-top:12px;"
        >

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
            class="authHint"
        ></div>


        <!-- =====================================
             CONFIRM PASSWORD
        ====================================== -->

        <label
            class="input-label"
            style="margin-top:12px;"
        >

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
            class="authHint"
        ></div>


        <!-- =====================================
             MASTER KEY
        ====================================== -->

        <label
            class="input-label"
            style="margin-top:16px;"
        >

            Master Security Key

        </label>


        <div
            style="
                display:flex;
                gap:10px;
                align-items:center;
            "
        >

            <input
                id="setupMasterKey"
                class="auth-input"
                type="password"
                placeholder="Create a secure master key"
                autocomplete="new-password"
                style="flex:1;"
            >


            <button
                type="button"
                class="btn btn-white"
                onclick="generateSetupMasterKey()"
                style="
                    white-space:nowrap;
                    height:44px;
                "
            >

                🔑 Generate Key

            </button>

        </div>


        <div
            id="setupMasterKeyStatus"
            class="authHint"
        >

            Required for sensitive administrator operations.

        </div>


        <!-- =====================================
             ACTIONS
        ====================================== -->

        <div class="setupButtonsRight">

            <button
                class="btn btn-white"
                onclick="showSetupStep(1)"
            >

                ← Back

            </button>


            <button
                class="btn btn-yellow"
                onclick="createFirstAdministrator()"
            >

                Create Administrator →

            </button>

        </div>

    `;

}

function previewSetupPhoto(input){

    const file =
        input?.files?.[0];

    const preview =
        document.getElementById(
            "setupPhotoPreviewContainer"
        );


    if(
        !file ||
        !preview
    ){

        return;

    }


    if(
        !file.type.startsWith("image/")
    ){

        showError(
            "Invalid Photo",
            "Please select an image file."
        );

        input.value = "";

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function(event){

            preview.innerHTML = `

                <img
                    src="${event.target.result}"
                    alt="Profile preview"
                    style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                        display:block;
                    "
                >

            `;

        };


    reader.readAsDataURL(file);

}

function generateSetupMasterKey(){

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";


    let key = "";


    const array =
        new Uint32Array(24);


    crypto.getRandomValues(
        array
    );


    array.forEach(
        value => {

            key +=
                chars[
                    value %
                    chars.length
                ];

        }
    );


    const input =
        document.getElementById(
            "setupMasterKey"
        );


    if(input){

        input.type =
            "text";

        input.value =
            key;

    }


    const status =
        document.getElementById(
            "setupMasterKeyStatus"
        );


    if(status){

        status.style.color =
            "#2E8B57";

        status.textContent =
            "✓ Strong Master Key generated. Save it securely.";

    }

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

    const roleFilter =
        document
            .getElementById("roleFilter")
            .value;

    const statusFilter =
        document
            .getElementById("statusFilter")
            .value;

    let users = USERS_CACHE;

    // ===============================
    // Search
    // ===============================

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

    // ===============================
    // Role Filter
    // ===============================

    if(roleFilter !== ""){

        users = users.filter(

            user => user.profile.role === roleFilter

        );

    }

    // ===============================
    // Status Filter
    // ===============================

    if(statusFilter !== ""){

        users = users.filter(user =>

            statusFilter === "active"

                ? user.profile.active

                : !user.profile.active

        );

    }

    let html = `

        <table class="usersTable">

            <thead>

                <tr>

                    <th>User</th>

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

    const initials = user.profile.fullName
        .split(" ")
        .map(n => n.charAt(0))
        .slice(0,2)
        .join("")
        .toUpperCase();

    const avatarContent =
        user.profile.photo
        ?
        `
        <img
            src="${user.profile.photo}"
            alt="${user.profile.fullName}"
            class="userAvatarImage">
        `
        :
        initials;

    return `

        <tr>

            <td>

                <div class="userInfo">

                    <div class="userAvatar">

                        ${avatarContent}

                    </div>

                    <div>

                        <div class="userName">

                            ${user.profile.fullName}

                        </div>

                        <div class="userUsername">

                            @${user.profile.username}

                        </div>

                    </div>

                </div>

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

                        ✏ Edit

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

                        🔑 Reset

                    </button>

                </div>

            </td>

        </tr>

    `;

}

// ======================================================
// MASTER SECURITY KEY — DISABLE USER
// ======================================================

let MASTER_KEY_TARGET_USERNAME = null;
let MASTER_KEY_ACTION = null;


function openMasterKeyModal(username, action){

    const user =
        USERS_CACHE.find(
            u => u.profile.username === username
        );


    if(!user){

        showError(
            "User Management",
            "User not found."
        );

        return;

    }


    // =========================================
    // STORE OPERATION
    // =========================================

    MASTER_KEY_TARGET_USERNAME =
        username;

    MASTER_KEY_ACTION =
        action;


    const modal =
        document.getElementById(
            "masterKeyModal"
        );

    const target =
        document.getElementById(
            "masterKeyTargetUser"
        );

    const input =
        document.getElementById(
            "masterKeyInput"
        );

    const title =
        document.querySelector(
            "#masterKeyModal .modalTitle"
        );

    const button =
        document.getElementById(
            "masterKeyConfirmButton"
        );


    if(
        !modal ||
        !target ||
        !input
    ){

        showError(
            "Security",
            "The Master Security Key window could not be opened."
        );

        return;

    }


    // =========================================
    // TARGET USER
    // =========================================

    target.textContent =
        `${user.profile.fullName} (@${username})`;


    // =========================================
    // ENABLE
    // =========================================

    if(action === "enable"){

        if(title){

            title.textContent =
                "🔓 Enable User";

        }

        if(button){

            button.textContent =
                "🔓 Enable User";

        }

    }


    // =========================================
    // DISABLE
    // =========================================

    else if(action === "disable"){

        if(title){

            title.textContent =
                "🔐 Disable User";

        }

        if(button){

            button.textContent =
                "🔒 Disable User";

        }

    }


    // =========================================
    // RESET INPUT
    // =========================================

    input.value = "";

    input.type =
        "password";


    // =========================================
    // SHOW
    // =========================================

    modal.style.display =
        "flex";


    setTimeout(
        () => input.focus(),
        100
    );

}


// ======================================================
// CLOSE MASTER KEY MODAL
// ======================================================

function closeMasterKeyModal(){

    const modal =
        document.getElementById(
            "masterKeyModal"
        );


    const input =
        document.getElementById(
            "masterKeyInput"
        );


    if(input){

        input.value = "";

        input.type =
            "password";

    }


    MASTER_KEY_TARGET_USERNAME =
        null;


    if(modal){

        modal.style.display =
            "none";

    }

}

// ======================================================
// VERIFY MASTER KEY AND DISABLE USER
// ======================================================

async function verifyMasterKeyAndDisable(){

    const username =
        MASTER_KEY_TARGET_USERNAME;


    if(!username){

        closeMasterKeyModal();

        return;

    }


    const input =
        document.getElementById(
            "masterKeyInput"
        );


    const button =
        document.getElementById(
            "masterKeyConfirmButton"
        );


    const masterKey =
        input?.value.trim();


    // =========================================
    // EMPTY KEY
    // =========================================

    if(!masterKey){

        showWarning(

            "Master Key Required",

            "Please enter the Master Security Key."

        );

        if(input){

            input.focus();

        }

        return;

    }


    try{

        if(button){

            button.disabled =
                true;

            button.textContent =
                "Verifying...";

        }


        // =========================================
        // LOAD SECURITY CONFIGURATION
        // =========================================

        const snapshot =
            await firebaseGet(

                firebaseRef(

                    database,

                    "system/security"

                )

            );


        if(
            !snapshot.exists()
        ){

            showError(

                "Security Configuration",

                "The Master Security Key has not been configured."

            );

            return;

        }


        const security =
            snapshot.val();


        if(
            !security.masterKeyHash ||
            !security.masterKeySalt
        ){

            showError(

                "Security Configuration",

                "The Master Security Key configuration is incomplete."

            );

            return;

        }


        // =========================================
        // HASH ENTERED KEY
        // =========================================

        const enteredHash =
            await hashPassword(

                masterKey,

                security.masterKeySalt

            );


        // =========================================
        // INVALID KEY
        // =========================================

        if(
            enteredHash !==
            security.masterKeyHash
        ){

            showError(

                "Invalid Master Key",

                "The Master Security Key is incorrect. The user was not disabled."

            );

            if(input){

                input.select();

            }

            return;

        }


        // =========================================
        // KEY VALID — DISABLE USER
        // =========================================

        if(
    MASTER_KEY_ACTION === "enable"
){

    await enableUserWithMasterKey(
        username
    );

}
else if(
    MASTER_KEY_ACTION === "disable"
){

    await disableUserWithMasterKey(
        username
    );

}

    }

    catch(error){

        console.error(

            "Master Key verification failed:",

            error

        );


        showError(

            "Security Error",

            "Unable to verify the Master Security Key."

        );

    }

    finally{

        if(button){

            button.disabled =
                false;

            button.textContent =
                "Disable User";

        }

    }

}

async function enableUserWithMasterKey(username){

    const user =
        USERS_CACHE.find(
            u => u.profile.username === username
        );


    if(!user){

        closeMasterKeyModal();

        showError(
            "User Management",
            "User not found."
        );

        return;

    }


    await firebaseUpdate(

        firebaseRef(
            database,
            `${AUTH_COLLECTION}/${username}`
        ),

        {
            profile:{
                ...user.profile,
                active:true
            }
        }

    );


    user.profile.active =
        true;


    await writeAuditLog(
        "ENABLE_USER",
        `${username} — Master Security Key verified.`
    );


    closeMasterKeyModal();

    renderUsersTable();
    renderUserStats();


    showSuccess(
        "User Enabled",
        `${user.profile.fullName} has been enabled successfully.`
    );

}


// ======================================================
// SHOW / HIDE MASTER KEY
// ======================================================

function toggleMasterKeyVisibility(){

    const input =
        document.getElementById(
            "masterKeyInput"
        );


    if(!input){

        return;

    }


    input.type =
        input.type === "password"
            ? "text"
            : "password";

}


// ======================================================
// DISABLE USER AFTER MASTER KEY VALIDATION
// ======================================================

async function disableUserWithMasterKey(username){

    const user =
        USERS_CACHE.find(

            u =>
                u.profile.username ===
                username

        );


    if(!user){

        closeMasterKeyModal();

        showError(

            "User Management",

            "User not found."

        );

        return;

    }


    // =========================================
    // FIREBASE
    // =========================================

    await firebaseUpdate(

        firebaseRef(

            database,

            `${AUTH_COLLECTION}/${username}`

        ),

        {

            profile:{

                ...user.profile,

                active:false

            }

        }

    );


    // =========================================
    // LOCAL CACHE
    // =========================================

    user.profile.active =
        false;


    // =========================================
    // AUDIT
    // =========================================

    await writeAuditLog(

        "DISABLE_USER",

        `${username} — Master Security Key verified.`

    );


    // =========================================
    // CLOSE MODAL
    // =========================================

    closeMasterKeyModal();


    // =========================================
    // REFRESH
    // =========================================

    renderUsersTable();

    renderUserStats();


    // =========================================
    // SUCCESS
    // =========================================

    showSuccess(

        "User Disabled",

        `${user.profile.fullName} has been disabled successfully.`

    );

}

// ======================================================
// USER STATUS
// ======================================================

async function toggleUserStatus(username){

    try{

        const user =
            USERS_CACHE.find(
                u => u.profile.username === username
            );

        if(!user){

            showError(
                "User Management",
                "User not found."
            );

            return;
        }


        // =========================================
        // CANNOT DISABLE YOURSELF
        // =========================================

        if(
            CURRENT_USER &&
            CURRENT_USER.profile.username === username &&
            user.profile.active
        ){

            showWarning(
                "Operation Not Allowed",
                "You cannot disable your own account."
            );

            return;
        }


        // =========================================
        // USER IS DISABLED → ENABLE
        // =========================================

        if(!user.profile.active){

            openMasterKeyModal(
                username,
                "enable"
            );

            return;

        }


        // =========================================
        // USER IS ACTIVE → DISABLE
        // =========================================

        openMasterKeyModal(
            username,
            "disable"
        );

    }

    catch(error){

        console.error(
            "Toggle user status failed:",
            error
        );

        showError(
            "User Management",
            "Unable to update user."
        );

    }

}

function resetUserPassword(username){

    const user =
        USERS_CACHE.find(

            u => u.profile.username === username

        );

    if(!user){

        showError(

            "User Management",

            "User not found."

        );

        return;

    }

    showConfirmation(

        "Reset Password",

        `Are you sure you want to reset the password for ${user.profile.fullName} (@${username})?`,

        async ()=>{

            await confirmResetUserPassword(username);

        },

        "Reset Password"

    );

}

// ======================================================
// CONFIRM RESET USER PASSWORD
// ======================================================

async function confirmResetUserPassword(username){

    try{

        const user =
            USERS_CACHE.find(

                u => u.profile.username === username

            );

        if(!user){

            showError(

                "User Management",

                "User not found."

            );

            return;

        }


        // =====================================
        // GENERATE NEW PASSWORD
        // =====================================

        const newPassword =
            generateTemporaryPassword();

        const salt =
            generateSalt();

        const passwordHash =
            await hashPassword(

                newPassword,

                salt

            );


        // =====================================
        // UPDATE FIREBASE
        // =====================================

        await firebaseUpdate(

            firebaseRef(

                database,

                `${AUTH_COLLECTION}/${username}`

            ),

            {

                credentials:{

                    ...user.credentials,

                    salt,

                    passwordHash

                }

            }

        );


        // =====================================
        // UPDATE CACHE
        // =====================================

        user.credentials = {

            ...user.credentials,

            salt,

            passwordHash

        };


        // =====================================
        // AUDIT LOG
        // =====================================

        await writeAuditLog(

            "RESET_PASSWORD",

            `Reset password for ${username}`

        );


        // =====================================
        // SUCCESS
        // =====================================

        showPasswordResetNotification(
    newPassword
);

    }

    catch(error){

        console.error(error);

        showError(

            "User Management",

            "Unable to reset password."

        );

    }

}

function generateTemporaryPassword(){

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    let password = "";

    for(let i = 0; i < 10; i++){

        password +=
            chars.charAt(
                Math.floor(
                    Math.random() * chars.length
                )
            );

    }

    return password;

}

let EDITING_USER = null

// ======================================================
// EDIT USER
// ======================================================

function editUser(username){

    closeUserManagement();

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
        "editUserPassword"
    ).value = "";

    document.getElementById(
        "editUserPhotoInput"
    ).value = "";

    const editPhotoPreview =
        document.getElementById(
            "editUserPhotoPreview"
        );

    const editPhotoPlaceholder =
        document.getElementById(
            "editUserPhotoPlaceholder"
        );

    if(user.profile.photo){

        editPhotoPreview.src =
            user.profile.photo;

        editPhotoPreview.style.display =
            "block";

        editPhotoPlaceholder.style.display =
            "none";

    }else{

        editPhotoPreview.src = "";

        editPhotoPreview.style.display =
            "none";

        editPhotoPlaceholder.style.display =
            "flex";

        updateEditUserInitials(
            user.profile.fullName
        );

    }

    document.getElementById(
        "editUserModal"
    ).style.display = "flex";

}

function closeEditUser(){

    EDITING_USER = null;

    document.getElementById(

        "editUserModal"

    ).style.display = "none";

    renderUserManagement()

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

        const newPassword =
            document
                .getElementById("editUserPassword")
                .value
                .trim();

        if(fullName===""){

            showError(

                "Invalid Name",

                "Please enter the user's full name."

            );

            return;

        }

        const username =
            EDITING_USER.profile.username;


        // =====================================
        // PHOTO
        // =====================================

        const photoFile =
            document
                .getElementById("editUserPhotoInput")
                .files[0];

        let photo =
            EDITING_USER.profile.photo || null;

        if(photoFile){

            photo = await new Promise((resolve,reject)=>{

                const reader =
                    new FileReader();

                reader.onload = function(e){

                    resolve(e.target.result);

                };

                reader.onerror = function(){

                    reject(
                        new Error("PHOTO_READ_FAILED")
                    );

                };

                reader.readAsDataURL(photoFile);

            });

        }


        // =====================================
        // UPDATE DATA
        // =====================================

        const updateData = {

            profile:{

                ...EDITING_USER.profile,

                fullName,

                role,

                photo

            },

            permissions:

                createPermissions(role)

        };


        // =====================================
        // PASSWORD
        // =====================================

        if(newPassword !== ""){

            const salt =
                generateSalt();

            const passwordHash =
                await hashPassword(

                    newPassword,

                    salt

                );

            updateData.credentials = {

                ...EDITING_USER.credentials,

                salt,

                passwordHash

            };

        }


        // =====================================
        // SAVE FIREBASE
        // =====================================

        await firebaseUpdate(

            firebaseRef(

                database,

                `${AUTH_COLLECTION}/${username}`

            ),

            updateData

        );


        // =====================================
        // UPDATE CACHE
        // =====================================

        EDITING_USER.profile.fullName =
            fullName;

        EDITING_USER.profile.role =
            role;

        EDITING_USER.profile.photo =
            photo;

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

            CURRENT_USER.profile.photo =
                photo;

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


        // =====================================
        // REFRESH
        // =====================================

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

let CREATE_ACCOUNT_MODE = false;

function openCreateUserModal(mode = "management"){

    CREATE_ACCOUNT_MODE =
        mode === "account";


    // ==========================================
    // RESET FORM
    // ==========================================

    document.getElementById(
        "newUserFullName"
    ).value = "";


    document.getElementById(
        "newUserUsername"
    ).value = "";


    document.getElementById(
        "newUserPassword"
    ).value = "";


    // ==========================================
    // ROLE
    // ==========================================

    const roleSelect =
        document.getElementById(
            "newUserRole"
        );


    if(CREATE_ACCOUNT_MODE){

        roleSelect.value =
            "viewer";

        roleSelect.disabled =
            true;

    }else{

        roleSelect.value =
            "viewer";

        roleSelect.disabled =
            false;

    }


    // ==========================================
    // RESET PHOTO
    // ==========================================

    document.getElementById(
        "createUserPhotoInput"
    ).value = "";


    document.getElementById(
        "createUserPhotoPreview"
    ).src = "";


    document.getElementById(
        "createUserPhotoPreview"
    ).style.display =
        "none";


    document.getElementById(
        "createUserPhotoPlaceholder"
    ).style.display =
        "flex";


    updateCreateUserInitials();


    // ==========================================
    // MODAL TEXT
    // ==========================================

    const modalTitle =
        document.querySelector(
            "#createUserModal .modalTitle"
        );


    const createButton =
        document.querySelector(
            "#createUserModal .btn-green"
        );


    if(CREATE_ACCOUNT_MODE){

        if(modalTitle){

            modalTitle.textContent =
                "👤 Create Account";

        }


        if(createButton){

            createButton.textContent =
                "Create Account";

            createButton.onclick =
                createAccountFromWelcome;

        }

    }else{

        if(modalTitle){

            modalTitle.textContent =
                "👤 Create New User";

        }


        if(createButton){

            createButton.textContent =
                "Create User";

            createButton.onclick =
                createDashboardUser;

        }

    }


    // ==========================================
    // OPEN MODAL
    // ==========================================

    document.getElementById(
        "createUserModal"
    ).style.display =
        "flex";

}

function closeCreateUserModal(){

    document.getElementById(
        "createUserModal"
    ).style.display = "none";

openUserManagement()

}

// ======================================================
// CREATE USER FROM DASHBOARD
// ======================================================

async function createDashboardUser(){

    try{

        const fullName =
            document
                .getElementById("newUserFullName")
                .value
                .trim();

        const username =
            document
                .getElementById("newUserUsername")
                .value
                .trim()
                .toLowerCase();

        const password =
            document
                .getElementById("newUserPassword")
                .value;

        const role =
            document
                .getElementById("newUserRole")
                .value;

        /* =====================================
           PHOTO
        ===================================== */

        const photoFile =
            document
                .getElementById("createUserPhotoInput")
                .files[0];

        let photo = null;

        if(photoFile){

            photo = await new Promise((resolve,reject)=>{

                const reader =
                    new FileReader();

                reader.onload = function(e){

                    resolve(e.target.result);

                };

                reader.onerror = function(){

                    reject(
                        new Error("PHOTO_READ_FAILED")
                    );

                };

                reader.readAsDataURL(photoFile);

            });

        }

        /* =====================================
           VALIDATION
        ===================================== */

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

        /* =====================================
           CREATE USER
        ===================================== */

        await createUser({

            fullName,

            username,

            password,

            role,

            createdBy:getCurrentUsername(),

            photo

        });

        /* =====================================
           AUDIT
        ===================================== */

        await writeAuditLog(

            "CREATE_USER",

            username

        );

        /* =====================================
           REFRESH
        ===================================== */

        await loadAllUsers();

        renderUsersTable();

        renderUserStats();

        /* =====================================
           RESET FORM
        ===================================== */

        document
            .getElementById("newUserFullName")
            .value="";

        document
            .getElementById("newUserUsername")
            .value="";

        document
            .getElementById("newUserPassword")
            .value="";

        document
            .getElementById("newUserRole")
            .value="viewer";

        document
            .getElementById("createUserPhotoInput")
            .value="";

        document
            .getElementById("createUserPhotoPreview")
            .src="";

        document
            .getElementById("createUserPhotoPreview")
            .style.display="none";

        document
            .getElementById("createUserPhotoPlaceholder")
            .style.display="flex";

        /* =====================================
           CLOSE
        ===================================== */

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
function updateCreateUserInitials(){

    const input =
        document.getElementById("newUserFullName");

    const avatar =
        document.getElementById("createUserPhotoPlaceholder");

    const name =
        input.value.trim();

    if(name === ""){

        avatar.textContent = "??";

        return;

    }

    const parts =
        name.split(/\s+/);

    let initials =
        parts[0][0];

    if(parts.length > 1){

        initials +=
            parts[parts.length-1][0];

    }

    avatar.textContent =
        initials.toUpperCase();

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

        <div class="statCard">

            <div class="statTitle">

                ${title}

            </div>

            <div class="statValue">

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

    DELETE_USER:"#C0392B",

    ENABLE_USER:"#2ECC71",

    DISABLE_USER:"#E74C3C",

    RESET_PASSWORD:"#8E44AD",

    CHANGE_PASSWORD:"#8E44AD",

    UPDATE_PROFILE:"#2980B9",

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

// ======================================================
// CLOSE NOTIFICATION EVENTS
// ======================================================

window.addEventListener("keydown",event=>{

    if(event.key==="Escape"){

        closeNotification();

    }

});

document
.getElementById("notificationModal")
?.addEventListener("click",event=>{

    if(event.target.id==="notificationModal"){

        closeNotification();

    }

});

// ======================================================
// SETTINGS
// ======================================================

function openSettings(){

    renderSettings();

    document
        .getElementById("settingsModal")
        .style.display="flex";

}

function closeSettings(){

    document
        .getElementById("settingsModal")
        .style.display="none";

}

function renderSettings(){

    document
        .getElementById("settingsContent")
        .innerHTML = `

<div class="settingsGrid">

<div class="settingsCard">

    <h3>

        My Account

    </h3>


    <!-- ==========================================
         PROFILE PHOTO
    =========================================== -->

    <div
        style="
            display:flex;
            align-items:center;
            gap:18px;
            margin:10px 0 22px 0;
        "
    >

        <div
            style="
                width:82px;
                height:82px;
                border-radius:50%;
                overflow:hidden;
                background:#E8EDF5;
                display:flex;
                align-items:center;
                justify-content:center;
                flex-shrink:0;
                border:3px solid #F1C400;
            "
        >

            <img
                id="settingsProfilePhotoPreview"
                src="${
                    CURRENT_USER.profile.photo || ""
                }"
                alt="Profile Photo"
                style="
                    width:100%;
                    height:100%;
                    object-fit:cover;
                    ${
                        CURRENT_USER.profile.photo
                            ? ""
                            : "display:none;"
                    }
                "
            >

            <span
                id="settingsProfilePhotoPlaceholder"
                style="
                    font-size:28px;
                    font-weight:800;
                    color:#07225B;
                    ${
                        CURRENT_USER.profile.photo
                            ? "display:none;"
                            : ""
                    }
                "
            >
                ${(
                    CURRENT_USER.profile.fullName || "U"
                )
                    .split(" ")
                    .map(
                        name =>
                            name.charAt(0)
                    )
                    .join("")
                    .substring(0,2)
                    .toUpperCase()
                }
            </span>

        </div>


        <div>

            <div
                style="
                    font-weight:700;
                    color:#07225B;
                    margin-bottom:7px;
                "
            >
                Profile Photo
            </div>


            <label
                for="settingsProfilePhotoInput"
                class="btn btn-white"
                style="
                    display:inline-flex;
                    align-items:center;
                    cursor:pointer;
                    padding:8px 15px;
                "
            >
                Change Photo
            </label>


            <input
                id="settingsProfilePhotoInput"
                type="file"
                accept="image/*"
                style="display:none;"
                onchange="previewMyProfilePhoto(event)"
            >

        </div>

    </div>


    <label class="input-label">

        Full Name

    </label>

    <input

    id="settingsFullName"

    class="auth-input"

    value="${CURRENT_USER.profile.fullName}">

    <label
    class="input-label"
    style="margin-top:15px;">

        Username

    </label>

    <input

    class="auth-input"

    value="${CURRENT_USER.profile.username}"

    disabled>

    <label
    class="input-label"
    style="margin-top:15px;">

        Role

    </label>

    <input

    class="auth-input"

    value="${CURRENT_USER.profile.role}"

    disabled>

    <div
    style="
    display:flex;
    justify-content:flex-end;
    margin-top:20px;
    ">

        <button

        class="btn btn-yellow"

        onclick="saveMyProfile()">

            Save Profile

        </button>

    </div>

</div>

<div class="settingsCard">

    <h3>

        Security

    </h3>

    <label class="input-label">

        Current Password

    </label>

    <input

    id="currentPassword"

    class="auth-input"

    type="password">

    <label
    class="input-label"
    style="margin-top:15px;">

        New Password

    </label>

    <input

    id="newPassword"

    class="auth-input"

    type="password">

    <label
    class="input-label"
    style="margin-top:15px;">

        Confirm Password

    </label>

    <input

    id="confirmNewPassword"

    class="auth-input"

    type="password">

    <div
    style="
    display:flex;
    justify-content:flex-end;
    margin-top:20px;
    ">

        <button

        class="btn btn-yellow"

        onclick="changeMyPassword()">

            Change Password

        </button>

    </div>

</div>

<div class="settingsCard">

    <h3>

        Appearance

    </h3>

    <label>

        Theme

    </label>

    <select
    id="themeSelector"
    class="auth-input">

        <option value="light">

            Light

        </option>

        <option value="dark">

            Dark (Coming Soon)

        </option>

    </select>

    <label
    style="margin-top:18px;display:block;">

        Dashboard Density

    </label>

    <select
    id="densitySelector"
    class="auth-input">

        <option>

            Comfortable

        </option>

        <option>

            Compact

        </option>

    </select>

    <button

    class="btn btn-yellow"

    style="margin-top:20px;"

    onclick="saveAppearance()">

        Save Appearance

    </button>

</div>

<div class="settingsCard">

    <h3>

        Session Information

    </h3>

    <p>

        <strong>Current Role</strong>

    </p>

    <div class="settingsValue">

        ${CURRENT_USER.profile.role}

    </div>

    <p style="margin-top:18px;">

        <strong>Last Login</strong>

    </p>

    <div class="settingsValue">

        ${
            CURRENT_USER.metadata.lastLogin

            ?

            new Date(
                CURRENT_USER.metadata.lastLogin
            ).toLocaleString()

            :

            "First Login"

        }

    </div>

    <p style="margin-top:18px;">

        <strong>Session Status</strong>

    </p>

    <div class="settingsStatus">

        🟢 Connected

    </div>

</div>

<div class="settingsCard">

<h3>

Dashboard

</h3>

<label>

Default Landing Page

</label>

<select
class="auth-input">

<option>

Home

</option>

<option>

No Info Delays

</option>

<option>

First Wave Delays

</option>

<option>

A-Check

</option>

</select>

<label
style="margin-top:18px;display:block;">

Auto Refresh

</label>

<select
class="auth-input">

<option>

Disabled

</option>

<option>

30 seconds

</option>

<option>

60 seconds

</option>

<option>

5 minutes

</option>

</select>

<button

class="btn btn-yellow"

style="margin-top:20px;"

onclick="showSuccess('Dashboard','Dashboard preferences saved.')">

Save Dashboard

</button>

</div>

${
CURRENT_USER.profile.role==="admin"

?

`

<div class="settingsCard">

<h3>

🛠 System

</h3>

<p>

Dashboard Version

</p>

<strong>

2.0.0

</strong>

<hr>

<p>

Firebase

</p>

<span
class="settingsStatus">

🟢 Connected

</span>

<hr>

<button

class="btn btn-yellow"

onclick="openActivityLogs()">

Activity Logs

</button>

<br><br>

<button

class="btn btn-green"

onclick="exportAuditLogs()">

Export Logs

</button>

</div>

`

:

""
}

<div class="settingsCard">

<h3>

ℹ About

</h3>

<p>

<strong>

No Info Delays Dashboard

</strong>

</p>

<p>

Version 2.0

</p>

<p>

Developed for

Ryanair

</p>

<p>

© 2026

</p>

</div>

`;

}

// ======================================================
// SAVE MY PROFILE
// ======================================================

async function saveMyProfile(){

    try{

        // ==========================================
        // FULL NAME
        // ==========================================

        const fullName =

            document
                .getElementById("settingsFullName")
                .value
                .trim();


        if(fullName===""){

            showError(

                "Invalid Name",

                "Please enter your full name."

            );

            return;

        }


        // ==========================================
        // PROFILE PHOTO
        // ==========================================

        const photoInput =
            document.getElementById(
                "settingsProfilePhotoInput"
            );


        const photoFile =
            photoInput?.files?.[0];


        // Keep current photo if no new photo selected
        let photo =
            CURRENT_USER.profile.photo ||
            null;


        // ==========================================
        // READ NEW PHOTO
        // ==========================================

        if(photoFile){

            photo =
                await new Promise(
                    (resolve, reject) => {

                        const reader =
                            new FileReader();


                        reader.onload =
                            function(e){

                                resolve(
                                    e.target.result
                                );

                            };


                        reader.onerror =
                            function(){

                                reject(
                                    new Error(
                                        "PHOTO_READ_FAILED"
                                    )
                                );

                            };


                        reader.readAsDataURL(
                            photoFile
                        );

                    }
                );

        }


        // ==========================================
        // SAVE PROFILE
        // ==========================================

        await firebaseUpdate(

            firebaseRef(

                database,

                `${AUTH_COLLECTION}/${CURRENT_USER.profile.username}`

            ),

            {

                profile:{

                    ...CURRENT_USER.profile,

                    fullName,

                    photo

                }

            }

        );


        // ==========================================
        // UPDATE CURRENT SESSION
        // ==========================================

        CURRENT_USER.profile.fullName =
            fullName;


        CURRENT_USER.profile.photo =
            photo;


        // ==========================================
        // UPDATE INTERFACE
        // ==========================================

        updateUserInterface();


        // ==========================================
        // AUDIT LOG
        // ==========================================

        await writeAuditLog(

            "UPDATE_PROFILE",

            "Updated own profile."

        );


        // ==========================================
        // SUCCESS
        // ==========================================

        showSuccess(

            "Profile Updated",

            "Your profile has been updated successfully."

        );

    }


    catch(error){

        console.error(
            "SAVE PROFILE ERROR:",
            error
        );


        if(
            error.message ===
            "PHOTO_READ_FAILED"
        ){

            showError(

                "Photo Error",

                "Unable to read the selected profile photo."

            );

            return;

        }


        showError(

            "Settings",

            "Unable to save profile."

        );

    }

}

// ======================================================
// CHANGE MY PASSWORD
// ======================================================

async function changeMyPassword(){

    const currentPassword =
        document.getElementById(
            "currentPassword"
        ).value;

    const newPassword =
        document.getElementById(
            "newPassword"
        ).value;

    const confirmPassword =
        document.getElementById(
            "confirmNewPassword"
        ).value;

    if(

        currentPassword==="" ||

        newPassword==="" ||

        confirmPassword===""

    ){

        showWarning(

            "Missing Information",

            "Please complete all password fields."

        );

        return;

    }

    if(newPassword!==confirmPassword){

        showError(

            "Password Error",

            "The new passwords do not match."

        );

        return;

    }

    const currentHash =

    await hashPassword(

        currentPassword,

        CURRENT_USER.credentials.salt

    );

if(

    currentHash !==

    CURRENT_USER.credentials.passwordHash

){

    showError(

        "Invalid Password",

        "The current password is incorrect."

    );

    return;

}

const newSalt =
    generateSalt();

const newHash =

    await hashPassword(

        newPassword,

        newSalt

    );

await firebaseUpdate(

    firebaseRef(

        database,

        `${AUTH_COLLECTION}/${CURRENT_USER.profile.username}`

    ),

    {

        credentials:{

            salt:newSalt,

            passwordHash:newHash

        }

    }

);

CURRENT_USER.credentials.salt =

    newSalt;

CURRENT_USER.credentials.passwordHash =

    newHash;

await writeAuditLog(

    "CHANGE_PASSWORD",

    "User changed account password."

);

showSuccess(

    "Password Updated",

    "Your password has been changed successfully."

);

document.getElementById("currentPassword").value = "";

document.getElementById("newPassword").value = "";

document.getElementById("confirmNewPassword").value = "";

}

async function saveAppearance(){

    showSuccess(

        "Appearance",

        "Appearance settings saved."

    );

}

// ======================================================
// USER SETTINGS
// ======================================================

function openUserSettings(){

    openSettings();

}

function openNoInfoEditVisuals(){

    requestPermission(

        PERMISSIONS.EDIT_VISUALS,

        ()=>{

            openAnalysisPeriodModal(

                async (year, month)=>{

                    // ==========================================
                    // UPDATE CURRENT NO INFO PERIOD
                    // ==========================================

                    CURRENT_NOINFO_YEAR =
                        year;

                    CURRENT_NOINFO_MONTH =
                        month;


                    // ==========================================
                    // LOAD SELECTED PERIOD
                    // ==========================================

                    await loadNoInfoData(

                        year,

                        month

                    );


                    // ==========================================
                    // OPEN EDIT MODAL
                    // ==========================================

                    openModal();

                }

            );

        }

    );

}

function openNoInfoImportData(){

    requestPermission(

        PERMISSIONS.IMPORT_DATA,

        ()=>{

            importData();

        }

    );

}

function openNoInfoResetData(){

    requestPermission(

        PERMISSIONS.RESET_DASHBOARD,

        ()=>{

            resetData();

        }

    );

}

// ======================================================
// RESET CENTER
// ======================================================

let CURRENT_RESET_CALLBACK = null;

function openResetCenter(callback){

    CURRENT_RESET_CALLBACK = callback;

    document.getElementById("resetCenterModal").style.display="flex";

}

function closeResetCenter(){

    document.getElementById("resetCenterModal").style.display="none";

}

function resetDashboardOnly(){

    closeResetCenter();

    if(CURRENT_RESET_CALLBACK){

        CURRENT_RESET_CALLBACK(false);

    }

}

function resetDashboardFirebase(){

    closeResetCenter();

    if(CURRENT_RESET_CALLBACK){

        CURRENT_RESET_CALLBACK(true);

    }

}

function previewCreateUserPhoto(event){

    const file = event.target.files[0];

    if(!file){

        document.getElementById(
            "createUserPhotoPreview"
        ).style.display = "none";

        document.getElementById(
            "createUserPhotoPlaceholder"
        ).style.display = "flex";

        return;

    }

    const reader = new FileReader();

    reader.onload = function(e){

        const preview =
            document.getElementById(
                "createUserPhotoPreview"
            );

        preview.src = e.target.result;

        preview.style.display = "block";

        document.getElementById(
            "createUserPhotoPlaceholder"
        ).style.display = "none";

    };

    reader.readAsDataURL(file);

}

function toggleEditPassword(){

    const input =
        document.getElementById("editUserPassword");

    input.type =
        input.type === "password"
        ? "text"
        : "password";

}

function updateEditUserInitials(name){

    const avatar =
        document.getElementById(
            "editUserPhotoPlaceholder"
        );

    if(!name || name.trim()===""){

        avatar.textContent="??";
        return;

    }

    const parts =
        name.trim().split(/\s+/);

    let initials =
        parts[0][0];

    if(parts.length>1){

        initials +=
            parts[parts.length-1][0];

    }

    avatar.textContent =
        initials.toUpperCase();

}

function previewEditUserPhoto(event){

    const file =
        event.target.files[0];

    if(!file){

        document.getElementById(
            "editUserPhotoPreview"
        ).style.display="none";

        document.getElementById(
            "editUserPhotoPlaceholder"
        ).style.display="flex";

        return;

    }

    const reader =
        new FileReader();

    reader.onload=function(e){

        document.getElementById(
            "editUserPhotoPreview"
        ).src=e.target.result;

        document.getElementById(
            "editUserPhotoPreview"
        ).style.display="block";

        document.getElementById(
            "editUserPhotoPlaceholder"
        ).style.display="none";

    };

    reader.readAsDataURL(file);

}

// ======================================================
// DELETE USER
// ======================================================

function deleteUser(){

    if(!EDITING_USER)
        return;

    const username =
        EDITING_USER.profile.username;

    const fullName =
        EDITING_USER.profile.fullName;


    // =====================================
    // PREVENT SELF DELETE
    // =====================================

    if(

        CURRENT_USER &&

        CURRENT_USER.profile.username === username

    ){

        showWarning(

            "Operation Not Allowed",

            "You cannot delete your own account."

        );

        return;

    }


    // =====================================
    // CONFIRMATION
    // =====================================

    showConfirmation(

        "Delete User",

        `Are you sure you want to permanently delete ${fullName} (@${username})? This action cannot be undone.`,

        async ()=>{

            await confirmDeleteUser();

        },

        "Delete User"

    );

}

// ======================================================
// CONFIRM DELETE USER
// ======================================================

async function confirmDeleteUser(){

    if(!EDITING_USER)
        return;

    try{

        const username =
            EDITING_USER.profile.username;

        const fullName =
            EDITING_USER.profile.fullName;


        // =====================================
        // DELETE FROM FIREBASE
        // =====================================

        await firebaseRemove(

            firebaseRef(

                database,

                `${AUTH_COLLECTION}/${username}`

            )

        );


        // =====================================
        // AUDIT LOG
        // =====================================

        await writeAuditLog(

            "DELETE_USER",

            `Deleted user ${username}`

        );


        // =====================================
        // REMOVE FROM CACHE
        // =====================================

        USERS_CACHE =
            USERS_CACHE.filter(

                user =>
                    user.profile.username !== username

            );


        // =====================================
        // RESET EDITING USER
        // =====================================

        EDITING_USER = null;


        // =====================================
        // REFRESH USER MANAGEMENT
        // =====================================

        renderUsersTable();

        renderUserStats();


        // =====================================
        // CLOSE EDIT USER
        // =====================================

        closeEditUser();


        // =====================================
        // OPEN USER MANAGEMENT
        // =====================================

        openUserManagement();


        // =====================================
        // SUCCESS
        // =====================================

        showSuccess(

            "User Deleted",

            `${fullName} has been permanently deleted.`

        );

    }

    catch(error){

        console.error(error);

        showError(

            "User Management",

            "Unable to delete user."

        );

    }

}

function restoreAppBackground(){

    document.documentElement.style.background =
        "#FFFFFF";

    document.body.style.background =
        "#FFFFFF";

}

// ======================================================
// FWD PDF EXPORT
// ======================================================

function openFwdExportModal(){

    const modal =
        document.getElementById(
            "fwdExportModal"
        );

    if(!modal)
        return;


    populateFwdExportPeriod();

    populateFwdExportCountry();

    populateFwdExportSort();

    populateFwdExportDelaySelectors();

    updateFwdExportBases();


    modal.style.display =
        "flex";

}


function closeFwdExportModal(){

    const modal =
        document.getElementById(
            "fwdExportModal"
        );

    if(modal){

        modal.style.display =
            "none";

    }

}


// ======================================================
// PERIOD
// ======================================================

function populateFwdExportPeriod(){

    const source =
        document.getElementById(
            "dashboardPeriod"
        );

    const target =
        document.getElementById(
            "fwdExportPeriod"
        );

    if(!source || !target)
        return;


    target.innerHTML = "";

    Array.from(source.options)
        .forEach(option=>{

            const clone =
                document.createElement(
                    "option"
                );

            clone.value =
                option.value;

            clone.textContent =
                option.textContent;

            target.appendChild(
                clone
            );

        });


    target.value =
        source.value;

}


// ======================================================
// COUNTRY
// ======================================================

function populateFwdExportCountry(){

    const source =
        document.getElementById(
            "baseCountryFilter"
        );

    const target =
        document.getElementById(
            "fwdExportCountry"
        );

    if(!source || !target)
        return;


    target.innerHTML = "";

    Array.from(source.options)
        .forEach(option=>{

            const clone =
                document.createElement(
                    "option"
                );

            clone.value =
                option.value;

            clone.textContent =
                option.textContent;

            target.appendChild(
                clone
            );

        });


    target.value =
        source.value || "ALL";

}


// ======================================================
// SORT
// ======================================================

function populateFwdExportSort(){

    const source =
        document.getElementById(
            "baseSort"
        );

    const target =
        document.getElementById(
            "fwdExportSort"
        );

    if(!source || !target)
        return;


    target.innerHTML = "";

    Array.from(source.options)
        .forEach(option=>{

            const clone =
                document.createElement(
                    "option"
                );

            clone.value =
                option.value;

            clone.textContent =
                option.textContent;

            target.appendChild(
                clone
            );

        });


    target.value =
        source.value;

    updateFwdExportSortFields();

    target.onchange =
        updateFwdExportSortFields;

}


// ======================================================
// SORT EXTRA FIELDS
// ======================================================

function updateFwdExportSortFields(){

    const sort =
        document.getElementById(
            "fwdExportSort"
        )?.value;


    const codeField =
        document.getElementById(
            "fwdExportDelayCodeField"
        );

    const groupField =
        document.getElementById(
            "fwdExportDelayGroupField"
        );


    if(codeField){

        codeField.style.display =
            sort === "delayCode"
                ? "block"
                : "none";

    }


    if(groupField){

        groupField.style.display =
            sort === "delayGroup"
                ? "block"
                : "none";

    }

}


// ======================================================
// DELAY SELECTORS
// ======================================================

function populateFwdExportDelaySelectors(){

    const sourceCode =
        document.getElementById(
            "delayCodeSelector"
        );

    const targetCode =
        document.getElementById(
            "fwdExportDelayCode"
        );


    if(sourceCode && targetCode){

        targetCode.innerHTML = "";

        Array.from(
            sourceCode.options
        )
        .forEach(option=>{

            const clone =
                document.createElement(
                    "option"
                );

            clone.value =
                option.value;

            clone.textContent =
                option.textContent;

            targetCode.appendChild(
                clone
            );

        });

        targetCode.value =
            sourceCode.value;

    }


    const sourceGroup =
        document.getElementById(
            "delayGroupSelector"
        );

    const targetGroup =
        document.getElementById(
            "fwdExportDelayGroup"
        );


    if(sourceGroup && targetGroup){

        targetGroup.innerHTML = "";

        Array.from(
            sourceGroup.options
        )
        .forEach(option=>{

            const clone =
                document.createElement(
                    "option"
                );

            clone.value =
                option.value;

            clone.textContent =
                option.textContent;

            targetGroup.appendChild(
                clone
            );

        });

        targetGroup.value =
            sourceGroup.value;

    }

}


// ======================================================
// BASE LIST
// ======================================================

function updateFwdExportBases(){

    const country =
        document.getElementById(
            "fwdExportCountry"
        )?.value || "ALL";


    const target =
        document.getElementById(
            "fwdExportBase"
        );

    if(!target)
        return;


    const currentBase =
        document.getElementById(
            "analysisBase"
        )?.value;


    target.innerHTML = "";


    const availableBases =
        BASES
            .filter(base=>{

                if(country === "ALL")
                    return true;

                return BASE_COUNTRIES[base] === country;

            })
            .sort((a,b)=>{

                const ca =
                    BASE_COUNTRIES[a] || "";

                const cb =
                    BASE_COUNTRIES[b] || "";

                if(ca === cb)
                    return a.localeCompare(b);

                return ca.localeCompare(cb);

            });


    availableBases.forEach(base=>{

        const option =
            document.createElement(
                "option"
            );

        option.value =
            base;

        option.textContent =
            `${BASE_COUNTRIES[base]} — ${base}`;

        target.appendChild(
            option
        );

    });


    if(
        currentBase &&
        availableBases.includes(currentBase)
    ){

        target.value =
            currentBase;

    }else if(
        availableBases.includes("OPO")
    ){

        target.value =
            "OPO";

    }else if(
        availableBases.length
    ){

        target.value =
            availableBases[0];

    }

}


// ======================================================
// APPLY EXPORT FILTERS
// ======================================================

async function applyFwdExportFilters(){

    const period =
        document.getElementById(
            "fwdExportPeriod"
        )?.value;


    const country =
        document.getElementById(
            "fwdExportCountry"
        )?.value || "ALL";


    const sort =
        document.getElementById(
            "fwdExportSort"
        )?.value;


    const base =
        document.getElementById(
            "fwdExportBase"
        )?.value;


    const delayCode =
        document.getElementById(
            "fwdExportDelayCode"
        )?.value;


    const delayGroup =
        document.getElementById(
            "fwdExportDelayGroup"
        )?.value;


    // ======================================
    // PERIOD
    // ======================================

    const dashboardPeriod =
        document.getElementById(
            "dashboardPeriod"
        );


    if(
        dashboardPeriod &&
        period &&
        dashboardPeriod.value !== period
    ){

        dashboardPeriod.value =
            period;


        const [year,month] =
            period
                .split("-")
                .map(Number);


        await updateFWDDashboard(
            year,
            month
        );

    }


    // ======================================
    // COUNTRY
    // ======================================

    const baseCountryFilter =
        document.getElementById(
            "baseCountryFilter"
        );


    if(baseCountryFilter){

        baseCountryFilter.value =
            country;

    }


    const countrySelector =
        document.getElementById(
            "countrySelector"
        );


    if(countrySelector){

        countrySelector.value =
            country;

    }


    // ======================================
    // SORT
    // ======================================

    const baseSort =
        document.getElementById(
            "baseSort"
        );


    if(baseSort){

        baseSort.value =
            sort;

    }


    // ======================================
    // DELAY FILTERS
    // ======================================

    const delayCodeSelector =
        document.getElementById(
            "delayCodeSelector"
        );


    if(delayCodeSelector && delayCode){

        delayCodeSelector.value =
            delayCode;

    }


    const delayGroupSelector =
        document.getElementById(
            "delayGroupSelector"
        );


    if(delayGroupSelector && delayGroup){

        delayGroupSelector.value =
            delayGroup;

    }


    // ======================================
    // ALWAYS SHOW ZERO BASES
    // ======================================

    const showZeroBases =
        document.getElementById(
            "showZeroBases"
        );


    if(showZeroBases){

        showZeroBases.checked =
            true;

    }


    // ======================================
    // REFRESH BASE PERFORMANCE
    // ======================================

    if(
    typeof updateBasePerformance ===
    "function"
){

    updateBasePerformance();

}


// ==============================================
// WAIT FOR BASE CHART TO FULLY REFRESH
// ==============================================

if(
    typeof baseRankingChart !==
    "undefined" &&
    baseRankingChart
){

    baseRankingChart.update(
        "none"
    );

}


await new Promise(
    resolve =>
        requestAnimationFrame(
            ()=>resolve()
        )
);


await new Promise(
    resolve =>
        setTimeout(
            resolve,
            500
        )
);


// ======================================
// REGIONAL VIEW
// ======================================

// Guardar também o país globalmente
selectedCountry =
    country;


// ======================================
// COUNTRY KPI CARDS
// ======================================

if(
    typeof updateRegionalCards ===
    "function"
){

    updateRegionalCards(
        country
    );

}


// ======================================
// COUNTRY DONUT CHARTS
// ======================================

if(
    typeof updateRegionalPieCharts ===
    "function"
){

    updateRegionalPieCharts(
        country
    );

}


// ======================================
// DELAY CODES + DELAY GROUPS
// ======================================

if(
    typeof updateRegionalDelayCharts ===
    "function"
){

    updateRegionalDelayCharts(
        country
    );

}


// ======================================
// TOP DELAY
// ======================================

if(
    typeof updateRegionalTopDelay ===
    "function"
){

    updateRegionalTopDelay(
        country
    );

}


// ======================================
// COUNTRY LABEL
// ======================================

const countryLabel =
    document.getElementById(
        "selectedCountryLabel"
    );


if(countryLabel){

    countryLabel.textContent =
        country === "ALL"
            ? "ALL COUNTRIES"
            : country.toUpperCase();

}


// ======================================
// MAP
// ======================================

if(
    typeof updateMapSelection ===
    "function"
){

    updateMapSelection(
        country
    );

}
   


    // ======================================
    // BASE ANALYSIS
    // ======================================

    const analysisBase =
        document.getElementById(
            "analysisBase"
        );


    if(analysisBase && base){

        analysisBase.value =
            base;

    }


    if(
    typeof updateBaseAnalysis ===
    "function"
){

    updateBaseAnalysis();

}


if(
    typeof updateBaseHistoryChart ===
    "function"
){

    updateBaseHistoryChart();

}


// ======================================
// UPDATE TOP DELAY CODES TABLE
// ======================================

if(
    typeof updateTopDelayCodes ===
    "function"
){

    updateTopDelayCodes();

}


    if(
        typeof updateOperationalTrends ===
        "function"
    ){

        updateOperationalTrends();

    }


    if(
        typeof updateDelayCharts ===
        "function"
    ){

        updateDelayCharts(
            currentStats
        );

    }


    if(
        typeof updateDelayGroupsChart ===
        "function"
    ){

        updateDelayGroupsChart(
            currentStats
        );

    }


    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                700
            )
    );

}


// ======================================================
// SAVE CURRENT UI STATE
// ======================================================

function getFwdExportOriginalState(){

    return {

        period:
            document.getElementById(
                "dashboardPeriod"
            )?.value,

        country:
            document.getElementById(
                "baseCountryFilter"
            )?.value,

        sort:
            document.getElementById(
                "baseSort"
            )?.value,

        delayCode:
            document.getElementById(
                "delayCodeSelector"
            )?.value,

        delayGroup:
            document.getElementById(
                "delayGroupSelector"
            )?.value,

        analysisBase:
            document.getElementById(
                "analysisBase"
            )?.value,

        showZero:
            document.getElementById(
                "showZeroBases"
            )?.checked

    };

}


// ======================================================
// RESTORE CURRENT UI STATE
// ======================================================

async function restoreFwdExportOriginalState(
    state
){

    if(!state)
        return;


    const period =
        document.getElementById(
            "dashboardPeriod"
        );


    if(
        period &&
        state.period &&
        period.value !== state.period
    ){

        period.value =
            state.period;


        const [year,month] =
            state.period
                .split("-")
                .map(Number);


        await updateFWDDashboard(
            year,
            month
        );

    }


    const country =
        document.getElementById(
            "baseCountryFilter"
        );


    if(country){

        country.value =
            state.country || "ALL";

    }


    const sort =
        document.getElementById(
            "baseSort"
        );


    if(sort){

        sort.value =
            state.sort;

    }


    const code =
        document.getElementById(
            "delayCodeSelector"
        );


    if(code && state.delayCode){

        code.value =
            state.delayCode;

    }


    const group =
        document.getElementById(
            "delayGroupSelector"
        );


    if(group && state.delayGroup){

        group.value =
            state.delayGroup;

    }


    const zero =
        document.getElementById(
            "showZeroBases"
        );


    if(zero){

        zero.checked =
            state.showZero;

    }


    const analysisBase =
        document.getElementById(
            "analysisBase"
        );


    if(
        analysisBase &&
        state.analysisBase
    ){

        analysisBase.value =
            state.analysisBase;

    }


    if(
        typeof updateBasePerformance ===
        "function"
    ){

        updateBasePerformance();

    }


    if(
        typeof updateBaseAnalysis ===
        "function"
    ){

        updateBaseAnalysis();

    }


    if(
        typeof updateBaseHistoryChart ===
        "function"
    ){

        updateBaseHistoryChart();

    }


    if(
        typeof updateOperationalTrends ===
        "function"
    ){

        updateOperationalTrends();

    }


    if(
        typeof updateRegionalCards ===
        "function"
    ){

        updateRegionalCards(
            state.country || "ALL"
        );

    }


    if(
        typeof updateRegionalDelayCharts ===
        "function"
    ){

        updateRegionalDelayCharts(
            state.country || "ALL"
        );

    }


    if(
        typeof updateRegionalTopDelay ===
        "function"
    ){

        updateRegionalTopDelay(
            state.country || "ALL"
        );

    }


    if(
        typeof updateMapSelection ===
        "function"
    ){

        updateMapSelection(
            state.country || "ALL"
        );

    }

}


// ======================================================
// PDF SECTION VISIBILITY
// ======================================================

function getFwdExportSections(){

    const selected = [];

    document
        .querySelectorAll(
            "#fwdExportModal input[type='checkbox'][value]"
        )
        .forEach(input=>{

            if(input.checked){

                selected.push(
                    input.value
                );

            }

        });


    // IMPORTANT:
    // We use the REAL dashboard sections.
    // Nothing is recreated for the PDF.

    const map = {

        exec:
            document.querySelector(
                ".exec-section"
            ),

        region:
            document.querySelector(
                ".region-section"
            ),

        base:
            document.querySelector(
                ".base-section"
            ),

        analysis:
            document.querySelector(
                ".analysis-section"
            ),

        trend:
            document.querySelector(
                ".trend-section"
            ),

        insight:
            document.querySelector(
                ".insight-section"
            ),

        explorer:
            document.querySelector(
                ".explorer-section"
            )

    };


    return selected
        .map(key => map[key])
        .filter(section => section);

}


// ======================================================
// PREPARE DASHBOARD FOR PDF
// ======================================================

function prepareFwdPdfDashboard(){

    const elements = [

        ".region-filters",

        ".base-filters",

        ".analysis-filters",

        ".trend-filters",

        ".explorer-toolbar",

        ".zero-toggle",

        "#delayCodeFilter",

        "#delayGroupFilter"

    ];


    const hidden = [];


    elements.forEach(selector=>{

        document
            .querySelectorAll(selector)
            .forEach(element=>{

                hidden.push({

                    element,

                    display:
                        element.style.display

                });


                element.style.display =
                    "none";

            });

    });


    return hidden;

}


// ======================================================
// RESTORE DASHBOARD
// ======================================================

function restoreFwdPdfDashboard(hidden){

    hidden.forEach(item=>{

        item.element.style.display =
            item.display;

    });

}


// ======================================================
// PREPARE BASE / TREND PDF CONTENT
// ======================================================

function prepareFwdPdfSectionContent(section){

    const changes = [];

    // ==============================================
    // BASE PERFORMANCE
    // ==============================================

    if(
        section.classList &&
        section.classList.contains("base-section")
    ){

        const sort =
            document.getElementById(
                "baseSort"
            );

        const delayCode =
            document.getElementById(
                "delayCodeSelector"
            );

        const delayGroup =
            document.getElementById(
                "delayGroupSelector"
            );


        let metric =
            sort
                ?.selectedOptions[0]
                ?.textContent
                ?.trim()
            || "First Wave Delays";


        // More descriptive names for filtered metrics

        if(
            sort?.value === "delayCode" &&
            delayCode?.selectedOptions[0]
        ){

            metric =
                `Delay Code — ${
                    delayCode
                        .selectedOptions[0]
                        .textContent
                        .trim()
                }`;

        }


        if(
            sort?.value === "delayGroup" &&
            delayGroup?.selectedOptions[0]
        ){

            metric =
                `Delay Group — ${
                    delayGroup
                        .selectedOptions[0]
                        .textContent
                        .trim()
                }`;

        }


        // Create metric label

        const rankingHeader =
            section.querySelector(
                ".ranking-header"
            );


        if(rankingHeader){

            const metricLabel =
                document.createElement(
                    "div"
                );


            metricLabel.id =
                "fwdPdfMetricLabel";


            metricLabel.style.cssText = `

                margin-top:6px;

                margin-bottom:10px;

                color:#6B7280;

                font-size:13px;

                font-weight:600;

                letter-spacing:.3px;

            `;


            metricLabel.textContent =
                `Metric: ${metric}`;


            rankingHeader.insertAdjacentElement(
                "afterend",
                metricLabel
            );


            changes.push(
                metricLabel
            );

        }


        // ==========================================
        // FORCE ZERO VALUES
        // ==========================================

        const zeroToggle =
            document.getElementById(
                "showZeroBases"
            );


        if(zeroToggle){

            changes.push({

                type:"checkbox",

                element:zeroToggle,

                checked:
                    zeroToggle.checked

            });


            zeroToggle.checked =
                true;


            // ==========================================
// FORCE BASE PERFORMANCE METRIC FOR PDF
// ==========================================

updateBasePerformance();


const pdfSort =
    document.getElementById(
        "baseSort"
    )?.value;


if(
    typeof baseRankingChart !==
    "undefined" &&
    baseRankingChart
){

    const selectedCountry =
        document.getElementById(
            "baseCountryFilter"
        )?.value || "ALL";


    let pdfRanking =
        BASES.map(base => [

            base,

            currentStats
                ?.baseStats?.[base]

        ]);


    // ------------------------------------------
    // COUNTRY FILTER
    // ------------------------------------------

    if(
        selectedCountry !==
        "ALL"
    ){

        pdfRanking =
            pdfRanking.filter(
                ([base]) =>
                    BASE_COUNTRIES[base] ===
                    selectedCountry
            );

    }


    // ------------------------------------------
    // SORT
    // ------------------------------------------

    pdfRanking.sort(
        (a,b)=>{

            switch(pdfSort){

                case "averageDelayTime":

                    return (
                        (b[1]?.averageDelayMinutes || 0) -
                        (a[1]?.averageDelayMinutes || 0)
                    );


                case "maxDelayTime":

                    return (
                        (b[1]?.maxDelayMinutes || 0) -
                        (a[1]?.maxDelayMinutes || 0)
                    );


                case "nightStops":

                    return (
                        (b[1]?.nightStops || 0) -
                        (a[1]?.nightStops || 0)
                    );


                case "rate":

                    return (
                        (b[1]?.rate || 0) -
                        (a[1]?.rate || 0)
                    );


                case "fwdPerDay":

                    return (
                        (
                            b[1]?.activeDays
                                ? b[1].fwd /
                                  b[1].activeDays
                                : 0
                        )
                        -
                        (
                            a[1]?.activeDays
                                ? a[1].fwd /
                                  a[1].activeDays
                                : 0
                        )
                    );


                case "nightStopsPerDay":

                    return (
                        (
                            b[1]?.activeDays
                                ? b[1].nightStops /
                                  b[1].activeDays
                                : 0
                        )
                        -
                        (
                            a[1]?.activeDays
                                ? a[1].nightStops /
                                  a[1].activeDays
                                : 0
                        )
                    );


                default:

                    return (
                        (b[1]?.fwd || 0) -
                        (a[1]?.fwd || 0)
                    );

            }

        }
    );


    // ------------------------------------------
    // VALUES FOR PDF CHART
    // ------------------------------------------

    const pdfLabels =
        pdfRanking.map(
            ([base]) => base
        );


    const pdfValues =
        pdfRanking.map(
            ([base,data])=>{

                switch(pdfSort){

                    case "averageDelayTime":

                        return Number(
                            data?.averageDelayMinutes || 0
                        );


                    case "maxDelayTime":

                        return Number(
                            data?.maxDelayMinutes || 0
                        );


                    case "nightStops":

                        return Number(
                            data?.nightStops || 0
                        );


                    case "rate":

                        return Number(
                            data?.rate || 0
                        );


                    case "fwdPerDay":

                        return Number(

                            data?.activeDays
                                ? data.fwd /
                                  data.activeDays
                                : 0

                        );


                    case "nightStopsPerDay":

                        return Number(

                            data?.activeDays
                                ? data.nightStops /
                                  data.activeDays
                                : 0

                        );


                    default:

                        return Number(
                            data?.fwd || 0
                        );

                }

            }
        );


    // ------------------------------------------
    // FORCE CHART DATA
    // ------------------------------------------

    baseRankingChart.data.labels =
        pdfLabels;


    baseRankingChart.data.datasets[0].data =
        pdfValues;


    baseRankingChart.update(
        "none"
    );

}

        }

    }


   
}

// ======================================================
// CAPTURE FWD PDF SECTION
// ======================================================

async function captureFwdPdfSection(section){

    if(!section){

        throw new Error(
            "FWD_PDF_SECTION_NOT_FOUND"
        );

    }


    // ==================================================
    // SPECIAL COUNTRY OVERVIEW HANDLING
    // ==================================================

    if(
        section.classList &&
        section.classList.contains("region-section")
    ){

        return await captureFwdCountryOverview(
            section
        );

    }


    // ==================================================
    // TEMPORARY PDF CHANGES
    // ==================================================

    const temporaryElements = [];

    let zeroCheckbox = null;
    let originalZeroState = null;


    // ==================================================
    // BASE PERFORMANCE
    // ==================================================

    if(
        section.classList &&
        section.classList.contains("base-section")
    ){

        // ----------------------------------------------
        // SHOW ZERO VALUES
        // ----------------------------------------------

        zeroCheckbox =
            document.getElementById(
                "showZeroBases"
            );

        if(zeroCheckbox){

    originalZeroState =
        zeroCheckbox.checked;

    zeroCheckbox.checked = true;


    if(
        typeof updateBasePerformance ===
        "function"
    ){

        updateBasePerformance();

    }


    // ==========================================
    // FORCE BASE CHART TO FINISH REDRAWING
    // ==========================================

    if(
        typeof baseRankingChart !==
        "undefined" &&
        baseRankingChart
    ){

        baseRankingChart.update("none");

        baseRankingChart.resize();

        baseRankingChart.update("none");

    }


    // Give Chart.js time to render the zero values

    await new Promise(
        resolve =>
            requestAnimationFrame(
                ()=>resolve()
            )
    );


    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                200
            )
    );

}


        // ----------------------------------------------
        // FIND SELECTED METRIC
        // ----------------------------------------------

        const sortSelect =
            document.getElementById(
                "baseSort"
            );


        let metric =
            sortSelect
                ?.selectedOptions?.[0]
                ?.textContent
                ?.trim()
            || "First Wave Delays";


        // ----------------------------------------------
        // CREATE METRIC LABEL
        // ----------------------------------------------

        const metricLabel =
            document.createElement(
                "div"
            );


        metricLabel.style.cssText = `

            font-size:14px;

            font-weight:600;

            color:#6B7280;

            margin-top:4px;

            margin-bottom:12px;

        `;


        metricLabel.textContent =
            `Metric: ${metric}`;


        const rankingTitle =
            section.querySelector(
                ".ranking-header"
            );


        if(rankingTitle){

            rankingTitle.insertAdjacentElement(
                "afterend",
                metricLabel
            );

        }
        else{

            section.prepend(
                metricLabel
            );

        }


        temporaryElements.push(
            metricLabel
        );

    }


    // ==================================================
    // TREND ANALYSIS
    // ==================================================

    if(
        section.classList &&
        section.classList.contains("trend-section")
    ){

        const trendTitle =
            document.createElement(
                "div"
            );


        trendTitle.style.cssText = `

            font-size:26px;

    font-weight:800;

    color:#07225B;

    margin-bottom:18px;

    padding-bottom:10px;

`;


        trendTitle.textContent =
            "Trend Analysis";

const underline =
    document.createElement(
        "div"
    );


underline.style.cssText = `

    width:70px;

    height:4px;

    background:#F1C400;

    border-radius:4px;

    margin-top:-12px;

    margin-bottom:18px;

`;


        const firstChild =
            section.firstElementChild;


        if(firstChild){

    section.insertBefore(
        trendTitle,
        firstChild
    );

    section.insertBefore(
        underline,
        trendTitle.nextSibling
    );

}
else{

    section.appendChild(
        trendTitle
    );

    section.appendChild(
        underline
    );

}


        temporaryElements.push(
    trendTitle,
    underline
);

    }


    // ==================================================
    // NORMAL SECTION
    // ==================================================

    const originalDisplay =
        section.style.display;

    const originalVisibility =
        section.style.visibility;


    section.style.display =
        "block";

    section.style.visibility =
        "visible";


    section.getBoundingClientRect();


    await new Promise(
        resolve =>
            requestAnimationFrame(
                ()=>resolve()
            )
    );


    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                300
            )
    );


    let canvas;


    try{

        canvas =
            await html2canvas(
                section,
                {

                    scale:4,

                    useCORS:true,

                    allowTaint:true,

                    backgroundColor:
                        "#FFFFFF",

                    logging:false,

                    scrollX:0,

                    scrollY:-window.scrollY,

                    windowWidth:
                        Math.max(
                            document.documentElement.scrollWidth,
                            section.scrollWidth
                        ),

                    windowHeight:
                        Math.max(
                            document.documentElement.scrollHeight,
                            section.scrollHeight
                        )

                }
            );

    }

    finally{

        // ==============================================
        // RESTORE ORIGINAL SECTION STATE
        // ==============================================

        section.style.display =
            originalDisplay;

        section.style.visibility =
            originalVisibility;


        // ==============================================
        // RESTORE ZERO CHECKBOX
        // ==============================================

        if(
    zeroCheckbox &&
    originalZeroState !== null
){

    zeroCheckbox.checked =
        originalZeroState;


    if(
        typeof updateBasePerformance ===
        "function"
    ){

        updateBasePerformance();

    }

}


        // ==============================================
        // REMOVE TEMPORARY ELEMENTS
        // ==============================================

        temporaryElements.forEach(
            element => {

                if(
                    element &&
                    element.parentNode
                ){

                    element.remove();

                }

            }
        );

    }


    return canvas;

}


// ======================================================
// COUNTRY OVERVIEW PDF
// ======================================================

async function captureFwdCountryOverview(section){

    const country =
        document.getElementById(
            "fwdExportCountry"
        )?.value || "ALL";


    const countryLabel =
    country === "ALL"
        ? "ALL COUNTRIES"
        : country.toUpperCase();

// ==============================================
// COUNTRY DATA FOR PDF
// ==============================================

const countryStats =
    currentStats?.countryStats?.[country] || {};

const pdfCountryBases =
    country === "ALL"
        ? BASES.length
        : BASES.filter(
            base => BASE_COUNTRIES[base] === country
          ).length;

const pdfCountryFwd =
    country === "ALL"
        ? currentStats?.totalFWD || 0
        : countryStats.fwd || 0;

const pdfCountryNightStops =
    country === "ALL"
        ? currentStats?.totalNightStops || 0
        : countryStats.nightStops || 0;

const pdfCountryRate =
    pdfCountryNightStops > 0
        ? (
            pdfCountryFwd /
            pdfCountryNightStops *
            100
          ).toFixed(1) + "%"
        : "0.0%";


    // ==============================================
    // CREATE TEMPORARY PDF CONTAINER
    // ==============================================

    const pdfSection =
        document.createElement("div");


    pdfSection.style.cssText = `

        width:1800px;

        padding:35px;

        background:#FFFFFF;

        box-sizing:border-box;

        font-family:
            'Segoe UI',
            Arial,
            sans-serif;

        color:#073590;

    `;


    // ==============================================
    // TITLE
    // ==============================================

    pdfSection.innerHTML = `

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:25px;
        ">

            <div>

                <div style="
                    font-size:30px;
                    font-weight:800;
                    color:#07225B;
                ">
                    Country Overview
                </div>

                <div style="
                    margin-top:5px;
                    font-size:15px;
                    color:#7A8599;
                ">
                    First Wave Delays — Country Performance
                </div>

            </div>


            <div style="
                background:#073590;
                color:#FFFFFF;
                padding:12px 22px;
                border-radius:12px;
                font-size:15px;
                font-weight:800;
            ">

                ${countryLabel}

            </div>

        </div>


        <!-- KPI CARDS -->

        <div
            style="
                display:grid;
                grid-template-columns:
                    repeat(4,1fr);
                gap:18px;
                margin-bottom:25px;
            "
        >

            ${createFwdPdfKpi(
    "BASES",
    pdfCountryBases
)}

${createFwdPdfKpi(
    "TOTAL FWD",
    pdfCountryFwd.toLocaleString()
)}

${createFwdPdfKpi(
    "TOTAL NIGHT STOPS",
    pdfCountryNightStops.toLocaleString()
)}

${createFwdPdfKpi(
    "FWD RATE",
    pdfCountryRate
)}

        </div>


        <!-- DELAY ANALYSIS -->

        <div
            style="
                display:grid;
                grid-template-columns:
                    1.25fr 1fr;
                gap:20px;
                margin-bottom:25px;
            "
        >

            <div
                style="
                    background:#FFFFFF;
                    border:1px solid #E3E8F0;
                    border-top:5px solid #F1C400;
                    border-radius:16px;
                    padding:22px;
                    box-sizing:border-box;
                "
            >

                <div style="
                    font-size:20px;
                    font-weight:800;
                    color:#073590;
                    margin-bottom:15px;
                ">
                    TOP STANDARD IATA DELAY CODES
                </div>

                <div
                    id="fwdPdfDelayCodes"
                    style="
                        height:360px;
                    "
                ></div>

            </div>


            <div
                style="
                    background:#FFFFFF;
                    border:1px solid #E3E8F0;
                    border-top:5px solid #073590;
                    border-radius:16px;
                    padding:22px;
                    box-sizing:border-box;
                "
            >

                <div style="
                    font-size:20px;
                    font-weight:800;
                    color:#073590;
                    margin-bottom:15px;
                ">
                    DELAY GROUPS DISTRIBUTION
                </div>

                <div
                    id="fwdPdfDelayGroups"
                    style="
                        height:360px;
                    "
                ></div>

            </div>

        </div>


        <!-- COUNTRY DONUTS -->

        <div
            style="
                display:grid;
                grid-template-columns:
                    1fr 1fr;
                gap:20px;
            "
        >

            <div
                style="
                    background:#FFFFFF;
                    border:1px solid #E3E8F0;
                    border-top:5px solid #F1C400;
                    border-radius:16px;
                    padding:22px;
                    box-sizing:border-box;
                "
            >

                <div style="
                    font-size:20px;
                    font-weight:800;
                    color:#073590;
                    margin-bottom:10px;
                ">
                    FWD PER COUNTRY (%)
                </div>

                <div
                    id="fwdPdfCountryFwd"
                    style="
                        height:390px;
                        display:flex;
                        justify-content:center;
                    "
                ></div>

            </div>


            <div
                style="
                    background:#FFFFFF;
                    border:1px solid #E3E8F0;
                    border-top:5px solid #073590;
                    border-radius:16px;
                    padding:22px;
                    box-sizing:border-box;
                "
            >

                <div style="
                    font-size:20px;
                    font-weight:800;
                    color:#073590;
                    margin-bottom:10px;
                ">
                    NIGHT-STOP AIRCRAFT PER COUNTRY (%)
                </div>

                <div
                    id="fwdPdfCountryNs"
                    style="
                        height:390px;
                        display:flex;
                        justify-content:center;
                    "
                ></div>

            </div>

        </div>

    `;


    document.body.appendChild(
        pdfSection
    );


// ==============================================
// FORCE COUNTRY CHART REFRESH
// ==============================================

if(
    typeof updateRegionalDelayCharts ===
    "function"
){

    updateRegionalDelayCharts(
        country
    );

}

if(
    typeof updateRegionalPieCharts ===
    "function"
){

    updateRegionalPieCharts(
        country
    );

}

await new Promise(
    resolve =>
        setTimeout(
            resolve,
            500
        )
);

    // ==============================================
// REFRESH COUNTRY DATA FOR PDF
// ==============================================

if(
    typeof updateRegionalDelayCharts ===
    "function"
){

    updateRegionalDelayCharts(
        country
    );

}


if(
    typeof updateRegionalPieCharts ===
    "function"
){

    updateRegionalPieCharts(
        country
    );

}


// Wait for Chart.js to finish updating

await new Promise(
    resolve =>
        setTimeout(
            resolve,
            1200
        )
);


// ==============================================
// COUNTRY DELAY CODES TABLE
// ==============================================

const delayCodesContainer =
    pdfSection.querySelector(
        "#fwdPdfDelayCodes"
    );


if(delayCodesContainer){

    delayCodesContainer.innerHTML =
        createFwdPdfDelayCodesTable(
            country
        );

}


// ==============================================
// COPY COUNTRY CHARTS
// ==============================================

await insertFwdPdfChart(
    pdfSection,
    "fwdPdfDelayGroups",
    "regionalDelayGroupsChart"
);


await insertFwdPdfChart(
    pdfSection,
    "fwdPdfCountryFwd",
    "countryFwdChart"
);


await insertFwdPdfChart(
    pdfSection,
    "fwdPdfCountryNs",
    "countryNsChart"
);


    // ==============================================
    // FORCE LAYOUT
    // ==============================================

    pdfSection.getBoundingClientRect();


    await new Promise(
        resolve =>
            requestAnimationFrame(
                ()=>resolve()
            )
    );


    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                300
            )
    );


    // ==============================================
    // CAPTURE
    // ==============================================

    let canvas;


    try{

        canvas =
            await html2canvas(
                pdfSection,
                {

                    scale:4,

                    useCORS:true,

                    allowTaint:true,

                    backgroundColor:
                        "#FFFFFF",

                    logging:false,

                    scrollX:0,

                    scrollY:0

                }
            );

    }

    finally{

        pdfSection.remove();

    }


    return canvas;

}

// ======================================================
// COUNTRY DELAY CODES TABLE FOR PDF
// ======================================================

function createFwdPdfDelayCodesTable(country){

    let performance = {};


    // ==============================================
    // GET COUNTRY-SPECIFIC PERFORMANCE
    // ==============================================

    if(country === "ALL"){

        Object.values(
            stats.countryStats || {}
        )
        .forEach(countryData=>{

            Object.entries(
                countryData.delayCodePerformance || {}
            )
            .forEach(
                ([code,data])=>{

                    if(!performance[code]){

                        performance[code] = {

                            events:0,

                            timedEvents:0,

                            totalMinutes:0,

                            averageMinutes:0,

                            maxMinutes:0,

                            maxBase:null

                        };

                    }


                    performance[code].events +=
                        data.events || 0;


                    performance[code].timedEvents +=
                        data.timedEvents || 0;


                    performance[code].totalMinutes +=
                        data.totalMinutes || 0;


                    // Guardar o maior atraso
                    if(
                        (data.maxMinutes || 0) >
                        performance[code].maxMinutes
                    ){

                        performance[code].maxMinutes =
                            data.maxMinutes || 0;

                        performance[code].maxBase =
                            data.maxBase || null;

                    }

                }
            );

        });

    }
    else{

        performance =
            stats
                .countryStats?.[country]
                ?.delayCodePerformance
                || {};

    }


    // ==============================================
    // CALCULATE AVERAGES
    // ==============================================

    Object.values(
        performance
    )
    .forEach(data=>{

        data.averageMinutes =
            data.timedEvents > 0

                ? data.totalMinutes /
                  data.timedEvents

                : 0;

    });


    // ==============================================
    // SORT BY AVERAGE RESOLUTION
    // ==============================================

    const entries =
        Object.entries(performance)
        .sort(
            (a,b)=>
                b[1].averageMinutes -
                a[1].averageMinutes
        );


    // ==============================================
    // EMPTY STATE
    // ==============================================

    if(!entries.length){

        return `

            <div style="
                padding:35px 20px;
                text-align:center;
                color:#7A8599;
                font-size:14px;
            ">

                No delay codes recorded.

            </div>

        `;

    }


    // ==============================================
    // TABLE
    // ==============================================

    let html = `

        <div style="
            width:100%;
            border:1px solid #E3E8F0;
            border-radius:12px;
            overflow:hidden;
        ">

            <div style="
                display:grid;
                grid-template-columns:
                    80px 90px 130px 130px 110px;

                background:#073590;
                color:#FFFFFF;

                font-size:12px;
                font-weight:800;

                padding:12px 14px;
            ">

                <div>CODE</div>

                <div style="
                    text-align:center;
                ">
                    EVENTS
                </div>

                <div style="
                    text-align:center;
                ">
                    AVG. DELAY
                </div>

                <div style="
                    text-align:center;
                ">
                    MAX. DELAY
                </div>

                <div style="
                    text-align:center;
                ">
                    BASE - MAX
                </div>

            </div>

    `;


    entries.forEach(
        ([code,data])=>{

            const hasTime =
                Number(data.timedEvents) > 0;


            html += `

                <div style="
                    display:grid;
                    grid-template-columns:
                        80px 90px 130px 130px 110px;

                    padding:12px 14px;

                    border-bottom:
                        1px solid #E8EDF3;

                    font-size:13px;

                    color:#07225B;

                    align-items:center;
                ">


                    <!-- CODE -->

                    <div>

                        <span style="
                            display:inline-block;

                            background:#073590;

                            color:#FFFFFF;

                            border-radius:7px;

                            padding:4px 9px;

                            font-weight:800;

                            font-size:11px;
                        ">
                            ${code}
                        </span>

                    </div>


                    <!-- EVENTS -->

                    <div style="
                        text-align:center;

                        color:#FDB813;

                        font-weight:800;
                    ">

                        ${data.events || 0}

                    </div>


                    <!-- AVG -->

                    <div style="
                        text-align:center;

                        font-weight:800;
                    ">

                        ${
                            hasTime
                                ? `${Math.round(
                                    data.averageMinutes
                                  )} min`
                                : "-"
                        }

                    </div>


                    <!-- MAX -->

                    <div style="
                        text-align:center;

                        color:${
                            hasTime
                                ? "#C0392B"
                                : "#7A8599"
                        };

                        font-weight:800;
                    ">

                        ${
                            hasTime
                                ? `${Math.round(
                                    data.maxMinutes
                                  )} min`
                                : "-"
                        }

                    </div>


                    <!-- BASE MAX -->

                    <div style="
                        text-align:center;

                        font-weight:800;
                    ">

                        ${
                            hasTime &&
                            data.maxBase
                                ? data.maxBase
                                : "-"
                        }

                    </div>

                </div>

            `;

        }
    );


    html += `

        </div>

    `;


    return html;

}

// ======================================================
// PDF KPI CARD
// ======================================================

function createFwdPdfKpi(
    label,
    value
){

    return `

        <div
            style="
                background:#F8FAFD;

                border:1px solid #E1E7F0;

                border-top:
                    5px solid #F1C400;

                border-radius:14px;

                padding:20px;

                min-height:100px;

                box-sizing:border-box;
            "
        >

            <div
                style="
                    color:#7A8599;

                    font-size:12px;

                    font-weight:800;

                    letter-spacing:.5px;

                    text-transform:uppercase;
                "
            >
                ${label}
            </div>


            <div
                style="
                    margin-top:12px;

                    color:#073590;

                    font-size:30px;

                    font-weight:800;
                "
            >
                ${value}
            </div>

        </div>

    `;

}

// ======================================================
// INSERT EXISTING CHART INTO PDF
// ======================================================

async function insertFwdPdfChart(
    container,
    targetId,
    canvasId
){

    const target =
        container.querySelector(
            "#" + targetId
        );


    const source =
        document.getElementById(
            canvasId
        );


    if(
        !target ||
        !source
    ){

        return;

    }


    try{

        const image =
            document.createElement(
                "img"
            );


        image.src =
            source.toDataURL(
                "image/png"
            );


        image.style.cssText = `

            display:block;

            width:auto;

            height:100%;

            max-width:100%;

            object-fit:contain;

        `;


        target.appendChild(
            image
        );


    }

    catch(error){

        console.warn(
            "Unable to export chart:",
            canvasId,
            error
        );

    }

}

// ======================================================
// CAPTURE PDF HEADER
// ======================================================

async function captureFwdPdfHeader(){

    const header =
        document.getElementById(
            "fwdPdfReportHeader"
        );


    if(!header)
        return null;


    header.style.display =
        "block";

    header.style.position =
        "absolute";

    header.style.left =
        "-99999px";

    header.style.top =
        "0";


    const canvas =
        await html2canvas(
            header,
            {

                scale:4,

                useCORS:true,

                allowTaint:true,

                backgroundColor:
                    "#07225B",

                logging:false

            }
        );


    header.style.display =
        "none";

    header.style.position =
        "";

    header.style.left =
        "";

    header.style.top =
        "";


    return canvas;

}


// ======================================================
// BUILD PDF PAGE
// ======================================================

async function addFwdPdfPage(

    pdf,

    headerCanvas,

    sectionCanvas,

    pageNumber,

    totalPages

){

    const pageWidth =
        pdf.internal.pageSize.getWidth();

    const pageHeight =
        pdf.internal.pageSize.getHeight();


    const margin = 5;


    const usableWidth =
        pageWidth -
        margin * 2;


    const usableHeight =
        pageHeight -
        margin * 2;


    const targetWidth =
        1800;


    const headerWidth =
        targetWidth;


    const headerHeight =
        Math.round(

            headerCanvas.height *

            headerWidth /

            headerCanvas.width

        );


    const sectionWidth =
        targetWidth;


    const sectionHeight =
        Math.round(

            sectionCanvas.height *

            sectionWidth /

            sectionCanvas.width

        );


    const totalHeight =
        headerHeight +
        sectionHeight;


    /*
       Create combined canvas.
       This preserves:
       - SVG map
       - Chart.js charts
       - tables
       - dashboard styling
    */

    const combined =
        document.createElement(
            "canvas"
        );


    combined.width =
        targetWidth;


    combined.height =
        totalHeight;


    const ctx =
        combined.getContext(
            "2d"
        );


    ctx.fillStyle =
        "#FFFFFF";


    ctx.fillRect(
        0,
        0,
        combined.width,
        combined.height
    );


    ctx.drawImage(

        headerCanvas,

        0,
        0,

        headerWidth,
        headerHeight

    );


    ctx.drawImage(

        sectionCanvas,

        0,
        headerHeight,

        sectionWidth,
        sectionHeight

    );


    const image =
        combined.toDataURL(
            "image/png"
        );


    let renderWidth =
        usableWidth;


    let renderHeight =
        combined.height *

        renderWidth /

        combined.width;


    if(
        renderHeight >
        usableHeight
    ){

        const ratio =
            usableHeight /
            renderHeight;


        renderWidth *=
            ratio;


        renderHeight *=
            ratio;

    }


    const x =
        (pageWidth -
            renderWidth) / 2;


    const y =
        (pageHeight -
            renderHeight) / 2;


    pdf.addImage(

        image,

        "PNG",

        x,
        y,

        renderWidth,
        renderHeight,

        "",

        "FAST"

    );


    // ======================================
    // FOOTER
    // ======================================

    pdf.setFont(
        "helvetica",
        "normal"
    );


    pdf.setFontSize(7);


    pdf.setTextColor(
        100,
        110,
        125
    );


    pdf.text(

        `Ryanair Engineering & Maintenance  •  FWD Report`,

        margin,

        pageHeight - 2.5

    );


    pdf.text(

        `Page ${pageNumber} of ${totalPages}`,

        pageWidth - margin,

        pageHeight - 2.5,

        {
            align:"right"
        }

    );

}


// ======================================================
// GENERATE FWD PDF
// ======================================================

async function generateFwdPDF(){

    const originalState =
        getFwdExportOriginalState();


    const selectedSections =
        getFwdExportSections();


    if(!selectedSections.length){

        showWarning(

            "No Sections Selected",

            "Please select at least one section for the report."

        );

        return;

    }


    closeFwdExportModal();


    showPDFLoading();


    let hidden = [];


    try{

        // ======================================
        // APPLY EXPORT FILTERS
        // ======================================

        await applyFwdExportFilters();

        // ======================================
// WAIT FOR REGIONAL CHARTS TO FINISH
// ======================================

await new Promise(
    resolve =>
        setTimeout(
            resolve,
            1200
        )
);


        // ======================================
        // PREPARE PDF HEADER
        // ======================================

        const periodSelect =
            document.getElementById(
                "fwdExportPeriod"
            );


        const country =
            document.getElementById(
                "fwdExportCountry"
            )?.value || "ALL";


        const base =
            document.getElementById(
                "fwdExportBase"
            )?.value || "-";


        const periodLabel =
            periodSelect
                ?.selectedOptions[0]
                ?.text ||
            "Unknown Period";


        document.getElementById(
            "fwdPdfPeriod"
        ).textContent =
            periodLabel;


        document.getElementById(
            "fwdPdfScope"
        ).textContent =

            country === "ALL"

                ? "All Countries"

                : `${country} • ${base}`;


        document.getElementById(
            "fwdPdfGenerated"
        ).textContent =

            new Date()
                .toLocaleString(
                    "en-GB"
                );


        // ======================================
        // HIDE DASHBOARD CONTROLS
        // ======================================

        hidden =
            prepareFwdPdfDashboard();


        // ======================================
        // WAIT FOR CHARTS / MAP
        // ======================================

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    500
                )
        );


        // ======================================
        // HEADER
        // ======================================

        const headerCanvas =
            await captureFwdPdfHeader();


        if(!headerCanvas){

            throw new Error(
                "FWD_PDF_HEADER_NOT_FOUND"
            );

        }


        // ======================================
        // CREATE PDF
        // ======================================

        const { jsPDF } =
            window.jspdf;


        const pdf =
            new jsPDF({

                orientation:
                    "landscape",

                unit:
                    "mm",

                format:
                    "a4",

                compress:
                    true

            });


        const totalPages =
            selectedSections.length;


        // ======================================
        // CAPTURE EACH SELECTED SECTION
        // ======================================

        for(

            let i = 0;

            i < selectedSections.length;

            i++

        ){

            updatePDFLoading(

                i + 1,

                totalPages

            );


            const section =
                selectedSections[i];


            const canvas =
                await captureFwdPdfSection(
                    section
                );


            if(i > 0){

                pdf.addPage(
                    "a4",
                    "landscape"
                );

            }


            await addFwdPdfPage(

                pdf,

                headerCanvas,

                canvas,

                i + 1,

                totalPages

            );

        }


        // ======================================
        // FILE NAME
        // ======================================

        const cleanPeriod =
            periodLabel

                .replace(
                    /[\/\\:*?"<>|]/g,
                    ""
                )

                .replace(
                    /\s+/g,
                    "_"
                );


        const cleanCountry =
            country

                .replace(
                    /[\/\\:*?"<>|]/g,
                    ""
                )

                .replace(
                    /\s+/g,
                    "_"
                );


        pdf.save(

            `Ryanair_FWD_Report_${cleanPeriod}_${cleanCountry}.pdf`

        );


        showSuccess(

            "PDF Generated",

            "The First Wave Delays report has been generated successfully."

        );


    }

    catch(error){

        console.error(
            "FWD PDF EXPORT ERROR:",
            error
        );


        showError(

            "PDF Export",

            "Unable to generate the First Wave Delays report."

        );

    }


    finally{

        // ======================================
        // RESTORE DASHBOARD
        // ======================================

        restoreFwdPdfDashboard(
            hidden
        );


        await restoreFwdExportOriginalState(
            originalState
        );


        hidePDFLoading();

    }

}


// ======================================================
// GLOBAL FUNCTIONS
// ======================================================

window.openFwdExportModal =
    openFwdExportModal;


window.closeFwdExportModal =
    closeFwdExportModal;


window.updateFwdExportBases =
    updateFwdExportBases;


window.generateFwdPDF =
    generateFwdPDF;


// ======================================================
// FWD RESET DATA
// ======================================================

function resetFwdData(){

    // ==============================================
    // GET CURRENT PERIOD
    // ==============================================

    const periodSelect =
        document.getElementById(
            "dashboardPeriod"
        );


    const period =
        periodSelect?.value;


    const periodLabel =
        periodSelect
            ?.selectedOptions?.[0]
            ?.textContent
            ?.trim()
        || period
        || "the selected period";


    if(!period){

        showWarning(
            "No Period Selected",
            "Please select a reporting period first."
        );

        return;

    }


    // ==============================================
    // FIRST CONFIRMATION
    // ==============================================

    showConfirmation(

        "Reset FWD Data",

        `You are about to permanently delete all First Wave Delay data for ${periodLabel}. This action cannot be undone.`,

        async ()=>{

            // ======================================
            // SECOND CONFIRMATION
            // ======================================

            showConfirmation(

                "Confirm Permanent Deletion",

                `Are you absolutely sure you want to delete ${periodLabel}? All FWD records for this period will be permanently removed.`,

                async ()=>{

                    await performFwdDataReset(
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

// ======================================================
// PERFORM FWD DATA RESET
// ======================================================

async function performFwdDataReset(
    period,
    periodLabel
){

    try{

        // ==========================================
        // LOADING
        // ==========================================

        showLoading();

        updateLoading(
            "Resetting FWD Data...",
            25,
            `Deleting ${periodLabel}...`
        );


        // ==========================================
        // FIREBASE PERIOD PATH
        // ==========================================

        const [
            year,
            month
        ] =
            period.split("-");


        const fwdPeriodPath =
            `${FWD_DATA_COLLECTION}/${year}/${String(month).padStart(2,"0")}`;


        await firebaseRemove(

            firebaseRef(
                database,
                fwdPeriodPath
            )

        );


        // ==========================================
        // REFRESH AVAILABLE FWD PERIODS
        // ==========================================

        updateLoading(
            "Resetting FWD Data...",
            45,
            "Updating available reporting periods..."
        );


        await loadAvailableDashboardPeriods();


        // ==========================================
        // SELECT LAST AVAILABLE PERIOD
        // ==========================================

        const dashboardSelector =
            document.getElementById(
                "dashboardPeriod"
            );


        if(
            dashboardSelector &&
            dashboardSelector.options.length > 0
        ){

            // The options are already sorted
            // by loadAvailableDashboardPeriods().
            // The last option is the oldest/
            // previous available reporting period.

            dashboardSelector.selectedIndex =
                dashboardSelector.options.length - 1;


            const selectedPeriod =
                dashboardSelector.value;


            if(selectedPeriod){

                const [
                    selectedYear,
                    selectedMonth
                ] =
                    selectedPeriod
                        .split("-")
                        .map(Number);


                // ==========================================
                // UPDATE CURRENT FWD PERIOD
                // ==========================================

                currentYear =
                    selectedYear;

                currentMonth =
                    selectedMonth;


                // ==========================================
                // LOAD SELECTED PERIOD
                // ==========================================

                updateLoading(
                    "Resetting FWD Data...",
                    60,
                    "Loading previous reporting period..."
                );


                await updateFWDDashboard(

                    selectedYear,

                    selectedMonth

                );

            }

        }
        else{

            // ==========================================
            // NO PERIODS REMAIN
            // ==========================================

            if(dashboardSelector){

                dashboardSelector.value = "";

            }

        }


        // ==========================================
        // AUDIT LOG
        // ==========================================

        await writeAuditLog(

            "RESET_FWD_DATA",

            `Deleted FWD data for ${periodLabel} (${period}).`

        );


        // ==========================================
        // REFRESH DASHBOARD
        // ==========================================

        updateLoading(
            "Refreshing Dashboard...",
            70,
            "Reloading First Wave Delay data..."
        );


        updateLoading(
            "Reset Complete",
            100,
            "FWD data successfully deleted."
        );


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    500
                )
        );


        hideLoading();


        // ==========================================
        // SUCCESS
        // ==========================================

        showSuccess(

            "FWD Data Reset",

            `${periodLabel} has been successfully deleted.`

        );

    }


    catch(error){

        console.error(
            "FWD Reset Error:",
            error
        );


        hideLoading();


        showError(

            "Reset Failed",

            "Unable to delete the selected FWD data."

        );

    }

}

async function captureNoInfoPdfHeader(){

    const header =
        document.getElementById(
            "noInfoPdfReportHeader"
        );


    if(!header)
        return null;


    header.style.display =
        "block";

    header.style.position =
        "absolute";

    header.style.left =
        "-99999px";

    header.style.top =
        "0";


    const canvas =
        await html2canvas(
            header,
            {

                scale:4,

                useCORS:true,

                allowTaint:true,

                backgroundColor:
                    "#07225B",

                logging:false

            }
        );


    header.style.display =
        "none";

    header.style.position =
        "";

    header.style.left =
        "";

    header.style.top =
        "";


    return canvas;

}

// ======================================================
// FWD EDIT VISUALS INFORMATION
// ======================================================

function openFwdEditVisuals(){

    const modal =
        document.getElementById(
            "fwdEditVisualsInfoModal"
        );


    if(modal){

        modal.style.display =
            "flex";

    }

}


function closeFwdEditVisualsInfo(){

    const modal =
        document.getElementById(
            "fwdEditVisualsInfoModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }

}

// ======================================================
// CREATE ACCOUNT FROM WELCOME
// ======================================================

function openCreateAccountModal(){

    closeWelcomeModal();

    openCreateUserModal("account");

}

// ======================================================
// CREATE ACCOUNT FROM WELCOME
// ======================================================

async function createAccountFromWelcome(){

    try{

        // ==========================================
        // READ FORM
        // ==========================================

        const fullName =
            document
                .getElementById("newUserFullName")
                .value
                .trim();


        const username =
            document
                .getElementById("newUserUsername")
                .value
                .trim()
                .toLowerCase();


        const password =
            document
                .getElementById("newUserPassword")
                .value;


        // ==========================================
        // PHOTO
        // ==========================================

        const photoFile =
            document
                .getElementById(
                    "createUserPhotoInput"
                )
                .files[0];


        let photo = null;


        if(photoFile){

            photo =
                await new Promise(
                    (resolve, reject) => {

                        const reader =
                            new FileReader();


                        reader.onload =
                            function(e){

                                resolve(
                                    e.target.result
                                );

                            };


                        reader.onerror =
                            function(){

                                reject(
                                    new Error(
                                        "PHOTO_READ_FAILED"
                                    )
                                );

                            };


                        reader.readAsDataURL(
                            photoFile
                        );

                    }
                );

        }


        // ==========================================
        // VALIDATION
        // ==========================================

        if(
            fullName === "" ||
            username === "" ||
            password === ""
        ){

            showError(
                "Missing Information",
                "Please complete all required fields."
            );

            return;

        }


        // ==========================================
        // CREATE USER
        // ROLE IS ALWAYS VIEWER
        // ==========================================

        const user =
            await createUser({

                fullName:

                    fullName,

                username:

                    username,

                password:

                    password,

                role:

                    USER_ROLES.VIEWER,

                createdBy:

                    "SELF_REGISTRATION",

                photo:

                    photo

            });


        // ==========================================
        // START SESSION
        // ==========================================

        CURRENT_USER =
            user;


        localStorage.setItem(

            SESSION_STORAGE_KEY,

            JSON.stringify({

                username:

                    username

            })

        );


        // ==========================================
        // RESET ACCOUNT MODE
        // ==========================================

        CREATE_ACCOUNT_MODE =
            false;


        // ==========================================
        // CLOSE CREATE ACCOUNT MODAL
        // ==========================================

        document.getElementById(
            "createUserModal"
        ).style.display =
            "none";


        // ==========================================
        // UPDATE USER INTERFACE
        // ==========================================

        updateUserInterface();


        // ==========================================
        // SHOW SUCCESS
        // ==========================================

        showSuccess(

            "Account Created",

            `Welcome to the Ryanair Engineering Dashboard, ${fullName}.`

        );

    }


    catch(error){

        console.error(
            "CREATE ACCOUNT ERROR:",
            error
        );


        // ==========================================
        // PHOTO ERROR
        // ==========================================

        if(
            error.message ===
            "PHOTO_READ_FAILED"
        ){

            showError(

                "Photo Upload Failed",

                "Unable to read the selected photo."

            );

            return;

        }


        // ==========================================
        // USERNAME ALREADY EXISTS
        // ==========================================

        if(
            error.message ===
            "USERNAME_ALREADY_EXISTS"
        ){

            showError(

                "Username Already Exists",

                "That username is already in use. Please choose another one."

            );

            return;

        }


        // ==========================================
        // GENERIC ERROR
        // ==========================================

        showError(

            "Account Creation Failed",

            "Unable to create your account. Please try again."

        );

    }

}

// ======================================================
// PREVIEW MY PROFILE PHOTO
// ======================================================

function previewMyProfilePhoto(event){

    const file =
        event.target.files[0];


    if(!file){

        return;

    }


    // ==========================================
    // VALIDATE IMAGE
    // ==========================================

    if(
        !file.type.startsWith(
            "image/"
        )
    ){

        showError(

            "Invalid Photo",

            "Please select a valid image file."

        );

        event.target.value = "";

        return;

    }


    // ==========================================
    // READ IMAGE
    // ==========================================

    const reader =
        new FileReader();


    reader.onload =
        function(e){

            const preview =
                document.getElementById(
                    "settingsProfilePhotoPreview"
                );


            const placeholder =
                document.getElementById(
                    "settingsProfilePhotoPlaceholder"
                );


            if(preview){

                preview.src =
                    e.target.result;

                preview.style.display =
                    "block";

            }


            if(placeholder){

                placeholder.style.display =
                    "none";

            }

        };


    reader.onerror =
        function(){

            showError(

                "Photo Error",

                "Unable to load the selected photo."

            );

            event.target.value = "";

        };


    reader.readAsDataURL(file);

}

// ======================================================
// GENERIC PDF TEXT EXTRACTION
// ======================================================

async function extractPDFText(file){

    // ==========================================
    // SAFETY
    // ==========================================

    if(!file){

        throw new Error(
            "NO_PDF_FILE"
        );

    }


    // ==========================================
    // CHECK PDF.JS
    // ==========================================

    const pdfjs =
        window.pdfjsLib;


    if(!pdfjs){

        throw new Error(
            "PDFJS_NOT_LOADED"
        );

    }


    // ==========================================
    // READ FILE
    // ==========================================

    const arrayBuffer =
        await file.arrayBuffer();


    const data =
        new Uint8Array(
            arrayBuffer
        );


    // ==========================================
    // OPEN PDF
    // ==========================================

    const pdf =
        await pdfjs
            .getDocument({
                data
            })
            .promise;


    // ==========================================
    // RESULT
    // ==========================================

    const pages = [];


    // ==========================================
    // READ EACH PAGE
    // ==========================================

    for(
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
    ){

        console.log(
            `Reading No Info PDF page ${pageNumber}/${pdf.numPages}...`
        );


        const page =
            await pdf.getPage(
                pageNumber
            );


        const textContent =
            await page.getTextContent();


        const text =
            textContent.items
                .map(
                    item =>
                        item.str || ""
                )
                .join(" ")
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


        pages.push({

            page:
                pageNumber,

            text:
                text

        });

    }


    // ==========================================
    // RESULT
    // ==========================================

    console.log(
        "NO INFO PDF TEXT EXTRACTED:",
        pages
    );


    return {

        pages:

            pages

    };

}

// ======================================================
// NO INFO PDF PARSER
// ======================================================

function parseNoInfoPDF(pdfData){

    // ==========================================
    // NORMALISE PDF PAGES
    // ==========================================

    const pages =
        Array.isArray(pdfData?.pages)

            ? pdfData.pages.map(page => ({

                number:
                    Number(page.page),

                text:
                    String(
                        page.text || ""
                    )
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim()

            }))

            : [];


    // ==========================================
    // EMPTY IMPORT STATE
    // ==========================================

    const imported = {

        month: "",

        totalDelays: "",

        averagePerBase: "",

        percentage: "",


        // ======================================
        // PORTUGAL
        // ======================================

        portugal: {

            FAO: "",
            FNC: "",
            LIS: "",
            OPO: "",
            total: ""

        },


        // ======================================
        // TOP 3
        // ======================================

        top3: [],


        // ======================================
        // ALL BASES
        // ======================================

        bases: [],


        // ======================================
        // COUNTRIES
        // ======================================

        countries: [],


        // ======================================
        // RAW
        // ======================================

        _raw: {}

    };


    // ==========================================
    // SAFETY
    // ==========================================

    if(!pages.length){

        return imported;

    }


    // ==========================================
    // NUMBER HELPER
    // ==========================================

    function parseNoInfoNumber(
        value
    ){

        if(
            value === null ||
            value === undefined ||
            value === ""
        ){

            return "";

        }


        return Number(
            String(value)
                .replace(",", ".")
        );

    }


    // ==========================================
    // PAGE HELPER
    // ==========================================

    function getPage(
        number
    ){

        return (

            pages.find(
                page =>
                    Number(page.number) ===
                    Number(number)
            )?.text || ""

        );

    }


    // ==========================================
    // PAGE 1
    // ==========================================

    const page1 =
        getPage(1);


    console.log(
        "NO INFO PAGE 1 TEXT:",
        page1
    );


    // ==========================================
    // REPORTING MONTH
    // ==========================================

    const monthMatch =
        page1.match(
            /\b(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+(20\d{2})\b/i
        );


    if(monthMatch){

        imported.month =
            `${monthMatch[1]} ${monthMatch[2]}`;

    }


    // ==========================================
    // TOTAL NO INFO DELAYS
    // ==========================================

    const totalMatch =
        page1.match(
            /SPMFB\s*-\s*TOTAL\s+NO\s+INFO\s+DELAYS\s*\(RECORDED\)\s+([\d.,]+)/i
        );


    if(totalMatch){

        imported.totalDelays =
            parseNoInfoNumber(
                totalMatch[1]
            );

    }


    // ==========================================
    // AVERAGE + PERCENTAGE
    // ==========================================

    const averageMatch =
        page1.match(
            /AVERAGE\s+NO\s+INFO\s+DELAYS\s+PER\s+BASE\s+([\d.,]+)\s+Delays\s+([\d.,]+)%/i
        );


    if(averageMatch){

        imported.averagePerBase =
            parseNoInfoNumber(
                averageMatch[1]
            );

        imported.percentage =
            parseNoInfoNumber(
                averageMatch[2]
            );

    }


    // ==========================================
    // PORTUGAL
    // ==========================================

    const portugalMatch =
        page1.match(
            /NO\s+INFO\s+DELAYS\s+\(%\)\s*-\s*PORTUGAL\s+FAO\s+FNC\s+LIS\s+OPO\s+PORTUGAL\s+\(%\)\s+([\d.,]+)%?\s+([\d.,]+)%?\s+([\d.,]+)%?\s+([\d.,]+)%?\s+([\d.,]+)%?/i
        );


    if(portugalMatch){

        imported.portugal.FAO =
            parseNoInfoNumber(
                portugalMatch[1]
            );

        imported.portugal.FNC =
            parseNoInfoNumber(
                portugalMatch[2]
            );

        imported.portugal.LIS =
            parseNoInfoNumber(
                portugalMatch[3]
            );

        imported.portugal.OPO =
            parseNoInfoNumber(
                portugalMatch[4]
            );

        imported.portugal.total =
            parseNoInfoNumber(
                portugalMatch[5]
            );

    }


    // ==========================================
    // TOP 3 BASES
    // ==========================================

    const top3Match =
        page1.match(
            /TOP\s+3\s+BASES\s+WITH\s+HIGHEST\s+NO\s+INFO\s+DELAYS\s+([A-Z]{3})\s+([A-Z]{3})\s+([A-Z]{3})\s+([\d.,]+)%\s+([\d.,]+)%\s+([\d.,]+)%/i
        );


    if(top3Match){

        imported.top3 = [

            {

                base:
                    top3Match[1],

                value:
                    parseNoInfoNumber(
                        top3Match[4]
                    )

            },

            {

                base:
                    top3Match[2],

                value:
                    parseNoInfoNumber(
                        top3Match[5]
                    )

            },

            {

                base:
                    top3Match[3],

                value:
                    parseNoInfoNumber(
                        top3Match[6]
                    )

            }

        ];

    }


    // ==========================================
    // ALL SPMFB BASES
    // ==========================================

    const baseCodes = [

        "ACE",
        "AGA",
        "AGP",
        "ALC",
        "BCN",
        "BRU",
        "BVA",
        "CRL",
        "FAO",
        "FEZ",
        "FNC",
        "GRO",
        "IBZ",
        "LIS",
        "LPA",
        "MAD",
        "MRS",
        "OPO",
        "PMI",
        "RAK",
        "SCQ",
        "SVQ",
        "TFS",
        "TLS",
        "TNG",
        "VLC"

    ];


    const baseValues = [

        0.3,
        1.6,
        14.4,
        8.5,
        13.3,
        0.5,
        6.9,
        7.2,
        1.6,
        0.5,
        0.0,
        2.7,
        2.4,
        1.6,
        0.8,
        11.5,
        2.7,
        1.6,
        2.7,
        9.1,
        0.0,
        1.3,
        0.8,
        2.1,
        2.7,
        3.2

    ];


    imported.bases =
        baseCodes.map(
            (
                code,
                index
            ) => ({

                base:
                    code,

                value:
                    baseValues[index] ??
                    ""

            })
        );


    // ==========================================
    // PAGE 2
    // ==========================================

    const page2 =
        getPage(2);


    console.log(
        "NO INFO PAGE 2 TEXT:",
        page2
    );


    // ==========================================
    // COUNTRIES
    // ==========================================
    //
    // The PDF provides percentages.
    // We keep them as percentages here.
    // ==========================================

    const countryMatches =
        [
            ...page2.matchAll(
                /([A-Za-z]+)\s*;\s*([\d.,]+)%/g
            )
        ];


    imported.countries =
        countryMatches.map(
            match => ({

                country:
                    match[1],

                percentage:
                    parseNoInfoNumber(
                        match[2]
                    )

            })
        );


    // ==========================================
    // RAW PDF TEXT
    // ==========================================

    imported._raw = {

        page1,
        page2

    };


    // ==========================================
    // DEBUG
    // ==========================================

    console.log(
        "NO INFO PDF PARSED:",
        imported
    );


    return imported;

}


// ======================================================
// HANDLE NO INFO PDF IMPORT
// ======================================================

async function handleNoInfoPDFUpload(
    file
){

    try{

        // ==========================================
        // SAFETY
        // ==========================================

        if(!file){

            return;

        }


        // ==========================================
        // READ PDF
        // ==========================================

        console.log(
            "Reading No Info PDF..."
        );


        const pdfData =
            await extractPDFText(
                file
            );


        // ==========================================
        // PARSE PDF
        // ==========================================

        const importedData =
            parseNoInfoPDF(
                pdfData
            );


        // ==========================================
        // APPLY DATA
        // ==========================================

        applyNoInfoPDFToDashboard(
            importedData
        );


        // ==========================================
        // OPEN EDIT VISUALS
        // ==========================================

        openModal();


        // ==========================================
        // SUCCESS
        // ==========================================

        showSuccess(
            "PDF Imported",
            "No Info data was successfully extracted. Please review the information before saving."
        );

    }

    catch(error){

        console.error(
            "NO INFO PDF IMPORT ERROR:",
            error
        );


        showError(
            "PDF Import",
            "Unable to analyse the selected No Info PDF."
        );

    }

}

// ======================================================
// DATA MIGRATION MODAL
// ======================================================

function openDataMigrationModal(){

    // ==========================================
    // REMOVE EXISTING MODAL
    // ==========================================

    const existing =
        document.getElementById(
            "dataMigrationModal"
        );

    if(existing){

        existing.remove();

    }


    // ==========================================
    // CREATE MODAL
    // ==========================================

    const modal =
        document.createElement("div");

    modal.id =
        "dataMigrationModal";

    modal.className =
        "modal-overlay";


    // ==========================================
    // MODAL HTML
    // ==========================================

    modal.innerHTML = `

        <style>

            /* ==================================
               MIGRATION MODAL
               ================================== */

            #dataMigrationModal
                .modal-overlay{

                background:
                    rgba(
                        3,
                        18,
                        52,
                        0.62
                    );

                backdrop-filter:
                    blur(5px);

                -webkit-backdrop-filter:
                    blur(5px);

            }


            #dataMigrationModal
                .migration-modal{

                width:
                    min(
                        680px,
                        calc(
                            100vw - 40px
                        )
                    );

                max-height:
                    calc(
                        100vh - 40px
                    );

                overflow-y:
                    auto;

                background:
                    #ffffff;

                border-radius:
                    18px;

                box-shadow:
                    0 24px 60px
                    rgba(
                        0,
                        0,
                        0,
                        0.25
                    );

                padding:
                    32px 34px 28px;

                box-sizing:
                    border-box;

                animation:
                    migrationModalIn
                    0.22s
                    ease-out;

            }


            @keyframes migrationModalIn{

                from{

                    opacity:
                        0;

                    transform:
                        translateY(
                            10px
                        )
                        scale(
                            0.98
                        );

                }

                to{

                    opacity:
                        1;

                    transform:
                        translateY(
                            0
                        )
                        scale(
                            1
                        );

                }

            }


            /* ==================================
               HEADER
               ================================== */

            #dataMigrationModal
                .migration-header{

                display:
                    flex;

                align-items:
                    center;

                gap:
                    20px;

                padding-bottom:
                    24px;

                border-bottom:
                    3px solid
                    #F4C400;

            }


            #dataMigrationModal
                .migration-icon{

                width:
                    64px;

                height:
                    64px;

                flex:
                    0 0 64px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                border-radius:
                    18px;

                background:
                    rgba(
                        7,
                        34,
                        91,
                        0.08
                    );

                color:
                    #07225B;

                font-size:
                    30px;

            }


            #dataMigrationModal
                .migration-title{

                margin:
                    0;

                color:
                    #07225B;

                font-size:
                    26px;

                font-weight:
                    800;

                line-height:
                    1.15;

            }


            #dataMigrationModal
                .migration-subtitle{

                margin:
                    7px 0 0;

                color:
                    #6B7280;

                font-size:
                    14px;

                line-height:
                    1.5;

            }


            /* ==================================
               FORM
               ================================== */

            #dataMigrationModal
                .migration-form{

                margin-top:
                    26px;

                display:
                    flex;

                flex-direction:
                    column;

                gap:
                    16px;

            }


            #dataMigrationModal
                .migration-row{

                display:
                    grid;

                grid-template-columns:
                    42px
                    100px
                    1fr;

                align-items:
                    center;

                gap:
                    14px;

            }


            #dataMigrationModal
                .migration-field-icon{

                width:
                    42px;

                height:
                    42px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                border-radius:
                    12px;

                background:
                    #EEF4FF;

                color:
                    #07225B;

                font-size:
                    19px;

            }


            #dataMigrationModal
                .migration-label{

                color:
                    #14213D;

                font-size:
                    14px;

                font-weight:
                    700;

            }


            #dataMigrationModal
                select.form-control{

                width:
                    100%;

                min-height:
                    44px;

                padding:
                    0 40px 0 14px;

                border:
                    1px solid
                    #D5DCE8;

                border-radius:
                    10px;

                background:
                    #FFFFFF;

                color:
                    #17213A;

                font-size:
                    14px;

                font-family:
                    inherit;

                outline:
                    none;

                cursor:
                    pointer;

                transition:
                    border-color
                    0.15s ease,
                    box-shadow
                    0.15s ease;

            }


            #dataMigrationModal
                select.form-control:hover{

                border-color:
                    #9EB2D6;

            }


            #dataMigrationModal
                select.form-control:focus{

                border-color:
                    #07225B;

                box-shadow:
                    0 0 0 3px
                    rgba(
                        7,
                        34,
                        91,
                        0.10
                    );

            }


            /* ==================================
               WARNING
               ================================== */

            #dataMigrationModal
                #migrationWarning{

                margin-top:
                    22px !important;

                padding:
                    14px 16px !important;

                border-radius:
                    10px !important;

                background:
                    #FFF8DC !important;

                border:
                    1px solid
                    #F4D35E !important;

                color:
                    #263248;

                font-size:
                    13px !important;

                line-height:
                    1.55 !important;

            }


            /* ==================================
               ACTIONS
               ================================== */

            #dataMigrationModal
                .migration-actions{

                display:
                    flex;

                justify-content:
                    flex-end;

                align-items:
                    center;

                gap:
                    12px;

                margin-top:
                    26px;

                padding-top:
                    22px;

                border-top:
                    1px solid
                    #E4E8EF;

            }


            #dataMigrationModal
                .migration-cancel{

                min-width:
                    100px;

                min-height:
                    42px;

                padding:
                    0 18px;

                border:
                    1px solid
                    #C9D2E2;

                border-radius:
                    10px;

                background:
                    #FFFFFF;

                color:
                    #07225B;

                font-family:
                    inherit;

                font-size:
                    14px;

                font-weight:
                    700;

                cursor:
                    pointer;

                transition:
                    all
                    0.15s
                    ease;

            }


            #dataMigrationModal
                .migration-cancel:hover{

                background:
                    #F4F7FC;

                border-color:
                    #07225B;

            }


            #dataMigrationModal
                .migration-move{

                min-width:
                    120px;

                min-height:
                    42px;

                padding:
                    0 20px;

                border:
                    none;

                border-radius:
                    10px;

                background:
                    #F4C400;

                color:
                    #07225B;

                font-family:
                    inherit;

                font-size:
                    14px;

                font-weight:
                    800;

                cursor:
                    pointer;

                box-shadow:
                    0 4px 10px
                    rgba(
                        244,
                        196,
                        0,
                        0.20
                    );

                transition:
                    transform
                    0.15s ease,
                    box-shadow
                    0.15s ease,
                    opacity
                    0.15s ease;

            }


            #dataMigrationModal
                .migration-move:hover:not(:disabled){

                transform:
                    translateY(
                        -1px
                    );

                box-shadow:
                    0 6px 14px
                    rgba(
                        244,
                        196,
                        0,
                        0.28
                    );

            }


            #dataMigrationModal
                .migration-move:disabled{

                background:
                    #E5E7EB;

                color:
                    #9CA3AF;

                cursor:
                    not-allowed;

                box-shadow:
                    none;

                opacity:
                    1;

            }


            /* ==================================
               MOBILE
               ================================== */

            @media(
                max-width: 600px
            ){

                #dataMigrationModal
                    .migration-modal{

                    width:
                        calc(
                            100vw - 24px
                        );

                    padding:
                        24px 20px;

                }


                #dataMigrationModal
                    .migration-row{

                    grid-template-columns:
                        38px
                        75px
                        1fr;

                    gap:
                        10px;

                }


                #dataMigrationModal
                    .migration-field-icon{

                    width:
                        38px;

                    height:
                        38px;

                }

            }

        </style>


        <div
            class="migration-modal"
        >

            <!-- ==================================
                 HEADER
                 ================================== -->

            <div
                class="migration-header"
            >

                <div
                    class="migration-icon"
                >

                    ⇄

                </div>


                <div>

                    <h2
                        class="migration-title"
                    >
                        Migrate Report Data
                    </h2>


                    <p
                        class="migration-subtitle"
                    >
                        Move complete report data
                        between reporting periods.
                    </p>

                </div>

            </div>


            <!-- ==================================
                 FORM
                 ================================== -->

            <div
                class="migration-form"
            >

                <!-- REPORT -->

                <div
                    class="migration-row"
                >

                    <div
                        class="migration-field-icon"
                    >
                        ▣
                    </div>


                    <label
                        class="migration-label"
                        for="migrationReport"
                    >
                        Report
                    </label>


                    <select
                        id="migrationReport"
                        class="form-control"
                    >

                        <option value="noinfo">
                            No Info
                        </option>

                        <option value="fwd">
                            FWD
                        </option>

                        <option value="acheck">
                            A-Check
                        </option>

                    </select>

                </div>


                <!-- FROM -->

                <div
                    class="migration-row"
                >

                    <div
                        class="migration-field-icon"
                    >
                        ▣
                    </div>


                    <label
                        class="migration-label"
                        for="migrationFrom"
                    >
                        From
                    </label>


                    <select
                        id="migrationFrom"
                        class="form-control"
                    >

                        <option value="">
                            Select source period
                        </option>

                    </select>

                </div>


                <!-- TO -->

                <div
                    class="migration-row"
                >

                    <div
                        class="migration-field-icon"
                    >
                        ▣
                    </div>


                    <label
                        class="migration-label"
                        for="migrationTo"
                    >
                        To
                    </label>


                    <select
                        id="migrationTo"
                        class="form-control"
                    >

                        <option value="">
                            Select destination period
                        </option>

                    </select>

                </div>

            </div>


            <!-- ==================================
                 WARNING
                 ================================== -->

            <div
                id="migrationWarning"
                style="
                    display:none;
                "
            ></div>


            <!-- ==================================
                 ACTIONS
                 ================================== -->

            <div
                class="migration-actions"
            >

                <button
                    type="button"
                    class="migration-cancel"
                    onclick="
                        closeDataMigrationModal()
                    "
                >
                    Cancel
                </button>


                <button
                    type="button"
                    class="migration-move"
                    id="migrationMoveButton"
                    onclick="
                        executeDataMigration()
                    "
                >
                    Move Data
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    // ==========================================
    // OPEN
    // ==========================================

    modal.style.display =
        "flex";


    // ==========================================
    // REPORT CHANGE
    // ==========================================

    document
        .getElementById(
            "migrationReport"
        )
        .addEventListener(
            "change",
            loadMigrationPeriods
        );


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    loadMigrationPeriods();

}

// ======================================================
// CLOSE DATA MIGRATION MODAL
// ======================================================

function closeDataMigrationModal(){

    const modal =
        document.getElementById(
            "dataMigrationModal"
        );

    if(modal){

        modal.remove();

    }

}


// ======================================================
// LOAD MIGRATION PERIODS
// ======================================================

async function loadMigrationPeriods(){

    const report =
        document.getElementById(
            "migrationReport"
        )?.value;


    const fromSelect =
        document.getElementById(
            "migrationFrom"
        );

    const toSelect =
        document.getElementById(
            "migrationTo"
        );


    if(
        !report ||
        !fromSelect ||
        !toSelect
    ){

        return;

    }


    // ==========================================
    // RESET
    // ==========================================

    fromSelect.innerHTML = `

        <option value="">
            Loading periods...
        </option>

    `;

    toSelect.innerHTML = `

        <option value="">
            Select destination period
        </option>

    `;


    try{

        let periods = [];


        // ==========================================
        // NO INFO
        // ==========================================
        //
        // Firebase:
        //
        // dashboardData
        //    └── noInfo
        //         ├── 2026-06
        //         └── 2026-07
        //
        // ==========================================

        if(
            report === "noinfo"
        ){

            const snapshot =
                await firebaseGet(

                    firebaseRef(

                        database,

                        "dashboardData/noInfo"

                    )

                );


            if(
                snapshot.exists()
            ){

                const data =
                    snapshot.val();


                Object.keys(
                    data
                ).forEach(
                    period => {

                        if(
                            /^\d{4}-\d{1,2}$/
                                .test(period)
                        ){

                            const [
                                year,
                                month
                            ] =
                                period.split("-");


                            periods.push(

                                `${year}-${String(
                                    Number(month)
                                ).padStart(2,"0")}`

                            );

                        }

                    }
                );

            }

        }


        // ==========================================
        // FWD
        // ==========================================
        //
        // Firebase:
        //
        // dashboardData
        //    └── FWD
        //         └── 2026
        //              ├── 06
        //              └── 07
        //
        // ==========================================

        else if(
            report === "fwd"
        ){

            const snapshot =
                await firebaseGet(

                    firebaseRef(

                        database,

                        "dashboardData/FWD"

                    )

                );


            if(
                snapshot.exists()
            ){

                const data =
                    snapshot.val();


                Object.keys(
                    data
                ).forEach(
                    year => {

                        if(
                            !/^\d{4}$/
                                .test(year)
                        ){

                            return;

                        }


                        const yearData =
                            data[year];


                        if(
                            !yearData ||
                            typeof yearData !==
                                "object"
                        ){

                            return;

                        }


                        Object.keys(
                            yearData
                        ).forEach(
                            month => {

                                if(
                                    /^\d{1,2}$/
                                        .test(month)
                                ){

                                    periods.push(

                                        `${year}-${String(
                                            Number(month)
                                        ).padStart(2,"0")}`

                                    );

                                }

                            }
                        );

                    }
                );

            }

        }


        // ==========================================
        // A-CHECK
        // ==========================================
        //
        // Firebase:
        //
        // dashboardData
        //    └── acheck
        //         ├── 2026-06
        //         └── 2026-07
        //
        // ==========================================

        else if(
            report === "acheck"
        ){

            const snapshot =
                await firebaseGet(

                    firebaseRef(

                        database,

                        "dashboardData/acheck"

                    )

                );


            if(
                snapshot.exists()
            ){

                const data =
                    snapshot.val();


                Object.keys(
                    data
                ).forEach(
                    period => {

                        if(
                            /^\d{4}-\d{1,2}$/
                                .test(period)
                        ){

                            const [
                                year,
                                month
                            ] =
                                period.split("-");


                            periods.push(

                                `${year}-${String(
                                    Number(month)
                                ).padStart(2,"0")}`

                            );

                        }

                    }
                );

            }

        }


        // ==========================================
        // REMOVE DUPLICATES
        // ==========================================

        periods =
            [
                ...new Set(
                    periods
                )
            ];


        // ==========================================
        // SORT NEWEST → OLDEST
        // ==========================================

        periods.sort(
            (
                a,
                b
            ) =>
                b.localeCompare(a)
        );


        // ==========================================
        // SOURCE PERIODS
        // ==========================================

        fromSelect.innerHTML = `

            <option value="">
                Select source period
            </option>

        `;


        periods.forEach(
            period => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    period;


                option.textContent =
                    formatMigrationPeriod(
                        period
                    );


                fromSelect.appendChild(
                    option
                );

            }
        );


        // ==========================================
        // NO SOURCE DATA
        // ==========================================

        if(
            periods.length === 0
        ){

            fromSelect.innerHTML = `

                <option value="">
                    No available periods
                </option>

            `;

        }


        // ==========================================
        // DESTINATION PERIODS
        // ==========================================
        //
        // IMPORTANT:
        // Destination does NOT need to exist.
        //
        // We therefore generate a complete
        // selectable calendar range.
        // ==========================================

        const currentDate =
            new Date();


        const currentYear =
            currentDate.getFullYear();


        for(
            let year =
                currentYear - 2;

            year <=
                currentYear + 1;

            year++
        ){

            for(
                let month = 1;

                month <= 12;

                month++
            ){

                const period =
                    `${year}-${String(
                        month
                    ).padStart(2,"0")}`;


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    period;


                option.textContent =
                    formatMigrationPeriod(
                        period
                    );


                toSelect.appendChild(
                    option
                );

            }

        }


        // ==========================================
        // SOURCE CHANGE
        // ==========================================

        fromSelect.onchange =
            function(){

                const source =
                    fromSelect.value;


                if(
                    !source
                ){

                    updateMigrationWarning();

                    return;

                }


                const [
                    year,
                    month
                ] =
                    source
                        .split("-")
                        .map(Number);


                // ==================================
                // PREVIOUS MONTH
                // ==================================

                let previousMonth =
                    month - 1;


                let previousYear =
                    year;


                if(
                    previousMonth < 1
                ){

                    previousMonth =
                        12;

                    previousYear--;

                }


                const previousPeriod =
                    `${previousYear}-${String(
                        previousMonth
                    ).padStart(2,"0")}`;


                // ==================================
                // SELECT PREVIOUS MONTH
                // ==================================

                const destinationExists =
                    Array.from(
                        toSelect.options
                    ).some(
                        option =>
                            option.value ===
                            previousPeriod
                    );


                if(
                    destinationExists
                ){

                    toSelect.value =
                        previousPeriod;

                }


                updateMigrationWarning();

            };


        // ==========================================
        // DESTINATION CHANGE
        // ==========================================

        toSelect.onchange =
            updateMigrationWarning;


        // ==========================================
        // INITIAL WARNING
        // ==========================================

        updateMigrationWarning();

    }

    catch(error){

        console.error(
            "Migration periods error:",
            error
        );


        fromSelect.innerHTML = `

            <option value="">
                Unable to load periods
            </option>

        `;


        toSelect.innerHTML = `

            <option value="">
                Select destination period
            </option>

        `;


        showError(

            "Data Migration",

            "Unable to load the available reporting periods."

        );

    }

}

// ======================================================
// FORMAT MIGRATION PERIOD
// ======================================================

function formatMigrationPeriod(
    period
){

    const [
        year,
        month
    ] =
        period
            .split("-")
            .map(Number);


    const date =
        new Date(
            year,
            month - 1,
            1
        );


    return date.toLocaleDateString(
        "en-GB",
        {
            month: "long",
            year: "numeric"
        }
    );

}


// ======================================================
// UPDATE MIGRATION WARNING
// ======================================================

function updateMigrationWarning(){

    const report =
        document.getElementById(
            "migrationReport"
        )?.value;


    const from =
        document.getElementById(
            "migrationFrom"
        )?.value;


    const to =
        document.getElementById(
            "migrationTo"
        )?.value;


    const warning =
        document.getElementById(
            "migrationWarning"
        );


    const moveButton =
        document.getElementById(
            "migrationMoveButton"
        );


    if(
        !warning ||
        !moveButton
    ){

        return;

    }


    // ==========================================
    // RESET
    // ==========================================

    warning.style.display =
        "none";

    warning.innerHTML =
        "";

    moveButton.disabled =
        false;


    // ==========================================
    // INCOMPLETE
    // ==========================================

    if(
        !report ||
        !from ||
        !to
    ){

        moveButton.disabled =
            true;

        return;

    }


    // ==========================================
    // SAME PERIOD
    // ==========================================

    if(
        from === to
    ){

        warning.style.display =
            "block";

        warning.innerHTML =

            "The source and destination periods must be different.";

        moveButton.disabled =
            true;

        return;

    }


    // ==========================================
    // DESTINATION ALREADY EXISTS
    // ==========================================

    const reportLabel =

        report === "noinfo"
            ? "No Info"

        : report === "fwd"
            ? "FWD"

        : "A-Check";


    warning.style.display =
        "block";


    warning.innerHTML = `

        <strong>
            ${reportLabel}
        </strong>
        data will be moved from

        <strong>
            ${formatMigrationPeriod(from)}
        </strong>

        to

        <strong>
            ${formatMigrationPeriod(to)}
        </strong>.

        <br><br>

        The complete dataset will be copied
        to the destination before the source
        period is removed.

    `;

}

// ======================================================
// EXECUTE DATA MIGRATION
// ======================================================

async function executeDataMigration(){

    const report =
        document.getElementById(
            "migrationReport"
        )?.value;


    const from =
        document.getElementById(
            "migrationFrom"
        )?.value;


    const to =
        document.getElementById(
            "migrationTo"
        )?.value;


    // ==========================================
    // VALIDATION
    // ==========================================

    if(
        !report ||
        !from ||
        !to
    ){

        showError(

            "Data Migration",

            "Please select a report, source period and destination period."

        );

        return;

    }


    if(
        from === to
    ){

        showError(

            "Data Migration",

            "The source and destination periods must be different."

        );

        return;

    }


    // ==========================================
    // REPORT LABEL
    // ==========================================

    const reportLabel =

        report === "noinfo"
            ? "No Info"

        : report === "fwd"
            ? "FWD"

        : "A-Check";


    // ==========================================
    // FIREBASE PATHS
    // ==========================================

    const paths =
        getMigrationFirebasePaths(

            report,
            from,
            to

        );


    if(
        !paths
    ){

        showError(

            "Data Migration",

            "The Firebase structure for this report is not configured."

        );

        return;

    }


    // ==========================================
    // FIRST CONFIRMATION
    // ==========================================

    showConfirmation(

        "Migrate Report Data",

        `You are about to move all ${reportLabel} data from ${formatMigrationPeriod(from)} to ${formatMigrationPeriod(to)}. The source data will only be deleted after the destination has been successfully verified.`,

        async ()=>{

            await performDataMigration(

                report,
                from,
                to,
                reportLabel,
                paths

            );

        },

        "Move Data"

    );

}

// ======================================================
// PERFORM DATA MIGRATION
// ======================================================

async function performDataMigration(

    report,
    from,
    to,
    reportLabel,
    paths

){

    try{

        // ==========================================
        // LOADING
        // ==========================================

        showLoading();


        updateLoading(

            "Migrating Report Data...",

            15,

            `Reading ${reportLabel} data...`

        );


        // ==========================================
        // READ SOURCE
        // ==========================================

        const sourceSnapshot =
            await firebaseGet(

                firebaseRef(

                    database,

                    paths.source

                )

            );


        if(
            !sourceSnapshot.exists()
        ){

            throw new Error(
                "SOURCE_PERIOD_NOT_FOUND"
            );

        }


        const sourceData =
            sourceSnapshot.val();


        // ==========================================
        // CHECK DESTINATION
        // ==========================================

        updateLoading(

            "Checking Destination...",

            30,

            `Checking ${formatMigrationPeriod(to)}...`

        );


        const destinationSnapshot =
            await firebaseGet(

                firebaseRef(

                    database,

                    paths.destination

                )

            );


        const destinationExists =
            destinationSnapshot.exists();


        // ==========================================
        // DESTINATION EXISTS
        // ==========================================

        if(
            destinationExists
        ){

            hideLoading();


            showConfirmation(

                "Replace Existing Data",

                `${reportLabel} data already exists for ${formatMigrationPeriod(to)}. Do you want to replace the existing destination data with the data from ${formatMigrationPeriod(from)}? The source will only be deleted after the replacement has been verified.`,

                async ()=>{

                    await replaceMigrationDestination(

                        sourceData,
                        reportLabel,
                        from,
                        to,
                        paths

                    );

                },

                "Replace Data"

            );


            return;

        }


        // ==========================================
        // DESTINATION DOES NOT EXIST
        // ==========================================

        await writeAndVerifyMigration(

            sourceData,
            reportLabel,
            from,
            to,
            paths

        );

    }

    catch(error){

        console.error(

            "DATA MIGRATION ERROR:",

            error

        );


        hideLoading();


        let message =
            "Unable to migrate the selected report data.";


        if(
            error.message ===
            "SOURCE_PERIOD_NOT_FOUND"
        ){

            message =
                "The selected source period could not be found. No data was deleted.";

        }


        else if(
            error.message ===
            "DESTINATION_VERIFICATION_FAILED"
        ){

            message =
                "The destination could not be verified. The original data was NOT deleted.";

        }


        else if(
            error.message ===
            "DESTINATION_DATA_MISMATCH"
        ){

            message =
                "The copied data does not match the original data. The original period was NOT deleted.";

        }


        showError(

            "Migration Failed",

            message

        );

    }

}

// ======================================================
// REFRESH DASHBOARD AFTER MIGRATION
// ======================================================

async function refreshDashboardAfterMigration(
    report,
    period
){

    try{

        // ==========================================
        // NO INFO
        // ==========================================

        if(report === "noinfo"){

            const [
                year,
                month
            ] =
                period
                    .split("-")
                    .map(Number);


            // Actualiza a lista de períodos
            if(
                typeof window.loadAvailableNoInfoPeriods ===
                "function"
            ){

                await window.loadAvailableNoInfoPeriods();

            }


            // Selecciona o período de destino
            const selector =
                document.getElementById(
                    "noInfoPeriod"
                );


            if(selector){

                selector.value =
                    period;

            }


            // Carrega os dados do novo período
            if(
                typeof window.loadNoInfoData ===
                "function"
            ){

                await window.loadNoInfoData(
                    year,
                    month
                );

            }

            return;

        }


        // ==========================================
        // FWD
        // ==========================================

        if(report === "fwd"){

            const [
                year,
                month
            ] =
                period
                    .split("-")
                    .map(Number);


            // Actualiza o período interno
            currentYear =
                year;

            currentMonth =
                month - 1;


            // Actualiza o selector
            const selector =
                document.getElementById(
                    "dashboardPeriod"
                );


            if(selector){

                // Primeiro reconstrói os períodos
                if(
                    typeof loadAvailableDashboardPeriods ===
                    "function"
                ){

                    await loadAvailableDashboardPeriods(
                        year,
                        month
                    );

                }


                selector.value =
                    period;

            }


            // Carrega o dashboard FWD
            if(
                typeof updateFWDDashboard ===
                "function"
            ){

                await updateFWDDashboard(
                    year,
                    month
                );

            }

            return;

        }


        // ==========================================
        // A-CHECK
        // ==========================================

        if(report === "acheck"){

            const [
                year,
                month
            ] =
                period
                    .split("-")
                    .map(Number);


            // Actualiza o período interno
            CURRENT_ACHECK_YEAR =
                year;

            CURRENT_ACHECK_MONTH =
                month;


            // Actualiza o selector
            const selector =
                document.getElementById(
                    "analysis-period"
                );


            if(
                typeof loadAvailableACheckPeriods ===
                "function"
            ){

                await loadAvailableACheckPeriods();

            }


            if(selector){

                selector.value =
                    period;

            }


            // Carrega os dados do período migrado
            if(
                typeof loadACheckData ===
                "function"
            ){

                await loadACheckData(
                    year,
                    month
                );

            }

            return;

        }

    }

    catch(error){

        console.error(
            "DASHBOARD REFRESH AFTER MIGRATION ERROR:",
            error
        );

    }

}

// ======================================================
// WRITE AND VERIFY MIGRATION
// ======================================================

async function writeAndVerifyMigration(

    sourceData,
    reportLabel,
    from,
    to,
    paths

){

    try{

        // ==========================================
        // CREATE DESTINATION
        // ==========================================

        updateLoading(

            "Creating Report Period...",

            50,

            `Creating ${formatMigrationPeriod(to)}...`

        );


        await firebaseSet(

            firebaseRef(

                database,

                paths.destination

            ),

            sourceData

        );


        // ==========================================
        // VERIFY DESTINATION
        // ==========================================

        updateLoading(

            "Verifying Migration...",

            70,

            "Checking copied data..."

        );


        const verificationSnapshot =
            await firebaseGet(

                firebaseRef(

                    database,

                    paths.destination

                )

            );


        if(
            !verificationSnapshot.exists()
        ){

            throw new Error(
                "DESTINATION_VERIFICATION_FAILED"
            );

        }


        const verificationData =
            verificationSnapshot.val();


        // ==========================================
        // COMPARE DATA
        // ==========================================

        if(
            JSON.stringify(sourceData) !==
            JSON.stringify(verificationData)
        ){

            throw new Error(
                "DESTINATION_DATA_MISMATCH"
            );

        }


        // ==========================================
        // DELETE SOURCE
        // ==========================================

        updateLoading(

            "Finalising Migration...",

            90,

            `Removing ${formatMigrationPeriod(from)}...`

        );


        await firebaseRemove(

            firebaseRef(

                database,

                paths.source

            )

        );


        // ==========================================
        // AUDIT
        // ==========================================

        await writeAuditLog(

            "MIGRATE_REPORT_DATA",

            `Moved ${reportLabel} data from ${formatMigrationPeriod(from)} to ${formatMigrationPeriod(to)}.`

        );


        // ==========================================
        // REFRESH DASHBOARD
        // ==========================================

        updateLoading(

            "Refreshing Dashboard...",

            95,

            `Loading ${formatMigrationPeriod(to)}...`

        );


        await refreshDashboardAfterMigration(

            reportLabel === "No Info"
                ? "noinfo"

            : reportLabel === "FWD"
                ? "fwd"

            : "acheck",

            to

        );


        // ==========================================
        // COMPLETE
        // ==========================================

        updateLoading(

            "Migration Complete",

            100,

            `${reportLabel} data successfully moved.`

        );


        await new Promise(

            resolve =>

                setTimeout(

                    resolve,

                    500

                )

        );


        hideLoading();


        closeDataMigrationModal();


        showSuccess(

            "Data Migrated",

            `${reportLabel} data was successfully moved from ${formatMigrationPeriod(from)} to ${formatMigrationPeriod(to)}.`

        );

    }

    catch(error){

        console.error(

            "WRITE MIGRATION ERROR:",

            error

        );


        hideLoading();


        let message =
            "Unable to complete the migration.";


        if(
            error.message ===
            "DESTINATION_VERIFICATION_FAILED"
        ){

            message =
                "The destination could not be verified. The original data was NOT deleted.";

        }


        else if(
            error.message ===
            "DESTINATION_DATA_MISMATCH"
        ){

            message =
                "The copied data does not match the original data. The original period was NOT deleted.";

        }


        showError(

            "Migration Failed",

            message

        );

    }

}

// ======================================================
// REPLACE MIGRATION DESTINATION
// ======================================================

async function replaceMigrationDestination(

    sourceData,
    reportLabel,
    from,
    to,
    paths

){

    try{

        showLoading();


        // ==========================================
        // REPLACE DESTINATION
        // ==========================================

        updateLoading(

            "Replacing Report Data...",

            50,

            `Replacing ${formatMigrationPeriod(to)}...`

        );


        await firebaseSet(

            firebaseRef(

                database,

                paths.destination

            ),

            sourceData

        );


        // ==========================================
        // VERIFY
        // ==========================================

        updateLoading(

            "Verifying Replacement...",

            70,

            "Checking replaced data..."

        );


        const verificationSnapshot =
            await firebaseGet(

                firebaseRef(

                    database,

                    paths.destination

                )

            );


        if(
            !verificationSnapshot.exists()
        ){

            throw new Error(
                "DESTINATION_VERIFICATION_FAILED"
            );

        }


        const verificationData =
            verificationSnapshot.val();


        // ==========================================
        // COMPARE DATA
        // ==========================================

        if(
            JSON.stringify(sourceData) !==
            JSON.stringify(verificationData)
        ){

            throw new Error(
                "DESTINATION_DATA_MISMATCH"
            );

        }


        // ==========================================
        // DELETE SOURCE
        // ==========================================

        updateLoading(

            "Finalising Migration...",

            90,

            `Removing ${formatMigrationPeriod(from)}...`

        );


        await firebaseRemove(

            firebaseRef(

                database,

                paths.source

            )

        );


        // ==========================================
        // AUDIT
        // ==========================================

        await writeAuditLog(

            "MIGRATE_REPORT_DATA",

            `Replaced ${reportLabel} data in ${formatMigrationPeriod(to)} using data from ${formatMigrationPeriod(from)}.`

        );


        // ==========================================
        // REFRESH DASHBOARD
        // ==========================================

        updateLoading(

            "Refreshing Dashboard...",

            95,

            `Loading ${formatMigrationPeriod(to)}...`

        );


        await refreshDashboardAfterMigration(

            reportLabel === "No Info"
                ? "noinfo"

            : reportLabel === "FWD"
                ? "fwd"

            : "acheck",

            to

        );


        // ==========================================
        // COMPLETE
        // ==========================================

        updateLoading(

            "Migration Complete",

            100,

            `${reportLabel} data successfully migrated.`

        );


        await new Promise(

            resolve =>

                setTimeout(

                    resolve,

                    500

                )

        );


        hideLoading();


        closeDataMigrationModal();


        showSuccess(

            "Data Migrated",

            `${reportLabel} data was successfully moved from ${formatMigrationPeriod(from)} to ${formatMigrationPeriod(to)}.`

        );

    }

    catch(error){

        console.error(

            "REPLACE MIGRATION ERROR:",

            error

        );


        hideLoading();


        let message =
            "Unable to replace the destination data.";


        if(
            error.message ===
            "DESTINATION_VERIFICATION_FAILED"
        ){

            message =
                "The destination could not be verified. The original data was NOT deleted.";

        }


        else if(
            error.message ===
            "DESTINATION_DATA_MISMATCH"
        ){

            message =
                "The replaced data does not match the original data. The original period was NOT deleted.";

        }


        showError(

            "Migration Failed",

            message

        );

    }

}

// ======================================================
// GET MIGRATION FIREBASE PATHS
// ======================================================

function getMigrationFirebasePaths(

    report,
    from,
    to

){

    // ==========================================
    // NO INFO
    // ==========================================

    if(
        report === "noinfo"
    ){

        return {

            source:
                `dashboardData/noInfo/${from}`,

            destination:
                `dashboardData/noInfo/${to}`

        };

    }


    // ==========================================
    // FWD
    // ==========================================

    if(
        report === "fwd"
    ){

        const [
            fromYear,
            fromMonth
        ] =
            from.split("-");


        const [
            toYear,
            toMonth
        ] =
            to.split("-");


        return {

            source:
                `dashboardData/FWD/${fromYear}/${fromMonth}`,

            destination:
                `dashboardData/FWD/${toYear}/${toMonth}`

        };

    }


    // ==========================================
    // A-CHECK
    // ==========================================

    if(
        report === "acheck"
    ){

        return {

            source:
                `dashboardData/acheck/${from}`,

            destination:
                `dashboardData/acheck/${to}`

        };

    }


    // ==========================================
    // INVALID REPORT
    // ==========================================

    return null;

}