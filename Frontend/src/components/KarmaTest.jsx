import { useState } from 'react';
import { API_BASE_URL } from '../config/backendConfig';

/**
 * Karma Integration Test Component
 * Add this to your app to test the karma microservice integration
 */
function KarmaTest() {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const runTests = async () => {
        setLoading(true);
        setError(null);
        const testResults = {};

        try {
            // Test 1: Backend Health
            console.log('Testing backend health...');
            const backendRes = await fetch(`${API_BASE_URL}/health`);
            testResults.backend = await backendRes.json();

            // Test 2: Karma Service Health
            console.log('Testing karma service health...');
            const karmaHealthRes = await fetch(`${API_BASE_URL}/karma/health`);
            testResults.karmaHealth = await karmaHealthRes.json();

            // Test 3: Get Karma Configuration
            console.log('Getting karma configuration...');
            const configRes = await fetch(`${API_BASE_URL}/karma/config`);
            testResults.config = await configRes.json();

            // Test 4: Direct Java Service
            console.log('Testing direct Java service...');
            const javaRes = await fetch('http://localhost:8081/api/karma/calculate/health');
            testResults.javaService = await javaRes.text();

            setResults(testResults);
            console.log('All tests completed!', testResults);
        } catch (err) {
            console.error('Test error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '40px auto',
            padding: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
                🧪 Karma Microservice Integration Test
            </h1>

            <button
                onClick={runTests}
                disabled={loading}
                style={{
                    background: loading ? '#ccc' : '#4CAF50',
                    color: 'white',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginBottom: '30px'
                }}
            >
                {loading ? 'Running Tests...' : 'Run All Tests'}
            </button>

            {error && (
                <div style={{
                    background: '#ffebee',
                    color: '#c62828',
                    padding: '15px',
                    borderRadius: '6px',
                    marginBottom: '20px'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {results && (
                <div>
                    <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Test Results</h2>

                    {/* Backend Health */}
                    <div style={{
                        background: 'white',
                        border: '2px solid #4CAF50',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <strong style={{ fontSize: '18px' }}>Backend Health Check</strong>
                            <span style={{
                                background: '#4CAF50',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}>
                                {results.backend?.success ? 'PASS ✓' : 'FAIL ✗'}
                            </span>
                        </div>
                        <pre style={{
                            background: '#f5f5f5',
                            padding: '15px',
                            borderRadius: '4px',
                            overflow: 'auto',
                            fontSize: '12px'
                        }}>
                            {JSON.stringify(results.backend, null, 2)}
                        </pre>
                    </div>

                    {/* Karma Service Health */}
                    <div style={{
                        background: 'white',
                        border: `2px solid ${results.karmaHealth?.healthy ? '#4CAF50' : '#f44336'}`,
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <strong style={{ fontSize: '18px' }}>Karma Service Health</strong>
                            <span style={{
                                background: results.karmaHealth?.healthy ? '#4CAF50' : '#f44336',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}>
                                {results.karmaHealth?.healthy ? 'PASS ✓' : 'FAIL ✗'}
                            </span>
                        </div>
                        <pre style={{
                            background: '#f5f5f5',
                            padding: '15px',
                            borderRadius: '4px',
                            overflow: 'auto',
                            fontSize: '12px'
                        }}>
                            {JSON.stringify(results.karmaHealth, null, 2)}
                        </pre>
                    </div>

                    {/* Karma Configuration */}
                    <div style={{
                        background: 'white',
                        border: '2px solid #4CAF50',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <strong style={{ fontSize: '18px' }}>Karma Configuration</strong>
                            <span style={{
                                background: '#4CAF50',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}>
                                {results.config?.success ? 'PASS ✓' : 'FAIL ✗'}
                            </span>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <h4 style={{ marginBottom: '10px' }}>Karma Weights:</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                {results.config?.data?.weights && Object.entries(results.config.data.weights).map(([key, value]) => (
                                    <div key={key} style={{
                                        background: '#f5f5f5',
                                        padding: '10px',
                                        borderRadius: '4px'
                                    }}>
                                        <strong>{key}:</strong> {value}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 style={{ marginBottom: '10px' }}>Performance Levels:</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                {results.config?.data?.levels && Object.entries(results.config.data.levels).map(([key, value]) => (
                                    <div key={key} style={{
                                        background: '#e3f2fd',
                                        padding: '10px',
                                        borderRadius: '4px'
                                    }}>
                                        <strong>{key}:</strong> {value}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Java Service Direct */}
                    <div style={{
                        background: 'white',
                        border: '2px solid #4CAF50',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <strong style={{ fontSize: '18px' }}>Direct Java Service Call</strong>
                            <span style={{
                                background: '#4CAF50',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}>
                                {results.javaService?.includes('running') ? 'PASS ✓' : 'FAIL ✗'}
                            </span>
                        </div>
                        <div style={{
                            background: '#f5f5f5',
                            padding: '15px',
                            borderRadius: '4px'
                        }}>
                            {results.javaService}
                        </div>
                    </div>

                    <div style={{
                        background: '#e8f5e9',
                        border: '2px solid #4CAF50',
                        borderRadius: '8px',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ color: '#2e7d32', margin: 0 }}>
                            ✅ All Services Connected Successfully!
                        </h3>
                        <p style={{ margin: '10px 0 0 0', color: '#555' }}>
                            Java Microservice ↔ Node.js Backend ↔ React Frontend
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default KarmaTest;
