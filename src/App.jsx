import { useState, useEffect, useRef, useContext, createContext } from "react";
import { openDatabase, addToDatabase, queryNoteIndex, queryAnnotations, findBgColor } from "./DataBase.js";
import "./App.css";

const NoteContext = createContext(null);
const storeNameNote = "note_store";
// const pageSize = 30;

function UploadButton() {
  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jsonl";
    input.multiple = true;

    input.addEventListener("change", () => {
      uploadAndProcess(input);
    });

    input.click();
  };

  const uploadAndProcess = (fileInput) => {
    Array.from(fileInput.files).forEach((file) => {
      console.log(file);
      // extract the annotator name and convert it to uppercase
      let annotator = file.name.split("\\").pop().split(".")[0];
      annotator = annotator.charAt(0).toUpperCase() + annotator.slice(1);

      if (file) {
        console.log(file);
        const reader = new FileReader();
        reader.onload = function (event) {
          const lines = event.target.result.split("\n");
          lines.forEach((line, index) => {
            if (line) {
              try {
                const jsonData = JSON.parse(line);
                addToDatabase(jsonData, index, annotator);
              } catch (e) {
                console.error("Error parsing JSON", e);
                document.getElementById("message").innerText =
                  "Error parsing JSON: " + e;
              }
            }
          });
        };
        reader.readAsText(file);
      }
    });
  };

  return (
    <button
      className="bg-slate-400 p-2 hover:bg-blue-400 rounded-md"
      onClick={handleUpload}
    >
      Upload File(s)
    </button>
  );
}

function RefreshButton() {
  const currentNote = useContext(NoteContext);

  const handleRefresh = () => {
    updateCurrentData(currentNote)
  };

  return (
    <button className="bg-slate-400 p-2 hover:bg-blue-400 rounded-md" onClick={handleRefresh}>
      Refresh
    </button>
  );
}

function ToolBar() {
  return (
    <div className="w-full h-auto top-0 left-0 fixed bg-slate-200 flex flex-row gap-3 p-2 z-10">
      <UploadButton />
      <RefreshButton />
      <button className="bg-slate-400 p-2 hover:bg-blue-400 rounded-md">
        Ipsum
      </button>
    </div>
  );
}

function MainWindow() {

  const currentNote = useContext(NoteContext);

  let labelCount = null;
  try {
    labelCount = currentNote.spans.val.filter(span => span.annotator.length > 0).length;
  } catch {
    labelCount = 'N/a';
  }
  // const labelCount = currentNote.spans.val.filter(span => span.annotators.length > 0).length ? '1' : 'N/a';

  
  return (
    <div className="h-full w-full flex flex-col">
      <h1 className="bg-slate-400 p-1 rounded-t-lg">{labelCount} {labelCount !== 1 ? 'Labels' : 'Label'}</h1>
      <div className="flex w-full h-full overflow-auto">
        <DecrementButton />
        <MainTextBox />
        <IncrementButton />
      </div>
    </div>
  );
}

function formatAnnotations(newLabels, newData) {
  let sliceArray = [];

  // sort first indexes in ascending order
  const sortedLabels = newLabels.sort((a, b) => a.span[0] - b.span[0]);

  // if there are no labels, just print the text
  if (sortedLabels.length === 0) {
    sliceArray.push({
      text: newData.text,
      label_id: [],
      label_name: [],
      annotator: [],
      span: [0, newData.text.length],
    });
    return sliceArray;
  }

  let currentStart = 0;

  for (let i = 0; i < sortedLabels.length; i++) {
    const currentLabel = sortedLabels[i];

    let labelIdArray = [];
    let labelNameArray = [];
    let annotatorArray = [];

    let [start, end] = currentLabel.span;
    labelIdArray.push(currentLabel.label_id);
    labelNameArray.push(currentLabel.label_name);
    annotatorArray.push(currentLabel.annotator);

    // iterate over the remaining labels
    sortedLabels.slice(i + 1).every((label) => {
      // if they overlap with the current label
      if (end >= label.span[0]) {
        // merge start/end indexes and add id/name to arrays
        start = Math.min(start, label.span[0]);
        end = Math.max(end, label.span[1]);
        labelIdArray.push(label.label_id);
        labelNameArray.push(label.label_name);
        annotatorArray.push(label.annotator);
        return true;
      }
      return false;
    });

    // append prefix slice to the sliceArray
    sliceArray.push({
      text: newData.text.slice(currentStart, start),
      label_id: [],
      label_name: [],
      annotator: [],
      span: [currentStart, start],
    });

    // append the label slice to the sliceArray
    sliceArray.push({
      text: newData.text.slice(start, end),
      label_id: labelIdArray,
      label_name: labelNameArray,
      annotator: annotatorArray,
      span: [start, end],
    });
  }
  return sliceArray;
}

