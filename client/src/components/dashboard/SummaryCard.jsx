function SummaryCard({ title, value, tone = "default" }) {

    const toneStyles = {
        default: "text-ink",
        positive: "text-mint",
        negative: "text-coral"
    };

    return (

        <div className="passbook-card p-6">

            <p className="text-ink-soft text-sm font-medium tracking-wide uppercase">
                {title}
            </p>

            <h2 className={`amount text-3xl font-semibold mt-2 ${toneStyles[tone]}`}>
                {value}
            </h2>

        </div>

    );

}

export default SummaryCard;
