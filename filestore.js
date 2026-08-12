// =========================================================
// RYANAIR ENGINEERING DASHBOARD
// FILE STORE
// =========================================================
//
// IMPORTANT:
// This file is intentionally a NORMAL JavaScript file.
// It does NOT use top-level ES module imports.
//
// Authentication is handled by auth.js through:
// CURRENT_USER
// AUTH_READY
// isLogged()
// =========================================================

// =========================================================
// FILE STORE PATHS
// =========================================================

const FILE_STORE_ROOT =
    "dashboardData/fileStore";

const FILE_STORE_FOLDERS_PATH =
    `${FILE_STORE_ROOT}/folders`;

const FILE_STORE_FILES_PATH =
    `${FILE_STORE_ROOT}/files`;

const FILE_STORE_SECTIONS_PATH =
    `${FILE_STORE_ROOT}/sections`;    

// =========================================================
// FILE STORE — GLOBAL RECENT ITEMS
// =========================================================
//
// These lists are GLOBAL for the whole File Store.
// They are NOT associated with individual users.
//
// Recently Added  → last 3 uploaded documents
// Recently Opened → last 3 opened documents
//
// Only document IDs + timestamps are stored.
// =========================================================

const FILE_STORE_RECENT_PATH =
    `${FILE_STORE_ROOT}/recent`;

const FILE_STORE_RECENT_ADDED_PATH =
    `${FILE_STORE_RECENT_PATH}/added`;

const FILE_STORE_RECENT_OPENED_PATH =
    `${FILE_STORE_RECENT_PATH}/opened`;


let fileStoreRecentAdded =
    {};

let fileStoreRecentOpened =
    {};

// =========================================================
// SUPABASE FILE STORAGE
// =========================================================

const SUPABASE_URL =
    "https://zycbpwyizlstpfimgorf.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_9-Knw4SQMMB9qlQlBE3fHA_83IcJ78p";

const SUPABASE_BUCKET =
    "File Store";

let fileStoreSupabase =
    null;


async function getFileStoreSupabase(){

    if(fileStoreSupabase){

        return fileStoreSupabase;

    }

    const {
        createClient
    } =
        await import(
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
        );


    fileStoreSupabase =
        createClient(

            SUPABASE_URL,

            SUPABASE_PUBLISHABLE_KEY

        );


    return fileStoreSupabase;

}    

// =========================================================
// FILE STORE STATE
// =========================================================

let fileStoreCurrentSectionId =
    null;


let fileStoreCurrentSectionName =
    "Home";


let fileStoreCurrentFolderId =
    null;


let fileStoreCurrentFolderName =
    "Home";


let fileStoreCurrentFolderParentId =
    null;


let fileStoreSections =
    {};


let fileStoreFolders =
    {};


let fileStoreFiles =
    {};


let fileStoreSelectedFile =
    null;

let fileStoreMoveType =
    null;


let fileStoreMoveItem =
    null;

let fileStoreRenameType =
    null;


let fileStoreRenameItem =
    null;

let fileStoreInitialised =
    false;


let fileStoreStorage =
    null;

let fileStoreDeleteType =
    null;


let fileStoreDeleteItem =
    null;    


// =========================================================
// ADMIN ACCESS
// =========================================================
//
// IMPORTANT:
// We use the SAME CURRENT_USER already loaded by auth.js.
// No second login.
// No second user lookup.
// No second session.
// =========================================================

function isFileStoreAdmin(){

    return (

        typeof CURRENT_USER !==
        "undefined"

        &&

        CURRENT_USER

        &&

        CURRENT_USER.profile

        &&

        CURRENT_USER.profile.role ===
        USER_ROLES.ADMIN

    );

}


// =========================================================
// FILE STORE ACCESS CHECK
// =========================================================

function checkFileStoreAccess(){

    if(
        typeof isLogged ===
        "function"
        &&
        isLogged()
        &&
        isFileStoreAdmin()
    ){

        return true;

    }


    return false;

}


// =========================================================
// INITIALISE FILE STORE
// =========================================================

async function initialiseFileStore(){


    // -----------------------------------------
    // ACCESS
    // -----------------------------------------

    if(!checkFileStoreAccess()){

        console.error(
            "FILE STORE — Access denied."
        );

        return false;

    }


    // -----------------------------------------
    // LOAD FIREBASE DATA
    // -----------------------------------------

    try{

        await loadFileStoreData();

    }
    catch(error){

        console.error(
            "FILE STORE — Firebase load failed:",
            error
        );


        showError(
            "File Store",
            "Unable to load the File Store."
        );


        return false;

    }


    // -----------------------------------------
    // RESET VIEW
    // -----------------------------------------

    fileStoreCurrentSectionId =
    null;


fileStoreCurrentSectionName =
    "Home";


fileStoreCurrentFolderId =
    null;


fileStoreCurrentFolderName =
    "Home";


fileStoreCurrentFolderParentId =
    null;


    // -----------------------------------------
    // RENDER
    // -----------------------------------------

    renderFileStoreSections();

renderFileStoreHome();
    // -----------------------------------------
    // EVENTS
    // -----------------------------------------

    bindFileStoreEvents();


    fileStoreInitialised =
        true;



    return true;

}


// =========================================================
// LOAD DATA FROM EXISTING FIREBASE DATABASE
// =========================================================

async function loadFileStoreData(){

    const snapshot =
        await firebaseGet(

            firebaseRef(
                database,
                FILE_STORE_ROOT
            )

        );


        if(
        !snapshot.exists()
    ){

        fileStoreSections =
            {};

        fileStoreFolders =
            {};

        fileStoreFiles =
            {};

        fileStoreRecentAdded =
            {};

        fileStoreRecentOpened =
            {};

        return;

    }


    const data =
        snapshot.val() || {};


    fileStoreSections =
        data.sections ||
        {};


    fileStoreFolders =
        data.folders ||
        {};


    fileStoreFiles =
        data.files ||
        {};

    // -----------------------------------------
    // LOAD GLOBAL RECENT DOCUMENTS
    // -----------------------------------------

    fileStoreRecentAdded =
        data.recent?.added ||
        {};

    fileStoreRecentOpened =
        data.recent?.opened ||
        {};

}

// =========================================================
// GLOBAL RECENT DOCUMENTS
// =========================================================

// =========================================================
// SAVE RECENT LIST
// =========================================================

async function saveFileStoreRecentList(
    type,
    list
){

    const path =
        type === "added"

            ? FILE_STORE_RECENT_ADDED_PATH

            : FILE_STORE_RECENT_OPENED_PATH;


    await firebaseSet(

        firebaseRef(
            database,
            path
        ),

        list

    );

}


// =========================================================
// KEEP ONLY LAST 3
// =========================================================

function trimFileStoreRecentList(
    list
){

    const entries =
        Object.entries(
            list || {}
        )
        .sort(
            ([,a],[,b]) => {

                return (
                    Number(
                        b.timestamp ||
                        0
                    )
                    -
                    Number(
                        a.timestamp ||
                        0
                    )
                );

            }
        );


    const trimmed =
        {};


    entries
        .slice(
            0,
            3
        )
        .forEach(
            ([id,data]) => {

                trimmed[id] =
                    data;

            }
        );


    return trimmed;

}


// =========================================================
// REGISTER RECENTLY ADDED
// =========================================================

async function registerFileStoreRecentAdded(
    fileId
){

    if(!fileId){

        return;

    }


    // Remove existing entry first
    delete fileStoreRecentAdded[
        fileId
    ];


    fileStoreRecentAdded[
        fileId
    ] = {

        timestamp:
            Date.now()

    };


    fileStoreRecentAdded =
        trimFileStoreRecentList(
            fileStoreRecentAdded
        );


    await saveFileStoreRecentList(
        "added",
        fileStoreRecentAdded
    );

}


// =========================================================
// REGISTER RECENTLY OPENED
// =========================================================

async function registerFileStoreRecentOpened(
    fileId
){

    if(!fileId){

        return;

    }


    // Remove existing entry first
    delete fileStoreRecentOpened[
        fileId
    ];


    fileStoreRecentOpened[
        fileId
    ] = {

        timestamp:
            Date.now()

    };


    fileStoreRecentOpened =
        trimFileStoreRecentList(
            fileStoreRecentOpened
        );


    await saveFileStoreRecentList(
        "opened",
        fileStoreRecentOpened
    );

}


// =========================================================
// GET RECENT FILES
// =========================================================

function getFileStoreRecentFiles(
    type
){

    const list =
        type === "added"

            ? fileStoreRecentAdded

            : fileStoreRecentOpened;


    return Object.entries(
        list || {}
    )
        .map(
            ([id,recentData]) => {

                const file =
                    fileStoreFiles[
                        id
                    ];


                if(!file){

                    return null;

                }


                return {

                    id,

                    ...file,

                    recentTimestamp:
                        Number(
                            recentData?.timestamp ||
                            0
                        )

                };

            }
        )
        .filter(
            Boolean
        )
        .sort(
            (a,b) => {

                return (
                    b.recentTimestamp -
                    a.recentTimestamp
                );

            }
        )
        .slice(
            0,
            3
        );

}

// =========================================================
// CREATE FOLDER
// =========================================================

async function createFileStoreFolder(
    folderName
){

    if(
        !checkFileStoreAccess()
    ){

        throw new Error(
            "Access denied."
        );

    }


    if(
        !fileStoreCurrentSectionId
    ){

        throw new Error(
            "Please select a section before creating a folder."
        );

    }


    const cleanName =
        String(
            folderName || ""
        )
            .trim();


    if(
        !cleanName
    ){

        throw new Error(
            "Folder name cannot be empty."
        );

    }


    // -----------------------------------------
    // DUPLICATE CHECK
    // -----------------------------------------

    const existingFolder =
        Object.values(
            fileStoreFolders
        )
            .some(
                folder => {

                    const sameSection =

                        (
                            folder.sectionId ||
                            null
                        )

                        ===

                        fileStoreCurrentSectionId;


                    const sameParent =

                        (
                            folder.parentId ||
                            null
                        )

                        ===

                        fileStoreCurrentFolderId;


                    const sameName =

                        String(
                            folder.name ||
                            ""
                        )
                            .trim()
                            .toLowerCase()

                        ===

                        cleanName
                            .toLowerCase();


                    return (

                        sameSection &&
                        sameParent &&
                        sameName

                    );

                }
            );


    if(
        existingFolder
    ){

        throw new Error(
            "A folder with this name already exists here."
        );

    }


    // -----------------------------------------
    // CREATE FIREBASE KEY
    // -----------------------------------------

    const folderRef =
        window.firebasePush(

            firebaseRef(
                database,
                FILE_STORE_FOLDERS_PATH
            )

        );


    const folderId =
        folderRef.key;


    const now =
        Date.now();


    const folderData = {

        name:
            cleanName,

        sectionId:
            fileStoreCurrentSectionId,

        parentId:
            fileStoreCurrentFolderId,

        createdBy:
            getCurrentFullName(),

        createdByUsername:
            getCurrentUsername(),

        createdAt:
            now

    };


    await firebaseSet(
        folderRef,
        folderData
    );


    fileStoreFolders[
        folderId
    ] =
        folderData;


    renderFileStore();

    renderFileStoreHome();


    await writeAuditLog(

        "FILE_STORE_CREATE_FOLDER",

        `Created folder "${cleanName}".`

    );

}

function createRecentDocumentCard(
    file,
    type = "added"
){

    if(!file){

        return document.createElement("div");

    }


    // -----------------------------------------
    // CREATE CARD
    // -----------------------------------------

    const card =
        document.createElement(
            "button"
        );


    card.type =
        "button";


    card.className =
        "fs-recent-file";


    // -----------------------------------------
    // FILE INFORMATION
    // -----------------------------------------

    const fileName =
        file.name ||
        "Document";


    const uploadedBy =
        file.uploadedBy ||
        file.createdByUsername ||
        "Unknown";


    const date =
        type === "opened"

            ?

        file.recentTimestamp

            :

        file.uploadedAt ||
        file.createdAt;


    // -----------------------------------------
    // CONTENT
    // -----------------------------------------

    card.innerHTML = `

        <span class="fs-recent-file-icon">

            ${getFileStoreIcon
                ? getFileStoreIcon(
                    file.type,
                    file.name
                )
                : "📄"
            }

        </span>


        <span class="fs-recent-file-info">

            <strong>

                ${escapeFileStoreHtml(
                    fileName
                )}

            </strong>


            <small>

                ${escapeFileStoreHtml(
                    uploadedBy
                )}

                ·

                ${formatFileStoreDate(
                    date
                )}

            </small>

        </span>


        <span class="fs-recent-arrow">

            →

        </span>

    `;


    // -----------------------------------------
    // CLICK
    // -----------------------------------------

    card.addEventListener(
        "click",
        () => {

            fileStoreSelectedFile = {

                ...file,

                id:
                    file.id

            };


            if(
                type === "opened"
            ){

                viewFileStoreDocument();

            }
            else{

                openFileInfoModal(
                    file
                );

            }

        }
    );


    return card;

}

// =========================================================
// RENDER FILE STORE HOME
// =========================================================

function renderFileStoreHome(){

    const homeView =
        document.getElementById(
            "fileStoreHomeView"
        );


    if(!homeView){

        return;

    }


    // =====================================================
    // RECENTLY ADDED DOCUMENTS
    // =====================================================

    const recentAddedContainer =
        document.getElementById(
            "fileStoreRecentAddedDocuments"
        );


    const recentAddedCount =
        document.getElementById(
            "fileStoreRecentAddedCount"
        );


    if(recentAddedContainer){

        recentAddedContainer.innerHTML =
            "";


        const recentAdded =
            getFileStoreRecentFiles(
                "added"
            );


        if(recentAddedCount){

            recentAddedCount.textContent =
                recentAdded.length;

        }


        if(
            recentAdded.length ===
            0
        ){

            recentAddedContainer.innerHTML = `

                <div class="fs-home-empty">

                    <span class="fs-home-empty-icon">
                        📄
                    </span>

                    <strong>
                        No documents yet
                    </strong>

                    <p>
                        Newly added documents will appear here.
                    </p>

                </div>

            `;

        }
        else{

            recentAdded.forEach(
    file => {

        recentAddedContainer
            .appendChild(
                createRecentDocumentCard(
                    file,
                    "added"
                )
            );

    }
);

        }

    }


    // =====================================================
    // RECENTLY OPENED DOCUMENTS
    // =====================================================

    const recentOpenedContainer =
        document.getElementById(
            "fileStoreRecentOpenedDocuments"
        );


    const recentOpenedCount =
        document.getElementById(
            "fileStoreRecentOpenedCount"
        );


    if(recentOpenedContainer){

        recentOpenedContainer.innerHTML =
            "";


        const recentOpened =
            getFileStoreRecentFiles(
                "opened"
            );


        if(recentOpenedCount){

            recentOpenedCount.textContent =
                recentOpened.length;

        }


        if(
            recentOpened.length ===
            0
        ){

            recentOpenedContainer.innerHTML = `

                <div class="fs-home-empty">

                    <span class="fs-home-empty-icon">
                        👁️
                    </span>

                    <strong>
                        No documents opened yet
                    </strong>

                    <p>
                        Documents you open will appear here.
                    </p>

                </div>

            `;

        }
        else{

            recentOpened.forEach(
    file => {

        recentOpenedContainer
            .appendChild(
                createRecentDocumentCard(
                    file,
                    "opened"
                )
            );

    }
);

        }

    }

}

