// import React from 'react'

// function UploadButton() {
//     const handleUpload = () => {
//         const input = document.createElement("input");
//         input.type = "file";
//         input.accept = ".jsonl";
//         input.multiple = true;

//         input.addEventListener("change", () => {
//             uploadAndProcess(input);
//         });

//         input.click();
//     };

//     const uploadAndProcess = (fileInput) => {
//         Array.from(fileInput.files).forEach((file) => {
//             console.log(file);
//             // extract the annotator name and convert it to uppercase
//             let annotator = file.name.split("\\").pop().split(".")[0];
//             annotator = annotator.charAt(0).toUpperCase() + annotator.slice(1);

//             if (file) {
//                 console.log(file);
//                 const reader = new FileReader();
//                 reader.onload = function (event) {
//                     const lines = event.target.result.split("\n");
//                     lines.forEach((line, index) => {
//                         if (line) {
//                             try {
//                                 const jsonData = JSON.parse(line);
//                                 addToDatabase(jsonData, index, annotator);
//                             } catch (e) {
//                                 console.error("Error parsing JSON", e);
//                                 document.getElementById("message").innerText =
//                                     "Error parsing JSON: " + e;
//                             }
//                         }
//                     });
//                 };
//                 reader.readAsText(file);
//             }
//         });
//     };

//     return (
//         <button
//             className="p-2 border-2 border-white hover:border-blue-200 hover:shadow-md rounded-md"
//             onClick={handleUpload}
//         >
//             Upload File(s)
//         </button>
//     );
// }

// function RefreshButton() {
//     const currentNote = useContext(NoteContext);

//     const handleRefresh = () => {
//         updateCurrentData(currentNote)
//     };

//     return (
//         <button className="p-2 border-2 border-white hover:border-blue-200 hover:shadow-md rounded-md" onClick={handleRefresh}>
//             Refresh
//         </button>
//     );
// }

// function ToolBar() {
//     return (
//         <div className="w-full h-auto top-0 left-0 fixed flex flex-row gap-5 p-5 z-10">
//             <UploadButton />
//             <RefreshButton />
//         </div>
//     );
// }