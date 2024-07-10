import React from 'react'

function AgreePop(props) {
    return (props.trigger) ? (
        <div className='fixed top-0 left-0 w-full h-full bg-slate-200 bg-opacity-60 flex justify-center items-center'>
            <div className="relative w-1/2 bg-white flex flex-col rounded-xl shadow-lg">
                <div className="h-auto w-full p-2 flex justify-end">
                    <button className="text-xl p-2 border-2 border-white hover:border-blue-200 hover:shadow-md rounded-md">&#x2715;</button>
                </div>
                <div className="p-2">
                    {props.children}
                </div>
            </div>
        </div>
    ) : "";
}

export default AgreePop