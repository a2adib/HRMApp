import { useAuth } from '../context/AuthContext'

export default function LeaveCard({ request, onAction }) {
  const { role } = useAuth()
  const canAct = (role === 'hr' || role === 'manager') && request.status === 'Pending'

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{request.username}</p>
          <p className="text-sm text-gray-500 capitalize">{request.role}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          request.status === 'Approved' ? 'bg-green-100 text-green-700' :
          request.status === 'Rejected' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {request.status}
        </span>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <p><span className="font-medium">From:</span> {request.from_date} <span className="font-medium">To:</span> {request.to_date}</p>
        <p className="mt-1"><span className="font-medium">Reason:</span> {request.reason}</p>
      </div>
      {canAct && onAction && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onAction(request.id, 'Approved')}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Approve
          </button>
          <button
            onClick={() => onAction(request.id, 'Rejected')}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  )
}
