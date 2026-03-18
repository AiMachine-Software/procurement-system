import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CreateSection from './section/createsection';
import ApproveSection from './section/approvesection';
import ProcurementSection from './section/procurementsection';
import { authService } from '../../../services/auth.service';
import { projectMemberService } from '../../../services/projectMember.service';
import { productService } from '../../../services/product.service';
import { flowService } from '../../../services/flow.service';

type StatusType = 'draft' | 'pending' | 'approved' | 'rejected' | 'procured' | 'received';

// UUID constants จาก backend (ค่าคงที่ ไม่เปลี่ยน)
const STATUS_UUID_MAP: Record<string, StatusType> = {
    'b1fc8b25-c572-4162-9131-7863e7af4873': 'draft',        // STATUS_DRAFT
    '8751dd60-119c-450e-8b2d-d4a76bbb6bbc': 'pending',      // STATUS_REQ_APPROVE
    '02553c68-eaac-4a69-80f8-02533ad0d7fb': 'approved',     // STATUS_APPROVE
    '65e18ae6-077c-42cd-8cc0-f458f64c6622': 'rejected',     // STATUS_REJECT
    'fbb4486c-bbf3-407d-b2f9-69b44bcd66cd': 'procured',     // STATUS_PROCUREMENT
    '1ddf7a3f-b181-4902-9cef-4523cd708c80': 'received',     // STATUS_RECEIVED
    '4e0a678c-4c00-4c65-89b0-9f89bd9e0953': 'rejected',     // STATUS_NOT_RECEIVED
    '6ef2c592-2006-498a-ae1a-9a31f9fd38cd': 'received',     // STATUS_WITHDRAWN
};

