import React from 'react';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="container">
      <div className="box">
        <h1>Browlette</h1>
        <div className="buttons">
          <button>Host</button>
          <button>Join</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
