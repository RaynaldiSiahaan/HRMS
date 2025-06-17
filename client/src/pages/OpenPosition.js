import React from 'react';
import { useLocation } from 'react-router-dom';

const OpenPosition = () => {
  const query = new URLSearchParams(useLocation().search);
  const position = query.get('title');

  return (
    <div>
      <h2>Open Position: {position}</h2>
      <p>Details for the {position} position will be shown here.</p>
    </div>
  );
};

export default OpenPosition;
