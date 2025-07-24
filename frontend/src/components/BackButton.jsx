import React from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const BackButton = () => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-blue-600 text-blue-600 hover:text-white transition-colors focus:outline-none shadow"
            aria-label="Go back"
        >
            <FaArrowLeft size={20} />
        </button>
    )
}

export default BackButton