export default function AddProductDetail() {
    const { id: projectId, productId } = useParams();

    const [status, setStatus] = useState<StatusType>('draft');
    const [receiveData, setReceiveData] = useState<{ receiverName: string, receiveDate: string } | null>(null);
    const [approveRemark, setApproveRemark] = useState<string>('');
    const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
    const [isApprover, setIsApprover] = useState<boolean>(false);
    const [isBuyer, setIsBuyer] = useState<boolean>(false);
    const [procurementData, setProcurementData] = useState<{ status: string; dateReceive: string; buyFrom: string; remark: string } | null>(null);

    const isPendingApproval = status === 'pending';
    const isApproved = status === 'approved' || status === 'procured' || status === 'received';

    const loadData = async () => {
        if (!productId) return;
        try {
            // Fetch product and users in parallel to resolve UUID names
            const [product, users] = await Promise.all([
                productService.getProduct(productId),
                projectMemberService.getUsers().catch(() => [])
            ]);

            const mapped = STATUS_UUID_MAP[product.statusCode ?? ''];
            if (mapped) setStatus(mapped);

            const resolveName = (idOrName: string) => {
                if (!idOrName) return null;
                if (idOrName.length > 20) {
                    const user = users.find((u: any) => u.id === idOrName);
                    if (user && user.name) return user.name;
                }
                return idOrName;
            };

            // Load receiveData if available
            const receiveObj = (product as any).receive || (product as any).received;
            if (receiveObj) {
                const rawName = receiveObj.userName || receiveObj.receiverName || receiveObj.name;
                setReceiveData({
                    receiverName: resolveName(rawName) || authService.getCurrentUserName() || 'Unknown',
                    receiveDate: receiveObj.date || receiveObj.receiveDate || String(receiveObj) || new Date().toISOString()
                });
            } else if (mapped === 'received') {
                // Fallback to prevent the badge from disappearing if the API response doesn't nest the object
                setReceiveData({
                    receiverName: resolveName((product as any).updatedBy) || authService.getCurrentUserName() || 'Unknown User',
                    receiveDate: (product as any).updatedAt || new Date().toISOString()
                });
            }

            // 1. Try to get remark from Flow API
            try {
                const remarkRes = await flowService.getRemark(productId);
                const remarkData = remarkRes?.data || remarkRes;
                if (remarkData) {
                    // Handle array or single object from ApprovalLogResponse structure { remark, approverName, ... }
                    let extracted = '';
                    if (typeof remarkData === 'string') {
                        extracted = remarkData;
                    } else if (Array.isArray(remarkData) && remarkData.length > 0) {
                        // If it's an array, take the first one that has a remark
                        const logWithRemark = remarkData.find(l => l.remark && l.remark.trim().length > 0);
                        extracted = logWithRemark?.remark || '';
                    } else if (remarkData.remark) {
                        extracted = remarkData.remark;
                    }

                    if (extracted) {
                        setApproveRemark(extracted);
                    }
                }
            } catch (e) {
                console.error('Flow remark API failed, trying Audit Logs...');
            }

            // 2. Check Audit Logs if Flow API didn't provide a remark
            // This ensures Remark stays even after "Approve" is clicked
            try {
                const auditRes = await flowService.getAuditLogs(productId);
                const logs = auditRes?.data || auditRes;
                if (Array.isArray(logs)) {
                    // Find the latest log that has a remark and is relevant to approval flow ONLY
                    // We remove 'SEND' here to avoid showing creator remarks in the approval section
                    const latestRemarkLog = [...logs].reverse().find(l =>
                        l.remark && l.remark.trim().length > 0 &&
                        (l.action?.toUpperCase().includes('APPROVE') ||
                            l.action?.toUpperCase().includes('REJECT'))
                    );
                    if (latestRemarkLog) {
                        setApproveRemark(latestRemarkLog.remark);
                    }
                }
            } catch (ae) {
                console.error('Audit log fetch failed:', ae);
            }

            // Load procurement data
            try {
                const procurementRes = await (flowService as any).getProcurement(productId);
                const pData = procurementRes?.data || procurementRes;
                if (pData) {
                    setProcurementData({
                        status: pData.procurementType || 'Make',
                        dateReceive: pData.receiveDate || pData.dateReceive || '',
                        buyFrom: pData.supplier || pData.buyFrom || '',
                        remark: pData.remark || ''
                    });
                }
            } catch (e) {
                console.error('Failed to fetch procurement data:', e);
            }
        } catch (err) {
            console.error('Failed to load product and resolve status:', err);
        }
    };

    // โหลด status จาก API: GET /v1/products/{productId} → statusCode UUID → map เป็น StatusType
    useEffect(() => {
        loadData();
    }, [productId]);

    // ตรวจสอบ membership
    useEffect(() => {
        if (!projectId) return;
        const checkMembership = async () => {
            try {
                const currentUserId = authService.getCurrentUserId();
                if (!currentUserId) { setIsReadOnly(true); return; }
                const members = await projectMemberService.getProjectMembers(projectId);

                let canEdit = false;
                let approverFlag = false;
                let buyerFlag = false;

                members.forEach(m => {
                    if (m.userId === currentUserId || (m as any).user?.id === currentUserId) {
                        const role = (m.roleCode || (m as any).role?.code || '').toUpperCase();

                        if (['OWNER', 'PM', 'MEMBER'].includes(role)) {
                            canEdit = true;
                        }
                        if (role === 'APPROVER') {
                            approverFlag = true;
                        }
                        if (['BUYER', 'PROCUREMENT'].includes(role)) {
                            buyerFlag = true;
                        }
                    }
                });

                setIsReadOnly(!canEdit);
                setIsApprover(approverFlag);
                setIsBuyer(buyerFlag);
            } catch (error) {
                console.error('Membership check failed:', error);
                setIsReadOnly(true);
            }
        };
        checkMembership();
    }, [projectId]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans relative pb-24">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Form Sections */}
                <CreateSection
                    isPendingApproval={isPendingApproval || isApproved}
                    isReadOnly={isReadOnly}
                    status={status}
                    receiveData={receiveData}
                    externalApproverRemark={approveRemark}
                    onSendApprove={async () => {
                        setStatus('pending');
                        await loadData();
                    }}
                    onEditInfo={() => setStatus('draft')}
                    onReceive={async () => {
                        if (!productId) return;
                        try {
                            await flowService.receive(productId);
                            console.log('Item received successfully');
                            await loadData(); // Re-fetch product to get the actual receiver name and date
                        } catch (error) {
                            console.error('Failed to receive item:', error);
                            alert('Failed to receive item');
                        }
                    }}
                    onRejectReceive={async (reason) => {
                        if (!productId) return;
                        try {
                            await flowService.notReceive(productId, reason);
                            console.log('Item receive rejected. Reason:', reason);
                            setStatus('rejected');
                            await loadData();
                        } catch (error) {
                            console.error('Failed to reject receive:', error);
                            alert('Failed to reject receive');
                        }
                    }}
                />

                {/* Approve Section */}
                <ApproveSection
                    isPendingApproval={isPendingApproval}
                    hasPermission={isApprover}
                    savedRemark={approveRemark}
                    onEditInfo={() => setStatus('draft')}
                    onApprove={async (remark: string) => {
                        setApproveRemark(remark);
                        setStatus('approved');
                        await loadData();
                    }}
                    onReject={async (remark: string) => {
                        setApproveRemark(remark);
                        setStatus('rejected');
                        await loadData();
                    }}
                />

                {/* Procurement Section */}
                <ProcurementSection
                    isApproved={isApproved}
                    hasPermission={isBuyer}
                    isSaved={status === 'procured' || status === 'received'}
                    savedData={procurementData}
                    onSave={async (data) => {
                        if (!productId) return;
                        try {
                            await flowService.procurement({
                                productId: productId,
                                procurementType: data.status,
                                dateReceive: data.dateReceive,
                                buyFrom: data.buyFrom,
                                remark: data.remark
                            });
                            setStatus('procured');
                            await loadData();
                        } catch (error) {
                            console.error('Failed to save procurement:', error);
                            alert('Failed to save procurement');
                        }
                    }}
                />

            </div>
        </div>
    );
}

