import React from 'react'

function VehicleManagment({navigateBack}) {
    return(
   <div className="p-4 mx-auto max-w-7xl sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
          Zarządzanie Flotą Pojazdów
        </h1>
        <button
          onClick={navigateBack} 
          className="rounded-md bg-slate-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
        >
          Powrót do Panelu Głównego
        </button>
      </header>
      <main>
        <p className="text-slate-400">
          Tutaj wkrótce pojawi się tabela z pojazdami...
        </p>
      </main>
    </div>
    );
}

export default VehicleManagment;