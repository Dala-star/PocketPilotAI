function AIInsights({ data }) {

    if (!data) return null;

    const {
        totalIncome,
        totalExpenses,
        categoryData
    } = data;

    const balance = totalIncome - totalExpenses;

    const savingsRate =
        totalIncome > 0
            ? ((balance / totalIncome) * 100).toFixed(1)
            : 0;

    const topCategory =
        categoryData.length > 0
            ? [...categoryData].sort(
                  (a, b) => b.amount - a.amount
              )[0]
            : null;

    const insights = [];

    if (balance > 0) {
        insights.push(
            `✅ Great job! You have saved £${balance.toFixed(2)}.`
        );
    } else if (balance < 0) {
        insights.push(
            `⚠️ You have spent £${Math.abs(balance).toFixed(2)} more than your income.`
        );
    }

    insights.push(
        `💰 You have saved ${savingsRate}% of your income.`
    );

    if (topCategory) {
        insights.push(
            `📊 Your biggest expense category is "${topCategory.name}" (£${topCategory.amount.toFixed(2)}).`
        );
    }

    return (
        <div className="passbook-card p-6">
            <h2 className="text-xl font-bold mb-4">
                🤖 AI Financial Insights
            </h2>

            <div className="space-y-3">
                {insights.map((item, index) => (
                    <div
                        key={index}
                        className="bg-mint-soft rounded-lg p-3"
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AIInsights;