// =========================================================
// OPEN FOLDER
// =========================================================

function openFileStoreFolder(
    folderId
){

    const folder =
        fileStoreFolders[
            folderId
        ];


    if(
        !folder
    ){

        return;

    }


    fileStoreCurrentFolderId =
        folderId;


    fileStoreCurrentFolderName =
        folder.name ||
        "Folder";


    fileStoreCurrentFolderParentId =
        folder.parentId ||
        null;


    // -----------------------------------------
    // KEEP SECTION
    // -----------------------------------------

    fileStoreCurrentSectionId =
        folder.sectionId ||
        null;


    if(
        fileStoreCurrentSectionId
    ){

        const section =
            fileStoreSections[
                fileStoreCurrentSectionId
            ];


        fileStoreCurrentSectionName =
            section?.name ||
            "Section";

    }


    const homeView =
        document.getElementById(
            "fileStoreHomeView"
        );


    const browserView =
        document.getElementById(
            "fileStoreBrowserView"
        );


    if(
        homeView
    ){

        homeView.style.display =
            "none";

    }


    if(
        browserView
    ){

        browserView.style.display =
            "block";

    }


    renderFileStoreSections();

    renderFileStore();

}

// =========================================================
// GO HOME
// =========================================================

function goFileStoreHome(){

    fileStoreCurrentSectionId =
        null;


    fileStoreCurrentSectionName =
        "Home";


    fileStoreCurrentFolderId =
        null;


    fileStoreCurrentFolderName =
        "Home";


    fileStoreCurrentFolderParentId =
        null;


    const homeView =
        document.getElementById(
            "fileStoreHomeView"
        );


    const browserView =
        document.getElementById(
            "fileStoreBrowserView"
        );


    if(
        homeView
    ){

        homeView.style.display =
            "block";

    }


    if(
        browserView
    ){

        browserView.style.display =
            "none";

    }


    renderFileStoreHome();

    renderFileStoreSections();

}


// =========================================================
// GO TO PARENT
// =========================================================

function goFileStoreParent(){

    // -----------------------------------------
    // NO FOLDER
    // -----------------------------------------

    if(
        !fileStoreCurrentFolderId
    ){

        return;

    }


    // -----------------------------------------
    // CURRENT PARENT
    // -----------------------------------------

    const parentId =
        fileStoreCurrentFolderParentId;


    // =====================================================
    // TOP-LEVEL FOLDER
    // =====================================================
    //
    // parentId === null means:
    // go back to the ROOT of the current SECTION.
    //
    // It must NOT go to Home.
    // =====================================================

    if(!parentId){

        fileStoreCurrentFolderId =
            null;


        fileStoreCurrentFolderName =
            fileStoreCurrentSectionName ||
            "Section";


        fileStoreCurrentFolderParentId =
            null;


        // Keep the current section

        // fileStoreCurrentSectionId
        // stays unchanged.


        // Make sure we remain in Explorer

        const homeView =
            document.getElementById(
                "fileStoreHomeView"
            );


        const browserView =
            document.getElementById(
                "fileStoreBrowserView"
            );


        if(homeView){

            homeView.style.display =
                "none";

        }


        if(browserView){

            browserView.style.display =
                "block";

        }


        renderFileStoreSections();

        renderFileStore();

        return;

    }


    // =====================================================
    // NORMAL CHILD FOLDER
    // =====================================================

    const parentFolder =
        fileStoreFolders[
            parentId
        ];


    if(!parentFolder){

        console.error(
            "FILE STORE — Parent folder not found:",
            parentId
        );

        return;

    }


    // -----------------------------------------
    // MOVE TO PARENT
    // -----------------------------------------

    fileStoreCurrentFolderId =
        parentId;


    fileStoreCurrentFolderName =
        parentFolder.name ||
        "Folder";


    fileStoreCurrentFolderParentId =
        parentFolder.parentId ||
        null;


    // -----------------------------------------
    // KEEP SECTION
    // -----------------------------------------

    fileStoreCurrentSectionId =
        parentFolder.sectionId ||
        fileStoreCurrentSectionId;


    if(
        fileStoreCurrentSectionId
    ){

        const section =
            fileStoreSections[
                fileStoreCurrentSectionId
            ];


        fileStoreCurrentSectionName =
            section?.name ||
            fileStoreCurrentSectionName ||
            "Section";

    }


    // -----------------------------------------
    // RENDER
    // -----------------------------------------

    renderFileStoreSections();

    renderFileStore();

}

// =========================================================
// GET CURRENT ITEMS
// =========================================================

function getCurrentFileStoreItems(){

    const folders =
        [];


    const files =
        [];


    Object.entries(
        fileStoreFolders
    )
        .forEach(
            ([id,folder]) => {

                const parentId =
                    folder.parentId ||
                    null;


                const sectionId =
                    folder.sectionId ||
                    null;


                if(

                    sectionId ===
                    fileStoreCurrentSectionId

                    &&

                    parentId ===
                    fileStoreCurrentFolderId

                ){

                    folders.push({

                        id,

                        ...folder

                    });

                }

            }
        );


    Object.entries(
        fileStoreFiles
    )
        .forEach(
            ([id,file]) => {

                const folderId =
                    file.folderId ||
                    null;


                const folder =
                    fileStoreFolders[
                        folderId
                    ];


                const fileSectionId =
                    folder?.sectionId ||
                    null;


                if(

                    fileSectionId ===
                    fileStoreCurrentSectionId

                    &&

                    folderId ===
                    fileStoreCurrentFolderId

                ){

                    files.push({

                        id,

                        ...file

                    });

                }

            }
        );


    return {

        folders,

        files

    };

}

// =========================================================
// RENDER FILE STORE — EXPLORER VIEW
// =========================================================

function renderFileStore(){

    const container =
        document.getElementById(
            "fileStoreItems"
        );


    if(!container){

        return;

    }


    container.innerHTML =
        "";


    const {
        folders,
        files
    } =
        getCurrentFileStoreItems();



// -----------------------------------------
// CURRENT LOCATION HEADER
// -----------------------------------------

const locationName =
    document.getElementById(
        "fileStoreCurrentLocationName"
    );


const itemCount =
    document.getElementById(
        "fileStoreItemCount"
    );


if(locationName){

    locationName.textContent =

        fileStoreCurrentFolderId

            ?

        (
            fileStoreCurrentFolderName ||
            "Folder"
        )

            :

        (
            fileStoreCurrentSectionId

                ?

            (
                fileStoreCurrentSectionName ||
                "Section"
            )

                :

            "Home"
        );

}


if(itemCount){

    const totalItems =
        folders.length +
        files.length;


    itemCount.textContent =
        `${totalItems} ${
            totalItems === 1
                ? "item"
                : "items"
        }`;

}

    // =====================================================
    // FOLDERS
    // =====================================================

    folders
        .sort(
            (a,b) =>
                String(a.name || "")
                    .localeCompare(
                        String(b.name || "")
                    )
        )
        .forEach(
            folder => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "fs-item fs-folder-item";


                item.dataset.name =
                    folder.name ||
                    "";


                item.dataset.type =
                    "folder";


                item.innerHTML = `

                    <div class="fs-item-main">

                        <div class="fs-item-icon">
                            📁
                        </div>


                        <div class="fs-item-information">

                            <div class="fs-item-name">

                                ${escapeFileStoreHtml(
                                    folder.name
                                )}

                            </div>


                            <div class="fs-item-meta">

                                <span>
                                    Folder
                                </span>

                                <span>
                                    Added
                                    ${formatFileStoreDate(
                                        folder.createdAt
                                    )}
                                </span>

                                <span>
                                    ${escapeFileStoreHtml(
                                        folder.createdBy ||
                                        "Unknown"
                                    )}
                                </span>

                            </div>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="fs-item-actions"
                        title="Folder actions"
                        aria-label="Folder actions"
                    >
                        ⋮
                    </button>

                `;


                // -----------------------------------------
                // OPEN FOLDER
                // -----------------------------------------

                item.addEventListener(
                    "click",
                    event => {

                        if(
                            event.target.closest(
                                ".fs-item-actions"
                            )
                        ){

                            return;

                        }


                        openFileStoreFolder(
                            folder.id
                        );

                    }
                );


                // -----------------------------------------
                // ACTIONS
                // -----------------------------------------

                const actionsButton =
                    item.querySelector(
                        ".fs-item-actions"
                    );


                if(actionsButton){

                    actionsButton.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();


                            openFileStoreItemActions(
                                "folder",
                                folder
                            );

                        }
                    );

                }


                container.appendChild(
                    item
                );

            }
        );


    // =====================================================
    // FILES
    // =====================================================

    files
        .sort(
            (a,b) =>
                String(a.name || "")
                    .localeCompare(
                        String(b.name || "")
                    )
        )
        .forEach(
            file => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "fs-item fs-file-item";


                item.dataset.name =
                    file.name ||
                    "";


                item.dataset.type =
                    "file";


                item.innerHTML = `

                    <div class="fs-item-main">

                        <div class="fs-item-icon">

                            ${getFileStoreIcon(
                                file.type,
                                file.name
                            )}

                        </div>


                        <div class="fs-item-information">

                            <div class="fs-item-name">

                                ${escapeFileStoreHtml(
                                    file.name
                                )}

                            </div>


                            <div class="fs-item-meta">

                                <span>
                                    ${escapeFileStoreHtml(
                                        file.type ||
                                        "Document"
                                    )}
                                </span>

                                <span>
                                    ${formatFileStoreSize(
                                        file.size
                                    )}
                                </span>

                                <span>
                                    Added
                                    ${formatFileStoreDate(
                                        file.uploadedAt
                                    )}
                                </span>

                                <span>
                                    ${escapeFileStoreHtml(
                                        file.uploadedBy ||
                                        "Unknown"
                                    )}
                                </span>

                            </div>

                        </div>

                    </div>

                `;


                // -----------------------------------------
// OPEN FILE ACTIONS
// -----------------------------------------

item.addEventListener(
    "click",
    event => {

        if(
            event.target.closest(
                ".fs-item-actions"
            )
        ){

            return;

        }


        openFileStoreItemActions(
            "file",
            file
        );

    }
);


                // -----------------------------------------
                // ACTIONS
                // -----------------------------------------

                const actionsButton =
                    item.querySelector(
                        ".fs-item-actions"
                    );


                if(actionsButton){

                    actionsButton.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();


                            openFileStoreItemActions(
                                "file",
                                file
                            );

                        }
                    );

                }


                container.appendChild(
                    item
                );

            }
        );


    // =====================================================
    // BREADCRUMB
    // =====================================================

    updateFileStoreBreadcrumb();


    // =====================================================
    // EMPTY STATE
    // =====================================================

    updateFileStoreEmptyState();


    // =====================================================
    // PARENT BUTTON
    // =====================================================

    const parentButton =
        document.getElementById(
            "goParentButton"
        );


    if(parentButton){

        parentButton.style.display =
            fileStoreCurrentFolderId
                ? "inline-flex"
                : "none";

    }

}

// =========================================================
// ITEM ACTIONS — PLACEHOLDER
// =========================================================

// =========================================================
// FILE STORE — ITEM ACTIONS MODAL
// REUSES EXISTING FILE STORE MODAL SYSTEM
// =========================================================

