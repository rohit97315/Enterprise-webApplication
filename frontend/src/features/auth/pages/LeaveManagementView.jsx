import { useDispatch, useSelector } from 'react-redux'
import { approveRequest } from '../authSlice'

const LeaveManagementView = () => {
  // Access requests from the auth slice state
  const requests = useSelector(state => state.auth.requests)
  const dispatch = useDispatch()

  return (
    <div className="p-4 bg-zinc-950 min-h-screen">
      <h2 className="text-xl font-bold mb-4 text-white">Leave Requests</h2>
      
      {requests && requests.length > 0 ? (
        <ul className="list-none">
          {requests.map((request) => (
            <li
              className="mt-4 flex justify-between items-center bg-zinc-800 px-4 py-2 rounded"
              key={request.id}
            >
              <div className="text-white font-medium">{request.username}</div>
              <div>{request.email}</div>
              <div>{request.reason}</div>
              <div>{request.days}</div>
              <div>{request.role}</div>
              <div>{request.leaveType}</div>

               <button
                onClick={() => dispatch(approveRequest(request.id))}
                className="text-white bg-red-600 border-0 py-1 px-4 focus:outline-none hover:bg-emerald-700 rounded text-md font-semibold transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => dispatch(approveRequest(request.id))}
                className="text-white bg-emerald-600 border-0 py-1 px-4 focus:outline-none hover:bg-emerald-700 rounded text-md font-semibold transition-colors"
              >
                Approve
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-zinc-400 italic">No pending leave requests.</p>
      )}
    </div>
  )
}

export default LeaveManagementView