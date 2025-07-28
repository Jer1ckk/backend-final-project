// 🧪 API Test Page - Verify Backend Connection
// File: frontend/src/components/ApiTest.jsx

import React, { useState, useEffect } from 'react';
import { productFilters } from '../services/productApi';

const ApiTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const tests = [
    {
      name: 'All Products',
      key: 'allProducts',
      test: () => productFilters.all({ limit: 5 })
    },
    {
      name: 'Women Products',
      key: 'womenProducts', 
      test: () => productFilters.women.all({ limit: 3 })
    },
    {
      name: 'Men Products',
      key: 'menProducts',
      test: () => productFilters.men.all({ limit: 3 })
    },
    {
      name: 'Featured Products',
      key: 'featuredProducts',
      test: () => productFilters.all({ featured: true, limit: 3 })
    },
    {
      name: 'Sale Products',
      key: 'saleProducts',
      test: () => productFilters.all({ onSale: true, limit: 3 })
    }
  ];

  const runTest = async (test) => {
    setLoading(true);
    try {
      console.log(`🧪 Running test: ${test.name}`);
      const result = await test.test();
      console.log(`✅ ${test.name} result:`, result);
      
      setResults(prev => ({
        ...prev,
        [test.key]: result
      }));
      
      setErrors(prev => ({
        ...prev,
        [test.key]: null
      }));
    } catch (error) {
      console.error(`❌ ${test.name} failed:`, error);
      setErrors(prev => ({
        ...prev,
        [test.key]: error.message
      }));
    }
    setLoading(false);
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults({});
    setErrors({});
    
    for (const test of tests) {
      await runTest(test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setLoading(false);
  };

  useEffect(() => {
    // Auto-run tests on component mount
    const initialTests = [
      {
        name: 'All Products',
        key: 'allProducts',
        test: () => productFilters.all({ limit: 5 })
      },
      {
        name: 'Women Products',
        key: 'womenProducts', 
        test: () => productFilters.women.all({ limit: 3 })
      },
      {
        name: 'Featured Products',
        key: 'featuredProducts',
        test: () => productFilters.all({ featured: true, limit: 3 })
      }
    ];

    const runInitialTests = async () => {
      setLoading(true);
      setResults({});
      setErrors({});
      
      for (const test of initialTests) {
        try {
          const result = await test.test();
          setResults(prev => ({ ...prev, [test.key]: result }));
          setErrors(prev => ({ ...prev, [test.key]: null }));
        } catch (error) {
          setErrors(prev => ({ ...prev, [test.key]: error.message }));
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setLoading(false);
    };

    runInitialTests();
  }, []);

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>🧪 API Connection Test</h1>
        <p>Testing backend API endpoints to verify database connection.</p>
        
        <button 
          onClick={runAllTests}
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '🔄 Running Tests...' : '🚀 Run All Tests'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {tests.map((test) => (
          <div 
            key={test.key}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: errors[test.key] ? '#fff5f5' : results[test.key] ? '#f0fff4' : '#f8f9fa'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <h3 style={{ margin: 0 }}>
                {errors[test.key] ? '❌' : results[test.key] ? '✅' : '⏳'} {test.name}
              </h3>
              <button
                onClick={() => runTest(test)}
                disabled={loading}
                style={{
                  padding: '5px 10px',
                  fontSize: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Retest
              </button>
            </div>

            {errors[test.key] && (
              <div style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '10px'
              }}>
                <strong>Error:</strong> {errors[test.key]}
              </div>
            )}

            {results[test.key] && (
              <div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Status:</strong> ✅ Success<br/>
                  <strong>Products Found:</strong> {results[test.key].products?.length || 0}<br/>
                  <strong>Total Count:</strong> {results[test.key].pagination?.total || 'N/A'}
                </div>
                
                {results[test.key].products?.length > 0 && (
                  <div>
                    <h4>Sample Products:</h4>
                    <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                      {results[test.key].products.slice(0, 3).map((product, idx) => (
                        <div key={idx} style={{
                          backgroundColor: '#e9ecef',
                          padding: '8px',
                          marginBottom: '5px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          <strong>{product.name}</strong><br/>
                          Price: ${product.price} | SKU: {product.sku}<br/>
                          Category: {product.category?.name || 'N/A'} | Stock: {product.stock}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <details style={{ marginTop: '10px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    📋 View Full Response
                  </summary>
                  <pre style={{
                    backgroundColor: '#f8f9fa',
                    padding: '10px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '300px',
                    fontSize: '11px',
                    marginTop: '10px'
                  }}>
                    {formatJson(results[test.key])}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#d1ecf1',
        borderRadius: '8px'
      }}>
        <h3>🔧 Backend Instructions</h3>
        <p>If tests are failing, make sure your backend is running:</p>
        <ol>
          <li><code>cd backend</code></li>
          <li><code>npm run seed</code> (to populate database)</li>
          <li><code>npm run dev</code> (to start server on port 3001)</li>
        </ol>
        <p><strong>Expected Backend URL:</strong> http://localhost:3001</p>
      </div>
    </div>
  );
};

export default ApiTest;