function openFileStoreItemActions(
    type,
    item
){

    if(!item){

        return;

    }


    const existingModal =
        document.getElementById(
            "fileStoreItemActionsModal"
        );


    if(existingModal){

        existingModal.remove();

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "fileStoreItemActionsModal";


    modal.className =
        "fs-modal-overlay";


    const isFolder =
        type === "folder";


    const itemName =
        escapeFileStoreHtml(
            item.name ||
            (
                isFolder
                    ? "Folder"
                    : "Document"
            )
        );


    const icon =
        isFolder
            ? "📁"
            : getFileStoreIcon(
                item.type,
                item.name
            );


    modal.innerHTML = `

        <div
            class="fs-modal fs-small-modal"
            role="dialog"
            aria-modal="true"
        >


            <button
                type="button"
                class="fs-modal-close"
                aria-label="Close"
                data-action-close
            >
                ×
            </button>


            <div class="fs-modal-content">


                <div class="fs-action-header">


                    <div class="fs-action-icon">

                        ${icon}

                    </div>


                    <div>

                        <span class="fs-modal-eyebrow">

                            ${
                                isFolder
                                    ? "FOLDER"
                                    : "DOCUMENT"
                            }

                        </span>


                        <h2>

                            ${itemName}

                        </h2>

                    </div>

                </div>


                <p>

                    Select an action for this
                    ${
                        isFolder
                            ? "folder"
                            : "document"
                    }.

                </p>


                <div class="fs-action-list">


                    ${
                        isFolder

                            ?

                        `

                        <button
                            type="button"
                            class="fs-action-row"
                            data-action="open"
                        >

                            <span>
                                📂
                            </span>

                            <div>

                                <strong>
                                    Open Folder
                                </strong>

                                <small>
                                    Browse this folder
                                </small>

                            </div>

                        </button>

                        `

                            :

                        `

                        <button
                            type="button"
                            class="fs-action-row"
                            data-action="info"
                        >

                            <span>
                                ℹ️
                            </span>

                            <div>

                                <strong>
                                    View Information
                                </strong>

                                <small>
                                    File details and metadata
                                </small>

                            </div>

                        </button>


                        <button
                            type="button"
                            class="fs-action-row"
                            data-action="view"
                        >

                            <span>
                                👁
                            </span>

                            <div>

                                <strong>
                                    View Document
                                </strong>

                                <small>
                                    Open the document
                                </small>

                            </div>

                        </button>


                        <button
                            type="button"
                            class="fs-action-row"
                            data-action="download"
                        >

                            <span>
                                ↓
                            </span>

                            <div>

                                <strong>
                                    Download
                                </strong>

                                <small>
                                    Save a local copy
                                </small>

                            </div>

                        </button>

                        `

                    }


                    <button
                        type="button"
                        class="fs-action-row"
                        data-action="rename"
                    >

                        <span>
                            ✏️
                        </span>

                        <div>

                            <strong>
                                Rename
                            </strong>

                            <small>
                                Change the name
                            </small>

                        </div>

                    </button>


                    <button
                        type="button"
                        class="fs-action-row"
                        data-action="move"
                    >

                        <span>
                            ↗
                        </span>

                        <div>

                            <strong>
                                Move
                            </strong>

                            <small>
                                Move to another location
                            </small>

                        </div>

                    </button>


                    <button
                        type="button"
                        class="fs-action-row fs-action-danger"
                        data-action="delete"
                    >

                        <span>
                            🗑
                        </span>

                        <div>

                            <strong>
                                Delete
                            </strong>

                            <small>
                                Permanently remove
                            </small>

                        </div>

                    </button>


                </div>


            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    modal.style.display =
        "flex";


    // =====================================================
    // CLOSE
    // =====================================================

    const closeModal =
        () => {

            modal.remove();

        };


    modal
        .querySelectorAll(
            "[data-action-close]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    closeModal
                );

            }
        );


    modal.addEventListener(
        "click",
        event => {

            if(
                event.target ===
                modal
            ){

                closeModal();

            }

        }
    );


    // =====================================================
    // ACTIONS
    // =====================================================

    modal
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const action =
                            button.dataset.action;


                        closeModal();


                        // ---------------------------------
                        // OPEN FOLDER
                        // ---------------------------------

                        if(
                            action ===
                            "open"
                        ){

                            openFileStoreFolder(
                                item.id
                            );

                            return;

                        }


                        // ---------------------------------
                        // FILE INFORMATION
                        // ---------------------------------

                        if(
                            action ===
                            "info"
                        ){

                            openFileInfoModal(
                                item
                            );

                            return;

                        }


                        // ---------------------------------
                        // VIEW DOCUMENT
                        // ---------------------------------

                        if(
    action ===
    "view"
){

    // -----------------------------------------
    // REGISTER GLOBAL RECENTLY OPENED
    // -----------------------------------------

    if(
        item &&
        item.id
    ){

        registerFileStoreRecentOpened(
            item.id
        )
        .then(
            () => {

                renderFileStoreHome();

            }
        )
        .catch(
            error => {

                console.error(
                    "FILE STORE — Failed to register Recently Opened:",
                    error
                );

            }
        );

    }


    // -----------------------------------------
    // SELECT DOCUMENT
    // -----------------------------------------

    fileStoreSelectedFile =
        item;


    // -----------------------------------------
    // OPEN DOCUMENT
    // -----------------------------------------

    viewFileStoreDocument();


    return;

}


                        // ---------------------------------
                        // DOWNLOAD
                        // ---------------------------------

                        if(
                            action ===
                            "download"
                        ){

                            fileStoreSelectedFile =
                                item;


                            downloadFileStoreDocument();

                            return;

                        }


                        // ---------------------------------
                        // RENAME
                        // ---------------------------------

                        if(
                            action ===
                            "rename"
                        ){

                            openFileStoreRenameModal(
                                type,
                                item
                            );

                            return;

                        }


                        // ---------------------------------
                        // MOVE
                        // ---------------------------------

                        if(
                            action ===
                            "move"
                        ){

                            openFileStoreMoveModal(
                                type,
                                item
                            );

                            return;

                        }


                        // ---------------------------------
                        // DELETE
                        // ---------------------------------

                        if(
                            action ===
                            "delete"
                        ){

                            openFileStoreDeleteModal(
                                type,
                                item
                            );

                            return;

                        }

                    }
                );

            }
        );

}

// =========================================================
// BREADCRUMB — SECTION + FOLDER PATH
// =========================================================

function updateFileStoreBreadcrumb(){

    const breadcrumb =
        document.getElementById(
            "fileStoreBreadcrumb"
        );


    if(!breadcrumb){

        return;

    }


    // =====================================================
    // HOME
    // =====================================================

    if(!fileStoreCurrentSectionId){

        breadcrumb.innerHTML = `
            <span class="fs-breadcrumb-current">
                Home
            </span>
        `;

        return;

    }


    // =====================================================
    // CURRENT SECTION
    // =====================================================

    const section =
        fileStoreSections[
            fileStoreCurrentSectionId
        ];


    if(!section){

        breadcrumb.innerHTML = `
            <span class="fs-breadcrumb-current">
                Home
            </span>
        `;

        return;

    }


    // =====================================================
    // BUILD FOLDER PATH
    // =====================================================

    const folderPath = [];


    let currentFolderId =
        fileStoreCurrentFolderId;


    while(currentFolderId){

        const folder =
            fileStoreFolders[
                currentFolderId
            ];


        if(!folder){

            break;

        }


        folderPath.unshift(
            folder.name
        );


        currentFolderId =
            folder.parentId || null;

    }


    // =====================================================
    // BUILD BREADCRUMB
    // =====================================================

    const breadcrumbParts = [];


    // SECTION

    breadcrumbParts.push(`

        <span
            class="fs-breadcrumb-current"
            data-breadcrumb-section
        >
            ${escapeFileStoreHtml(
                section.name
            )}
        </span>

    `);


    // FOLDERS

    folderPath.forEach(
        folderName => {

            breadcrumbParts.push(`

                <span
                    class="fs-breadcrumb-separator"
                    aria-hidden="true"
                >
                    /
                </span>

                <span
                    class="fs-breadcrumb-folder"
                >
                    ${escapeFileStoreHtml(
                        folderName
                    )}
                </span>

            `);

        }
    );


    breadcrumb.innerHTML =
        breadcrumbParts.join("");


    // =====================================================
    // SECTION CLICK
    // =====================================================

    const sectionLink =
        breadcrumb.querySelector(
            "[data-breadcrumb-section]"
        );


    if(sectionLink){

        sectionLink.addEventListener(
            "click",
            () => {

                openFileStoreSection(
                    fileStoreCurrentSectionId
                );

            }
        );

    }

}


// =========================================================
// GLOBAL FILE STORE SEARCH
// =========================================================

function handleFileStoreSearch(
    value
){

    const search =
        String(
            value || ""
        )
            .trim()
            .toLowerCase();


    const resultsContainer =
        document.getElementById(
            "fileStoreSearchResults"
        );


    // -----------------------------------------
    // NO SEARCH
    // -----------------------------------------

    if(
        !search
    ){

        if(resultsContainer){

            resultsContainer.innerHTML =
                "";

            resultsContainer.style.display =
                "none";

        }

        return;

    }


    // -----------------------------------------
    // SAFETY
    // -----------------------------------------

    if(
        !resultsContainer
    ){

        console.warn(
            "FILE STORE — Search results container not found."
        );

        return;

    }


    const results = [];


    // =====================================================
    // SEARCH FOLDERS
    // =====================================================

    Object.entries(
        fileStoreFolders
    )
        .forEach(
            ([id, folder]) => {

                const name =
                    String(
                        folder.name ||
                        ""
                    );


                if(
                    name
                        .toLowerCase()
                        .includes(
                            search
                        )
                ){

                    results.push({

                        type:
                            "folder",

                        id,

                        name,

                        sectionId:
                            folder.sectionId ||
                            null,

                        parentId:
                            folder.parentId ||
                            null,

                        createdAt:
                            folder.createdAt ||
                            0

                    });

                }

            }
        );


    // =====================================================
    // SEARCH DOCUMENTS
    // =====================================================

    Object.entries(
        fileStoreFiles
    )
        .forEach(
            ([id, file]) => {

                const name =
                    String(
                        file.name ||
                        ""
                    );


                if(
                    name
                        .toLowerCase()
                        .includes(
                            search
                        )
                ){

                    results.push({

                        type:
                            "file",

                        id,

                        name,

                        sectionId:
                            fileStoreFolders[
                                file.folderId
                            ]?.sectionId ||
                            null,

                        folderId:
                            file.folderId ||
                            null,

                        file,

                        uploadedAt:
                            file.uploadedAt ||
                            0

                    });

                }

            }
        );


    // =====================================================
    // SORT
    // =====================================================

    results.sort(
        (a,b) => {

            // Exact name first
            const aExact =
                a.name
                    .toLowerCase() ===
                search
                    ? 0
                    : 1;


            const bExact =
                b.name
                    .toLowerCase() ===
                search
                    ? 0
                    : 1;


            if(
                aExact !==
                bExact
            ){

                return aExact -
                       bExact;

            }


            // Folders before files
            if(
                a.type !==
                b.type
            ){

                return (
                    a.type ===
                    "folder"
                )
                    ? -1
                    : 1;

            }


            return String(
                a.name
            )
                .localeCompare(
                    String(
                        b.name
                    )
                );

        }
    );


    // =====================================================
    // LIMIT RESULTS
    // =====================================================

    const visibleResults =
        results.slice(
            0,
            20
        );


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeSearchText(
        text
    ){

        return String(
            text || ""
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


    // =====================================================
    // HIGHLIGHT SEARCH TERM
    // =====================================================

    function highlightSearchText(
        text
    ){

        const escaped =
            escapeSearchText(
                text
            );


        const escapedSearch =
            escapeSearchText(
                search
            );


        if(
            !escapedSearch
        ){

            return escaped;

        }


        const regex =
            new RegExp(
                escapedSearch
                    .replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    ),
                "gi"
            );


        return escaped.replace(
            regex,
            match => `

                <span class="fs-search-highlight">
                    ${match}
                </span>

            `
        );

    }


    // =====================================================
    // NO RESULTS
    // =====================================================

    if(
        visibleResults.length ===
        0
    ){

        resultsContainer.innerHTML = `

            <div class="fs-search-results-header">

                <strong>
                    SEARCH RESULTS
                </strong>

                <span>
                    0 results
                </span>

            </div>


            <div class="fs-search-no-results">

                <div class="fs-search-no-results-icon">
                    🔎
                </div>

                <strong>
                    No results found
                </strong>

                <p>
                    Try another folder or document name.
                </p>

            </div>

        `;


        resultsContainer.style.display =
            "block";


        return;

    }


    // =====================================================
    // RESULTS HEADER
    // =====================================================

    resultsContainer.innerHTML = `

        <div class="fs-search-results-header">

            <strong>
                SEARCH RESULTS
            </strong>

            <span>
                ${
                    results.length
                }

                ${
                    results.length === 1
                        ? "result"
                        : "results"
                }

            </span>

        </div>

    `;


    // =====================================================
    // RESULT CARDS
    // =====================================================

    visibleResults.forEach(
        result => {

            const row =
                document.createElement(
                    "button"
                );


            row.type =
                "button";


            row.className =
                "fs-search-result";


            row.dataset.type =
                result.type;


            row.innerHTML = `

                <span class="fs-search-result-icon">

                    ${
                        result.type ===
                        "folder"

                            ? "📁"

                            : getFileStoreIcon(
                                result.file?.type,
                                result.name
                            )

                    }

                </span>


                <span class="fs-search-result-info">

                    <span class="fs-search-result-name">

                        ${
                            highlightSearchText(
                                result.name,
                                search
                            )
                        }

                    </span>


                    <span class="fs-search-result-path">

                        ${
                            result.type ===
                            "folder"

                                ? getFileStoreFolderSearchPath(
                                    result.id
                                )

                                : getFileStoreFileSearchPath(
                                    result.file
                                )

                        }

                    </span>

                </span>


                <span class="fs-search-result-arrow">
                    →
                </span>

            `;


            // -----------------------------------------
            // CLICK RESULT
            // -----------------------------------------

            row.addEventListener(
                "click",
                () => {

                    // ---------------------------------
                    // FOLDER
                    // ---------------------------------

                    if(
                        result.type ===
                        "folder"
                    ){

                        openFileStoreSearchFolder(
                            result.id
                        );

                    }

                    // ---------------------------------
                    // DOCUMENT
                    // ---------------------------------

                    else{

                        openFileStoreSearchFile(
                            result.file
                        );

                    }


                    const searchInput =
                        document.getElementById(
                            "fileStoreSearch"
                        );


                    if(searchInput){

                        searchInput.value =
                            "";

                    }


                    resultsContainer.innerHTML =
                        "";

                    resultsContainer.style.display =
                        "none";

                }
            );


            resultsContainer.appendChild(
                row
            );

        }
    );


    resultsContainer.style.display =
        "block";

}


// =========================================================
// SEARCH — FOLDER PATH
// =========================================================

function getFileStoreFolderSearchPath(
    folderId
){

    const folder =
        fileStoreFolders[
            folderId
        ];


    if(
        !folder
    ){

        return "File Store";

    }


    const section =
        fileStoreSections[
            folder.sectionId
        ];


    const parts = [];


    if(section){

        parts.push(
            section.name ||
            "Section"
        );

    }


    const folderPath =
        getFileStoreFolderPath(
            folderId
        );


    if(folderPath){

        parts.push(
            folderPath
        );

    }


    return parts.join(
        " / "
    );

}


// =========================================================
// SEARCH — FILE PATH
// =========================================================

function getFileStoreFileSearchPath(
    file
){

    if(
        !file
    ){

        return "File Store";

    }


    const folder =
        fileStoreFolders[
            file.folderId
        ];


    const section =
        folder
            ? fileStoreSections[
                folder.sectionId
            ]
            : null;


    const parts = [];


    if(section){

        parts.push(
            section.name ||
            "Section"
        );

    }


    if(folder){

        const folderPath =
            getFileStoreFolderPath(
                file.folderId
            );


        if(folderPath){

            parts.push(
                folderPath
            );

        }

    }


    return parts.join(
        " / "
    ) ||
    "File Store";

}


// =========================================================
// SEARCH — OPEN FOLDER
// =========================================================

function openFileStoreSearchFolder(
    folderId
){

    const folder =
        fileStoreFolders[
            folderId
        ];


    if(
        !folder
    ){

        return;

    }


    const sectionId =
        folder.sectionId ||
        null;


    fileStoreCurrentSectionId =
        sectionId;


    fileStoreCurrentSectionName =
        fileStoreSections[
            sectionId
        ]?.name ||
        "Section";


    fileStoreCurrentFolderId =
        folderId;


    fileStoreCurrentFolderName =
        folder.name ||
        "Folder";


    fileStoreCurrentFolderParentId =
        folder.parentId ||
        null;


    const homeView =
        document.getElementById(
            "fileStoreHomeView"
        );


    const browserView =
        document.getElementById(
            "fileStoreBrowserView"
        );


    if(homeView){

        homeView.style.display =
            "none";

    }


    if(browserView){

        browserView.style.display =
            "block";

    }


    renderFileStoreSections();

    renderFileStore();

}


// =========================================================
// SEARCH — OPEN FILE
// =========================================================

function openFileStoreSearchFile(
    file
){

    if(
        !file
    ){

        return;

    }


    const folder =
        fileStoreFolders[
            file.folderId
        ];


    if(
        folder
    ){

        fileStoreCurrentSectionId =
            folder.sectionId ||
            null;


        fileStoreCurrentSectionName =
            fileStoreSections[
                folder.sectionId
            ]?.name ||
            "Section";


        fileStoreCurrentFolderId =
            folder.id ||
            file.folderId ||
            null;


        fileStoreCurrentFolderName =
            folder.name ||
            "Folder";


        fileStoreCurrentFolderParentId =
            folder.parentId ||
            null;


        const homeView =
            document.getElementById(
                "fileStoreHomeView"
            );


        const browserView =
            document.getElementById(
                "fileStoreBrowserView"
            );


        if(homeView){

            homeView.style.display =
                "none";

        }


        if(browserView){

            browserView.style.display =
                "block";

        }


        renderFileStoreSections();

        renderFileStore();

    }


    // Open the existing document menu.
    openFileInfoModal(
        file
    );

}


// =========================================================
// CREATE / ENSURE SEARCH RESULTS CONTAINER
// =========================================================

function createFileStoreSearchResults(){

    const wrapper =
        document.querySelector(
            "#fileStoreContainer .fs-search-wrapper"
        );


    if(!wrapper){

        console.warn(
            "FILE STORE — Search wrapper not found."
        );

        return null;

    }


    // -----------------------------------------
    // ALREADY EXISTS
    // -----------------------------------------

    let results =
        document.getElementById(
            "fileStoreSearchResults"
        );


    if(results){

        return results;

    }


    // -----------------------------------------
    // CREATE
    // -----------------------------------------

    results =
        document.createElement(
            "div"
        );


    results.id =
        "fileStoreSearchResults";


    results.className =
        "fs-search-results";


    results.style.display =
        "none";


    wrapper.appendChild(
        results
    );


    return results;

}

// =========================================================
// SEARCH HIGHLIGHT
// =========================================================

function highlightFileStoreSearch(
    text,
    search
){

    const safeText =
        escapeFileStoreHtml(
            text ||
            ""
        );


    if(!search){

        return safeText;

    }


    const escapedSearch =
        String(search)
            .replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );


    const regex =
        new RegExp(
            `(${escapedSearch})`,
            "gi"
        );


    return safeText.replace(
        regex,
        `<mark class="fs-search-highlight">$1</mark>`
    );

}


// =========================================================
// GET SEARCH RESULT PATH
// =========================================================

function getFileStoreFolderSearchPath(
    folderId
){

    if(!folderId){

        return "Section root";

    }


    const parts =
        [];


    let currentId =
        folderId;


    let safetyCounter =
        0;


    while(
        currentId &&
        safetyCounter < 100
    ){

        const folder =
            fileStoreFolders[
                currentId
            ];


        if(!folder){

            break;

        }


        parts.unshift(
            folder.name ||
            "Folder"
        );


        currentId =
            folder.parentId ||
            null;


        safetyCounter++;

    }


    return parts.join(
        " / "
    );

}


// =========================================================
// CLOSE SEARCH
// =========================================================

function closeFileStoreSearch(){

    const results =
        document.getElementById(
            "fileStoreSearchResults"
        );


    if(results){

        results.style.display =
            "none";

    }

}


// =========================================================
// SEARCH — OUTSIDE CLICK
// =========================================================

document.addEventListener(
    "click",
    event => {

        const container =
            document.getElementById(
                "fileStoreContainer"
            );


        if(!container){

            return;

        }


        const searchSection =
            container.querySelector(
                ".fs-search-section"
            );


        if(
            searchSection &&
            !searchSection.contains(
                event.target
            )
        ){

            closeFileStoreSearch();

        }

    }
);


// =========================================================
// SEARCH — ESCAPE
// =========================================================

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key !==
            "Escape"
        ){

            return;

        }


        closeFileStoreSearch();

    }
);



// =========================================================
// NEW FOLDER MODAL
// =========================================================

function openNewFolderModal(){

    const modal =
        document.getElementById(
            "newFolderModal"
        );


    const input =
        document.getElementById(
            "newFolderName"
        );


    if(!modal){

        console.error(
            "FILE STORE — newFolderModal not found."
        );

        return;

    }


    // -----------------------------------------
    // SHOW CURRENT LOCATION
    // -----------------------------------------

    const locationText =
        document.getElementById(
            "newFolderLocationText"
        );


    if(locationText){

        locationText.textContent =
            getFileStoreCurrentPath();

    }


    // -----------------------------------------
    // OPEN
    // -----------------------------------------

    modal.style.display =
        "flex";


    // -----------------------------------------
    // RESET INPUT
    // -----------------------------------------

    if(input){

        input.value =
            "";


        setTimeout(
            () => {

                input.focus();

            },
            50
        );

    }

}

function closeNewFolderModal(){

    const modal =
        document.getElementById(
            "newFolderModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }

}


// =========================================================
// UPLOAD MODAL
// =========================================================

function openUploadModal(){

    const modal =
        document.getElementById(
            "uploadModal"
        );


    if(!modal){

        console.error(
            "FILE STORE — uploadModal not found."
        );

        return;

    }


    // -----------------------------------------
    // CURRENT LOCATION
    // -----------------------------------------

    const currentPath =
        getFileStoreCurrentPath();


    const locationText =
        document.getElementById(
            "uploadDocumentLocationText"
        );


    const destinationText =
        document.getElementById(
            "uploadDocumentDestination"
        );


    if(locationText){

        locationText.textContent =
            currentPath;

    }


    if(destinationText){

        destinationText.textContent =
            currentPath;

    }


    // -----------------------------------------
    // CURRENT ADMIN
    // -----------------------------------------

    const userText =
        document.getElementById(
            "uploadDocumentUser"
        );


    if(userText){

        userText.textContent =
            getCurrentFullName();

    }


    // -----------------------------------------
    // RESET FILE
    // -----------------------------------------

    const fileInput =
        document.getElementById(
            "fileStoreUploadInput"
        );


    const selectedFile =
        document.getElementById(
            "uploadFileName"
        );


    if(fileInput){

        fileInput.value =
            "";

    }


    if(selectedFile){

        selectedFile.textContent =
            "";

    }


    // -----------------------------------------
    // OPEN
    // -----------------------------------------

    modal.style.display =
        "flex";

}


function closeUploadModal(){

    const modal =
        document.getElementById(
            "uploadModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }


    const input =
        document.getElementById(
            "fileStoreUploadInput"
        );


    const selected =
        document.getElementById(
            "uploadFileName"
        );


    if(input){

        input.value =
            "";

    }


    if(selected){

        selected.textContent =
            "";

    }

}


/// =========================================================
// FILE STORE — EXISTING FIREBASE STORAGE
// =========================================================
//
// Uses the Firebase App already initialised by the
// main Ryanair Dashboard.
//
// No second Firebase configuration.
// No second Firebase App.
// =========================================================

async function getFileStoreStorage(){

    // -----------------------------------------
    // RETURN CACHE
    // -----------------------------------------

    if(
        fileStoreStorage
    ){

        return fileStoreStorage;

    }


    // -----------------------------------------
    // FIREBASE STORAGE SDK
    // -----------------------------------------

    const firebaseStorageModule =
        await import(
            "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js"
        );


    // -----------------------------------------
    // EXISTING FIREBASE APP
    // -----------------------------------------

    const firebaseAppModule =
        await import(
            "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js"
        );


    const apps =
        firebaseAppModule.getApps();


    if(
        !apps ||
        !apps.length
    ){

        throw new Error(
            "Firebase App is not available. The main Dashboard Firebase must be initialised first."
        );

    }


    // -----------------------------------------
    // USE EXISTING APP
    // -----------------------------------------

    const existingApp =
        apps[0];


    // -----------------------------------------
    // SAME APP → STORAGE
    // -----------------------------------------

    fileStoreStorage =
        firebaseStorageModule.getStorage(
            existingApp
        );


    return fileStoreStorage;

}


// =========================================================
// UPLOAD DOCUMENT — SUPABASE STORAGE
// =========================================================

async function uploadFileStoreDocument(
    file
){

    // -----------------------------------------
    // VALIDATE FILE
    // -----------------------------------------

    if(!file){

        throw new Error(
            "No file selected."
        );

    }


    // -----------------------------------------
    // ADMIN ACCESS
    // -----------------------------------------

    if(
        !checkFileStoreAccess()
    ){

        throw new Error(
            "Access denied."
        );

    }


    // -----------------------------------------
    // CURRENT DESTINATION
    // -----------------------------------------

    if(
        !fileStoreCurrentSectionId
    ){

        throw new Error(
            "Please select a section before uploading a document."
        );

    }


    // -----------------------------------------
    // SUPABASE
    // -----------------------------------------

    const supabase =
        await getFileStoreSupabase();


    // -----------------------------------------
    // CREATE FIREBASE FILE ID
    // -----------------------------------------

    const fileReferenceForId =
        window.firebasePush(

            firebaseRef(
                database,
                FILE_STORE_FILES_PATH
            )

        );


    const fileId =
        fileReferenceForId.key;


    if(!fileId){

        throw new Error(
            "Unable to generate document ID."
        );

    }


    // -----------------------------------------
    // SAFE FILE NAME
    // -----------------------------------------

    const safeFileName =
        sanitizeFileStoreName(
            file.name
        );


    // -----------------------------------------
    // STORAGE PATH
    // -----------------------------------------

    const storagePath =
        fileStoreCurrentFolderId

            ?

        `fileStore/${fileStoreCurrentFolderId}/${fileId}_${safeFileName}`

            :

        `fileStore/root/${fileId}_${safeFileName}`;


    // -----------------------------------------
    // UPLOAD TO SUPABASE
    // -----------------------------------------

    const {
        error: uploadError
    } =
        await supabase
            .storage
            .from(
                SUPABASE_BUCKET
            )
            .upload(
                storagePath,
                file,
                {

                    contentType:
                        file.type ||
                        "application/octet-stream",

                    upsert:
                        false

                }
            );


    if(uploadError){

        console.error(
            "FILE STORE — Supabase upload failed:",
            uploadError
        );


        throw new Error(
            uploadError.message ||
            "Unable to upload document to Supabase."
        );

    }


    // -----------------------------------------
    // PUBLIC URL
    // -----------------------------------------

    const {
        data: publicUrlData
    } =
        supabase
            .storage
            .from(
                SUPABASE_BUCKET
            )
            .getPublicUrl(
                storagePath
            );


    const downloadURL =
        publicUrlData?.publicUrl;


    if(!downloadURL){

        // -------------------------------------
        // CLEAN UP IF URL FAILED
        // -------------------------------------

        await supabase
            .storage
            .from(
                SUPABASE_BUCKET
            )
            .remove([
                storagePath
            ]);


        throw new Error(
            "Unable to generate document URL."
        );

    }


    // -----------------------------------------
    // FILE METADATA
    // -----------------------------------------

    const fileData = {

        name:
            file.name,

        type:
            file.type ||
            "application/octet-stream",

        size:
            file.size,

        folderId:
            fileStoreCurrentFolderId,

        storagePath:
            storagePath,

        downloadURL:
            downloadURL,

        storageProvider:
            "supabase",

        uploadedBy:
            getCurrentFullName(),

        uploadedByUsername:
            getCurrentUsername(),

        uploadedAt:
            Date.now()

    };


    // -----------------------------------------
    // SAVE METADATA TO FIREBASE
    // -----------------------------------------

    try{

        await firebaseSet(

            fileReferenceForId,

            fileData

        );

    }
    catch(error){

        // -------------------------------------
        // ROLLBACK SUPABASE FILE
        // -------------------------------------

        await supabase
            .storage
            .from(
                SUPABASE_BUCKET
            )
            .remove([
                storagePath
            ]);


        throw error;

    }


    // -----------------------------------------
    // LOCAL CACHE
    // -----------------------------------------

    fileStoreFiles[
        fileId
    ] =
        fileData;


     // -----------------------------------------
    // REGISTER GLOBAL RECENTLY ADDED
    // -----------------------------------------

    await registerFileStoreRecentAdded(
        fileId
    );

    // -----------------------------------------
    // AUDIT
    // -----------------------------------------

    await writeAuditLog(

        "FILE_STORE_UPLOAD",

        `Uploaded document "${file.name}".`

    );


    // -----------------------------------------
    // REFRESH UI
    // -----------------------------------------

    renderFileStore();


    return fileData;

}

// =========================================================
// FILE INFORMATION MODAL
// =========================================================

function openFileInfoModal(
    file
){

     // -----------------------------------------
    // KEEP SELECTED DOCUMENT
    // -----------------------------------------

    fileStoreSelectedFile =
        file;

    if(!file){

        return;

    }


    // -----------------------------------------
    // SELECT FILE
    // -----------------------------------------

    fileStoreSelectedFile =
        file;


    // -----------------------------------------
    // CREATE MODAL IF IT DOES NOT EXIST
    // -----------------------------------------

    let modal =
        document.getElementById(
            "fileInfoModal"
        );


    if(!modal){

        modal =
            document.createElement(
                "div"
            );


        modal.id =
            "fileInfoModal";


        modal.className =
            "fs-modal-overlay";


        modal.style.display =
            "none";


        modal.innerHTML = `

            <div
                class="fs-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="fileInfoModalTitle"
            >

                <button
                    type="button"
                    class="fs-modal-close"
                    id="closeFileInfoModalButton"
                    aria-label="Close"
                >
                    ×
                </button>


                <div
                    class="fs-modal-content"
                    id="fileInfoModalContent"
                >

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        // -----------------------------------------
        // CLOSE BUTTON
        // -----------------------------------------

        const closeButton =
            modal.querySelector(
                "#closeFileInfoModalButton"
            );


        if(closeButton){

            closeButton.addEventListener(
                "click",
                closeFileInfoModal
            );

        }


        // -----------------------------------------
        // CLICK OUTSIDE
        // -----------------------------------------

        modal.addEventListener(
            "click",
            event => {

                if(
                    event.target ===
                    modal
                ){

                    closeFileInfoModal();

                }

            }
        );

    }


    // -----------------------------------------
    // CONTENT
    // -----------------------------------------

    const content =
        document.getElementById(
            "fileInfoModalContent"
        );


    if(!content){

        return;

    }


    const fileName =
        escapeFileStoreHtml(
            file.name ||
            "Document"
        );


    const fileType =
        escapeFileStoreHtml(
            file.type ||
            "Unknown"
        );


    const fileSize =
        formatFileStoreSize(
            file.size
        );


    const uploadedBy =
        escapeFileStoreHtml(
            file.uploadedBy ||
            "Unknown"
        );


    const uploadedAt =
        formatFileStoreDate(
            file.uploadedAt
        );


    content.innerHTML = `

        <span class="fs-modal-eyebrow">
            DOCUMENT
        </span>


        <h2
            id="fileInfoModalTitle"
        >
            ${fileName}
        </h2>


        <p>
            File details and metadata.
        </p>


        <div class="fs-upload-info">

            <div>

                <span>
                    TYPE
                </span>

                <strong>
                    ${fileType}
                </strong>

            </div>


            <div>

                <span>
                    SIZE
                </span>

                <strong>
                    ${fileSize}
                </strong>

            </div>


            <div>

                <span>
                    UPLOADED BY
                </span>

                <strong>
                    ${uploadedBy}
                </strong>

            </div>


            <div>

                <span>
                    UPLOADED
                </span>

                <strong>
                    ${uploadedAt}
                </strong>

            </div>

        </div>


        <div class="fs-modal-actions">

            <button
                type="button"
                class="fs-button fs-button-cancel"
                onclick="closeFileInfoModal()"
            >
                Close
            </button>


            <button
                type="button"
                class="fs-button fs-button-primary"
                onclick="downloadFileStoreDocument()"
            >
                Download
            </button>

        </div>

    `;


    modal.style.display =
        "flex";

}

