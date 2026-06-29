// import { useDispatch, useSelector } from 'react-redux'
// import { approveRequest } from '../authSlice'

// const LeaveManagementView = () => {
//   // Access requests from the auth slice state
//   const requests = useSelector(state => state.auth.requests)
//   const dispatch = useDispatch()

//   return (
//     <div className="p-4 bg-zinc-950 min-h-screen">
//       <h2 className="text-xl font-bold mb-4 text-white">Leave Requests</h2>
      
//       {requests && requests.length > 0 ? (
//         <ul className="list-none">
//           {requests.map((request) => (
//             <li
//               className="mt-4 flex justify-between items-center bg-zinc-800 px-4 py-2 rounded"
//               key={request.id}
//             >
//               <div className="text-white font-medium">{request.username}</div>
//               <div>{request.email}</div>
//               <div>{request.reason}</div>
//               <div>{request.days}</div>
//               <div>{request.role}</div>
//               <div>{request.leaveType}</div>

//                <button
//                 onClick={() => dispatch(approveRequest(request.id))}
//                 className="text-white bg-red-600 border-0 py-1 px-4 focus:outline-none hover:bg-emerald-700 rounded text-md font-semibold transition-colors"
//               >
//                 Reject
//               </button>
//               <button
//                 onClick={() => dispatch(approveRequest(request.id))}
//                 className="text-white bg-emerald-600 border-0 py-1 px-4 focus:outline-none hover:bg-emerald-700 rounded text-md font-semibold transition-colors"
//               >
//                 Approve
//               </button>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p className="text-zinc-400 italic">No pending leave requests.</p>
//       )}
//     </div>
//   )
// }

// export default LeaveManagementView










import  { useState, useEffect } from 'react';
import axios from 'axios'; // 1. Import axios

export default function LeaveManagementView() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Added state to handle errors gracefully
    useEffect(() => {
        // const token = localStorage.getItem('token');
        
      
        // 2. Use axios.get instead of fetch
        axios.get('http://localhost:3000/api/leave/all',{
            withCredentials:true
            })
            .then(response => {
                // Axios automatically parses the response into JSON and stores it in '.data'
                console.log(response.data);

                setUsers(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading users with Axios:", err);
                setError("Failed to load employee directory.");
                setLoading(false);
            });
    }, []);
    
        // const [status, setStatus] = useState(users.status);
        const [status, setStatus] = useState(users[0]?.status);

    const handleUpdateStatus = async (userid,nextStatus) => {
        setLoading(true);
        try {
            // const nextStatus = status === 'Pending' ? 'Approved' : 'Pending';
            console.log(status)
            
            
            // Making the API call to the backend
            const response = await axios.patch(`http://localhost:3000/api/leave/${userid}/status`, 
                {
                status: nextStatus
            },
            { withCredentials: true }
        );

            if (response.status === 200) {
                // Update local state if DB update is successful
                setStatus(nextStatus);
                alert("Status updated successfully!");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user.");
        } finally {
            setLoading(false);
        }
    };

    // const handleUpdateStatuss = async (userid,nextStatus) => {
    //     setLoading(true);
    //     try {
    //         // const nextStatus = status === 'Pending' ? 'Approved' : 'Pending';
            
            
    //         // Making the API call to the backend
    //         const response = await axios.patch(`http://localhost:3000/api/leave/${userid}/update-status`, {
    //             newStatus: nextStatus
    //         });

    //         if (response.status === 200) {
    //             // Update local state if DB update is successful
    //             setStatus(nextStatus);
    //             alert("Status updated successfully!");
    //         }
    //     } catch (error) {
    //         console.error("Error updating user:", error);
    //         alert("Failed to update user.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    if (loading) return <div className="text-center p-10 text-gray-500">Loading employees...</div>;
    if (error) return <div className="text-center p-10 text-red-500 font-medium">{error}</div>;

    return (
        <div className="max-w-full bg-gray-950 mx-auto p-6 min-h-screen">
            <h2 className="text-2xl font-bold text-white mb-6 border-b pb-2">
                Employee Directory
            </h2>
            
            {/* Grid layout using Tailwind */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                    <div 
                        key={user._id} 
                        className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-gray-900">{user.username}</h3>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <p className='text-sm text-gray-500'>LeaveType:{user.leaveType}</p>
                                <p className='text-sm text-gray-500'>Reason:{user.reason}</p>
                                
                                <p className='text-sm text-gray-500'>No. of days:{user.days}</p>
                                <p className='text-sm text-gray-500'>Status:{user.status}</p>
                        {user.status === 'Pending' && (
                            <div className='p-6'>
                            <div onClick={() => handleUpdateStatus(user._id, 'Approved')}  className='bg-green-500 hover:bg-green-700 text-white p-6 rounded-2xl max-w-2xl m-2 transform transition-transform duration-150 active:scale-95 ease-in-out'>
                            <button>Approve</button>

                            </div>
                                 <div onClick={() => handleUpdateStatus(user._id, 'Rejected')} className='bg-red-500 hover:bg-red-700 text-white p-6 rounded-2xl max-w-2xl m-2 transform transition-transform duration-150 active:scale-95 ease-in-out'>
                                <button>Reject</button>
                            </div>
                            </div>
                            )}
                            {user.status === 'Approved' && (
                            
                            <div  className='bg-green-400 text-white p-6 rounded-2xl max-w-2xl m-2 '>
                            <button>Approved</button>
                            </div>
                            )}
                            {user.status === 'Rejected' && (
                            
                            <div  className='bg-red-400 text-white p-6 rounded-2xl max-w-2xl m-2 '>
                            <button>Approved</button>
                            </div>
                            )}
                            </div>
                            
                            {/* Role badge */}
                            {/* <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                user.role === 'Admin' ? 'bg-red-50 text-red-700 border border-red-200' :
                                user.role === 'HR_Manager' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                'bg-green-50 text-green-700 border border-green-200'
                            }`}>
                                {user.role}
                            </span> */}
                            
                           
                            
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}