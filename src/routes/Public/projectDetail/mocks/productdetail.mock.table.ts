export const mockProducts = [
    {
        id: 1,
        name: 'Product A',
        specification: 'Spec 1',
        amount: '100',
        category: 'Structure',
        status: {
            draft: { date: '10/03/24', name: 'Nathamon' },
            approved: null,
            Procurement: null,
            received: null,
            withdrawn: null
        }
    },
    {
        id: 2,
        name: 'Product B',
        specification: 'Spec 2',
        amount: '50',
        category: 'software',
        status: {
            draft: { date: '08/03/24', name: 'Alex J.' },
            approved: { date: '09/03/24', name: 'Sarah M.' },
            procurement: null,
            received: null,
            withdrawn: null
        }
    }
];
