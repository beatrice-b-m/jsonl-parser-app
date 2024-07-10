// function StatsWindow() {
//     const currentNote = useContext(NoteContext);
//     const currentSpan = currentNote.spans.val ? currentNote.spans.val[currentNote.target_span.val] : { annotator: [] };

//     const formatSpanLabel = (span, index) => {
//         // console.log('span', span);
//         // const annotatorString = span?.annotator[index] ? span.annotator[index] : "";
//         const bgColorString = span?.label_id[index] ? { backgroundColor: findBgColor(span.label_id[index]) } : {};

//         return (
//             <div className="flex flex-col h-full w-full gap-5 p-5" style={bgColorString}>
//                 <div className="text-white m-auto">
//                     <h1 className="text-3xl">{currentSpan?.annotator[index] ? "Annotator: " : ''}</h1>
//                     <h1 className="text-2xl">{currentSpan?.annotator[index] ? currentSpan.annotator[index] : ''}</h1>
//                 </div>
//                 <div className="text-white m-auto">
//                     <h1 className="text-3xl">{currentSpan?.annotator[index] ? "Label: " : ''}</h1>
//                     <h1 className="text-2xl">{currentSpan?.label_name[index] ? currentSpan.label_name[index] : ''}</h1>
//                 </div>
//             </div>
//         );
//     }

//     console.log(currentSpan);

//     return (
//         <div className="h-full w-full flex flex-col">
//             <h1 className="p-1 rounded-t-lg">Annotations</h1>
//             <div className="w-full h-full grid grid-cols-3 p-2 gap-2 overflow-auto">
//                 <div className="border-2 border-slate-100 w-full h-full">{formatSpanLabel(currentSpan, 0)}</div>
//                 <div className="border-2 border-slate-100 w-full h-full">{formatSpanLabel(currentSpan, 1)}</div>
//                 <div className="border-2 border-slate-100 w-full h-full">{formatSpanLabel(currentSpan, 2)}</div>
//             </div>
//         </div>
//     );
// }