function labelCurrentNote(currentNote, sliceArray) { // apply block and text-center on click
  let outString = "";
  sliceArray.forEach((slice, sliceIndex) => {
    const uniqueLabels = [...new Set(slice.label_id)];
    const colorArray = uniqueLabels.map((label) => findBgColor(label));

    let colorString = "";

    if (uniqueLabels.length === 1) {
      colorString = `background-color: ${colorArray[0]}`;
    } else {
      colorString = `background: linear-gradient(90deg, ${colorArray.join(', ')})`;
    }

    const labelClass = `class="border-2 border-slate-300 hover:border-white text-white p-1 rounded cursor-pointer" style="${colorString}"`;

    // if the slice has a label, format it otherwise just return the text
    const frequencyString = `<span class="p-2 m-1 bg-white text-black font-bold text-2xl rounded-xl leading-snug">${slice.label_id.length}</span>`
    outString = outString + (slice.label_id.length > 0 ? `<span id="span-${sliceIndex}" ${labelClass}>${slice.text}${frequencyString}</span>` : `<span>${slice.text}</span>`);
  });
  currentNote.print.func(outString);
}

function updateCurrentData(currentNote) {
  queryNoteIndex(currentNote.idx.val)
    .then((newData) => queryAnnotations(currentNote.idx.val).then((newLabels) => {
      const sliceArray = formatAnnotations(newLabels, newData)
      currentNote.spans.func(sliceArray);
      labelCurrentNote(currentNote, sliceArray);
    }));
}

function MainTextBox() {
  const currentNote = useContext(NoteContext);
  useEffect(() => {
    updateCurrentData(currentNote);
  },[currentNote.idx.val])

  const paraRef = useRef(null);

  useEffect(() => {
    const handleSpanClick = (event) => {
      if (event.target.id.startsWith("span-")) {
        const index = event.target.id.split("-")[1];
        currentNote.target_span.func(index);
        };
    };

    const current = paraRef.current;
    current.addEventListener("click", handleSpanClick);

    return () => {
      current.removeEventListener("click", handleSpanClick);
    };
  }, []);


  // labelCurrentNote(currentNote);
  const currentText = currentNote.print.val ? currentNote.print.val : "No data available...";

  // add whitespace-pre-line to the <p> to preserve newlines
  return (
    <div className="h-full w-full overflow-auto">
      <p ref={paraRef} className="text-left text-2xl whitespace-pre-line m-5 leading-loose" dangerouslySetInnerHTML={{ __html: currentText }}></p>
    </div>
  );
}

function DecrementButton() {
  const currentNote = useContext(NoteContext);

  const handleDecrement = () => {
    const newIdx = currentNote.idx.val - 1;
    currentNote.idx.func(newIdx < 0 ? 0 : newIdx);
  };

  return (
    <button className="h-full p-5 font-extrabold text-5xl text-slate-400 hover:bg-blue-300 hover:text-blue-500" onClick={handleDecrement}>
      &lt;
    </button>
  );
}

function IncrementButton() {
  const currentNote = useContext(NoteContext);

  const handleIncrement = () => {
    const newIdx = currentNote.idx.val + 1;
    currentNote.idx.func(newIdx); // CONSTRAIN TO MAX INDEX
  };

  return (
    <button className="p-5 font-extrabold text-5xl text-slate-400 hover:bg-blue-300 hover:text-blue-500" onClick={handleIncrement}>
      &gt;
    </button>
  );
}

