import React from 'react';
import MaterialCard from './MaterialCard';

function MaterialesList({ materiales, currentUser, userType }) {
  return (
    <div className="space-y-6">
      {materiales.map((material) => (
        <MaterialCard
          key={material.id}
          material={material}
          currentUser={currentUser}
          userType={userType}
        />
      ))}
    </div>
  );
}

export default MaterialesList;