import React from 'react';
import GeoMap from './components/GeoMap';

const App: React.FC = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '150%',
            backgroundColor: 'white',
            fontFamily: 'Arial, sans-serif',
        }}>
            <h1 style={
                {
                    textAlign: 'center',
                    color: '#333',
                    fontSize: '2rem',
                    marginBottom: '20px',
                }
            }>Geographical Data Map Component</h1>
            <GeoMap />
        </div>
    );
};

export default App;