function closeFileInfoModal(){

    const modal =
        document.getElementById(
            "fileInfoModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }

}


// =========================================================
// VIEW DOCUMENT + REGISTER RECENTLY OPENED
// =========================================================

// =========================================================
// VIEW DOCUMENT
// =========================================================

async function viewFileStoreDocument(){

    const file =
        fileStoreSelectedFile;


    if(!file){

        console.error(
            "FILE STORE — No document selected."
        );

        return;

    }


    // -----------------------------------------
    // REGISTER RECENTLY OPENED
    // -----------------------------------------

    if(
        file.id
    ){

        try{

            await registerFileStoreRecentOpened(
                file.id
            );



            // Update Home immediately
            renderFileStoreHome();

        }
        catch(error){

            console.error(
                "FILE STORE — Recently Opened save failed:",
                error
            );

        }

    }
    else{

        console.warn(
            "FILE STORE — Document has no Firebase ID:",
            file
        );

    }


    // -----------------------------------------
    // OPEN DOCUMENT
    // -----------------------------------------

    if(
        !file.downloadURL
    ){

        console.error(
            "FILE STORE — Missing document URL:",
            file
        );

        showError(
            "File Store",
            "Unable to open this document."
        );

        return;

    }


    window.open(
        file.downloadURL,
        "_blank",
        "noopener,noreferrer"
    );

}

// =========================================================
// DOWNLOAD DOCUMENT — DIRECT FILE DOWNLOAD
// =========================================================

async function downloadFileStoreDocument(){

    if(
        !fileStoreSelectedFile
    ){

        return;

    }


    const file =
        fileStoreSelectedFile;


    const fileName =
        file.name ||
        "document";


    try{

        // -----------------------------------------
        // SUPABASE FILE
        // -----------------------------------------

        if(
            file.storageProvider ===
            "supabase"
            &&
            file.storagePath
        ){

            const supabase =
                await getFileStoreSupabase();


            const {
                data,
                error
            } =
                await supabase
                    .storage
                    .from(
                        SUPABASE_BUCKET
                    )
                    .download(
                        file.storagePath
                    );


            if(error){

                throw error;

            }


            if(!data){

                throw new Error(
                    "No file data received."
                );

            }


            // -----------------------------------------
            // CREATE LOCAL DOWNLOAD
            // -----------------------------------------

            const blobURL =
                URL.createObjectURL(
                    data
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                blobURL;


            link.download =
                fileName;


            link.style.display =
                "none";


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            // -----------------------------------------
            // CLEAN OBJECT URL
            // -----------------------------------------

            setTimeout(
                () => {

                    URL.revokeObjectURL(
                        blobURL
                    );

                },
                1000
            );


            return;

        }


        // -----------------------------------------
        // FALLBACK — DOWNLOAD URL
        // -----------------------------------------

        if(
            file.downloadURL
        ){

            const response =
                await fetch(
                    file.downloadURL
                );


            if(!response.ok){

                throw new Error(
                    "Unable to download file."
                );

            }


            const blob =
                await response.blob();


            const blobURL =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                blobURL;


            link.download =
                fileName;


            link.style.display =
                "none";


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            setTimeout(
                () => {

                    URL.revokeObjectURL(
                        blobURL
                    );

                },
                1000
            );


            return;

        }


        throw new Error(
            "No download source available."
        );

    }

    catch(error){

        console.error(
            "FILE STORE — Download failed:",
            error
        );


        showError(
            "Download",
            "Unable to download this document."
        );

    }

}

// =========================================================
// CURRENT FILE STORE PATH
// =========================================================

function getFileStoreCurrentPath(){

    const path = [];


    // -----------------------------------------
    // HOME
    // -----------------------------------------

    if(
        !fileStoreCurrentSectionId
    ){

        return "Home";

    }


    // -----------------------------------------
    // SECTION
    // -----------------------------------------

    const section =
        fileStoreSections[
            fileStoreCurrentSectionId
        ];


    if(section){

        path.push(
            section.name
        );

    }


    // -----------------------------------------
    // FOLDER TREE
    // -----------------------------------------

    const folderPath = [];


    let currentFolderId =
        fileStoreCurrentFolderId;


    let safetyCounter =
        0;


    while(
        currentFolderId &&
        safetyCounter < 100
    ){

        const folder =
            fileStoreFolders[
                currentFolderId
            ];


        if(!folder){

            break;

        }


        folderPath.unshift(
            folder.name ||
            "Folder"
        );


        currentFolderId =
            folder.parentId ||
            null;


        safetyCounter++;

    }


    path.push(
        ...folderPath
    );


    return path.join(
        " / "
    );

}

// =========================================================
// FILE STORE EVENT BINDING
// =========================================================

function bindFileStoreEvents(){

   // =========================================================
// NEW FOLDER BUTTON
// =========================================================

const newFolderButton =
    document.getElementById(
        "newFolderButton"
    );


if(
    newFolderButton &&
    !newFolderButton.dataset
        .fileStoreBound
){

    newFolderButton.addEventListener(
        "click",
        () => {

            // -----------------------------------------
            // HOME
            // -----------------------------------------

            if(
                !fileStoreCurrentSectionId
            ){

                showError(
                    "File Store",
                    "Please open a section before creating a folder."
                );

                return;

            }


            // -----------------------------------------
            // SECTION / FOLDER
            // -----------------------------------------

            openNewFolderModal();

        }
    );


    newFolderButton.dataset
        .fileStoreBound =
            "true";



// =========================================================
// NEW FOLDER MODAL — CLOSE EVENTS
// =========================================================

const closeNewFolderButton =
    document.getElementById(
        "closeNewFolderModalButton"
    );


const cancelNewFolderButton =
    document.getElementById(
        "cancelNewFolderButton"
    );


// -----------------------------------------
// CLOSE — X
// -----------------------------------------

if(
    closeNewFolderButton &&
    !closeNewFolderButton.dataset
        .fileStoreBound
){

    closeNewFolderButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            closeNewFolderModal();

        }
    );


    closeNewFolderButton.dataset
        .fileStoreBound =
            "true";

}


// -----------------------------------------
// CANCEL
// -----------------------------------------

if(
    cancelNewFolderButton &&
    !cancelNewFolderButton.dataset
        .fileStoreBound
){

    cancelNewFolderButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            closeNewFolderModal();

        }
    );


    cancelNewFolderButton.dataset
        .fileStoreBound =
            "true";

}


}

    const parentButton =
        document.getElementById(
            "goParentButton"
        );


    if(
        parentButton &&
        !parentButton.dataset
            .fileStoreBound
    ){

        parentButton.addEventListener(
            "click",
            goFileStoreParent
        );


        parentButton.dataset
            .fileStoreBound =
                "true";

    }


    const fileInput =
        document.getElementById(
            "fileStoreUploadInput"
        );


    const selectedFile =
        document.getElementById(
            "uploadFileName"
        );


    if(
        fileInput &&
        !fileInput.dataset
            .fileStoreBound
    ){

        fileInput.addEventListener(
            "change",
            () => {

                const file =
                    fileInput.files?.[0];


                if(
                    file &&
                    selectedFile
                ){

                    selectedFile.innerHTML = `

    <span
        style="
            width:36px;
            height:36px;
            min-width:36px;
            display:flex;
            align-items:center;
            justify-content:center;
            border-radius:9px;
            background:#EAF1FC;
            font-size:17px;
        "
    >
        📄
    </span>

    <span
        style="
            min-width:0;
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
        "
    >
        ${escapeFileStoreHtml(file.name)}
    </span>

`;

                }
                else if(
                    selectedFile
                ){

                    selectedFile.innerHTML = "";

                }

            }
        );


        fileInput.dataset
            .fileStoreBound =
                "true";

    }


    const createFolderButton =
        document.getElementById(
            "createFolderConfirmButton"
        );


    if(
        createFolderButton &&
        !createFolderButton.dataset
            .fileStoreBound
    ){

        createFolderButton.addEventListener(
    "click",
    async event => {

        event.preventDefault();

        event.stopPropagation();

                const input =
                    document.getElementById(
                        "newFolderName"
                    );


                const name =
                    input?.value?.trim();


                if(!name){

    showError(
        "Create Folder",
        "Please enter a folder name."
    );

    return;

}


                createFolderButton.disabled =
                    true;


                try{

                    await createFileStoreFolder(
                        name
                    );


                    closeNewFolderModal();

                }
                catch(error){

                    console.error(
                        "FILE STORE — Folder creation failed:",
                        error
                    );


                    showError(
                        "File Store",
                        error.message ||
                        "Unable to create folder."
                    );

                }
                finally{

                    createFolderButton.disabled =
                        false;

                }

            }
        );


        createFolderButton.dataset
            .fileStoreBound =
                "true";

    }


    const confirmUploadButton =
        document.getElementById(
            "confirmUploadButton"
        );


    if(
        confirmUploadButton &&
        !confirmUploadButton.dataset
            .fileStoreBound
    ){

        confirmUploadButton.addEventListener(
            "click",
            async () => {

                const file =
                    fileInput?.files?.[0];


                if(!file){

    showError(
        "Upload Document",
        "Please select a document."
    );

    return;

}


                confirmUploadButton.disabled =
                    true;


                confirmUploadButton.textContent =
                    "Uploading...";


                try{

                    await uploadFileStoreDocument(
                        file
                    );


                    closeUploadModal();

                }
                catch(error){

                    console.error(
                        "FILE STORE — Upload failed:",
                        error
                    );


                    showError(
                        "File Store",
                        error.message ||
                        "Unable to upload document."
                    );

                }
                finally{

                    confirmUploadButton.disabled =
                        false;


                    confirmUploadButton.textContent =
                        "Upload";

                }

            }
        );


        confirmUploadButton.dataset
            .fileStoreBound =
                "true";

    }

    createFileStoreSearchResults();

    const searchInput =
        document.getElementById(
            "fileStoreSearch"
        );


    if(
        searchInput &&
        !searchInput.dataset
            .fileStoreBound
    ){

        searchInput.addEventListener(
            "input",
            event => {

                handleFileStoreSearch(
                    event.target.value
                );

            }
        );


        searchInput.dataset
            .fileStoreBound =
                "true";

    }

