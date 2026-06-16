import ItemForm from "../components/ItemForm";

function ReportFound() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '4rem' }}>
            <div className="page-header found">
                <h1>📦 Report a Found Item</h1>
                <p>Help reunite someone with their belongings. Every report counts!</p>
            </div>
            <div className="container" style={{ marginTop: '-3rem', position: 'relative', zIndex: 10 }}>
                <ItemForm type="found" />
            </div>
        </div>
    );
}

export default ReportFound;