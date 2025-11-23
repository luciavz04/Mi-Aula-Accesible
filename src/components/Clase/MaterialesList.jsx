import React from "react";
import MaterialCard from "./MaterialCard";

function MaterialesList({ materiales, currentUser, userType }) {
  if (!materiales || materiales.length === 0) {
    return (
      <p className="text-center text-slate-500 py-6">
        No hay materiales disponibles todavía.
      </p>
    );
  }

  return (
    <div className="space-y-8">
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
