// function SelectorWindow() {
//     const currentNote = useContext(NoteContext);
//     const [notes, setNotes] = useState([]);
//     const [labels, setLabels] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [hasMore, setHasMore] = useState(true);
//     const containerRef = useRef(null);
//     // const cursor = {};

//     const fetchNotes = async () => {
//         console.log('fetching notes');
//         if (loading || !hasMore) return;
//         setLoading(true);
//         try {
//             openDatabase(storeNameNote).then((db) => {
//                 const transaction = db.transaction([storeNameNote], "readwrite");
//                 const store = transaction.objectStore(storeNameNote);

//                 const cursorRequest = store.openCursor();
//                 let fetchedNotes = [];

//                 cursorRequest.onsuccess = e => {
//                     const cursor = e.target.result;
//                     if (cursor) {
//                         fetchedNotes.push(cursor.value);
//                         // console.log('cursor', cursor)
//                         // console.log('cursor.key', cursor.key)
//                         // cursorRef.current = cursor.key;  // Update the cursor reference to the current cursor key
//                         cursor.continue();
//                     } else {
//                         console.log('no more notes')
//                         // When no more items, update states
//                         if (fetchedNotes.length) {
//                             setNotes(prev => [...prev, ...fetchedNotes]);
//                         }
//                         setHasMore(false);
//                         setLoading(false);
//                     }

//                 };
//             });
//         } catch (error) {
//             console.error("Failed to fetch notes:", error);
//             setLoading(false);
//             setHasMore(false);
//         }
//     };

//     useEffect(() => {
//         console.log('fetching labels');
//         let fetchedLabels = [];
//         for (let i = 0; i < notes.length; i++) {
//             queryAnnotations(i).then((labels) => {
//                 fetchedLabels.push(labels);
//             });
//         }

//         setLabels(fetchedLabels);
//         console.log('labels', fetchedLabels);
//         console.log('labels 2', labels[2]);
//     }, [notes])

//     fetchNotes();

//     //   
//     //   }
//     // });


//     const updateNoteIndex = (index) => {
//         currentNote.idx.func(index)
//         currentNote.target_span.func(null);
//     }

//     // console.log(fetchedLabels);

//     return (
//         <div ref={containerRef} className="overflow-y-auto h-full p-4 items-stretch">
//             {notes.map((note, noteIndex) => (
//                 <button key={noteIndex} className="py-1 px-3 my-1 mx-auto w-full text-left rounded-2xl border-2 border-slate-100 hover:border-blue-300 hover:shadow-inner flex justify-between object-left" onClick={(event) => updateNoteIndex(noteIndex)}>
//                     <div className="h-full my-auto p-2 text-xl order-first rounded-2xl border-2" style={{ borderColor: `${note.df_id === currentNote.idx.val ? '#3B82F6' : '#F1F5F9'}` }}>#{note.df_id}</div>
//                     <div className="h-full p-1 order-last flex flex-row gap-2">
//                         <div className="h-full my-auto p-1">{note.category}</div>
//                         <div className="h-full p-2 m-1 border-2 border-slate-300 font-bold text-xl rounded-xl leading-snug">{labels[noteIndex] ? labels[noteIndex].length : 0}</div>
//                     </div>
//                 </button>
//                 // <div key={index} className="p-2 m-2 text-left bg-gray-200 hover:bg-blue-300 hover:text-blue-500 rounded">
//                 //   Note ID: {note.df_id} ------ {note.category}
//                 // </div>
//             ))}
//             {loading && <div>Loading more notes...</div>}
//         </div>
//     );
// };