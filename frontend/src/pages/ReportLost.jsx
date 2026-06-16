import ItemForm from "../components/ItemForm";

function ReportLost() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '4rem' }}>
            <div className="page-header lost">
                <h1>🔍 Report a Lost Item</h1>
                <p>Fill in the details and we'll broadcast it to the entire campus community.</p>
            </div>
            <div className="container" style={{ marginTop: '-3rem', position: 'relative', zIndex: 10 }}>
                <ItemForm type="lost" />
            </div>
        </div>
    );
}

export default ReportLost;