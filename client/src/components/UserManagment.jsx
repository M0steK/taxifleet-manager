import React, {useState, useEffect} from 'react'



/* ------------------------------- Main -----------------------------*/
function UserManagment({navigateBack}) {

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editError, setEditError] = useState(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try{
            const response = await fetch('/api/users');
            if(!response.ok){
                throw new Error('Failed loading users list');
            }

            const data = await response.json()
            setUsers(data);
        }catch(err){
            setError(err.message);
        }finally{
            setIsLoading(false);
        }
    };

    useEffect(() =>{
        fetchUsers();
    }, []);

    const handleUserAdded = () => {
        fetchUsers();
        setIsFormVisible(false);
    }

    const handleEditClick = (user) => {
        setEditingUser(user);
    };

    const handleCloseModal = () =>{
        setEditingUser(null);
        setEditError(null);
    };

    const handleUpdateUser = async (userId, updateData) => {
        setIsUpdating(true);
        setEditError(false);
        try{
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData),
            });
            
            if(!response.ok){
                const data = await response.json();
                throw new Error(data.error || 'Nie udalo sie zaktualizowac użytkownika');
            }
            fetchUsers();
            handleCloseModal();
        }catch(err){
            setEditError(err.message);
        }finally{
            setIsUpdating(false);   
        }    
    };

    const handleDeleteUser = async (userId) => {
        setIsDeleting(true);
        setEditError(false);
        
        try{
            const response = await fetch(`/api/users/${userId}`,{
                method: 'DELETE',
            });

            if(!response.ok){
                throw new Error('Nie udalo sie usunąć użytkownika');
            }
            
            await fetchUsers();
            handleCloseModal();
        }
        catch(err){
            setEditError(err.message);
        }finally{
            setIsDeleting(false);
        }
    };
  

    const renderTableContent = () =>{
        if(isLoading){
            return (
                <p>Ładowanie użytkowników...</p>
            );
        }
        if(error){
            return(
                <p> Błąd {error}</p>
            );
        }
        if(users.length === 0){
            return (
                <p>Brak użytkowników do wyświetlenia</p>
            );
        }

    return users.map((user) => (
      <tr key={user.id}>
        <td className="p-3 text-center">{user.firstName}</td>
        <td className="text-center">{user.lastName}</td>
        <td className="text-center">{user.email}</td>
        <td className="text-center">{user.phoneNumber.toLocaleString()}</td>
        <td className="text-center">{user.role}</td>
        <td className="text-center">
          <button onClick={() => handleEditClick(user)} className="inline-flex items-center justify-center px-3 font-semibold rounded-sm bg-gradient-to-r from-sky-900/40 to-slate-600/40 hover:from-sky-700/70 hover:to-indigo-700/70 text-slate-300">
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
          Zarządzanie Użytkownikami
        </h1>
        <button
          onClick={navigateBack}
          className="rounded-md bg-slate-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
        >
          Powrót do Panelu Głównego
        </button>
      </header>
      <main>
        <div className="inline-flex items-center justify-center p-2 font-semibold rounded-lg bg-gradient-to-r from-sky-700/50 to-indigo-700/50 hover:from-sky-600/60 hover:to-indigo-600/60">
            <button
                onClick={() =>setIsFormVisible(true)}
                className=""
                > {'Dodaj Nowego Użytkownika'}</button>
        </div>

        
        <div className="flow-root mt-8">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-lg shadow bg-slate-800 ring-1 ring-black ring-opacity-5">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-center text-sm font-semibold text-slate-300 sm:pl-6">
                        Imię
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-300">
                        Nazwisko
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-300">
                        Email
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-300">
                        Numer Telefonu
                      </th>
                       <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-300">
                        Rola
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
        <AddUserForm
          onUserAdded={handleUserAdded}
          onCancel={() => setIsFormVisible(false)}
        />
      </div>
    </div>
  )}

  {editingUser && (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={handleCloseModal}/>
        <div className="relative z-10 w-full max-w-3xl p-4">
            <EditUserForm
                user={editingUser}
                onUpdate={handleUpdateUser}
                onDelete={handleDeleteUser}
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
function AddUserForm({ onUserAdded, onCancel }) {
  const [newData, setNewData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: '',
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
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });

      const data = await response.json();   
      if (!response.ok) {
        throw new Error(data.error || 'Error adding new user')
      }
      onUserAdded(data);
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
          <h3 className="text-lg font-semibold text-white ">Dodaj Nowego Użytkownika</h3>
          <p className="text-sm text-slate-400">Wprowadź dane użytkownika, aby dodać go do bazy danych.</p>
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
          <label htmlFor="firstName" className="block mb-1 text-sm text-slate-300">Imię</label>
          <input type="text" name="firstName" id="firstName" value={newData.firstName} onChange={handleChange} required
            className="w-full px-3 py-2 border rounded-md outline-none bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-sky-500" />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1 text-sm text-slate-300">Email</label>
          <input type="text" name="email" id="email" value={newData.email} onChange={handleChange} required
            className=" appearance-none [-moz-appearance:textfield] w-full px-3 py-2 border rounded-md outline-none bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-sky-500" />
        </div>
        <div>
          <label htmlFor="lastName" className="block mb-1 text-sm text-slate-300">Nazwisko</label>
          <input type="text" name="lastName" id="lastName" value={newData.lastName} onChange={handleChange} required
            className="w-full px-3 py-2 border rounded-md outline-none bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-sky-500" />
        </div>

        

        <div>
          <label htmlFor="phoneNumber" className="block mb-1 text-sm text-slate-300">Numer Telefonu</label>
          <input type="number" name="phoneNumber" id="phoneNumber" value={newData.phoneNumber} onChange={handleChange} required
            className="appearance-none  [-moz-appearance:textfield] w-full px-3 py-2 border rounded-md outline-none bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-sky-500" />
        </div>

        <div>
          <label htmlFor="password" className="block mb-1 text-sm text-slate-300">Hasło</label>
          <input type="password" name="password" id="password" value={newData.password} onChange={handleChange} required
            className="w-full px-3 py-2 border rounded-md outline-none bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-sky-500" />
        </div>

        <div>
          <label htmlFor="role" className="block mb-1 text-sm text-slate-300">Rola</label>
          <select name="role" id="role" value={newData.role} onChange={handleChange} required
            className="w-full px-3 py-2 border rounded-md outline-none bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-sky-500">
            <option value="admin">Admin</option>
            <option value="driver">Kierowca</option>
          </select>
        </div>

       

        <div className="flex items-center justify-end gap-3 mt-2 sm:col-span-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 transition rounded-md bg-slate-700 text-slate-200 hover:bg-slate-600">Anuluj</button>
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2 font-semibold text-white transition rounded-md shadow bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600">
            <span>{isSubmitting ? 'Dodawanie...' : 'Dodaj użytkownika'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

/* ----------------------------------------------------- Usuwanie ---------------------------------------------------------*/

function EditUserForm({user, onUpdate, onDelete, onCancel, isUpdating, isDeleting, error}){
    const [newData, setNewData] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role || 'driver',
        email: user.email || '',
        phoneNumber: user.phoneNumber,
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
        onUpdate(user.id, newData);
    };

    const handleDelete = () =>{
        if(
            window.confirm(
                `Czy na pewno chcesz usunąć ${user.firstName} ${user.lastName}?`
            )
        ){
            onDelete(user.id);
        }
    };

    return(
       <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 ring-2 ring-white/6">
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <div>
          <h3 className="text-lg font-semibold text-white ">
            Edytuj Użytkownika: {user.firstName} {user.lastName}
          </h3>
          <p className="text-sm text-slate-400">
            Zaktualizuj dane użytkownika lub usuń go z bazy danych.
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
            htmlFor="edit-firstName"
            className="block mb-1 text-sm text-slate-300"
          >
            Imię
          </label>
          <input
            type="text"
            name="firstName"
            id="edit-firstName"
            value={newData.firstName}
            onChange={handleChange}
            required
            className="w-full appearance-none rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-100 outline-none [-moz-appearance:textfield] focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label
            htmlFor="edit-lastName"
            className="block mb-1 text-sm text-slate-300"
          >
            Nazwisko
          </label>
          <input
            type="text"
            name="lastName"
            id="edit-lastName"
            value={newData.lastName}
            onChange={handleChange}
            required
            className="w-full appearance-none rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-100 outline-none [-moz-appearance:textfield] focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label
            htmlFor="edit-email"
            className="block mb-1 text-sm text-slate-300"
          >
            Email
          </label>
          <input
            type="text"
            name="email"
            id="edit-email"
            value={newData.email}
            onChange={handleChange}
            required
            className="w-full appearance-none rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-100 outline-none [-moz-appearance:textfield] focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label
            htmlFor="edit-phoneNumber"
            className="block mb-1 text-sm text-slate-300"
          >
            Numer Telefonu
          </label>
          <input
            type="number"
            name="phoneNumber"
            id="edit-phoneNumber"
            value={newData.phoneNumber}
            onChange={handleChange}
            required
            className="w-full appearance-none  [-moz-appearance:textfield]  rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label htmlFor="edit-role" className="block mb-1 text-sm text-slate-300">
            Rola
          </label>
          <select
            name="role"
            id="edit-role"
            value={newData.role}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md outline-none border-slate-600 bg-slate-700 text-slate-100 focus:ring-2 focus:ring-sky-500"
          >
            <option value="admin">Admin</option>
            <option value="driver">Kierowca</option>
          </select>
        </div>

        
        <div className="flex items-center justify-between mt-2 sm:col-span-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition bg-red-800 rounded-md shadow hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Usuwanie...' : 'Usuń Użytkownika'}
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


export default UserManagment;