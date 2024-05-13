const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

const dbName = "NoteDatabase";
const storeNameNote = "note_store";
const storeNameAnnotation = "annotation_store";
let annId = -1;

export function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 4);

    request.onerror = () => reject("Database error: " + request.errorCode); // Using request directly
    request.onsuccess = () => resolve(request.result); // Using request directly

    request.onupgradeneeded = () => {
      const db = request.result;
      const note_store = db.createObjectStore(storeNameNote, {
        keyPath: "df_id",
      }); // Create object store as needed
      note_store.createIndex("note_category", ["category"], { unique: false });
      note_store.createIndex("note_drg_code", ["drg_code"], { unique: false });
      note_store.createIndex("note_subject_id", ["subject_id"], {
        unique: false,
      });
      note_store.createIndex("note_hadm_id", ["hadm_id"], { unique: false });

      const ann_store = db.createObjectStore(storeNameAnnotation, {
        keyPath: "annotation_id",
      }); // Create object store as needed
      ann_store.createIndex("label_df_id", ["df_id"], {
        unique: false,
      });
      ann_store.createIndex("label_annotator", ["annotator"], {
        unique: false,
      });
    };
  });
}

export function addToDatabase(data, id, annotator) {
  openDatabase(storeNameNote).then((db) => {
    const transaction = db.transaction([storeNameNote], "readwrite");
    const store = transaction.objectStore(storeNameNote);

    // log notes in the db
    const formatNoteData = (data, id) => {
      return {
        df_id: id,
        text: data.text,
        subject_id: data.SUBJECT_ID,
        hadm_id: data.HADM_ID,
        category: data.CATEGORY,
        description: data.DESCRIPTION,
        drg_code: data.DRG_CODE,
      };
    };
    store.put(formatNoteData(data, id));
  });

  // log annotations in the db
  openDatabase(storeNameAnnotation).then((db) => {
    const transaction = db.transaction([storeNameAnnotation], "readwrite");
    const store = transaction.objectStore(storeNameAnnotation);

    // Parse JSON object and format labels
    const formattedLabels = data.label.map((label, index) => {
      const [start, end, labelText] = label;
      const labelId = findLabelId(labelText);
      annId++;
      return {
        annotation_id: annId,
        df_id: id,
        annotator: annotator,
        label_name: labelText,
        label_id: labelId,
        span: [start, end]
      };
    });

    // console.log('formattedLabels', formattedLabels);

    formattedLabels.forEach(function (label) {
      store.put(label);
    });

    
  });
}

// Your JSON data
const labelsJSON = [
  {
    "id": 3,
    "text": "FAMILY: Positive",
    "prefixKey": null,
    "suffixKey": null,
    "backgroundColor": "#1526ea",
    "textColor": "#ffffff"
  },
  {
    "id": 4,
    "text": "FAMILY: Negative",
    "prefixKey": null,
    "suffixKey": null,
    "backgroundColor": "#ead915",
    "textColor": "#ffffff"
  },
  {
    "id": 5,
    "text": "PROGNOSIS: Positive",
    "prefixKey": null,
    "suffixKey": null,
    "backgroundColor": "#3fc060",
    "textColor": "#ffffff"
  },
  {
    "id": 6,
    "text": "PROGNOSIS: Negative",
    "prefixKey": null,
    "suffixKey": null,
    "backgroundColor": "#c03f9f",
    "textColor": "#ffffff"
  },
  {
    "id": 7,
    "text": "PATIENT: Positive",
    "prefixKey": null,
    "suffixKey": null,
    "backgroundColor": "#24dbba",
    "textColor": "#ffffff"
  },
  {
    "id": 8,
    "text": "PATIENT: Negative",
    "prefixKey": null,
    "suffixKey": null,
    "backgroundColor": "#db2445",
    "textColor": "#ffffff"
  },
  {
    "id": 9,
    "text": "EVENT: Family/Goals of Care Meeting",
    "prefixKey": null,
    "suffixKey": null,
    "backgroundColor": "#000000",
    "textColor": "#ffffff"
  },
  {
    "id": 10,
    "text": "EVENT: Care Withdrawn/Comfort Measures Only",
    "prefixKey": null,
    "suffixKey": null,
    "backgroundColor": "#000000",
    "textColor": "#ffffff"
  }
];

// Function to find label ID based on text
function findLabelId(labelText) {
  const label = labelsJSON.find(label => label.text === labelText);
  return label ? label.id : null;
}

// Function to find label ID based on text
export function findBgColor(labelId) {
  const label = labelsJSON.find(label => label.id === labelId);
  return label ? label.backgroundColor : null;
}

// // Function to find label ID based on text
// function findLabelId(labelText) {
//   const label = labelsJSON.find(label => label.text === labelText);
//   return label ? label.id : null;
// }

export function queryNoteIndex(id) {
  return new Promise((resolve, reject) => {
    openDatabase(storeNameNote).then((db) => {
      const transaction = db.transaction([storeNameNote], "readonly");
      const store = transaction.objectStore(storeNameNote);
      const request = store.get(id);
      // console.log('request', request)
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.result);
    });
  });

}

export function queryAnnotations(df_id) {
  return new Promise((resolve, reject) => {
    openDatabase(storeNameNote).then((db) => {
      const transaction = db.transaction([storeNameAnnotation], "readonly");
      const store = transaction.objectStore(storeNameAnnotation);
      const dfIdIndex = store.index('label_df_id');
      const request = dfIdIndex.getAll([df_id]);
      // console.log('request', request)
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.result);
    });
  });

}

// export function fetchDataForSelector(setNotes, setLoading, setHasMore, cursorRef, pageSize = 30) { 
  
// }


function fetchDataAndUpdateUI() {
  openDatabase().then((db) => {
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const cursorRequest = store.openCursor();
    const dataRows = document
      .getElementById("dataTable")
      .getElementsByTagName("tbody")[0];
    dataRows.innerHTML = "";

    cursorRequest.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        const row = dataRows.insertRow();
        row.insertCell(0).textContent = cursor.value.id;
        row.insertCell(1).textContent = JSON.stringify(cursor.value.data);
        cursor.continue();
      }
    };
  });
}
