
import  { useState, useEffect } from 'react';
import axios from 'axios'; // 1. Import axios
import EmployeeLeaveManagementView from './EmployeeLeaveManagementView';

export const EmployeeLeaveView = () => {


const[requests,setRequests]=useState([])
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null); // Added state to handle errors gracefully
const [showForm, setShowForm] = useState(false);
console.log(loading ,error);

   const fetchLeaves = () => {
     axios.get(`${import.meta.env.VITE_API_URL}/api/leave/my-leaves`, { withCredentials: true })
       .then(response => { setRequests(response.data); setLoading(false); })
       .catch(err => {
         console.error("Error loading users with Axios:", err);
         setError("Failed to load employee directory.");
         setLoading(false);
       });
   };




useEffect(() => {
// const token = localStorage.getItem('token');
        
      
  // 2. Use axios.get instead of fetch
    // axios.get('http://localhost:3000/api/leave/my-leaves',{
    //   withCredentials:true
    //   })
    //   .then(response => {
    //     // Axios automatically parses the response into JSON and stores it in '.data'
    //       console.log(response.data);

    //       setRequests(response.data);
    //       setLoading(false);
    //   })
    //   .catch(err => {
    //       console.error("Error loading users with Axios:", err);
    //       setError("Failed to load employee directory.");
    //       setLoading(false);
    //   });
    // }, []);
    fetchLeaves();
   }, []);






  return (
    
    <div className="bg-gray-900 w-full min-h-screen p-6 ">
      <div className="flex justify-between mb-4">
      <div className="text-white text-3xl  ">
          <h1>Employee Leave Manage</h1>
      </div>
      <div className="p-6 hover:bg-emerald-700 bg-emerald-600 text-white rounded-2xl transform transition-transform duration-150 active:scale-95 ease-in-out">
          <button onClick={() => setShowForm(true)}>Add New Leave Request</button>
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4" >
                {requests.map((user) => (
                    <div 
                        key={user._id} 
                        className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-gray-900">{user.username}</h3>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <p className='text-sm text-gray-500'>LeaveType:{user.leaveType}</p>
                                <p className='text-sm text-gray-500'>Reason:{user.reason}</p>
                                
                                <p className='text-sm text-gray-500'>No. of days:{user.days}</p>
                                <p className='text-sm text-gray-500'>Status:{user.status}</p>
                        
                          
                            </div>
                             </div>
                    </div>
                ))}
            </div>
            {showForm && (
         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
             <EmployeeLeaveManagementView
               onClose={() => setShowForm(false)}
               onSuccess={() => {
                 setShowForm(false);
                 fetchLeaves();       // refresh the list so the new request shows up immediately
               }}
             />
           </div>
         </div>
       )}
        </div>
    
        
       


  );
}
