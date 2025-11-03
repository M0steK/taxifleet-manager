import React, {useState, useEffect} from 'react'



/* ------------------------------- Main -----------------------------*/
function VehicleManagment({navigateBack}) {

    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);

    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editError, setEditError] = useState(null);

    const fetchVehicles = async () => {
        setIsLoading(true);
        setError(null);
        try{
            const response = await fetch('/api/vehicles');
            if(!response.ok){
                throw new Error('Failed loading vehicles list');
            }

            const data = await response.json()
            setVehicles(data);
        }catch(err){
            setError(err.message);
        }finally{
            setIsLoading(false);
        }
    };

    useEffect(() =>{
        fetchVehicles();
    }, []);

    const handleVehicleAdded = () => {
        fetchVehicles();
        setIsFormVisible(false);
    }

    const handleEditClick = (vehicle) => {
        setEditingVehicle(vehicle);
    };

    const handleCloseModal = () =>{
        setEditingVehicle(null);
        setEditError(null);
    };

    const handleUpdateVehicle = async (vehicleId, updateData) => {
        setIsUpdating(true);
        setEditError(false);
        try{
            const response = await fetch(`/api/vehicles/${vehicleId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData),
            });
            
            if(!response.ok){
                const data = await response.json();
                throw new Error(data.error || 'Nie udalo sie zaktualizowac pojazdu');
            }
            fetchVehicles();
            handleCloseModal();
        }catch(err){
            setEditError(err.message);
        }finally{
            setIsUpdating(false);   
        }    
    };

    const handleDeleteVehicle = async (vehicleId) => {
        setIsDeleting(true);
        setEditError(false);
        
        try{
            const response = await fetch(`/api/vehicles/${vehicleId}`,{
                method: 'DELETE',
            });

            if(!response.ok){
                throw new Error('Nie udalo sie usunąć pojazdu');
            }
            
            await fetchVehicles();
            handleCloseModal();
        }
        catch(err){
            setEditError(err.message);
        }finally{
            setIsDeleting(false);
        }
    };


    const getDateWarningClass = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const daysUntil = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 7) return 'bg-red-500/20';
    if (daysUntil <= 30) return 'bg-yellow-500/20';
    return '';
  };

  const getRowWarningClass = (vehicle) => {
    if (getDateWarningClass(vehicle.insuranceExpiry) === 'bg-red-500/20' ||
        getDateWarningClass(vehicle.nextInspectionDate) === 'bg-red-500/20') {
      return 'bg-red-500/20';
    }
    if (getDateWarningClass(vehicle.insuranceExpiry) === 'bg-yellow-500/20' ||
        getDateWarningClass(vehicle.nextInspectionDate) === 'bg-yellow-500/20') {
      return 'bg-yellow-500/20';
    }
    return '';
  };  
    const formatDate = (dateInput) => {
    if (!dateInput) return '-';
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (!(d instanceof Date) || isNaN(d)) return String(dateInput);
    return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
        return 'text-red-600';
      case 'in_service':
        return 'text-yellow-400';
      default:
        return '';
    }
  };

  const formatStatus = (status) => {
    if (!status) return '-';
    return status
      .toString()
      .replace(/_/g, ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  

    const renderTableContent = () =>{
        if(isLoading){
            return (
                <p>Ładowanie pojazdów...</p>
            );
        }
        if(error){
            return(
                <p> Błąd {error}</p>
            );
        }
        if(vehicles.length === 0){
            return (
                <p>Brak pojazdów do wyświetlenia</p>
            );
        }

    return vehicles.map((vehicle) => (
      <tr key={vehicle.id} className={getRowWarningClass(vehicle)}>
        <td className="p-3 text-center">{vehicle.brand}</td>
        <td className="text-center">{vehicle.model}</td>
        <td className="text-center">{vehicle.licensePlate}</td>
        <td className="text-center">{vehicle.productionYear}</td>
        <td className={`text-center ${getStatusClass(vehicle?.status)}`}>
        {formatStatus(vehicle.status)}
        </td>
        <td className="text-center">{vehicle.mileage.toLocaleString()} km</td>
        <td className="text-center">{vehicle.vin}</td>
        <td className="text-center">
          {formatDate(vehicle.insuranceExpiry)}
        </td>
        <td className="text-center">
          {formatDate(vehicle.nextInspectionDate)}
        </td>
        <td className="text-center">
          <button onClick={() => handleEditClick(vehicle)} className="inline-flex items-center justify-center px-3 font-semibold rounded-sm bg-gradient-to-r from-sky-900/40 to-slate-600/40 hover:from-sky-700/70 hover:to-indigo-700/70 text-slate-300">
            Edytuj
          </button>
        </td>
      </tr>
    ));
    };


    return(
        <>
  <div className="w-full min-h-screen pt-4 bg-gradient-to-br from-slate-900 to-slate-800">
    <div className="items-center justify-center mx-auto max-w-7xl">
      <header className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
          Zarządzanie Flotą Pojazdów
        </h1>
        <button
          onClick={navigateBack}
          className="rounded-md bg-slate-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
        >
          Powrót do Panelu Głównego
        </button>
      </header>
      <main>
        <div className="inline-flex items-center justify-center p-2 font-semibold rounded-lg bg-gradient-to-r from-sky-700 to-indigo-700 hover:from-sky-600 hover:to-indigo-600">
            <button
                onClick={() =>setIsFormVisible(true)}
                className=""
                > {'Dodaj Nowy Pojazd'}</button>
        </div>

        
        <div className="flow-root mt-8">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-lg shadow bg-slate-800 ring-1 ring-black ring-opacity-5">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-center text-sm font-semibold text-slate-300 sm:pl-6">
                        Marka
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-300">
                        Model
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-300">
                        Rejestracja
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-300">
                        Rok
                      </th>
                       <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-300">
                        Status
                      </th>
                       <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-300">
                        Przebieg
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-300">
                        VIN
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-300">
                        Termin ubezpieczenia
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-300">
                        Termin przeglądu
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-300">
                        <span className="px-3 py-3.5 font-semibold text-slate-300">Akcje</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 bg-slate-800">
                    {renderTableContent()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>

  {isFormVisible && (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setIsFormVisible(false)}
      />
      <div className="relative z-10 w-full max-w-3xl p-4">
        <AddVehicleForm
          onVehicleAdded={handleVehicleAdded}
          onCancel={() => setIsFormVisible(false)}
        />
      </div>
    </div>
  )}

  {editingVehicle && (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={handleCloseModal}/>
        <div className="relative z-10 w-full max-w-3xl p-4">
            <EditVehicleForm
                vehicle={editingVehicle}
                onUpdate={handleUpdateVehicle}
                onDelete={handleDeleteVehicle}
                onCancel={handleCloseModal}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
                error={editError}/>
        </div>
    </div>
  )}
        </>
    );
}

/* ------------------------------------------------------------ Dodawanie ---------------------------------------- */
function AddVehicleForm({ onVehicleAdded, onCancel }) {
  const [newData, setNewData] = useState({
    brand: '',
    model: '',
    productionYear: '',
    licensePlate: '',
    vin: '',
    mileage: '',
    status: 'active',
    insuranceExpiry: '',
    nextInspectionDate: ''
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newData,
          productionYear: parseInt(newData.productionYear, 10),
          mileage: parseInt(newData.mileage, 10),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error adding new car')
      }
      onVehicleAdded(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl ring-2 ring-white/6">
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <div>
          <h3 className="text-lg font-semibold text-white ">Dodaj nowy pojazd</h3>
          <p className="text-sm text-slate-400">Wprowadź dane pojazdu, aby dodać go do floty.</p>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        {error && (
          <div className="p-3 text-red-200 rounded sm:col-span-2 bg-red-600/20">{error}</div>
        )}

        <div>
          <label htmlFor="brand" className="block mb-1 text-sm text-slate-300">Marka</label>
          <input type="text" name="brand" id="brand" value={newData.brand} onChange={handleChange} required
            className="w-full px-3 py-2 border rounded-md outline-none bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-sky-500" />
        </div>

        <div>
          <label htmlFor="model" className="block mb-1 text-sm text-slate-300">Model</label>
          <input type="text" name="model" id="model" value={newData.model} onChange={handleChange} required
            className="w-full px-3 py-2 border rounded-md outline-none bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-sky-500" />
        </div>

        <div>
          <label htmlFor="productionYear" className="block mb-1 text-sm text-slate-300">Rok produkcji</label>
          <input type="number" name="productionYear" id="productionYear" value={newData.productionYear} onChange={handleChange} required
            className=" appearance-none [-moz-appearance:textfield] w-full px-3 py-2 border rounded-md outline-none bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-sky-500" />
        </div>

        <div>
          <label htmlFor="licensePlate" className="block mb-1 text-sm text-slate-300">Numer rejestracyjny</label>
          <input type="text" name="licensePlate" id="licensePlate" value={newData.licensePlate} onChange={handleChange} required
            className="w-full px-3 py-2 border rounded-md outline-none bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-sky-500" />
        </div>

        <div>
          <label htmlFor="vin" className="block mb-1 text-sm text-slate-300">VIN</label>
          <input type="text" name="vin" id="vin" value={newData.vin} onChange={handleChange} required
            className="w-full px-3 py-2 border rounded-md outline-none bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-sky-500" />
        </div>

        <div>
          <label htmlFor="mileage" className="block mb-1 text-sm text-slate-300">Przebieg (km)</label>
          <input type="number" name="mileage" id="mileage" value={newData.mileage} onChange={handleChange} required
            className="appearance-none [-moz-appearance:textfield] w-full px-3 py-2 border rounded-md outline-none bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-sky-500" />
        </div>

        <div>
          <label htmlFor="status" className="block mb-1 text-sm text-slate-300">Status</label>
          <select name="status" id="status" value={newData.status} onChange={handleChange} required
            className="w-full px-3 py-2 border rounded-md outline-none bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-sky-500">
            <option value="active">Aktywny</option>
            <option value="inactive">Nieaktywny</option>
            <option value="in_service">W serwisie</option>
          </select>
        </div>

        <div>
          <div className="relative">
            <label 
              htmlFor="insuranceExpiry" 
              className="block mb-1 text-sm cursor-pointer select-none text-slate-300"
              onClick={() => document.getElementById('insuranceExpiry').showPicker()}
            >
              Termin ubezpieczenia
            </label>
            <div className="relative" onClick={() => document.getElementById('insuranceExpiry').showPicker()}>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={newData.insuranceExpiry ? formatDateForDisplay(newData.insuranceExpiry) : ''}
                  className="w-full px-3 py-2 border border-r-0 outline-none cursor-pointer select-none rounded-l-md bg-slate-700 border-slate-600 text-slate-100"
                  placeholder="dd/mm/rrrr"
                />
                <div className="flex items-center px-3 py-2 border border-l-0 cursor-pointer select-none rounded-r-md bg-slate-700 border-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
              </div>
              <input
                type="date"
                name="insuranceExpiry"
                id="insuranceExpiry"
                value={newData.insuranceExpiry}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="relative">
            <label 
              htmlFor="nextInspectionDate" 
              className="block mb-1 text-sm cursor-pointer select-none text-slate-300"
              onClick={() => document.getElementById('nextInspectionDate').showPicker()}
            >
              Termin przeglądu
            </label>
            <div className="relative" onClick={() => document.getElementById('nextInspectionDate').showPicker()}>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={newData.nextInspectionDate ? formatDateForDisplay(newData.nextInspectionDate) : ''}
                  className="w-full px-3 py-2 border border-r-0 outline-none cursor-pointer select-none rounded-l-md bg-slate-700 border-slate-600 text-slate-100"
                  placeholder="dd/mm/rrrr"
                />
                <div className="flex items-center px-3 py-2 border border-l-0 cursor-pointer select-none rounded-r-md bg-slate-700 border-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
              </div>
              <input
                type="date"
                name="nextInspectionDate"
                id="nextInspectionDate"
                value={newData.nextInspectionDate}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-2 sm:col-span-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 transition rounded-md bg-slate-700 text-slate-200 hover:bg-slate-600">Anuluj</button>
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2 font-semibold text-white transition rounded-md shadow bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600">
            <span>{isSubmitting ? 'Dodawanie...' : 'Dodaj pojazd'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (err) {
    return(err.message);
  }
};

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; 
  } catch (err) {
    return(err.message);
  }
};

/* ----------------------------------------------------- Usuwanie ---------------------------------------------------------*/

function EditVehicleForm({vehicle, onUpdate, onDelete, onCancel, isUpdating, isDeleting, error}){
    const [newData, setNewData] = useState({
        mileage: vehicle.mileage || '',
        status: vehicle.status || 'active',
        nextInspectionDate: formatDateForInput(vehicle.nextInspectionDate),
        insuranceExpiry: formatDateForInput(vehicle.insuranceExpiry),
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewData((prev)=>({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(vehicle.id, {
            ...newData,
            mileage: parseInt(newData.mileage, 10),
        });
    };

    const handleDelete = () =>{
        if(
            window.confirm(
                `Czy na pewno chcesz usunąć ${vehicle.brand} ${vehicle.model}?`
            )
        ){
            onDelete(vehicle.id);
        }
    };

    return(
       <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 ring-2 ring-white/6">
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <div>
          <h3 className="text-lg font-semibold text-white ">
            Edytuj Pojazd: {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-sm text-slate-400">
            Zaktualizuj dane pojazdu lub usuń go z floty.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 text-slate-200 hover:bg-slate-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2"
      >
        {error && (
          <div className="p-3 text-red-200 rounded bg-red-600/20 sm:col-span-2">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="edit-mileage"
            className="block mb-1 text-sm text-slate-300"
          >
            Przebieg (km)
          </label>
          <input
            type="number"
            name="mileage"
            id="edit-mileage"
            value={newData.mileage}
            onChange={handleChange}
            required
            className="w-full appearance-none rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-100 outline-none [-moz-appearance:textfield] focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label htmlFor="edit-status" className="block mb-1 text-sm text-slate-300">
            Status
          </label>
          <select
            name="status"
            id="edit-status"
            value={newData.status}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md outline-none border-slate-600 bg-slate-700 text-slate-100 focus:ring-2 focus:ring-sky-500"
          >
            <option value="active">Aktywny</option>
            <option value="inactive">Nieaktywny</option>
            <option value="in_service">W serwisie</option>
          </select>
        </div>

        <div>
          <div className="relative">
            <label
              htmlFor="edit-insuranceExpiry"
              className="block mb-1 text-sm cursor-pointer select-none text-slate-300"
              onClick={() => document.getElementById('edit-insuranceExpiry').showPicker()}
            >
              Termin ubezpieczenia
            </label>
            <div className="relative" onClick={() => document.getElementById('edit-insuranceExpiry').showPicker()}>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={newData.insuranceExpiry ? formatDateForDisplay(newData.insuranceExpiry) : ''}
                  className="w-full px-3 py-2 border border-r-0 outline-none cursor-pointer select-none rounded-l-md border-slate-600 bg-slate-700 text-slate-100"
                  placeholder="dd/mm/rrrr"
                />
                <div className="flex items-center px-3 py-2 border border-l-0 cursor-pointer select-none rounded-r-md border-slate-600 bg-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
              </div>
              <input
                type="date"
                name="insuranceExpiry"
                id="edit-insuranceExpiry"
                value={newData.insuranceExpiry}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="relative">
            <label
              htmlFor="edit-nextInspectionDate"
              className="block mb-1 text-sm cursor-pointer select-none text-slate-300"
              onClick={() => document.getElementById('edit-nextInspectionDate').showPicker()}
            >
              Termin przeglądu
            </label>
            <div className="relative" onClick={() => document.getElementById('edit-nextInspectionDate').showPicker()}>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={newData.nextInspectionDate ? formatDateForDisplay(newData.nextInspectionDate) : ''}
                  className="w-full px-3 py-2 border border-r-0 outline-none cursor-pointer select-none rounded-l-md border-slate-600 bg-slate-700 text-slate-100"
                  placeholder="dd/mm/rrrr"
                />
                <div className="flex items-center px-3 py-2 border border-l-0 cursor-pointer select-none rounded-r-md border-slate-600 bg-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
              </div>
              <input
                type="date"
                name="nextInspectionDate"
                id="edit-nextInspectionDate"
                value={newData.nextInspectionDate}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 sm:col-span-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition bg-red-800 rounded-md shadow hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Usuwanie...' : 'Usuń Pojazd'}
          </button>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 transition rounded-md bg-slate-700 text-slate-200 hover:bg-slate-600"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isUpdating || isDeleting}
              className="inline-flex items-center gap-2 px-5 py-2 font-semibold text-white transition rounded-md shadow bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 disabled:opacity-50"
            >
              <span>
                {isUpdating ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
    );

    
}


export default VehicleManagment;