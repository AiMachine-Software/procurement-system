import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateSection from './section/createsection';
import ApproveSection from './section/approvesection';
import ProcurementSection from './section/procurementsection';

export default function AddProductDetail() {
    type StatusType = 'draft' | 'pending' | 'approved' | 'rejected' | 'procured' | 'received';
    const [status, setStatus] = useState<StatusType>('draft');
    const [receiveData, setReceiveData] = useState<{ receiverName: string, receiveDate: string } | null>(null);

    const isPendingApproval = status === 'pending';
    const isApproved = status === 'approved' || status === 'procured' || status === 'received';

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans relative pb-24">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Form Sections */}
                <CreateSection
                    isPendingApproval={isPendingApproval || isApproved}
                    status={status}
                    receiveData={receiveData}
                    onSendApprove={() => setStatus('pending')}
                    onEditInfo={() => setStatus('draft')}
                    onReceive={() => {
                        console.log('Item received automatically');
                        // Simulate backend data payload mapping 
                        const payload = {
                            receiverName: 'สมชาย ใจดี', // Mock actual system user here instead of modal input
                            receiveDate: new Date().toISOString()
                        };
                        setReceiveData(payload);
                        setStatus('received');
                    }}
                    onRejectReceive={(reason) => {
                        console.log('Item receive rejected. Reason:', reason);
                        setStatus('rejected'); // Example status transition
                    }}
                />

                {/* Approve Section */}
                <ApproveSection
                    isPendingApproval={isPendingApproval}
                    onApprove={() => setStatus('approved')}
                    onReject={() => setStatus('rejected')}
                    onEditInfo={() => setStatus('draft')}
                />

                {/* Procurement Section */}
                <ProcurementSection
                    isApproved={isApproved}
                    isSaved={status === 'procured' || status === 'rejected' || status === 'received'}
                    onSave={() => setStatus('procured')}
                />

            </div>
        </div>
    );
}
