import React from 'react'

const Footer = () => {
    return (
        <footer className="bg-[#18104B] text-white py-8 px-4 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
                <div>
                    <div className="font-bold mb-2">Connecting donors with schools</div>
                    <div className="mb-2">In need to create better educational opportunities for all students.</div>

                </div>
                <div>
                    <div className="font-bold mb-2">Quick Links</div>
                    <ul className="space-y-1">
                        <li>Browse Campaigns</li>
                        <li>Start a Campaign</li>
                        <li>How it works</li>
                        <li>Success Stories</li>
                        <li>About Us</li>
                    </ul>
                </div>
                <div>
                    <div className="font-bold mb-2">Resources</div>
                    <ul className="space-y-1">
                        <li>Help Center</li>
                        <li>Blog</li>
                        <li>Contact Support</li>
                        <li>Donation Policy</li>
                    </ul>
                </div>
                <div>
                    <div className="font-bold mb-2">Contact Us</div>
                    <div>123 Kottawa, Athurugiriya Road, Pannipitiya</div>
                    <div>support@schoolfundraising.org</div>
                    <div>+94 112 889 844</div>
                    {/* <div className="mt-2">Secure Payment Methods</div> */}

                </div>
            </div>
            <div className="text-center text-xs text-gray-300 mt-6">2025 School Fundraising Platform. All rights reserved. | Privacy Policy | Terms Of Service | Cookie Policy</div>
        </footer>
    )
}

export default Footer