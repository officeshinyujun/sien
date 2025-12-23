import { useExperimentStore } from "@/stores/useExperimentStore";

export function ExperimentControls() {
    const {  
        restitution, setRestitution, 
        friction, setFriction,
        launchForce, setLaunchForce,
        launchAngle, setLaunchAngle,
        posA, setPosA,
        posB, setPosB,
        triggerReset, triggerLaunch
    } = useExperimentStore();

    return (
        <div style={{ 
            background: '#f5f5f5', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            maxWidth: '800px',
            margin: '0 auto',
            color: '#333'
        }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
                Experiment Controls
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Left Column: Sphere A */}
                <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>Sphere A (Red)</h4>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Position: {posA}m</label>
                        <input type="range" min="-14" max="-2" step="0.5" value={posA} onChange={e => setPosA(parseFloat(e.target.value))} style={{ width: '100%' }} />
                    </div>
                </div>

                {/* Right Column: Sphere B */}
                <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#303f9f' }}>Sphere B (Blue)</h4>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Position: {posB}m</label>
                        <input type="range" min="2" max="14" step="0.5" value={posB} onChange={e => setPosB(parseFloat(e.target.value))} style={{ width: '100%' }} />
                    </div>
                </div>
            </div>

            {/* Global Settings */}
            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #eee', marginBottom: '20px' }}>
                 <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Environment & Launch</h4>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Restitution: {restitution}</label>
                            <input type="range" min="0" max="1" step="0.1" value={restitution} onChange={e => setRestitution(parseFloat(e.target.value))} style={{ width: '100%' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Friction: {friction}</label>
                            <input type="range" min="0" max="1" step="0.05" value={friction} onChange={e => setFriction(parseFloat(e.target.value))} style={{ width: '100%' }} />
                        </div>
                    </div>
                    <div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Launch Force: {launchForce} m/s</label>
                            <input type="range" min="5" max="60" step="1" value={launchForce} onChange={e => setLaunchForce(parseFloat(e.target.value))} style={{ width: '100%' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Launch Angle: {launchAngle}°</label>
                            <input type="range" min="-45" max="45" step="1" value={launchAngle} onChange={e => setLaunchAngle(parseFloat(e.target.value))} style={{ width: '100%' }} />
                        </div>
                    </div>
                 </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                    onClick={triggerReset}
                    style={{ flex: 1, padding: '12px', background: '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                >
                    Reset
                </button>
                <button 
                    onClick={triggerLaunch}
                    style={{ flex: 1, padding: '12px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                >
                    Launch
                </button>
            </div>
        </div>
    );
}