// -----------------------------------------
// ADD SECTION
// -----------------------------------------

const addSectionButton =
    document.getElementById(
        "addSectionConfirmButton"
    );

if(
    addSectionButton &&
    !addSectionButton.dataset
        .fileStoreBound
){

    addSectionButton.addEventListener(
        "click",
        async () => {

            const input =
                document.getElementById(
                    "newSectionName"
                );


            const name =
                input
                    ?.value
                    ?.trim();


            if(!name){

    showError(
        "Create Section",
        "Please enter a section name."
    );

    return;

}


            addSectionButton.disabled =
                true;


            addSectionButton.textContent =
                "Creating...";


            try{

                await createFileStoreSection(
                    name
                );


                closeAddSectionModal();

            }
            catch(error){

                console.error(
                    "FILE STORE — Section creation failed:",
                    error
                );


                showError(
    "Create Section",
    error.message ||
    "Unable to create section."
);
            }
            finally{

                addSectionButton.disabled =
                    false;


                addSectionButton.textContent =
                    "Create Section";

            }

        }
    );


    addSectionButton.dataset
        .fileStoreBound =
            "true";

}

// =========================================================
// ADD SECTION MODAL — CLOSE EVENTS
// =========================================================

const closeAddSectionButton =
    document.getElementById(
        "closeAddSectionModalButton"
    );


const cancelAddSectionButton =
    document.getElementById(
        "cancelAddSectionButton"
    );


// -----------------------------------------
// CLOSE — X
// -----------------------------------------

if(
    closeAddSectionButton &&
    !closeAddSectionButton.dataset
        .fileStoreBound
){

    closeAddSectionButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            closeAddSectionModal();

        }
    );


    closeAddSectionButton.dataset
        .fileStoreBound =
            "true";

}


// -----------------------------------------
// CLOSE — CANCEL
// -----------------------------------------

if(
    cancelAddSectionButton &&
    !cancelAddSectionButton.dataset
        .fileStoreBound
){

    cancelAddSectionButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            closeAddSectionModal();

        }
    );


    cancelAddSectionButton.dataset
        .fileStoreBound =
            "true";

}

// -----------------------------------------
// CREATE FOLDER — CURRENT LOCATION
// -----------------------------------------

const createFolderInLocationButton =
    document.getElementById(
        "createFolderInLocationButton"
    );


if(
    createFolderInLocationButton &&
    !createFolderInLocationButton.dataset
        .fileStoreBound
){

    createFolderInLocationButton.addEventListener(
        "click",
        openNewFolderModal
    );


    createFolderInLocationButton.dataset
        .fileStoreBound =
            "true";

}

// =========================================================
// REMOVE SECTION MODAL EVENTS
// =========================================================

const closeRemoveSectionButton =
    document.getElementById(
        "closeRemoveFileStoreSectionModalButton"
    );


const cancelRemoveSectionButton =
    document.getElementById(
        "cancelRemoveFileStoreSectionButton"
    );


const confirmRemoveSectionButton =
    document.getElementById(
        "confirmRemoveFileStoreSectionButton"
    );


if(
    closeRemoveSectionButton &&
    !closeRemoveSectionButton.dataset
        .fileStoreBound
){

    closeRemoveSectionButton.addEventListener(
        "click",
        closeRemoveFileStoreSectionModal
    );


    closeRemoveSectionButton.dataset
        .fileStoreBound =
            "true";

}


if(
    cancelRemoveSectionButton &&
    !cancelRemoveSectionButton.dataset
        .fileStoreBound
){

    cancelRemoveSectionButton.addEventListener(
        "click",
        closeRemoveFileStoreSectionModal
    );


    cancelRemoveSectionButton.dataset
        .fileStoreBound =
            "true";

}


if(
    confirmRemoveSectionButton &&
    !confirmRemoveSectionButton.dataset
        .fileStoreBound
){

    confirmRemoveSectionButton.addEventListener(
        "click",
        async () => {

            confirmRemoveSectionButton.disabled =
                true;


            confirmRemoveSectionButton.textContent =
                "Removing...";


            try{

                await removeFileStoreSection();

            }

            catch(error){

                console.error(
                    "FILE STORE — Remove section failed:",
                    error
                );


                showError(
                    "Remove Section",
                    error.message ||
                    "Unable to remove section."
                );

            }

            finally{

                confirmRemoveSectionButton.disabled =
                    false;


                confirmRemoveSectionButton.textContent =
                    "Remove Section";

            }

        }
    );


    confirmRemoveSectionButton.dataset
        .fileStoreBound =
            "true";

}

// -----------------------------------------
// CREATE DOCUMENT — CURRENT LOCATION
// -----------------------------------------

const createDocumentInLocationButton =
    document.getElementById(
        "createDocumentInLocationButton"
    );


if(
    createDocumentInLocationButton &&
    !createDocumentInLocationButton.dataset
        .fileStoreBound
){

    createDocumentInLocationButton.addEventListener(
        "click",
        openUploadModal
    );


    createDocumentInLocationButton.dataset
        .fileStoreBound =
            "true";

}


// -----------------------------------------
// EMPTY STATE — CREATE FOLDER
// -----------------------------------------

const emptyCreateFolderButton =
    document.getElementById(
        "emptyCreateFolderButton"
    );


if(
    emptyCreateFolderButton &&
    !emptyCreateFolderButton.dataset
        .fileStoreBound
){

    emptyCreateFolderButton.addEventListener(
        "click",
        openNewFolderModal
    );


    emptyCreateFolderButton.dataset
        .fileStoreBound =
            "true";

}


// -----------------------------------------
// EMPTY STATE — CREATE DOCUMENT
// -----------------------------------------

const emptyCreateDocumentButton =
    document.getElementById(
        "emptyCreateDocumentButton"
    );


if(
    emptyCreateDocumentButton &&
    !emptyCreateDocumentButton.dataset
        .fileStoreBound
){

    emptyCreateDocumentButton.addEventListener(
        "click",
        openUploadModal
    );


    emptyCreateDocumentButton.dataset
        .fileStoreBound =
            "true";

}