function StatsWindow() {
  const currentNote = useContext(NoteContext);
  const currentSpan = currentNote.spans.val ? currentNote.spans.val[currentNote.target_span.val] : {annotator: []};

  const formatSpanLabel = (span, index) => {
    // console.log('span', span);
    // const annotatorString = span?.annotator[index] ? span.annotator[index] : "";
    const bgColorString = span?.label_id[index] ? {backgroundColor: findBgColor(span.label_id[index])} : {};

    return (
      <div className="flex flex-col h-full w-full gap-5 p-5" style={bgColorString}>
        <div className="text-white m-auto">
          <h1 className="text-3xl">{currentSpan?.annotator[index] ? "Annotator: ": ''}</h1>
          <h1 className="text-2xl">{currentSpan?.annotator[index] ? currentSpan.annotator[index] : ''}</h1>
        </div>
        <div className="text-white m-auto">
          <h1 className="text-3xl">{currentSpan?.annotator[index] ? "Label: ": ''}</h1>
          <h1 className="text-2xl">{currentSpan?.label_name[index] ? currentSpan.label_name[index] : ''}</h1>
        </div>
      </div>
    );
  }

  console.log(currentSpan);

  return (
    <div className="h-full w-full flex flex-col">
      <h1 className="bg-slate-400 p-1 rounded-t-lg">Statistics</h1>
      <div className="w-full h-full grid grid-cols-3 p-2 gap-2">
        <div className="bg-slate-200 w-full h-full">{formatSpanLabel(currentSpan, 0)}</div>
        <div className="bg-slate-200 w-full h-full">{formatSpanLabel(currentSpan, 1)}</div>
        <div className="bg-slate-200 w-full h-full">{formatSpanLabel(currentSpan, 2)}</div>
      </div>
    </div>
  );
}

function SelectorWindow() {
  const currentNote = useContext(NoteContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  // const cursor = {};

  const fetchNotes = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      openDatabase(storeNameNote).then((db) => {
        const transaction = db.transaction([storeNameNote], "readwrite");
        const store = transaction.objectStore(storeNameNote);
        
        const cursorRequest = store.openCursor();
        let fetchedNotes = [];

        cursorRequest.onsuccess = e => {
          const cursor = e.target.result; 
          if (cursor) {
            fetchedNotes.push(cursor.value);
            // console.log('cursor', cursor)
            // console.log('cursor.key', cursor.key)
            // cursorRef.current = cursor.key;  // Update the cursor reference to the current cursor key
            cursor.continue();
          } else {
            console.log('no more notes')
            // When no more items, update states
            if (fetchedNotes.length) {
              setNotes(prev => [...prev, ...fetchedNotes]);
            }
            setHasMore(false);
            setLoading(false);
          }

      };
      });
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      setLoading(false);
      setHasMore(false);
    }
  };
  fetchNotes();

  const updateNoteIndex = (index) => {
    currentNote.idx.func(index)
  }

  return (
    <div ref={containerRef} className="overflow-y-auto h-full p-4 items-stretch">
      {notes.map((note, index) => (
        <button key={index} className="p-1 my-1 mx-auto w-full text-left bg-gray-200 hover:bg-blue-300 hover:text-blue-500 flex justify-between object-left" onClick={(event) => updateNoteIndex(index)}>
          <div className="p-1 text-xl order-first">#{note.df_id}</div>
          <div className="p-1 order-last">{note.category}</div>
        </button>
        // <div key={index} className="p-2 m-2 text-left bg-gray-200 hover:bg-blue-300 hover:text-blue-500 rounded">
        //   Note ID: {note.df_id} ------ {note.category}
        // </div>
      ))}
      {loading && <div>Loading more notes...</div>}
    </div>
  );
};

function App() {
  const [noteIndex, setNoteIndex] = useState(0);
  // const [noteData, setNoteData] = useState({});
  const [printData, setPrintData] = useState("");
  const [spanData, setSpanData] = useState({});
  const [targetSpan, setTargetSpan] = useState(null);

  return (
    <NoteContext.Provider
      value={{
        idx: { val: noteIndex, func: setNoteIndex },
        // data: { val: noteData, func: setNoteData },
        print: {val: printData, func: setPrintData},
        spans: {val: spanData, func: setSpanData},
        target_span: {val: targetSpan, func: setTargetSpan}
      }}
    >
      <ToolBar />
      <div className="grid grid-rows-5 grid-cols-3 gap-5 inset-0 mt-20 m-10 fixed">
        <div className="bg-slate-300 col-span-2 row-span-3 rounded-lg">
          <MainWindow />
        </div>
        <div className="bg-slate-300 row-span-5 rounded-lg">
          <SelectorWindow />
        </div>
        <div className="bg-slate-300 col-span-2 row-span-2 rounded-lg">
          <StatsWindow />
        </div>
      </div>
    </NoteContext.Provider>
  );
}

export default App;
