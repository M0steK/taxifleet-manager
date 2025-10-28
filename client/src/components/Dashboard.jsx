import React, {useState, useEffect} from 'react';

function Dashboard({user, onLogout,navigateTo}){

  const [schedules, setSchedules] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchSchedules = async () => {
      try{
        const response = await fetch('/api/schedules');
        if(!response.ok){
          throw error('Błąd podczas pobierania grafików');
        }

        const data = await response.json();

        setSchedules(data);
      }catch(err){
        setError(err.message);
      }finally{
        setLoading(false);
      }
    };

  fetchSchedules();
}, [] );

if(loading){
  return <p>Ładowanie grafiku...</p>
}

if(error){
  return <p> Błąd: {error}</p>
}


const handleManageFleetClick = () => {
  navigateTo('vehicleManagment');
};

return (
  <div>
    <header>
      <h1>Panel Główny</h1>
      <p>Witaj, {user?.firstName}!</p>
      {user?.role === 'admin' && (
      <div>
        <p>ADMINNNNNNNNNNNNNN</p> 
        <button onClick={handleManageFleetClick}>Fleet Managment</button>
      </div>)}
        <button onClick={onLogout}>Wyloguj</button>
      
    </header>

    <main>
      <h2>Aktualny grafik</h2>
      {schedules.length === 0 ? (
        <p> Brak zaplanowanych zmian </p>
      ) : (
        <ul>
          {schedules.map((schedule)=>(
            <li key={schedule.id}>
              {schedule.user.firstName} {schedule.user.lastName} pojazd: {schedule.vehicle.brand} {schedule.vehicle.model}
              ({new Date(schedule.startTime).toLocaleString()})
            </li>
          ))}
        </ul>
      )}
    </main>
  </div>
  );
}

export default Dashboard;