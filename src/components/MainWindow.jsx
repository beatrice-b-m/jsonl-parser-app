// function MainWindow() {

//     const currentNote = useContext(NoteContext);

//     let labelCount = null;
//     try {
//         labelCount = currentNote.spans.val.filter(span => span.annotator.length > 0).length;
//     } catch {
//         labelCount = 'N/a';
//     }
//     // const labelCount = currentNote.spans.val.filter(span => span.annotators.length > 0).length ? '1' : 'N/a';


//     return (
//         <div className="h-full w-full flex flex-col">
//             <h1 className="p-1">{labelCount} {labelCount !== 1 ? 'Labels' : 'Label'}</h1>
//             <div className="flex w-full h-full overflow-auto">
//                 <DecrementButton />
//                 <MainTextBox />
//                 <IncrementButton />
//             </div>
//         </div>
//     );
// }

// function formatAnnotations(newLabels, newData) {
//     let sliceArray = [];

//     // sort first indexes in ascending order
//     const sortedLabels = newLabels.sort((a, b) => a.span[0] - b.span[0]);

//     // if there are no labels, just print the text
//     if (sortedLabels.length === 0) {
//         sliceArray.push({
//             text: newData.text,
//             label_id: [],
//             label_name: [],
//             annotator: [],
//             span: [0, newData.text.length],
//         });
//         return sliceArray;
//     }

//     let currentStart = 0;

//     for (let i = 0; i < sortedLabels.length; i++) {
//         const currentLabel = sortedLabels[i];

//         let labelIdArray = [];
//         let labelNameArray = [];
//         let annotatorArray = [];

//         let [start, end] = currentLabel.span;
//         labelIdArray.push(currentLabel.label_id);
//         labelNameArray.push(currentLabel.label_name);
//         annotatorArray.push(currentLabel.annotator);

//         // iterate over the remaining labels
//         sortedLabels.slice(i + 1).every((label) => {
//             // if they overlap with the current label
//             if (end >= label.span[0]) {
//                 // merge start/end indexes and add id/name to arrays
//                 start = Math.min(start, label.span[0]);
//                 end = Math.max(end, label.span[1]);
//                 labelIdArray.push(label.label_id);
//                 labelNameArray.push(label.label_name);
//                 annotatorArray.push(label.annotator);
//                 return true;
//             }
//             return false;
//         });

//         // append prefix slice to the sliceArray
//         sliceArray.push({
//             text: newData.text.slice(currentStart, start),
//             label_id: [],
//             label_name: [],
//             annotator: [],
//             span: [currentStart, start],
//         });

//         // append the label slice to the sliceArray
//         sliceArray.push({
//             text: newData.text.slice(start, end),
//             label_id: labelIdArray,
//             label_name: labelNameArray,
//             annotator: annotatorArray,
//             span: [start, end],
//         });
//     }
//     return sliceArray;
// }

// function labelCurrentNote(currentNote, sliceArray) {
//     let outString = "";
//     sliceArray.forEach((slice, sliceIndex) => {
//         const uniqueLabels = [...new Set(slice.label_id)];
//         const colorArray = uniqueLabels.map((label) => findBgColor(label));

//         let colorString = "";

//         if (uniqueLabels.length === 1) {
//             colorString = `background-color: ${colorArray[0]}`;
//         } else {
//             colorString = `background: linear-gradient(90deg, ${colorArray.join(', ')})`;
//         }

//         const labelClass = `class="border-2 border-slate-300 hover:border-white text-white p-1 rounded cursor-pointer" style="${colorString}"`;

//         // if the slice has a label, format it otherwise just return the text
//         const frequencyString = `<span class="p-2 m-1 bg-white text-black font-bold text-2xl rounded-xl leading-snug">${slice.label_id.length}</span>`
//         outString = outString + (slice.label_id.length > 0 ? `<span id="span-${sliceIndex}" ${labelClass}>${slice.text}${frequencyString}</span>` : `<span>${slice.text}</span>`);
//     });
//     currentNote.print.func(outString);
// }

// function updateCurrentData(currentNote) {
//     queryNoteIndex(currentNote.idx.val)
//         .then((newData) => queryAnnotations(currentNote.idx.val).then((newLabels) => {
//             const sliceArray = formatAnnotations(newLabels, newData)
//             currentNote.spans.func(sliceArray);
//             labelCurrentNote(currentNote, sliceArray);
//         }));
// }

// function MainTextBox() {
//     const currentNote = useContext(NoteContext);
//     useEffect(() => {
//         updateCurrentData(currentNote);
//     }, [currentNote.idx.val])

//     const paraRef = useRef(null);

//     useEffect(() => {
//         const handleSpanClick = (event) => {
//             if (event.target.id.startsWith("span-")) {
//                 const index = event.target.id.split("-")[1];
//                 currentNote.target_span.func(index);
//             };
//         };

//         const current = paraRef.current;
//         current.addEventListener("click", handleSpanClick);

//         return () => {
//             current.removeEventListener("click", handleSpanClick);
//         };
//     }, []);


//     // labelCurrentNote(currentNote);
//     const currentText = currentNote.print.val ? currentNote.print.val : "No data available...";

//     // add whitespace-pre-line to the <p> to preserve newlines
//     return (
//         <div className="h-full w-full overflow-auto">
//             <p ref={paraRef} className="text-left text-2xl whitespace-pre-line m-5 leading-loose" dangerouslySetInnerHTML={{ __html: currentText }}></p>
//         </div>
//     );
// }

// function DecrementButton() {
//     const currentNote = useContext(NoteContext);

//     const handleDecrement = () => {
//         const newIdx = currentNote.idx.val - 1;
//         currentNote.idx.func(newIdx < 0 ? 0 : newIdx);
//         currentNote.target_span.func(null);
//     };

//     return (
//         <button className="h-full p-5 font-extrabold text-5xl text-slate-400 hover:bg-blue-300 hover:text-blue-500" onClick={handleDecrement}>
//             &lt;
//         </button>
//     );
// }

// function IncrementButton() {
//     const currentNote = useContext(NoteContext);

//     const handleIncrement = () => {
//         const newIdx = currentNote.idx.val + 1;
//         currentNote.idx.func(newIdx); // CONSTRAIN TO MAX INDEX
//         currentNote.target_span.func(null);
//     };

//     return (
//         <button className="p-5 font-extrabold text-5xl text-slate-400 hover:bg-blue-300 hover:text-blue-500" onClick={handleIncrement}>
//             &gt;
//         </button>
//     );
// }