// =========================================================
// RENAME MODAL EVENTS
// =========================================================

const closeRenameButton =
    document.getElementById(
        "closeRenameFileStoreModalButton"
    );


const cancelRenameButton =
    document.getElementById(
        "cancelRenameFileStoreButton"
    );


const confirmRenameButton =
    document.getElementById(
        "confirmRenameFileStoreButton"
    );


if(
    closeRenameButton &&
    !closeRenameButton.dataset
        .fileStoreBound
){

    closeRenameButton.addEventListener(
        "click",
        closeFileStoreRenameModal
    );


    closeRenameButton.dataset
        .fileStoreBound =
            "true";

}


if(
    cancelRenameButton &&
    !cancelRenameButton.dataset
        .fileStoreBound
){

    cancelRenameButton.addEventListener(
        "click",
        closeFileStoreRenameModal
    );


    cancelRenameButton.dataset
        .fileStoreBound =
            "true";

}


if(
    confirmRenameButton &&
    !confirmRenameButton.dataset
        .fileStoreBound
){

    confirmRenameButton.addEventListener(
        "click",
        async () => {

            const input =
                document.getElementById(
                    "renameFileStoreInput"
                );


            const name =
                input?.value?.trim();


            if(!name){

                alert(
                    "Please enter a name."
                );

                return;

            }


            confirmRenameButton.disabled =
                true;


            confirmRenameButton.textContent =
                "Renaming...";


            try{

                await renameFileStoreItem(
                    name
                );

            }
            catch(error){

                console.error(
                    "FILE STORE — Rename failed:",
                    error
                );


                showError(
                    "File Store",
                    error.message ||
                    "Unable to rename item."
                );

            }
            finally{

                confirmRenameButton.disabled =
                    false;


                confirmRenameButton.textContent =
                    "Rename";

            }

        }
    );


    confirmRenameButton.dataset
        .fileStoreBound =
            "true";

}

const renameInput =
    document.getElementById(
        "renameFileStoreInput"
    );


if(
    renameInput &&
    !renameInput.dataset
        .fileStoreBound
){

    renameInput.addEventListener(
        "keydown",
        event => {

            if(
                event.key !==
                "Enter"
            ){

                return;

            }


            event.preventDefault();


            document
                .getElementById(
                    "confirmRenameFileStoreButton"
                )
                ?.click();

        }
    );


    renameInput.dataset
        .fileStoreBound =
            "true";

}

// =========================================================
// MOVE MODAL EVENTS
// =========================================================

const moveSectionSelect =
    document.getElementById(
        "moveFileStoreSection"
    );


const moveFolderSelect =
    document.getElementById(
        "moveFileStoreFolder"
    );


const closeMoveButton =
    document.getElementById(
        "closeMoveFileStoreModalButton"
    );


const cancelMoveButton =
    document.getElementById(
        "cancelMoveFileStoreButton"
    );


const confirmMoveButton =
    document.getElementById(
        "confirmMoveFileStoreButton"
    );


// -----------------------------------------
// SECTION CHANGE
// -----------------------------------------

if(
    moveSectionSelect &&
    !moveSectionSelect.dataset
        .fileStoreBound
){

    moveSectionSelect.addEventListener(
        "change",
        () => {

            populateFileStoreMoveFolders(
                moveSectionSelect.value
            );


            updateFileStoreMoveDestination();

        }
    );


    moveSectionSelect.dataset
        .fileStoreBound =
            "true";

}


// -----------------------------------------
// FOLDER CHANGE
// -----------------------------------------

if(
    moveFolderSelect &&
    !moveFolderSelect.dataset
        .fileStoreBound
){

    moveFolderSelect.addEventListener(
        "change",
        updateFileStoreMoveDestination
    );


    moveFolderSelect.dataset
        .fileStoreBound =
            "true";

}


// -----------------------------------------
// CLOSE
// -----------------------------------------

if(
    closeMoveButton &&
    !closeMoveButton.dataset
        .fileStoreBound
){

    closeMoveButton.addEventListener(
        "click",
        closeFileStoreMoveModal
    );


    closeMoveButton.dataset
        .fileStoreBound =
            "true";

}


if(
    cancelMoveButton &&
    !cancelMoveButton.dataset
        .fileStoreBound
){

    cancelMoveButton.addEventListener(
        "click",
        closeFileStoreMoveModal
    );


    cancelMoveButton.dataset
        .fileStoreBound =
            "true";

}


// -----------------------------------------
// CONFIRM
// -----------------------------------------

if(
    confirmMoveButton &&
    !confirmMoveButton.dataset
        .fileStoreBound
){

    confirmMoveButton.addEventListener(
        "click",
        async () => {

            confirmMoveButton.disabled =
                true;


            confirmMoveButton.textContent =
                "Moving...";


            try{

                await moveFileStoreItem();

            }
            catch(error){

                console.error(
                    "FILE STORE — Move failed:",
                    error
                );


                showError(
                    "File Store",
                    error.message ||
                    "Unable to move item."
                );

            }
            finally{

                confirmMoveButton.disabled =
                    false;


                confirmMoveButton.textContent =
                    "Move";

            }

        }
    );


    confirmMoveButton.dataset
        .fileStoreBound =
            "true";

}

// =========================================================
// DELETE MODAL EVENTS
// =========================================================

const closeDeleteButton =
    document.getElementById(
        "closeDeleteFileStoreModalButton"
    );


const cancelDeleteButton =
    document.getElementById(
        "cancelDeleteFileStoreButton"
    );


const confirmDeleteButton =
    document.getElementById(
        "confirmDeleteFileStoreButton"
    );


if(
    closeDeleteButton &&
    !closeDeleteButton.dataset
        .fileStoreBound
){

    closeDeleteButton.addEventListener(
        "click",
        closeFileStoreDeleteModal
    );


    closeDeleteButton.dataset
        .fileStoreBound =
            "true";

}


if(
    cancelDeleteButton &&
    !cancelDeleteButton.dataset
        .fileStoreBound
){

    cancelDeleteButton.addEventListener(
        "click",
        closeFileStoreDeleteModal
    );


    cancelDeleteButton.dataset
        .fileStoreBound =
            "true";

}


if(
    confirmDeleteButton &&
    !confirmDeleteButton.dataset
        .fileStoreBound
){

    confirmDeleteButton.addEventListener(
        "click",
        async () => {

            confirmDeleteButton.disabled =
                true;


            confirmDeleteButton.textContent =
                "Deleting...";


            try{

                await deleteFileStoreItem();

            }
            catch(error){

                console.error(
                    "FILE STORE — Delete failed:",
                    error
                );


                showError(
                    "File Store",
                    error.message ||
                    "Unable to delete item."
                );

            }
            finally{

                confirmDeleteButton.disabled =
                    false;


                confirmDeleteButton.textContent =
                    "Delete";

            }

        }
    );


    confirmDeleteButton.dataset
        .fileStoreBound =
            "true";

}

}


// =========================================================
// EMPTY STATE
// =========================================================

function updateFileStoreEmptyState(){

    const emptyState =
        document.getElementById(
            "fileStoreEmptyState"
        );


    const items =
        document.getElementById(
            "fileStoreItems"
        );


    const count =
        document.getElementById(
            "fileStoreItemCount"
        );


    if(
        !emptyState ||
        !items
    ){

        return;

    }


    const itemCount =
        Array.from(
            items.children
        )
            .filter(
                item =>
                    item.style.display !==
                    "none"
            )
            .length;


    if(count){

        count.textContent =
            `${itemCount} ${
                itemCount === 1
                    ? "item"
                    : "items"
            }`;

    }


    emptyState.style.display =
        itemCount === 0
            ? "flex"
            : "none";

}


// =========================================================
// FILE ICON
// =========================================================

function getFileStoreIcon(
    type,
    name
){

    const lowerType =
        String(
            type || ""
        )
            .toLowerCase();


    const lowerName =
        String(
            name || ""
        )
            .toLowerCase();


    if(
        lowerType.includes(
            "pdf"
        ) ||
        lowerName.endsWith(
            ".pdf"
        )
    ){

        return "📕";

    }


    if(
        lowerType.includes(
            "word"
        ) ||
        lowerName.endsWith(
            ".doc"
        ) ||
        lowerName.endsWith(
            ".docx"
        )
    ){

        return "📘";

    }


    if(
        lowerType.includes(
            "sheet"
        ) ||
        lowerName.endsWith(
            ".xls"
        ) ||
        lowerName.endsWith(
            ".xlsx"
        ) ||
        lowerName.endsWith(
            ".csv"
        )
    ){

        return "📗";

    }


    if(
        lowerType.includes(
            "image"
        ) ||
        /\.(png|jpg|jpeg|gif|webp)$/i
            .test(lowerName)
    ){

        return "🖼️";

    }


    if(
        lowerType.includes(
            "zip"
        ) ||
        /\.(zip|rar|7z)$/i
            .test(lowerName)
    ){

        return "📦";

    }


    return "📄";

}


// =========================================================
// FILE SIZE
// =========================================================

function formatFileStoreSize(
    bytes
){

    if(
        bytes === null ||
        bytes === undefined ||
        Number.isNaN(
            Number(bytes)
        )
    ){

        return "Unknown";

    }


    const size =
        Number(bytes);


    if(size === 0){

        return "0 Bytes";

    }


    const units = [

        "Bytes",
        "KB",
        "MB",
        "GB"

    ];


    const index =
        Math.floor(
            Math.log(size) /
            Math.log(1024)
        );


    const safeIndex =
        Math.min(
            index,
            units.length - 1
        );


    return (

        size /
        Math.pow(
            1024,
            safeIndex
        )

    )
        .toFixed(
            safeIndex === 0
                ? 0
                : 1
        )
        +
        " " +
        units[
            safeIndex
        ];

}


// =========================================================
// DATE
// =========================================================

function formatFileStoreDate(
    timestamp
){

    if(!timestamp){

        return "Unknown";

    }


    return new Date(
        Number(timestamp)
    )
        .toLocaleString(
            "en-GB"
        );

}


// =========================================================
// SANITISE STORAGE NAME
// =========================================================

function sanitizeFileStoreName(
    name
){

    return String(
        name || "document"
    )
        .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );

}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeFileStoreHtml(
    value
){

    return String(
        value ?? ""
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


// =========================================================
// ESCAPE KEY
// =========================================================

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key !==
            "Escape"
        ){

            return;

        }


        closeNewFolderModal();

        closeUploadModal();

        closeFileInfoModal();

        closeAddSectionModal();

    }
);

// =========================================================
// CREATE SECTION
// =========================================================

async function createFileStoreSection(
    sectionName
){

    if(
        !checkFileStoreAccess()
    ){

        throw new Error(
            "Access denied."
        );

    }


    const cleanName =
        String(
            sectionName || ""
        )
            .trim();


    if(
        !cleanName
    ){

        throw new Error(
            "Section name cannot be empty."
        );

    }


    // -----------------------------------------
    // DUPLICATE CHECK
    // -----------------------------------------

    const existingSection =
        Object.values(
            fileStoreSections
        )
            .some(
                section => {

                    return (

                        String(
                            section.name ||
                            ""
                        )
                            .trim()
                            .toLowerCase()

                        ===

                        cleanName
                            .toLowerCase()

                    );

                }
            );


    if(
        existingSection
    ){

        throw new Error(
            "A section with this name already exists."
        );

    }


    // -----------------------------------------
    // CREATE FIREBASE KEY
    // -----------------------------------------

    const sectionRef =
        window.firebasePush(

            firebaseRef(
                database,
                FILE_STORE_SECTIONS_PATH
            )

        );


    const sectionId =
        sectionRef.key;


    const sectionData = {

        name:
            cleanName,

        createdBy:
            getCurrentFullName(),

        createdByUsername:
            getCurrentUsername(),

        createdAt:
            Date.now()

    };


    await firebaseSet(
        sectionRef,
        sectionData
    );


    fileStoreSections[
        sectionId
    ] =
        sectionData;


    // -----------------------------------------
    // OPEN NEW SECTION
    // -----------------------------------------

    fileStoreCurrentSectionId =
        sectionId;


    fileStoreCurrentSectionName =
        cleanName;


    fileStoreCurrentFolderId =
        null;


    fileStoreCurrentFolderName =
        cleanName;


    fileStoreCurrentFolderParentId =
        null;


    renderFileStoreSections();

    renderFileStore();


    await writeAuditLog(

        "FILE_STORE_CREATE_SECTION",

        `Created section "${cleanName}".`

    );

}

// =========================================================
// ADD SECTION MODAL
// =========================================================

function openAddSectionModal(){

    const modal =
        document.getElementById(
            "addSectionModal"
        );


    const input =
        document.getElementById(
            "newSectionName"
        );


    if(
        !modal
    ){

        return;

    }


    modal.style.display =
        "flex";


    if(
        input
    ){

        input.value =
            "";


        setTimeout(
            () => {

                input.focus();

            },
            50
        );

    }

}


// =========================================================
// CLOSE ADD SECTION MODAL
// =========================================================

function closeAddSectionModal(){

    const modal =
        document.getElementById(
            "addSectionModal"
        );


    if(
        modal
    ){

        modal.style.display =
            "none";

    }

}

// =========================================================
// RENDER SECTION NAVIGATION
// =========================================================

