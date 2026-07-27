function ProgressBar({ value }) {

    return (

        <div className="w-full bg-gray-200 rounded-full h-3">

            <div
                className="bg-emerald-500 h-3 rounded-full"
                style={{
                    width: `${Math.min(value,100)}%`
                }}
            />

        </div>

    );

}

export default ProgressBar;