function renderFileStoreSections(){

    const navigation =
        document.getElementById(
            "fileStoreSectionNavigation"
        );


    if(
        !navigation
    ){

        return;

    }


    navigation.innerHTML =
        "";


    // -----------------------------------------
    // HOME
    // -----------------------------------------

    const homeButton =
        document.createElement(
            "button"
        );


    homeButton.type =
        "button";


    homeButton.className =
        "fs-section-button";


    if(
        fileStoreCurrentSectionId ===
        null
    ){

        homeButton.classList.add(
            "fs-section-active"
        );

    }


    homeButton.innerHTML = `

        <span class="fs-section-icon">
            🏠
        </span>

        <span>
            Home
        </span>

    `;


    homeButton.addEventListener(
        "click",
        () => {

            goFileStoreHome();

        }
    );


    navigation.appendChild(
        homeButton
    );


    // -----------------------------------------
    // FIREBASE SECTIONS
    // -----------------------------------------

    const sections =
        Object.entries(
            fileStoreSections
        )
            .map(
                ([id,section]) => ({

                    id,

                    ...section

                })
            )
            .sort(
                (a,b) => {

                    return (

                        String(
                            a.name ||
                            ""
                        )
                            .localeCompare(

                                String(
                                    b.name ||
                                    ""
                                )

                            )

                    );

                }
            );


    sections.forEach(
        section => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "fs-section-button";


            if(
                fileStoreCurrentSectionId ===
                section.id
            ){

                button.classList.add(
                    "fs-section-active"
                );

            }


            button.innerHTML = `

                <span class="fs-section-icon">
                    📁
                </span>

                <span>
                    ${escapeFileStoreHtml(
                        section.name
                    )}
                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    openFileStoreSection(
                        section.id
                    );

                }
            );


            navigation.appendChild(
                button
            );

        }
    );


    // -----------------------------------------
    // ADD SECTION
    // -----------------------------------------

    const addButton =
        document.createElement(
            "button"
        );


    addButton.type =
        "button";


    addButton.className =
        "fs-section-add-button";


    addButton.innerHTML = `

        <span>
            +
        </span>

        <span>
            Add Section
        </span>

    `;


    addButton.addEventListener(
        "click",
        openAddSectionModal
    );


    navigation.appendChild(
        addButton
    );

}

// =========================================================
// OPEN SECTION
// =========================================================

function openFileStoreSection(
    sectionId
){

    const section =
        fileStoreSections[
            sectionId
        ];


    if(
        !section
    ){

        return;

    }


    fileStoreCurrentSectionId =
        sectionId;


    fileStoreCurrentSectionName =
        section.name ||
        "Section";


    fileStoreCurrentFolderId =
        null;


    fileStoreCurrentFolderName =
        section.name ||
        "Section";


    fileStoreCurrentFolderParentId =
        null;


    const homeView =
        document.getElementById(
            "fileStoreHomeView"
        );


    const browserView =
        document.getElementById(
            "fileStoreBrowserView"
        );


    if(
        homeView
    ){

        homeView.style.display =
            "none";

    }


    if(
        browserView
    ){

        browserView.style.display =
            "block";

    }


    renderFileStoreSections();

    renderFileStore();

}

// =========================================================
// RENAME ITEM MODAL
// =========================================================

function openFileStoreRenameModal(
    type,
    item
){

    if(
        !item
    ){

        return;

    }


    const modal =
        document.getElementById(
            "renameFileStoreModal"
        );


    const input =
        document.getElementById(
            "renameFileStoreInput"
        );


    const currentName =
        document.getElementById(
            "renameFileStoreCurrentName"
        );


    const icon =
        document.getElementById(
            "renameFileStoreIcon"
        );


    if(
        !modal ||
        !input ||
        !currentName
    ){

        console.error(
            "FILE STORE — Rename modal elements not found."
        );

        return;

    }


    // -----------------------------------------
    // STORE ITEM
    // -----------------------------------------

    fileStoreRenameType =
        type;


    fileStoreRenameItem =
        item;


    // -----------------------------------------
    // CURRENT NAME
    // -----------------------------------------

    currentName.textContent =
        item.name ||
        "Item";


    // -----------------------------------------
    // ICON
    // -----------------------------------------

    if(icon){

        icon.textContent =
            type === "folder"

                ? "📁"

                : "📄";

    }


    // -----------------------------------------
    // INPUT
    // -----------------------------------------

    input.value =
        item.name ||
        "";


    // -----------------------------------------
    // OPEN
    // -----------------------------------------

    modal.style.display =
        "flex";


    setTimeout(
        () => {

            input.focus();

            input.select();

        },
        50
    );

}

// =========================================================
// CLOSE RENAME MODAL
// =========================================================

function closeFileStoreRenameModal(){

    const modal =
        document.getElementById(
            "renameFileStoreModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }


    fileStoreRenameType =
        null;


    fileStoreRenameItem =
        null;

}

// =========================================================
// RENAME FILE STORE ITEM
// =========================================================

async function renameFileStoreItem(
    newName
){

    if(
        !checkFileStoreAccess()
    ){

        throw new Error(
            "Access denied."
        );

    }


    if(
        !fileStoreRenameItem ||
        !fileStoreRenameType
    ){

        throw new Error(
            "No File Store item selected."
        );

    }


    const cleanName =
        String(
            newName || ""
        )
            .trim();


    if(!cleanName){

        throw new Error(
            "Please enter a name."
        );

    }


    if(
        cleanName ===
        fileStoreRenameItem.name
    ){

        closeFileStoreRenameModal();

        return;

    }


    // =========================================
    // FOLDER
    // =========================================

    if(
        fileStoreRenameType ===
        "folder"
    ){

        const folderId =
            fileStoreRenameItem.id;


        if(
            !fileStoreFolders[
                folderId
            ]
        ){

            throw new Error(
                "Folder no longer exists."
            );

        }


        await firebaseSet(

            firebaseRef(
                database,
                `${FILE_STORE_FOLDERS_PATH}/${folderId}/name`
            ),

            cleanName

        );


        fileStoreFolders[
            folderId
        ].name =
            cleanName;


        await writeAuditLog(

            "FILE_STORE_RENAME_FOLDER",

            `Renamed folder "${fileStoreRenameItem.name}" to "${cleanName}".`

        );

    }


    // =========================================
    // DOCUMENT
    // =========================================

    else if(
        fileStoreRenameType ===
        "file"
    ){

        const fileId =
            fileStoreRenameItem.id;


        const file =
            fileStoreFiles[
                fileId
            ];


        if(!file){

            throw new Error(
                "Document no longer exists."
            );

        }


        // -----------------------------------------
        // SUPABASE DOCUMENT
        // -----------------------------------------

        if(
            file.storageProvider ===
            "supabase"
        ){

            if(
                !file.storagePath
            ){

                throw new Error(
                    "Document storage path is missing."
                );

            }


            const supabase =
                await getFileStoreSupabase();


            // -------------------------------------
            // CREATE NEW STORAGE PATH
            // -------------------------------------

            const pathParts =
                file.storagePath.split("/");


            pathParts[
                pathParts.length - 1
            ] =
                `${fileId}_${sanitizeFileStoreName(cleanName)}`;


            const newStoragePath =
                pathParts.join("/");


            // -------------------------------------
            // COPY FILE
            // -------------------------------------

            const {
                error: copyError
            } =
                await supabase
                    .storage
                    .from(
                        SUPABASE_BUCKET
                    )
                    .copy(
                        file.storagePath,
                        newStoragePath
                    );


            if(copyError){

                console.error(
                    "FILE STORE — Supabase rename copy failed:",
                    copyError
                );


                throw new Error(
                    copyError.message ||
                    "Unable to rename document."
                );

            }


            // -------------------------------------
            // DELETE OLD FILE
            // -------------------------------------

            const {
                error: deleteError
            } =
                await supabase
                    .storage
                    .from(
                        SUPABASE_BUCKET
                    )
                    .remove([
                        file.storagePath
                    ]);


            if(deleteError){

                console.error(
                    "FILE STORE — Supabase old file removal failed:",
                    deleteError
                );


                // ---------------------------------
                // ROLLBACK NEW COPY
                // ---------------------------------

                await supabase
                    .storage
                    .from(
                        SUPABASE_BUCKET
                    )
                    .remove([
                        newStoragePath
                    ]);


                throw new Error(
                    deleteError.message ||
                    "Unable to complete document rename."
                );

            }


            // -------------------------------------
            // NEW PUBLIC URL
            // -------------------------------------

            const {
                data: publicUrlData
            } =
                supabase
                    .storage
                    .from(
                        SUPABASE_BUCKET
                    )
                    .getPublicUrl(
                        newStoragePath
                    );


            const newDownloadURL =
                publicUrlData?.publicUrl;


            if(!newDownloadURL){

                throw new Error(
                    "Unable to generate the new document URL."
                );

            }


            // -------------------------------------
            // UPDATE FIREBASE METADATA
            // -------------------------------------

            await firebaseUpdate(

                firebaseRef(
                    database,
                    `${FILE_STORE_FILES_PATH}/${fileId}`
                ),

                {

                    name:
                        cleanName,

                    storagePath:
                        newStoragePath,

                    downloadURL:
                        newDownloadURL

                }

            );


            // -------------------------------------
            // LOCAL CACHE
            // -------------------------------------

            fileStoreFiles[
                fileId
            ].name =
                cleanName;


            fileStoreFiles[
                fileId
            ].storagePath =
                newStoragePath;


            fileStoreFiles[
                fileId
            ].downloadURL =
                newDownloadURL;

        }


        // -----------------------------------------
        // OLD FIREBASE DOCUMENT
        // -----------------------------------------

        else{

            await firebaseSet(

                firebaseRef(
                    database,
                    `${FILE_STORE_FILES_PATH}/${fileId}/name`
                ),

                cleanName

            );


            fileStoreFiles[
                fileId
            ].name =
                cleanName;

        }


        // -----------------------------------------
        // AUDIT
        // -----------------------------------------

        await writeAuditLog(

            "FILE_STORE_RENAME_DOCUMENT",

            `Renamed document "${fileStoreRenameItem.name}" to "${cleanName}".`

        );

    }


    // =========================================
    // UPDATE UI
    // =========================================

    closeFileStoreRenameModal();

    renderFileStore();

}

// =========================================================
// OPEN MOVE MODAL
// =========================================================

function openFileStoreMoveModal(
    type,
    item
){

    if(!item){

        return;

    }


    const modal =
        document.getElementById(
            "moveFileStoreModal"
        );


    const itemName =
        document.getElementById(
            "moveFileStoreItemName"
        );


    const icon =
        document.getElementById(
            "moveFileStoreIcon"
        );


    const sectionSelect =
        document.getElementById(
            "moveFileStoreSection"
        );


    const folderSelect =
        document.getElementById(
            "moveFileStoreFolder"
        );


    if(
        !modal ||
        !itemName ||
        !sectionSelect ||
        !folderSelect
    ){

        console.error(
            "FILE STORE — Move modal elements not found."
        );

        return;

    }


    // -----------------------------------------
    // STORE CURRENT ITEM
    // -----------------------------------------

    fileStoreMoveType =
        type;


    fileStoreMoveItem =
        item;


    // -----------------------------------------
    // BASIC INFORMATION
    // -----------------------------------------

    itemName.textContent =
        item.name ||
        "Item";


    if(icon){

        icon.textContent =
            type === "folder"
                ? "📁"
                : "📄";

    }


    // -----------------------------------------
    // LOAD SECTIONS
    // -----------------------------------------

    populateFileStoreMoveSections();


    // -----------------------------------------
    // INITIAL SECTION
    // -----------------------------------------

    let currentSectionId =
        null;


    if(type === "folder"){

        currentSectionId =
            item.sectionId ||
            fileStoreCurrentSectionId ||
            "";

    }
    else{

        const currentFolder =
            fileStoreFolders[
                item.folderId
            ];


        currentSectionId =
            currentFolder?.sectionId ||
            fileStoreCurrentSectionId ||
            "";

    }


    if(currentSectionId){

        sectionSelect.value =
            currentSectionId;

    }


    // -----------------------------------------
    // LOAD FOLDERS
    // -----------------------------------------

    populateFileStoreMoveFolders(
        currentSectionId
    );


    // -----------------------------------------
    // CURRENT FOLDER
    // -----------------------------------------

    const currentFolderId =
        type === "folder"

            ? item.parentId || ""

            : item.folderId || "";


    if(
        currentFolderId
    ){

        folderSelect.value =
            currentFolderId;

    }


    updateFileStoreMoveDestination();


    // -----------------------------------------
    // OPEN
    // -----------------------------------------

    modal.style.display =
        "flex";

}

// =========================================================
// POPULATE MOVE SECTIONS
// =========================================================

function populateFileStoreMoveSections(){

    const select =
        document.getElementById(
            "moveFileStoreSection"
        );


    if(!select){

        return;

    }


    select.innerHTML = `

        <option value="">
            Select section
        </option>

    `;


    Object.entries(
        fileStoreSections
    )
        .sort(
            ([,a],[,b]) =>
                String(a.name || "")
                    .localeCompare(
                        String(b.name || "")
                    )
        )
        .forEach(
            ([id,section]) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    id;


                option.textContent =
                    section.name ||
                    "Section";


                select.appendChild(
                    option
                );

            }
        );

}

// =========================================================
// POPULATE MOVE FOLDERS
// =========================================================

function populateFileStoreMoveFolders(
    sectionId
){

    const select =
        document.getElementById(
            "moveFileStoreFolder"
        );


    if(!select){

        return;

    }


    select.innerHTML = `

        <option value="">
            Section Root
        </option>

    `;


    if(!sectionId){

        updateFileStoreMoveDestination();

        return;

    }


    const folders =
        Object.entries(
            fileStoreFolders
        )
            .filter(
                ([,folder]) => {

                    return (
                        (
                            folder.sectionId ||
                            null
                        ) ===
                        sectionId
                    );

                }
            );


    folders
        .sort(
            ([,a],[,b]) =>
                String(a.name || "")
                    .localeCompare(
                        String(b.name || "")
                    )
        )
        .forEach(
            ([id,folder]) => {

                // -------------------------------------
                // Don't allow a folder to move into
                // itself or one of its children.
                // -------------------------------------

                if(
                    fileStoreMoveType ===
                    "folder"
                    &&
                    fileStoreMoveItem
                    &&
                    id ===
                    fileStoreMoveItem.id
                ){

                    return;

                }


                if(
                    fileStoreMoveType ===
                    "folder"
                    &&
                    fileStoreMoveItem
                    &&
                    isFileStoreFolderDescendant(
                        id,
                        fileStoreMoveItem.id
                    )
                ){

                    return;

                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    id;


                option.textContent =
                    getFileStoreFolderPath(
                        id
                    );


                select.appendChild(
                    option
                );

            }
        );


    updateFileStoreMoveDestination();

}

// =========================================================
// CHECK FOLDER DESCENDANT
// =========================================================

function isFileStoreFolderDescendant(
    folderId,
    ancestorId
){

    let currentId =
        folderId;


    let safetyCounter =
        0;


    while(
        currentId &&
        safetyCounter < 100
    ){

        if(
            currentId ===
            ancestorId
        ){

            return true;

        }


        const folder =
            fileStoreFolders[
                currentId
            ];


        if(!folder){

            return false;

        }


        currentId =
            folder.parentId ||
            null;


        safetyCounter++;

    }


    return false;

}

// =========================================================
// GET FOLDER PATH
// =========================================================

function getFileStoreFolderPath(
    folderId
){

    const parts = [];


    let currentId =
        folderId;


    let safetyCounter =
        0;


    while(
        currentId &&
        safetyCounter < 100
    ){

        const folder =
            fileStoreFolders[
                currentId
            ];


        if(!folder){

            break;

        }


        parts.unshift(
            folder.name ||
            "Folder"
        );


        currentId =
            folder.parentId ||
            null;


        safetyCounter++;

    }


    return parts.join(
        " / "
    );

}

// =========================================================
// UPDATE MOVE DESTINATION
// =========================================================

function updateFileStoreMoveDestination(){

    const destination =
        document.getElementById(
            "moveFileStoreDestination"
        );


    const sectionSelect =
        document.getElementById(
            "moveFileStoreSection"
        );


    const folderSelect =
        document.getElementById(
            "moveFileStoreFolder"
        );


    if(
        !destination ||
        !sectionSelect ||
        !folderSelect
    ){

        return;

    }


    const sectionId =
        sectionSelect.value;


    if(!sectionId){

        destination.textContent =
            "Select destination";

        return;

    }


    const section =
        fileStoreSections[
            sectionId
        ];


    if(!section){

        destination.textContent =
            "Select destination";

        return;

    }


    const parts = [

        section.name ||
        "Section"

    ];


    const folderId =
        folderSelect.value;


    if(folderId){

        const folderPath =
            getFileStoreFolderPath(
                folderId
            );


        if(folderPath){

            parts.push(
                folderPath
            );

        }

    }


    destination.textContent =
        parts.join(
            " / "
        );

}

// =========================================================
// MOVE FILE STORE ITEM
// =========================================================

async function moveFileStoreItem(){

    if(
        !checkFileStoreAccess()
    ){

        throw new Error(
            "Access denied."
        );

    }


    if(
        !fileStoreMoveItem ||
        !fileStoreMoveType
    ){

        throw new Error(
            "No item selected."
        );

    }


    const sectionSelect =
        document.getElementById(
            "moveFileStoreSection"
        );


    const folderSelect =
        document.getElementById(
            "moveFileStoreFolder"
        );


    const sectionId =
        sectionSelect?.value ||
        "";


    const destinationFolderId =
        folderSelect?.value ||
        null;


    if(!sectionId){

        throw new Error(
            "Please select a destination section."
        );

    }


    const section =
        fileStoreSections[
            sectionId
        ];


    if(!section){

        throw new Error(
            "Destination section not found."
        );

    }


    // =====================================================
    // DOCUMENT
    // =====================================================

    if(
        fileStoreMoveType ===
        "file"
    ){

        const fileId =
            fileStoreMoveItem.id;


        const file =
            fileStoreFiles[
                fileId
            ];


        if(!file){

            throw new Error(
                "Document no longer exists."
            );

        }


        // ---------------------------------------------
        // UPDATE FOLDER
        // ---------------------------------------------

        await firebaseSet(

            firebaseRef(
                database,
                `${FILE_STORE_FILES_PATH}/${fileId}/folderId`
            ),

            destinationFolderId

        );


        file.folderId =
            destinationFolderId;


        await writeAuditLog(

            "FILE_STORE_MOVE_DOCUMENT",

            `Moved document "${file.name}" to "${section.name}".`

        );

    }


    // =====================================================
    // FOLDER
    // =====================================================

    else if(
        fileStoreMoveType ===
        "folder"
    ){

        const folderId =
            fileStoreMoveItem.id;


        const folder =
            fileStoreFolders[
                folderId
            ];


        if(!folder){

            throw new Error(
                "Folder no longer exists."
            );

        }


        if(
            destinationFolderId ===
            folderId
        ){

            throw new Error(
                "A folder cannot be moved into itself."
            );

        }


        if(
            destinationFolderId
            &&
            isFileStoreFolderDescendant(
                destinationFolderId,
                folderId
            )
        ){

            throw new Error(
                "A folder cannot be moved into one of its own subfolders."
            );

        }


        // ---------------------------------------------
        // UPDATE FOLDER
        // ---------------------------------------------

        await firebaseSet(

            firebaseRef(
                database,
                `${FILE_STORE_FOLDERS_PATH}/${folderId}/parentId`
            ),

            destinationFolderId

        );


        await firebaseSet(

            firebaseRef(
                database,
                `${FILE_STORE_FOLDERS_PATH}/${folderId}/sectionId`
            ),

            sectionId

        );


        folder.parentId =
            destinationFolderId;


        folder.sectionId =
            sectionId;


        // ---------------------------------------------
        // UPDATE CHILDREN
        // ---------------------------------------------

        await updateFileStoreFolderChildrenSection(
            folderId,
            sectionId
        );


        await writeAuditLog(

            "FILE_STORE_MOVE_FOLDER",

            `Moved folder "${folder.name}" to "${section.name}".`

        );

    }


    // =====================================================
    // REFRESH
    // =====================================================

    closeFileStoreMoveModal();


    renderFileStoreSections();


    renderFileStore();

}

// =========================================================
// UPDATE CHILD FOLDER SECTIONS
// =========================================================

async function updateFileStoreFolderChildrenSection(
    parentFolderId,
    sectionId
){

    const children =
        Object.entries(
            fileStoreFolders
        )
            .filter(
                ([,folder]) => {

                    return (
                        (
                            folder.parentId ||
                            null
                        ) ===
                        parentFolderId
                    );

                }
            );


    for(
        const [
            childId,
            childFolder
        ]
        of children
    ){

        await firebaseSet(

            firebaseRef(
                database,
                `${FILE_STORE_FOLDERS_PATH}/${childId}/sectionId`
            ),

            sectionId

        );


        childFolder.sectionId =
            sectionId;


        await updateFileStoreFolderChildrenSection(
            childId,
            sectionId
        );

    }

}

// =========================================================
// CLOSE MOVE MODAL
// =========================================================

function closeFileStoreMoveModal(){

    const modal =
        document.getElementById(
            "moveFileStoreModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }


    fileStoreMoveType =
        null;


    fileStoreMoveItem =
        null;

}

// =========================================================
// OPEN DELETE MODAL
// =========================================================

function openFileStoreDeleteModal(
    type,
    item
){

    if(!item){

        return;

    }


    const modal =
        document.getElementById(
            "deleteFileStoreModal"
        );


    const itemName =
        document.getElementById(
            "deleteFileStoreItemName"
        );


    const icon =
        document.getElementById(
            "deleteFileStoreIcon"
        );


    const warning =
        document.getElementById(
            "deleteFileStoreWarningText"
        );


    if(
        !modal ||
        !itemName
    ){

        console.error(
            "FILE STORE — Delete modal elements not found."
        );

        return;

    }


    fileStoreDeleteType =
        type;


    fileStoreDeleteItem =
        item;


    itemName.textContent =
        item.name ||
        "Item";


    if(icon){

        icon.textContent =
            type === "folder"
                ? "📁"
                : getFileStoreIcon(
                    item.type,
                    item.name
                );

    }


    if(warning){

        if(type === "folder"){

            warning.textContent =
                "The folder and its contents will be permanently removed.";

        }
        else{

            warning.textContent =
                "The document will be permanently removed from the File Store.";

        }

    }


    modal.style.display =
        "flex";

}

// =========================================================
// CLOSE DELETE MODAL
// =========================================================

function closeFileStoreDeleteModal(){

    const modal =
        document.getElementById(
            "deleteFileStoreModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }


    fileStoreDeleteType =
        null;


    fileStoreDeleteItem =
        null;

}

// =========================================================
// DELETE DOCUMENT — SUPABASE STORAGE
// =========================================================

async function deleteFileStoreDocument(
    file
){

    // -----------------------------------------
    // VALIDATE
    // -----------------------------------------

    if(
        !file ||
        !file.id
    ){

        throw new Error(
            "Invalid document."
        );

    }


    // -----------------------------------------
    // ADMIN ACCESS
    // -----------------------------------------

    if(
        !checkFileStoreAccess()
    ){

        throw new Error(
            "Access denied."
        );

    }


    // -----------------------------------------
    // DELETE PHYSICAL FILE
    // -----------------------------------------

    if(
        file.storagePath
    ){

        // -------------------------------------
        // SUPABASE FILE
        // -------------------------------------

        if(
            file.storageProvider ===
            "supabase"
        ){

            const supabase =
                await getFileStoreSupabase();


            const {
                error
            } =
                await supabase
                    .storage
                    .from(
                        SUPABASE_BUCKET
                    )
                    .remove([
                        file.storagePath
                    ]);


            if(
                error
            ){

                console.error(
                    "FILE STORE — Supabase delete failed:",
                    error
                );


                throw new Error(
                    error.message ||
                    "Unable to delete document from Supabase."
                );

            }

        }

        // -------------------------------------
        // OLD FIREBASE FILE
        // -------------------------------------

        else{

            const storage =
                await getFileStoreStorage();


            const firebaseStorageModule =
                await import(
                    "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js"
                );


            const storageReference =
                firebaseStorageModule.ref(
                    storage,
                    file.storagePath
                );


            try{

                await firebaseStorageModule
                    .deleteObject(
                        storageReference
                    );

            }
            catch(error){

                // -----------------------------
                // OBJECT ALREADY DOES NOT EXIST
                // -----------------------------

                if(
                    error?.code !==
                    "storage/object-not-found"
                ){

                    throw error;

                }

            }

        }

    }


    // -----------------------------------------
    // DELETE DATABASE RECORD
    // -----------------------------------------

    await firebaseRemove(

        firebaseRef(
            database,
            `${FILE_STORE_FILES_PATH}/${file.id}`
        )

    );


    // -----------------------------------------
    // LOCAL CACHE
    // -----------------------------------------

    delete fileStoreFiles[
        file.id
    ];


    // -----------------------------------------
    // AUDIT
    // -----------------------------------------

    await writeAuditLog(

        "FILE_STORE_DELETE_DOCUMENT",

        `Deleted document "${file.name}".`

    );

}

// =========================================================
// DELETE FOLDER
// =========================================================

async function deleteFileStoreFolder(
    folderId
){

    const folder =
        fileStoreFolders[
            folderId
        ];


    if(!folder){

        throw new Error(
            "Folder no longer exists."
        );

    }


    // -----------------------------------------
    // FIND ALL CHILD FOLDERS
    // -----------------------------------------

    const folderIds = [];


    function collectChildren(
        parentId
    ){

        Object.entries(
            fileStoreFolders
        )
            .forEach(
                ([id,child]) => {

                    if(
                        (
                            child.parentId ||
                            null
                        ) ===
                        parentId
                    ){

                        folderIds.push(
                            id
                        );


                        collectChildren(
                            id
                        );

                    }

                }
            );

    }


    collectChildren(
        folderId
    );


    folderIds.push(
        folderId
    );


// -----------------------------------------
// FIND DOCUMENTS
// -----------------------------------------

const filesToDelete =
    Object.entries(
        fileStoreFiles
    )
    .filter(
        ([, file]) => {

            return folderIds.includes(
                file?.folderId
            );

        }
    );


// -----------------------------------------
// DELETE DOCUMENTS
// -----------------------------------------

for(
    const [
        fileId,
        file
    ]
    of filesToDelete
){

    // -----------------------------------------
    // RECOVER ID FROM DATABASE KEY
    // -----------------------------------------

    const normalizedFile = {

        ...file,

        id:
            file?.id ||
            fileId

    };


    await deleteFileStoreDocument(
        normalizedFile
    );

}


    // -----------------------------------------
    // DELETE FOLDERS
    // -----------------------------------------

    for(
        const id
        of folderIds
    ){

        await firebaseRemove(

            firebaseRef(
                database,
                `${FILE_STORE_FOLDERS_PATH}/${id}`
            )

        );


        delete fileStoreFolders[
            id
        ];

    }


    // -----------------------------------------
    // AUDIT
    // -----------------------------------------

    await writeAuditLog(

        "FILE_STORE_DELETE_FOLDER",

        `Deleted folder "${folder.name}" and its contents.`

    );

}

// =========================================================
// DELETE FILE STORE ITEM
// =========================================================

async function deleteFileStoreItem(){

    if(
        !checkFileStoreAccess()
    ){

        throw new Error(
            "Access denied."
        );

    }


    if(
        !fileStoreDeleteItem ||
        !fileStoreDeleteType
    ){

        throw new Error(
            "No item selected."
        );

    }


    if(
        fileStoreDeleteType ===
        "file"
    ){

        await deleteFileStoreDocument(
            fileStoreDeleteItem
        );

    }
    else if(
        fileStoreDeleteType ===
        "folder"
    ){

        await deleteFileStoreFolder(
            fileStoreDeleteItem.id
        );

    }


    closeFileStoreDeleteModal();


    await loadFileStoreData();


    renderFileStoreSections();

    renderFileStore();

}

// =========================================================
// OPEN REMOVE SECTION MODAL
// =========================================================

function openRemoveFileStoreSectionModal(){

    // -----------------------------------------
    // ACCESS
    // -----------------------------------------

    if(
        !checkFileStoreAccess()
    ){

        showError(
            "File Store",
            "Access denied."
        );

        return;

    }


    // -----------------------------------------
    // HOME CANNOT BE REMOVED
    // -----------------------------------------

    if(
        !fileStoreCurrentSectionId
    ){

        showError(
            "Remove Section",
            "Home cannot be removed."
        );

        return;

    }


    const section =
        fileStoreSections[
            fileStoreCurrentSectionId
        ];


    if(
        !section
    ){

        showError(
            "Remove Section",
            "The selected section could not be found."
        );

        return;

    }


    const modal =
        document.getElementById(
            "removeFileStoreSectionModal"
        );


    const sectionName =
        document.getElementById(
            "removeFileStoreSectionName"
        );


    if(
        !modal ||
        !sectionName
    ){

        console.error(
            "FILE STORE — Remove section modal not found."
        );

        return;

    }


    sectionName.textContent =
        section.name ||
        "Section";


    modal.style.display =
        "flex";

}


// =========================================================
// CLOSE REMOVE SECTION MODAL
// =========================================================

function closeRemoveFileStoreSectionModal(){

    const modal =
        document.getElementById(
            "removeFileStoreSectionModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }

}


// =========================================================
// EXECUTE REMOVE SECTION
// =========================================================

async function removeFileStoreSection(){

    if(
        !checkFileStoreAccess()
    ){

        throw new Error(
            "Access denied."
        );

    }


    const sectionId =
        fileStoreCurrentSectionId;


    if(
        !sectionId
    ){

        throw new Error(
            "Home cannot be removed."
        );

    }


    const section =
        fileStoreSections[
            sectionId
        ];


    if(
        !section
    ){

        throw new Error(
            "The selected section could not be found."
        );

    }


    const sectionName =
        section.name ||
        "Section";


    // -----------------------------------------
    // FIND ROOT FOLDERS
    // -----------------------------------------

    const rootFolders =
        Object.entries(
            fileStoreFolders
        )
        .filter(
            ([, folder]) => {

                return (

                    (
                        folder.sectionId ||
                        null
                    ) ===
                    sectionId

                    &&

                    (
                        folder.parentId ||
                        null
                    ) ===
                    null

                );

            }
        )
        .map(
            ([id]) =>
                id
        );


    // -----------------------------------------
    // DELETE ALL ROOT FOLDERS
    // Their children + documents are handled
    // by deleteFileStoreFolder()
    // -----------------------------------------

    for(
        const folderId
        of rootFolders
    ){

        await deleteFileStoreFolder(
            folderId
        );

    }


    // -----------------------------------------
    // DELETE SECTION
    // -----------------------------------------

    await firebaseRemove(

        firebaseRef(
            database,
            `${FILE_STORE_SECTIONS_PATH}/${sectionId}`
        )

    );


    // -----------------------------------------
    // LOCAL CACHE
    // -----------------------------------------

    delete fileStoreSections[
        sectionId
    ];


    // -----------------------------------------
// RETURN TO HOME
// -----------------------------------------

fileStoreCurrentSectionId = null;
fileStoreCurrentSectionName = "Home";

fileStoreCurrentFolderId = null;
fileStoreCurrentFolderName = "Home";
fileStoreCurrentFolderParentId = null;


// -----------------------------------------
// CLOSE MODAL
// -----------------------------------------

closeRemoveFileStoreSectionModal();


// -----------------------------------------
// RENDER HOME — COMPLETE RESET
// -----------------------------------------

renderFileStoreHome();
renderFileStoreSections();
renderFileStore();

    // -----------------------------------------
    // AUDIT
    // -----------------------------------------

    await writeAuditLog(

        "FILE_STORE_DELETE_SECTION",

        `Deleted section "${sectionName}" and all its contents.`

    );


    showSuccess(
        "Section Removed",
        `"${sectionName}" was permanently removed.`
    );

}